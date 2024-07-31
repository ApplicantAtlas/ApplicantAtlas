provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "ApplicantAtlas"
      Environment = "production"
      Owner       = "David Teather"
    }
  }
}
