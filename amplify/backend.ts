import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource.js";
import { data } from "./data/resource.js";
import iam from "aws-cdk-lib/aws-iam";

const backend = defineBackend({
  auth,
  data,
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
