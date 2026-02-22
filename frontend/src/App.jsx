import React, { useState, useEffect, useCallback } from "react";
import {
	BrowserRouter,
	Routes,
	Route,
	Navigate,
	useNavigate,
	useLocation,
	Link,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { getProfile, getMe } from "./services/accountServices";
import {
	onAuthStateChanged,
	signOut,
	syncWithBackend,
} from "./services/authServices";
import { firebaseAuth } from "./config/firebase";
import Login from "./pages/Login";
import Info from "./pages/Info";
import Stats from "./pages/Stats";
import Settings from "./pages/Settings";
import Game from "./pages/Game";
import Plans from "./pages/Plans";
import Account from "./pages/Account";
import Achievements from "./pages/Achievements";
import SessionExpired from "./pages/SessionExpired";
import Admin from "./pages/Admin";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { darkTheme, lightTheme } from "./styles/theme";
import { I18nProvider } from "./utils/i18n";
import { AchievementProvider } from "./context/AchievementContext";
import { PlanProvider } from "./context/PlanContext";
import Topbar from "./components/Topbar";
import AchievementModal from "./components/modals/AchievementModal";
import { Box, CircularProgress } from "@mui/material";

import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

// Page transition variants
const pageVariants = {
	initial: {
		opacity: 0,
		y: 8,
	},
	animate: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.3,
			ease: [0.25, 0.46, 0.45, 0.94],
		},
	},
	exit: {
		opacity: 0,
		y: -8,
		transition: {
			duration: 0.2,
		},
	},
};

// Animated page wrapper
const AnimatedPage = ({ children }) => (
	<motion.div
		variants={pageVariants}
		initial="initial"
		animate="animate"
		exit="exit"
		style={{ height: "100%" }}
	>
		{children}
	</motion.div>
);

// Protected route wrapper - uses Firebase auth state
const ProtectedRoute = ({ children, user, loading }) => {
	if (loading) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
				}}
			>
				<CircularProgress />
			</Box>
		);
	}
	if (!user) {
		return <Navigate to="/login" replace />;
	}
	return children;
};

// Admin-only route wrapper
const AdminRoute = ({ children, user, loading, userRole }) => {
	if (loading) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
				}}
			>
				<CircularProgress />
			</Box>
		);
	}
	if (!user) {
		return <Navigate to="/login" replace />;
	}
	if (userRole !== "admin") {
		return <Navigate to="/" replace />;
	}
	return children;
};

// Layout component with Topbar
const MainLayout = ({ children, onLogout, themeMode, user }) => {
	const navigate = useNavigate();
	const location = useLocation();

	return (
		<Box
			sx={{
				height: "100vh",
				display: "flex",
				flexDirection: "column",
				backgroundColor: "background.default",
				overflow: "hidden",
			}}
		>
			<Box
				component={motion.div}
				initial={{ y: -20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.3, delay: 0.1 }}
				sx={{ flexShrink: 0 }}
			>
				<Topbar
					onLogout={onLogout}
					onSettings={() => navigate("/settings")}
					onMainPage={() => navigate("/")}
					onStats={() => navigate("/stats")}
					currentPath={location.pathname}
					user={user}
				/>
			</Box>
			<Box
				sx={{
					flex: 1,
					overflow: "hidden",
					position: "relative",
				}}
			>
				<Box
					sx={{
						height: "100%",
						overflow: "auto",
					}}
				>
					<AnimatePresence mode="wait" initial={false}>
						{children}
					</AnimatePresence>
				</Box>
			</Box>
			{/* Footer */}
			<Box
				sx={{
					flexShrink: 0,
					py: 1,
					px: 2,
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					gap: 2,
					flexWrap: "wrap",
					fontSize: "0.8rem",
					color: "text.secondary",
					borderTop: (theme) => `1px solid ${theme.palette.divider}`,
					fontFamily: "Inter, sans-serif",
				}}
			>
				<Box component="span">
					<a
						href="mailto:memodeck26@gmail.com"
						style={{ color: "inherit", textDecoration: "underline" }}
					>
						memodeck26@gmail.com
					</a>
					&nbsp;&nbsp;© {new Date().getFullYear()} MemoDeck
				</Box>
			</Box>
		</Box>
	);
};

