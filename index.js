const express = require('express');         // call express
const app = express();                      // define our app using express
const bodyParser = require('body-parser');

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
    res.json({
        message: 'Validating!',
    });
});

app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('pullmeup running on ' + port);