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
			title={title}
			icon={<Icon sx={{ fontSize: 24, color: "white" }} />}
			maxWidth={420}
			actions={
				<>
					<StyledButton variant="ghost" onClick={onClose} disabled={loading}>
						{cancelText}
					</StyledButton>
					<StyledButton
						variant={variant}
						onClick={onConfirm}
						disabled={loading}
					>
						{loading ? "..." : confirmText}
					</StyledButton>
				</>
			}
		>
			<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
				{/* Item Name (if provided) */}
				{itemName && (
					<Box
						sx={{
							px: 2,
							py: 1,
							borderRadius: 2,
							background: alpha(iconColor, 0.1),
							border: `1px solid ${alpha(iconColor, 0.2)}`,
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
				{message && (
					<Typography
						variant="body2"
						sx={{
							color: "text.cardSubtitle",
							fontFamily: "Inter, sans-serif",
							lineHeight: 1.7,
							wordBreak: "break-word",
						}}
					>
						{message}
					</Typography>
				)}
			</Box>
		</StyledModal>
	);
}
