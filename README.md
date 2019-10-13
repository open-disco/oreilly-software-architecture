# Autonomous APIs Demo

Demo repository for O'Reilly Software Architecture Conference

## [Autonomous APIs: Navigation in complex landscapes](https://conferences.oreilly.com/software-architecture/sa-eu/public/schedule/detail/79145)

```
Zdenek Nemec (Good API)
9:00–10:30 Wednesday, 6 November 2019
Location: M8
Distributed systems
Secondary topics:  Best Practice, Overview, Theoretical
```

## What is going on?

This repository demonstrates the concept of "Autonomous API" that is a self-driving client discovering and consuming services from different providers.

## Demo

There are two different weather services. Both services *provide* information about the actual weather at a given location. 

- [ACME Weather Service](https://app.swaggerhub.com/apis/goodapi/acme-weather/1.0.0#/default/get_weather) (Swagger Documentation)
- [Méteo service](https://app.swaggerhub.com/apis/goodapi/meteoservice/1.0.0#/default/post_meteo_actuelle) (Swagger Documentation)

The implementation of these services is in the `/providers` folder.

There is one client, that is able to discover the services and query both of them and print information about current weather at a location of choice.

**The client query both services without knowing any services API URLs (not even API root!) and without knowing their desing.**

In other words, the client is programmed without any knowledge of a particular serivice, its design, implementation or documentation!!!


## How it works? 

Pure Magic.

## How it really works?

### Profile

In order for this to work there is an additonal level of indirection that abstracts away the desing details about the services. This indirection is the definiton of the _Weather lookup_ domain.  The _Weather lookup_ domain, subdomain of a weather domain is defined in a profile. The profile includes semantical definition of both the action and data of any service that would like to implemenet the _Weather lookup_ profile.

For this demonstration, the profile format is (slightly modified) [ALPS](http://alps.io) profile. You can find the definition in [`profile/actualweather-alps.yaml`](https://github.com/zdne/oreilly-software-architecture/blob/master/profile/actualweather-alps.yaml). The identifier of our _Weather lookup_ profile is `http://alps.io/profiles/actual-weather`.

### Providers

The providers (servers), did not have to modify their existing implemenation for this to work. Only two additions for a provider that wishes to declare allegiance with _Weather lookup_ profile are needed:  

1. Provide the API definition in [OpenAPI Specification 3.0 format](https://swagger.io/specification/) at a rutime
2. Register itself at a discovery registry (see below)

Note, provider's API definition MUST mark its operations, parameters and data that are conforming to the profile with the respective profile ids using the `x-profile` OpenAPI Spec extension ([example](https://github.com/zdne/oreilly-software-architecture/blob/master/providers/acme-weather-provider/acme-weather-openapi3.yaml#L15)).

### Register

There is a register where services can register themselves. The register is also the place where potential clients can discover the services they would like to consume based on their declared profile.  

This demo uses the [DISCO](http://www.open-disco.org) (Discovering Interoperative Services for Continuous Operation) protocol and its hosted registry implementation for the registration and discovery.

### Consumer

Finally, the consumer (client), of any service that would claim implementation of _Weather lookup_, does not need to know any details about the service it is going to find and consume. Instead, the consumer connects to a DISCO registry, finds any services conforming to the _Weather lookup_ profile (`http://alps.io/profiles/actual-weather`) and consume them as needed using the parlance of the profile ("Program for the domain profile, not for a particular service").

The actual implementation of the client is **very simple** as can be seen in [`consumer/app.js`](https://github.com/zdne/oreilly-software-architecture/blob/master/consumer/app.js).

Example output querying the actual weather in Paris from two differnt services:

```
querying 2 service(s)...
---> invoking  weather-lookup { addressLocality: 'Paris' } http://localhost:3301
---> invoking  weather-lookup { addressLocality: 'Paris' } http://localhost:3300

POST http://localhost:3301/meteo/actuelle
headers: {"content-type":"application/json","accept":"application/json"}
body: {"city":"Paris"}


GET http://localhost:3300/weather?addressLocality=Paris
headers: {"accept":"application/json"}

<--- http://localhost:3301: { airTemperature: 15.3, windDirection: 'SWS' }
<--- http://localhost:3300: { airTemperature: 16, windDirection: 'ENE' }
Done in 0.35s.
```

### Resilience

Added benefit of this solution is the extra resilience of the client. As the client is programmed for a profile, not the service, it is highly decoupled from any particular implementation, making it provider-agnostic and resilient to changes, enabling the independent evolution of both client and server.

## Key Elements

1. Domain profile
2. Client programmed for this profile, not services
3. Services declare their conformance to the profile
4. Services provide their API design document (OpenAPI Specification) with the links to profile
5. Services register themselves in Open DISCO registry
6. Client discovers the services on the register based on their allegiance to the profile
7. Client consumes the services using the profile

## How can I run it by myself?

Clone the [DISCO registry repository](https://github.com/open-disco/registry), run the registry on your own.

Clone this repository ... 

```bash
$ git clone https://github.com/zdne/oreilly-software-architecture.git
```

install the dependencies for both providers ... 

```bash
$ cd oreilly-software-architecture/providers
$ yarn install
```

and consumers...

```
$ cd oreilly-software-architecture/consumer
$ yarn install
```

Then

1. Run DISCO registry
2. Run one service provider e.g. ACME (`cd providers/ && yarn start-acme`)
3. Run another service provider e.g. Méteo(`cd providers/ && yarn start-meteo`)
4. Run the consumer  (`cd consumer/ && yarn start`)


## Questions? 

Just contact me at twitter <https://twitter.com/zdne>

