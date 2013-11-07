var bencode = require('bencode'); // https://github.com/themasch/node-bencode
var fs = require('fs');
var util = require('util');
var crypto = require('crypto');
var request = require("request");
var http = require('http');
var filename = "flagfromserver.torrent";
var result = "";
var data = fs.readFile(filename, function(err, data) {
    if(err) throw err;
    result = bencode.decode(data); // decode the buffer
    var bencodedInfo = bencode.encode(result.info); // result is an object with values as buffers
    // bencodedInfo is a buffer
    fs.writeFileSync('buffer.txt', bencode.encode(result.info));
    var info_hash = crypto.createHash('sha1').update(bencodedInfo).digest('hex'); // must == hex
    var string_info_hash = info_hash.toString();
    var trackerURL = result.announce.toString(); // convert to string
    var URIEncodedHash = '';
    for (var i = 0; i < 40; i += 2) {
        URIEncodedHash += '%';
        URIEncodedHash += info_hash.slice(i, i+2);
    }
    var left = result.info['piece length'];
    var peer_id = '-UM1840-%f2sjQ%c5%7f%ef%27%3b%a4%c1%97';
    var portNo = 26085;
    var uploaded = 0;
    var downloaded = 0;
    var compact = 1;
    trackerRequest(trackerURL, URIEncodedHash,left, peer_id, portNo, uploaded, downloaded, left, compact);
});

var trackerRequest = function(trackerURL, URIEncodedHash,left, peer_id, portNo, uploaded, downloaded, left, compact) {
    var url = trackerURL + '?info_hash=' + URIEncodedHash + '&peer_id=' + peer_id + '&port=' + portNo + '&uploaded=' + uploaded + '&downloaded=' + uploaded + '&left=' + left + '&compact=' + compact;
    var body = new Buffer(0);
    var req = http.request(url, function(res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.on('data', function(chunk) {
            body = Buffer.concat([body, chunk]);
            console.log(typeof body, typeof chunk);
        });
        res.on('end', function() {
            console.log(body);
            var trackerRes = bencode.decode(body);
            console.log(trackerRes);
            var peers = trackerRes["peers"];
            for (var i = 0; i < 18; i++) {
                console.log(typeof peers,typeof peers[i]);
                console.log(peers.readUInt8(i));
            }
        });
    });
    
    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });
    // write data to request body
    req.end();
};


// info_hash: urlencoded 20-byte SHA1 hash of the value of the info key from the Metainfo
// file. Note that the value will be a bencoded dictionary, given the definition of the
// info key above.
