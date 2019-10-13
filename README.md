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

- [ACME Weather Service](https://app.swaggerhub.com/apis/goodapi/acme-weather/1.0.0)
- [Méteo service](https://app.swaggerhub.com/apis/goodapi/meteoservice/1.0.0)

The implementation of these services is in the `/providers` folder.

There is one client, that is able to discover the services and query both of them and print information about current weather at a location of choice.

**The client query both services without knowing any services API URLs (not even API root!) and without knowing their desing.**

In other words, the client is programmed **without** any knowledge of a particular serivice, its design, implementation or documentation!!!


## How it works? 
Magic.


