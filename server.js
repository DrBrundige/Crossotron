const path = require("path");
const express = require("express");
const PORT = 8000;
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join( __dirname, './public/dist/public')));

require('./server/config/routes')(app);

app.listen(PORT, ()=>{
    console.log("\nCrossword Server. Copywrite T. Brundige Jones Spring 2019");
    console.log(`Listening on port: ${PORT}!`);
});
