export const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN || '';
export const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID || '';

export const isAuth0Configured = Boolean(
  auth0Domain && 
  auth0ClientId && 
  !auth0Domain.includes('YOUR_') && 
  !auth0ClientId.includes('YOUR_')
);

export const auth0Config = {
  domain: auth0Domain,
  clientId: auth0ClientId,
  authorizationParams: {
    redirect_uri: typeof window !== 'undefined' ? window.location.origin : '',
  },
};
