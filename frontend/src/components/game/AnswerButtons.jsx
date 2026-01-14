import React from "react";
import { Box } from "@mui/material";
import { motion } from "framer-motion";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { StyledButton } from "../ui";

const MotionBox = motion.create(Box);

const AnswerButtons = ({ onAnswer, t }) => {
	return (
		<MotionBox
			initial={{ y: 20 }}
			animate={{ y: 0 }}
			transition={{ delay: 0.2 }}
			sx={{
				display: "flex",
				gap: 3,
			}}
		>
			<StyledButton
				variant="danger"
				size="large"
				startIcon={<CloseIcon />}
				onClick={() => onAnswer(false)}
				sx={{ minWidth: 140 }}
			>
				{t("incorrect") || "Incorrect"}
			</StyledButton>
			<StyledButton
				variant="success"
				size="large"
				startIcon={<CheckIcon />}
				onClick={() => onAnswer(true)}
				sx={{ minWidth: 140 }}
			>
				{t("correct") || "Correct"}
			</StyledButton>
		</MotionBox>
	);
};

export default AnswerButtons;
