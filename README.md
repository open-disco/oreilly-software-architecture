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

For this demonstration, the profile format is (slightly modified) [ALPS](http://alps.io) profile. You can find the definition in [`profile/actualweather-alps.yaml`](https://github.com/zdne/oreilly-software-architecture/blob/master/profile/actualweather-alps.yaml).

### Providers

The providers (servers), did not have to modify their existing implemenation for this to work. Only two additions for a provider that wishes to declare allegiance with _Weather lookup_ profile are needed:  

1. Provide the API definition in [OpenAPI Specification 3.0 format](https://swagger.io/specification/) at a rutime
2. Register itself at a discovery registry (see below)

Note, provider's API definition MUST mark its operations, parameters and data that are conforming to the profile with the respective profile ids using the `x-profile` OpenAPI Spec extension ((example](https://github.com/zdne/oreilly-software-architecture/blob/master/providers/acme-weather-provider/acme-weather-openapi3.yaml#L15)).


### Consumer

The consumer (client), of any service that would claim implementation of _Weather lookup_, does not consume  the 

### Register







## Key Elements

1. Domain profile
2. Client programmed for this profile, not services
3. Services declare their conformance to the profile
4. Services provide their API design document (OpenAPI Specification) with the links to profile
5. Services register themselves in Open DISCO registry
6. Client discovers the services on the register based on their allegiance to the profile
7. Client consumes the services using the profile



