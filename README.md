# Adarth Admin

## Project Structure

- `src/components` - Individual components
- `src/pages` - Routes
- `src/styles` - Styles
- `src/utils` - Reusable functions
- `src/utils/config.js` - Constants or other static data
- `src/utils/http.js` - Base structure for calling APIs
- `src/requests` - Requests to call APIs which would be consumed by hooks
- `src/hooks` - Hooks based off of requests
- `src/store` - Stores for managing global state

## Getting started

- Clone the repo
- Install dependencies using yarn or npm: `npm install` or `yarn`
- Start the project using `npm run dev` or `yarn dev`

## Commit flow

### New feature

- Checkout `dev`
- Fork a branch with name: `yourname/feat/feature-name`
- Do your changes
- Run `git add` -> `npm run cm` -> `git push`
- Create PR against `dev`

### Bug in a feature branch

- Checkout branch which has the bug
- Fix the bug
- Run `git add` -> `npm run cm` -> `git push`
- Create PR against `dev`

## Basic guidelines

- In case `.env` is updated, modify the corresponding `.env.example` file
  - eg:
    - `.env`: VITE_BASE_URL: https://example.com
    - `.env.example`: VITE_BASE_URL: BASE_URL
- Only use global styles for overriding package styles or if absolutely necessary. Else, use `.module.scss`
- Do not pull `dev` into feature branch unless absolutely necessaary
