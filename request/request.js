const fetch = require('node-fetch');
const { curry } = require('lodash/fp');
const request = curry((options, url) => fetch(url, options));
const { GITHUB_API_KEY} = require('../config');

// Default headers to be sent with each request
const headers = {
    'Authorization': `token ${GITHUB_API_KEY}`,
    'Content-Type': 'application/json',
};

console.log(request(Object.assign({
            body: JSON.stringify({}),
            headers,
            method: 'POST'
        }))('url'));

module.exports = {
    get: request({headers}),
    post: (body) => ({
        to: request(Object.assign({
            body: JSON.stringify(body),
            headers,
            method: 'POST'
        })),
    }),
};