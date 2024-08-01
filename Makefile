SEMVER ?= patch

default:
	@echo "Please specify a target..."

release:
	bump2version $(SEMVER) && git push origin --tags && git push
	cd deployments/terraform && terraform apply