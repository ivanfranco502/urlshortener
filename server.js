'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var dns = require('dns');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.DB_URI);
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

let Schema = mongoose.Schema;

let urlSchema = new Schema({
  url: {
    type: String,
    required: true
  }
});

let Url = mongoose.model('Url', urlSchema);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.post("/api/shorturl/new", (req, res) => {
  const urlToBeShorter = req.body.url;
  dns.lookup(urlToBeShorter, err => {
    if (err)
    {
      res.json({"error": "invalid URL"});
    }
    
    let url = new Url();
    url.url = urlToBeShorter;
    
    url.save((err, data) => {
      if (err) console.error("Couldn't save entity");
      res.json({"original_url": data.url, "short_url": data._id});
    });
  });
});

app.get("/api/shorturl/:short_id", (req, res) =>{
  Url.findById(req.params.short_id, (err, data) => {
    if (err) console.error("Couldn't find short_id");
    res.redirect(data.url);
  });
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});