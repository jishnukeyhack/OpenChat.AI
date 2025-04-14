import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(0, 0%, 100%)',  /* White */
  			foreground: 'hsl(200, 14%, 18%)', /* Dark Grey */
  			card: {
  				DEFAULT: 'hsl(0, 0%, 100%)',
  				foreground: 'hsl(200, 14%, 18%)'
  			},
  			popover: {
  				DEFAULT: 'hsl(0, 0%, 100%)',
  				foreground: 'hsl(200, 14%, 18%)'
  			},
  			primary: {
  				DEFAULT: 'hsl(220, 13%, 44%)', /* Grey */
  				foreground: 'hsl(0, 0%, 100%)'  /* White */
  			},
  			secondary: {
  				DEFAULT: 'hsl(220, 14%, 96%)', /* Light Grey */
  				foreground: 'hsl(200, 14%, 18%)'
  			},
  			muted: {
  				DEFAULT: 'hsl(220, 20%, 94%)',
  				foreground: 'hsl(200, 13%, 44%)'
  			},
  			accent: {
  				DEFAULT: 'hsl(210, 20%, 90%)',
  				foreground: 'hsl(200, 14%, 18%)'
  			},
  			destructive: {
  				DEFAULT: 'hsl(0, 70%, 50%)',
  				foreground: 'hsl(0, 0%, 100%)'
  			},
  			border: 'hsl(220, 20%, 80%)',
  			input: 'hsl(220, 20%, 70%)',
  			ring: 'hsl(220, 13%, 44%)',
  			chart: {
  				'1': 'hsl(204, 100%, 67%)',
  				'2': 'hsl(48, 100%, 59%)',
  				'3': 'hsl(314, 57%, 66%)',
  				'4': 'hsl(348, 83%, 47%)',
  				'5': 'hsl(153, 73%, 56%)'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(0, 0%, 98%)',
  				foreground: 'hsl(200, 14%, 18%)',
  				primary: 'hsl(220, 13%, 44%)',
  				'primary-foreground': 'hsl(0, 0%, 100%)',
  				accent: 'hsl(220, 20%, 94%)',
  				'accent-foreground': 'hsl(200, 14%, 18%)',
  				border: 'hsl(220, 20%, 75%)',
  				ring: 'hsl(220, 13%, 44%)'
  			}
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
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
