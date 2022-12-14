# swagger-json

Generate swagger json schema based on Joi schemas.

## Installation

```bash
npm install swagger-json
```

## Usage

```javascript
const { swaggerDoc } = require('swagger-json');
const Joi = require('joi');

const host = 'localhost:3000';
const basePath = '/';
const info = {
  "version": "1.0.0",
  "title": "Title Example",
  "description": "Description API example",
  "termsOfService": "http://swagger.io/terms/",
  "contact": {
    "name": "Example team"
  },
  "license": {
    "name": "MIT"
  }
};

// This will generate initial doc
swaggerDoc.createJsonDoc(info, host, basePath);

const joiSchema = {
  body: Joi.object({
    email: Joi.string().email().required().description('Email address for new user').example('vladimir@gmail.com'),
    password: Joi.string().min(7).max(24).required().description('Password for new user').example("Somestrongpasswrod#"),
    salt: Joi.string().required().description('Salt for new user').example('asdsdgdsafs324eqwedagsdfafsdf')
  }).meta({ modelName: 'Register' }),
  headers: Joi.object({
    authorization: Validation.tokenValidation.string().token().required().description('Auth token').example('asdasfadfasdsasdas')
  }),
  group: 'Register routes',
  description: 'Route to register user to the system'
}

// create a new route
swaggerDoc.addNewRoute(joiSchema, '/v1/user/register', 'post');

// your swagger json file will have been written to "swagger.json"
```

## Usage without writing the swagger.json file to the file system

```javascript
// use swaggerDocJson instead of swaggerDoc from the swagger-json module
const { swaggerDocJson } = require('swagger-json');

// using the same joiSchema, info, host, and basePath as the above example.
swaggerDocJson.addNewRoute(joiSchema, '/v1/user/register', 'post');

const swaggerSpec = swaggerDocJson.createJsonDoc(info, host, basePath);
```
