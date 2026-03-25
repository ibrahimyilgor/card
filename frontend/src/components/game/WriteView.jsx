import React, { useRef, useState, useEffect } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import StopIcon from "@mui/icons-material/Stop";
import { usePlan } from "../../context/PlanContext";
import tts from "../../utils/tts";
import { motion, AnimatePresence } from "framer-motion";
import WriteInput from "./WriteInput";

const MotionBox = motion.create(Box);

const WriteView = ({
	currentCardIndex,
	currentCard,
	writeResult,
	onWriteSubmit,
}) => {
	const { planCode } = usePlan();
	const ttsPlayingRef = useRef(false);
	const [ttsPlaying, setTtsPlaying] = useState(false);

	useEffect(() => {
		return () => tts.stop();
	}, []);

	const handleTtsToggle = async () => {
		if (ttsPlayingRef.current) {
			tts.stop();
			ttsPlayingRef.current = false;
			setTtsPlaying(false);
			return;
		}
		const text = currentCard?.front || "";
		try {
			ttsPlayingRef.current = true;
			setTtsPlaying(true);
			await tts.speak(text, { lang: "en-US" });
		} catch (e) {}
		ttsPlayingRef.current = false;
		setTtsPlaying(false);
	};
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
						borderRadius: 2,
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
						position: "relative",
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
					{planCode === "premium" && (
						<IconButton
							onClick={(e) => {
								e.stopPropagation();
								handleTtsToggle();
							}}
							sx={{ position: "absolute", right: 8, top: 8 }}
							size="small"
							aria-label="Play question audio"
						>
							{ttsPlaying ? (
								<StopIcon fontSize="small" />
							) : (
								<VolumeUpIcon fontSize="small" />
							)}
						</IconButton>
					)}
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
