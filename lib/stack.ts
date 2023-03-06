import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export class MainStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /* <type>-<basic>-<web> */

    const vpc = new ec2.Vpc(this, "VPC", {
      vpcName: "basic-vpc",
      ipAddresses: ec2.IpAddresses.cidr("10.0.0.0/25"),
      natGateways: 0,
      availabilityZones: ["us-east-1a"],
      subnetConfiguration: [
        {
          name: "Public",
          cidrMask: 26,
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          name: "Private",
          cidrMask: 26,
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    const sgWeb = new ec2.SecurityGroup(this, "SGWeb", {
      vpc: vpc,
      securityGroupName: "GroupWeb",
      description: "Security group for web servers",
      allowAllOutbound: true,
    });

    cdk.Tags.of(sgWeb).add("Name", "sg-web-basic");

    sgWeb.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      "Allow HTTP from anywhere"
    );

    const roleSSM = new iam.Role(this, "Role", {
      roleName: "SSMRoleEC2Basic",
      description: "Role SSM for basic EC2",
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AmazonEC2RoleforSSM"
        ),
      ],
    });

    const instance = new ec2.Instance(this, "EC2", {
      vpc: vpc,
      instanceName: "i-basic-web",
      availabilityZone: "us-east-1a",
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      securityGroup: sgWeb,
      role: roleSSM,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      // vpcSubnets: {
      //   // subnetType: ec2.SubnetType.PUBLIC,
      //   // subnets: vpc.publicSubnets,
      // },
    });
  }
}
