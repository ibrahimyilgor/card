import { Box, Skeleton } from "@mui/material";
import { motion } from "framer-motion";

const MotionBox = motion.create(Box);

export const CardSkeleton = ({ count = 1, sx = {} }) => {
	return (
		<>
			{Array.from({ length: count }).map((_, index) => (
				<MotionBox
					key={index}
					initial={{ y: 10 }}
					animate={{ y: 0 }}
					transition={{ duration: 0.3, delay: index * 0.1 }}
					sx={{
						borderRadius: "16px",
						overflow: "hidden",
						background: (theme) =>
							theme.palette.mode === "dark"
								? "rgba(255, 255, 255, 0.03)"
								: "rgba(0, 0, 0, 0.02)",
						border: (theme) =>
							`1px solid ${
								theme.palette.mode === "dark"
									? "rgba(255, 255, 255, 0.06)"
									: "rgba(0, 0, 0, 0.06)"
							}`,
						padding: 3,
						...sx,
					}}
				>
					<Skeleton
						variant="text"
						width="60%"
						height={32}
						sx={{
							bgcolor: (theme) =>
								theme.palette.mode === "dark"
									? "rgba(255, 255, 255, 0.08)"
									: "rgba(0, 0, 0, 0.08)",
							borderRadius: "8px",
						}}
					/>
					<Skeleton
						variant="text"
						width="80%"
						height={20}
						sx={{
							bgcolor: (theme) =>
								theme.palette.mode === "dark"
									? "rgba(255, 255, 255, 0.06)"
									: "rgba(0, 0, 0, 0.06)",
							borderRadius: "6px",
							mt: 1,
						}}
					/>
					<Skeleton
						variant="text"
						width="40%"
						height={20}
						sx={{
							bgcolor: (theme) =>
								theme.palette.mode === "dark"
									? "rgba(255, 255, 255, 0.04)"
									: "rgba(0, 0, 0, 0.04)",
							borderRadius: "6px",
							mt: 0.5,
						}}
					/>
					<Box sx={{ display: "flex", gap: 1, mt: 2 }}>
						{[1, 2, 3].map((i) => (
							<Skeleton
								key={i}
								variant="circular"
								width={36}
								height={36}
								sx={{
									bgcolor: (theme) =>
										theme.palette.mode === "dark"
											? "rgba(255, 255, 255, 0.06)"
											: "rgba(0, 0, 0, 0.06)",
								}}
							/>
						))}
					</Box>
				</MotionBox>
			))}
		</>
	);
};

export const StatsSkeleton = () => {
	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
					gap: 2,
				}}
			>
				{[1, 2, 3, 4].map((i) => (
					<MotionBox
						key={i}
						initial={{ y: 20 }}
						animate={{ y: 0 }}
						transition={{ duration: 0.3, delay: i * 0.1 }}
						sx={{
							borderRadius: "16px",
							padding: 3,
							background: (theme) =>
								theme.palette.mode === "dark"
									? "rgba(255, 255, 255, 0.03)"
									: "rgba(0, 0, 0, 0.02)",
							border: (theme) =>
								`1px solid ${
									theme.palette.mode === "dark"
										? "rgba(255, 255, 255, 0.06)"
										: "rgba(0, 0, 0, 0.06)"
								}`,
						}}
					>
						<Skeleton
							variant="text"
							width="50%"
							height={24}
							sx={{ borderRadius: "6px" }}
						/>
						<Skeleton
							variant="text"
							width="70%"
							height={40}
							sx={{ borderRadius: "8px", mt: 1 }}
						/>
					</MotionBox>
				))}
			</Box>
			<Skeleton
				variant="rectangular"
				height={300}
				sx={{
					borderRadius: "16px",
					bgcolor: (theme) =>
						theme.palette.mode === "dark"
							? "rgba(255, 255, 255, 0.03)"
							: "rgba(0, 0, 0, 0.02)",
				}}
			/>
		</Box>
	);
};

export const PageSkeleton = () => {
	return (
		<Box sx={{ padding: 4 }}>
			<Skeleton
				variant="text"
				width="200px"
				height={40}
				sx={{ borderRadius: "8px", mb: 4 }}
			/>
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
					gap: 3,
				}}
			>
				<CardSkeleton count={6} />
			</Box>
		</Box>
	);
};

