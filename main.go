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

func file(filename string) HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) (int, error) {
		http.ServeFile(w, r, filename)
		return http.StatusOK, nil
	}
}

var errorBurnRate = `
local slo = import 'slo-libsonnet/slo.libsonnet';

{
  local errorburnrate = slo.errorburn({
    metric: '%s',
    selectors: %s,
    errorBudget: %f,
  }),

  groups: [
    {
      name: 'SLOs-%s',
      rules:
        errorburnrate.alerts +
        errorburnrate.recordingrules,
    },
  ],
}
`

type request struct {
	Availability float64           `json:"availability"`
	Metric       string            `json:"metric"`
	Selectors    map[string]string `json:"selectors"`
}

var metricNameExp = regexp.MustCompile(`^[a-zA-Z_:][a-zA-Z0-9_:]*$`)
var labelNameExp = regexp.MustCompile(`^[a-zA-Z_][a-zA-Z0-9_]*$`)

func generate(vm *jsonnet.VM) HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) (int, error) {
		var req request
		err := json.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			return http.StatusInternalServerError, fmt.Errorf("failed to parse JSON: %w", err)
		}

		if !metricNameExp.MatchString(req.Metric) {
			return http.StatusUnprocessableEntity, fmt.Errorf("metric name is invalid. See https://prometheus.io/docs/concepts/data_model/#metric-names-and-labels for requirements")
		}

		if req.Availability < 0 || req.Availability > 100 {
			return http.StatusUnprocessableEntity, fmt.Errorf("availability has to be between 0 and 100")
		}

		selectors := []string{}
		for name, value := range req.Selectors {
			if !labelNameExp.MatchString(name) {
				return http.StatusUnprocessableEntity, fmt.Errorf("label name '%s' is invalid. See https://prometheus.io/docs/concepts/data_model/#metric-names-and-labels for requirements", name)
			}
			selectors = append(selectors, fmt.Sprintf(`%s="%s"`, name, strings.Replace(value, `"`, `\"`, -1)))
		}
		selectorsJSON, err := json.Marshal(selectors)
		if err != nil {
			return http.StatusInternalServerError, fmt.Errorf("failed to marshal selectors: %w", err)
		}

		snippet := fmt.Sprintf(errorBurnRate, req.Metric, selectorsJSON, (100-req.Availability)/100, req.Metric)
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
