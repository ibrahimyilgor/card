import { createTheme } from "@mui/material/styles";

// Animation tokens for consistent motion design
export const animations = {
	duration: {
		instant: 0.1,
		fast: 0.2,
		normal: 0.3,
		slow: 0.5,
		slower: 0.8,
	},
	easing: {
		easeOut: [0.0, 0.0, 0.2, 1],
		easeIn: [0.4, 0.0, 1, 1],
		easeInOut: [0.4, 0.0, 0.2, 1],
		spring: { type: "spring", stiffness: 300, damping: 25 },
	},
};

// Chart.js color palette that integrates with theme
export const chartColors = {
	dark: {
		primary: "#3b82f6",
		secondary: "#8b5cf6",
		success: "#22c55e",
		warning: "#f59e0b",
		error: "#ef4444",
		info: "#06b6d4",
		gradient: {
			primary: ["rgba(59, 130, 246, 0.8)", "rgba(59, 130, 246, 0.1)"],
			secondary: ["rgba(139, 92, 246, 0.8)", "rgba(139, 92, 246, 0.1)"],
			success: ["rgba(34, 197, 94, 0.8)", "rgba(34, 197, 94, 0.1)"],
		},
		grid: "rgba(255, 255, 255, 0.06)",
		text: "#94a3b8",
		background: "transparent",
	},
	light: {
		primary: "#2563eb",
		secondary: "#7c3aed",
		success: "#16a34a",
		warning: "#d97706",
		error: "#dc2626",
		info: "#0891b2",
		gradient: {
			primary: ["rgba(37, 99, 235, 0.8)", "rgba(37, 99, 235, 0.1)"],
			secondary: ["rgba(124, 58, 237, 0.8)", "rgba(124, 58, 237, 0.1)"],
			success: ["rgba(22, 163, 74, 0.8)", "rgba(22, 163, 74, 0.1)"],
		},
		grid: "rgba(0, 0, 0, 0.06)",
		text: "#64748b",
		background: "transparent",
	},
};

// Common component overrides
const getComponentOverrides = (mode) => ({
	MuiButton: {
		styleOverrides: {
			root: {
				borderRadius: 12,
				textTransform: "none",
				fontWeight: 600,
				fontFamily: "Inter, sans-serif",
				boxShadow: "none",
				"&:hover": {
					boxShadow: "none",
				},
			},
		},
	},
	MuiPaper: {
		styleOverrides: {
			root: {
				backgroundImage: "none",
				borderRadius: 16,
			},
		},
	},
	MuiCard: {
		styleOverrides: {
			root: {
				borderRadius: 16,
				backgroundImage: "none",
			},
		},
	},
	MuiTextField: {
		styleOverrides: {
			root: {
				"& .MuiOutlinedInput-root": {
					borderRadius: 12,
				},
			},
		},
	},
	MuiDialog: {
		styleOverrides: {
			paper: {
				borderRadius: 20,
				backgroundImage: "none",
			},
		},
	},
	MuiModal: {
		styleOverrides: {
			root: {
				"& .MuiBackdrop-root": {
					backgroundColor: "rgba(0, 0, 0, 0.7)",
					backdropFilter: "blur(8px)",
				},
			},
		},
	},
	MuiIconButton: {
		styleOverrides: {
			root: {
				borderRadius: 12,
				transition: "all 0.2s ease",
			},
		},
	},
	MuiTooltip: {
		styleOverrides: {
			tooltip: {
				borderRadius: 8,
				fontFamily: "Inter, sans-serif",
				fontSize: "0.75rem",
				backgroundColor: mode === "dark" ? "#1f2937" : "#1e293b",
				color: "#f1f5f9",
				padding: "8px 12px",
			},
		},
	},
	MuiChip: {
		styleOverrides: {
			root: {
				borderRadius: 8,
				fontFamily: "Inter, sans-serif",
				fontWeight: 500,
			},
		},
	},
	MuiSelect: {
		styleOverrides: {
			root: {
				borderRadius: 12,
			},
		},
	},
	MuiMenu: {
		styleOverrides: {
			paper: {
				borderRadius: 12,
				marginTop: 8,
				border:
					mode === "dark"
						? "1px solid rgba(255, 255, 255, 0.08)"
						: "1px solid rgba(0, 0, 0, 0.08)",
			},
		},
	},
	MuiMenuItem: {
		styleOverrides: {
			root: {
				borderRadius: 8,
				margin: "2px 8px",
				padding: "10px 12px",
				fontFamily: "Inter, sans-serif",
			},
		},
	},
	MuiLinearProgress: {
		styleOverrides: {
			root: {
				borderRadius: 4,
				height: 8,
			},
		},
	},
	MuiCircularProgress: {
		styleOverrides: {
			root: {
				strokeLinecap: "round",
			},
		},
	},
});

