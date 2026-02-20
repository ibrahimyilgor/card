import React, { useContext, useEffect, useState } from "react";
import {
	AppBar,
	Toolbar,
	Typography,
	Box,
	IconButton,
	Popover,
	Button,
	useTheme,
	Tooltip,
	alpha,
	Avatar,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import BarChartIcon from "@mui/icons-material/BarChart";
import EventNoteIcon from "@mui/icons-material/EventNote";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import { I18nContext } from "../utils/i18n";
import { useNavigate, useLocation } from "react-router-dom";
import { getCurrentStreak } from "../services/statsServices";

const MotionBox = motion.create(Box);
const MotionIconButton = motion.create(IconButton);

function NavButton({ icon: Icon, label, isActive, onClick, tooltip }) {
	const theme = useTheme();
	const isDark = theme.palette.mode === "dark";

	return (
		<Tooltip title={tooltip} arrow>
			<MotionIconButton
				onClick={onClick}
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
				sx={{
					mx: 0.25,
					p: { xs: 0.75, sm: 1.25 },
					borderRadius: "12px",
					color: isActive
						? isDark
							? "#ffffff"
							: "#1e293b"
						: isDark
							? "rgba(255, 255, 255, 0.6)"
							: "rgba(30, 41, 59, 0.6)",
					backgroundColor: isActive
						? isDark
							? "rgba(255, 255, 255, 0.12)"
							: "rgba(59, 130, 246, 0.12)"
						: "transparent",
					position: "relative",
					transition: "all 0.2s ease",
					"&:hover": {
						color: isDark ? "#ffffff" : "#1e293b",
						backgroundColor: isDark
							? "rgba(255, 255, 255, 0.08)"
							: "rgba(59, 130, 246, 0.08)",
					},
				}}
			>
				<Icon sx={{ fontSize: { xs: 18, sm: 22 } }} />
				{isActive && (
					<MotionBox
						layoutId="activeIndicator"
						sx={{
							position: "absolute",
							bottom: 0,
							left: 0,
							right: 0,
							height: 3,
							borderRadius: "3px 3px 0 0",
							background: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)",
						}}
					/>
				)}
			</MotionIconButton>
		</Tooltip>
	);
}

