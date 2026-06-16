.PHONY: init
init:
	pnpm install

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
