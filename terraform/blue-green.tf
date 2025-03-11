# Blue-Green deployment configuration

# Blue-Green deployment parameters
variable "active_deployment" {
  description = "The currently active deployment (blue or green)"
  type        = string
  default     = "blue"
  validation {
    condition     = contains(["blue", "green"], var.active_deployment)
    error_message = "The active_deployment value must be either 'blue' or 'green'."
  }
}

# Blue task definition
resource "aws_ecs_task_definition" "blue_task" {
  family                   = "cicd-demo-task-blue"
  container_definitions    = jsonencode([{
    name  = "cicd-demo-app-blue"
    image = "${aws_ecr_repository.app_repo.repository_url}:${var.blue_version}"
    essential = true
    portMappings = [{
      containerPort = 3000
      hostPort      = 3000
      protocol      = "tcp"
    }]
    environment = [
      { name = "NODE_ENV", value = var.environment },
      { name = "PORT", value = "3000" },
      { name = "VERSION", value = var.blue_version },
      { name = "DEPLOYMENT_COLOR", value = "blue" }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = "/ecs/cicd-demo-app-blue"
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
  
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn
}

# Green task definition
resource "aws_ecs_task_definition" "green_task" {
  family                   = "cicd-demo-task-green"
  container_definitions    = jsonencode([{
    name  = "cicd-demo-app-green"
    image = "${aws_ecr_repository.app_repo.repository_url}:${var.green_version}"
    essential = true
    portMappings = [{
      containerPort = 3000
      hostPort      = 3000
      protocol      = "tcp"
    }]
    environment = [
      { name = "NODE_ENV", value = var.environment },
      { name = "PORT", value = "3000" },
      { name = "VERSION", value = var.green_version },
      { name = "DEPLOYMENT_COLOR", value = "green" }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = "/ecs/cicd-demo-app-green"
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
  
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn
}

# CloudWatch Log Groups for Blue-Green
resource "aws_cloudwatch_log_group" "blue_logs" {
  name              = "/ecs/cicd-demo-app-blue"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "green_logs" {
  name              = "/ecs/cicd-demo-app-green"
  retention_in_days = 30
}

# Blue ECS Service
resource "aws_ecs_service" "blue_service" {
  name            = "cicd-demo-service-blue-${var.environment}"
  cluster         = aws_ecs_cluster.app_cluster.id
  task_definition = aws_ecs_task_definition.blue_task.arn
  desired_count   = var.active_deployment == "blue" ? var.service_count : 0
  launch_type     = "FARGATE"
  
  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = [aws_security_group.app_sg.id]
    assign_public_ip = true
  }
  
  load_balancer {
    target_group_arn = aws_lb_target_group.blue_tg.arn
    container_name   = "cicd-demo-app-blue"
    container_port   = 3000
  }
  
  lifecycle {
    ignore_changes = [desired_count]
  }
}

# Target groups for blue-green deployment
resource "aws_lb_target_group" "blue_tg" {
  name        = "cicd-demo-blue-tg-${var.environment}"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"
  
  health_check {
    enabled             = true
    interval            = 30
    path                = "/health"
    port                = "traffic-port"
    healthy_threshold   = 3
    unhealthy_threshold = 3
    timeout             = 5
    protocol            = "HTTP"
    matcher             = "200"
  }
}

resource "aws_lb_target_group" "green_tg" {
  name        = "cicd-demo-green-tg-${var.environment}"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"
  
  health_check {
    enabled             = true
    interval            = 30
    path                = "/health"
    port                = "traffic-port"
    healthy_threshold   = 3
    unhealthy_threshold = 3
    timeout             = 5
    protocol            = "HTTP"
    matcher             = "200"
  }
}

# Blue-Green Load balancer listener rules
resource "aws_lb_listener" "app_listener" {
  load_balancer_arn = aws_lb.app_lb.arn
  port              = 80
  protocol          = "HTTP"
  
  default_action {
    type             = "forward"
    target_group_arn = var.active_deployment == "blue" ? aws_lb_target_group.blue_tg.arn : aws_lb_target_group.green_tg.arn
  }
}

# Test listener for the inactive environment
resource "aws_lb_listener" "test_listener" {
  load_balancer_arn = aws_lb.app_lb.arn
  port              = 8080
  protocol          = "HTTP"
  
  default_action {
    type             = "forward"
    target_group_arn = var.active_deployment == "blue" ? aws_lb_target_group.green_tg.arn : aws_lb_target_group.blue_tg.arn
  }
}

# Additional Variables for Blue-Green
variable "blue_version" {
  description = "The version to deploy to the blue environment"
  type        = string
}

variable "green_version" {
  description = "The version to deploy to the green environment"
  type        = string
}

# Outputs specific to Blue-Green
output "active_environment" {
  description = "Currently active environment (blue or green)"
  value       = var.active_deployment
}

output "test_environment_url" {
  description = "URL to access the test (inactive) environment"
  value       = "http://${aws_lb.app_lb.dns_name}:8080"
}

output "production_environment_url" {
  description = "URL to access the production (active) environment"
  value       = "http://${aws_lb.app_lb.dns_name}"
}

# Green ECS Service
resource "aws_ecs_service" "green_service" {
  name            = "cicd-demo-service-green-${var.environment}"
  cluster         = aws_ecs_cluster.app_cluster.id
  task_definition = aws_ecs_task_definition.green_task.arn
  desired_count   = var.active_deployment == "green" ? var.service_count : 0
  launch_type     = "FARGATE"
  
  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = [aws_security_group.app_sg.id]
    assign_public_ip = true
  }
  
  load_balancer {
    target_group_arn = aws_lb_target_group.green_tg.arn
    container_name   = "cicd-demo-app-green"
    container_port   = 3000
  }
  
  lifecycle {
    ignore_changes = [desired_count]
  }
}