// Google Analytics 4, loaded only after a visitor accepts it (see
// components/analytics-consent.tsx). A measurement ID is public by design: it
// ships in every page that uses it, so it lives here rather than in a secret.
// Empty means GA is off entirely and no consent banner is shown.
export const GA_MEASUREMENT_ID = "G-98TVJ8GFZ7";

// Pages whose address carries a private token (a plan's link, a follow link)
// or that are internal. Google never gets a hit from these, even with consent,
// because the token in the URL is the key to someone's plan.
export const PRIVATE_PATH = /^\/(ar\/)?(journey|follow|internal)(\/|$)/;
