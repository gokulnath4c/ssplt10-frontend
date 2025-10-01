import type { Config } from "tailwindcss";

export default {
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
		"./src/pages/**/*.{js,ts,jsx,tsx}",
		"./src/components/**/*.{js,ts,jsx,tsx}",
		"./src/hooks/**/*.{js,ts,jsx,tsx}",
		"./src/lib/**/*.{js,ts,jsx,tsx}",
		"./src/types/**/*.{js,ts,jsx,tsx}",
		"./src/utils/**/*.{js,ts,jsx,tsx}",
	],
	safelist: [
		// Optimized safelist - only essential dynamic classes for faster processing
		"bg-cricket-blue",
		"text-cricket-blue",
		"animate-fade-in",
		"animate-pulse-glow",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		screens: {
			'xs': '475px',
			'sm': '640px',
			'md': '768px',
			'lg': '1024px',
			'xl': '1280px',
			'2xl': '1536px',
			'3xl': '1920px',
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				cricket: {
					blue: 'hsl(var(--cricket-blue))',
					'light-blue': 'hsl(var(--cricket-light-blue))',
					'dark-blue': 'hsl(var(--cricket-dark-blue))',
					'electric-blue': 'hsl(var(--cricket-electric-blue))',
					green: 'hsl(var(--cricket-green))',
					orange: 'hsl(var(--cricket-orange))',
					gold: 'hsl(var(--cricket-gold))',
					mint: 'hsl(var(--cricket-mint))',
					lavender: 'hsl(var(--cricket-lavender))',
					white: 'hsl(var(--cricket-white))',
					gray: 'hsl(var(--cricket-gray))',
					charcoal: 'hsl(var(--cricket-charcoal))',
					red: 'hsl(var(--cricket-red))',
					purple: 'hsl(var(--cricket-purple))',
					teal: 'hsl(var(--cricket-teal))'
				}
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-accent': 'var(--gradient-accent)',
				'gradient-hero': 'var(--gradient-hero)'
			},
			boxShadow: {
				'elegant': 'var(--shadow-elegant)',
				'glow': 'var(--shadow-glow)',
				'card': 'var(--shadow-card)'
			},
			transitionProperty: {
				'smooth': 'var(--transition-smooth)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0', opacity: '0' },
					to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
					to: { height: '0', opacity: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-out': {
					'0%': { opacity: '1', transform: 'translateY(0)' },
					'100%': { opacity: '0', transform: 'translateY(10px)' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'scale-out': {
					from: { transform: 'scale(1)', opacity: '1' },
					to: { transform: 'scale(0.95)', opacity: '0' }
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'slide-out-right': {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'pulse-glow': {
					'0%, 100%': { boxShadow: '0 0 5px #C1E303' },
					'50%': { boxShadow: '0 0 20px #C1E303, 0 0 30px #C1E303' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'scale-out': 'scale-out 0.2s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'slide-out-right': 'slide-out-right 0.3s ease-out',
      'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      'enter': 'fade-in 0.3s ease-out, scale-in 0.2s ease-out',
      'exit': 'fade-out 0.3s ease-out, scale-out 0.2s ease-out',
      'marquee': 'marquee var(--marquee-duration) linear infinite',
      'cricket-bounce': 'cricket-bounce 1.5s ease-in-out infinite',
      'stadium-wave': 'stadium-wave 2s ease-in-out infinite',
      'score-flash': 'score-flash 0.5s ease-out',
      'wickets-fall': 'wickets-fall 0.8s ease-out',
      'ball-spin': 'ball-spin 2s linear infinite',
      'trophy-shine': 'trophy-shine 3s ease-in-out infinite',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
	fontFamily: {
		'sans': ['Inter', 'system-ui', 'sans-serif'],
		'display': ['Poppins', 'system-ui', 'sans-serif'],
	},
	// Performance optimizations
	corePlugins: {
		// Disable unused core plugins to reduce bundle size
		fontVariantNumeric: false,
		touchAction: false,
		scrollSnapType: false,
		borderOpacity: false,
		textOpacity: false,
		backgroundOpacity: false,
	},
	// Enable JIT mode for better performance
	mode: 'jit',
} satisfies Config;
