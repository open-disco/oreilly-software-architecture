/*******************************************
 discovery defaults/settings file
********************************************/

// create node
var settings = {}

// general settings
settings.verbose = true;
settings.registryID = null;
settings.renewTTL = 300000;
settings.contentType = "application/json";
settings.acceptType = "application/json";

// your service identifiers
settings.serviceName = "ACME Weather Service";
settings.serviceURL = "http://localhost:3300";
settings.tags = "weather-lookup";

// the registry service endpoints
settings.registerURL = "http://localhost:8282/reg/";
settings.renewURL = "http://localhost:8282/renew/";
settings.unregisterURL = "http://localhost:8282/unreg/";
settings.findURL = "http://localhost:8282/find/";
settings.bindURL = "http://localhost:8282/bind/";

// settings.registerURL = "http://rwmbook-registry.herokuapp.com/reg/";
// settings.renewURL = "http://rwmbook-registry.herokuapp.com/renew/";
// settings.unregisterURL = "http://rwmbook-registry.herokuapp.com/unreg/";
// settings.findURL = "http://rwmbook-registry.herokuapp.com/find/";
// settings.bindURL = "http://rwmbook-registry.herokuapp.com/bind/";

// publish node
module.exports = settings;
