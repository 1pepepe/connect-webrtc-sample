import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource.js";
import { data } from "./data/resource.js";
import iam from "aws-cdk-lib/aws-iam";
import lambda from "aws-cdk-lib/aws-lambda";
import { Duration } from "aws-cdk-lib";

const backend = defineBackend({
  auth,
});

// IAM Policy for startWebRTCContact
const customResourceStack = backend.createStack("MyCustomResources");
const authRole = backend.resources.auth.resources.authenticatedUserIamRole;
authRole.attachInlinePolicy(
  new iam.Policy(customResourceStack, "userpool-policy", {
    statements: [
      new iam.PolicyStatement({
        actions: ["connect:StartWebRTCContact"],
        resources: ["*"],
      }),
    ],
  })
);

// Lambda function for Bedrock
const lambdaStack = backend.createStack("MyLambda");
const classifyLambda = new lambda.Function(
  lambdaStack,
  "classifyInquiryWithBedrock",
  {
    functionName: "classifyInquiryWithBedrock",
    runtime: lambda.Runtime.PYTHON_3_11,
    handler: "index.handler",
    code: lambda.Code.fromAsset("lambda/artifacts"),
    timeout: Duration.seconds(8),
    architecture: lambda.Architecture.ARM_64,
  }
);
classifyLambda.role?.attachInlinePolicy(
  new iam.Policy(lambdaStack, "lambda-policy", {
    statements: [
      new iam.PolicyStatement({
        actions: ["bedrock:*"],
        resources: ["*"],
      }),
    ],
  })
);
