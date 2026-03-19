describe("Plans Page", () => {
	beforeEach(() => {
		// Basic account/plans mock for all tests
		cy.intercept("GET", "**/account/plans", {
			statusCode: 200,
			body: {
				plans: [
					{
						id: "1",
						code: "free",
						name: "Free Plan",
						price_monthly: "0.00",
						max_decks: 3,
						max_flashcards: 100,
						advanced_stats: false,
					},
					{
						id: "2",
						code: "pro",
						name: "Pro Plan",
						price_monthly: "4.99",
						max_decks: null,
						max_flashcards: 500,
						advanced_stats: true,
					},
					{
						id: "3",
						code: "premium",
						name: "Premium Plan",
						price_monthly: "9.99",
						max_decks: null,
						max_flashcards: null,
						advanced_stats: true,
					},
				],
			},
		}).as("getPlans");

		// Bypass common global profile endpoints
		cy.intercept("GET", "**/account/profile", {
			statusCode: 200,
			body: { profile: { theme_preference: "dark", language: "en" } },
		}).as("getProfile");

		cy.intercept("GET", "**/account/me", {
			statusCode: 200,
			body: { account: { role: "user" } },
		}).as("getMe");
	});

	describe('When User Has "Free" Plan', () => {
		beforeEach(() => {
			// User is currently on free plan
			cy.intercept("GET", "**/account/my-plan", {
				statusCode: 200,
				body: { plan: { code: "free" } },
			}).as("getMyPlan");
		});

		it('renders all plans and marks the Free plan as "Current"', () => {
			cy.visit("/plans");
			cy.wait("@getPlans");
			cy.wait("@getMyPlan");

			// Verify basic text is displayed
			cy.contains("Plans").should("be.visible");
			cy.contains("Free Plan").should("be.visible");
			cy.contains("Pro Plan").should("be.visible");
			cy.contains("Premium Plan").should("be.visible");

			// Free plan should be marked as Current Plan
			// Check the chip/badge
			cy.contains("Current Plan").should("be.visible");

			// Add custom queries without @testing-library/cypress
			cy.get("button").contains("Upgrade").should("have.length.at.least", 1);
		});

		it("shows mobile-only snackbar when clicking upgrade", () => {
			cy.visit("/plans");
			cy.wait(["@getPlans", "@getMyPlan"]);

			// Click the first found Upgrade button
			cy.get("button").contains("Upgrade").first().click();

			// Check if snackbar pops up
			cy.contains("This operation can be done only by mobile").should(
				"be.visible",
			);
		});
	});

	describe('When User Has "Pro" Plan', () => {
		beforeEach(() => {
			cy.intercept("GET", "**/account/my-plan", {
				statusCode: 200,
				body: { plan: { code: "pro" } },
			}).as("getMyPlanPro");
		});

		it("shows Free as downgrade, Pro as current, Premium as upgrade", () => {
			cy.visit("/plans");
			cy.wait("@getPlans");
			cy.wait("@getMyPlanPro");

			cy.get("button").contains("Downgrade").should("have.length", 1);
			cy.get("button").contains("Upgrade").should("have.length", 1);

			// Look for Current Plan label
			cy.contains(/Current Plan/i).should("exist");
		});
	});

	describe("Error states", () => {
		it("shows error state when fetching plans fails", () => {
			cy.intercept("GET", "**/account/plans", {
				statusCode: 500,
				body: { error: "Internal Server Error" },
			}).as("getPlansError");

			cy.visit("/plans");
			cy.wait("@getPlansError");

			// Look for the fallback error message translated text (default English)
			cy.contains("plans_fetch_error").should("be.visible");
		});
	});
});
