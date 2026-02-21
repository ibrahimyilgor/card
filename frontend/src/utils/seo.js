import { useEffect } from "react";

/**
 * SEO Configuration for MemoDeck
 * Dynamic meta tag management for optimal search engine visibility
 */

const defaultSEO = {
	siteName: "MemoDeck",
	title: "MemoDeck - Smart Flashcard Learning App",
	description:
		"Master any subject with MemoDeck's intelligent flashcard system. Create custom decks, track your progress, and boost retention with spaced repetition.",
	url: "https://memodeck.app",
	image: "https://memodeck.app/images/og-image.png",
	twitterHandle: "@memodeck",
	locale: "en_US",
};

// Page-specific SEO configurations
export const pageSEO = {
	home: {
		title: "MemoDeck - Smart Flashcard Learning App | Study Smarter",
		description:
			"Master any subject with MemoDeck's intelligent flashcard system. Create custom decks, track your progress, and boost retention.",
		path: "/",
	},
	login: {
		title: "Login | MemoDeck - Access Your Flashcard Decks",
		description:
			"Sign in to MemoDeck to access your personalized flashcard decks and continue your learning journey.",
		path: "/login",
	},
	signup: {
		title: "Sign Up | MemoDeck - Start Learning Today",
		description:
			"Create your free MemoDeck account and start mastering any subject with smart flashcards and spaced repetition.",
		path: "/signup",
	},
	info: {
		title: "My Decks | MemoDeck - Manage Your Flashcards",
		description:
			"View and manage your flashcard decks. Create, edit, and organize your study materials.",
		path: "/info",
	},
	stats: {
		title: "Statistics | MemoDeck - Track Your Progress",
		description:
			"View detailed statistics about your learning progress. Track correct answers, study time, and improvement trends.",
		path: "/stats",
	},
	achievements: {
		title: "Achievements | MemoDeck - Celebrate Your Success",
		description:
			"View your earned achievements and badges. Celebrate milestones in your learning journey.",
		path: "/achievements",
	},
	settings: {
		title: "Settings | MemoDeck - Customize Your Experience",
		description:
			"Customize your MemoDeck experience. Change themes, language, and notification preferences.",
		path: "/settings",
	},
	plans: {
		title: "Pricing & Plans | MemoDeck - Choose Your Plan",
		description:
			"Explore MemoDeck pricing plans. Free tier available with premium features for advanced learners.",
		path: "/plans",
	},
	account: {
		title: "Account | MemoDeck - Manage Your Profile",
		description:
			"Manage your MemoDeck account settings, profile information, and subscription.",
		path: "/account",
	},
	game: {
		title: "Study Mode | MemoDeck - Learn with Flashcards",
		description:
			"Practice and learn with interactive flashcard games. Multiple study modes to boost retention.",
		path: "/game",
	},
	privacy: {
		title: "Privacy Policy | MemoDeck",
		description:
			"Read MemoDeck's privacy policy. Learn how we collect, use, and protect your data while using our flashcard learning platform.",
		path: "/privacy",
	},
	terms: {
		title: "Terms of Service | MemoDeck",
		description:
			"MemoDeck terms of service. Understand the rules and guidelines for using our flashcard learning platform.",
		path: "/terms",
	},
	about: {
		title: "About MemoDeck - Smart Flashcard Learning App",
		description:
			"Learn about MemoDeck — a modern flashcard app with multiple game modes, statistics tracking, achievements, and multi-language support. Master any subject.",
		path: "/about",
	},
};

/**
 * Update document meta tags for SEO
 * @param {Object} options - SEO options
 */
export const updateMetaTags = (options = {}) => {
	const {
		title = defaultSEO.title,
		description = defaultSEO.description,
		url = defaultSEO.url,
		image = defaultSEO.image,
		type = "website",
		locale = defaultSEO.locale,
	} = options;

	// Update document title
	document.title = title;

	// Helper function to update or create meta tag
	const setMetaTag = (selector, attribute, value) => {
		let element = document.querySelector(selector);
		if (element) {
			element.setAttribute(attribute, value);
		}
	};

	// Update meta tags
	setMetaTag('meta[name="description"]', "content", description);
	setMetaTag('meta[name="title"]', "content", title);

	// Open Graph
	setMetaTag('meta[property="og:title"]', "content", title);
	setMetaTag('meta[property="og:description"]', "content", description);
	setMetaTag('meta[property="og:url"]', "content", url);
	setMetaTag('meta[property="og:image"]', "content", image);
	setMetaTag('meta[property="og:type"]', "content", type);
	setMetaTag('meta[property="og:locale"]', "content", locale);

	// Twitter Card
	setMetaTag('meta[name="twitter:title"]', "content", title);
	setMetaTag('meta[name="twitter:description"]', "content", description);
	setMetaTag('meta[name="twitter:url"]', "content", url);
	setMetaTag('meta[name="twitter:image"]', "content", image);

	// Canonical URL
	let canonicalLink = document.querySelector('link[rel="canonical"]');
	if (canonicalLink) {
		canonicalLink.setAttribute("href", url);
	}
};

/**
 * React Hook for SEO management
 * @param {string} page - Page key from pageSEO
 * @param {Object} customOptions - Custom SEO options to override defaults
 */
export const useSEO = (page, customOptions = {}) => {
	useEffect(() => {
		const pageConfig = pageSEO[page] || {};
		const url = `${defaultSEO.url}${pageConfig.path || ""}`;

		updateMetaTags({
			title: pageConfig.title || defaultSEO.title,
			description: pageConfig.description || defaultSEO.description,
			url,
			...customOptions,
		});

		// Update structured data for breadcrumbs
		updateBreadcrumbSchema(page, pageConfig.title);

		// Cleanup - reset to default on unmount (optional)
		return () => {
			// Optional: Reset to default on page change
		};
	}, [page, customOptions]);
};

/**
 * Update breadcrumb structured data
 */
const updateBreadcrumbSchema = (page, pageTitle) => {
	const breadcrumbScript = document.querySelector(
		'script[type="application/ld+json"]:last-of-type',
	);
	if (breadcrumbScript && page !== "home") {
		const breadcrumbData = {
			"@context": "https://schema.org",
			"@type": "BreadcrumbList",
			itemListElement: [
				{
					"@type": "ListItem",
					position: 1,
					name: "Home",
					item: defaultSEO.url,
				},
				{
					"@type": "ListItem",
					position: 2,
					name: pageTitle?.split(" | ")[0] || page,
					item: `${defaultSEO.url}/${page}`,
				},
			],
		};
		breadcrumbScript.textContent = JSON.stringify(breadcrumbData);
	}
};

/**
 * Generate dynamic deck-specific SEO
 */
export const getDeckSEO = (deckName, cardCount) => ({
	title: `${deckName} Flashcards | MemoDeck`,
	description: `Study ${deckName} with ${cardCount} flashcards on MemoDeck. Master this subject with our intelligent spaced repetition system.`,
});

/**
 * Generate game mode SEO
 */
export const getGameSEO = (deckName, gameMode) => ({
	title: `Playing ${deckName} - ${gameMode} Mode | MemoDeck`,
	description: `Practice ${deckName} flashcards in ${gameMode} mode. Boost your retention with interactive learning.`,
});

export default {
	defaultSEO,
	pageSEO,
	updateMetaTags,
	useSEO,
	getDeckSEO,
	getGameSEO,
};
