import { App } from "aws-cdk-lib";
import { MainStack } from "../lib/stack";
const app = new App();

new MainStack(app, "Stack", {});
