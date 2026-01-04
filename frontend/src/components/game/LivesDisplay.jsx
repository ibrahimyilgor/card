import { Box } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

const MotionBox = motion.create(Box);

export default function LivesDisplay({ lives, maxLives = 3 }) {
	return (
		<Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
			{Array.from({ length: maxLives }).map((_, index) => {
				const isAlive = index < lives;

				return (
					<MotionBox
						key={index}
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
					>
						<AnimatePresence mode="wait" initial={false}>
							{isAlive ? (
								<MotionBox
									key="alive"
									initial={{ scale: 1.5, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									exit={{ scale: 0, opacity: 0, rotate: -45 }}
									transition={{ type: "spring", stiffness: 400, damping: 15 }}
								>
									<FavoriteIcon
										sx={{
											fontSize: 28,
											color: "#ef4444",
											filter: "drop-shadow(0 2px 4px rgba(239, 68, 68, 0.4))",
										}}
									/>
								</MotionBox>
							) : (
								<MotionBox
									key="dead"
									initial={{ scale: 0.5, opacity: 0 }}
									animate={{ scale: 1, opacity: 0.3 }}
									transition={{ type: "spring", stiffness: 400 }}
								>
									<FavoriteBorderIcon
										sx={{
											fontSize: 28,
											color: (theme) =>
												theme.palette.mode === "dark"
													? "rgba(255, 255, 255, 0.3)"
													: "rgba(0, 0, 0, 0.2)",
										}}
									/>
								</MotionBox>
							)}
						</AnimatePresence>
					</MotionBox>
				);
			})}
		</Box>
	);
}
