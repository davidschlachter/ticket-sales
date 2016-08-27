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

router.get('/create', function (req, res) {
  /*var payment = {
    "intent": "sale",
    "payer": {
      "payment_method": "credit_card",
      "funding_instruments": [{
        "credit_card": {
          "number": "5500005555555559",
          "type": "mastercard",
          "expire_month": 12,
          "expire_year": 2018,
          "cvv2": 111,
          "first_name": "Joe",
          "last_name": "Shopper"
        }
      }]
    },
    "transactions": [{
      "amount": {
        "total": "35.00",
        "currency": "CAD"
      },
      "description": "My awesome payment"
    }]
  };*/
  var payment = {
    "intent": "sale",
    "payer": {
      "payment_method": "paypal"
    },
    "redirect_urls": {
      "return_url": config.opt.full_url + '/execute',
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

router.get('/execute', function (req, res) {
  var paymentId = req.session.paymentId;
  var payerId = req.query.PayerID;

  var details = {
    "payer_id": payerId
  };
  paypal.payment.execute(paymentId, details, function (error, payment) {
    if (error) {
      console.log(error);
    } else {
      res.send("Payment received");
    }
  });
});

router.get('/cancel', function (req, res) {
  res.send("The payment got canceled");
});

module.exports = router;
