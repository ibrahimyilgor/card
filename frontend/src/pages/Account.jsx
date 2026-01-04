import React from "react";
import { motion } from "framer-motion";
import PageContainer from "../components/ui/PageContainer";
import { Typography, Box } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const MotionBox = motion.create(Box);

export default function Account() {
    return (
        <PageContainer>
            <MotionBox initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
                    <Box>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                color: "text.cardTitle",
                                fontFamily: "Inter, sans-serif",
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                            }}
                        >
                            <AccountCircleIcon sx={{ color: "primary.light", fontSize: 32 }} />
                            Hesap
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.cardSubtitle", mt: 0.5, fontFamily: "Inter, sans-serif" }}>
                            Hesap ayarları ve bilgiler burada gösterilecek.
                        </Typography>
                    </Box>
                </Box>
            </MotionBox>
        </PageContainer>
    );
}
