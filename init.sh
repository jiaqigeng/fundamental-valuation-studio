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

PHASE="unknown"
BRANCH_NAME="unknown"
LATEST_COMMIT="none"
WORKTREE_STATE="unknown"
NEXT_FEATURE="unknown"
FEATURE_COUNT="0"
ACTIVE_IN_PROGRESS="0"
FRONTEND_STATUS="not_detected"
BACKEND_STATUS="not_detected"
FRONTEND_DEV_COMMAND="TBD"
BACKEND_DEV_COMMAND="TBD"
FRONTEND_VERIFY_COMMAND="TBD"
BACKEND_VERIFY_COMMAND="TBD"
FULL_VERIFY_COMMAND="./init.sh"

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

detect_npm() {
  if command -v npm >/dev/null 2>&1; then
    printf '%s\n' "npm"
    return 0
  fi

  if command -v npm.cmd >/dev/null 2>&1; then
    printf '%s\n' "npm.cmd"
    return 0
  fi

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

find_frontend_dir() {
  local candidates=("frontend" "web" "client" ".")
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
  local candidates=("backend" "api" "server" ".")
  local dir

  for dir in "${candidates[@]}"; do
    if [ -f "$dir/pyproject.toml" ] || [ -f "$dir/requirements.txt" ]; then
      printf '%s\n' "$dir"
      return 0
    fi
  done

  return 1
}

run_npm_command() {
  local npm_cmd="$1"
  shift
  "$npm_cmd" "$@"
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
        raise SystemExit(f"feature_list.json: invalid status for {feature_id}: {status}")
    if status == "in_progress":
        in_progress += 1

if in_progress > 1:
    raise SystemExit("feature_list.json: more than one feature is marked in_progress")

unfinished = [feature for feature in features if feature.get("status") != "passing"]
unfinished.sort(key=lambda item: item.get("priority", 10**9))
next_feature = unfinished[0]["id"] if unfinished else "none"

print(f"FEATURE_COUNT={len(features)}")
print(f"ACTIVE_IN_PROGRESS={in_progress}")
print(f"NEXT_FEATURE={next_feature}")
PY
}

validate_progress_file() {
  if [ ! -s "progress.md" ]; then
    warn "progress.md is empty"
    return
  fi

  if grep -Eq '^- Repository root:\s*$' progress.md; then
    warn "progress.md still has an empty repository root field"
  fi

  if grep -Eq '^- Standard startup path:\s*$' progress.md; then
    warn "progress.md still has an empty standard startup path field"
  fi

  if grep -Eq '^- Standard verification path:\s*$' progress.md; then
    warn "progress.md still has an empty standard verification path field"
  fi
}

summarize_git_state() {
  if git rev-parse --show-toplevel >/dev/null 2>&1; then
    BRANCH_NAME="$(git branch --show-current 2>/dev/null || printf '%s' detached)"
    LATEST_COMMIT="$(git log -1 --pretty=format:'%h %s' 2>/dev/null || printf '%s' none)"
    if [ -n "$(git status --short 2>/dev/null)" ]; then
      WORKTREE_STATE="dirty"
    else
      WORKTREE_STATE="clean"
    fi

    info "Git branch: ${BRANCH_NAME}"
    info "Latest commit: ${LATEST_COMMIT}"
    info "Working tree: ${WORKTREE_STATE}"
  else
    warn "This directory is not a git repository yet"
  fi
}

read_feature_summary() {
  local python_cmd="$1"
  local line key value

  while IFS='=' read -r key value; do
    case "$key" in
      FEATURE_COUNT) FEATURE_COUNT="$value" ;;
      ACTIVE_IN_PROGRESS) ACTIVE_IN_PROGRESS="$value" ;;
      NEXT_FEATURE) NEXT_FEATURE="$value" ;;
    esac
  done < <(validate_feature_list "$python_cmd")

  info "Feature count: ${FEATURE_COUNT}"
  info "Active in-progress features: ${ACTIVE_IN_PROGRESS}"
  info "Next unfinished feature: ${NEXT_FEATURE}"
}

detect_phase() {
  local has_frontend_dir="0"
  local has_backend_dir="0"
  local has_frontend_manifest="0"
  local has_backend_manifest="0"

  [ -d "frontend" ] && has_frontend_dir="1"
  [ -d "backend" ] && has_backend_dir="1"
  [ -f "frontend/package.json" ] && has_frontend_manifest="1"
  [ -f "backend/pyproject.toml" ] && has_backend_manifest="1"
  [ -f "backend/requirements.txt" ] && has_backend_manifest="1"

  if [ "$has_frontend_manifest" = "1" ] && [ "$has_backend_manifest" = "1" ]; then
    PHASE="app_ready"
  elif [ "$has_frontend_manifest" = "1" ] || [ "$has_backend_manifest" = "1" ]; then
    PHASE="partial_scaffold"
  elif [ "$has_frontend_dir" = "1" ] || [ "$has_backend_dir" = "1" ]; then
    PHASE="directory_scaffold"
  else
    PHASE="harness_only"
  fi

  info "Repository phase: ${PHASE}"
}

