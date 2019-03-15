'use strict';

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1533212955583_1517';

  exports.static = {
    prefix: '/'
  }

  config.security = {
    csrf: {
      enable: false,
    },
    domainWhiteList: ['*']
  };

  config.cors = {
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
  };

  exports.mongoose = {
    url: 'mongodb://127.0.0.1/homeMall',
    options: { useNewUrlParser: true },
  };

  config.bodyParser = {
    enableTypes: ['json', 'form', 'text'],
    extendTypes: {
      text: ['text/xml', 'application/xml'],
    }
  }

  // add your config here
  config.middleware = [];

  return config;
};
