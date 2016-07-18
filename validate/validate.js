const { split, compose, filter, startsWith, replace, map, includes, get, has, negate, curry, some, isEqual, head } = require('lodash/fp');
const { parseVersion, isPackageJson, getJSONFromResponse, getVersionFromPackageResponse, getPackagejsonUrl } = require('./utils');
const request = require('../request/request');

const getRequiredFilesFromCompareResponse = curry((requiredFiles, payload) => compose(filter(compose((filename) => includes(filename, requiredFiles), get('filename'))), get('files'))(payload));

// ({sha: String, repo: Object}) => String
function getTreesUrl({sha, repo}) {
    const buildBlobsUrl = compose(replace('{/sha}', `/${sha}`), get('trees_url'));

    return buildBlobsUrl(repo);
}

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
function getPackage(packageUrl) {
    return request.get(packageUrl)
        .then(getJSONFromResponse);
}

// Impure
function getPackageJsonVersionForTree(treeRequest) {
    return Promise.resolve(treeRequest)
        .then(getJSONFromResponse)
        .then(getPackagejsonUrl)
        .then(getPackage)
        .then(getVersionFromPackageResponse);
}

// Impure
function validatePullRequest({base, head}) {
    const baseTree = request.get(getTreesUrl(base))
        .then(getPackageJsonVersionForTree);

    const headTree = request.get(getTreesUrl(head))
        .then(getPackageJsonVersionForTree);

    return Promise.all([baseTree, headTree])
        .then(isValidVersion);
}

function isValidVersion([base, head]) {
    if (base.major === head.major && (base.minor !== head.minor || base.patch !== head.patch)) {
        return Promise.resolve('Valid version!');
    }

    return Promise.reject('Not a valid version!');
}

module.exports = {
    validatePullRequest,
};