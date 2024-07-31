resource "aws_iam_user" "applicantAtlas_publishing" {
  name = "applicantAtlas-publishing"
}

resource "aws_iam_policy" "applicantAtlas_publishing_policy" {
  name        = "applicantAtlas-publishing-policy"
  description = "Policy for applicantAtlas publishing"
  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Action" : [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:CompleteLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:InitiateLayerUpload",
          "ecr:PutImage"
        ],
        "Resource" : "*"
      }
    ]
  })
}

resource "aws_iam_user_policy_attachment" "applicantAtlas_publishing_attachment" {
  user       = aws_iam_user.applicantAtlas_publishing.name
  policy_arn = aws_iam_policy.applicantAtlas_publishing_policy.arn
}
