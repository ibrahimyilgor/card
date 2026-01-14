import React from "react";
import { Box, Typography } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import WriteInput from "./WriteInput";

const MotionBox = motion.create(Box);

const WriteView = ({
	currentCardIndex,
	currentCard,
	writeResult,
	onWriteSubmit,
}) => {
	return (
		<AnimatePresence mode="wait" initial={false}>
			<MotionBox
				key={currentCardIndex}
				initial={{ y: 20 }}
				animate={{ y: 0 }}
				exit={{ y: -20 }}
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 3,
					width: "100%",
				}}
			>
				{/* Question */}
				<Box
					sx={{
						p: 4,
						borderRadius: 4,
						background: (theme) =>
							theme.palette.mode === "dark"
								? "linear-gradient(145deg, #1a1f2e 0%, #111827 100%)"
								: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
						border: (theme) =>
							`1px solid ${
								theme.palette.mode === "dark"
									? "rgba(255, 255, 255, 0.08)"
									: "rgba(0, 0, 0, 0.08)"
							}`,
						textAlign: "center",
						width: "100%",
						maxWidth: 500,
					}}
				>
					<Typography
						variant="h5"
						sx={{
							color: "text.cardTitle",
							fontWeight: 600,
							fontFamily: "Inter, sans-serif",
						}}
					>
						{currentCard.front}
					</Typography>
				</Box>

				{/* Write Input */}
				<WriteInput
					onSubmit={onWriteSubmit}
					correctAnswer={currentCard.back}
					showResult={!!writeResult}
					isCorrect={writeResult?.correct}
					isClose={writeResult?.isClose}
					disabled={!!writeResult}
				/>
			</MotionBox>
		</AnimatePresence>
	);
};

export default WriteView;
