var express = require('express');
var router = express.Router();

var CommonApi = require('../controllers/CommonApiController')
var commonApi = new CommonApi();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/api/req', function(req, res, next) {
   commonApi.doRequest(req,res)
});

module.exports = router;
