/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only. Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var app = express();
var data;
var db;
var MongoPassword = process.env.MONGO_PASSWORD;
var APP_PATH = path.join(__dirname, 'dist');



MongoClient.connect('mongodb://cs336:' + MongoPassword + '@ds155653.mlab.com:55653/cs336', function (err, client){
  if (err) {throw err;}

  db = client.db('cs336')

  db.collection('project').find().toArray(function (err, result){
    if (err) throw err

    data = result;
  })

});

app.set('port', (process.env.PORT || 3000));
app.use('/', express.static(APP_PATH));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Additional middleware which will set headers that we need on each request.
app.use(function(req, res, next) {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Disable caching so we'll always get the latest comments.
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

app.get('/api/tasks', function(req, res) {
    var completed, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday;
    db.collection("project").find({"Complete":"Yes"}).toArray(function(err, result){
      if (err) throw err
        completed = result;
    })
    db.collection("project").find({"Complete":"No","Day":"Monday"}).toArray(function(err, result){
      if (err) throw err
        Monday = result;
    })
    db.collection("project").find({"Complete":"No","Day":"Tuesday"}).toArray(function(err, result){
      if (err) throw err
        Tuesday = result;
    })
    db.collection("project").find({"Complete":"No","Day":"Wednesday"}).toArray(function(err, result){
      if (err) throw err
        Wednesday = result;
    })
    db.collection("project").find({"Complete":"No","Day":"Friday"}).toArray(function(err, result){
      if (err) throw err
        Friday = result;
    })
    db.collection("project").find({"Complete":"No","Day":"Saturday"}).toArray(function(err, result){
      if (err) throw err
        Saturday = result;
    })
    db.collection("project").find({"Complete":"No","Day":"Sunday"}).toArray(function(err, result){
      if (err) throw err
        Sunday = result;
    })
    data = {
      "weeklyTaskList": [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday],
      "completedTasks": completed
    };
      res.json(data);

});

app.post('/api/tasks', function(req, res) {
    var collection = db.collection('project');

    collection.insertOne({"id":Date.now(), "Type": req.body.Type, "Day": req.body.Day, "Class": req.body.Class, "Title": req.bod.Title, "Description":req.body.Description, "Urgency": req.body.Urgency, "Complete": "No"});

    db.collection('project').find().toArray(function (err, result){
      if (err) throw err;

        data = result;
        console.log(result);
        res.json(result);
    })
});

app.get('/api/tasks/:id', function(req, res) {
    db.collection('project').find({"id": Number(req.params.id)}).toArray(function(err, docs) {
        if (err) throw err;
        res.json(docs);
    });
});

app.put('/api/tasks/:id', function(req, res) {
    var updateId = Number(req.params.id);
    var update = req.body;
/*    db.collection('project').find({"id": Number(req.params.id)}).toArray(function(err, docs){
      if (err) throw err;
      if (docs.count() == 1){
        if (update.Complete == "Complete"){
          db.collection('completed').insertOne({update});
          db.collection('project').deleteOne({"id": updateID});
        }
      }
    })*/

    db.collection('project').updateOne(
        { id: updateId },
        { $set: update },
        function(err, result) {
            if (err) throw err;
            db.collection('project').find({}).toArray(function(err, docs) {
                if (err) throw err;
                res.json(docs);
            });
        });
});

app.delete('/api/tasks/:id', function(req, res) {
    db.collection('project').deleteOne(
        {'id': Number(req.params.id)},
        function(err, result) {
            if (err) throw err;
            db.collection("project").find({}).toArray(function(err, docs) {
                if (err) throw err;
                res.json(docs);
            });
        });
});

app.use('*', express.static(APP_PATH));

app.listen(app.get('port'), function() {
    console.log('Server started: http://localhost:' + app.get('port') + '/');
});
