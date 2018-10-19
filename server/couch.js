//good sample code for working with couchdb
//uses ejs for templating
//match with ./views/couch.ejs for display
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const NodeCouchDb = require('node-couchdb');

const couch = new NodeCouchDb({
    host: '127.0.0.1',
    protocol: 'http',
    port: 2000,
    auth: {
        user:'admin',
        pass: 'password',
        
    }
});
const dbName = 'patients';
const viewUrl = '_design/patients/_view/people';
couch.listDatabases().then(function(dbs){
    console.log(dbs);
});
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function(req, res){
    // res.render('couch');
    couch.get(dbName, viewUrl).then(
        function(data, headers, status){
            console.log(data.data.rows);
            res.render('couch', {
                patients:data.data.rows
            });
        },
            function(err){
                res.send(err);
            }
        );

});
app.post('/patients/add', function(req, res){
    const last_name = req.body.last_name;
    const first_name = req.body.first_name;
    const email = req.body.email;
    const type = "patient";
    
    couch.uniqid().then(function(ids){
        const id = ids[0];
        couch.insert(dbName, {
            _id: id,
            first_name: first_name,
            last_name: last_name,
            email: email,
            type: type
        }).then(
            function(data, headers, status){
                res.redirect('/');
            },
            function(err){
                res.send(err)
            });

    })
})

app.post('/patients/delete/:id', function(req,res){
    const id = req.params.id;
    const rev = req.body.rev;
    console.log(id, rev);

    couch.del(dbName, id, rev).then(
        function(data, headers, status){
            res.redirect('/');
    },
    function(err){
        res.send(err);
    });
    
});

app.listen(3000, function(){
    console.log('Server started on Port 3000');
})
