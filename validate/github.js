const {PULL_REQUEST_VALIDATION, GITHUB_API_KEY} = require('../config');
const fetch = require('node-fetch');
const request = require('../request/request');

const getRequestOptions = (body) => ({
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${GITHUB_API_KEY}`,
    },
});

function rejectNoApiKey() {
    return Promise.reject({
        status: 500,
        message: 'GITHUB_API_KEY not available.',
    });
}

function setStatusPending(statuses_url) {
    if (!GITHUB_API_KEY) { return rejectNoApiKey(); }

    const pendingStatus = {
        state: 'pending',
        description: 'Validating your pull request',
        context: PULL_REQUEST_VALIDATION,
    };

    return request.post(pendingStatus).to(statuses_url)
        .then(() => ({
            status: 200,
            message: 'Validating!',
            githubStatus: pendingStatus,
        }));
}

function setStatusSuccess(statuses_url, {url, message}) {
    if (!GITHUB_API_KEY) { return rejectNoApiKey(); }

    const successStatus = {
        state: 'success',
        description: message || 'Pull request is valid',
        context: PULL_REQUEST_VALIDATION,
        target_url: url,
    };

    return request.post(successStatus).to(statuses_url)
        .then(() => ({
            status: 200,
            message: 'Success!',
            githubStatus: successStatus,
        }));
}

function setStatusFailed(statuses_url, {url, message}) {
    if (!GITHUB_API_KEY) { return rejectNoApiKey(); }

    const failedStatus = {
        state: 'failure',
        description: message || 'Pull request is invalid',
        context: PULL_REQUEST_VALIDATION,
        target_url: url,
    };

    return request.post(failedStatus).to(statuses_url)
        .then(() => ({
            status: 400,
            message: 'Failure!',
            githubStatus: failedStatus,
        }));
}

function getBlob() {

}

module.exports = {
    setStatusPending,
    setStatusSuccess,
    setStatusFailed,
    getBlob,
};