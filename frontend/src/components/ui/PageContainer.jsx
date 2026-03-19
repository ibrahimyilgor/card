import { Box } from "@mui/material";
import { motion } from "framer-motion";

const MotionBox = motion.create(Box);

const PageContainer = ({
	children,
	maxWidth = "1400px",
	padding = { xs: 2, sm: 3, md: 4 },
	centered = false,
	sx = {},
	animate = true,
	...props
}) => {
	// Note: opacity animation is handled by AnimatedPage in App.jsx
	// This container only handles staggerChildren for child elements
	const containerVariants = {
		hidden: {},
		visible: {
			transition: {
				staggerChildren: 0.1,
			},
		},
		exit: {},
	};

	const content = (
		<Box
			sx={{
				width: "100%",
				maxWidth: maxWidth,
				margin: "0 auto",
				padding: padding,
				minHeight: "100%",
				boxSizing: "border-box",
				display: centered ? "flex" : "block",
				flexDirection: centered ? "column" : undefined,
				alignItems: centered ? "center" : undefined,
				justifyContent: centered ? "center" : undefined,
				overflow: "hidden", // Prevent scroll during animations
				...sx,
			}}
			{...props}
		>
			{children}
		</Box>
	);

	if (!animate) return content;

	return (
		<MotionBox
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			exit="exit"
			sx={{
				width: "100%",
				maxWidth: maxWidth,
				margin: "0 auto",
				padding: padding,
				minHeight: "100%",
				boxSizing: "border-box",
				display: centered ? "flex" : "block",
				flexDirection: centered ? "column" : undefined,
				alignItems: centered ? "center" : undefined,
				justifyContent: centered ? "center" : undefined,
				overflow: "hidden", // Prevent scroll during animations
				...sx,
			}}
			{...props}
		>
			{children}
		</MotionBox>
	);
};

export default PageContainer;

// Child animation wrapper for staggered animations
// Note: Does not animate opacity to avoid double-fade with parent AnimatedPage
export const AnimatedItem = ({ children, delay = 0, sx = {}, ...props }) => {
	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.4,
				ease: "easeOut",
				delay,
			},
		},
	};

	return (
		<MotionBox variants={itemVariants} sx={sx} {...props}>
			{children}
		</MotionBox>
	);
};
