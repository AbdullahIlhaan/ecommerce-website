export interface SocialAuthProvider {
  key: "google" | "facebook";
  label: string;
  redirectUrl: string;
}

export interface SocialAuthState {
  enabled: boolean;
  providers: SocialAuthProvider[];
}
