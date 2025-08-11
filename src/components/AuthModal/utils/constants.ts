// Form validation constants
export const VALIDATION_RULES = {
  EMAIL_REGEX: /\S+@\S+\.\S+/,
  MIN_PASSWORD_LENGTH: 6,
  MAX_NAME_LENGTH: 50,
  MAX_EMAIL_LENGTH: 254,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  // Form validation errors
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  NAME_TOO_LONG: 'Name must be less than 50 characters',
  EMAIL_TOO_LONG: 'Email must be less than 254 characters',
  INVALID_USERNAME: 'Username must be at least 3 characters and contain only letters, numbers, and underscores',
  
  // Authentication errors
  EMAIL_NOT_CONFIRMED: 'Please check your email and click the verification link to activate your account',
  INVALID_CREDENTIALS: 'The email address you entered is not associated with an account',
  USER_NOT_FOUND: 'Account not found. Please sign up first',
  USER_ALREADY_EXISTS: 'An account with this email already exists. Please sign in instead',
  EMAIL_ALREADY_REGISTERED: 'This email is already registered. Please sign in or use a different email',
  INVALID_OTP: 'The verification code you entered is incorrect. Please check your email and try again',
  EXPIRED_OTP: 'Your verification code has expired. Please request a new one',
  TOO_MANY_REQUESTS: 'Too many attempts. Please wait a few minutes before trying again',
  
  // Network and service errors
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection and try again',
  SERVICE_UNAVAILABLE: 'Our service is temporarily unavailable. Please try again in a few minutes',
  SUPABASE_NOT_CONNECTED: 'Authentication service is not available. Please try again later',
  
  // Generic fallback errors
  UNEXPECTED_ERROR: 'Something went wrong. Please try again or contact support if the problem continues',
  SIGNUP_FAILED: 'Failed to create your account. Please try again or contact support',
  SIGNIN_FAILED: 'Failed to sign in. Please check your email and try again',
  OTP_SEND_FAILED: 'Failed to send verification code. Please try again',
  OTP_VERIFY_FAILED: 'Failed to verify your code. Please try again',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  WELCOME: 'Welcome to The Bullish Brief! Your personalized feed is ready.',
  SIGN_IN_SUCCESS: 'Successfully signed in',
  SIGN_UP_SUCCESS: 'Account created successfully',
} as const;

// Component dimensions and spacing
export const COMPONENT_SIZES = {
  MODAL_MAX_WIDTH_SIGNIN: '480px',
  MODAL_MAX_WIDTH_SIGNUP: '700px',
  INPUT_HEIGHT: '56px',
  BUTTON_HEIGHT: '56px',
  LOGO_SIZE_SIGNIN: '64px',
  LOGO_SIZE_SIGNUP: '80px',
} as const;

// Animation durations
export const ANIMATIONS = {
  TRANSITION_DURATION: '200ms',
  TRANSITION_TIMING: 'ease',
} as const;

// Feature list for signup branding
export const SIGNUP_FEATURES = [
  'Unconventional market insights',
  'AI-powered investment intelligence',
  'Real-time sentiment analysis',
  'Premium research & analysis',
] as const;

// Social proof data
export const SOCIAL_PROOF = {
  TRUSTED_INVESTORS: '50,000+',
  STAR_RATING: 5,
} as const;

// Font imports
export const FONT_URLS = {
  CRIMSON_TEXT: 'https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Playfair+Display:wght@400;700;900&display=swap',
} as const; 