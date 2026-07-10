{{/*
Gateway-API related definitions
*/}}
{{- define "gateway-api.parent_ref" -}}
parentRefs:
{{- if .Values.gatewayApi.listenerSet.enabled }}
{{- if .Values.gatewayApi.listenerSet.ref }}
  {{- list .Values.gatewayApi.listenerSet.ref | toYaml | nindent 2 }}
{{- else }}
  - kind: ListenerSet
    name: {{ template "gateway-api.fullname" . }}
    sectionName: https
{{- end }}
{{- else }}
  {{- list .Values.gatewayApi.httpRoute.parentRef | toYaml | nindent 2 }}
{{- end }}
{{- end -}}

{{- define "gateway-api.hostnames" -}}
hostnames:
  - "{{ .Values.gatewayApi.hostname }}"
{{- end -}}

{{- define "gateway-api.filters" -}}
{{- if or .Values.gatewayApi.httpRoute.filters .Values.gatewayApi.whitelistCIDRs.enabled -}}
{{- range $filterName, $filterValue := .Values.gatewayApi.httpRoute.filters }}
  - {{ toYaml $filterValue | nindent 4 | trim }}
{{- end }}
{{- else -}}
{{- printf "[]" | indent 2 -}}
{{- end -}}
{{- end -}}
