const port = process.env.PORT || 8082;
const PULL_REQUEST_VALIDATION = 'pull-request-validation';
const GITHUB_API_KEY = process.env.GITHUB_API_KEY;

module.exports = {
    port,
    PULL_REQUEST_VALIDATION,
    GITHUB_API_KEY,
    repos: [
        'dhis2/d2',
        'dhis2/d2-ui',
    ],
};