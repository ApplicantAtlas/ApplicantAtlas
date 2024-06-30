locals {
  combined_env_vars = merge(var.database_env_vars, var.api_env_vars)
}

data "aws_caller_identity" "current" {}

resource "aws_ecr_repository" "applicant_atlas_api_lambda" {
  name = "applicant-atlas-api-lambda"
}

data "aws_ecr_image" "lambda_image" {
  repository_name = aws_ecr_repository.applicant_atlas_api_lambda.name
  image_tag       = "latest"
}

resource "aws_lambda_function" "applicant_atlas_api" {
  function_name = "applicant_atlas_api"
  image_uri     = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/${aws_ecr_repository.applicant_atlas_api_lambda.name}:latest"
  role          = aws_iam_role.iam_for_lambda.arn
  package_type  = "Image"
  memory_size   = 128
  timeout       = 10

  environment {
    variables = local.combined_env_vars
  }
}

resource "aws_iam_role" "iam_for_lambda" {
  name = "iam_for_lambda"

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
}

resource "aws_api_gateway_rest_api" "api" {
  name = "applicant_atlas_api_lambda_gateway"
}

resource "aws_api_gateway_resource" "resource" {
  path_part   = "time"
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  rest_api_id = aws_api_gateway_rest_api.api.id
}

resource "aws_api_gateway_method" "method" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.resource.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "integration" {
  rest_api_id             = aws_api_gateway_rest_api.api.id
  resource_id             = aws_api_gateway_resource.resource.id
  http_method             = aws_api_gateway_method.method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.applicant_atlas_api.invoke_arn
}

resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.applicant_atlas_api.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.api.execution_arn}/*/*/*"
}

resource "aws_api_gateway_deployment" "api_deploy" {
  depends_on = [aws_api_gateway_integration.integration]

  rest_api_id = aws_api_gateway_rest_api.api.id
  stage_name  = "v1"
}

output "url" {
  value = "${aws_api_gateway_deployment.api_deploy.invoke_url}${aws_api_gateway_resource.resource.path}"
}
