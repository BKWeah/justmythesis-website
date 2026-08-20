// JUSTmyTHESIS Workspace Theme & Design Tokens
// Based on existing brand colors from the public website

export const theme = {
  // Brand Colors
  colors: {
    brand: {
      green: '#18452F',
      'green-light': '#2a5c45',
      'green-dark': '#0f2d1f',
    },
    gold: {
      DEFAULT: '#C79A2D',
      light: '#d9b44a',
      dark: '#a68425',
    },
    cream: '#FAF7F0',
    white: '#FFFFFF',
    dark: '#222222',
  },

  // Status Colors
  status: {
    success: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      icon: 'text-green-500',
    },
    warning: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: 'text-amber-500',
    },
    error: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      icon: 'text-red-500',
    },
    info: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: 'text-blue-500',
    },
  },

  // Badge Variants
  badge: {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    primary: 'bg-brand-green/10 text-brand-green border-brand-green/20',
    secondary: 'bg-gold/10 text-gold-dark border-gold/20',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
  },

  // Button Variants
  button: {
    primary: {
      base: 'bg-brand-green text-white hover:bg-brand-green-light',
      active: 'active:bg-brand-green-dark',
      disabled: 'disabled:bg-gray-300 disabled:text-gray-500',
    },
    secondary: {
      base: 'bg-white text-brand-green border-2 border-brand-green hover:bg-brand-green/5',
      active: '',
      disabled: 'disabled:border-gray-300 disabled:text-gray-400',
    },
    ghost: {
      base: 'bg-transparent text-brand-green hover:bg-brand-green/5',
      active: '',
      disabled: 'disabled:text-gray-400',
    },
    danger: {
      base: 'bg-red-600 text-white hover:bg-red-700',
      active: '',
      disabled: 'disabled:bg-gray-300 disabled:text-gray-500',
    },
    gold: {
      base: 'bg-gold text-white hover:bg-gold-dark',
      active: '',
      disabled: 'disabled:bg-gray-300 disabled:text-gray-500',
    },
  },

  // Border Radius
  radius: {
    none: 'rounded-none',
    sm: 'rounded-md',
    DEFAULT: 'rounded-lg',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    full: 'rounded-full',
  },

  // Shadows
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

  // Spacing References (common padding/margin values)
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },
} as const;

// Export individual tokens for easy access
export const colors = theme.colors;
export const statusColors = theme.status;
export const badgeVariants = theme.badge;
export const buttonVariants = theme.button;
export const borderRadius = theme.radius;
export const shadows = theme.shadows;
export const spacing = theme.spacing;

// Typography
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    serif: ['Georgia', 'serif'],
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// Animation durations
export const animation = {
  fast: '150ms',
  DEFAULT: '200ms',
  slow: '300ms',
  slower: '500ms',
};

// Z-index scale
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