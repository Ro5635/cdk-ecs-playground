import * as cdk from 'aws-cdk-lib';
import { StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ClusterSubStack } from './cluster-stack';
import { LBServiceSubStack } from './lb-service.stack';

export class RootStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const { cluster } = new ClusterSubStack(this, 'RobertECSCluster');
    
    // Load Balanced Service Using the CDK ApplicationLoadBalancedFargateService Pattern
    const lbService = new LBServiceSubStack(this, 'TestLBService', {
      cluster,
    })

  }
}
