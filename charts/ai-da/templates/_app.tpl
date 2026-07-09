{{/*
app env settings
*/}}
{{- define "app.settings" -}}
- name: NODE_ENV
  value: production
- name: PORT
  value: {{ .Values.service.port | quote }}
- name: ANTHROPIC_API_KEY
  valueFrom:
    secretKeyRef:
      name: {{ template "ai-da.fullname" . }}
      key: anthropic-api-key
- name: ALLOWED_ORIGIN
  value: {{ .Values.app.settings.allowedOrigin | quote }}
- name: CLAUDE_MODEL
  value: {{ .Values.app.settings.claudeModel | quote }}
- name: MAX_TOKENS
  value: {{ .Values.app.settings.maxTokens | quote }}
{{- end -}}
