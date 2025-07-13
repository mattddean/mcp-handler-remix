export interface AuthorizationCode {
  code: string;
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  scope: string;
  expiresAt: number;
  userId?: string;
  auth0Sub?: string;
  auth0OrgId?: string;
}

export interface AccessToken {
  token: string;
  clientId: string;
  scope: string;
  expiresAt: number;
  userId?: string;
  refreshToken?: string;
  auth0Sub?: string;
  auth0OrgId?: string;
  auth0RefreshToken?: string;
}

export interface Client {
  clientId: string;
  clientSecret?: string;
  redirectUris: string[];
  name: string;
  scope: string;
}

export interface Auth0Session {
  sessionId: string;
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  scope: string;
  state: string;
  expiresAt: number;
}
