terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }
}

module "api" {
  source = "./modules/api"
  api_env_vars = var.api_env_vars
  database_env_vars = var.database_env_vars
  aws_region = var.aws_region
}

module "event_listener" {
  source     = "./modules/event-listener"
} 