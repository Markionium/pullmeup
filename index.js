const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const config = require('./config');

const { setStatusPending, setStatusSuccess, setStatusFailed} = require('./validate/github');
const { validatePullRequest } = require('./validate/validate');

// configure app to use bodyParser()
// this will parse the JSON body to a JS Object
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ROUTES FOR API
// =============================================================================
const router = express.Router();

router.get('/', function(req, res) {
    res.json({ message: 'Nothing here!' });
});

router.post('/validatepullrequest', (request, response) => {
    const {statuses_url} = request.body.pull_request;

    setStatusPending(statuses_url)
        .catch(v => v)
        .then(v => {
            // Send back status for the initial request from github
            response
                .status(v.status)
                .json(v);
        })
        .then(() => {
            validatePullRequest(request.body.pull_request)
                .then(() => setStatusSuccess(statuses_url))
                .catch(() => setStatusFailed(statuses_url));
        });
});

app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(config.port);
console.log('pullmeup running on ' + config.port);