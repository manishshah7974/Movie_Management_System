// Model --------------->

interface IMovie {
    name: string;
    year: number;
    cast: string;
}
interface IDBEntity<T> {
    id: number;
    addedTimeStamp: string;
    updatedTimeStamp: string;
    data: T;
}

function getTime() {
    const date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let time = date.toLocaleTimeString();
    let currentDate: string = `${day}-${month}-${year} ${time}`;
    // console.log(currentDate); 
    return currentDate;
}

// Storage ----------------------------->
var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";



let x = 0;  // DataBase Index Updates

function createDatabase() {
    MongoClient.connect(url, function (err, db) {            // Creating DataBase
        if (err) throw err;
        console.log("Database created!");
        db.close();
    });

    MongoClient.connect(url, function (err, db) {         // Creating Collection
        if (err) throw err;
        var dbo = db.db("mydb");
        dbo.createCollection("movieDB", function (err, res) {
            if (err) throw err;
            console.log("Collection created! - MovieDB");
            db.close();
        });
    });

    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");                         //  Inserting Sample Data
        var myobj = [
            { id: ++x, addedTimeStamp: getTime(), updatedTimeStamp: "-", data: { name: "Harry Potter 1", year: 2000, cast: "daniel radcliffe" } },
            { id: ++x, addedTimeStamp: getTime(), updatedTimeStamp: "-", data: { name: "Harry Potter 2", year: 2002, cast: "daniel radcliffe" } },
            { id: ++x, addedTimeStamp: getTime(), updatedTimeStamp: "-", data: { name: "Harry Potter 3", year: 2005, cast: "daniel radcliffe" } }
        ];
        dbo.collection("movieDB").insertMany(myobj, function (err, res) {
            if (err) throw err;
            console.log("Number of documents inserted: " + res.insertedCount);

            db.close();
        });

    });
}

//createDatabase();


// Controller ----------------------------------->

var express = require('express');
var app = express();
var PORT = 8080;

// For parsing application/json
app.use(express.json());

// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

//Update a Movie by its Name
app.put('/update', (req, res) => {
    
    console.log(req.body);
    const Movie: IMovie = { name: req.body.name, year: req.body.year, cast: req.body.cast };
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        var myquery = { "data.name": req.body.name };
      //  var newvalues = { $set: {"updatedTimeStamp":getTime(),data:{"data.name":req.body.name,"data.cast":req.body.cast,"data.year":req.body.year}} };
        var newvalues = { $set: {"updatedTimeStamp":getTime(),"data.name":req.body.name,"data.cast":req.body.cast,"data.year":req.body.year} };
        dbo.collection("movieDB").updateOne(myquery, newvalues, function(err, res) {
          if (err) 
          res.status(400).send("Error While Updating Movies!");
          else
          console.log("1 document updated "+Movie.name+" "+Movie.cast+" "+Movie.year);
          db.close();
        });
      });
      res.json(Movie);
    });


// Post a Movie :-
app.post('/addMovie', function (req, res) {

        console.log(req.body);
        const newMovie: IMovie = { name: req.body.name, year: req.body.year, cast: req.body.cast };
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db("mydb");
            dbo.collection("movieDB").insertOne({ id: ++x, addedTimeStamp: getTime(), updatedTimeStamp: "-", data: newMovie }, function(err, res) {
                if (err) 
                    res.status(400).send("Error While Adding Movie!");        

            });
        });
        res.json(newMovie);
    });
    
       

// GET A Movie by its Year
app.get('/getMovieByYear/:year', (req, res) => {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        dbo.collection("movieDB").find({"data.year":Number(req.params.year)}).toArray(function (err, result) {
            if (err) {
                res.status(400).send("Error fetching Movie Names!");
            } else {
                res.json(result);
            }
        });
    });
});

// GET A Movie by its Name
app.get('/getMovieByName/:name', (req, res) => {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        dbo.collection("movieDB").find({"data.name":req.params.name}).toArray(function (err, result) {
            if (err) {
                res.status(400).send("Error fetching Movie Names!");
            } else {
                res.json(result);
            }
        });
    });
})
// findAll Movies 
app.get('/findAll', (req, res) => {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        dbo.collection("movieDB").find({}, { projection: {data:1 }}).toArray(function (err, result) {
            if (err) {
                res.status(400).send("Error fetching Movie Names!");
            } else {
                res.json(result);
            }
        });
    });

})

// findAll data  - Working
app.get('/findAllData', (req, res) => {

    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        dbo.collection("movieDB").find({}).toArray(function (err, result) {
            if (err) {
                res.status(400).send("Error fetching Movies!");
            } else {
                res.json(result);
            }
        });
    });

}
)



app.listen(PORT, function (err) {
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});


