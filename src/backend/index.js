let express = require('express')
let app = express();
var port = process.env.PORT || 8080;
let apiRoutes = require("./api-routes");
let bodyParser = require('body-parser');
let mongoose = require('mongoose');

app.use(bodyParser.urlencoded({
    extended: true,
}));
app.use(bodyParser.json());
mongoose.connect('mongodb://localhost/treelo', {userNewUrlParser:true});
var db = mongoose.connection;

if(!db)
    console.log("Error connecting to db");
else
    console.log("Db connected successfully");

app.use('/api', apiRoutes);
app.get('/', (req, res) => res.send('Hello World'));
app.listen(port, function(){
    console.log("Running on port " + port);
});

