/**
 * SmartRoute - Central Framer Motion Animation Variants
 * Consistent motion system:
 * - Fast: 150-200ms
 * - Standard: 250-350ms
 * - Emphasis: 400-600ms
 */

export const transitions = {
  fast: { duration: 0.18, ease: [0.25, 0.1, 0.25, 1.0] },
  standard: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
  emphasis: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  spring: { type: "spring", stiffness: 350, damping: 25 },
  gentleSpring: { type: "spring", stiffness: 220, damping: 20 }
};

// Page Transition
export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: transitions.standard 
  },
  exit: { 
    opacity: 0, 
    y: -8, 
    transition: transitions.fast 
  }
};

// Staggered Container
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05
    }
  }
};

// Stagger Item (Cards, List rows)
export const staggerItem = {
  initial: { opacity: 0, y: 14 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: transitions.standard 
  }
};

// Card Hover
export const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: { 
    scale: 1.015, 
    y: -3, 
    transition: transitions.fast 
  }
};

// Modal Backdrop & Content
export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: transitions.fast },
  exit: { opacity: 0, transition: transitions.fast }
};

export const modalContent = {
  initial: { opacity: 0, scale: 0.94, y: 16 },
  animate: { opacity: 1, scale: 1, y: 0, transition: transitions.standard },
  exit: { opacity: 0, scale: 0.94, y: 16, transition: transitions.fast }
};

// Toast Notifications
export const notificationVariants = {
  initial: { opacity: 0, x: 50, scale: 0.95 },
  animate: { opacity: 1, x: 0, scale: 1, transition: transitions.gentleSpring },
  exit: { opacity: 0, x: 40, scale: 0.9, transition: transitions.fast }
};

// Badge Pulse for Live updates
export const pulseVariant = {
  animate: {
    scale: [1, 1.15, 1],
    opacity: [1, 0.7, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Route Change Highlight
export const routeChangeVariant = {
  initial: { scale: 0.98, opacity: 0.8 },
  animate: { 
    scale: [0.98, 1.02, 1], 
    opacity: 1,
    transition: transitions.emphasis 
  }
};

// Drawer Slide (Notification drawer, Settings drawer)
export const drawerVariants = {
  closed: { x: "100%", transition: transitions.standard },
  open: { x: 0, transition: transitions.standard }
};
