import * as Codepipeline from "@aws-cdk/aws-codepipeline";
import * as CodepipelineActions from "@aws-cdk/aws-codepipeline-actions";
import {
  // CfnOutput,
  Construct,
  SecretValue,
  Stack,
  StackProps,
} from "@aws-cdk/core";
import { CdkPipeline, SimpleSynthAction } from "@aws-cdk/pipelines";
import * as CodeBuild from "@aws-cdk/aws-codebuild";
import { Bucket } from "@aws-cdk/aws-s3";
import { WebsiteStage } from "../stages/website";

/**
 * The stack that defines the application pipeline
 */
export class PipelineStack extends Stack {
  readonly domainName = "www.levutv.com";
  readonly hostedZoneName = "levutv.com";
  readonly hostedZoneId = "Z05384492FNGCN5SIVJA5";

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const sourceArtifact = new Codepipeline.Artifact();
    const buildArtifact = new Codepipeline.Artifact();
    const cloudAssemblyArtifact = new Codepipeline.Artifact();

    const pipeline = this.buildCDKPipeline(
      cloudAssemblyArtifact,
      sourceArtifact
    );
  }

  private buildCDKPipeline(
    cloudAssemblyArtifact: Codepipeline.Artifact,
    sourceArtifact: Codepipeline.Artifact
  ) {
    return new CdkPipeline(this, "Pipeline", {
      // The pipeline name
      pipelineName: "StaticWebsitePipeline",
      cloudAssemblyArtifact,

      // Where the source can be found
      sourceAction: new CodepipelineActions.GitHubSourceAction({
        actionName: "GitHub",
        output: sourceArtifact,
        oauthToken: SecretValue.secretsManager("github-token"),
        owner: "kicon72",
        repo: "static-site",
        branch: "main",
      }),

      synthAction: SimpleSynthAction.standardYarnSynth({
        sourceArtifact,
        cloudAssemblyArtifact,
        subdirectory: "infrastructure",
      }),
    });
  }
}