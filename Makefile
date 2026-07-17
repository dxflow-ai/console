.PHONY: init
init:
	pnpm install --config.pmOnFail=ignore

.PHONY: dev
dev:
	pnpm dev

.PHONY: generate
generate:
	pnpm generate

.PHONY: lint
lint:
	pnpm lint

.PHONY: format
format:
	pnpm format
