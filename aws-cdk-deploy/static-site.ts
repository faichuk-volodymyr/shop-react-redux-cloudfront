#!/usr/bin/env node
import * as s3 from "@aws-cdk/aws-s3";
import * as s3deploy from "@aws-cdk/aws-s3-deployment";
import * as iam from "@aws-cdk/aws-iam";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import { Construct, Stack } from "@aws-cdk/core";

export class StaticSite extends Construct {
  constructor(parent: Stack, name: string) {
    super(parent, name);

    const destinationBucket = new s3.Bucket(this, "ShopReactAppBucket", {
      bucketName: "faichuk-shop-react-app-automated-cdk",
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html",
      publicReadAccess: true,
    });

    const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this, "SRA-OAI");

    destinationBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ["S3:GetObject"],
        resources: [destinationBucket.arnForObjects("/*")],
        principals: [
          new iam.CanonicalUserPrincipal(
            cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId
          ),
        ],
      })
    );

    new s3deploy.BucketDeployment(this, "ShopReactApp-Bucket-Deployment", {
      sources: [s3deploy.Source.asset("../dist")],
      destinationBucket,
    });
    
  }
}