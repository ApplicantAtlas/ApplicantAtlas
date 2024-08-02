terraform {
  backend "s3" {
    bucket = "applicant-atlas-terraform-states"
    key    = "applicantatlas/terraform.tfstate"
    region = "us-east-1"
  }
}
