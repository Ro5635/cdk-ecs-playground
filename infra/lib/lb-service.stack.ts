import { NestedStack, NestedStackProps } from "aws-cdk-lib";
import { Cluster, ContainerImage } from "aws-cdk-lib/aws-ecs";
import { Construct } from "constructs";
import * as cdk from 'aws-cdk-lib';
import { PolicyDocument, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Repository } from "aws-cdk-lib/aws-ecr";

interface LBServiceStackProps extends NestedStackProps {
    readonly cluster: Cluster;
}

export class LBServiceSubStack extends NestedStack {
    // Playing with the CDK Patterns
    // create a dummy load balanaced fargate ecs service

    constructor(scope: Construct, id: string, props: LBServiceStackProps) {
        super(scope, id, props);

        // The automagically created role by the ApplicationLoadBalancedFargateService does not provide the create log group
        // permission so create our own role and pass it in
        const ecsTaskExecutionRole = new Role(this, 'ecsTaskExecutionRoleRobertCluster', {
            assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com'),
            roleName: 'ecsTaskExecutionRoleRobertCluster',
            inlinePolicies: {
                'ecsTaskExecutionRolePolicy': new PolicyDocument({
                    statements: [
                        new PolicyStatement({
                            actions: [
                                'ecr:GetAuthorizationToken',
                                'ecr:BatchCheckLayerAvailability',
                                'ecr:GetDownloadUrlForLayer',
                                'ecr:BatchGetImage',
                                'logs:CreateLogStream',
                                'logs:CreateLogGroup',
                                'logs:PutLogEvents',
                            ],
                            resources: ['*'],
                        }),
                    ],
                }),
            },
        });

        const ecrTestImageRepo = new Repository(this, 'ecsTestAppRepo', {
            repositoryName: 'ecs-test-app',
        })

        // // Allow the ECS Control Plane Execution to pull the image from the ECR Repo
        ecrTestImageRepo.grantPull(new ServicePrincipal('ecs-tasks.amazonaws.com'));
        ecrTestImageRepo.grantPull(ecsTaskExecutionRole);

        // I am not totaly convinced by these patterns abstractions, I feel like I want more access to 
        // set the names of the task definitions to something more meaningful in addition to being able to set 
        // up the health check myself... I need to dig more into this interfface I feel like I am missing something... 
        const loadBalancedFargateService = new cdk.aws_ecs_patterns.ApplicationLoadBalancedFargateService(this, 'RobertTestService', {
            cluster: props.cluster,
            serviceName: 'robert-test-service',
            loadBalancerName: 'robert-test-service',
            memoryLimitMiB: 512,
            cpu: 256,
            desiredCount: 1,

            // Because we are not deploying into a private subnet (!!) we need to assign a public IP
            // otherwise the service will not be able to reach ECR
            assignPublicIp: true,
            circuitBreaker: {
                rollback: true,
            },

            taskImageOptions: {
                containerName: 'robert-test-app',
                image: ContainerImage.fromEcrRepository(ecrTestImageRepo, 'latest'),
                containerPort: 8080,
                environment: {
                    'PORT': '8080',
                },

                executionRole: ecsTaskExecutionRole,
                logDriver: new cdk.aws_ecs.AwsLogDriver({
                    streamPrefix: 'robert-test-app',

                    logGroup: new cdk.aws_logs.LogGroup(this, 'robert-test-app-log-group', {
                        logGroupName: 'robert-test-app',
                        retention: cdk.aws_logs.RetentionDays.ONE_YEAR,
                    }),
                }),
            },
        });

        // Adds a health check to the target group
        // there is not one configured on the containers atm
        // so this will remove the unhealthy target from the target group
        // but has no effect on restoring health...
        loadBalancedFargateService.targetGroup.configureHealthCheck({
            path: '/health',
            healthyHttpCodes: '200',
            unhealthyThresholdCount: 2,
            healthyThresholdCount: 2,
            interval: cdk.Duration.seconds(5),
            timeout: cdk.Duration.seconds(4),
        });

    }
}