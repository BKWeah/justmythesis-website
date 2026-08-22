// JUSTmyTHESIS Workspace Theme & Design Tokens
// Product-neutral UI framework adapted to JUSTmyTHESIS brand identity.

export const theme = {
  colors: {
    brand: {
      green: '#18452F',
      'green-light': '#2A5C45',
      'green-dark': '#0F2D1F',
      'green-soft': '#EAF1ED',
      'green-muted': '#D9E6DE',
    },
    gold: {
      DEFAULT: '#C79A2D',
      light: '#D9B44A',
      dark: '#9B761D',
      soft: '#FBF6E8',
      muted: '#F1E4BC',
    },
    neutral: {
      page: '#F7F8F7',
      subtle: '#F2F4F2',
      muted: '#E9EDEA',
      border: '#D6DDD8',
      text: '#171A18',
      secondary: '#5D625F',
    },
    cream: '#FAF7F0',
    white: '#FFFFFF',
    dark: '#222222',
  },

  status: {
    success: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: 'text-green-500' },
    warning: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: 'text-amber-500' },
    error: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: 'text-red-500' },
    info: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'text-blue-500' },
  },

  badge: {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    primary: 'bg-brand-green/10 text-brand-green border-brand-green/20',
    secondary: 'bg-gold/10 text-gold-dark border-gold/20',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
  },

  // Button hierarchy: primary action, secondary action, quiet/tertiary action,
  // destructive action, and limited-use gold emphasis.
  button: {
    primary: {
      base: 'bg-brand-green text-white border border-brand-green shadow-sm hover:bg-brand-green-light hover:border-brand-green-light hover:shadow-md',
      active: 'active:bg-brand-green-dark active:border-brand-green-dark active:shadow-sm',
      disabled: 'disabled:bg-gray-200 disabled:border-gray-200 disabled:text-gray-400 disabled:shadow-none',
    },
    secondary: {
      base: 'bg-white text-brand-green border border-gray-300 shadow-sm hover:bg-[#F7F9F8] hover:border-brand-green/40',
      active: 'active:bg-brand-green/5',
      disabled: 'disabled:border-gray-200 disabled:text-gray-400 disabled:bg-gray-50 disabled:shadow-none',
    },
    ghost: {
      base: 'bg-transparent text-gray-700 border border-transparent hover:bg-gray-100 hover:text-brand-green',
      active: 'active:bg-gray-200/70',
      disabled: 'disabled:text-gray-400 disabled:bg-transparent',
    },
    danger: {
      base: 'bg-red-600 text-white border border-red-600 shadow-sm hover:bg-red-700 hover:border-red-700',
      active: 'active:bg-red-800',
      disabled: 'disabled:bg-gray-200 disabled:border-gray-200 disabled:text-gray-400 disabled:shadow-none',
    },
    gold: {
      base: 'bg-gold text-[#2B2415] border border-gold shadow-sm hover:bg-gold-light hover:border-gold-light',
      active: 'active:bg-gold-dark active:text-white',
      disabled: 'disabled:bg-gray-200 disabled:border-gray-200 disabled:text-gray-400 disabled:shadow-none',
    },
  },

  radius: {
    none: 'rounded-none',
    sm: 'rounded-md',
    DEFAULT: 'rounded-lg',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    full: 'rounded-full',
  },

  shadows: {
    sm: 'shadow-sm',
    DEFAULT: 'shadow-md',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
    inner: 'shadow-inner',
    none: 'shadow-none',
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
} as const;

export const colors = theme.colors;
export const statusColors = theme.status;
export const badgeVariants = theme.badge;
export const buttonVariants = theme.button;
export const borderRadius = theme.radius;
export const shadows = theme.shadows;
export const spacing = theme.spacing;

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    serif: ['Georgia', 'serif'],
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const animation = {
  fast: '150ms',
  DEFAULT: '200ms',
  slow: '300ms',
  slower: '500ms',
};

export const zIndex = {
  dropdown: 'z-10',
  sticky: 'z-20',
  fixed: 'z-30',
  modalBackdrop: 'z-40',
  modal: 'z-50',
  popover: 'z-50',
  tooltip: 'z-60',
};

export type ButtonVariant = keyof typeof buttonVariants;
export type BadgeVariant = keyof typeof badgeVariants;
export type StatusType = keyof typeof statusColors;
