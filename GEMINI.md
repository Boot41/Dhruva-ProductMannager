# Project Overview

This project is a full-stack application consisting of a FastAPI backend and a React frontend. The backend handles API requests and interacts with a database, while the frontend provides the user interface.

# Building and Running

## Backend (server)

* **Dependencies:** Uses `uv` for dependency management.
* **Installation:**

  ```bash
  uv sync
  ```
* **Running:**

  ```bash
  uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
  ```
* **API Docs:** Accessible at `http://127.0.0.1:8000/docs`

## Frontend (web)

* **Dependencies:** Uses `pnpm` (implied by `package.json` and `pnpm-lock.yaml` in the directory listing, and common for Vite/React projects).
* **Installation:**

  ```bash
  npm install
  ```

  (or `pnpm install` if `pnpm` is preferred)
* **Running:**

  ```bash
  npm run dev
  ```
* **Building:**

  ```bash
  npm run build
  ```

# Development Conventions

## Backend

* Uses FastAPI for API development.
* Dependency management with `uv`.
* Configuration loaded from `.env` files.
* Project layout: `app/main.py` as entrypoint, `app/core/config.py` for settings.
* i dont have ruff

## Frontend

* Uses React, TypeScript, and Vite.
* ESLint for linting, with specific configurations for TypeScript and React.
