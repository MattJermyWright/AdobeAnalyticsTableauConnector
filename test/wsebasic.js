var restRequestBuilder = function (username, secret) {
    "use strict";
    var standardPostURL = "https://api5.omniture.com/admin/1.4/rest/?method=***METHOD***";
    var skinnyRequestHeader = 'UsernameToken Username="***USERNAME***", PasswordDigest="***DIGEST***", Nonce="***NONCE***", Created="***CREATED***"'

    function generateNonce() {
        var len = 24, chars = "0123456789abcdef", nonce = "";
        for (var i = 0; i < len; i++) {
            nonce += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return nonce;
    }

    function generateCreated() {
        var date = new Date(), y, m, d, h, i, s;
        y = date.getUTCFullYear();
        m = (date.getUTCMonth() + 1);
        if (m < 10) {
            m = "0" + m;
        }
        d = (date.getUTCDate());
        if (d < 10) {
            d = "0" + d;
        }
        h = (date.getUTCHours());
        if (h < 10) {
            h = "0" + h;
        }
        i = (date.getUTCMinutes());
        if (i < 10) {
            i = "0" + i;
        }
        s = (date.getUTCSeconds());
        if (s < 10) {
            s = "0" + s;
        }
        return y + "-" + m + "-" + d + "T" + h + ":" + i + ":" + s + "Z";
    }

    function encode() {
        var nonce = generateNonce(), createdDate = generateCreated();
        return {
            digest: b64_sha1(nonce + createdDate + secret),
            nonce: base64encode(nonce),
            created_date: createdDate
        };
    }

    function generateRESTHeaders() {
        var encodings = encode();
        return skinnyRequestHeader
            .replace("***USERNAME***", username)
            .replace("***DIGEST***", encodings.digest)
            .replace("***NONCE***", encodings.nonce)
            .replace("***CREATED***", encodings.created_date);
    }

    function generatePostURL() {
        return standardPostURL.replace("***METHOD***", this.method);
    }

    function setMethod(method) {
        this.method = method;
    }

    return {
        generateRESTHeaders: generateRESTHeaders,
        generatePostURL: generatePostURL,
        setAdobeMethod: setMethod
    }
};
