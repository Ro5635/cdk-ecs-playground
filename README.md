# cdk-ecs-playground
Playing with the CDK and ECS on a rather warm Sunday evening

/api -> a basic golang api that responds to get requests and a health check, use the DOCKERFILE to create a container for deployment to ECS

/infra -> CDK stack that creates a fargate backed service in ECS, I created this to play with the infrastructure patterns avalible in the CDK to see how they are to work with 
