var express = require('express');
var router = express.Router();
var paypal = require('paypal-rest-sdk');
var config = require('../config');

paypal.configure(config.opt.paypal);

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Express'
  });
});

router.post('/create', function (req, res) {
  req.session.name = req.body.name;
  req.session.email = req.body.email;
  req.session.type = req.body.type;
  var payment = {
    "intent": "sale",
    "payer": {
      "payment_method": "paypal"
    },
    "redirect_urls": {
      "return_url": config.opt.full_url + '/confirm',
      "cancel_url": config.opt.full_url + '/cancel'
    },
    "transactions": [{
      "amount": {
        "total": "35.00",
        "currency": "CAD",
        "details": {
          "subtotal": "35.00"
        }
      },
      "description": "Admission for one to the Second Annual Battle of the Bands"
    }],
  };
  console.log("payment here is", payment);
  paypal.payment.create(payment, function (error, payment) {
    if (error) {
      console.log(error);
    } else {
      console.log("payment here is", payment);
      if (payment.payer.payment_method === 'paypal') {
        req.session.paymentId = payment.id;
        var redirectUrl;
        for (var i = 0; i < payment.links.length; i++) {
          var link = payment.links[i];
          if (link.method === 'REDIRECT') {
            redirectUrl = link.href;
          }
        }
        res.redirect(redirectUrl);
      }
    }
  });
});

router.get('/confirm', function (req, res) {
  if (typeof(req.query.PayerID) != "undefined") {
    req.session.PayerID = req.query.PayerID;
  }
  if (typeof(req.session.email) === "undefined") {
    return res.redirect(config.opt.full_url + '/');
  }
  var amount;
  if (req.session.type === 'student') {
    amount = "$30";
  } else {
    amount = "$35";
  }
  res.render('confirm', {
      title: 'Confirm purchase',
      userName: req.session.name,
      userEmail: req.session.email,
      userType: req.session.type,
      userAmount: amount
        });

});

router.get('/execute', function (req, res) {
  var paymentId = req.session.paymentId;
  var payerId = req.session.PayerID;

  var details = {
    "payer_id": payerId
  };
  paypal.payment.execute(paymentId, details, function (error, payment) {
    if (error) {
      console.log(error);
    } else {
      delete req.session.name;
      delete req.session.email;
      delete req.session.type;
      res.send("Payment received");
    }
  });
});

router.get('/cancel', function (req, res) {
  res.send("The payment got canceled");
});

module.exports = router;
