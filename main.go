package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"regexp"
	"strings"

	"github.com/ghodss/yaml"
	"github.com/go-chi/chi"
	"github.com/go-chi/cors"
	"github.com/go-playground/validator/v10"
	"github.com/google/go-jsonnet"
)

func main() {
	vm := jsonnet.MakeVM()
	vm.Importer(&jsonnet.FileImporter{
		JPaths: []string{"vendor"},
	})

	r := chi.NewRouter()
	r.Use(cors.Handler(cors.Options{})) // TODO: Disable by default
	r.Post("/generate", HandleFunc(generate(vm)))
	r.Handle("/web/*", http.StripPrefix("/web", http.FileServer(http.Dir("./web"))))
	r.Get("/", HandleFunc(file("./web/index.html")))
	r.NotFound(HandleFunc(file("./web/index.html")))

	log.Println("Serving on port :9099")

	if err := http.ListenAndServe(":9099", r); err != nil {
		log.Println(err)
	}
}

type HandlerFunc func(http.ResponseWriter, *http.Request) (int, error)

func HandleFunc(h HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		statusCode, err := h(w, r)
		if err != nil {
			http.Error(w, err.Error(), statusCode)
			fmt.Println(err)
			return
		}
		if statusCode != http.StatusOK {
			w.WriteHeader(statusCode)
		}
	}
}

func file(filename string) HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) (int, error) {
		http.ServeFile(w, r, filename)
		return http.StatusOK, nil
	}
}

var errorBurnRate = `
local slo = import 'github.com/metalmatze/slo-libsonnet/slo-libsonnet/slo.libsonnet';
local errorParams = %s;

{
  local errorburnrate = slo.errorburn(errorParams),

  groups: [
    {
      name: 'SLOs-%%s' %% errorParams.metric,
      rules:
        errorburnrate.alerts +
        errorburnrate.recordingrules,
    },
  ],
}
`

var latencyBurnRate = `
local slo = import 'github.com/metalmatze/slo-libsonnet/slo-libsonnet/slo.libsonnet';
local latencyParams = %s;

{
  local latencyburn = slo.latencyburn(latencyParams),

  groups: [
    {
      name: 'SLOs-%%s' %% latencyParams.metric,
      rules:
        latencyburn.alerts +
        latencyburn.recordingrules,
    },
  ],
}
`

type Selector struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

type Request struct {
	Function       string     `json:"function"`
	Metric         string     `json:"metric" validate:"required,metric"`
	Selectors      []Selector `json:"selectors"`
	ErrorSelectors string     `json:"errorSelectors"`
	AlertName      string     `json:"alertName" validate:"omitempty,alphanum"`
	AlertMessage   string     `json:"alertMessage" validate:"omitempty,alphanumunicode"`
}

type errorRequest struct {
	Request
	Availability float64 `json:"availability" validate:"required,gte=0,lte=100"`
}

type errorParams struct {
	Target         float64  `json:"target"`
	Metric         string   `json:"metric"`
	Selectors      []string `json:"selectors"`
	ErrorSelectors []string `json:"errorSelectors,omitempty"`
	AlertName      string   `json:"alertName,omitempty"`
	AlertMessage   string   `json:"alertMessage,omitempty"`
}

type latencyRequest struct {
	Request
	Target float64 `json:"target" validate:"required,gte=0"`
}

type latencyParams struct {
	Target    float64  `json:"latencyTarget"`
	Budget    float64  `json:"latencyBudget"`
	Metric    string   `json:"metric"`
	Selectors []string `json:"selectors"`
	AlertName string   `json:"alertName,omitempty"`
}

func generate(vm *jsonnet.VM) HandlerFunc {
	validate := validator.New()
	if err := validate.RegisterValidation("metric", func(fl validator.FieldLevel) bool {
		metricNameExp := regexp.MustCompile(`^[a-zA-Z_:][a-zA-Z0-9_:]*$`)
		return metricNameExp.MatchString(fl.Field().String())
	}); err != nil {
		panic("failed to register metric validator")
	}

	validate.RegisterStructValidation(func(sl validator.StructLevel) {
		labelNameExp := regexp.MustCompile(`^[a-zA-Z_][a-zA-Z0-9_]*$`)

		req := sl.Current().Interface().(Request)

		for _, s := range req.Selectors {

			if !labelNameExp.MatchString(s.Name) {
				sl.ReportError(req.Selectors, "selector.name", "Selector Name", "label", "")

			}
			if !labelNameExp.MatchString(s.Value) {
				sl.ReportError(req.Selectors, "selector.value", "Selector value", "label", "")
			}
		}
	}, Request{})

	return func(w http.ResponseWriter, r *http.Request) (int, error) {
		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			return http.StatusInternalServerError, err
		}

		var req Request
		if err := json.Unmarshal(body, &req); err != nil {
			return http.StatusInternalServerError, fmt.Errorf("failed to parse JSON: %w", err)
		}
		defer r.Body.Close()

		var snippet string
		if req.Function == "errorburn" {
			var errorReq errorRequest
			if err := json.Unmarshal(body, &errorReq); err != nil {
				return http.StatusInternalServerError, err
			}

			if err := validate.Struct(errorReq); err != nil {
				return http.StatusUnprocessableEntity, err
			}

			p := errorParams{
				Target:       errorReq.Availability / 100,
				Metric:       errorReq.Metric,
				AlertName:    errorReq.AlertName,
				AlertMessage: errorReq.AlertMessage,
			}

			for _, s := range errorReq.Selectors {
				p.Selectors = append(p.Selectors, fmt.Sprintf(`%s="%s"`, s.Name, strings.Replace(s.Value, `"`, `\"`, -1)))
			}

			params, err := json.Marshal(p)
			if err != nil {
				return http.StatusInternalServerError, fmt.Errorf("failed to marshal Request: %w", err)
			}

			snippet = fmt.Sprintf(errorBurnRate, string(params))
		}
		if req.Function == "latencyburn" {
			var latencyReq latencyRequest
			if err := json.Unmarshal(body, &latencyReq); err != nil {
				return http.StatusInternalServerError, err
			}

			if err := validate.Struct(latencyReq); err != nil {
				return http.StatusUnprocessableEntity, err
			}

			p := latencyParams{
				Target:    latencyReq.Target / 1000, // we want seconds
				Budget:    0.01,
				Metric:    latencyReq.Metric,
				AlertName: latencyReq.AlertName,
			}
			for _,s := range latencyReq.Selectors {
				p.Selectors = append(p.Selectors, fmt.Sprintf(`%s="%s"`, s.Name, strings.Replace(s.Value, `"`, `\"`, -1)))
			}

			params, err := json.Marshal(p)
			if err != nil {
				return http.StatusInternalServerError, fmt.Errorf("failed to marshal Request: %w", err)
			}

			snippet = fmt.Sprintf(latencyBurnRate, string(params))
		}

		//w.Write([]byte(snippet))
		//return http.StatusOK, nil

		json, err := vm.EvaluateSnippet("", snippet)
		if err != nil {
			return http.StatusInternalServerError, err
		}

		y, err := yaml.JSONToYAML([]byte(json))
		if err != nil {
			return http.StatusInternalServerError, err
		}

		w.Header().Set("Content-Type", "text/plain")
		_, _ = fmt.Fprintln(w, string(y))

		return http.StatusOK, nil
	}
}
