import { NestedStack } from "aws-cdk-lib";
import { Vpc } from "aws-cdk-lib/aws-ec2";
import { Cluster } from "aws-cdk-lib/aws-ecs";
import { Construct } from "constructs";

export class ClusterSubStack extends NestedStack {
    public readonly cluster: Cluster;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        // Yolo the account default vpc
        // for the love of all things please only deploy to private subnets outside of a quick tests
        const defaultVpc = Vpc.fromLookup(this, 'DefaultVPC', { isDefault: true });


        this.cluster = new Cluster(this, 'RobertCluster', {
            vpc: defaultVpc,
            clusterName: 'robert-cluster',
            containerInsights: true,
        });

    }
}
