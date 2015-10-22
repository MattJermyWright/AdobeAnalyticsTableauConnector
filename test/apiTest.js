function preLoadUsernameSecretIfExists() {
    var $ = window.jQuery;
    $.getJSON("sensitive.json", function (data) {
        $("#username").val(data["username"]);
        $("#secret").val(data["secret"]);
        // Load defaults
        $("#rsid").val(data["rsid"]);
        $("#report_date").val(data["date"]);
        $("#report_dateFrom").val(data["dateFrom"]);
        $("#report_dateTo").val(data["dateTo"]);
    });
}
function collectFormDataForRequest() {
    var $ = window.jQuery,
        dateFrom = $("#report_dateFrom").val(),
        dateTo = $("#report_dateTo").val(),
        metricsList = $("#report_metricsList").val(),
        dimensionsList = $("#report_dimensionsList").val(),
        topElementsToSelect = $("#report_top").val(),
        returnObject = {
            "reportDescription": {
                "reportSuiteID": $("#rsid").val(),
                "date": $("#report_date").val(),
                "metrics": [{"id": "pageViews"}],
                "elements": [{"id": "page", "top": 10}]
            }
        };
    if (!!dateFrom && dateFrom.length > 0 && !!dateTo && dateTo.length > 0) {
        delete returnObject.reportDescription.date;
        returnObject.reportDescription.dateFrom = dateFrom;
        returnObject.reportDescription.dateTo = dateTo;
    }
    if (!!metricsList && metricsList.length > 0) {
        var defaultMetrics = returnObject.reportDescription.metrics,
            requestedMetrics = _.reduce(metricsList.split(","), function (current, element) {
                current.push({"id": element});
                return current;
            }, []);
        returnObject.reportDescription.metrics = requestedMetrics.length > 0 ? requestedMetrics : defaultMetrics;
    }
    if (!!dimensionsList && dimensionsList.length > 0) {
        var defaultDimensions = returnObject.reportDescription.elements,
            requestedDimensions = _.reduce(dimensionsList.split(","), function (current, element) {
                var myDimension = {"id": element};
                if (topElementsToSelect.length > 0) {
                    myDimension.top = topElementsToSelect;
                }
                current.push(myDimension);
                return current;
            }, []);
        returnObject.reportDescription.elements = requestedDimensions.length > 0 ? requestedDimensions : defaultDimensions;
    }
    console.log("Packaging JSON file...." + JSON.stringify(returnObject));
    return JSON.stringify(returnObject);
}
function doMagicWSECall() {
    "use strict";
    var $ = window.jQuery;
    var user = $("#username").val(),
        secret = $("#secret").val(),
        overrideMethod = $("#method").val(),
        method = !!overrideMethod && overrideMethod.length > 0 ? overrideMethod : $("#reportType").val();
    var restRequest = restRequestBuilder(user, secret);
    restRequest.setAdobeMethod(method);
    console.log("Request Method: " + method);

    $.ajax({
        type: 'POST',
        dataType: "json",
        data: collectFormDataForRequest(),
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

    }).done(function (data, status) {
        $("#results").val("Status: " + status + "\n" + JSON.stringify(data || {"empty": "nothing"}));
        keepTryingUntilReportIDIsReady(data["reportID"], 5);
    });
}
function keepTryingUntilReportIDIsReady(id, maxErrors) {
    var i = 0,
        errorCount = 0,
        timeoutValue = 1000;

    (function keepTrying() {
        "use strict";
        console.log("Starting keep trying...iteration=" + i++);
        var $ = window.jQuery;
        var user = $("#username").val(),
            secret = $("#secret").val(),
            method = "Report.Get"; // Used to retrieve results
        var restRequest = restRequestBuilder(user, secret);
        restRequest.setAdobeMethod(method);
        console.log("Request Method: " + method);
        $.ajax({
            type: 'POST',
            dataType: "json",
            data: JSON.stringify({"reportID": "" + id}),
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
        }).done(function (data, status) {
            if (data["error"] == "report_not_ready") {
                setTimeout(keepTrying, timeoutValue=timeoutValue*2);
            } else { // Ready perhaps
                $("#results").val("Status: " + status + "\n" + JSON.stringify(data || {"empty": "nothing"}, null, 2));
            }
        }).fail(function () {
            if (errorCount <= maxErrors) {
                errorCount+=1;
                setTimeout(keepTrying, timeoutValue=timeoutValue*2);
            }
        });
    })();
}