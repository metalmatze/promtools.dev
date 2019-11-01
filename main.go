package main

import (
	"fmt"
	"log"
	"net/http"
	"strconv"

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
	r.Get("/", HandleFunc(index))
	r.Post("/generate", HandleFunc(generate(vm)))

	if err := http.ListenAndServe(":9099", r); err != nil {
		log.Println(err)
	}
}

var indexTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Prometheus SLO Generator</title>
	<style>
		body {
			font-family: sans-serif;
		}
	</style>
</head>
<body>
	<h1>Prometheus SLO</h1>
	<form action="/generate" method="post">
		<label for="metric">Metric:</label>
		<input type="text" autofocus placeholder="http_requests_total" required id="metric" name="metric">
		<br>
		<label for="selectors">Selctors:</label>
		<input type="text" placeholder='[job="prometheus"]' required id="selectors" name="selectors">
		<br>
		<label for="errorbudget">ErrorBudget:</label>
		<input type="text" placeholder='99.9' required id="errorbudget" name="errorbudget">
		<br><br>
		<button type="submit">Generate</button>
	</form>
</body>
</html>
`

func index(w http.ResponseWriter, r *http.Request) (int, error) {
	_, err := w.Write([]byte(indexTemplate))
	if err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil

}

var errorBurnRate = `
local slo = import 'slo-libsonnet/slo.libsonnet';

{
  local errorburnrate = slo.errorburn({
    metric: '%s',
    selectors: %s,

    errorBudget: %f,
  }),

  // Output these as example
  recordingrule: errorburnrate.recordingrules,
  alerts: errorburnrate.alerts,
}
`

func generate(vm *jsonnet.VM) HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) (int, error) {
		metric := r.FormValue("metric")
		selectors := r.FormValue("selectors")
		formErrorBudget := r.FormValue("errorbudget")

		errorBudget, err := strconv.ParseFloat(formErrorBudget, 64)
		if err != nil {
			return http.StatusUnprocessableEntity, fmt.Errorf("formErrorBudget is not a float: %w", err)
		}
		if errorBudget < 0 || errorBudget > 100 {
			return http.StatusUnprocessableEntity, fmt.Errorf("errorBudget has to be between 0 and 100")
		}

		snippet := fmt.Sprintf(errorBurnRate, metric, selectors, 100-errorBudget)
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

		w.WriteHeader(statusCode)
	}
}