export default function Topbar({ onLogout, currentPath, user }) {
	const theme = useTheme();
	const { t } = useContext(I18nContext);
	const navigate = useNavigate();
	const location = useLocation();

	const [navLoading, setNavLoading] = useState(false);

	const [anchorEl, setAnchorEl] = useState(null);
	const [streak, setStreak] = useState(null);

	// Fetch current streak on mount (only when logged in)s
	useEffect(() => {
		const isLoggedIn = !!(user || localStorage.getItem("token"));
		if (!isLoggedIn) return;
		let mounted = true;
		getCurrentStreak()
			.then((data) => {
				if (mounted) setStreak(data.currentStreak || 0);
			})
			.catch(() => {});
		return () => {
			mounted = false;
		};
	}, [user]);

	// Get user's profile photo from props
	const photoURL = user?.photoURL;
	const displayName = user?.displayName;
	const email = user?.email;

	// Use location.pathname if currentPath not provided
	const activePath = currentPath || location.pathname;

	const handleNavigate = (path) => {
		if (navLoading || activePath === path) return;
		setNavLoading(true);
		navigate(path);
	};

	useEffect(() => {
		setNavLoading(false);
	}, [location.pathname]);

	const handleProfileClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handlePopoverClose = () => {
		setAnchorEl(null);
	};

	const handleLogout = async () => {
		try {
			const refreshToken = localStorage.getItem("refreshToken");
			if (refreshToken) {
				// Invalidate refresh token on server
				await fetch(
					`${window.location.protocol}//${window.location.hostname}/api/auth/logout`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ refreshToken }),
					},
				);
			}
		} catch (error) {
			console.error("Error during logout:", error);
		}
		localStorage.removeItem("token");
		localStorage.removeItem("refreshToken");
		localStorage.removeItem("accountId");
		if (onLogout) onLogout();
		setAnchorEl(null);
		navigate("/login");
	};

	const open = Boolean(anchorEl);

	return (
		<AppBar
			position="sticky"
			elevation={0}
			sx={{
				background: (theme) =>
					theme.palette.mode === "dark"
						? "linear-gradient(180deg, rgba(17, 24, 39, 0.98) 0%, rgba(17, 24, 39, 0.95) 100%)"
						: "linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)",
				backdropFilter: "blur(12px)",
				borderBottom: (theme) =>
					`1px solid ${
						theme.palette.mode === "dark"
							? "rgba(255, 255, 255, 0.08)"
							: "rgba(0, 0, 0, 0.08)"
					}`,
				zIndex: 1100,
			}}
		>
			<Toolbar
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					px: { xs: 2, sm: 4 },
					py: 1,
					minHeight: 64,
					maxWidth: 1400,
					width: "100%",
					mx: "auto",
				}}
			>
				{/* Logo */}
				<MotionBox
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					onClick={() => navigate("/")}
					sx={{
						display: "flex",
						alignItems: "center",
						gap: 1.5,
						cursor: "pointer",
					}}
				>
					<Box
						component="img"
						src="/images/logo/memodeck.png"
						alt="MemoDeck"
						sx={{
							width: 40,
							height: 40,
							borderRadius: "10px",
							objectFit: "cover",
							boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
						}}
					/>
					<Typography
						variant="h6"
						sx={{
							fontWeight: 700,
							background: (theme) =>
								theme.palette.mode === "dark"
									? "linear-gradient(90deg, #ffffff 0%, #94a3b8 100%)"
									: "linear-gradient(90deg, #1e293b 0%, #475569 100%)",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
							fontFamily: "Inter, sans-serif",
							letterSpacing: "-0.02em",
							display: { xs: "none", sm: "block" },
						}}
					>
						MemoDeck
					</Typography>
				</MotionBox>

				{/* Navigation */}
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						background: (theme) =>
							theme.palette.mode === "dark"
								? "rgba(30, 41, 59, 0.8)"
								: "rgba(241, 245, 249, 0.8)",
						borderRadius: "14px",
						p: 0.5,
						border: (theme) =>
							`1px solid ${
								theme.palette.mode === "dark"
									? "rgba(255, 255, 255, 0.08)"
									: "rgba(0, 0, 0, 0.06)"
							}`,
					}}
				>
					<NavButton
						icon={HomeIcon}
						label="Home"
						tooltip={t("home") || "Home"}
						isActive={activePath === "/"}
						onClick={() => handleNavigate("/")}
						disabled={navLoading}
					/>
					<NavButton
						icon={BarChartIcon}
						label="Stats"
						tooltip={t("statistics") || "Statistics"}
						isActive={activePath === "/stats"}
						onClick={() => handleNavigate("/stats")}
						disabled={navLoading}
					/>
					<NavButton
						icon={EmojiEventsIcon}
						label="Achievements"
						tooltip={t("achievements") || "Achievements"}
						isActive={activePath === "/achievements"}
						onClick={() => handleNavigate("/achievements")}
						disabled={navLoading}
					/>
					<NavButton
						icon={EventNoteIcon}
						label="Plan"
						tooltip={t("plan") || "Plan"}
						isActive={activePath === "/plans"}
						onClick={() => handleNavigate("/plans")}
						disabled={navLoading}
					/>
					<NavButton
						icon={SettingsIcon}
						label="Settings"
						tooltip={t("settings")}
						isActive={activePath === "/settings"}
						onClick={() => handleNavigate("/settings")}
						disabled={navLoading}
					/>
				</Box>

				{/* Profile */}
				<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
					{/* Streak indicator */}
					<Tooltip title={t("current_streak") || "Current Streak"} arrow>
						<MotionBox
							whileHover={{ scale: 1.08 }}
							whileTap={{ scale: 0.95 }}
							// onClick={() => handleNavigate("/stats")}
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 0.5,
								px: 1.25,
								py: 0.5,
								borderRadius: "10px",
								cursor: "pointer",
								background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
								boxShadow: "0 2px 8px rgba(239, 68, 68, 0.35)",
								transition: "all 0.2s ease",
								"&:hover": {
									boxShadow: "0 4px 14px rgba(239, 68, 68, 0.45)",
								},
							}}
						>
							<LocalFireDepartmentIcon
								sx={{ fontSize: 18, color: "#fbbf24" }}
							/>
							<Typography
								sx={{
									color: "#fff",
									fontWeight: 700,
									fontSize: "0.85rem",
									fontFamily: "Inter, sans-serif",
									lineHeight: 1,
								}}
							>
								{streak}
							</Typography>
						</MotionBox>
					</Tooltip>

					<MotionIconButton
						onClick={handleProfileClick}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						sx={{
							p: 0.5,
							border: (theme) =>
								`2px solid ${
									theme.palette.mode === "dark"
										? "rgba(59, 130, 246, 0.3)"
										: "rgba(59, 130, 246, 0.2)"
								}`,
							borderRadius: "12px",
							background: (theme) =>
								theme.palette.mode === "dark"
									? "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)"
									: "linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)",
							transition: "all 0.2s ease",
							"&:hover": {
								borderColor: "primary.main",
							},
						}}
					>
						{photoURL ? (
							<Avatar
								src={photoURL}
								alt={displayName || "Profile"}
								sx={{
									width: 28,
									height: 28,
									borderRadius: "8px",
								}}
							/>
						) : (
							<AccountCircleIcon
								sx={{
									fontSize: 28,
									color: "primary.main",
								}}
							/>
						)}
					</MotionIconButton>

					<Popover
						open={open}
						anchorEl={anchorEl}
						onClose={handlePopoverClose}
						anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
						transformOrigin={{ vertical: "top", horizontal: "right" }}
						sx={{ mt: 1.5 }}
						PaperProps={{
							sx: {
								bgcolor: "background.paper",
								borderRadius: 3,
								boxShadow: (theme) =>
									theme.palette.mode === "dark"
										? "0 20px 50px rgba(0, 0, 0, 0.5)"
										: "0 20px 50px rgba(0, 0, 0, 0.15)",
								border: (theme) =>
									`1px solid ${
										theme.palette.mode === "dark"
											? "rgba(255, 255, 255, 0.08)"
											: "rgba(0, 0, 0, 0.06)"
									}`,
								p: 0,
								minWidth: 220,
								overflow: "hidden",
							},
						}}
					>
						<AnimatePresence initial={false}>
							<MotionBox
								initial={{ y: -10 }}
								animate={{ y: 0 }}
								transition={{ duration: 0.2 }}
							>
								{/* Profile Header */}
								<Box
									sx={{
										p: 3,
										background: (theme) =>
											theme.palette.mode === "dark"
												? "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)"
												: "linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)",
										borderBottom: (theme) =>
											`1px solid ${theme.palette.border.main}`,
										textAlign: "center",
									}}
								>
									{photoURL ? (
										<Avatar
											src={photoURL}
											alt={displayName || "Profile"}
											sx={{
												width: 56,
												height: 56,
												borderRadius: "14px",
												mx: "auto",
												mb: 1.5,
												boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
											}}
										/>
									) : (
										<Box
											sx={{
												width: 56,
												height: 56,
												borderRadius: "14px",
												background:
													"linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												mx: "auto",
												mb: 1.5,
												boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
											}}
										>
											<AccountCircleIcon
												sx={{ fontSize: 32, color: "white" }}
											/>
										</Box>
									)}
									<Typography
										variant="subtitle1"
										sx={{
											fontWeight: 600,
											color: "text.cardTitle",
											fontFamily: "Inter, sans-serif",
										}}
									>
										{displayName || t("profile")}
									</Typography>
									{email && (
										<Typography
											variant="body2"
											sx={{
												color: "text.cardSubtitle",
												fontFamily: "Inter, sans-serif",
												fontSize: "0.75rem",
											}}
										>
											{email}
										</Typography>
									)}
								</Box>

								{/* Actions */}
								<Box sx={{ p: 2 }}>
									<Button
										fullWidth
										startIcon={<AccountCircleIcon />}
										onClick={() => {
											navigate("/account");
											setAnchorEl(null);
										}}
										sx={{
											justifyContent: "flex-start",
											py: 1.5,
											px: 2,
											borderRadius: 2,
											fontWeight: 600,
											fontFamily: "Inter, sans-serif",
											transition: "all 0.2s ease",
											"&:hover": {
												backgroundColor: (theme) =>
													alpha(theme.palette.action.hover, 0.06),
											},
										}}
									>
										{t("account") || "Account"}
									</Button>
									<Button
										fullWidth
										startIcon={<LogoutIcon />}
										onClick={handleLogout}
										sx={{
											justifyContent: "flex-start",
											py: 1.5,
											px: 2,
											borderRadius: 2,
											fontWeight: 600,
											fontFamily: "Inter, sans-serif",
											color: "error.main",
											backgroundColor: (theme) =>
												alpha(theme.palette.error.main, 0.08),
											transition: "all 0.2s ease",
											"&:hover": {
												backgroundColor: (theme) =>
													alpha(theme.palette.error.main, 0.15),
											},
										}}
									>
										{t("logout")}
									</Button>
								</Box>
							</MotionBox>
						</AnimatePresence>
					</Popover>
				</Box>
			</Toolbar>
		</AppBar>
	);
}
