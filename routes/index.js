var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
  res.render('index', {
    pageName: 'index',
    title: 'NSB Hackathon'
  });
});

module.exports = router;
