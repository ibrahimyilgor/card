import { Paper } from "@mui/material";
import { motion } from "framer-motion";
import { forwardRef } from "react";

const MotionPaper = motion.create(Paper);

const StyledCard = forwardRef(
	(
		{
			children,
			variant = "default",
			hover = true,
			padding = 3,
			onClick,
			sx = {},
			...props
		},
		ref
	) => {
		const variants = {
			default: {
				background: (theme) =>
					theme.palette.mode === "dark"
						? "linear-gradient(145deg, rgba(17, 24, 39, 0.9) 0%, rgba(17, 24, 39, 0.7) 100%)"
						: "linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)",
				backdropFilter: "blur(20px)",
				border: (theme) =>
					`1px solid ${
						theme.palette.mode === "dark"
							? "rgba(255, 255, 255, 0.06)"
							: "rgba(0, 0, 0, 0.06)"
					}`,
			},
			elevated: {
				background: (theme) =>
					theme.palette.mode === "dark"
						? "linear-gradient(145deg, #1a1f2e 0%, #111827 100%)"
						: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
				border: (theme) =>
					`1px solid ${
						theme.palette.mode === "dark"
							? "rgba(59, 130, 246, 0.15)"
							: "rgba(59, 130, 246, 0.1)"
					}`,
				boxShadow: (theme) =>
					theme.palette.mode === "dark"
						? "0 8px 32px rgba(0, 0, 0, 0.3)"
						: "0 8px 32px rgba(0, 0, 0, 0.08)",
			},
			outlined: {
				background: "transparent",
				border: (theme) =>
					`1px solid ${
						theme.palette.mode === "dark"
							? "rgba(255, 255, 255, 0.1)"
							: "rgba(0, 0, 0, 0.1)"
					}`,
			},
			glass: {
				background: (theme) =>
					theme.palette.mode === "dark"
						? "rgba(17, 24, 39, 0.6)"
						: "rgba(255, 255, 255, 0.7)",
				backdropFilter: "blur(24px)",
				border: (theme) =>
					`1px solid ${
						theme.palette.mode === "dark"
							? "rgba(255, 255, 255, 0.08)"
							: "rgba(0, 0, 0, 0.05)"
					}`,
			},
		};

		const hoverStyles = hover
			? {
					cursor: onClick ? "pointer" : "default",
					"&:hover": {
						borderColor: (theme) => theme.palette.primary.light,
						boxShadow: (theme) =>
							theme.palette.mode === "dark"
								? "0 12px 40px rgba(59, 130, 246, 0.15)"
								: "0 12px 40px rgba(59, 130, 246, 0.1)",
						transform: "translateY(-2px)",
					},
			  }
			: {};

		return (
			<MotionPaper
				ref={ref}
				elevation={0}
				onClick={onClick}
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -20 }}
				transition={{ duration: 0.3, ease: "easeOut" }}
				whileHover={hover ? { scale: 1.01 } : {}}
				sx={{
					...variants[variant],
					...hoverStyles,
					borderRadius: "16px",
					padding: padding,
					transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
					...sx,
				}}
				{...props}
			>
				{children}
			</MotionPaper>
		);
	}
);

StyledCard.displayName = "StyledCard";

export default StyledCard;
