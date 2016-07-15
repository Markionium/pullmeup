const express = require('express');         // call express
const app = express();                      // define our app using express
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8082;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'Nothing here!' });
});

router.post('/validatepullrequest', (req, res) => {
    console.log(req.body);

    const PULL_REQUEST_VALIDATION = 'pull-request-validation';
    const GITHUB_API_KEY = process.env.GITHUB_API_KEY;
    const {statuses_url} = req.body.pull_request;
    const pendingStatus = {
        state: 'pending',
        description: 'Validating your pull request',
        constext: PULL_REQUEST_VALIDATION,
    };

    const options = {
        method: 'POST',
        body: JSON.stringify(pendingStatus),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `token ${GITHUB_API_KEY}`,
        },
    };

    fetch(statuses_url, options)
        .then(() => {
            res.json({
                message: 'Validating!',
            });
        });
});

app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('pullmeup running on ' + port);