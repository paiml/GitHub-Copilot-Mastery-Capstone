# GitHub Actions CI

This directory contains GitHub Actions workflows for continuous integration.

## Workflows

### CI Pipeline (`ci.yml`)

Runs on every push and pull request to `main`:

- Code formatting check
- Linting
- Type checking
- Unit tests (96.4% coverage)
- E2E tests
- Mutation testing (100% score)
- PMAT quality analysis

## Usage

The CI pipeline runs automatically on:

- Every push to `main` branch
- Every pull request to `main` branch

All quality gates must pass before code can be merged.
