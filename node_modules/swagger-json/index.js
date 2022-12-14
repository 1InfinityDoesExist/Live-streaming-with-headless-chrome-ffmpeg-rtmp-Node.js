/* eslint no-underscore-dangle: off */
const fs = require('fs');
const j2s = require('joi-to-swagger');
const defaultConfig = require('./default_config');

const getMetaValue = (joiDefinitions, key) => {
  if (joiDefinitions && joiDefinitions._meta) {
    const flattened = Object.assign.apply(null, [{}].concat(joiDefinitions._meta));
    return flattened[key];
  }
};

const addParams = (transformPath, parameters, toSwagger) => {
  const getParams = [];
  const rxp = /{([^}]+)}/g;
  let curMatch = rxp.exec(transformPath);

  while (curMatch) {
    getParams.push(curMatch[1]);
    curMatch = rxp.exec(transformPath);
  }

  getParams.forEach((param) => {
    parameters.push({
      name: param,
      in: 'path',
      ...toSwagger.properties.params.properties[param],
    });
  });
};

const addQuery = (_transformPath, parameters, toSwagger) => {
  const keys = Object.keys(toSwagger.properties.query.properties);

  keys.forEach((key) => {
    parameters.push({
      in: 'query',
      name: key,
      ...toSwagger.properties.query.properties[key],
    });
  });
};

const addHeaders = (_transformPath, parameters, toSwagger) => {
  const keys = Object.keys(toSwagger.properties.headers.properties);

  keys.forEach((key) => {
    parameters.push({
      in: 'header',
      name: key,
      ...toSwagger.properties.headers.properties[key],
    });
  });
};

class Swagger {
  constructor(writeToFile) {
    this.currentRoute = [];
    this.paths = {};
    this.definitions = {};
    this.output = null;
    this.writeToFile = writeToFile;
  }

  createJsonDoc(info, host, basePath) {
    this.output = {
      ...defaultConfig,
      ...(info && { info }),
      ...(host && { host }),
      ...(basePath && { basePath }),
      definitions: this.definitions,
      paths: this.paths,
    };

    if (this.writeToFile) {
      return fs.writeFileSync('swagger.json', JSON.stringify(this.output));
    }

    return this.output;
  }

  addPaths(transformPath, method, tag, summary, parameters, responses) {
    const responsesModels = {
      200: {
        description: 'success',
        ...(responses || {})[200] || {},
      },
    };

    this.paths = {
      ...this.paths,
      [transformPath]: {
        ...this.paths[transformPath],
        [method]: {
          tags: [
            tag,
          ],
          summary,
          responses: responsesModels,
          parameters,
        },
      },
    };
  }

  addResponses(joiDefinitions, toSwagger) {
    const responses = {};
    const responseName = getMetaValue(joiDefinitions.response, 'modelName') || Date.now();
    this.definitions[responseName] = toSwagger.properties.response;
    responses[200] = {
      description: joiDefinitions.response._descriptions || 'success',
      schema: {
        $ref: `#/definitions/${responseName}`,
      },
    };

    return responses;
  }

  addNewRoute(joiDefinitions, path, method) {
    if (this.currentRoute.includes(path + method)) {
      return false;
    }

    this.currentRoute.push(path + method);

    const name = joiDefinitions.model || Date.now();
    const tag = joiDefinitions.group || 'default';
    const summary = joiDefinitions.description || 'No desc';
    const modelName = getMetaValue(joiDefinitions.body, 'modelName') || name;

    const toSwagger = j2s(joiDefinitions).swagger;
    if (toSwagger && toSwagger.properties && toSwagger.properties.body) {
      this.definitions[modelName] = toSwagger.properties.body;
    }

    let responses;
    if (toSwagger && toSwagger.properties && toSwagger.properties.response) {
      responses = this.addResponses(joiDefinitions, toSwagger);
    }

    const pathArray = path.split('/').filter(Boolean);
    const transformPath = pathArray.map((p) => {
      if (p.charAt(0) === ':') {
        return `/{${p.substr(1)}}`;
      }

      return `/${p}`;
    }).join('');

    const parameters = [];

    const {
      body,
      params,
      query,
      headers,
    } = joiDefinitions;

    if (body) {
      parameters.push({
        in: 'body',
        name: 'body',
        schema: {
          $ref: `#/definitions/${modelName}`,
        },
      });
    }

    if (params) {
      addParams(transformPath, parameters, toSwagger);
    }

    if (query) {
      addQuery(transformPath, parameters, toSwagger);
    }

    if (headers) {
      addHeaders(transformPath, parameters, toSwagger);
    }

    this.addPaths(transformPath, method, tag, summary, parameters, responses);

    this.output = {
      ...this.output,
      definitions: this.definitions,
      paths: this.paths,
    };

    if (this.writeToFile) {
      return fs.writeFileSync('swagger.json', JSON.stringify(this.output));
    }

    return this.output;
  }
}

module.exports = {
  get swaggerDoc() {
    return new Swagger(true);
  },

  get swaggerDocJson() {
    return new Swagger(false);
  }
};
