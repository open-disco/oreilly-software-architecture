const superagent = require('superagent');

const RegistryURL = 'http://46.101.144.137:8282'; // http://rwmbook-registry.herokuapp.com

const ActualWeatherProfileId = 'http://alps.io/profiles/actual-weather';
const ExistingProfileId = 'http://schema.org/CreativeWork';

main();

//
// Run the client
//
async function main() {
  findWeatherLookupServices()
  .then(services => {
    console.log('printing');
    return services;
  })
  .then(services => {
    console.log(JSON.stringify(services, '', 2));
  })
  .catch(console.error)
}

//
// Find services matching profile
//
async function findWeatherLookupServices() {
  const result = 
    await superagent
      .get(`${RegistryURL}/find/`)
      .query({ semanticProfile: ActualWeatherProfileId })
      .set('accept', 'application/json')

  const services = result.body['disco'];
  if (!services || !services.length)
    return Promise.reject(`No service for profile '${ActualWeatherProfileId}' found.`);
  
  return services;
}


// Bind to services

// Query the services

// Print results



//
//  SCRAP
// 
// .then(res => {
//   let services = res.body['disco'];
//   console.log('result arrived');
//   // console.log(JSON.stringify(services, '', 2));

//   return Promise.resolve(services);
// })
// .catch(console.error);