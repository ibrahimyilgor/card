import React, { useContext } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { I18nContext } from "../utils/i18n";
import { useSEO } from "../utils/seo";

const MotionBox = motion.create(Box);

const Section = ({ title, children }) => (
	<Box sx={{ mb: 4 }}>
		<Typography
			variant="h6"
			sx={{
				fontWeight: 700,
				color: "text.primary",
				fontFamily: "Inter, sans-serif",
				mb: 1.5,
			}}
		>
			{title}
		</Typography>
		{children}
	</Box>
);

const Paragraph = ({ children }) => (
	<Typography
		variant="body1"
		sx={{
			color: "text.secondary",
			fontFamily: "Inter, sans-serif",
			lineHeight: 1.8,
			mb: 1.5,
		}}
	>
		{children}
	</Typography>
);

export default function Privacy() {
	const theme = useTheme();
	const { t } = useContext(I18nContext);

	useSEO("privacy");

	return (
		<Box
			sx={{
				minHeight: "100vh",
				backgroundColor: "background.default",
				py: { xs: 4, sm: 6 },
				px: { xs: 2, sm: 4 },
			}}
		>
			<MotionBox
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				sx={{
					maxWidth: 800,
					mx: "auto",
				}}
			>
				{/* Header */}
				<Box sx={{ mb: 5 }}>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 1.5,
							mb: 2,
						}}
					>
						<Box
							component="img"
							src="/images/logo/memodeck.svg"
							alt="MemoDeck"
							sx={{
								width: 36,
								height: 36,
								borderRadius: "9px",
								objectFit: "cover",
							}}
						/>
						<Link to="/login" style={{ textDecoration: "none" }}>
							<Typography
								variant="h6"
								sx={{
									fontWeight: 700,
									background:
										"linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
									backgroundClip: "text",
									WebkitBackgroundClip: "text",
									WebkitTextFillColor: "transparent",
									fontFamily: "Inter, sans-serif",
								}}
							>
								MemoDeck
							</Typography>
						</Link>
					</Box>
					<Typography
						variant="h4"
						sx={{
							fontWeight: 800,
							color: "text.primary",
							fontFamily: "Inter, sans-serif",
							mb: 1,
						}}
					>
						{t("privacy_policy") || "Privacy Policy"}
					</Typography>
					<Typography
						variant="body2"
						sx={{ color: "text.secondary", fontFamily: "Inter, sans-serif" }}
					>
						{t("last_updated") || "Last updated"}: February 21, 2026
					</Typography>
				</Box>

				{/* Content */}
				<Section title={t("pp_intro_title") || "Introduction"}>
					<Paragraph>
						{t("pp_intro_text") ||
							'MemoDeck ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our web application at memodeck.app (the "Service"). Please read this Privacy Policy carefully. By using the Service, you agree to the collection and use of information in accordance with this policy.'}
					</Paragraph>
				</Section>

				<Section
					title={t("pp_data_collection_title") || "Information We Collect"}
				>
					<Paragraph>
						{t("pp_data_collection_text") ||
							"We collect information that you provide directly to us when you create an account and use our Service:"}
					</Paragraph>
					<Box component="ul" sx={{ color: "text.secondary", pl: 3 }}>
						<li>
							<Paragraph>
								{t("pp_data_google") ||
									"Google Account Information: When you sign in with Google, we receive your name, email address, and profile picture from your Google account."}
							</Paragraph>
						</li>
						<li>
							<Paragraph>
								{t("pp_data_usage") ||
									"Usage Data: We collect information about how you interact with the Service, including flashcard decks you create, study sessions, game statistics, and achievements."}
							</Paragraph>
						</li>
						<li>
							<Paragraph>
								{t("pp_data_preferences") ||
									"Preferences: We store your app preferences such as theme choice and language settings."}
							</Paragraph>
						</li>
					</Box>
				</Section>

				<Section title={t("pp_use_title") || "How We Use Your Information"}>
					<Paragraph>
						{t("pp_use_text") || "We use the information we collect to:"}
					</Paragraph>
					<Box component="ul" sx={{ color: "text.secondary", pl: 3 }}>
						<li>
							<Paragraph>
								{t("pp_use_1") || "Provide, maintain, and improve the Service"}
							</Paragraph>
						</li>
						<li>
							<Paragraph>
								{t("pp_use_2") ||
									"Track your learning progress and provide personalized statistics"}
							</Paragraph>
						</li>
						<li>
							<Paragraph>
								{t("pp_use_3") ||
									"Manage your account and provide customer support"}
							</Paragraph>
						</li>
						<li>
							<Paragraph>
								{t("pp_use_4") ||
									"Send you updates related to your account and the Service"}
							</Paragraph>
						</li>
					</Box>
				</Section>

				<Section
					title={t("pp_cookies_title") || "Cookies and Tracking Technologies"}
				>
					<Paragraph>
						{t("pp_cookies_text") ||
							"We use cookies and similar tracking technologies to maintain your session, remember your preferences, and analyze usage patterns. We also use Google Firebase for authentication and may use Google AdSense for advertising, which may use cookies to serve ads based on your prior visits. You can control cookies through your browser settings."}
					</Paragraph>
				</Section>

				<Section title={t("pp_thirdparty_title") || "Third-Party Services"}>
					<Paragraph>
						{t("pp_thirdparty_text") ||
							"Our Service integrates with the following third-party services:"}
					</Paragraph>
					<Box component="ul" sx={{ color: "text.secondary", pl: 3 }}>
						<li>
							<Paragraph>
								{t("pp_thirdparty_firebase") ||
									"Google Firebase: For authentication and user management."}
							</Paragraph>
						</li>
						<li>
							<Paragraph>
								{t("pp_thirdparty_adsense") ||
									"Google AdSense: For displaying advertisements. AdSense may use cookies and web beacons to serve ads based on your prior visits to our or other websites."}
							</Paragraph>
						</li>
					</Box>
				</Section>

				<Section title={t("pp_security_title") || "Data Security"}>
					<Paragraph>
						{t("pp_security_text") ||
							"We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet or method of electronic storage is 100% secure, and we cannot guarantee absolute security."}
					</Paragraph>
				</Section>

				<Section title={t("pp_retention_title") || "Data Retention"}>
					<Paragraph>
						{t("pp_retention_text") ||
							"We retain your personal information for as long as your account is active or as needed to provide you the Service. You can delete your account at any time through the Account settings page, which will remove your personal data from our systems."}
					</Paragraph>
				</Section>

				<Section title={t("pp_rights_title") || "Your Rights"}>
					<Paragraph>
						{t("pp_rights_text") ||
							"You have the right to access, update, or delete your personal information at any time. You can manage your profile information through the Account page. If you wish to delete your account entirely, please contact us at memodeck26@gmail.com."}
					</Paragraph>
				</Section>

				<Section title={t("pp_children_title") || "Children's Privacy"}>
					<Paragraph>
						{t("pp_children_text") ||
							"Our Service is not directed to children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal data from a child under 13, we will take steps to delete that information."}
					</Paragraph>
				</Section>

				<Section title={t("pp_changes_title") || "Changes to This Policy"}>
					<Paragraph>
						{t("pp_changes_text") ||
							'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Your continued use of the Service after any changes constitutes your acceptance of the updated policy.'}
					</Paragraph>
				</Section>

				<Section title={t("pp_contact_title") || "Contact Us"}>
					<Paragraph>
						{t("pp_contact_text") ||
							"If you have any questions about this Privacy Policy, please contact us at:"}
					</Paragraph>
					<Paragraph>
						Email:{" "}
						<a href="mailto:memodeck26@gmail.com" style={{ color: "#3b82f6" }}>
							memodeck26@gmail.com
						</a>
					</Paragraph>
				</Section>

				{/* Footer links */}
				<Box
					sx={{
						mt: 6,
						pt: 3,
						borderTop: `1px solid ${theme.palette.divider}`,
						display: "flex",
						gap: 3,
						flexWrap: "wrap",
					}}
				>
					{/* Footer links adjusted: removed About and Terms per request */}
					<Link
						to="/login"
						style={{
							color: theme.palette.primary.main,
							textDecoration: "none",
							fontFamily: "Inter, sans-serif",
							fontSize: "0.875rem",
						}}
					>
						{t("login") || "Login"}
					</Link>
				</Box>
			</MotionBox>
		</Box>
	);
}
