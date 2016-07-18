const port = process.env.PORT || 8082;
const PULL_REQUEST_VALIDATION = 'pull-request-validation';
const GITHUB_API_KEY = process.env.GITHUB_API_KEY;
const PULLMEUP_REQUEST_SECRET = process.env.PULLMEUP_REQUEST_SECRET;

module.exports = {
    port,
    PULL_REQUEST_VALIDATION,
    GITHUB_API_KEY,
    ALLOWED_REPOS: [
        'dhis2/d2',
        'dhis2/d2-ui',
    ],
};