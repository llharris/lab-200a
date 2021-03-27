# Building Kubernetes on AWS EC2 with Terraform

## Setup a workspace
```
mkdir terraform-aws-k8s
cd terraform-aws-k8s
terraform workspace new aws-k8s .
```
## Create Terraform Template
```
terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = "eu-west-2"
}

resource "aws_vpc" "llharris_k8s_vpc" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Name = "llharris_k8s_vpc"
  }
}

resource "aws_instance" "k8s-master1" {
  ami = ami-0e169fa5b2b2f88ae
  instance_type = "t2.medium"
}

```
```
terraform init
terraform plan
terraform apply
```

`brew install kops`


