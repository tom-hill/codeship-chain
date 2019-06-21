# Codeship-Chain

![GitHub package.json version](https://img.shields.io/github/package-json/v/tom-hill/codeship-chain.svg?style=flat-square) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

This project is a simple tool to allow you to link up two or more Codeship projects into one "pipeline".

When talking about a pipeline in this context, we are not referring to your usual project pipeline in the Codeship UI. Each build will still appear as a separate build, however this tool will allow you to link the start of one to the success of another. Giving you one the ability to "chain" multiple builds into one "pipeline".

For example:
`Build A SUCCESS > Triggers this lambda > Triggers Build B to start`

To use this tool, take a copy of this repo, and then follow the instructions below. Don't forget to store it against your own GitHub account (or on your Git Versioning service of choice) to make future updates easier.

### Table of contents
 1. [First use](#first-use)
 2. [Configuring the tool](#configuring-the-tool)
    1. [Configuring Codeship](#codeship)
    2. [Configuring AWS](#aws-serverless)
    3. [Configuring the Serverless YML](#serverless-yaml)

---

## First Use

The first time you use this project you will need to provide the serverless framwework your AWS user credentials in order for it to be able to create and deploy the Lambda function.

If you don't already have an AWS AIM user with permissions please see the [setting up an AWS AIM user](#setting-up-an-aws-aim-user) section first.

Once you have a user, you can run the following script, replacing the relevant keys with those from your account.

`npm run provide-creds -- --key <your-key> --secret <your secret>`

This will give the serverless framework the access details in needs to work.

---

## Configuring the tool

There are two parts to the tool that need to be configured to your use. Codeship, and AWS (Serverless).

1. [Configuring Codeship](#codeship)
2. [Configuring AWS](#aws-serverless)
3. [Configuring the Serverless YML](#serverless-yaml)

**Hint**: As we are using Codeship, you could use the `jet` tool and the `codeship.aes` key file to encrypt your secrets before you commit them, and decrypt it when you pull a new copy.

### Codeship

The first step in configuring the tool, is to replace the dummy Codeship project/user credentials located inside
[`config/codeship_secrets.example.json`](./config/codeship_secrets.example.json) and re-naming the file `codeship_secrets.json`

```json
{
  "org": "example-org",
  "user": "user@example-org.co.uk",
  "password": "password",
  "projects": [
    {
      "trigger": "example-org/triggering-project",
      "branches": ["develop", "master"],
      "chained": ["example-org/chained-project"]
    }
  ]
}
```

You can use this setup to trigger multiple different chains, for different projects, and any branches you want.

You can configure these 'chains' by adding multiple 'projects' to the projects array.

So for example:

```json
"projects": [
    {
        "trigger": "example-org/triggering-project",
        "branches": ["develop", "master"],
        "chained": ["example-org/chained-project"]
    },
    {
        "trigger": "example-org/triggering-project-b",
        "branches": ["master"],
        "chained": ["example-org/chained-project", "example-org/chained-project-B"]
    }
]
```

In this example, a build of `develop` or `master` for the `example-org/triggering-project` would trigger a build of the same branch on `example-org/chained-project`.

A build of `develop` would not trigger any builds for the `example-org/triggering-project-b`, but a build of `master` would trigger builds on `master` for both `example-org/chained-project` and `example-org/chained-project-B`.

The resulting `codeship_secrets.json` file is already excluded from your repository by the `.gitignore` file so that you don't accidently leak your access details into your repository. If you choose to use a different file name, be sure to add it to the ignore list. Or to encrypt some how before you commit it to your repository.

### AWS (Serverless)

The next thing to configure is optional. You can change the variables in [`config/serverless.config.json`](./config/serverless.config.json).

```json
{
  "STAGE": "production",
  "REGION": "us-east-1",
  "NAME": "Codeship-Chain"
}
```

The `STAGE` is the name of the stage used in the publication of the API Gateway.<br/>
The `REGION` is the AWS region that the services and stack should be created in.<br/>
The `NAME` is the name of the stack that will be created by CloudFormation in your AWS account.

### Serverless YAML

Inside of the [`serverless.yml`](./serverless.yml) file you can customise the paths that are available via the API Gateway. This would allow you to have custom endpoints per chain if you desired, instead of them sharing one endpoint.

```yaml
functions:
  codeshipChain:
    name: ${self:custom.vars.NAME}
    handler: handler.chain
    events:
      - http: ANY /
```

In the default, this will make the API respond to calls on the root only. If you wanted to have an endpoint for each build chain, you could use the triggers as the endpoint names. Using the endpoints from the previous examples, this would look like;

```yaml
functions:
  codeshipChain:
    name: ${self:custom.vars.NAME}
    handler: handler.chain
    events:
      - http: ANY /triggering-project
      - http: ANY /triggering-project-b
```

Although both of those endpoints will use the same base function. It may help you identify the intent of the process. This is entirely down to personal preference.
