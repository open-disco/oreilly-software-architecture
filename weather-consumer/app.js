const superagent = require('superagent');
const ProfileConsumer = require('./ProfileConsumer');

const RegistryURL = 'http://46.101.144.137:8282'; // http://rwmbook-registry.herokuapp.com

const ActualWeatherProfileId = 'http://alps.io/profiles/actual-weather';  // TODO: Single source of truth for this ID
const ExistingProfileId = 'http://schema.org/CreativeWork';

main();

//
// Run the app
//
async function main() {
  findWeatherLookupServices()
  .then(services => {
    queryWeatherServices(services);
  })
  .catch(console.error)
}

//
// Find services matching profile
//
async function findWeatherLookupServices() {
  const response =
    await superagent
      .get(`${RegistryURL}/find/`)
      .query({ semanticProfile: ActualWeatherProfileId })
      .set('accept', 'application/json')

  const services = response.body['disco'];
  if (!services || !services.length)
    return Promise.reject(`No service for profile '${ActualWeatherProfileId}' found.`);

  return services;
}

//
// Bind to services
//
// ...

// Query the services
async function queryWeatherServices(weatherServices) {
  console.log(`querying ${weatherServices.length} service(s)...`)

  weatherServices.forEach(async (service) => {
    console.log(service.serviceURL);

    client = new ProfileConsumer(service.serviceURL, ActualWeatherProfileId);
    const response = await client.perform(
      'weather-lookup',             // http://alps.io/profiles/actual-weather#weather-lookup
      {
        addressLocality: 'Paris'    // http://alps.io/profiles/actual-weather#addressLocality
      },
      // tag`{
      //   airTemperature,       
      //   windDirection         
      // }`,
    );

    // http://alps.io/profiles/actual-weather#airTemperature
    // http://alps.io/profiles/actual-weather#windDirection

    console.log(response);
  });
}


// Print results
