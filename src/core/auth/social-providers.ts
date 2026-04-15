type SocialProviderOptions = {
  clientId: string;
  clientSecret: string;
  redirectURI?: string;
};

function getConfigValue(configs: Record<string, string>, key: string) {
  const value = configs[key];

  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

export function buildSocialProviders(configs: Record<string, string>) {
  const providers: Record<string, SocialProviderOptions> = {};

  const googleClientId = getConfigValue(configs, 'google_client_id');
  const googleClientSecret = getConfigValue(configs, 'google_client_secret');
  const googleRedirectUri = getConfigValue(configs, 'google_redirect_uri');

  if (googleClientId && googleClientSecret) {
    providers.google = {
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      ...(googleRedirectUri ? { redirectURI: googleRedirectUri } : {}),
    };
  }

  const githubClientId = getConfigValue(configs, 'github_client_id');
  const githubClientSecret = getConfigValue(configs, 'github_client_secret');

  if (githubClientId && githubClientSecret) {
    providers.github = {
      clientId: githubClientId,
      clientSecret: githubClientSecret,
    };
  }

  return providers;
}