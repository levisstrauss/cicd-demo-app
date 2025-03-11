variable "aws_region" {
  description = "The AWS region to deploy to"
  type        = string
  default     = "us-west-2"
}

variable "environment" {
  description = "The deployment environment (staging, production)"
  type        = string
}

variable "app_version" {
  description = "The version of the application to deploy"
  type        = string
}

variable "vpc_id" {
  description = "The ID of the VPC to deploy to"
  type        = string
}

variable "subnet_ids" {
  description = "The subnet IDs to deploy to"
  type        = list(string)
}

variable "service_count" {
  description = "The number of tasks to run in the service"
  type        = number
  default     = 2
}
