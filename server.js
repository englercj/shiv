var express = require('express'),
    app = express(),
    PORT = 8001;

app.use(express.bodyParser());
app.use(express.static(__dirname));
app.use(app.router);

app.listen(PORT, '0.0.0.0', function() {
    console.log('listening on localhost:'+PORT);
});