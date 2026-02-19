import { useState, useContext } from "react";
import { Box, Typography, alpha, useTheme } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import { I18nContext } from "../../utils/i18n";
import { StyledTextField, StyledButton } from "../ui";

const MotionBox = motion.create(Box);

export default function WriteInput({
	onSubmit,
	correctAnswer,
	showResult = false,
	isCorrect = null,
	isClose = false,
	disabled = false,
}) {
	const theme = useTheme();
	const { t } = useContext(I18nContext);
	const [answer, setAnswer] = useState("");
	const [showHint, setShowHint] = useState(false);

	const handleSubmit = (e) => {
		e?.preventDefault();
		if (answer.trim() && !disabled) {
			onSubmit(answer.trim());
		}
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	};

	const getHint = () => {
		if (!correctAnswer) return "";
		const words = correctAnswer.split(" ");
		if (words.length > 1) {
			return words
				.map((word) => word.charAt(0) + "_".repeat(word.length - 1))
				.join(" ");
		}
		return (
			correctAnswer.charAt(0) +
			"_".repeat(Math.max(0, correctAnswer.length - 1))
		);
	};

	return (
		<Box sx={{ width: "100%", maxWidth: 500 }}>
			<form onSubmit={handleSubmit}>
				<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
					{/* Input field */}
					<StyledTextField
						value={answer}
						onChange={(e) => setAnswer(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder={t("type_your_answer") || "Type your answer..."}
						fullWidth
						autoFocus
						disabled={disabled || showResult}
						error={showResult && !isCorrect && !isClose}
						sx={{
							"& .MuiOutlinedInput-root": {
								...(showResult &&
									isCorrect && {
										borderColor: "#22c55e",
										"& fieldset": { borderColor: "#22c55e" },
									}),
								...(showResult &&
									!isCorrect &&
									isClose && {
										borderColor: "#f59e0b",
										"& fieldset": { borderColor: "#f59e0b" },
									}),

								...(showResult &&
									!isCorrect &&
									!isClose && {
										borderColor: "#ef4444",
										"& fieldset": { borderColor: "#ef4444" },
									}),
							},
						}}
					/>

					{/* Hint button */}
					{!showResult && (
						<Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
							<StyledButton
								variant="ghost"
								onClick={() => setShowHint(!showHint)}
								startIcon={<LightbulbIcon />}
								size="small"
							>
								{showHint
									? t("hide_hint") || "Hide Hint"
									: t("show_hint") || "Show Hint"}
							</StyledButton>

							<StyledButton
								variant="primary"
								onClick={handleSubmit}
								disabled={!answer.trim() || disabled}
							>
								{t("submit") || "Submit"}
							</StyledButton>
						</Box>
					)}

					{/* Hint display */}
					<AnimatePresence initial={false}>
						{showHint && !showResult && (
							<MotionBox
								initial={{ height: 0 }}
								animate={{ height: "auto" }}
								exit={{ height: 0 }}
								sx={{
									p: 2,
									borderRadius: 2,
									background: alpha(theme.palette.warning.main, 0.1),
									border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
								}}
							>
								<Typography
									variant="body2"
									sx={{
										color: "warning.main",
										fontFamily: "monospace",
										letterSpacing: 2,
										textAlign: "center",
									}}
								>
									{getHint()}
								</Typography>
							</MotionBox>
						)}
					</AnimatePresence>

					{/* Result display */}
					<AnimatePresence initial={false}>
						{showResult && (
							<MotionBox
								initial={{ y: 20 }}
								animate={{ y: 0 }}
								exit={{ y: -20 }}
								sx={{
									p: 3,
									borderRadius: 3,
									background: isCorrect
										? alpha("#22c55e", 0.1)
										: isClose
											? alpha("#f59e0b", 0.1)
											: alpha("#ef4444", 0.1),
									border: `1px solid ${
										isCorrect
											? alpha("#22c55e", 0.3)
											: isClose
												? alpha("#f59e0b", 0.3)
												: alpha("#ef4444", 0.3)
									}`,
									textAlign: "center",
								}}
							>
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										gap: 1,
										mb: 1,
									}}
								>
									{isCorrect ? (
										<CheckCircleIcon sx={{ color: "#22c55e", fontSize: 28 }} />
									) : isClose ? (
										<CancelIcon sx={{ color: "#f59e0b", fontSize: 28 }} />
									) : (
										<CancelIcon sx={{ color: "#ef4444", fontSize: 28 }} />
									)}
									<Typography
										variant="h6"
										sx={{
											fontWeight: 600,
											color: isCorrect
												? "#22c55e"
												: isClose
													? "#f59e0b"
													: "#ef4444",
											fontFamily: "Inter, sans-serif",
										}}
									>
										{isCorrect
											? t("correct_answer") || "Correct!"
											: isClose
												? t("almost_correct") || "Almost!"
												: t("wrong_answer") || "Incorrect"}
									</Typography>
								</Box>

								{!isCorrect && (
									<Typography
										variant="body2"
										sx={{
											color: "text.cardSubtitle",
											fontFamily: "Inter, sans-serif",
											mt: 1,
										}}
									>
										{t("correct_was") || "Correct answer:"}{" "}
										<Box
											component="span"
											sx={{ color: "text.cardTitle", fontWeight: 600 }}
										>
											{correctAnswer}
										</Box>
									</Typography>
								)}
							</MotionBox>
						)}
					</AnimatePresence>
				</Box>
			</form>
		</Box>
	);
}
