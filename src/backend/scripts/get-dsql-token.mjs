#!/usr/bin/env node
/* eslint-disable no-undef */
import { DsqlSigner } from '@aws-sdk/dsql-signer'

const hostname = process.env.DSQL_ENDPOINT
const region = process.env.AWS_REGION ?? 'us-east-1'

if (!hostname) {
  console.error('Error: DSQL_ENDPOINT is not set')
  process.exit(1)
}

const signer = new DsqlSigner({ hostname, region })
const token = await signer.getDbConnectAdminAuthToken()
process.stdout.write(token)
