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

**Hint**: As we are using Codeship, you could use the `jet` tool and the `codeship.aes` key file to encrypt your secrets before you commit them, and decrypt it when you pull a new copy.

### Codeship
The first step in configuring the tool, is to replace the dummy Codeship project/user credentials located inside
[`config/codeship_secrets.example.json`](./config/codeship_secrets.example.json) and re-naming the file `codeship_secrets.json`

```json
{
  "org_id": "your codeship organisation ID",
  "user": "your codeship username",
  "password": "the password for the codeship user"
}
```

**Example**
```json
{
  "org_id": "12345678-abcd-1234-efgh-567890ijklmn",
  "user": "user@companyname.com",
  "password": "P4ssw0rd!1"
}
```

The resulting `codeship_secrets.json` file is already excluded from your repository by the `.gitignore` file so that you don't accidently leak your access details into your repository. If you choose to use a different file name, be sure to add it to the ignore list. Or to encrypt some how before you commit it to your repository.

### AWS (Serverless)
TBC
