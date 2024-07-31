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

variable "version" {
  description = "The current software version"
  type        = string
  default     = "0.0.4"
}
