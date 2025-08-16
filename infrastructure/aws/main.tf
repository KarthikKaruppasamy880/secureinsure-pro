# AWS Infrastructure for SecureInsure Pro
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC Configuration
module "vpc" {
  source = "./modules/vpc"
  
  environment = var.environment
  vpc_cidr    = var.vpc_cidr
  
  public_subnets  = var.public_subnets
  private_subnets = var.private_subnets
  
  availability_zones = var.availability_zones
}

# ECS Cluster
module "ecs" {
  source = "./modules/ecs"
  
  environment = var.environment
  vpc_id      = module.vpc.vpc_id
  
  depends_on = [module.vpc]
}

# RDS Database
module "rds" {
  source = "./modules/rds"
  
  environment = var.environment
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.private_subnet_ids
  
  db_name     = var.db_name
  db_username = var.db_username
  db_password = var.db_password
  
  depends_on = [module.vpc]
}

# ElastiCache Redis
module "redis" {
  source = "./modules/redis"
  
  environment = var.environment
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.private_subnet_ids
  
  depends_on = [module.vpc]
}

# Elasticsearch Domain
module "elasticsearch" {
  source = "./modules/elasticsearch"
  
  environment = var.environment
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.private_subnet_ids
  
  depends_on = [module.vpc]
}

# Application Load Balancer
module "alb" {
  source = "./modules/alb"
  
  environment = var.environment
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.public_subnet_ids
  
  depends_on = [module.vpc]
}

# ECR Repositories
module "ecr" {
  source = "./modules/ecr"
  
  environment = var.environment
}

# ECS Services
module "services" {
  source = "./modules/services"
  
  environment = var.environment
  vpc_id      = module.vpc.vpc_id
  
  ecs_cluster_id = module.ecs.cluster_id
  alb_target_group_arn = module.alb.target_group_arn
  
  ecr_repository_urls = module.ecr.repository_urls
  
  db_endpoint = module.rds.endpoint
  redis_endpoint = module.redis.endpoint
  elasticsearch_endpoint = module.elasticsearch.endpoint
  
  depends_on = [module.ecs, module.alb, module.ecr, module.rds, module.redis, module.elasticsearch]
}

# CloudWatch Logs
module "cloudwatch" {
  source = "./modules/cloudwatch"
  
  environment = var.environment
}

# S3 Buckets
module "s3" {
  source = "./modules/s3"
  
  environment = var.environment
}

# Route 53
module "route53" {
  source = "./modules/route53"
  
  environment = var.environment
  alb_dns_name = module.alb.dns_name
  alb_zone_id  = module.alb.zone_id
  
  domain_name = var.domain_name
  
  depends_on = [module.alb]
}

# WAF
module "waf" {
  source = "./modules/waf"
  
  environment = var.environment
  alb_arn    = module.alb.arn
  
  depends_on = [module.alb]
}

# Outputs
output "alb_dns_name" {
  description = "DNS name of the load balancer"
  value       = module.alb.dns_name
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = module.ecs.cluster_name
}

output "rds_endpoint" {
  description = "RDS database endpoint"
  value       = module.rds.endpoint
}

output "redis_endpoint" {
  description = "Redis endpoint"
  value       = module.redis.endpoint
}

output "elasticsearch_endpoint" {
  description = "Elasticsearch endpoint"
  value       = module.elasticsearch.endpoint
}

output "ecr_repository_urls" {
  description = "ECR repository URLs"
  value       = module.ecr.repository_urls
} 