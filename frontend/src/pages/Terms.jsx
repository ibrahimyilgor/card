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

export default function Terms() {
	const theme = useTheme();
	const { t } = useContext(I18nContext);

	useSEO("terms");

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
							src="/images/logo/memodeck.png"
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
						{t("terms_of_service") || "Terms of Service"}
					</Typography>
					<Typography
						variant="body2"
						sx={{ color: "text.secondary", fontFamily: "Inter, sans-serif" }}
					>
						{t("last_updated") || "Last updated"}: February 21, 2026
					</Typography>
				</Box>

				{/* Content */}
				<Section title={t("tos_acceptance_title") || "1. Acceptance of Terms"}>
					<Paragraph>
						{t("tos_acceptance_text") ||
							'By accessing and using MemoDeck ("the Service"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.'}
					</Paragraph>
				</Section>

				<Section
					title={t("tos_description_title") || "2. Description of the Service"}
				>
					<Paragraph>
						{t("tos_description_text") ||
							"MemoDeck is a web-based flashcard learning application that allows users to create custom flash card decks, study using various game modes, track learning progress with statistics, and earn achievements. The Service is available through a web browser at memodeck.app."}
					</Paragraph>
				</Section>

				<Section title={t("tos_accounts_title") || "3. User Accounts"}>
					<Paragraph>
						{t("tos_accounts_text") ||
							"To use the Service, you must sign in with a Google account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account."}
					</Paragraph>
				</Section>

				<Section title={t("tos_content_title") || "4. User Content"}>
					<Paragraph>
						{t("tos_content_text") ||
							"You retain ownership of the flashcard decks and content you create on the Service. By creating content, you grant MemoDeck a non-exclusive license to store, display, and process your content solely for the purpose of providing the Service to you. You are responsible for ensuring your content does not violate any laws or third-party rights."}
					</Paragraph>
				</Section>

				<Section title={t("tos_acceptable_title") || "5. Acceptable Use"}>
					<Paragraph>
						{t("tos_acceptable_text") || "You agree not to use the Service to:"}
					</Paragraph>
					<Box component="ul" sx={{ color: "text.secondary", pl: 3 }}>
						<li>
							<Paragraph>
								{t("tos_acceptable_1") ||
									"Upload content that is illegal, harmful, or infringes on intellectual property rights"}
							</Paragraph>
						</li>
						<li>
							<Paragraph>
								{t("tos_acceptable_2") ||
									"Attempt to gain unauthorized access to the Service or its systems"}
							</Paragraph>
						</li>
						<li>
							<Paragraph>
								{t("tos_acceptable_3") ||
									"Use the Service for any commercial purpose without our prior written consent"}
							</Paragraph>
						</li>
						<li>
							<Paragraph>
								{t("tos_acceptable_4") ||
									"Interfere with or disrupt the Service or its servers"}
							</Paragraph>
						</li>
					</Box>
				</Section>

				<Section title={t("tos_plans_title") || "6. Plans and Pricing"}>
					<Paragraph>
						{t("tos_plans_text") ||
							"MemoDeck offers free and paid plans. The free plan includes basic features with limitations on the number of decks and flashcards. Paid plans offer additional features such as unlimited storage, advanced statistics, and an ad-free experience. We reserve the right to modify pricing and plan features with reasonable notice."}
					</Paragraph>
				</Section>

				<Section title={t("tos_ads_title") || "7. Advertisements"}>
					<Paragraph>
						{t("tos_ads_text") ||
							"The free tier of the Service may display advertisements served by third-party ad networks, including Google AdSense. These advertisements help support the continued development and maintenance of the Service. Paid plans may offer an ad-free experience."}
					</Paragraph>
				</Section>

				<Section title={t("tos_ip_title") || "8. Intellectual Property"}>
					<Paragraph>
						{t("tos_ip_text") ||
							"The Service, including its design, logos, and software, is the intellectual property of MemoDeck. You may not copy, modify, distribute, or create derivative works based on any part of the Service without our prior written consent."}
					</Paragraph>
				</Section>

				<Section
					title={t("tos_limitation_title") || "9. Limitation of Liability"}
				>
					<Paragraph>
						{t("tos_limitation_text") ||
							'The Service is provided "as is" without warranties of any kind. MemoDeck shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount you paid for the Service in the 12 months preceding the claim.'}
					</Paragraph>
				</Section>

				<Section title={t("tos_termination_title") || "10. Termination"}>
					<Paragraph>
						{t("tos_termination_text") ||
							"We reserve the right to suspend or terminate your account at any time for violation of these Terms. You may also delete your account at any time through the Account settings. Upon termination, your data will be deleted from our systems."}
					</Paragraph>
				</Section>

				<Section title={t("tos_changes_title") || "11. Changes to the Terms"}>
					<Paragraph>
						{t("tos_changes_text") ||
							"We may update these Terms from time to time. We will notify users of significant changes by posting a notice on the Service. Your continued use of the Service after changes constitutes acceptance of the updated Terms."}
					</Paragraph>
				</Section>

				<Section title={t("tos_governing_title") || "12. Governing Law"}>
					<Paragraph>
						{t("tos_governing_text") ||
							"These Terms shall be governed by and construed in accordance with applicable laws. Any disputes arising from these Terms or the Service shall be resolved through good-faith negotiation or, if necessary, through binding arbitration."}
					</Paragraph>
				</Section>

				<Section title={t("tos_contact_title") || "13. Contact"}>
					<Paragraph>
						{t("tos_contact_text") ||
							"If you have any questions about these Terms of Service, please contact us at:"}
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
					<Link
						to="/privacy"
						style={{
							color: theme.palette.primary.main,
							textDecoration: "none",
							fontFamily: "Inter, sans-serif",
							fontSize: "0.875rem",
						}}
					>
						{t("privacy_policy") || "Privacy Policy"}
					</Link>
					<Link
						to="/about"
						style={{
							color: theme.palette.primary.main,
							textDecoration: "none",
							fontFamily: "Inter, sans-serif",
							fontSize: "0.875rem",
						}}
					>
						{t("about") || "About"}
					</Link>
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
