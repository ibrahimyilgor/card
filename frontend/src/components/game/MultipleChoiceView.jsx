import React, { useRef, useState, useEffect } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import StopIcon from "@mui/icons-material/Stop";
import { usePlan } from "../../context/PlanContext";
import tts from "../../utils/tts";
import { motion, AnimatePresence } from "framer-motion";
import MultipleChoice from "./MultipleChoice";

const MotionBox = motion.create(Box);

const MultipleChoiceView = ({
	currentCardIndex,
	flashcard,
	questionText,
	selectedChoice,
	showChoiceResult,
	onChoiceSelect,
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
		const text = questionText || flashcard?.front_text || "";
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
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 3,
					width: "100%",
					height: "100%",
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
						{questionText || flashcard?.front_text}
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

				{/* Options - keep question fixed, allow options to scroll if long */}
				<Box
					sx={{
						width: "100%",
						maxWidth: 700,
						flex: "1 1 auto",
						overflowY: "auto",
						overflowX: "none",
					}}
				>
					<MultipleChoice
						options={flashcard?.options || []}
						onSelect={onChoiceSelect}
						disabled={showChoiceResult}
						showResult={showChoiceResult}
						selectedIndex={selectedChoice}
					/>
				</Box>
			</MotionBox>
		</AnimatePresence>
	);
};

export default MultipleChoiceView;
