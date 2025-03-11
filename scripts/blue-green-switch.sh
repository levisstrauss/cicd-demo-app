#!/bin/bash

# This script performs a blue-green deployment switch
# Usage: ./blue-green-switch.sh <environment> <approve|rollback>

set -e

ENVIRONMENT=$1
ACTION=$2

# Validate parameters
if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
  echo "Error: Environment must be 'staging' or 'production'"
  exit 1
fi

if [ "$ACTION" != "approve" ] && [ "$ACTION" != "rollback" ]; then
  echo "Error: Action must be 'approve' or 'rollback'"
  exit 1
fi

# Get current active deployment
cd terraform
CURRENT_DEPLOYMENT=$(terraform output -raw active_environment)
echo "Current active deployment: $CURRENT_DEPLOYMENT"

# Determine target deployment
if [ "$ACTION" == "approve" ]; then
  # Switch to the inactive environment
  if [ "$CURRENT_DEPLOYMENT" == "blue" ]; then
    TARGET_DEPLOYMENT="green"
  else
    TARGET_DEPLOYMENT="blue"
  fi
else
  # Rollback - keep using the current environment
  TARGET_DEPLOYMENT=$CURRENT_DEPLOYMENT
fi

echo "Target deployment: $TARGET_DEPLOYMENT"

# Apply the Terraform change
echo "Switching $ENVIRONMENT to $TARGET_DEPLOYMENT deployment..."

# Load environment-specific variables
terraform apply \
  -var-file=environments/${ENVIRONMENT}.tfvars \
  -var="active_deployment=$TARGET_DEPLOYMENT" \
  -auto-approve

echo "Deployment switch complete!"
echo "Active environment: $(terraform output -raw active_environment)"
echo "Production URL: $(terraform output -raw production_environment_url)"
echo "Test URL: $(terraform output -raw test_environment_url)"

# For approve action, we need to scale down the previous environment
if [ "$ACTION" == "approve" ]; then
  echo "Scaling down the previous ($CURRENT_DEPLOYMENT) environment..."
  
  # Get the ECS cluster name
  CLUSTER_NAME=$(terraform output -raw cluster_name)
  
  # Get the service name for the previous environment
  PREVIOUS_SERVICE="cicd-demo-service-${CURRENT_DEPLOYMENT}-${ENVIRONMENT}"
  
  # Scale down to 0
  aws ecs update-service \
    --cluster $CLUSTER_NAME \
    --service $PREVIOUS_SERVICE \
    --desired-count 0
  
  echo "Previous environment scaled down"
fi

exit 0