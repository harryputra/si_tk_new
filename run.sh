#!/usr/bin/env bash
# ==========================================================
#   SI ERP TK ATTAUHID — One-Shot Docker Deployment
# ----------------------------------------------------------
#   Usage:
#     ./run.sh                  -> install + build + up (full)
#     ./run.sh up               -> build + up
#     ./run.sh down             -> stop semua container
#     ./run.sh restart          -> restart semua
#     ./run.sh rebuild          -> rebuild image lalu up
#     ./run.sh logs [service]   -> tail log (default: all)
#     ./run.sh status           -> tampilkan status
#     ./run.sh seed             -> jalankan seeder DB
#     ./run.sh migrate          -> jalankan migrasi Laravel
#     ./run.sh fresh            -> WIPE data + rebuild + seed
#     ./run.sh shell <svc>      -> masuk shell container (app|db|web)
#     ./run.sh doctor           -> cek env & dependency
# ==========================================================
set -Eeuo pipefail

# ---------- Style ----------
if [ -t 1 ]; then
  C_RESET="\033[0m"; C_RED="\033[1;31m"; C_GRN="\033[1;32m"
  C_YEL="\033[1;33m"; C_BLU="\033[1;34m"; C_CYN="\033[1;36m"; C_DIM="\033[2m"
else
  C_RESET=""; C_RED=""; C_GRN=""; C_YEL=""; C_BLU=""; C_CYN=""; C_DIM=""
fi

log()  { echo -e "${C_CYN}▶${C_RESET} $*"; }
ok()   { echo -e "${C_GRN}✔${C_RESET} $*"; }
warn() { echo -e "${C_YEL}⚠${C_RESET} $*"; }
err()  { echo -e "${C_RED}✖${C_RESET} $*" >&2; }
hr()   { echo -e "${C_DIM}--------------------------------------------------------${C_RESET}"; }

trap 'err "Gagal di baris $LINENO. Cek pesan di atas."' ERR

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

ENV_FILE="$ROOT_DIR/.env"
ENV_TEMPLATE="$ROOT_DIR/.env.example"
COMPOSE_FILE="$ROOT_DIR/docker-compose.yml"

# ---------- Helpers ----------
ensure_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    err "Docker belum terpasang. Ikuti panduan di SERVER-DEPLOYMENT-PLAYBOOK.md"
    exit 1
  fi
  ok "Docker siap."
}

dc() { docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" "$@"; }

ensure_env() {
  if [ ! -f "$ENV_FILE" ]; then
    log "Membuat .env dari template..."
    cp "$ENV_TEMPLATE" "$ENV_FILE"
    # Auto-fix hosts for docker network
    sed -i "s/DB_HOST=127.0.0.1/DB_HOST=db/g" "$ENV_FILE"
    sed -i "s/REDIS_HOST=127.0.0.1/REDIS_HOST=redis/g" "$ENV_FILE"
    sed -i "s/DB_PORT=5433/DB_PORT=5432/g" "$ENV_FILE"
  fi
  ok "File .env siap."
}

wait_db() {
  log "Menunggu PostgreSQL siap..."
  local i=0
  until dc exec -T db pg_isready -U "${DB_USERNAME:-postgres}" >/dev/null 2>&1; do
    i=$((i+1))
    if [ $i -gt 60 ]; then err "DB tidak siap setelah 2 menit."; exit 1; fi
    printf "${C_DIM}.${C_RESET}"; sleep 2
  done
  echo
  ok "Database online."
}

run_setup() {
  log "Menjalankan Laravel Setup (key, link, optimize)..."
  dc exec -T app php artisan key:generate --force || true
  dc exec -T app php artisan storage:link || true
  dc exec -T app php artisan optimize
}

run_migrate() {
  log "Menjalankan migrasi database..."
  dc exec -T app php artisan migrate --force
  ok "Migrasi selesai."
}

run_seed() {
  log "Menjalankan database seeder..."
  dc exec -T app php artisan db:seed --force
  ok "Seed selesai."
}

build_assets() {
  log "Membangun Frontend Assets (Vite)..."
  docker run --rm -v "$(pwd):/app" -w /app node:20-alpine sh -c "npm install && npm run build"
  ok "Build assets selesai."
}

print_summary() {
  hr
  local http_port; http_port="$(grep -E '^HTTP_PORT=' "$ENV_FILE" | cut -d= -f2 || true)"
  http_port="${http_port:-8100}"
  
  echo -e "${C_GRN}SI-TK berjalan!${C_RESET}"
  echo -e "  ${C_BLU}URL Publik :${C_RESET} https://tk.trin-polman.id (via Tunnel)"
  echo -e "  ${C_BLU}URL Lokal  :${C_RESET} http://<server-ip>:${http_port}"
  echo -e "  ${C_DIM}Logs       : ./run.sh logs${C_RESET}"
  hr
}

# ---------- Subcommands ----------
cmd_up() {
  ensure_docker
  ensure_env
  build_assets
  log "Build image & up..."
  dc up -d --build
  wait_db
  run_setup
  run_migrate
  print_summary
}

cmd_rebuild() {
  build_assets
  dc build --no-cache
  dc up -d
  run_setup
  run_migrate
}

cmd_down() {
  dc down
  ok "Sistem dimatikan."
}

cmd_logs() {
  if [ $# -ge 1 ]; then dc logs -f --tail=200 "$1"; else dc logs -f --tail=200; fi
}

cmd_shell() {
  local svc="${1:-app}"
  case "$svc" in
    db)  dc exec db psql -U "${DB_USERNAME:-postgres}" -d "${DB_DATABASE:-si_tk_attauhid}";;
    app) dc exec app sh;;
    web) dc exec web sh;;
    *)   err "Service tidak dikenal: $svc"; exit 1;;
  esac
}

# ---------- Dispatch ----------
SUB="${1:-up}"
shift || true

case "$SUB" in
  up)       cmd_up ;;
  down)     cmd_down ;;
  rebuild)  cmd_rebuild ;;
  restart)  dc restart ;;
  logs)     cmd_logs "$@" ;;
  status|ps) dc ps ;;
  seed)     run_seed ;;
  migrate)  run_migrate ;;
  fresh)
    warn "WIPE data!"
    read -r -p "Ketik 'YES': " ans
    [ "$ans" = "YES" ] || exit 1
    dc down -v
    cmd_up
    run_seed
    ;;
  shell)    cmd_shell "$@" ;;
  doctor)   ensure_docker; ok "Doctor check passed." ;;
  *)        err "Subcommand tidak dikenal: $SUB"; exit 1;;
esac
