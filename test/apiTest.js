function doMagicWSECall() {
    "use strict";
    var $ = window.jQuery;
    var user = $("#username").val(),
        secret = $("#secret").val(),
        request = $("#method").val();
    var restRequest = restRequestBuilder(user, secret);
    restRequest.setAdobeMethod("Company.GetVersionAccess");

    var $ = window.jQuery;
    $.ajax({
        type: 'POST',
        dataType: "json",
        beforeSend: function (xhrObj) {
            console.log("Sending xhr before request");
            xhrObj.setRequestHeader(
                "Authorization", 'WSSE profile="UsernameToken"'
            );
            xhrObj.setRequestHeader(
                "X-WSSE", restRequest.generateRESTHeaders()
            );
        },
        url: restRequest.generatePostURL(),
        crossDomain: true

    }).done(function(data, status) {
            $("#results").val("Status: " + status + "\n" + data);
    });

}