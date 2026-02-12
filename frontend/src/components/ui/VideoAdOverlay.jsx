import React, { useState, useEffect, useRef, useContext } from "react";
import { Box, IconButton, Typography, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { motion, AnimatePresence } from "framer-motion";
import { I18nContext } from "../../utils/i18n";

const MotionBox = motion.create(Box);

const VideoAdOverlay = ({ open, onClose, videoUrl }) => {
	const { t } = useContext(I18nContext);
	const [isVideoLoaded, setIsVideoLoaded] = useState(false);
	const [isVideoEnded, setIsVideoEnded] = useState(false);
	const [remainingTime, setRemainingTime] = useState(0);
	const [selectedVideo, setSelectedVideo] = useState(null);
	const [showCloseButton, setShowCloseButton] = useState(false);
	const videoRef = useRef(null);
	const timeoutRef = useRef(null);

	// Reset states when overlay opens
	useEffect(() => {
		if (open) {
			setIsVideoLoaded(false);
			setIsVideoEnded(false);
			setRemainingTime(0);
			setShowCloseButton(false);
			if (!selectedVideo) {
				const videos = ["/videos/apple.mp4", "/videos/thy.mp4"];
				const randomVideo = videos[Math.floor(Math.random() * videos.length)];
				setSelectedVideo(randomVideo);
			}
			timeoutRef.current = setTimeout(() => setShowCloseButton(true), 10000);
		} else {
			setSelectedVideo(null);
			setShowCloseButton(false);
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
		}
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [open, selectedVideo]);

	// Update remaining time every second while video is playing
	useEffect(() => {
		let interval;
		if (isVideoLoaded && !isVideoEnded && remainingTime > 0) {
			interval = setInterval(() => {
				setRemainingTime(prev => Math.max(0, prev - 1));
			}, 1000);
		}
		return () => {
			if (interval) clearInterval(interval);
		};
	}, [isVideoLoaded, isVideoEnded, remainingTime]);

	const handleVideoLoaded = () => {
		setIsVideoLoaded(true);
		setRemainingTime(10);
	};

	const handleVideoEnded = () => {
		setIsVideoEnded(true);
		setRemainingTime(0);
	};

	const handleClose = () => {
		onClose();
	};

	// Placeholder video URL for testing (can be replaced with real ad)
	const placeholderVideoUrl = videoUrl || selectedVideo;
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
					{/* Close button - visible after 10 seconds or when video ends */}
					{(isVideoEnded || showCloseButton) && (
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
					)}

					{/* Remaining time display - visible while video is playing and before close button appears */}
					{isVideoLoaded && !isVideoEnded && remainingTime > 0 && !showCloseButton && (
						<Typography
							variant="h6"
							sx={{
								position: "absolute",
								top: { xs: 16, sm: 24 },
								right: { xs: 16, sm: 24 },
								color: "white",
								fontWeight: "bold",
								textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
								zIndex: 10000,
							}}
						>
							{remainingTime}s
						</Typography>
					)}

					{/* Ad label */}
					<Typography
						variant="caption"
						sx={{
							position: "absolute",
							top: { xs: 16, sm: 24 },
							left: "50%",
							transform: "translateX(-50%)",
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
							ref={videoRef}
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
