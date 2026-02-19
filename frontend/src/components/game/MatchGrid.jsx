import { useState, useEffect, useContext } from "react";
import { Box, Typography, alpha, useTheme } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { I18nContext } from "../../utils/i18n";

const MotionBox = motion.create(Box);

export default function MatchGrid({
	flashcards = [],
	onComplete,
	onMatch,
	onCardClick,
}) {
	const theme = useTheme();
	const { t } = useContext(I18nContext);
	const isDark = theme.palette.mode === "dark";

	const [cards, setCards] = useState([]);
	const [flipped, setFlipped] = useState([]);
	const [matched, setMatched] = useState([]);
	const [attempts, setAttempts] = useState(0);
	const [isChecking, setIsChecking] = useState(false);

	// Fisher-Yates shuffle algorithm for true randomness
	const shuffleArray = (array) => {
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	};

	// Initialize cards
	useEffect(() => {
		if (flashcards.length > 0) {
			// Create pairs of cards (front and back)
			const pairs = flashcards.slice(0, 6).flatMap((card, index) => [
				{
					id: `front-${index}`,
					pairId: index,
					text: card.front_text,
					type: "front",
				},
				{
					id: `back-${index}`,
					pairId: index,
					text: card.back_text,
					type: "back",
				},
			]);

			// Shuffle cards using Fisher-Yates algorithm
			const shuffled = shuffleArray(pairs);
			setCards(shuffled);
			setFlipped([]);
			setMatched([]);
			setAttempts(0);
		}
	}, [flashcards]);

	const handleCardClick = (cardId) => {
		if (isChecking) return;
		if (matched.includes(cardId)) return;
		if (flipped.includes(cardId)) return;
		if (flipped.length === 2) return;

		// play flip sound / notify parent before the card visually flips
		onCardClick?.(cardId);

		const newFlipped = [...flipped, cardId];
		setFlipped(newFlipped);

		if (newFlipped.length === 2) {
			setIsChecking(true);
			setAttempts((prev) => prev + 1);

			const [first, second] = newFlipped;
			const firstCard = cards.find((c) => c.id === first);
			const secondCard = cards.find((c) => c.id === second);

			// Check if it's a match (same pairId, different types)
			if (
				firstCard.pairId === secondCard.pairId &&
				firstCard.type !== secondCard.type
			) {
				// Match found
				setTimeout(() => {
					setMatched((prev) => [...prev, first, second]);
					setFlipped([]);
					setIsChecking(false);
					onMatch?.(true);

					// Check if all matched
					if (matched.length + 2 === cards.length) {
						setTimeout(() => {
							onComplete?.({
								attempts: attempts + 1,
								totalPairs: Math.min(flashcards.length, 6),
							});
						}, 500);
					}
				}, 500);
			} else {
				// No match
				setTimeout(() => {
					setFlipped([]);
					setIsChecking(false);
					onMatch?.(false);
				}, 1000);
			}
		}
	};

	const isFlipped = (cardId) =>
		flipped.includes(cardId) || matched.includes(cardId);
	const isMatched = (cardId) => matched.includes(cardId);

	return (
		<Box sx={{ width: "100%", maxWidth: 800, mx: "auto" }}>
			{/* Stats */}
			<Box sx={{ display: "flex", justifyContent: "center", gap: 4, mb: 4 }}>
				<Box sx={{ textAlign: "center" }}>
					<Typography
						variant="caption"
						sx={{ color: "text.cardSubtitle", fontFamily: "Inter, sans-serif" }}
					>
						{t("matches") || "Matches"}
					</Typography>
					<Typography
						variant="h5"
						sx={{
							color: "text.cardTitle",
							fontWeight: 700,
							fontFamily: "Inter, sans-serif",
						}}
					>
						{matched.length / 2} / {cards.length / 2}
					</Typography>
				</Box>
				<Box sx={{ textAlign: "center" }}>
					<Typography
						variant="caption"
						sx={{ color: "text.cardSubtitle", fontFamily: "Inter, sans-serif" }}
					>
						{t("attempts") || "Attempts"}
					</Typography>
					<Typography
						variant="h5"
						sx={{
							color: "text.cardTitle",
							fontWeight: 700,
							fontFamily: "Inter, sans-serif",
						}}
					>
						{attempts}
					</Typography>
				</Box>
			</Box>

			{/* Grid */}
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: { xs: "repeat(3, 1fr)", sm: "repeat(4, 1fr)" },
					gap: 2,
				}}
			>
				{cards.map((card) => (
					<MotionBox
						key={card.id}
						onClick={() => handleCardClick(card.id)}
						initial={{ scale: 0 }}
						animate={{
							scale: 1,
							opacity: isMatched(card.id) ? 0.6 : 1,
						}}
						transition={{ type: "spring", stiffness: 300, damping: 20 }}
						sx={{
							aspectRatio: "1",
							cursor: isMatched(card.id) || isChecking ? "default" : "pointer",
						}}
					>
						<Box
							sx={{
								width: "100%",
								height: "100%",
								position: "relative",
							}}
						>
							{/* Card back (question mark) - hidden when flipped */}
							{!isFlipped(card.id) && (
								<Box
									sx={{
										position: "absolute",
										width: "100%",
										height: "100%",
										borderRadius: 3,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										background:
											"linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
										boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
										"&:hover":
											!isMatched(card.id) && !isChecking
												? {
														transform: "scale(1.05)",
														boxShadow: "0 8px 20px rgba(59, 130, 246, 0.4)",
													}
												: {},
										transition: "all 0.2s ease",
									}}
								>
									<Typography
										variant="h4"
										sx={{
											color: "white",
											fontWeight: 700,
											fontFamily: "Inter, sans-serif",
										}}
									>
										?
									</Typography>
								</Box>
							)}

							{/* Card front (content) */}
							{isFlipped(card.id) && (
								<Box
									sx={{
										position: "absolute",
										width: "100%",
										height: "100%",
										borderRadius: 3,
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										justifyContent: "center",
										p: 1.5,
										background: isMatched(card.id)
											? alpha("#22c55e", 0.15)
											: card.type === "front"
												? isDark
													? "rgba(59, 130, 246, 0.15)"
													: "rgba(59, 130, 246, 0.1)"
												: isDark
													? "rgba(139, 92, 246, 0.15)"
													: "rgba(139, 92, 246, 0.1)",
										border: `2px solid ${
											isMatched(card.id)
												? "#22c55e"
												: card.type === "front"
													? "#3b82f6"
													: "#8b5cf6"
										}`,
									}}
								>
									{isMatched(card.id) && (
										<CheckCircleIcon
											sx={{
												position: "absolute",
												top: 8,
												right: 8,
												fontSize: 20,
												color: "#22c55e",
											}}
										/>
									)}
									<Typography
										variant="body2"
										sx={{
											color: "text.cardTitle",
											fontFamily: "Inter, sans-serif",
											fontWeight: 500,
											textAlign: "center",
											fontSize: { xs: "0.7rem", sm: "0.85rem" },
											wordBreak: "break-word",
											overflow: "hidden",
											display: "-webkit-box",
											WebkitLineClamp: 3,
											WebkitBoxOrient: "vertical",
										}}
									>
										{card.text}
									</Typography>
									<Typography
										variant="caption"
										sx={{
											position: "absolute",
											bottom: 4,
											color: card.type === "front" ? "#3b82f6" : "#8b5cf6",
											fontSize: "0.65rem",
											fontWeight: 600,
											textTransform: "uppercase",
										}}
									>
										{card.type === "front"
											? t("question") || "Q"
											: t("answer") || "A"}
									</Typography>
								</Box>
							)}
						</Box>
					</MotionBox>
				))}
			</Box>
		</Box>
	);
}
