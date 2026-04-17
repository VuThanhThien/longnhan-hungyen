# Production deploy (Docker + Cloudflare)

Stack: **Postgres**, **Redis**, **API** (Nest), **web** (Next), **admin** (Next), **cloudflared**.

Compose project: `longnhan-prod`. App containers publish on **loopback** `127.0.0.1` so they do not bind on the LAN; public access is via **Cloudflare Tunnel**.

## 1. Environment files (per app)

Create from each app’s `.env.example`:

| File                         | Purpose                                                                                                                                              |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/api/.env.production`   | API secrets; **`DATABASE_PASSWORD` must be set (non-empty)** — used for Postgres + compose; `PROD_*` host ports; optional `CLOUDFLARED_TUNNEL_TOKEN` |
| `apps/web/.env.production`   | `NEXT_PUBLIC_*` (baked in at **image build**)                                                                                                        |
| `apps/admin/.env.production` | `API_URL` (public API base with `/api/v1`)                                                                                                           |

Compose **overrides** API DB/Redis hosts to Docker service names (`db`, `redis`). Keep `DATABASE_*` aligned with the `db` service.

**Compose variable substitution** (`${PROD_*_HOST_PORT}`, `${DATABASE_*}` for `db`, `${CLOUDFLARED_TUNNEL_TOKEN}` for `cloudflared`) uses only what `docker compose` loads from **`--env-file apps/api/.env.production`**. Put `PROD_*` and DB password variables there; values that exist only in `apps/web` or `apps/admin` `.env.production` do **not** affect those substitutions.

## 2. Cloudflare Tunnel (choose one)

### A — Token (recommended)

1. Cloudflare **Zero Trust** → **Networks** → **Tunnels** → create or open a tunnel.
2. Copy the **token** into `apps/api/.env.production`:

   `CLOUDFLARED_TUNNEL_TOKEN=...`

3. In the tunnel → **Public hostnames**, add routes to the **Docker service names** (same Compose network as `cloudflared`):

   | Hostname              | Service URL         |
   | --------------------- | ------------------- |
   | `api.<your-domain>`   | `http://api:3001`   |
   | `www.<your-domain>`   | `http://web:3000`   |
   | `<apex>`              | `http://web:3000`   |
   | `admin.<your-domain>` | `http://admin:3002` |

No `deploy/cloudflare/config.yml` or JSON credentials file required.

### B — Credentials + local `config.yml`

1. Copy `deploy/cloudflare/config.yml.example` → `deploy/cloudflare/config.yml` and set `tunnel` + `credentials-file`.
2. Place the tunnel credentials JSON under `deploy/cloudflare/` (gitignored).
3. Do **not** set `CLOUDFLARED_TUNNEL_TOKEN` (or remove it) so `make deploy` selects this mode automatically.

Ingress hostnames in `config.yml` should match your DNS.

## 3. Deploy commands

From the **repository root**:

```bash
make deploy        # build & start (runs prod-preflight)
make deploy-down   # stop stack
```

**Default host ports** (alongside local dev on 3000–3002): web `13100`, api `13101`, admin `13102`, Postgres `5436`, Redis `6381` — override with `PROD_*` in `apps/api/.env.production` if needed.

## 4. Database migrations

Run migrations against the **production** DB (e.g. from host with `DATABASE_HOST=127.0.0.1`, `DATABASE_PORT` = your `DATABASE_PORT`, same user/password as in `apps/api/.env.production`), then:

```bash
make migration-up
```

(Uses the API package’s migration script; ensure env matches prod.)

## 5. Local development

```bash
make dev    # docker: db, redis, maildev, pgadmin + pnpm dev
```

Uses default `docker-compose.yml` (not `docker-compose.prod.yml`).

## 6. Files in this folder

| Path                            | Role                                          |
| ------------------------------- | --------------------------------------------- |
| `README.md`                     | This guide                                    |
| `cloudflare/config.yml.example` | Template for **credentials** tunnel mode only |
| `cloudflare/.gitignore`         | Ignores `config.yml` and `*.json` credentials |

Optional override compose file (repo root): `docker-compose.prod.cloudflared-config.yml` — used automatically when the token is unset but `config.yml` + `*.json` exist.

## Troubleshooting

- **`required variable DATABASE_PASSWORD is missing`** — Add a non-empty line to `apps/api/.env.production`, e.g. `DATABASE_PASSWORD=your_secure_password`. It must match what the API uses to connect to Postgres (`DATABASE_USERNAME` / `DATABASE_NAME` should align with the `db` service too).

- **`exec: "docker-credential-desktop": executable file not found in $PATH`** — Docker is trying to use Docker Desktop’s credential helper, but it is not on your `PATH` (common in some IDE terminals). Fixes (pick one):
  1. **macOS:** Add Docker’s CLI bin **before** running build:  
     `export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"`  
     (optionally add that line to `~/.zshrc` and restart the terminal).
  2. Ensure **Docker Desktop is running** and, in its settings, that the CLI tools / symlinks are installed.
  3. **Advanced:** In `~/.docker/config.json`, remove or change `"credsStore": "desktop"` if you only pull public images (you may need to sign in again for private registries later).

## Caveats

- **Next.js images** include `apps/{web,admin}/.env.production` in the final image (for build/runtime). Keep those files limited to non-secret `NEXT_PUBLIC_*` and public URLs; do not put private keys there.
- **Tunnel token** is passed via Compose substitution; it can appear in `docker inspect` metadata. For stricter handling, use credentials + `config.yml` mode or inject the token from a secret store at deploy time.
- Prefer **`make deploy`** over raw `docker compose` so the correct compose files and Cloudflare mode are used.
- Consider **pinning** `cloudflare/cloudflared` to a specific image digest in production for reproducible pulls.
