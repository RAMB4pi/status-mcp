# ChatGPT integration plan

This repository currently exposes stdio only. No remote MCP URL is available and this scaffold cannot yet be connected as a hosted ChatGPT integration. Implement remote MCP transport and OAuth before configuring a connector; do not use `api.status.harthad.com` as an MCP URL by assumption.

Example conversation after integration is implemented:

> Lee mi perfil y contexto. Propón tres servicios que representen cómo organizo mi vida y espera a que elija los nombres y la visibilidad antes de crearlos. No infieras estados de salud ni publiques datos privados.

> Cambia Energy a degraded y registra “Semana intensa”.

The second prompt should result in one `create_changelog_entry` call so the backend changes status and records history atomically. Today each tool returns `NOT_IMPLEMENTED`.
