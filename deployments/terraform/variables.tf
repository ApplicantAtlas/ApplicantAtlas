variable "database_env_vars" {
  description = "Environment variables for the database"
  type        = map(string)
}

variable "api_env_vars" {
  description = "Environment variables for the API"
  type        = map(string)
}

variable "event_listener_env_vars" {
  description = "Environment variables for the event listener"
  type        = map(string)
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "terraform_state_bucket" {
  description = "Terraform state bucket"
  type        = string
}
