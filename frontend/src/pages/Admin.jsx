import React, { useState, useEffect, useContext, useCallback } from "react";
import {
	Box,
	Typography,
	CircularProgress,
	InputAdornment,
	Avatar,
	Chip,
	IconButton,
	Tooltip,
	alpha,
	useTheme,
	Select,
	MenuItem,
	FormControl,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PeopleIcon from "@mui/icons-material/People";
import StyleIcon from "@mui/icons-material/Style";
import LayersIcon from "@mui/icons-material/Layers";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { I18nContext } from "../utils/i18n";
import {
	getUsers,
	getPlans,
	getAdminStats,
	changeUserPlan,
} from "../services/adminServices";
import {
	StyledCard,
	StyledButton,
	StyledTextField,
	EmptyState,
} from "../components/ui";

const MotionBox = motion.create(Box);

// Stat card component
const StatCard = ({ icon, label, value, color }) => {
	const theme = useTheme();

	return (
		<StyledCard
			variant="default"
			sx={{
				p: 2.5,
				display: "flex",
				alignItems: "center",
				gap: 2,
			}}
		>
			<Box
				sx={{
					width: 48,
					height: 48,
					borderRadius: 2,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`,
				}}
			>
				{icon}
			</Box>
			<Box>
				<Typography
					variant="h5"
					sx={{ fontWeight: 700, color: "text.primary" }}
				>
					{value}
				</Typography>
				<Typography variant="body2" sx={{ color: "text.secondary" }}>
					{label}
				</Typography>
			</Box>
		</StyledCard>
	);
};

// User row component
const UserRow = ({ user, plans, onPlanChange }) => {
	const theme = useTheme();
	const [isEditing, setIsEditing] = useState(false);
	const [selectedPlan, setSelectedPlan] = useState(user.plan_code || "free");
	const [loading, setLoading] = useState(false);

	const handleSave = async () => {
		if (selectedPlan === user.plan_code) {
			setIsEditing(false);
			return;
		}

		setLoading(true);
		try {
			await onPlanChange(user.id, selectedPlan);
			setIsEditing(false);
		} catch (err) {
			console.error("Error changing plan:", err);
			setSelectedPlan(user.plan_code || "free");
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		setSelectedPlan(user.plan_code || "free");
		setIsEditing(false);
	};

	const getPlanColor = (planCode) => {
		switch (planCode) {
			case "premium":
				return "#f59e0b";
			case "pro":
				return "#8b5cf6";
			default:
				return "#6b7280";
		}
	};

	const getRoleColor = (role) => {
		return role === "admin" ? "#ef4444" : "#3b82f6";
	};

	return (
		<MotionBox
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, scale: 0.95 }}
			layout
		>
			<StyledCard
				variant="default"
				sx={{
					p: 2,
					mb: 1.5,
				}}
			>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						gap: 2,
						flexWrap: "wrap",
					}}
				>
					{/* Avatar */}
					<Avatar
						src={user.photo_url}
						alt={user.display_name}
						sx={{
							width: 44,
							height: 44,
							border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
						}}
					>
						{user.display_name?.[0] || user.email?.[0] || "?"}
					</Avatar>

					{/* User info */}
					<Box sx={{ flex: 1, minWidth: 200 }}>
						<Box
							sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
						>
							<Typography
								variant="subtitle1"
								sx={{ fontWeight: 600, color: "text.primary" }}
							>
								{user.display_name || "No Name"}
							</Typography>
							{user.role === "admin" && (
								<Chip
									label="Admin"
									size="small"
									sx={{
										height: 20,
										fontSize: "0.7rem",
										backgroundColor: alpha(getRoleColor(user.role), 0.15),
										color: getRoleColor(user.role),
										fontWeight: 600,
									}}
								/>
							)}
						</Box>
						<Typography variant="body2" sx={{ color: "text.secondary" }}>
							{user.email}
						</Typography>
					</Box>

					{/* Stats */}
					<Box
						sx={{
							display: "flex",
							gap: 3,
							px: 2,
						}}
					>
						<Box sx={{ textAlign: "center" }}>
							<Typography
								variant="h6"
								sx={{ fontWeight: 600, color: "text.primary" }}
							>
								{user.deck_count || 0}
							</Typography>
							<Typography variant="caption" sx={{ color: "text.secondary" }}>
								Decks
							</Typography>
						</Box>
						<Box sx={{ textAlign: "center" }}>
							<Typography
								variant="h6"
								sx={{ fontWeight: 600, color: "text.primary" }}
							>
								{user.flashcard_count || 0}
							</Typography>
							<Typography variant="caption" sx={{ color: "text.secondary" }}>
								Cards
							</Typography>
						</Box>
					</Box>

					{/* Plan selector */}
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 1,
							minWidth: 180,
						}}
					>
						{isEditing ? (
							<>
								<FormControl size="small" sx={{ minWidth: 100 }}>
									<Select
										value={selectedPlan}
										onChange={(e) => setSelectedPlan(e.target.value)}
										disabled={loading}
										sx={{
											fontSize: "0.875rem",
											"& .MuiSelect-select": {
												py: 1,
											},
										}}
									>
										{plans.map((plan) => (
											<MenuItem key={plan.code} value={plan.code}>
												{plan.name}
											</MenuItem>
										))}
									</Select>
								</FormControl>
								<IconButton
									size="small"
									onClick={handleSave}
									disabled={loading}
									sx={{
										color: "success.main",
										"&:hover": {
											backgroundColor: alpha(theme.palette.success.main, 0.1),
										},
									}}
								>
									{loading ? (
										<CircularProgress size={18} />
									) : (
										<CheckIcon fontSize="small" />
									)}
								</IconButton>
								<IconButton
									size="small"
									onClick={handleCancel}
									disabled={loading}
									sx={{
										color: "error.main",
										"&:hover": {
											backgroundColor: alpha(theme.palette.error.main, 0.1),
										},
									}}
								>
									<CloseIcon fontSize="small" />
								</IconButton>
							</>
						) : (
							<>
								<Chip
									label={user.plan_name || "Free"}
									size="small"
									sx={{
										backgroundColor: alpha(getPlanColor(user.plan_code), 0.15),
										color: getPlanColor(user.plan_code),
										fontWeight: 600,
										minWidth: 80,
									}}
								/>
								<Tooltip title="Change Plan">
									<IconButton
										size="small"
										onClick={() => setIsEditing(true)}
										sx={{
											color: "text.secondary",
											"&:hover": {
												color: "primary.main",
												backgroundColor: alpha(theme.palette.primary.main, 0.1),
											},
										}}
									>
										<EditIcon fontSize="small" />
									</IconButton>
								</Tooltip>
							</>
						)}
					</Box>
				</Box>
			</StyledCard>
		</MotionBox>
	);
};

export default function Admin() {
	const theme = useTheme();
	const { t } = useContext(I18nContext);

	const [users, setUsers] = useState([]);
	const [plans, setPlans] = useState([]);
	const [stats, setStats] = useState(null);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 20,
		totalUsers: 0,
		totalPages: 0,
	});

	// Fetch initial data
	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const [usersRes, plansRes, statsRes] = await Promise.all([
					getUsers({ page: 1, limit: 20 }),
					getPlans(),
					getAdminStats(),
				]);

				if (usersRes.data) {
					setUsers(usersRes.data.users || []);
					setPagination(usersRes.data.pagination || pagination);
				}
				if (plansRes.data) {
					setPlans(plansRes.data.plans || []);
				}
				if (statsRes.data) {
					setStats(statsRes.data);
				}
			} catch (err) {
				console.error("Error fetching admin data:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	// Search users with debounce
	useEffect(() => {
		const timer = setTimeout(async () => {
			try {
				const res = await getUsers({
					search: searchQuery,
					page: 1,
					limit: pagination.limit,
				});
				if (res.data) {
					setUsers(res.data.users || []);
					setPagination(res.data.pagination || pagination);
				}
			} catch (err) {
				console.error("Error searching users:", err);
			}
		}, 300);

		return () => clearTimeout(timer);
	}, [searchQuery]);

	const handlePlanChange = useCallback(
		async (userId, planCode) => {
			const res = await changeUserPlan(userId, planCode);
			if (res.data?.success) {
				// Update local state
				setUsers((prev) =>
					prev.map((user) =>
						user.id === userId
							? {
									...user,
									plan_code: planCode,
									plan_name:
										plans.find((p) => p.code === planCode)?.name || planCode,
								}
							: user,
					),
				);
				// Refresh stats
				const statsRes = await getAdminStats();
				if (statsRes.data) {
					setStats(statsRes.data);
				}
			}
			return res;
		},
		[plans],
	);

	const loadMoreUsers = async () => {
		if (pagination.page >= pagination.totalPages) return;

		try {
			const res = await getUsers({
				search: searchQuery,
				page: pagination.page + 1,
				limit: pagination.limit,
			});
			if (res.data) {
				setUsers((prev) => [...prev, ...(res.data.users || [])]);
				setPagination(res.data.pagination || pagination);
			}
		} catch (err) {
			console.error("Error loading more users:", err);
		}
	};

	if (loading) {
		return (
			<Box
				sx={{
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box
			sx={{
				height: "100%",
				p: { xs: 2, sm: 3 },
				overflow: "auto",
			}}
		>
			{/* Header */}
			<Box sx={{ mb: 4 }}>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
					<Box
						sx={{
							width: 48,
							height: 48,
							borderRadius: 2,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
						}}
					>
						<AdminPanelSettingsIcon sx={{ fontSize: 28, color: "white" }} />
					</Box>
					<Box>
						<Typography
							variant="h4"
							sx={{ fontWeight: 700, color: "text.primary" }}
						>
							Admin Panel
						</Typography>
						<Typography variant="body2" sx={{ color: "text.secondary" }}>
							Manage users and their subscription plans
						</Typography>
					</Box>
				</Box>
			</Box>

			{/* Stats Cards */}
			{stats && (
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: {
							xs: "1fr",
							sm: "repeat(2, 1fr)",
							md: "repeat(4, 1fr)",
						},
						gap: 2,
						mb: 4,
					}}
				>
					<StatCard
						icon={<PeopleIcon sx={{ fontSize: 24, color: "white" }} />}
						label="Total Users"
						value={stats.totalUsers}
						color="#3b82f6"
					/>
					<StatCard
						icon={<LayersIcon sx={{ fontSize: 24, color: "white" }} />}
						label="Total Decks"
						value={stats.totalDecks}
						color="#8b5cf6"
					/>
					<StatCard
						icon={<StyleIcon sx={{ fontSize: 24, color: "white" }} />}
						label="Total Flashcards"
						value={stats.totalFlashcards}
						color="#10b981"
					/>
					<StatCard
						icon={
							<AdminPanelSettingsIcon sx={{ fontSize: 24, color: "white" }} />
						}
						label="Pro/Premium Users"
						value={
							stats.planDistribution
								?.filter((p) => p.code !== "free")
								.reduce((acc, p) => acc + parseInt(p.user_count), 0) || 0
						}
						color="#f59e0b"
					/>
				</Box>
			)}

			{/* Plan Distribution */}
			{stats?.planDistribution && (
				<Box sx={{ mb: 4 }}>
					<Typography
						variant="subtitle1"
						sx={{ fontWeight: 600, mb: 2, color: "text.primary" }}
					>
						Plan Distribution
					</Typography>
					<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
						{stats.planDistribution.map((plan) => (
							<Chip
								key={plan.code}
								label={`${plan.name}: ${plan.user_count} users`}
								sx={{
									backgroundColor: alpha(
										plan.code === "premium"
											? "#f59e0b"
											: plan.code === "pro"
												? "#8b5cf6"
												: "#6b7280",
										0.15,
									),
									color:
										plan.code === "premium"
											? "#f59e0b"
											: plan.code === "pro"
												? "#8b5cf6"
												: "#6b7280",
									fontWeight: 600,
								}}
							/>
						))}
					</Box>
				</Box>
			)}

			{/* Search */}
			<Box sx={{ mb: 3 }}>
				<StyledTextField
					fullWidth
					size="small"
					placeholder="Search users by email or name..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon sx={{ color: "text.secondary", fontSize: 20 }} />
							</InputAdornment>
						),
						endAdornment: searchQuery && (
							<InputAdornment position="end">
								<IconButton
									size="small"
									onClick={() => setSearchQuery("")}
									sx={{ color: "text.secondary" }}
								>
									<ClearIcon fontSize="small" />
								</IconButton>
							</InputAdornment>
						),
					}}
					sx={{ maxWidth: 500 }}
				/>
			</Box>

			{/* Users List */}
			<Box sx={{ mb: 2 }}>
				<Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 2 }}>
					{pagination.totalUsers} users found
				</Typography>

				{users.length === 0 ? (
					<EmptyState
						icon={<PeopleIcon sx={{ fontSize: 48 }} />}
						title="No users found"
						description="Try adjusting your search query"
					/>
				) : (
					<AnimatePresence mode="popLayout">
						{users.map((user) => (
							<UserRow
								key={user.id}
								user={user}
								plans={plans}
								onPlanChange={handlePlanChange}
							/>
						))}
					</AnimatePresence>
				)}

				{/* Load More */}
				{pagination.page < pagination.totalPages && (
					<Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
						<StyledButton variant="ghost" onClick={loadMoreUsers}>
							Load More ({pagination.totalUsers - users.length} remaining)
						</StyledButton>
					</Box>
				)}
			</Box>
		</Box>
	);
}
