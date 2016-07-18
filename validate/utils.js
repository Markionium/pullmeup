const semver = require('semver');
const crypto = require('crypto');
const { compose, head, split, some, isEqual, get, replace, contains, filter, includes, slice, tail, takeRight, memoize, every, curry, map, isString} = require('lodash/fp');
const { ALLOWED_REPOS, PULLMEUP_REQUEST_SECRET } = require('../config');

// spy :: Any -> Any
const spy = (v) => { console.log(v); return v; };

// buildVersionObject :: String -> Version
const buildVersionObject = (version) => ({
    full: version,
    major: semver.major(version),
    minor: semver.minor(version),
    patch: semver.patch(version),
    prerelease: semver.prerelease(version),
    isLessOrEqualTo: (other) => semver.lte(version, other.full, true),
});

// parseVersion :: String -> Version
const parseVersion = buildVersionObject;

// isPackageJson :: String -> Bool
const isPackageJson = isEqual('package.json');

// getPackagejsonUrl :: GithubTree -> String
const getPackagejsonUrl = compose(get('url'), head, filter(compose(isPackageJson, get('path'))), get('tree'));

// decodeBase64 :: String -> String
const decodeBase64 = (base64) => new Buffer(base64, 'base64').toString('utf-8');

// handleGitHubBlobResponse :: GitHubBlobResponse -> Any
const handleGitHubBlobResponse = compose(JSON.parse, decodeBase64, get('content'));

// getVersionFromPackageResponse :: GitHubBlobResponse -> Version
const getVersionFromPackageResponse = compose(parseVersion, get('version'), handleGitHubBlobResponse);

// getJSONFromResponse :: Response -> Promise(Any)
const getJSONFromResponse = resp => resp.json();

// objectChecks :: [String] -> [Function]
function objectChecks(requiredProps) {
    return map(get, requiredProps);
}

// runCheckForBody :: Object -> Function -> Any
const runCheckForBody = curry((body, check) => check(body));

// getFullRepoName :: Object -> String
const getFullRepoName = get('pull_request.base.repo.full_name');

// hasFullRepoName :: Object -> Bool
const hasFullRepoName = compose(isString, getFullRepoName);

// isPullRequestForAllowedRepo :: Object -> Bool
const isPullRequestForAllowedRepo = (body) => hasFullRepoName(body) && includes(getFullRepoName(body), ALLOWED_REPOS);

// isValidRequestBody :: Object -> Bool
const isValidRequestBody = (body) => {
    const requiredProps = [
        'pull_request.statuses_url',
        'pull_request.base.repo',
        'pull_request.head.repo',
    ];

    return every(runCheckForBody(body), objectChecks(requiredProps)) && isPullRequestForAllowedRepo(body);
};

function throw403Error(response) {
    response
            .status(403)
            .json({
                message: 'Request not valid',
            });

        // Throw error so we do not get to the request handler
        throw new Error('Failed!');
}

function validateBodyHash(request, response, buff) {
    if (!PULLMEUP_REQUEST_SECRET || (request && !request.headers['X-Hub-Signature'])) {
        return throw403Error(response);
    }

    const hash = crypto.createHmac('sha1', PULLMEUP_REQUEST_SECRET)
        .update(buff)
        .digest('hex');

    // TODO: Update when this is merged https://github.com/nodejs/node/pull/3073
    if (request.headers['X-Hub-Signature'] !== `sha1=${hash}`) {
        return throw403Error(response);
	}
}

module.exports = {
    parseVersion,
    isPackageJson,
    getPackagejsonUrl,
    getJSONFromResponse,
    getVersionFromPackageResponse,
    isValidRequestBody,
    validateBodyHash,
};