const theme = {
	common: {
		typography: {
			fontFamily: "Inter, Roboto, Arial, sans-serif",
			fontWeightBold: 700,
			fontWeightMedium: 600,
			fontWeightRegular: 400,
			h1: {
				fontWeight: 700,
				letterSpacing: "-0.02em",
			},
			h2: {
				fontWeight: 700,
				letterSpacing: "-0.01em",
			},
			h3: {
				fontWeight: 600,
				letterSpacing: "-0.01em",
			},
			h4: {
				fontWeight: 600,
			},
			h5: {
				fontWeight: 600,
			},
			h6: {
				fontWeight: 600,
			},
			button: {
				fontWeight: 600,
				textTransform: "none",
			},
		},
		shape: {
			borderRadius: 12,
		},
	},
	dark: {
		palette: {
			mode: "dark",
			primary: {
				main: "#3b82f6",
				light: "#60a5fa",
				dark: "#1e40af",
				contrastText: "#ffffff",
			},
			secondary: {
				main: "#8b5cf6",
				light: "#a78bfa",
				dark: "#6d28d9",
				contrastText: "#ffffff",
			},
			success: {
				main: "#22c55e",
				light: "#4ade80",
				dark: "#16a34a",
			},
			warning: {
				main: "#f59e0b",
				light: "#fbbf24",
				dark: "#d97706",
			},
			error: {
				main: "#ef4444",
				light: "#f87171",
				dark: "#dc2626",
			},
			background: {
				default: "#0a0e14",
				paper: "#111827",
				elevated: "#1a1f2e",
				card: "#151b28",
				gradient: "linear-gradient(135deg, #0a0e14 0%, #1a1f2e 100%)",
			},
			text: {
				primary: "#f1f5f9",
				secondary: "#94a3b8",
				cardTitle: "#f1f5f9",
				cardSubtitle: "#94a3b8",
				disabled: "#475569",
			},
			divider: "rgba(255, 255, 255, 0.08)",
			border: {
				main: "rgba(255, 255, 255, 0.08)",
				light: "rgba(255, 255, 255, 0.04)",
				focus: "rgba(59, 130, 246, 0.5)",
			},
			action: {
				active: "#60a5fa",
				hover: "rgba(59, 130, 246, 0.08)",
				selected: "rgba(59, 130, 246, 0.16)",
				disabled: "rgba(255, 255, 255, 0.3)",
				disabledBackground: "rgba(255, 255, 255, 0.12)",
				edit: "#60a5fa",
				play: "#3b82f6",
				delete: "#ef4444",
				icon: "#94a3b8",
			},
			chart: chartColors.dark,
		},
		shadows: [
			"none",
			"0 1px 2px rgba(0, 0, 0, 0.3)",
			"0 2px 4px rgba(0, 0, 0, 0.3)",
			"0 4px 8px rgba(0, 0, 0, 0.3)",
			"0 8px 16px rgba(0, 0, 0, 0.3)",
			"0 12px 24px rgba(0, 0, 0, 0.35)",
			"0 16px 32px rgba(0, 0, 0, 0.35)",
			"0 20px 40px rgba(0, 0, 0, 0.4)",
			"0 24px 48px rgba(0, 0, 0, 0.4)",
			...Array(16).fill("0 24px 48px rgba(0, 0, 0, 0.4)"),
		],
		components: getComponentOverrides("dark"),
	},
	light: {
		palette: {
			mode: "light",
			primary: {
				main: "#2563eb",
				light: "#3b82f6",
				dark: "#1e40af",
				contrastText: "#ffffff",
			},
			secondary: {
				main: "#7c3aed",
				light: "#8b5cf6",
				dark: "#6d28d9",
				contrastText: "#ffffff",
			},
			success: {
				main: "#16a34a",
				light: "#22c55e",
				dark: "#15803d",
			},
			warning: {
				main: "#d97706",
				light: "#f59e0b",
				dark: "#b45309",
			},
			error: {
				main: "#dc2626",
				light: "#ef4444",
				dark: "#b91c1c",
			},
			background: {
				default: "#f8fafc",
				paper: "#ffffff",
				elevated: "#ffffff",
				card: "#ffffff",
				gradient: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
			},
			text: {
				primary: "#0f172a",
				secondary: "#64748b",
				cardTitle: "#1e293b",
				cardSubtitle: "#64748b",
				disabled: "#94a3b8",
			},
			divider: "rgba(0, 0, 0, 0.08)",
			border: {
				main: "rgba(0, 0, 0, 0.08)",
				light: "rgba(0, 0, 0, 0.04)",
				focus: "rgba(37, 99, 235, 0.5)",
			},
			action: {
				active: "#2563eb",
				hover: "rgba(37, 99, 235, 0.06)",
				selected: "rgba(37, 99, 235, 0.1)",
				disabled: "rgba(0, 0, 0, 0.26)",
				disabledBackground: "rgba(0, 0, 0, 0.12)",
				edit: "#2563eb",
				play: "#2563eb",
				delete: "#dc2626",
				icon: "#64748b",
			},
			chart: chartColors.light,
		},
		shadows: [
			"none",
			"0 1px 2px rgba(0, 0, 0, 0.05)",
			"0 2px 4px rgba(0, 0, 0, 0.05)",
			"0 4px 8px rgba(0, 0, 0, 0.05)",
			"0 8px 16px rgba(0, 0, 0, 0.08)",
			"0 12px 24px rgba(0, 0, 0, 0.08)",
			"0 16px 32px rgba(0, 0, 0, 0.1)",
			"0 20px 40px rgba(0, 0, 0, 0.1)",
			"0 24px 48px rgba(0, 0, 0, 0.12)",
			...Array(16).fill("0 24px 48px rgba(0, 0, 0, 0.12)"),
		],
		components: getComponentOverrides("light"),
	},
};

const createCustomTheme = (mode) => {
	return createTheme({
		...theme.common,
		...theme[mode],
	});
};

export const darkTheme = createCustomTheme("dark");
export const lightTheme = createCustomTheme("light");