// Achievement card skeleton
const AchievementCardSkeleton = () => {
	return (
		<Box
			sx={{
				p: 3,
				height: 220,
				width: 200,
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				borderRadius: "16px",
				background: (theme) =>
					theme.palette.mode === "dark"
						? "rgba(255, 255, 255, 0.03)"
						: "rgba(0, 0, 0, 0.02)",
				border: (theme) =>
					`1px solid ${theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)"}`,
			}}
		>
			<Skeleton
				variant="circular"
				width={64}
				height={64}
				sx={{
					mb: 2,
					bgcolor: (theme) =>
						theme.palette.mode === "dark"
							? "rgba(255, 255, 255, 0.08)"
							: "rgba(0, 0, 0, 0.08)",
				}}
			/>
			<Skeleton
				variant="text"
				width={120}
				height={24}
				sx={{
					borderRadius: "6px",
					mb: 1,
					bgcolor: (theme) =>
						theme.palette.mode === "dark"
							? "rgba(255, 255, 255, 0.06)"
							: "rgba(0, 0, 0, 0.06)",
				}}
			/>
			<Skeleton
				variant="text"
				width={80}
				height={16}
				sx={{
					borderRadius: "4px",
					bgcolor: (theme) =>
						theme.palette.mode === "dark"
							? "rgba(255, 255, 255, 0.04)"
							: "rgba(0, 0, 0, 0.04)",
				}}
			/>
		</Box>
	);
};

// Achievements page skeleton with categories
export const AchievementsSkeleton = () => {
	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
			{/* Progress indicator skeleton */}
			<MotionBox
				initial={{ y: 10 }}
				animate={{ y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<Skeleton
					variant="rounded"
					width={140}
					height={48}
					sx={{
						borderRadius: "12px",
						bgcolor: (theme) =>
							theme.palette.mode === "dark"
								? "rgba(255, 255, 255, 0.05)"
								: "rgba(0, 0, 0, 0.03)",
					}}
				/>
			</MotionBox>

			{/* Category sections */}
			{[1, 2, 3].map((categoryIndex) => (
				<MotionBox
					key={categoryIndex}
					initial={{ y: 20 }}
					animate={{ y: 0 }}
					transition={{ duration: 0.3, delay: categoryIndex * 0.1 }}
					sx={{ mb: 3 }}
				>
					{/* Category header skeleton */}
					<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
						<Skeleton
							variant="circular"
							width={28}
							height={28}
							sx={{
								bgcolor: (theme) =>
									theme.palette.mode === "dark"
										? "rgba(255, 255, 255, 0.08)"
										: "rgba(0, 0, 0, 0.08)",
							}}
						/>
						<Skeleton
							variant="text"
							width={100}
							height={28}
							sx={{
								borderRadius: "6px",
								bgcolor: (theme) =>
									theme.palette.mode === "dark"
										? "rgba(255, 255, 255, 0.06)"
										: "rgba(0, 0, 0, 0.06)",
							}}
						/>
					</Box>

					{/* Achievement cards grid */}
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: {
								xs: "repeat(2, 1fr)",
								sm: "repeat(3, 1fr)",
								md: "repeat(4, 1fr)",
							},
							gap: 2,
						}}
					>
						{[1, 2, 3, 4].map((i) => (
							<AchievementCardSkeleton key={i} />
						))}
					</Box>
				</MotionBox>
			))}
		</Box>
	);
};

// Plan card skeleton
export const PlanSkeleton = () => {
	return (
		<MotionBox
			initial={{ y: 20 }}
			animate={{ y: 0 }}
			transition={{ duration: 0.3 }}
			sx={{
				p: 3,
				height: 400,
				display: "flex",
				flexDirection: "column",
				borderRadius: "16px",
				background: (theme) =>
					theme.palette.mode === "dark"
						? "rgba(255, 255, 255, 0.03)"
						: "rgba(0, 0, 0, 0.02)",
				border: (theme) =>
					`1px solid ${theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)"}`,
			}}
		>
			{/* Plan icon */}
			<Skeleton
				variant="rounded"
				width={64}
				height={64}
				sx={{
					mb: 2,
					borderRadius: "16px",
					bgcolor: (theme) =>
						theme.palette.mode === "dark"
							? "rgba(255, 255, 255, 0.08)"
							: "rgba(0, 0, 0, 0.08)",
				}}
			/>

			{/* Plan name */}
			<Skeleton
				variant="text"
				width="60%"
				height={32}
				sx={{
					mb: 0.5,
					borderRadius: "8px",
					bgcolor: (theme) =>
						theme.palette.mode === "dark"
							? "rgba(255, 255, 255, 0.08)"
							: "rgba(0, 0, 0, 0.08)",
				}}
			/>

			{/* Price */}
			<Skeleton
				variant="text"
				width="40%"
				height={40}
				sx={{
					mb: 2,
					borderRadius: "8px",
					bgcolor: (theme) =>
						theme.palette.mode === "dark"
							? "rgba(255, 255, 255, 0.06)"
							: "rgba(0, 0, 0, 0.06)",
				}}
			/>

			{/* Description */}
			<Skeleton
				variant="text"
				width="100%"
				height={20}
				sx={{
					mb: 0.5,
					borderRadius: "6px",
					bgcolor: (theme) =>
						theme.palette.mode === "dark"
							? "rgba(255, 255, 255, 0.04)"
							: "rgba(0, 0, 0, 0.04)",
				}}
			/>
			<Skeleton
				variant="text"
				width="80%"
				height={20}
				sx={{
					mb: 3,
					borderRadius: "6px",
					bgcolor: (theme) =>
						theme.palette.mode === "dark"
							? "rgba(255, 255, 255, 0.04)"
							: "rgba(0, 0, 0, 0.04)",
				}}
			/>

			{/* Features */}
			{[1, 2, 3].map((i) => (
				<Box
					key={i}
					sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
				>
					<Skeleton
						variant="circular"
						width={20}
						height={20}
						sx={{
							bgcolor: (theme) =>
								theme.palette.mode === "dark"
									? "rgba(255, 255, 255, 0.06)"
									: "rgba(0, 0, 0, 0.06)",
						}}
					/>
					<Skeleton
						variant="text"
						width="70%"
						height={20}
						sx={{
							borderRadius: "4px",
							bgcolor: (theme) =>
								theme.palette.mode === "dark"
									? "rgba(255, 255, 255, 0.04)"
									: "rgba(0, 0, 0, 0.04)",
						}}
					/>
				</Box>
			))}

			{/* Spacer */}
			<Box sx={{ flex: 1 }} />

			{/* Button */}
			<Skeleton
				variant="rounded"
				width="100%"
				height={42}
				sx={{
					borderRadius: "12px",
					bgcolor: (theme) =>
						theme.palette.mode === "dark"
							? "rgba(255, 255, 255, 0.08)"
							: "rgba(0, 0, 0, 0.08)",
				}}
			/>
		</MotionBox>
	);
};

