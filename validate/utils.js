const semver = require('semver');
const { compose, head, split, some, isEqual, get, replace, contains, filter, includes, slice, tail, takeRight, memoize, every, curry, map} = require('lodash/fp');

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

// isValidRequestBody :: Object -> Bool
const isValidRequestBody = (body) => {
    const requiredProps = [
        'pull_request.statuses_url',
        'pull_request.base.repo',
        'pull_request.head.repo',
    ];

    return every(runCheckForBody(body), objectChecks(requiredProps));
};

module.exports = {
    parseVersion,
    isPackageJson,
    getPackagejsonUrl,
    getJSONFromResponse,
    getVersionFromPackageResponse,
    isValidRequestBody,
};