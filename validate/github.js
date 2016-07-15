const {PULL_REQUEST_VALIDATION, GITHUB_API_KEY} = require('../config');

const pendingStatus = {
    state: 'pending',
    description: 'Validating your pull request',
    context: PULL_REQUEST_VALIDATION,
};

const requestOptions = {
    method: 'POST',
    body: JSON.stringify(pendingStatus),
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${GITHUB_API_KEY}`,
    },
};

function setStatusPending(statuses_url) {
    if (!GITHUB_API_KEY) {
        return Promise.reject({
            status: 500,
            message: {
                error: 'GITHUB_API_KEY not available.',
            },
        });
    }

    return fetch(statuses_url, requestOptions)
        .then(resp => resp.json())
        .then(console.log.bind(console))
        .then(() => {
            return {
                status: 200,
                message: 'Validating!',
            };
        });
}

module.exports = {
    setStatusPending,
};