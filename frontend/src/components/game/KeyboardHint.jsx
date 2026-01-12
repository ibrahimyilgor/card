import React from "react";
import { Box, Typography } from "@mui/material";

const KeyboardHint = ({ icon: Icon, label }) => (
	<Box
		sx={{
			display: "flex",
			alignItems: "center",
			gap: 0.75,
			color: "text.cardSubtitle",
			fontSize: "0.75rem",
			fontFamily: "Inter, sans-serif",
		}}
	>
		<Box
			sx={{
				width: 28,
				height: 28,
				borderRadius: "8px",
				bgcolor: (theme) =>
					theme.palette.mode === "dark"
						? "rgba(255, 255, 255, 0.08)"
						: "rgba(0, 0, 0, 0.06)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				border: (theme) =>
					`1px solid ${
						theme.palette.mode === "dark"
							? "rgba(255, 255, 255, 0.1)"
							: "rgba(0, 0, 0, 0.1)"
					}`,
			}}
		>
			<Icon sx={{ fontSize: 16 }} />
		</Box>
		<Typography variant="caption" sx={{ color: "inherit" }}>
			{label}
		</Typography>
	</Box>
);

export default KeyboardHint;
