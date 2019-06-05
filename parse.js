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

var count = 0;
fs.readFile('wordssome.txt', 'utf-8', (err, data) => {
    if (err) throw err;
    // console.log(data);
    var words = data.split("\n");

    words.forEach(word => {
        // console.log("Attempting to add word: " + word);

        var que = {
            'text': "insert into xwords (word, chars, vowels, length) VALUES",
            'values': []
        }
        word = scrubWord(word);
        que = createWord(word, que, 1);
        // console.log("Query:" + que['text'] + " | " + que['values']);
        
        que.text = que.text.slice(0, que.text.length - 1);

        client.query(que.text, que.values, (err, data) => {
            if (err) {
                console.log("Creation attempt errant," + err + " for word " + word);
            } else {
                if(data.rowCount == 0){
                    console.log("Creation attempt errant: " + data);
                } else {
                    count += 1;
                    console.log("Success! Added word: " + word);
                }
            }
        });
    });
});

// client.end();

function scrubWord(str) {
    // console.log("Converting to uppercase and removing all punctuation and digits from " + str);
    str = str.toUpperCase();
    var newWord = "";
    for (let x = 0; x < str.length; x++) {
        switch (str.charAt(x)) {
            case "A": case "B": case "C": case "D": case "E": case "F": case "G": case "H":
            case "I": case "J": case "K": case "L": case "M": case "N": case "O": case "P":
            case "Q": case "R": case "S": case "T": case "U": case "V": case "W": case "X":
            case "Y": case "Z":
                newWord += str.charAt(x);
                break;
            default:
                // console.log("Scrubbed character: " + str.charAt(x));
                break;
        }
    }
    return newWord;
}
function parseChars(str) {
    // console.log("Creating an array of each character in: " + str);
    var arr = [];
    for (let x = 0; x < str.length; x++) {
        arr.push(str.charAt(x));
    }
    return arr;
}
function parseVowels(str) {
    // console.log("Creating an array of whether each char is a consonant or vowel for: "+ str);
    var arr = []
    for (let x = 0; x < str.length; x++) {
        // console.log(str.charAt(x));

        switch (str.charAt(x)) {
            case "A": case "E": case "I": case "O": case "U":
                arr.push(0);
                break;
            default:
                arr.push(1);
                break;
        }
    }
    return arr;
}
function createWord(word, que, x) {

    let text = ' ($' + x + ', $' + (x + 1) + ', $' + (x + 2) + ', $' + (x + 3) + '),';
    que.text += text;
    que.values.push(word);
    que.values.push(parseChars(word));
    que.values.push(parseVowels(word));
    que.values.push(word.length);
    return que;
}
