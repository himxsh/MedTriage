# MedTriage — production bind & TLS (Phase A4)

Keep PHI off the open internet. The app expects a reverse proxy in front.

## Recommended layout

```
Internet → TLS terminator (Caddy / nginx / cloud LB)
         → uvicorn on 127.0.0.1:8000  (or private VPC only)
Postgres + Redis on private network only
```

## Env checklist (India / pilot)

| Variable | Local | Production |
|----------|-------|------------|
| `COOKIE_SECURE` | `False` | `True` |
| `ENABLE_HSTS` | `False` | `True` (only after HTTPS works) |
| `CORS_ORIGINS` | localhost origins | exact `https://…` frontend origin(s) |
| `ALLOW_PUBLIC_REGISTER` | `False` | `False` |
| `GOOGLE_API_KEY` | env / `.env` | secret manager; rotate if ever leaked |

## Bind rules

- **Do:** `uvicorn app.main:app --host 127.0.0.1 --port 8000`
- **Do (LAN demo only):** `--host 0.0.0.0` on a trusted network with auth already on
- **Don't:** advertise public `0.0.0.0` without TLS + auth + firewall

`scripts/start-local.command` may use `0.0.0.0` for same-LAN tablet demos — that is not a production posture.

## Proxy headers

Terminate TLS at the proxy. Forward `Host` and `X-Forwarded-Proto=https` if you later add middleware that trusts them. Today HSTS is controlled solely by `ENABLE_HSTS` so you cannot accidentally set it on plain HTTP local.

## Cookie

Session cookie `mt_session` is httpOnly + SameSite=Lax. Set `COOKIE_SECURE=True` so browsers only send it over HTTPS.
