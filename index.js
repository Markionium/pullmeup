const express = require('express');         // call express
const app = express();                      // define our app using express
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const config = require('./config');

const {setStatusPending} = require('./validate/github');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ROUTES FOR OUR API
// =============================================================================
const router = express.Router();

router.get('/', function(req, res) {
    res.json({ message: 'Nothing here!' });
});

router.post('/validatepullrequest', (req, res) => {
    const {statuses_url} = req.body.pull_request;

    setStatusPending(statuses_url)
        .catch(v => v)
        .then(v => {
            res
                .status(v.status)
                .json(v);
        });
});

app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(config.port);
console.log('pullmeup running on ' + config.port);