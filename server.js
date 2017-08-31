var dotenv = require('dotenv');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');
var mongoose = require('mongoose');
var searchTerm = require('./models/searchTerm');
var google = require('googleapis');
var request = require('request');
var path = require('path');
var jade = require('jade');
dotenv.config();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGODB_URI);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.get('/', function(req, res, next) {
  res.render('index');
});

app.get('/api/recentsearchs', function(req, res, next){
    searchTerm.find({},function(err, data){
        res.json(data);
    });
});

app.get('/api/imagesearch/:searchVal(*)', function(req, res, next){
    var searchVal = req.params.searchVal;
    var offset = req.query.offset;
    console.log('searchVal: ', searchVal);
    console.log('offset: ', offset);
    var data = new searchTerm({
        searchVal: searchVal,
        searchDate: new Date()
    });

    data.save(function(err){
        if(err){
            console.log('err', err);
            return res.send('Error saving');
        }
        //res.json(data);
    });

    //the google api code
    var apiKey= process.env.APIKEY;
    var cx= process.env.CX; 
    
    //variable to hold URL for Google API + parameter + query strings
    var url = '';

    if (offset) {
    //when there is an offset query string, append this to the url for Google CSE RESTful API
      url = 'https://www.googleapis.com/customsearch/v1' + '?key=' + apiKey + '&cx=' + cx + '&searchType=image' + '&q=' + searchVal + '&start=' + offset;

    } else {

      url = 'https://www.googleapis.com/customsearch/v1' + '?key=' + 'AIzaSyDrJ8l2CMNNy5AB5MRXZs612N3ZmFXfqPg' + '&cx=' + '016901264741205120081:_tlg2nyb9pq' + '&searchType=image' + '&q=' + searchVal;

    }

    

    console.log('url', url);


     var requestObject = {
    //construct requestObject to be used in request HTTP GET Request
      uri: url,
      method: 'GET',
      timeout: 10000
    };

    request(requestObject, function (error, response, body){
        if(error){
            throw (error);
        }else{
            //construct the search results

            //array to hold the search result objects
            var array = [];
            //parse the body as JSON 
        
            var result = JSON.parse(body);
            //only use the items of the body, that is an array of search results objects
            var imageList = result.items;

            for(var i=0; i<imageList.length; i++){
                var image ={
                    "url": imageList[i].link,
                    "snippet": imageList[i].snippet,
                    "thumbnail": imageList[i].image.thumbnailLink,
                    "context": imageList[i].displayLink
                };
                array.push(image);
            }
            res.send(array);
            
        }
    });

});






app.listen(process.env.PORT || 3000, function(){
    console.log('Server is running');
});
