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

function setStatusPending(statuses_url) {
    if (!GITHUB_API_KEY) {
        return Promise.reject({
            status: 500,
            message: 'GITHUB_API_KEY not available.',
        });
    }

    const pendingStatus = {
        state: 'pending',
        description: 'Validating your pull request',
        context: PULL_REQUEST_VALIDATION,
    };

    return request.post(pendingStatus).to(statuses_url)()
        .then(() => ({
            status: 200,
            message: 'Validating!',
            githubStatus: pendingStatus,
        }));
}

function setStatusSuccess(statuses_url) {
    if (!GITHUB_API_KEY) {
        return Promise.reject({
            status: 500,
            message: 'GITHUB_API_KEY not available.',
        });
    }

    const successStatus = {
        state: 'success',
        description: 'Pull request is valid',
        context: PULL_REQUEST_VALIDATION,
    };

    return request.post(successStatus).to(statuses_url)()
        .then(() => ({
            status: 200,
            message: 'Success!',
            githubStatus: pendingStatus,
        }));
}

function setStatusFailed(statuses_url) {
    if (!GITHUB_API_KEY) {
        return Promise.reject({
            status: 500,
            message: 'GITHUB_API_KEY not available.',
        });
    }

    const failedStatus = {
        state: 'failure',
        description: 'Pull request is invalid',
        context: PULL_REQUEST_VALIDATION,
    };

    return request.post(failedStatus).to(statuses_url)()
        .then(() => ({
            status: 400,
            message: 'Failure!',
            githubStatus: pendingStatus,
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