const superagent = require('superagent');
const ProfileConsumer = require('./lib/ProfileConsumer');

const RegistryURL = 'http://46.101.144.137:8282'; // http://rwmbook-registry.herokuapp.com
const ActualWeatherProfileId = 'http://alps.io/profiles/actual-weather';  // TODO: Single source of truth for this ID

// Let's go
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

// TODO: Bind to services if needed

// Query the services
async function queryWeatherServices(weatherServices) {
  console.log(`querying ${weatherServices.length} service(s)...`)

  weatherServices.forEach(async (service) => {

    // Create a client for each service
    client = new ProfileConsumer(service.serviceURL, ActualWeatherProfileId);

    // Invoke the requested affordance
    const response = await 
      client.perform(
        'weather-lookup',             // http://alps.io/profiles/actual-weather#weather-lookup
        {
          addressLocality: 'Paris'    // http://alps.io/profiles/actual-weather#addressLocality
        },
        [ 
          'airTemperature',           // http://alps.io/profiles/actual-weather#airTemperature
          'windDirection'             // http://alps.io/profiles/actual-weather#windDirection
        ]
      );

    console.log(`<--- ${service.serviceURL}:` , response);
  });
}
