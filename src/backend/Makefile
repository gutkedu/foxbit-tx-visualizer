.PHONY: help db/generate db/migrate db/push db/studio db/token db/check db/reset

# ── AWS / DSQL config ────────────────────────────────────────────────────────
AWS_REGION   ?= us-east-1
AWS_PROFILE  ?= gutkedu-terraform
# Set DSQL_ENDPOINT before running any target, e.g.:
#   export DSQL_ENDPOINT=<your-cluster-id>.dsql.us-east-1.on.aws

# ── Helpers ──────────────────────────────────────────────────────────────────
help: ## Show available targets
	@grep -E '^[a-zA-Z_/%-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Generate a short-lived IAM auth token and export it as PGPASSWORD.
# Useful if you need PGPASSWORD in your current shell for other tools:
#   eval $(make db/token)
db/token: ## Print shell export for DSQL IAM auth token (eval to use in shell)
	@[ -n "$(DSQL_ENDPOINT)" ] || (echo "❌  DSQL_ENDPOINT is not set"; exit 1)
	@AWS_PROFILE=$(AWS_PROFILE) AWS_REGION=$(AWS_REGION) printf 'export PGPASSWORD=%s\n' "$$(AWS_PROFILE=$(AWS_PROFILE) AWS_REGION=$(AWS_REGION) node scripts/get-dsql-token.mjs)"

# ── Drizzle Kit targets ───────────────────────────────────────────────────────
db/reset: ## ⚠️  Drop all tables and migrations tracking (dev only)
	@[ -n "$(DSQL_ENDPOINT)" ] || (echo "❌  DSQL_ENDPOINT is not set"; exit 1)
	AWS_PROFILE=$(AWS_PROFILE) AWS_REGION=$(AWS_REGION) DSQL_ENDPOINT=$(DSQL_ENDPOINT) node scripts/reset-db.mjs

db/check: ## Verify schema.ts is in sync with migration history (no ungenerated changes)
	npx drizzle-kit check

db/generate: ## Generate a new SQL migration file from schema changes
	npx drizzle-kit generate

db/migrate: ## Apply pending migrations to the DSQL cluster
	@[ -n "$(DSQL_ENDPOINT)" ] || (echo "❌  DSQL_ENDPOINT is not set"; exit 1)
	AWS_PROFILE=$(AWS_PROFILE) AWS_REGION=$(AWS_REGION) DSQL_ENDPOINT=$(DSQL_ENDPOINT) node scripts/migrate.mjs

db/push: ## Push schema changes directly without a migration file (dev shortcut)
	@[ -n "$(DSQL_ENDPOINT)" ] || (echo "❌  DSQL_ENDPOINT is not set"; exit 1)
	$(eval export PGPASSWORD=$(shell AWS_PROFILE=$(AWS_PROFILE) AWS_REGION=$(AWS_REGION) node scripts/get-dsql-token.mjs))
	AWS_PROFILE=$(AWS_PROFILE) npx drizzle-kit push

db/studio: ## Open Drizzle Studio connected to the DSQL cluster
	@[ -n "$(DSQL_ENDPOINT)" ] || (echo "❌  DSQL_ENDPOINT is not set"; exit 1)
	$(eval export PGPASSWORD=$(shell AWS_PROFILE=$(AWS_PROFILE) AWS_REGION=$(AWS_REGION) node scripts/get-dsql-token.mjs))
	AWS_PROFILE=$(AWS_PROFILE) npx drizzle-kit studio
