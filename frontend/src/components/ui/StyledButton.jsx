import { Button, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import { forwardRef } from "react";

const MotionButton = motion.create(Button);

const StyledButton = forwardRef(
	(
		{
			children,
			variant = "primary",
			size = "medium",
			loading = false,
			disabled = false,
			fullWidth = false,
			startIcon,
			endIcon,
			onClick,
			type = "button",
			sx = {},
			...props
		},
		ref
	) => {
		const variants = {
			primary: {
				background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
				color: "#ffffff",
				"&:hover": {
					background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
					boxShadow: "0 4px 20px rgba(59, 130, 246, 0.4)",
				},
			},
			secondary: {
				background: "transparent",
				color: "#3b82f6",
				border: "1px solid rgba(59, 130, 246, 0.5)",
				"&:hover": {
					background: "rgba(59, 130, 246, 0.08)",
					borderColor: "#3b82f6",
				},
			},
			danger: {
				background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
				color: "#ffffff",
				"&:hover": {
					background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
					boxShadow: "0 4px 20px rgba(239, 68, 68, 0.4)",
				},
			},
			success: {
				background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
				color: "#ffffff",
				"&:hover": {
					background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
					boxShadow: "0 4px 20px rgba(34, 197, 94, 0.4)",
				},
			},
			ghost: {
				background: "transparent",
				color: (theme) => theme.palette.text.cardTitle,
				"&:hover": {
					background: "rgba(255, 255, 255, 0.05)",
				},
			},
		};

		const sizes = {
			small: {
				padding: "6px 16px",
				fontSize: "0.813rem",
				minHeight: "32px",
			},
			medium: {
				padding: "10px 24px",
				fontSize: "0.875rem",
				minHeight: "42px",
			},
			large: {
				padding: "14px 32px",
				fontSize: "1rem",
				minHeight: "52px",
			},
		};

		return (
			<MotionButton
				ref={ref}
				type={type}
				onClick={onClick}
				disabled={disabled || loading}
				fullWidth={fullWidth}
				startIcon={loading ? null : startIcon}
				endIcon={loading ? null : endIcon}
				whileHover={{ scale: disabled ? 1 : 1.02 }}
				whileTap={{ scale: disabled ? 1 : 0.98 }}
				transition={{ type: "spring", stiffness: 400, damping: 17 }}
				sx={{
					...variants[variant],
					...sizes[size],
					borderRadius: "12px",
					textTransform: "none",
					fontWeight: 600,
					fontFamily: "Inter, sans-serif",
					letterSpacing: "0.01em",
					boxShadow: "none",
					position: "relative",
					overflow: "hidden",
					transition: "all 0.2s ease",
					"&:disabled": {
						opacity: 0.6,
						cursor: "not-allowed",
					},
					...sx,
				}}
				{...props}
			>
				{loading ? (
					<CircularProgress size={20} sx={{ color: "inherit" }} />
				) : (
					children
				)}
			</MotionButton>
		);
	}
);

StyledButton.displayName = "StyledButton";

export default StyledButton;
