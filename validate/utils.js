const { compose, head, split, some, isEqual, get, replace, contains, filter, includes, slice, tail, takeRight, memoize, every, curry, map} = require('lodash/fp');

const buildVersionObject = (versionArray) => ({ major: versionArray[0], minor: versionArray[1], patch: versionArray[2] });
const parseVersion = compose(buildVersionObject, split('.'));
const isPackageJson = isEqual('package.json');

const spy = (v) => { console.log(v); return v; };
const getPackagejsonUrl = compose(get('url'), head, filter(compose(isPackageJson, get('path'))), get('tree'));
const decodeBase64 = (base64) => new Buffer(base64, 'base64').toString('utf-8');
const handleGitHubBlobResponse = compose(JSON.parse, decodeBase64, get('content'));
const getVersionFromPackageResponse = compose(parseVersion, get('version'), handleGitHubBlobResponse);

const getJSONFromResponse = resp => resp.json();

function objectChecks(requiredProps) {
    return map(get, requiredProps);
}

const runCheckForBody = curry((body, check) => check(body));

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