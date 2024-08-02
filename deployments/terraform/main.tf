terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
    archive = {
      source = "hashicorp/archive"
    }
  }
}

module "api" {
  source            = "./modules/api"
  api_env_vars      = var.api_env_vars
  database_env_vars = var.database_env_vars
  aws_region        = var.aws_region
  sqs_queue_arn     = aws_sqs_queue.applicant_atlas_pipeline_queue.arn
  software_version  = var.software_version
}

module "event_listener" {
  source                  = "./modules/event-listener"
  event_listener_env_vars = var.event_listener_env_vars
  database_env_vars       = var.database_env_vars
  aws_region              = var.aws_region
  sqs_queue_arn           = aws_sqs_queue.applicant_atlas_pipeline_queue.arn
  software_version        = var.software_version
}