// Setting item skeleton (for settings page)
const SettingItemSkeleton = ({ delay = 0 }) => {
	return (
		<MotionBox
			initial={{ y: 20 }}
			animate={{ y: 0 }}
			transition={{ duration: 0.3, delay }}
			sx={{
				p: 3,
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				gap: 3,
				borderRadius: "16px",
				background: (theme) =>
					theme.palette.mode === "dark"
						? "rgba(255, 255, 255, 0.03)"
						: "rgba(0, 0, 0, 0.02)",
				border: (theme) =>
					`1px solid ${theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)"}`,
			}}
		>
			<Box sx={{ display: "flex", alignItems: "center", gap: 2.5, flex: 1 }}>
				<Skeleton
					variant="rounded"
					width={48}
					height={48}
					sx={{
						borderRadius: "12px",
						bgcolor: (theme) =>
							theme.palette.mode === "dark"
								? "rgba(255, 255, 255, 0.08)"
								: "rgba(0, 0, 0, 0.08)",
					}}
				/>
				<Box sx={{ flex: 1 }}>
					<Skeleton
						variant="text"
						width="50%"
						height={24}
						sx={{
							borderRadius: "6px",
							mb: 0.5,
							bgcolor: (theme) =>
								theme.palette.mode === "dark"
									? "rgba(255, 255, 255, 0.08)"
									: "rgba(0, 0, 0, 0.08)",
						}}
					/>
					<Skeleton
						variant="text"
						width="70%"
						height={18}
						sx={{
							borderRadius: "4px",
							bgcolor: (theme) =>
								theme.palette.mode === "dark"
									? "rgba(255, 255, 255, 0.04)"
									: "rgba(0, 0, 0, 0.04)",
						}}
					/>
				</Box>
			</Box>
			<Skeleton
				variant="rounded"
				width={50}
				height={28}
				sx={{
					borderRadius: "14px",
					bgcolor: (theme) =>
						theme.palette.mode === "dark"
							? "rgba(255, 255, 255, 0.08)"
							: "rgba(0, 0, 0, 0.08)",
				}}
			/>
		</MotionBox>
	);
};

// Settings page skeleton
export const SettingsSkeleton = () => {
	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
			{/* Section header skeleton */}
			<Skeleton
				variant="text"
				width={100}
				height={20}
				sx={{
					borderRadius: "4px",
					mb: 1,
					mt: 2,
					bgcolor: (theme) =>
						theme.palette.mode === "dark"
							? "rgba(255, 255, 255, 0.06)"
							: "rgba(0, 0, 0, 0.06)",
				}}
			/>
			{/* Setting items */}
			{[0, 1, 2].map((i) => (
				<SettingItemSkeleton key={i} delay={i * 0.1} />
			))}

			{/* Another section */}
			<Skeleton
				variant="text"
				width={120}
				height={20}
				sx={{
					borderRadius: "4px",
					mb: 1,
					mt: 3,
					bgcolor: (theme) =>
						theme.palette.mode === "dark"
							? "rgba(255, 255, 255, 0.06)"
							: "rgba(0, 0, 0, 0.06)",
				}}
			/>
			<SettingItemSkeleton delay={0.3} />

			{/* Save button skeleton */}
			<Box sx={{ mt: 3 }}>
				<Skeleton
					variant="rounded"
					width={120}
					height={42}
					sx={{
						borderRadius: "12px",
						bgcolor: (theme) =>
							theme.palette.mode === "dark"
								? "rgba(255, 255, 255, 0.08)"
								: "rgba(0, 0, 0, 0.08)",
					}}
				/>
			</Box>
		</Box>
	);
};

