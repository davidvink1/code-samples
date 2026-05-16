# code-samples

This repository contains a collection of code samples demonstrating various technologies and integrations. Below is a brief explanation of each file's functionality:

### `aes_encrypt_post.py`
A Python script that reads an API key and endpoint from a YAML configuration, encrypts data using AES in CBC mode with padding, and POSTs the base64-encoded result to a remote endpoint.

### `aurora-mysql.tf`
A Terraform configuration file that provisions an AWS RDS Aurora MySQL cluster, including database instances, custom parameter groups, and associated security group rules for ingress traffic.

### `brands_controller_spec.rb`
An RSpec test suite for a Ruby on Rails `BrandsController` that tests standard CRUD operations (index, show, create, update, destroy), verifying HTTP status codes, JSON responses, and database changes.

### `cluster_factory.rb`
A FactoryBot configuration file for a Ruby testing environment that defines a `cluster` factory, including traits to easily generate clusters with or without associated `cluster_rule` records.

### `exchange_job.js`
A Node.js script that fetches real-time currency exchange rates from the `apilayer.net` API, parses the response, and safely inserts the data into a MySQL database within a single transaction.

### `high_risk_unit.js`
A Node.js module that checks a transaction's shipping address against a high-risk database table, calculates the days since the unit was last seen, and appends this risk data to the request.

### `ios-testflight.yml`
A GitHub Actions workflow that automates the iOS build process on a self-hosted runner, setting up Ruby/Node.js dependencies, managing CocoaPods, and using Fastlane to deploy to TestFlight.

### `job-detail.vue`
A Vue 3 component displaying detailed job posting information with a sticky header, job description sections, an interactive share dropdown menu, and a sidebar for applying or saving the job.

### `mailman.js`
A Node.js utility module that sends error notifications via email using `nodemailer` and Gmail SMTP, featuring a rate-limiting mechanism to ensure emails are sent at most once every two minutes.

### `ping.js`
A Node.js API route handler performing a health check by testing both read and write database connectivity with a 15-second timeout, returning a 200 OK "pong" response if both checks succeed.

### `refunds.controller.ts`
A NestJS controller providing a POST `/refunds` endpoint to process order refunds via a `RefundsService`, including request logging and proper HTTP 500 error handling if the operation fails.

### `stripe_checkout.js`
An AWS Lambda function that creates Stripe Checkout sessions for subscriptions by parsing request payloads, resolving product IDs to Stripe Price IDs, and returning the generated session URL.
