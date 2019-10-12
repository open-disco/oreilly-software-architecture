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
  async perform(affordanceId, parameters, response) {
    console.log('invoking ', affordanceId, parameters);

    // Fetch OpenAPI Specification (if not already)
    const spec = await this.fetchAPISpecification();
    console.log(spec);

    // Find in OAS the operation with given id
    const operation = this.findOperation(affordanceId);

    

    // Build request according to OAS
    // Set parameter marked with id to value
    // Execute
    
    return Promise.resolve({ someValue: 42 });
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
        return Promise.reject(e);
      };
    }

    return Promise.resolve(this.apiSpecification);
  }

  //
  //  Finnd operation with given x-profile affordanceId
  //
  findOperation(affordanceId) {
    if (!this.apiSpecification || !this.profileId) {
      return null;
    }
    const fullProfileAffordanceId = `${this.profileId}#${affordanceId}`;

    for (const pathKey in this.apiSpecification.paths) {      
      const path = this.apiSpecification.paths[pathKey];
    
      for (const operationKey in path) {
        const operation = path[operationKey];

        if (operation['x-profile'] === fullProfileAffordanceId) {
          return operation;
        }
      }
    };

    return null;
  }

};

module.exports = ProfileConsumer;
