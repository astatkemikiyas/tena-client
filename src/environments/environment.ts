export const environment = {
  production: false,
  apiUrl: 'http://localhost:8083',
  oidcIssuer: 'http://localhost:8080/realms/tena-dev',
  oidcClientId: 'tena-client',
  oidcRedirectUri: 'http://localhost:4200/callback',
  oidcScope: 'openid profile email',
  appName: 'TenaDigital',
};
