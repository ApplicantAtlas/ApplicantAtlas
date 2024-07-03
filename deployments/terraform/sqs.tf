
resource "aws_sqs_queue" "applicant_atlas_pipeline_queue" {
  name                        = "applicant-atlas-pipeline-queue"
  delay_seconds               = 0
  max_message_size            = 262144  # 256 KB
  message_retention_seconds   = 86400  # 1 day
  receive_wait_time_seconds   = 0
  visibility_timeout_seconds  = 30

  tags = {
    Project = "applicant-atlas"
  }
}