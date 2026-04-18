#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

REQUIRED_FILES=(
  "AGENTS.md"
  "feature_list.json"
  "progress.md"
  "session-handoff.md"
)

warn() {
  printf 'WARN: %s\n' "$1"
}

info() {
  printf '==> %s\n' "$1"
}

require_file() {
  local path="$1"
  if [ ! -f "$path" ]; then
    printf 'ERROR: required file not found: %s\n' "$path" >&2
    exit 1
  fi
}

detect_python() {
  if command -v python >/dev/null 2>&1; then
    printf '%s\n' "python"
    return 0
  fi

  if command -v python3 >/dev/null 2>&1; then
    printf '%s\n' "python3"
    return 0
  fi

  if command -v py >/dev/null 2>&1; then
    printf '%s\n' "py -3"
    return 0
  fi

  return 1
}

find_frontend_dir() {
  local candidates=(
    "frontend"
    "web"
    "client"
    "."
  )
  local dir

  for dir in "${candidates[@]}"; do
    if [ -f "$dir/package.json" ]; then
      printf '%s\n' "$dir"
      return 0
    fi
  done

  return 1
}

find_backend_dir() {
  local candidates=(
    "backend"
    "api"
    "server"
    "."
  )
  local dir

  for dir in "${candidates[@]}"; do
    if [ -f "$dir/pyproject.toml" ] || [ -f "$dir/requirements.txt" ]; then
      printf '%s\n' "$dir"
      return 0
    fi
  done

  return 1
}

run_python_script() {
  local python_cmd="$1"
  shift

  case "$python_cmd" in
    "py -3")
      py -3 "$@"
      ;;
    *)
      "$python_cmd" "$@"
      ;;
  esac
}

validate_feature_list() {
  local python_cmd="$1"

  run_python_script "$python_cmd" - <<'PY'
import json
from pathlib import Path

path = Path("feature_list.json")
data = json.loads(path.read_text(encoding="utf-8"))

features = data.get("features", [])
if not isinstance(features, list):
    raise SystemExit("feature_list.json: features must be a list")

allowed = {"not_started", "in_progress", "blocked", "passing"}
seen_ids = set()
in_progress = 0

for feature in features:
    feature_id = feature.get("id")
    if not feature_id:
        raise SystemExit("feature_list.json: every feature must have an id")
    if feature_id in seen_ids:
        raise SystemExit(f"feature_list.json: duplicate feature id: {feature_id}")
    seen_ids.add(feature_id)

    status = feature.get("status")
    if status not in allowed:
        raise SystemExit(
            f"feature_list.json: invalid status for {feature_id}: {status}"
        )
    if status == "in_progress":
        in_progress += 1

if in_progress > 1:
    raise SystemExit("feature_list.json: more than one feature is marked in_progress")

unfinished = [
    feature for feature in features
    if feature.get("status") != "passing"
]
unfinished.sort(key=lambda item: item.get("priority", 10**9))

current = unfinished[0]["id"] if unfinished else "none"
print(f"feature_count={len(features)}")
print(f"active_in_progress={in_progress}")
print(f"next_feature={current}")
PY
}

run_backend_checks() {
  local backend_dir="$1"
  local python_cmd="$2"

  info "Backend detected in ${backend_dir}"

  if [ -f "$backend_dir/pyproject.toml" ]; then
    if command -v uv >/dev/null 2>&1; then
      info "Syncing backend dependencies with uv"
      (cd "$backend_dir" && uv sync)
    else
      warn "uv is not installed; skipping backend dependency sync for pyproject.toml"
    fi
  elif [ -f "$backend_dir/requirements.txt" ]; then
    if [ ! -d "$backend_dir/.venv" ]; then
      info "Creating backend virtual environment"
      (cd "$backend_dir" && run_python_script "$python_cmd" -m venv .venv)
    fi

    local activate_path="$backend_dir/.venv/Scripts/activate"
    if [ -f "$activate_path" ]; then
      # shellcheck disable=SC1090
      source "$activate_path"
      info "Installing backend dependencies from requirements.txt"
      pip install -r "$backend_dir/requirements.txt"
    else
      warn "Virtual environment created but activation script was not found at $activate_path"
    fi
  fi

  if [ -d "$backend_dir/tests" ]; then
    if [ -f "$backend_dir/pyproject.toml" ] && command -v uv >/dev/null 2>&1; then
      info "Running backend tests with uv"
      (cd "$backend_dir" && uv run pytest -q)
    else
      if run_python_script "$python_cmd" -c "import pytest" >/dev/null 2>&1; then
        info "Running backend tests with pytest"
        (cd "$backend_dir" && run_python_script "$python_cmd" -m pytest -q)
      else
        info "Running backend tests with unittest discovery"
        (cd "$backend_dir" && run_python_script "$python_cmd" -m unittest discover -s tests -p "test_*.py")
      fi
    fi
  else
    warn "No backend tests directory found; skipping backend verification"
  fi
}

run_frontend_checks() {
  local frontend_dir="$1"

  info "Frontend detected in ${frontend_dir}"

  if command -v npm >/dev/null 2>&1; then
    if [ -f "$frontend_dir/package-lock.json" ]; then
      info "Installing frontend dependencies with npm ci"
      (cd "$frontend_dir" && npm ci)
    else
      info "Installing frontend dependencies with npm install"
      (cd "$frontend_dir" && npm install)
    fi

    if (cd "$frontend_dir" && npm run | grep -q " lint"); then
      info "Running frontend lint"
      (cd "$frontend_dir" && npm run lint)
    else
      warn "No frontend lint script detected; skipping lint"
    fi

    if (cd "$frontend_dir" && npm run | grep -q " typecheck"); then
      info "Running frontend typecheck"
      (cd "$frontend_dir" && npm run typecheck)
    else
      warn "No frontend typecheck script detected; skipping typecheck"
    fi
  else
    warn "npm is not installed; skipping frontend setup and verification"
  fi
}

info "Working directory: $PWD"

for required_file in "${REQUIRED_FILES[@]}"; do
  require_file "$required_file"
done

if git rev-parse --show-toplevel >/dev/null 2>&1; then
  info "Git repository detected"
  git log --oneline -5 || true
else
  warn "This directory is not a git repository yet"
fi

if python_cmd="$(detect_python)"; then
  info "Using Python command: $python_cmd"
  validate_summary="$(validate_feature_list "$python_cmd")"
  printf '%s\n' "$validate_summary"
else
  warn "Python was not found; skipping feature_list.json validation"
fi

frontend_dir=""
backend_dir=""

if frontend_dir="$(find_frontend_dir)"; then
  :
else
  warn "No frontend package.json detected yet"
fi

if backend_dir="$(find_backend_dir)"; then
  :
else
  warn "No backend Python manifest detected yet"
fi

if [ -n "$backend_dir" ] && [ -n "${python_cmd:-}" ]; then
  run_backend_checks "$backend_dir" "$python_cmd"
elif [ -n "$backend_dir" ]; then
  warn "Backend detected but Python is unavailable, so backend checks were skipped"
fi

if [ -n "$frontend_dir" ]; then
  run_frontend_checks "$frontend_dir"
fi

if [ -z "$frontend_dir" ] && [ -z "$backend_dir" ]; then
  info "Scaffold-only startup check complete"
  echo "No application manifests were found yet, so init.sh only verified repository artifacts."
fi

info "Startup check complete"
