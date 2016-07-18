const { split, compose, filter, startsWith, replace, map, includes, get, has, negate, curry, some, isEqual, head } = require('lodash/fp');
const { parseVersion, isPackageJson, getJSONFromResponse, getVersionFromPackageResponse, getPackagejsonUrl } = require('./utils');
const request = require('../request/request');

// getRequiredFilesFromCompareResponse :: [Strings] -> Object -> [Strings]
const getRequiredFilesFromCompareResponse = curry((requiredFiles, payload) => compose(filter(compose((filename) => includes(filename, requiredFiles), get('filename'))), get('files'))(payload));

// getTreesUrl :: ({sha: String, repo: Object}) -> String
function getTreesUrl({sha, repo}) {
    const buildBlobsUrl = compose(replace('{/sha}', `/${sha}`), get('trees_url'));

    return buildBlobsUrl(repo);
}

// prepareCompareUrl :: Object, Object -> String
function prepareCompareUrl(base, head) {
    if (!base || !head) {
        throw new Error('No base and/or head can be found on the pull request');
    }

    if (negate(has('repo.compare_url'))(base)) {
        throw new Error('No compare url could be found on the base repo.')
    }

    return compose(
        replace('{base}', base.label),
        replace('{head}', head.label),
        get('repo.compare_url')
    )(base);
}

// Impure
// getPackage :: String -> Promise
function getPackage(packageUrl) {
    return request.get(packageUrl)
        .then(getJSONFromResponse);
}

// Impure
// getPackage :: Object -> Promise
function getPackageJsonVersionForTree(treeResponse) {
    return Promise.resolve(treeResponse)
        .then(getJSONFromResponse)
        .then(getPackagejsonUrl)
        .then(getPackage)
        .then(getVersionFromPackageResponse);
}

// Impure
// validatePullRequest :: {base, head} -> Promise
function validatePullRequest({base, head}) {
    const baseTree = request.get(getTreesUrl(base))
        .then(getPackageJsonVersionForTree);

    const headTree = request.get(getTreesUrl(head))
        .then(getPackageJsonVersionForTree);

    return Promise.all([baseTree, headTree])
        .then(isValidVersion);
}

// isValidVersion :: [base, head] -> Promise
function isValidVersion([base, head]) {
    const invalidVersionUrl = 'https://github.com/Markionium/pullmeup/blob/master/statuses/statuses.md#invalid-version';

    if (base.major !== head.major) {
        return Promise.reject({ message: 'Major version differs', url: invalidVersionUrl });
    }

    if (head.isLessOrEqualTo(base)) {
        return Promise.reject({
            message: 'package.json version can not be equal to or smaller than the base version',
        });
    }

    return Promise.resolve({
        message: 'Version is valid!',
    });
}

module.exports = {
    validatePullRequest,
    isValidVersion,
};