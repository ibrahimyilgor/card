import {
	useContext,
	useEffect,
	useRef,
	useState,
	useCallback,
} from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Box, Typography, IconButton } from "@mui/material";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import StopIcon from "@mui/icons-material/Stop";
import { playSound, SOUNDS } from "../utils/sounds";
import { I18nContext } from "../utils/i18n";
import { usePlan } from "../context/PlanContext";
import tts from "../utils/tts";

const MotionBox = motion.create(Box);
const MotionIconButton = motion.create(IconButton);

export default function FlashCard({ front, back, isFlipped, onFlip }) {
	const { t } = useContext(I18nContext);
	const frontScrollRef = useRef(null);
	const backScrollRef = useRef(null);
	const frontRafRef = useRef(null);
	const backRafRef = useRef(null);
	const ttsPlayingRef = useRef(false);
	const [ttsPlaying, setTtsPlaying] = useState(false);
	const { planCode } = usePlan();
	const [frontHasOverflow, setFrontHasOverflow] = useState(false);
	const [backHasOverflow, setBackHasOverflow] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);

	const cardControls = useAnimation();
	const btnControls = useAnimation();

	const EASE = [0.23, 1, 0.32, 1];
	const DURATION = 0.6;

	// Animate card and button together; button only gets scale/y (no rotateY).
	const animateBoth = useCallback(
		(anim) => {
			const { rotateY, ...btnAnim } = anim || {};
			cardControls.start(anim);
			btnControls.start(btnAnim);
		},
		[cardControls, btnControls],
	);

	useEffect(() => {
		const rotateY = isFlipped ? 180 : 0;
		animateBoth({
			rotateY,
			scale: 1,
			y: 0,
			transition: { duration: DURATION, ease: EASE },
		});
	}, [isFlipped, animateBoth]); // eslint-disable-line react-hooks/exhaustive-deps

	const handleHoverStart = () => {
		animateBoth({ scale: 1.02, y: -2, transition: { duration: 0.2, ease: EASE } });
	};

	const handleHoverEnd = () => {
		animateBoth({ scale: 1, y: 0, transition: { duration: 0.2, ease: EASE } });
	};

	const stopAutoScroll = useCallback((rafRef) => {
		if (rafRef.current) {
			cancelAnimationFrame(rafRef.current);
			rafRef.current = null;
		}
	}, []);

	const startAutoScroll = useCallback(
		(containerRef, rafRef) => {
			const node = containerRef.current;
			if (!node) return;
			const maxScroll = Math.max(0, node.scrollHeight - node.clientHeight);
			if (maxScroll <= 1) return;
			let y = node.scrollTop || 0;
			let lastTs = 0;
			const speedPxPerSec = 20;
			const tick = (ts) => {
				const currentNode = containerRef.current;
				if (!currentNode) return;
				const currentMax = Math.max(0, currentNode.scrollHeight - currentNode.clientHeight);
				if (currentMax <= 1) { currentNode.scrollTop = 0; return; }
				if (!lastTs) lastTs = ts;
				const dt = Math.min(64, ts - lastTs);
				lastTs = ts;
				y += (speedPxPerSec * dt) / 1000;
				if (y >= currentMax) y = 0;
				currentNode.scrollTop = y;
				rafRef.current = requestAnimationFrame(tick);
			};
			stopAutoScroll(rafRef);
			rafRef.current = requestAnimationFrame(tick);
		},
		[stopAutoScroll],
	);

	const evaluateOverflow = useCallback(() => {
		const frontNode = frontScrollRef.current;
		const backNode = backScrollRef.current;
		setFrontHasOverflow(!!frontNode && frontNode.scrollHeight > frontNode.clientHeight + 1);
		setBackHasOverflow(!!backNode && backNode.scrollHeight > backNode.clientHeight + 1);
	}, []);

	const handleFlip = () => {
		tts.stop();
		setTtsPlaying(false);
		setIsExpanded(false);
		playSound(SOUNDS.FLIP);
		onFlip();
	};

	const handleTtsToggle = async () => {
		if (ttsPlayingRef.current) {
			tts.stop();
			ttsPlayingRef.current = false;
			setTtsPlaying(false);
			return;
		}
		const text = isFlipped ? back : front;
		try {
			ttsPlayingRef.current = true;
			setTtsPlaying(true);
			await tts.speak(text, { lang: "en-US" });
		} catch (e) {
			// ignore
		} finally {
			ttsPlayingRef.current = false;
			setTtsPlaying(false);
		}
	};

	useEffect(() => { return () => { tts.stop(); }; }, []);

	useEffect(() => {
		const onKeyDown = (e) => {
			const tag = e.target && e.target.tagName;
			if (
				e.code === "Space" &&
				!e.repeat &&
				tag !== "INPUT" &&
				tag !== "TEXTAREA" &&
				!e.target.isContentEditable
			) {
				e.preventDefault();
				playSound(SOUNDS.FLIP);
				onFlip();
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [onFlip]);

	useEffect(() => {
		evaluateOverflow();
		window.addEventListener("resize", evaluateOverflow);
		return () => window.removeEventListener("resize", evaluateOverflow);
	}, [front, back, isFlipped, evaluateOverflow]);

	useEffect(() => {
		stopAutoScroll(frontRafRef);
		stopAutoScroll(backRafRef);
		if (!isFlipped && frontHasOverflow) startAutoScroll(frontScrollRef, frontRafRef);
		if (isFlipped && backHasOverflow) startAutoScroll(backScrollRef, backRafRef);
		return () => {
			stopAutoScroll(frontRafRef);
			stopAutoScroll(backRafRef);
		};
	}, [isFlipped, frontHasOverflow, backHasOverflow, startAutoScroll, stopAutoScroll]);

	const contentVariants = {
		hidden: { opacity: 0 },
		visible: { opacity: 1, transition: { delay: 0.3, duration: 0.3 } },
	};

	return (
		<Box
			sx={{
				perspective: "1200px",
				width: { xs: "320px", sm: "420px", md: "480px" },
				height: isExpanded ? "auto" : { xs: "220px", sm: "280px", md: "320px" },
				minHeight: { xs: "220px", sm: "280px", md: "320px" },
				position: "relative",
				transition: "height 0.3s ease",
			}}
			onMouseEnter={handleHoverStart}
			onMouseLeave={handleHoverEnd}
		>
			{/* Card — driven by cardControls (rotateY + scale + y) */}
			<MotionBox
				onClick={handleFlip}
				animate={cardControls}
				initial={{ rotateY: 0, scale: 1, y: 0 }}
				whileTap={{ scale: 0.98 }}
				style={{ transformStyle: "preserve-3d" }}
				sx={{
					width: "100%",
					height: "100%",
					cursor: "pointer",
					position: "relative",
					borderRadius: "20px",
				}}
			>

				{/* Front side */}
				<Box
					sx={{
						position: "absolute",
						width: "100%",
						height: "100%",
						backfaceVisibility: "hidden",
						borderRadius: "20px",
						background: (theme) =>
							theme.palette.mode === "dark"
								? "linear-gradient(145deg, #1a1f2e 0%, #111827 100%)"
								: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
						border: (theme) =>
							`1px solid ${theme.palette.mode === "dark" ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.15)"}`,
						boxShadow: (theme) =>
							theme.palette.mode === "dark"
								? "0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
								: "0 20px 50px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						p: 4,
						overflow: "hidden",
					}}
				>
					<Box
						sx={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							height: 4,
							background: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)",
						}}
					/>
					<AnimatePresence mode="wait" initial={false}>
						{!isFlipped && (
							<Box
								ref={frontScrollRef}
								onScroll={evaluateOverflow}
								sx={{
									width: "100%",
									height: { xs: "66%", sm: "68%", md: "70%" },
									overflowY: "auto",
									scrollbarWidth: "none",
									msOverflowStyle: "none",
									"&::-webkit-scrollbar": { display: "none" },
									px: 1,
									py: 2,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<MotionBox
									key="front-content"
									variants={contentVariants}
									initial="hidden"
									animate="visible"
									exit="hidden"
									sx={{ textAlign: "center", width: "100%" }}
								>
									<Typography
										variant="h5"
										sx={{
											fontWeight: 600,
											color: "text.cardTitle",
											fontFamily: "Inter, sans-serif",
											lineHeight: 1.4,
											wordBreak: "break-word",
											fontSize: frontHasOverflow
												? { xs: "1rem", sm: "1.2rem", md: "1.35rem" }
												: { xs: "1.1rem", sm: "1.3rem", md: "1.5rem" },
										}}
									>
										{front}
									</Typography>
								</MotionBox>
							</Box>
						)}
					</AnimatePresence>
					<Box
						sx={{
							position: "absolute",
							bottom: 16,
							display: "flex",
							alignItems: "center",
							gap: 0.5,
							color: "text.cardSubtitle",
							opacity: 0.6,
						}}
					>
						<TouchAppIcon sx={{ fontSize: 16 }} />
						<Typography variant="caption" sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.7rem" }}>
							{t("tap_to_flip")}
						</Typography>
					</Box>
				</Box>

				{/* Back side */}
				<Box
					sx={{
						position: "absolute",
						width: "100%",
						height: "100%",
						backfaceVisibility: "hidden",
						transform: "rotateY(180deg)",
						borderRadius: "20px",
						background: (theme) =>
							theme.palette.mode === "dark"
								? "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)"
								: "linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 100%)",
						border: (theme) =>
							`1px solid ${theme.palette.mode === "dark" ? "rgba(34, 197, 94, 0.2)" : "rgba(34, 197, 94, 0.15)"}`,
						boxShadow: (theme) =>
							theme.palette.mode === "dark"
								? "0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
								: "0 20px 50px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						p: 4,
						overflow: "hidden",
					}}
				>
					<Box
						sx={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							height: 4,
							background: "linear-gradient(90deg, #22c55e 0%, #10b981 100%)",
						}}
					/>
					<AnimatePresence mode="wait" initial={false}>
						{isFlipped && (
							<Box
								ref={backScrollRef}
								onScroll={evaluateOverflow}
								sx={{
									width: "100%",
									height: { xs: "66%", sm: "68%", md: "70%" },
									overflowY: "auto",
									scrollbarWidth: "none",
									msOverflowStyle: "none",
									"&::-webkit-scrollbar": { display: "none" },
									px: 1,
									py: 2,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<MotionBox
									key="back-content"
									variants={contentVariants}
									initial="hidden"
									animate="visible"
									exit="hidden"
									sx={{ textAlign: "center", width: "100%" }}
								>
									<Typography
										variant="body2"
										sx={{
											color: "success.light",
											fontWeight: 600,
											textTransform: "uppercase",
											letterSpacing: "0.1em",
											fontSize: "0.7rem",
											mb: 2,
											fontFamily: "Inter, sans-serif",
										}}
									>
										{t("flip_back_label")}
									</Typography>
									<Typography
										variant="h5"
										sx={{
											fontWeight: 600,
											color: "text.cardTitle",
											fontFamily: "Inter, sans-serif",
											lineHeight: 1.4,
											wordBreak: "break-word",
											fontSize: backHasOverflow
												? { xs: "1rem", sm: "1.2rem", md: "1.35rem" }
												: { xs: "1.1rem", sm: "1.3rem", md: "1.5rem" },
										}}
									>
										{back}
									</Typography>
								</MotionBox>
							</Box>
						)}
					</AnimatePresence>
					<Box
						sx={{
							position: "absolute",
							bottom: 16,
							display: "flex",
							alignItems: "center",
							gap: 0.5,
							color: "text.cardSubtitle",
							opacity: 0.6,
						}}
					>
						<TouchAppIcon sx={{ fontSize: 16 }} />
						<Typography variant="caption" sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.7rem" }}>
							{t("tap_to_flip_back")}
						</Typography>
					</Box>
				</Box>
				{/* TTS button — inside the rotating card so it flips with it.
				    A CSS counter-rotation keeps it visually upright on both faces. */}
				{planCode === "premium" && (
					<Box
						sx={{
							position: "absolute",
							top: 12,
							right: 12,
							zIndex: 120,
						}}
					>
						<IconButton
							onClick={(e) => { e.stopPropagation(); handleTtsToggle(); }}
							size="small"
							aria-label="Play card audio"
							sx={{
								display: "block",
								transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
								transition: "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)",
							}}
						>
							{ttsPlaying ? <StopIcon fontSize="small" /> : <VolumeUpIcon fontSize="small" />}
						</IconButton>
					</Box>
				)}
			</MotionBox>
		</Box>
	);
}
