import { useContext, useRef } from "react";
import { Box, Typography, alpha, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { I18nContext } from "../../utils/i18n";

const MotionBox = motion.create(Box);

const optionLabels = ["A", "B", "C", "D"];

export default function MultipleChoice({
	options = [],
	onSelect,
	disabled = false,
	showResult = false,
	selectedIndex = null,
}) {
	const theme = useTheme();
	const { t } = useContext(I18nContext);
	const isDark = theme.palette.mode === "dark";

	// Track pointer state per option so we only confirm selection on pointerup inside
	const pointerState = useRef({});

	const handlePointerDown = (e, index) => {
		if (disabled || showResult) return;
		pointerState.current[index] = { inside: true, active: true };
		try {
			e.currentTarget.setPointerCapture?.(e.pointerId);
		} catch (err) {}
	};

	const handlePointerMove = (e, index) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const inside =
			e.clientX >= rect.left &&
			e.clientX <= rect.right &&
			e.clientY >= rect.top &&
			e.clientY <= rect.bottom;
		pointerState.current[index] = {
			...(pointerState.current[index] || {}),
			inside,
		};
	};

	const handlePointerUp = (e, index) => {
		const state = pointerState.current[index];
		if (state && state.inside && state.active && !disabled && !showResult) {
			onSelect(index, options[index].isCorrect);
		}
		try {
			e.currentTarget.releasePointerCapture?.(e.pointerId);
		} catch (err) {}
		pointerState.current[index] = { inside: false, active: false };
	};

	const handlePointerCancel = (e, index) => {
		pointerState.current[index] = { inside: false, active: false };
		try {
			e.currentTarget.releasePointerCapture?.(e.pointerId);
		} catch (err) {}
	};

	const handlePointerLeave = (e, index) => {
		// mark as outside when the pointer leaves the element
		pointerState.current[index] = {
			...(pointerState.current[index] || {}),
			inside: false,
		};
	};

	const handleSelect = (index) => {
		if (!disabled && !showResult) {
			onSelect(index, options[index].isCorrect);
		}
	};

	const getOptionStyle = (option, index) => {
		const isSelected = selectedIndex === index;
		const isCorrect = option.isCorrect;

		if (showResult) {
			if (isCorrect) {
				return {
					background: alpha("#22c55e", 0.15),
					borderColor: "#22c55e",
					color: "#22c55e",
				};
			}
			if (isSelected && !isCorrect) {
				return {
					background: alpha("#ef4444", 0.15),
					borderColor: "#ef4444",
					color: "#ef4444",
				};
			}
		}

		if (isSelected) {
			return {
				background: alpha(theme.palette.primary.main, 0.15),
				borderColor: theme.palette.primary.main,
				color: theme.palette.primary.main,
			};
		}

		return {
			background: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
			borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
			color: "text.cardTitle",
		};
	};

	return (
		<Box sx={{ width: "100%", maxWidth: 600, mx: "auto", overflowX: "hidden" }}>
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
					gap: 2,
				}}
			>
				{options.map((option, index) => {
					const style = getOptionStyle(option, index);
					const isSelected = selectedIndex === index;

					return (
						<MotionBox
							key={index}
							initial={{ y: 20 }}
							animate={{ y: 0 }}
							transition={{ delay: index * 0.1 }}
							whileHover={{}}
							whileTap={!disabled && !showResult ? { scale: 0.98 } : {}}
							onPointerDown={(e) => handlePointerDown(e, index)}
							onPointerMove={(e) => handlePointerMove(e, index)}
							onPointerUp={(e) => handlePointerUp(e, index)}
							onPointerCancel={(e) => handlePointerCancel(e, index)}
							onPointerLeave={(e) => handlePointerLeave(e, index)}
							sx={{
								userSelect: "none",
								WebkitUserSelect: "none",
								MozUserSelect: "none",
								msUserSelect: "none",
								WebkitTouchCallout: "none",
								width: "100%",
								boxSizing: "border-box",
								transformOrigin: "center",
								willChange: "transform",
								overflow: "hidden",
								p: 2.5,
								borderRadius: 2,
								border: `2px solid`,
								borderColor: style.borderColor,
								background: style.background,
								cursor: disabled || showResult ? "default" : "pointer",
								transition: "all 0.2s ease",
								display: "flex",
								alignItems: "center",
								gap: 2,
								"&:hover":
									!disabled && !showResult
										? {
												borderColor: theme.palette.primary.main,
												background: alpha(theme.palette.primary.main, 0.06),
												boxShadow: `inset 0 0 0 2px ${alpha(
													theme.palette.primary.main,
													0.18,
												)}`,
											}
										: {},
							}}
						>
							{/* Option label (A, B, C, D) */}
							<Box
								sx={{
									userSelect: "none",
									WebkitUserSelect: "none",
									MozUserSelect: "none",
									msUserSelect: "none",
									WebkitTouchCallout: "none",
									width: 36,
									height: 36,
									borderRadius: "10px",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									fontWeight: 700,
									fontSize: "0.9rem",
									fontFamily: "Inter, sans-serif",
									flexShrink: 0,
									background:
										showResult && option.isCorrect
											? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
											: showResult && isSelected && !option.isCorrect
												? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
												: isSelected
													? "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)"
													: isDark
														? "rgba(255, 255, 255, 0.1)"
														: "rgba(0, 0, 0, 0.08)",
									color:
										(showResult &&
											(option.isCorrect ||
												(isSelected && !option.isCorrect))) ||
										isSelected
											? "#ffffff"
											: isDark
												? "#ffffff"
												: "#1e293b",
								}}
							>
								{optionLabels[index]}
							</Box>

							{/* Option text */}
							<Typography
								variant="body1"
								sx={{
									userSelect: "none",
									WebkitUserSelect: "none",
									MozUserSelect: "none",
									msUserSelect: "none",
									WebkitTouchCallout: "none",
									flex: 1,
									fontFamily: "Inter, sans-serif",
									fontWeight: 500,
									color: style.color,
									wordBreak: "break-word",
								}}
							>
								{option.text}
							</Typography>

							{/* Result icon removed per UX request */}
						</MotionBox>
					);
				})}
			</Box>

			{/* Keyboard hint */}
			{
				<Typography
					variant="caption"
					sx={{
						display: "block",
						textAlign: "center",
						mt: 2,
						color: "text.cardSubtitle",
						fontFamily: "Inter, sans-serif",
					}}
				>
					{t("press_1234") || "Press 1-4 to select an answer"}
				</Typography>
			}
		</Box>
	);
}