// Account info card skeleton
const AccountInfoCardSkeleton = ({ delay = 0 }) => {
	return (
		<MotionBox
			initial={{ y: 20 }}
			animate={{ y: 0 }}
			transition={{ duration: 0.3, delay }}
			sx={{
				p: 3,
				display: "flex",
				alignItems: "center",
				gap: 2.5,
				borderRadius: "16px",
				background: (theme) =>
					theme.palette.mode === "dark"
						? "rgba(255, 255, 255, 0.03)"
						: "rgba(0, 0, 0, 0.02)",
				border: (theme) =>
					`1px solid ${theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)"}`,
			}}
		>
			<Skeleton
				variant="rounded"
				width={48}
				height={48}
				sx={{
					borderRadius: "12px",
					bgcolor: (theme) =>
						theme.palette.mode === "dark"
							? "rgba(255, 255, 255, 0.08)"
							: "rgba(0, 0, 0, 0.08)",
				}}
			/>
			<Box sx={{ flex: 1 }}>
				<Skeleton
					variant="text"
					width="40%"
					height={18}
					sx={{
						borderRadius: "4px",
						mb: 0.5,
						bgcolor: (theme) =>
							theme.palette.mode === "dark"
								? "rgba(255, 255, 255, 0.04)"
								: "rgba(0, 0, 0, 0.04)",
					}}
				/>
				<Skeleton
					variant="text"
					width="60%"
					height={24}
					sx={{
						borderRadius: "6px",
						bgcolor: (theme) =>
							theme.palette.mode === "dark"
								? "rgba(255, 255, 255, 0.08)"
								: "rgba(0, 0, 0, 0.08)",
					}}
				/>
			</Box>
		</MotionBox>
	);
};

// Account page skeleton
export const AccountSkeleton = () => {
	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
			{/* Section header skeleton */}
			<Skeleton
				variant="text"
				width={140}
				height={20}
				sx={{
					borderRadius: "4px",
					mt: 2,
					bgcolor: (theme) =>
						theme.palette.mode === "dark"
							? "rgba(255, 255, 255, 0.06)"
							: "rgba(0, 0, 0, 0.06)",
				}}
			/>

			{/* Info cards grid */}
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
					gap: 2,
				}}
			>
				{[0, 1, 2, 3].map((i) => (
					<AccountInfoCardSkeleton key={i} delay={i * 0.1} />
				))}
			</Box>

			{/* Change password section */}
			<Skeleton
				variant="text"
				width={160}
				height={20}
				sx={{
					borderRadius: "4px",
					mt: 3,
					bgcolor: (theme) =>
						theme.palette.mode === "dark"
							? "rgba(255, 255, 255, 0.06)"
							: "rgba(0, 0, 0, 0.06)",
				}}
			/>

			<MotionBox
				initial={{ y: 20 }}
				animate={{ y: 0 }}
				transition={{ duration: 0.3, delay: 0.4 }}
				sx={{
					p: 3,
					borderRadius: "16px",
					background: (theme) =>
						theme.palette.mode === "dark"
							? "rgba(255, 255, 255, 0.03)"
							: "rgba(0, 0, 0, 0.02)",
					border: (theme) =>
						`1px solid ${theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)"}`,
				}}
			>
				{/* Password fields */}
				{[1, 2, 3].map((i) => (
					<Skeleton
						key={i}
						variant="rounded"
						width="100%"
						height={56}
						sx={{
							borderRadius: "12px",
							mb: 2,
							bgcolor: (theme) =>
								theme.palette.mode === "dark"
									? "rgba(255, 255, 255, 0.06)"
									: "rgba(0, 0, 0, 0.06)",
						}}
					/>
				))}
				<Skeleton
					variant="rounded"
					width={180}
					height={42}
					sx={{
						borderRadius: "12px",
						bgcolor: (theme) =>
							theme.palette.mode === "dark"
								? "rgba(255, 255, 255, 0.08)"
								: "rgba(0, 0, 0, 0.08)",
					}}
				/>
			</MotionBox>
		</Box>
	);
};

export default CardSkeleton;
