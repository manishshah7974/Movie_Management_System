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

var movieList: IDBEntity<IMovie>[] = [];        // Using Array Instead of DataBase

let x = 0;  // DataBase Index Updates

// Sample Data in Memory -
movieList.push({ id: ++x, addedTimeStamp: getTime(), updatedTimeStamp: "-", data: { name: "Harry Potter 1", year: 2000,cast:"daniel radcliffe" } });
movieList.push({ id: ++x, addedTimeStamp: getTime(), updatedTimeStamp: "-", data: { name: "Harry Potter 2", year: 2002,cast:"daniel radcliffe" } });
movieList.push({ id: ++x, addedTimeStamp: getTime(), updatedTimeStamp: "-", data: { name: "Harry Potter 3", year: 2005,cast:"daniel radcliffe" } });

//console.log(movieList);


// Service ------->
function addMovie(newMovie: IMovie) {
    try {
        movieList.push({ id: ++x, addedTimeStamp: getTime(), updatedTimeStamp: "-", data: newMovie });
    } catch (err) {
        console.log(err.message);
    }
    return true;
}

function getMovieById(ID: number) {
    let flag = 0;
    for (let i = 0; i < movieList.length; i++) {
        if (movieList[i].id == ID) {
            flag = 1;
            return movieList[i];
        }
    }
    if (flag == 0)
    return "Not Found";
}

function getMovieByName(name: string) {
    let flag = 0;
    for (let i = 0; i < movieList.length; i++) {
        if (movieList[i].data.name === name) {
            flag = 1;
            return movieList[i];
        }
    }
    if (flag == 0)
        return "Not Found";
}

function findAllMovieName() {
    const allMovie = new Set();                // Creating A Set for only adding each movie once
    for (let i = 0; i < movieList.length; i++)
        allMovie.add(movieList[i].data.name);

    return Array.from(allMovie);              // Returning List of All Movies being present 
}

function updateMovie(movie: IMovie) {
    let indexOfMovie = -1;
    let i = 0;
    for (i = 0; i < movieList.length; i++) {
        if (movieList[i].data.name == movie.name) {
            indexOfMovie = i;
            break;
        }
    }
    if (indexOfMovie != -1) {
        movieList[i].updatedTimeStamp = getTime();
        movieList[i].data = movie;
        return 1;    // 1 - Movie Updated
    }
    else {
        addMovie(movie);
        return 2;  // 2- New Movie Added
    }
}

function findAllData()
{
    return movieList;
}


// Controller ----------------------------------->

var express = require('express');
var app = express();
var PORT = 8080;

// For parsing application/json
app.use(express.json());

// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));



// Post a Movie :-
app.post('/addMovie', function (req, res) {
    try {

        console.log(req.body);
        const newMovie: IMovie = { name: req.body.name, year: req.body.year , cast: req.body.cast };
        if (addMovie(newMovie) == true)        // Calling a Service
            res.status(200).json({
                message: 'Movie successfully added - ' + newMovie.name
            });

        console.log(movieList);
    }
    catch (err) {
        console.log(err.message);
    }
});

// GET A Movie by its ID
app.get('/getMovieById/:id', (req, res) => {
    if (req.params.id === undefined)
        throw " ID is empty";

    const reqMovie = getMovieById(req.params.id);   // Calling a Service
    if (reqMovie=="Not Found") {
        res.status(404).json({message: "Not found"})
    }
    else {
       
            res.status(200).json(reqMovie);
        }
    });

// GET A Movie by its Name
app.get('/getMovieByName/:name', (req, res) => {
    if (req.params.name === undefined)
        throw " Name is empty";
        const reqMovie = getMovieByName(req.params.name);   // Calling a Service
        if (reqMovie=="Not Found") {
            res.status(404).json({message: "Not found"})
        }
        else {
                res.status(200).json(reqMovie);
            }
        });

// findAll Movies 
app.get('/findAll', (req, res) => {

    let uniqueMovieList = findAllMovieName();     // Calling a Service
    if (uniqueMovieList.length > 0) {
        res.status(200).json(uniqueMovieList);
    }
    else {
        res.status(404).json({
            message: "No Movie Found "
        })
    }
})

// findAll data 
app.get('/findAllData', (req, res) => {

    let uniqueMovieList = findAllData();        // Calling a Service
    if (uniqueMovieList.length > 0) {
        res.status(200).json(uniqueMovieList);
    }
    else {
        res.status(404).json({
            message: "No Movie Found "
        })
    }
})

//Update a Movie by its ID
app.put('/update', (req, res) => {
    try {
        console.log(req.body);
        const Movie: IMovie ={ name: req.body.name, year: req.body.year , cast: req.body.cast };
        let update_status = updateMovie(Movie);          // Calling a Service
        if (update_status == 1)
            res.status(200).json(" Movie Updated -" +{ name: req.body.name, year: req.body.year , cast: req.body.cast });
        else
            res.status(200).json("Movie Added -" +{ name: req.body.name, year: req.body.year , cast: req.body.cast });


    } catch (err) {
        console.log(err.message);
    }
})



app.listen(PORT, function (err) {
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});


