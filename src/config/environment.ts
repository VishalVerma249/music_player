export const ENVIRONMENT = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Aura Cinematic Music Experience',
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
  defaultProvider: process.env.NEXT_PUBLIC_DEFAULT_PROVIDER || 'custom',
  enableAudioVisuals: process.env.NEXT_PUBLIC_ENABLE_AUDIO_REACTIVE_VISUALS !== 'false',
  isProduction: process.env.NODE_ENV === 'production',
};
