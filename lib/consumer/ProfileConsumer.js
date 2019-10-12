const superagent = require('superagent');

class ProfileConsumer {

  //
  // Constructor
  //
  constructor(providerURL, profileId) {
    this.providerURL = providerURL;
    this.profileId = profileId;
  }

  //
  // Invoke affordance
  //
  async perform(affordanceId, parameters, requestedResponse) {
    console.log('---> invoking ', affordanceId, parameters, this.providerURL);

    // Fetch OpenAPI Specification (if not already)
    await this.fetchAPISpecification();

    // Find in OpenAPI Specification the operation with given id
    const operation = this.findOperation(affordanceId);

    // Build request according to OpenAPI Specification and input parameters
    const request = this.buildRequest(operation, parameters);

    // Execute the request
    const result = await this.execute(request);

    // Normalize the response
    const normalizedResponse = this.normalizeResponse(operation, result, requestedResponse);

    return Promise.resolve(normalizedResponse);
  }

  //
  //  Fetch OAS from the provider
  //
  async fetchAPISpecification() {
    if (!this.apiSpecification) {
      try {
        const response =
        await superagent
          .get(`${this.providerURL}/oas`)
          .set('accept', 'application/json');
          this.apiSpecification = response.body;
      }
      catch (e) {
        // console.error(e);
        return Promise.reject(e);
      };
    }

    return Promise.resolve(this.apiSpecification);
  }

  //
  //  Find operation with given x-profile affordanceId
  //
  findOperation(affordanceId) {
    if (!this.apiSpecification || !this.profileId) {
      return null;
    }
    // Full id of the affordance within the profile
    const fullProfileAffordanceId = `${this.profileId}#${affordanceId}`;

    // Iterate paths
    for (const pathKey in this.apiSpecification.paths) {
      const path = this.apiSpecification.paths[pathKey];

      // Iterate operations
      for (const operationKey in path) {
        const operation = path[operationKey];

        if (operation['x-profile'] === fullProfileAffordanceId) {
          return {
            url: pathKey,
            method: operationKey,
            details: operation,
            responseSchema: operation.responses['200'].content['application/json'].schema
          };
        }
      }
    };

    return null;
  }

  //
  //  Build the request from operation information and parameters
  //
  buildRequest(operation, parameters) {
    const url = `${this.providerURL}${operation.url}`;
    const method = operation.method;
    let headers = {};
    let query = [];
    let body = null;

    // Fully qualified the input parameters
    let inputParameters = {}
    for (const parameterId in parameters) {
      inputParameters[`${this.profileId}#${parameterId}`] = parameters[parameterId];
    }
    //console.log('fully qualified input parameters\n', inputParameters);

    //
    // Process OAS parameters
    //
    operation.details.parameters.forEach(parameter => {
      const fullParmeterId = parameter['x-profile'];
      if (fullParmeterId in inputParameters) {
        // console.log(`processing parameter...\n`, parameter);

        if (parameter.in === 'query') {
          // Query parameters
          query.push(`${parameter.name}=${inputParameters[fullParmeterId]}`);  //TODO: pct-escape value
        }
        else {
          console.error(`parameters in '${parameter.in}' are not supported, yet`);
        }
      }
    });

    // TODO: Process OAS headers
    // TODO: Process OAS consumes / produces
    // TODO: Process authentication
    
    // Always accept JSON
    headers['accept'] = 'application/json';

    return { url, method, query, headers, body };
  }

  //
  // Execute request
  //
  async execute(request) {
    try {
      let response = 
        await superagent(
          request.method, 
          request.url)
          .query(request.query.join('&'))
          .set(request.headers);
      
      return Promise.resolve(response.body);
    }
    catch(e) {
      // console.error(e);
      return Promise.reject(e);
    }
  }

  //
  // Normalizes the response to the profile
  //
  normalizeResponse(operation, response, requestedResponse) {
    // Fully qualify the requested response
    let qualifiedProperties = [];
    requestedResponse.forEach((element) => {
      qualifiedProperties.push(`${this.profileId}#${element}`);
    });
    
    // Naive, flat traversal
    // TODO: reivisti for real objects
    const result = {}
    const schemaProperties = operation.responseSchema.properties;
    for (const property in schemaProperties) {
      const index = qualifiedProperties.indexOf(schemaProperties[property]['x-profile']);
      if (index >= 0) {
        result[requestedResponse[index]] = response[property];
      }
    }

    return result;
  }

};

module.exports = ProfileConsumer;
