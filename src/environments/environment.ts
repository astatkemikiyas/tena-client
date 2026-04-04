export const environment = {
  production: false,
  apiUrl: 'http://localhost:8083',
  keycloakUrl: 'http://localhost:8080',
  keycloakRealm: 'master',
  // Must match a Keycloak client with "Direct access grants" enabled
  keycloakClientId: 'tena-client',
  appName: 'TenaDigital',
};
