import React from "react";
import { Box } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import FlashCard from "../FlashCard";

const MotionBox = motion.create(Box);

const CardView = ({
	currentCardIndex,
	currentCard,
	isCardFlipped,
	onCardFlip,
	direction,
}) => {
	return (
		<AnimatePresence mode="wait" initial={false}>
			<MotionBox
				key={currentCardIndex}
				initial={{
					opacity: 0,
					x: direction * -100,
					scale: 0.95,
				}}
				animate={{
					opacity: 1,
					x: 0,
					scale: 1,
				}}
				exit={{
					opacity: 0,
					x: direction * 100,
					scale: 0.95,
				}}
				transition={{
					duration: 0.3,
					ease: "easeOut",
				}}
			>
				<FlashCard
					front={currentCard.front}
					back={currentCard.back}
					isFlipped={isCardFlipped}
					onFlip={onCardFlip}
				/>
			</MotionBox>
		</AnimatePresence>
	);
};

export default CardView;
