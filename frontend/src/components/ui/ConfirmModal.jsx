import { Box, Typography, alpha, useTheme } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import StyledModal from "./StyledModal";
import StyledButton from "./StyledButton";

/**
 * Generic confirmation modal component
 * @param {boolean} open - Whether the modal is open
 * @param {function} onClose - Function to close the modal
 * @param {function} onConfirm - Function to call when confirmed
 * @param {string} title - Modal title
 * @param {string} message - Confirmation message
 * @param {string} itemName - Name of the item being acted upon (optional, displayed highlighted)
 * @param {string} confirmText - Text for confirm button (default: "Confirm")
 * @param {string} cancelText - Text for cancel button (default: "Cancel")
 * @param {string} variant - Button variant: "danger" | "warning" | "primary" (default: "danger")
 * @param {React.ReactNode} icon - Custom icon (default: WarningAmberIcon)
 * @param {boolean} loading - Whether the confirm action is loading
 */
export default function ConfirmModal({
	open,
	onClose,
	onConfirm,
	title,
	message,
	itemName,
	confirmText = "Confirm",
	cancelText = "Cancel",
	variant = "danger",
	icon: CustomIcon,
	loading = false,
}) {
	const theme = useTheme();

	const getIconColor = () => {
		switch (variant) {
			case "danger":
				return "#ef4444";
			case "warning":
				return "#f59e0b";
			case "primary":
				return theme.palette.primary.main;
			default:
				return "#ef4444";
		}
	};

	const iconColor = getIconColor();
	const Icon = CustomIcon || WarningAmberIcon;

	return (
		<StyledModal
			open={open}
			onClose={onClose}
			maxWidth={420}
			showCloseButton={false}
		>
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					textAlign: "center",
					py: 2,
					px: 1,
					maxWidth: "100%",
					overflow: "hidden",
				}}
			>
				{/* Icon */}
				<Box
					sx={{
						width: 64,
						height: 64,
						borderRadius: "16px",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						background: alpha(iconColor, 0.15),
						border: `1px solid ${alpha(iconColor, 0.3)}`,
						mb: 3,
						flexShrink: 0,
					}}
				>
					<Icon sx={{ fontSize: 32, color: iconColor }} />
				</Box>

				{/* Title */}
				<Typography
					variant="h6"
					sx={{
						fontWeight: 700,
						color: "text.cardTitle",
						fontFamily: "Inter, sans-serif",
						mb: itemName ? 1 : 1.5,
						wordBreak: "break-word",
						maxWidth: "100%",
					}}
				>
					{title}
				</Typography>

				{/* Item Name (if provided) */}
				{itemName && (
					<Box
						sx={{
							mb: 2,
							px: 2,
							py: 1,
							borderRadius: 2,
							background: alpha(iconColor, 0.1),
							border: `1px solid ${alpha(iconColor, 0.2)}`,
							maxWidth: "100%",
						}}
					>
						<Typography
							variant="body1"
							sx={{
								fontWeight: 600,
								color: iconColor,
								fontFamily: "Inter, sans-serif",
								wordBreak: "break-word",
								overflow: "hidden",
								textOverflow: "ellipsis",
								display: "-webkit-box",
								WebkitLineClamp: 2,
								WebkitBoxOrient: "vertical",
							}}
						>
							{itemName}
						</Typography>
					</Box>
				)}

				{/* Message */}
				<Typography
					variant="body2"
					sx={{
						color: "text.cardSubtitle",
						fontFamily: "Inter, sans-serif",
						lineHeight: 1.7,
						mb: 4,
						px: 1,
						wordBreak: "break-word",
						maxWidth: "100%",
					}}
				>
					{message}
				</Typography>

				{/* Actions */}
				<Box
					sx={{
						display: "flex",
						gap: 2,
						width: "100%",
						flexWrap: "wrap",
					}}
				>
					<StyledButton
						variant="ghost"
						onClick={onClose}
						disabled={loading}
						sx={{ flex: 1 }}
					>
						{cancelText}
					</StyledButton>
					<StyledButton
						variant={variant}
						onClick={onConfirm}
						disabled={loading}
						sx={{ flex: 1 }}
					>
						{loading ? "..." : confirmText}
					</StyledButton>
				</Box>
			</Box>
		</StyledModal>
	);
}
