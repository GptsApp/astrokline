type BuildSignUpEmailPayloadParams = {
  email: string;
  password: string;
  name: string;
  emailVerificationEnabled: boolean;
  verificationCallbackUrl: string;
};

export function buildSignUpEmailPayload({
  email,
  password,
  name,
  emailVerificationEnabled,
  verificationCallbackUrl,
}: BuildSignUpEmailPayloadParams) {
  const payload = {
    email,
    password,
    name,
  };

  if (!emailVerificationEnabled) {
    return payload;
  }

  return {
    ...payload,
    callbackURL: verificationCallbackUrl,
  };
}