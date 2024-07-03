locals {
  combined_env_vars = merge(var.database_env_vars, var.event_listener_env_vars)
}

data "aws_caller_identity" "current" {}

resource "aws_ecr_repository" "applicant_atlas_event_listener_lambda" {
  name = "applicant-atlas-event-listener-lambda"
}

resource "aws_ecr_lifecycle_policy" "applicant_atlas_api_lambda_lifecycle_policy" {
  repository = aws_ecr_repository.applicant_atlas_event_listener_lambda.name
  policy     = <<POLICY
{
    "rules": [
        {
            "rulePriority": 2,
            "description": "Retain only the last 5 ECR images",
            "selection": {
                "tagStatus": "any",
                "countType": "imageCountMoreThan",
                "countNumber": 5
            },
            "action": {
                "type": "expire"
            }
        }
    ]
}
POLICY
}

data "aws_ecr_image" "lambda_image" {
  repository_name = aws_ecr_repository.applicant_atlas_event_listener_lambda.name
  image_tag       = "bc8c4043286c6d8578aa2d8fef419a0c7f42e2af"
}

resource "aws_cloudwatch_log_group" "lambda_log_group" {
  name              = "/aws/lambda/applicant_atlas_event_listener"
  retention_in_days = 14
}

resource "aws_lambda_function" "applicant_atlas_event_listener" {
  function_name = "applicant_atlas_event_listener"
  image_uri     = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/${aws_ecr_repository.applicant_atlas_event_listener_lambda.name}:bc8c4043286c6d8578aa2d8fef419a0c7f42e2af"
  role          = aws_iam_role.iam_for_lambda.arn
  package_type  = "Image"
  memory_size   = 128
  timeout       = 10

  environment {
    variables = local.combined_env_vars
  }

  depends_on = [aws_cloudwatch_log_group.lambda_log_group]
}

resource "aws_iam_role" "iam_for_lambda" {
  name = "iam_for_applicant_atlas_event_listener_lambda"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Effect = "Allow"
        Sid = ""
      }
    ]
  })

  inline_policy {
    name = "lambda-logs"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Action = [
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:PutLogEvents"
          ]
          Effect = "Allow"
          Resource = "arn:aws:logs:*:*:*"
        }
      ]
    })
  }

  inline_policy {
    name = "sqs-permission"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Action = [
            "sqs:ReceiveMessage",
            "sqs:DeleteMessage",
            "sqs:GetQueueAttributes"
          ]
          Effect = "Allow"
          Resource = var.sqs_queue_arn
        }
      ]
    })
  }
}

resource "aws_lambda_event_source_mapping" "sqs_event_source" {
  event_source_arn = var.sqs_queue_arn
  function_name    = aws_lambda_function.applicant_atlas_event_listener.arn
  batch_size       = 10
  enabled          = false
}

output "lambda_function_arn" {
  value = aws_lambda_function.applicant_atlas_event_listener.arn
}
