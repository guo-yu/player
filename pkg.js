var fs = require('fs');

exports.fetch = function() {
    return JSON.parse(fs.readFileSync(__dirname + '/package.json'))
}

exports.set = function(obj) {    
    if (obj && typeof(obj) == 'object') {
        fs.writeFileSync( __dirname + '/package.json',JSON.stringify(obj));
        return obj;
    } else {
        return false;
    }
}