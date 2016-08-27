var setUpReg = function () {
  document.getElementById("block").style.display = 'block';
  document.getElementById("details").style.display = 'block';
};
var closeReg = function () {
  document.getElementById("block").style.display = 'none';
  document.getElementById("details").style.display = 'none';
};

var stagePayment = function () {
  var email = document.getElementById("email").value;
  var name = document.getElementById("name").value;
  var type = document.getElementById("type").value;

  var data = {
    "email": email,
    "name": name,
    "type": type
  };

  var request = new XMLHttpRequest();
  request.open('POST', 'create', true);
  request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

  request.onload = function () {
    if (request.status >= 200 && request.status < 400) {
      // Success!
      var got = JSON.parse(request.responseText);
      console.log(got);
    } else {
      // We reached our target server, but it returned an error
      console.log(request);
    }
  };

  request.send(data);
}