// App content component (uses hooks that need Router context)
const AppContent = () => {
	const [themeMode, setThemeMode] = useState(
		localStorage.getItem("theme") || "dark",
	);
	const [lang, setLang] = useState(null);
	const [accountId, setAccountId] = useState(
		() => localStorage.getItem("accountId") || null,
	);
	const [isInitialized, setIsInitialized] = useState(false);
	const [user, setUser] = useState(null);
	const [authLoading, setAuthLoading] = useState(true);
	const [userRole, setUserRole] = useState(null);

	const navigate = useNavigate();
	const location = useLocation();

	const currentTheme = themeMode === "light" ? lightTheme : darkTheme;

	// Listen to Firebase auth state changes
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
			setUser(firebaseUser);

			if (firebaseUser) {
				try {
					// Check if accountId already exists in localStorage (set during login)
					let currentAccountId = localStorage.getItem("accountId");

					if (!currentAccountId) {
						// Sync with backend to get/create account
						const syncResult = await syncWithBackend();
						if (syncResult.accountId) {
							currentAccountId = syncResult.accountId;
							localStorage.setItem("accountId", syncResult.accountId);
						}
					}

					if (currentAccountId) {
						setAccountId(currentAccountId);
					}

					// Fetch user profile
					const res = await getProfile();
					const data = res.data;
					if (data.profile) {
						if (data.profile.theme_preference) {
							const theme =
								data.profile.theme_preference === "light" ? "light" : "dark";
							setThemeMode(theme);
							localStorage.setItem("theme", theme);
						}
						if (data.profile.language) {
							setLang(data.profile.language);
						}
					}

					// Fetch user role for admin access
					try {
						const meRes = await getMe();
						if (meRes.data?.account?.role) {
							setUserRole(meRes.data.account.role);
						}
					} catch (roleErr) {
						console.error("Error fetching user role:", roleErr);
					}
				} catch (err) {
					console.error("Error syncing user:", err);
				}
			} else {
				// User signed out
				setAccountId(null);
				setUserRole(null);
				localStorage.removeItem("accountId");
			}

			setAuthLoading(false);
			setIsInitialized(true);
		});

		return () => unsubscribe();
	}, []);

	const handleLogin = useCallback(async () => {
		// Firebase auth state listener will handle the rest
		navigate("/");
	}, [navigate]);

	const handleLogout = useCallback(async () => {
		try {
			await signOut();
		} catch (error) {
			console.error("Error during logout:", error);
		}
		localStorage.removeItem("accountId");
		navigate("/login");
	}, [navigate]);

	const handleThemeChange = useCallback((mode) => {
		setThemeMode(mode);
		localStorage.setItem("theme", mode);
	}, []);

	// Determine if we should show the layout with Topbar
	const isAuthPage = [
		"/login",
		"/session-expired",
		"/privacy",
		"/terms",
		"/about",
	].includes(location.pathname);

	// Use dark theme for auth pages
	const activeTheme = isAuthPage ? darkTheme : currentTheme;

	return (
		<I18nProvider lang={lang} setLang={setLang}>
			<AchievementProvider>
				<PlanProvider user={user}>
					<ThemeProvider theme={activeTheme}>
						<CssBaseline />
						<AchievementModal />
						{isAuthPage ? (
							<Box
								sx={{
									height: "100vh",
									backgroundColor: "background.default",
									overflow: "auto",
								}}
							>
								<AnimatePresence mode="wait" initial={false}>
									<Routes location={location} key={location.pathname}>
										<Route
											path="/login"
											element={
												<AnimatedPage>
													<Login onLogin={handleLogin} />
												</AnimatedPage>
											}
										/>
										<Route
											path="/session-expired"
											element={
												<AnimatedPage>
													<SessionExpired />
												</AnimatedPage>
											}
										/>
									</Routes>
								</AnimatePresence>
							</Box>
						) : (
							<MainLayout
								onLogout={handleLogout}
								themeMode={themeMode}
								user={user}
							>
								<Routes location={location} key={location.pathname}>
									<Route
										path="/"
										element={
											<ProtectedRoute user={user} loading={authLoading}>
												<AnimatedPage>
													<Info
														accountId={accountId}
														onStartGame={(deckId, settings) =>
															navigate(`/game/${deckId}`, {
																state: { settings },
															})
														}
													/>
												</AnimatedPage>
											</ProtectedRoute>
										}
									/>
									<Route
										path="/stats"
										element={
											<ProtectedRoute user={user} loading={authLoading}>
												<AnimatedPage>
													<Stats accountId={accountId} />
												</AnimatedPage>
											</ProtectedRoute>
										}
									/>
									<Route
										path="/achievements"
										element={
											<ProtectedRoute user={user} loading={authLoading}>
												<AnimatedPage>
													<Achievements />
												</AnimatedPage>
											</ProtectedRoute>
										}
									/>
									<Route
										path="/plans"
										element={
											<AnimatedPage>
												<Plans />
											</AnimatedPage>
										}
									/>
									<Route
										path="/account"
										element={
											<ProtectedRoute user={user} loading={authLoading}>
												<AnimatedPage>
													<Account />
												</AnimatedPage>
											</ProtectedRoute>
										}
									/>
									<Route
										path="/game/:deckId"
										element={
											<ProtectedRoute user={user} loading={authLoading}>
												<AnimatedPage>
													<Game onBackToDecks={() => navigate("/")} />
												</AnimatedPage>
											</ProtectedRoute>
										}
									/>
									<Route
										path="/settings"
										element={
											<ProtectedRoute user={user} loading={authLoading}>
												<AnimatedPage>
													<Settings
														currentTheme={themeMode}
														onThemeChange={handleThemeChange}
														onMainPage={() => navigate("/")}
														onLangChange={setLang}
													/>
												</AnimatedPage>
											</ProtectedRoute>
										}
									/>
									<Route
										path="/admin"
										element={
											<AdminRoute
												user={user}
												loading={authLoading}
												userRole={userRole}
											>
												<AnimatedPage>
													<Admin />
												</AnimatedPage>
											</AdminRoute>
										}
									/>
									<Route path="*" element={<Navigate to="/" replace />} />
								</Routes>
							</MainLayout>
						)}
					</ThemeProvider>
				</PlanProvider>
			</AchievementProvider>
		</I18nProvider>
	);
};

function App() {
	return (
		<BrowserRouter>
			<AppContent />
		</BrowserRouter>
	);
}

export default App;
