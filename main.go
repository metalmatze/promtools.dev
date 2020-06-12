package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"regexp"
	"strings"

	"github.com/ghodss/yaml"
	"github.com/go-chi/chi"
	"github.com/go-playground/validator/v10"
	"github.com/google/go-jsonnet"
)

func main() {
	vm := jsonnet.MakeVM()
	vm.Importer(&jsonnet.FileImporter{
		JPaths: []string{"vendor"},
	})

	r := chi.NewRouter()
	r.Get("/", HandleFunc(file("./web/index.html")))
	r.Handle("/web/*", http.StripPrefix("/web", http.FileServer(http.Dir("./web"))))

	r.Post("/generate", HandleFunc(generate(vm)))

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
local params = %s;

{
  local errorburnrate = slo.errorburn(params),

  groups: [
    {
      name: 'SLOs-%%s' %% params.metric,
      rules:
        errorburnrate.alerts +
        errorburnrate.recordingrules,
    },
  ],
}
`

type request struct {
	Availability   float64           `json:"availability" validate:"required,gte=0,lte=100"`
	Metric         string            `json:"metric" validate:"required,metric"`
	Selectors      map[string]string `json:"selectors"`
	ErrorSelectors string            `json:"errorSelectors"`
	AlertName      string            `json:"alertName" validate:"omitempty,alphanum"`
	AlertMessage   string            `json:"alertMessage" validate:"omitempty,alphanumunicode"`
}

type params struct {
	Target         float64  `json:"target"`
	Metric         string   `json:"metric"`
	Selectors      []string `json:"selectors"`
	ErrorSelectors []string `json:"errorSelectors,omitempty"`
	AlertName      string   `json:"alertName,omitempty"`
	AlertMessage   string   `json:"alertMessage,omitempty"`
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

		req := sl.Current().Interface().(request)

		for name, value := range req.Selectors {
			if !labelNameExp.MatchString(name) {
				sl.ReportError(req.Selectors, "selector.name", "Selector Name", "label", "")

			}
			if !labelNameExp.MatchString(value) {
				sl.ReportError(req.Selectors, "selector.value", "Selector value", "label", "")
			}
		}
	}, request{})

	return func(w http.ResponseWriter, r *http.Request) (int, error) {
		var req request
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			return http.StatusInternalServerError, fmt.Errorf("failed to parse JSON: %w", err)
		}
		defer r.Body.Close()

		if err := validate.Struct(req); err != nil {
			return http.StatusUnprocessableEntity, err
		}

		p := params{
			Target:       req.Availability / 100,
			Metric:       req.Metric,
			AlertName:    req.AlertName,
			AlertMessage: req.AlertMessage,
		}

		for name, value := range req.Selectors {
			p.Selectors = append(p.Selectors, fmt.Sprintf(`%s="%s"`, name, strings.Replace(value, `"`, `\"`, -1)))
		}

		bytes, err := json.Marshal(p)
		if err != nil {
			return http.StatusInternalServerError, fmt.Errorf("failed to marshal request: %w", err)
		}

		snippet := fmt.Sprintf(errorBurnRate, string(bytes))
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