run_backend_checks() {
  local backend_dir="$1"
  local python_cmd="$2"
  local backend_python="$ROOT_DIR/$backend_dir/.venv/Scripts/python.exe"

  BACKEND_STATUS="detected"
  BACKEND_DEV_COMMAND="cd ${backend_dir} && ./.venv/Scripts/python.exe -m uvicorn app.main:app --reload"
  BACKEND_VERIFY_COMMAND="cd ${backend_dir} && ./.venv/Scripts/python.exe -m pytest -q"

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

    if [ -f "$backend_python" ]; then
      info "Installing backend dependencies from requirements.txt"
      "$backend_python" -m pip install -r "$backend_dir/requirements.txt"
    else
      warn "Virtual environment exists but backend Python was not found at $backend_python"
    fi
  fi

  if [ -d "$backend_dir/tests" ]; then
    if [ -f "$backend_dir/pyproject.toml" ] && command -v uv >/dev/null 2>&1; then
      info "Running backend tests with uv"
      (cd "$backend_dir" && uv run pytest -q)
    else
      if [ -f "$backend_python" ] && "$backend_python" -c "import pytest" >/dev/null 2>&1; then
        info "Running backend tests with pytest"
        (cd "$backend_dir" && "$backend_python" -m pytest -q)
      else
        info "Running backend tests with unittest discovery"
        (cd "$backend_dir" && run_python_script "$python_cmd" -m unittest discover -s tests -p "test_*.py")
      fi
    fi
    BACKEND_STATUS="verified"
  else
    warn "No backend tests directory found; skipping backend verification"
  fi
}

frontend_has_script() {
  local frontend_dir="$1"
  local npm_cmd="$2"
  local script_name="$3"

  (cd "$frontend_dir" && run_npm_command "$npm_cmd" run 2>/dev/null | grep -Eq "(^| )${script_name}$|(^| )${script_name} ")
}

run_frontend_checks() {
  local frontend_dir="$1"
  local npm_cmd="$2"

  FRONTEND_STATUS="detected"
  FRONTEND_DEV_COMMAND="cd ${frontend_dir} && ${npm_cmd} run dev"
  FRONTEND_VERIFY_COMMAND="cd ${frontend_dir} && ${npm_cmd} run lint"

  info "Frontend detected in ${frontend_dir}"

  if [ -n "$npm_cmd" ]; then
    if [ -f "$frontend_dir/package-lock.json" ]; then
      info "Installing frontend dependencies with ${npm_cmd} ci"
      (cd "$frontend_dir" && run_npm_command "$npm_cmd" ci)
    else
      info "Installing frontend dependencies with ${npm_cmd} install"
      (cd "$frontend_dir" && run_npm_command "$npm_cmd" install)
    fi

    if frontend_has_script "$frontend_dir" "$npm_cmd" "lint"; then
      info "Running frontend lint"
      (cd "$frontend_dir" && run_npm_command "$npm_cmd" run lint)
    else
      warn "No frontend lint script detected; skipping lint"
      FRONTEND_VERIFY_COMMAND="TBD"
    fi

    if frontend_has_script "$frontend_dir" "$npm_cmd" "typecheck"; then
      info "Running frontend typecheck"
      (cd "$frontend_dir" && run_npm_command "$npm_cmd" run typecheck)
    else
      warn "No frontend typecheck script detected; skipping typecheck"
    fi

    FRONTEND_STATUS="verified"
  else
    warn "npm is not installed; skipping frontend setup and verification"
  fi
}

print_summary() {
  printf '\n'
  info "Startup summary"
  printf '%s\n' "- repo_root: ${ROOT_DIR}"
  printf '%s\n' "- branch: ${BRANCH_NAME}"
  printf '%s\n' "- latest_commit: ${LATEST_COMMIT}"
  printf '%s\n' "- worktree: ${WORKTREE_STATE}"
  printf '%s\n' "- phase: ${PHASE}"
  printf '%s\n' "- next_feature: ${NEXT_FEATURE}"
  printf '%s\n' "- backend_status: ${BACKEND_STATUS}"
  printf '%s\n' "- frontend_status: ${FRONTEND_STATUS}"
  printf '%s\n' "- backend_dev_command: ${BACKEND_DEV_COMMAND}"
  printf '%s\n' "- frontend_dev_command: ${FRONTEND_DEV_COMMAND}"
  printf '%s\n' "- backend_verify_command: ${BACKEND_VERIFY_COMMAND}"
  printf '%s\n' "- frontend_verify_command: ${FRONTEND_VERIFY_COMMAND}"
  printf '%s\n' "- full_verification: ${FULL_VERIFY_COMMAND}"
}

info "Working directory: $PWD"

for required_file in "${REQUIRED_FILES[@]}"; do
  require_file "$required_file"
done

summarize_git_state

python_cmd=""
if python_cmd="$(detect_python)"; then
  info "Using Python command: $python_cmd"
  read_feature_summary "$python_cmd"
else
  warn "Python was not found; skipping feature_list.json validation"
fi

validate_progress_file
detect_phase

npm_cmd=""
if npm_cmd="$(detect_npm)"; then
  info "Using npm command: $npm_cmd"
else
  warn "npm was not found; frontend commands may be unavailable"
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

if [ -n "$backend_dir" ] && [ -n "$python_cmd" ]; then
  run_backend_checks "$backend_dir" "$python_cmd"
elif [ -n "$backend_dir" ]; then
  warn "Backend detected but Python is unavailable, so backend checks were skipped"
fi

if [ -n "$frontend_dir" ]; then
  run_frontend_checks "$frontend_dir" "$npm_cmd"
fi

if [ "$PHASE" = "harness_only" ] || [ "$PHASE" = "directory_scaffold" ]; then
  info "Initialization is still in scaffold mode"
  printf '%s\n' "No runnable frontend/backend manifests are fully configured yet, so init.sh only validated harness state and repo structure."
fi

print_summary
info "Startup check complete"
