terraform {
  backend "s3" {
    bucket = "davidteather-terraform-states"
    key    = "applicantatlas/terraform.tfstate"
    region = "us-east-1"
  }
}
