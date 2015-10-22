var restRequestBuilder=function(username, secret) {
    "use strict";
    var standardPostURL = "https://api5.omniture.com/admin/1.4/rest/?method=***METHOD***";
    //var standardRequestHeader = '<wsse:Security wsse:mustUnderstand=\"1\" xmlns:wsse=\"http://www.omniture.com\">\n' +
    //    '\t<wsse:UsernameToken wsse:Id=\"User\">\n' +
    //    '\t\t<wsse:Username>***USERNAME***</wsse:Username>\n' +
    //    '\t\t\t<wsse:Password Type=\"http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordDigest\">***DIGEST***</wsse:Password>\n' +
    //    '\t\t<wsse:Nonce>***NONCE***</wsse:Nonce>\n' +
    //    '\t\t<wsse:Created>***CREATED***</wsse:Created>\n' +
    //    '\t</wsse:UsernameToken>\n' +
    //    '</wsse:Security>\n';
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
