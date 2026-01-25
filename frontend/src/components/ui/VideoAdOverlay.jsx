import React, { useState, useEffect, useContext } from "react";
import { Box, IconButton, Typography, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { motion, AnimatePresence } from "framer-motion";
import { I18nContext } from "../../utils/i18n";

const MotionBox = motion.create(Box);

const VideoAdOverlay = ({ open, onClose, videoUrl }) => {
	const { t } = useContext(I18nContext);
	const [isVideoLoaded, setIsVideoLoaded] = useState(false);
	const [isVideoEnded, setIsVideoEnded] = useState(false);

	// Reset states when overlay opens
	useEffect(() => {
		if (open) {
			setIsVideoLoaded(false);
			setIsVideoEnded(false);
		}
	}, [open]);

	const handleVideoLoaded = () => {
		setIsVideoLoaded(true);
	};

	const handleVideoEnded = () => {
		setIsVideoEnded(true);
	};

	const handleClose = () => {
		onClose();
	};

	// Placeholder video URL for testing (can be replaced with real ad)
	const placeholderVideoUrl =
		videoUrl ||
		"https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

	const overlayVariants = {
		hidden: { opacity: 0 },
		visible: { opacity: 1 },
		exit: { opacity: 0 },
	};

	const contentVariants = {
		hidden: { scale: 0.9, opacity: 0 },
		visible: {
			scale: 1,
			opacity: 1,
			transition: { delay: 0.1, type: "spring", stiffness: 200 },
		},
		exit: { scale: 0.9, opacity: 0 },
	};

	return (
		<AnimatePresence>
			{open && (
				<MotionBox
					variants={overlayVariants}
					initial="hidden"
					animate="visible"
					exit="exit"
					sx={{
						position: "fixed",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						width: "100vw",
						height: "100vh",
						bgcolor: "rgba(0, 0, 0, 0.95)",
						zIndex: 9999,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						flexDirection: "column",
					}}
				>
					{/* Close button - always visible */}
					<IconButton
						onClick={handleClose}
						sx={{
							position: "absolute",
							top: { xs: 16, sm: 24 },
							right: { xs: 16, sm: 24 },
							color: "white",
							bgcolor: "rgba(255, 255, 255, 0.1)",
							"&:hover": {
								bgcolor: "rgba(255, 255, 255, 0.2)",
							},
							zIndex: 10000,
						}}
					>
						<CloseIcon />
					</IconButton>

					{/* Ad label */}
					<Typography
						variant="caption"
						sx={{
							position: "absolute",
							top: { xs: 16, sm: 24 },
							left: { xs: 16, sm: 24 },
							color: "rgba(255, 255, 255, 0.7)",
							bgcolor: "rgba(0, 0, 0, 0.5)",
							px: 1.5,
							py: 0.5,
							borderRadius: 1,
							fontSize: "0.7rem",
							textTransform: "uppercase",
							letterSpacing: 1,
						}}
					>
						{t("adLabel", "Advertisement")}
					</Typography>

					{/* Video container */}
					<MotionBox
						variants={contentVariants}
						sx={{
							width: { xs: "95%", sm: "80%", md: "70%" },
							maxWidth: 900,
							aspectRatio: "16/9",
							bgcolor: "black",
							borderRadius: 2,
							overflow: "hidden",
							position: "relative",
						}}
					>
						{/* Loading spinner */}
						{!isVideoLoaded && (
							<Box
								sx={{
									position: "absolute",
									top: "50%",
									left: "50%",
									transform: "translate(-50%, -50%)",
								}}
							>
								<CircularProgress sx={{ color: "white" }} />
							</Box>
						)}

						{/* Video element */}
						<video
							src={placeholderVideoUrl}
							autoPlay
							playsInline
							onLoadedData={handleVideoLoaded}
							onEnded={handleVideoEnded}
							style={{
								width: "100%",
								height: "100%",
								objectFit: "contain",
								opacity: isVideoLoaded ? 1 : 0,
								transition: "opacity 0.3s ease",
							}}
						/>
					</MotionBox>
				</MotionBox>
			)}
		</AnimatePresence>
	);
};

export default VideoAdOverlay;
