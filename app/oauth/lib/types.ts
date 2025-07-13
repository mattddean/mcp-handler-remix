export interface AuthorizationCode {
  code: string;
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  scope: string;
  expiresAt: number;
  userId?: string;
}

export interface AccessToken {
  token: string;
  clientId: string;
  scope: string;
  expiresAt: number;
  userId?: string;
  refreshToken?: string;
}

export interface Client {
  clientId: string;
  clientSecret?: string;
  redirectUris: string[];
  name: string;
  scope: string;
}