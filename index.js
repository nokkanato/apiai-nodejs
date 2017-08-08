var apiai = require('apiai');
var express = require('express')
var cors = require('cors')
var bodyParser = require('body-parser')
var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

// var mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost/todoAppTest');

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/Test';


//INSERT


var insertDocument = function(db, msg, side, callback) {
   db.collection('chat').insertOne( {
      "message": 'hi there',
      "side" : 'bot',
      timestamps: true
   }, function(err, result) {
    assert.equal(err, null);
    console.log("Inserted a document into the restaurants collection.");
    callback();
  });
};



function selectAll() {
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    findChats(db, function() {
        db.close();
    });
  });

}
//FIND




var route = express()

route.use(cors())
route.set('port', process.env.PORT || 5000);
route.use(bodyParser.json());


// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   console.log("Database created!");
//   db.close();
// });


var app = apiai("57568e0586154aaaa93dd17c208d98fe", "82505ce80c414fa2b897004d68971d35");

function ask(text, options) {
	return new Promise((resolve, reject) => {
		var defaultOptions = {
			sessionId: '12345', // use any arbitrary id - doesn't matter
		};

		let request = app.textRequest(text, Object.assign(defaultOptions, options));

		request.on('response', (response) => {
      // console.log('request on');
			return resolve(response);
		});

		request.on('error', (error) => {
      console.log('eroe');
			return reject(error);
		});

		request.end();
	})
}






// ask something
function callAsk(msg, callback) {
  ask(msg)
  	.then(response => {
  		// console.log('ask' ,'response', response);
      // console.log('===', response.result.fulfillment.speech);
      callback(response.result.fulfillment.speech)
  	}).catch(error => {
      console.log('ask error', error);
  	});
}

route.post('/web', function(req, res){
  var msg = req.body.message

  MongoClient.connect(url, function(err, db) {
    db.collection('chat').insertOne({
      "message": msg,
      "side": 'client',
      timestamps: true
    }, function(err, result) {
      console.log('Client Inserted');
    })

  })

  callAsk(msg, reply=> {
    res.send(reply);
    MongoClient.connect(url, function(err, db) {
      db.collection('chat').insertOne({
        "message": reply,
        "side": 'bot',
        timestamps: true
      }, function(err, result) {
        console.log('BOT Inserted');
      })

    })
  })
})





route.get('/chats', function(req, res) {
  var lst = []
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    var cursor = db.collection('chat').find();
    cursor.each(function(err, doc) {
       assert.equal(err, null);
       if (doc != null) {
         lst.push(doc)
       } else {
         res.send(lst)
         res.sendStatus(200)
         db.close()
       }
    });
  });
})

var findChats = function(db, callback) {
   var cursor = db.collection('chat').find();
  //  console.log(cursor);
   cursor.each(function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {
         console.dir(doc);
        callback(doc)
        //  console.log( 1 ,doc._id.getTimestamp());
      } else {
         callback();
      }
   });
};

function findall(callback) {
  var lst = []
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    var cursor = db.collection('chat').find()
    cursor.each(function(err, doc) {
      if (doc!= null) {
        lst.push(doc)
      } else {
        callback(lst)
      }
    })
  });



}

route.get('/chats', function(req, res) {
  findall(chats => {
    res.send(chats)
  })

})







route.listen(route.get('port'), function() {
  console.log('Node app is running on port', route.get('port'));
});






module.exports = app;
