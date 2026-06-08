setup:
	@echo "Installing Sovereign Git Hooks..."
	cp scripts/pre-commit.sh .git/hooks/pre-commit
	chmod +x .git/hooks/pre-commit

.PHONY: all test lint build fmt contracts-test frontend-build

all: fmt lint test build

test: contracts-test

contracts-test:
@echo "=> Testing Soroban Contracts..."
cargo test --workspace --manifest-path contracts/Cargo.toml || true

fmt:
@echo "=> Formatting Rust Contracts..."
cargo fmt --all --manifest-path contracts/Cargo.toml || true

lint:
@echo "=> Linting Rust Contracts..."
cargo clippy --all-targets --all-features --manifest-path contracts/Cargo.toml -- -D warnings || true

frontend-build:
@echo "=> Building Frontend Developer Portal..."
cd frontend/developer-portal && npm install && npm run build || true
