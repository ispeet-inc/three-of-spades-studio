import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
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
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
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
				
				/* Premium Casino Colors */
				'felt-green': {
					DEFAULT: 'hsl(var(--felt-green))',
					light: 'hsl(var(--felt-green-light))',
					dark: 'hsl(var(--felt-green-dark))'
				},
				gold: {
					DEFAULT: 'hsl(var(--gold))',
					light: 'hsl(var(--gold-light))',
					dark: 'hsl(var(--gold-dark))'
				},
				'casino-red': 'hsl(var(--casino-red))',
				'casino-black': 'hsl(var(--casino-black))',
				'casino-white': 'hsl(var(--casino-white))',
				
				/* Enhanced Card Colors */
				'card-bg': 'hsl(var(--card-bg))',
				'card-border': 'hsl(var(--card-border))',
				'card-shine': 'hsl(var(--card-shine))',
				'card-red': 'hsl(var(--card-red))',
				'card-black': 'hsl(var(--card-black))',
				
				/* Table Elements */
				'table-felt': 'hsl(var(--table-felt))',
				'table-accent': 'hsl(var(--table-accent))',
				'table-shadow': 'hsl(var(--table-shadow))'
			},
			
			fontFamily: {
				'casino': ['var(--font-casino)'],
				'ui': ['var(--font-ui)'],
				sans: ['Inter', 'system-ui', 'sans-serif'],
				serif: ['Playfair Display', 'serif']
			},
			
			spacing: {
				'xs': 'var(--space-xs)',
				'sm': 'var(--space-sm)', 
				'md': 'var(--space-md)',
				'lg': 'var(--space-lg)',
				'xl': 'var(--space-xl)',
				'2xl': 'var(--space-2xl)',
				'3xl': 'var(--space-3xl)'
			},
			
			zIndex: {
				'base': 'var(--z-base)',
				'cards': 'var(--z-cards)',
				'ui': 'var(--z-ui)',
				'modals': 'var(--z-modals)'
			},
			backgroundImage: {
				'gradient-felt': 'var(--gradient-felt)',
				'gradient-gold': 'var(--gradient-gold)',
				'gradient-card': 'var(--gradient-card)',
				'gradient-table': 'var(--gradient-table)'
			},
			boxShadow: {
				'card': 'var(--shadow-card)',
				'elevated': 'var(--shadow-elevated)',
				'glow': 'var(--shadow-glow)',
				'table': 'var(--shadow-table)'
			},
			
			transitionDuration: {
				'fast': 'var(--duration-fast)',
				'normal': 'var(--duration-normal)',
				'slow': 'var(--duration-slow)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'card-flip': {
					'0%': { transform: 'rotateY(0deg)' },
					'50%': { transform: 'rotateY(90deg)' },
					'100%': { transform: 'rotateY(0deg)' }
				},
				'card-deal': {
					'0%': { 
						transform: 'translateX(-100px) translateY(-50px) rotate(-15deg)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateX(0) translateY(0) rotate(0deg)',
						opacity: '1'
					}
				},
				'glow-pulse': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.6' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-6px)' }
				},
				// New Phase 5 animations
				"deal-to-bottom": {
					"0%": { 
						transform: "translate(0, -50vh) scale(0.8) rotate(0deg)",
						opacity: "0"
					},
					"50%": { 
						transform: "translate(0, -25vh) scale(0.9) rotate(180deg)",
						opacity: "0.7"
					},
					"100%": { 
						transform: "translate(0, 0) scale(1) rotate(0deg)",
						opacity: "1"
					},
				},
				"deal-to-left": {
					"0%": { 
						transform: "translate(50vw, -25vh) scale(0.8) rotate(0deg)",
						opacity: "0"
					},
					"50%": { 
						transform: "translate(25vw, -12.5vh) scale(0.9) rotate(-90deg)",
						opacity: "0.7"
					},
					"100%": { 
						transform: "translate(0, 0) scale(1) rotate(0deg)",
						opacity: "1"
					},
				},
				"deal-to-top": {
					"0%": { 
						transform: "translate(0, 50vh) scale(0.8) rotate(0deg)",
						opacity: "0"
					},
					"50%": { 
						transform: "translate(0, 25vh) scale(0.9) rotate(180deg)",
						opacity: "0.7"
					},
					"100%": { 
						transform: "translate(0, 0) scale(1) rotate(0deg)",
						opacity: "1"
					},
				},
				"deal-to-right": {
					"0%": { 
						transform: "translate(-50vw, -25vh) scale(0.8) rotate(0deg)",
						opacity: "0"
					},
					"50%": { 
						transform: "translate(-25vw, -12.5vh) scale(0.9) rotate(90deg)",
						opacity: "0.7"
					},
					"100%": { 
						transform: "translate(0, 0) scale(1) rotate(0deg)",
						opacity: "1"
					},
				},
				"collect-to-center": {
					"0%": { 
						transform: "translate(0, 0) scale(1) rotate(0deg)",
						opacity: "1"
					},
					"100%": { 
						transform: "translate(var(--center-x, 0), var(--center-y, 0)) scale(0.3) rotate(360deg)",
						opacity: "0"
					},
				},
				"turn-indicator": {
					"0%, 100%": { 
						borderColor: "rgba(212, 175, 55, 0.3)",
						boxShadow: "0 0 0 0 rgba(212, 175, 55, 0.7)"
					},
					"50%": { 
						borderColor: "rgba(212, 175, 55, 1)",
						boxShadow: "0 0 0 4px rgba(212, 175, 55, 0.3)"
					},
				},
				"score-update": {
					"0%": { transform: "scale(1)", color: "inherit" },
					"50%": { transform: "scale(1.2)", color: "hsl(var(--gold))" },
					"100%": { transform: "scale(1)", color: "inherit" },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'card-flip': 'card-flip 0.6s ease-in-out',
				'card-deal': 'card-deal 0.5s ease-out',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
				'float': 'float 3s ease-in-out infinite',
				// New Phase 5 animations
				"deal-to-bottom": "deal-to-bottom 0.8s ease-out forwards",
				"deal-to-left": "deal-to-left 0.8s ease-out forwards", 
				"deal-to-top": "deal-to-top 0.8s ease-out forwards",
				"deal-to-right": "deal-to-right 0.8s ease-out forwards",
				"collect-to-center": "collect-to-center 0.6s ease-in forwards",
				"turn-indicator": "turn-indicator 1.5s ease-in-out infinite",
				"score-update": "score-update 0.5s ease-out",
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
