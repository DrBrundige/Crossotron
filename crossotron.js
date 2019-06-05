const { Client } = require('pg');
const fs = require('fs')

const Connection = require('./server/controllers/connection.js');

const client = new Client({
	database: Connection.getDatabase(),
	host: Connection.getHost(),
	user: Connection.getUser(),
	password: Connection.getPassword(),
	port: Connection.getPort(),
});

// Connects to PG database using credentials provided above.
client.connect();

// var puzzle = [
//     [1, 0, 0, 'S', '8', '8', '8'],
//     [0, 1, 0, 'A', '8', '8', '8'],
//     [1, 0, 0, 'H', '8', '8', '8'],
//     ['S', 'E', 'N', 'A', 'T', '0', 'R'],
//     ['8', '8', '8', 'R', 0, 1, 0],
//     ['8', '8', '8', 'A', 1, 1, 0],
//     ['8', '8', '8', 'N', 0, 0, 1]];

// var puzzle = [
//     ['B', 'A', 'E', 'R'],
//     ['O', 1, 1, 0],
//     ['A', 1, 0, 1],
//     ['T', 0, 1, 0]];

var puzzle = [
    ['T', 'H', 'O', 'R'],
    ['R', 0, 1, 0],
    ['O', 1, 0, 1],
    ['N', 0, 1, 1]];

// P  E  A  S  	  
// A  R  E  A  	  
// N  I  O  H  	  
// S  E  N  A  T  O  R
//          R  I  C  E
//          A  C  H  E
//          N  O  O  K


var localBase = [];

var solvedPuzzle = [];

var examine = [
    // { 'row': 0, 'across': true, 's': 0, 'e': 4 },
    // { 'row': 0, 'across': false, 's': 0, 'e': 4 },
    { 'row': 1, 'across': true, 's': 0, 'e': 4 },
    { 'row': 1, 'across': false, 's': 0, 'e': 4 },
    { 'row': 2, 'across': true, 's': 0, 'e': 4 },
    { 'row': 2, 'across': false, 's': 0, 'e': 4 },
    { 'row': 3, 'across': true, 's': 0, 'e': 4 },
    { 'row': 3, 'across': false, 's': 0, 'e': 4 },
    // { 'row': 4, 'across': true, 's': 3, 'e': 7 },
    // { 'row': 4, 'across': false, 's': 3, 'e': 7 },
    // { 'row': 5, 'across': true, 's': 3, 'e': 7 },
    // { 'row': 5, 'across': false, 's': 3, 'e': 7 },
    // { 'row': 6, 'across': true, 's': 3, 'e': 7 },
    // { 'row': 6, 'across': false, 's': 3, 'e': 7 },
]

var overflow = 0

function crossotron(ex) {
    if (ex >= examine.length) {
        var sp = []
        console.log("We're done!");
        for (let z = 0; z < puzzle.length; z++) {
            sp.push(puzzle[z].slice(0));
        }
        solvedPuzzle.push(sp)
        console.log(puzzle);
        return 0;
        // return 1;
    } else {
        // console.log("Row: " + ex, examine[ex]);
        let thisRow = [];
        let x = examine[ex]['row']
        let s = examine[ex]['s']
        let e = examine[ex]['e']
        var localData

        // Extracting thisRow
        for (let y = s; y < e; y++) {
            if (examine[ex]['across']) {
                thisRow.push(puzzle[x][y]);
            } else {
                thisRow.push(puzzle[y][x]);
            }
        }

        localData = localQuery(thisRow);
        console.log("Querying localData for row: " + thisRow);

        for (let n = 0; n < localData.length; n++) {
            // Changing row to next row
            console.log("Changing row to " + localData[n]);
            for (let y = 0; y < localData[n].length; y++) {
                if (examine[ex]['across']) {
                    puzzle[x][y + s] = localData[n][y];
                } else {
                    puzzle[y + s][x] = localData[n][y];
                }
            }
            // console.log("Complete! Puzzle is now:\n", puzzle);
            if (overflow > 100000) {
                console.log("\nOverflow alert!\n");
                return 1;
            } else {
                r = crossotron(ex + 1);
                if (r == 1) {
                    console.log("Solution found! Returning");

                    return 1;
                }
                overflow += 1;
            }
        }

        console.log("Returning row to " + thisRow);
        for (let y = 0; y < thisRow.length; y++) {
            if (examine[ex]['across']) {
                puzzle[x][y + s] = thisRow[y];
            } else {
                puzzle[y + s][x] = thisRow[y];
            }
        }
        console.log("Returning!");
        return 0;
    }
}

// console.log(solvedPuzzle)

let q = "SELECT chars, vowels FROM xwords WHERE length = 4 ORDER BY word";
client.query(q, (err, data) => {
    if (err) {
        console.log("Errant request!", err);
    } else {
        // console.log(data);
        localBase = data.rows
        // console.log(localBase);

        localData = localQuery(['B', 0, 0, 1]);
        // localData = localQuery(['O', 1, 1, 0]);
        crossotron(0);
        // console.log("Local data:", localData);
    }
		client.end();
		console.log("\nFor puzzle:");
		console.log(puzzle);
		if(solvedPuzzle.length > 0){
			console.log("\nFound solution:");
			console.log(solvedPuzzle[1]);
		} else {
			console.log("Found no solutions!");
		}
});
console.log("Crooked as a crocodile");

function localQuery(query) {
    var data = [];
    // console.log(query);
    // console.log(localBase.length);

    for (let x = 0; x < localBase.length; x++) {
        // console.log("Iterating for:", localBase[x]);

        var add = true;
        for (let y = 0; y < query.length; y++) {
            if (typeof query[y] == 'number') {
                if (localBase[x]['vowels'][y] != query[y]) {
                    add = false;
                    break;
                }
            } else {
                if (localBase[x]['chars'][y] != query[y]) {
                    add = false;
                    break;
                }
            }
        }
        if (add) {
            data.push(localBase[x]['chars']);
        }
    }
    // console.log("Data:",data);
    return data;
}

