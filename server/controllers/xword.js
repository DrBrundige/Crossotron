const Connection = require('./connection.js');

const { Client } = require('pg');

const client = new Client({
	database: Connection.getDatabase(),
	host: Connection.getHost(),
	user: Connection.getUser(),
	password: Connection.getPassword(),
	port: Connection.getPort(),
});

// Connects to PG database using credentials provided above.
client.connect();

function scrubWord(str) {
	// console.log("Converting to uppercase and removing all punctuation and digits from " + str);
	console.log(typeof(str));
	
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
	console.log("Creating an array of each character in: " + str);
	var arr = [];
	for (let x = 0; x < str.length; x++) {
		arr.push(str.charAt(x));
	}
	return arr;
}
function parseVowels(str) {
	console.log("Creating an array of whether each char is a consonant or vowel for: "+ str);
	var arr = []
	for (let x = 0; x < str.length; x++) {
		console.log(str.charAt(x));

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
function parseSearchStr(str) {
	let q = "where ";
	for (let x = 0; x < str.length; x++) {
		if (str.charAt(x) == '0' || str.charAt(x) == '1') {
			q += "vowels[" + (x + 1) + "] = " + str.charAt(x) + " AND ";
		} else {
			q += "chars[" + (x + 1) + "] = '" + str.charAt(x) + "' AND ";
		}
	}
	return q;
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

function createUpdate(word, que) {

	que.values.push(word);
	que.values.push(parseVowels(word));
	que.values.push(parseChars(word));
	que.values.push(word.length);
	return que;
}

function getFormattedDate() {
	var d = new Date(),
		month = '' + (d.getMonth() + 1),
		day = '' + d.getDate(),
		year = d.getFullYear(),
		hour = '' + d.getHours(),
		minute = '' + d.getMinutes(),
		second = '' + d.getSeconds();

	if (month.length < 2) month = '0' + month;
	if (day.length < 2) day = '0' + day;
	if (hour.length < 2) hour = '0' + hour;
	if (minute.length < 2) minute = '0' + minute;
	if (second.length < 2) second = '0' + second;
	var date = [year, month, day].join('-');
	var time = [hour, minute, second].join(':');

	return date + " " + time;
}

module.exports = {
	index: (req, res) => {
		console.log(getFormattedDate() + " | Returning all words");

		client.query('SELECT word FROM xwords ORDER BY word', (err, data) => {
			if (err) {
				console.log("Errant request!", err);
				res.json({ message: false, data: err });
			} else {
				// Extracts each word from its dictionary and adds it to an array
				var words = []
				data.rows.forEach(word => {
					words.push(word.word)
				});
				res.json({ message: true, words: words });
			}
		});
	},
	getWords: (req, res) => {
		const str = req.params.str.toUpperCase();
		console.log(getFormattedDate() + " | Finding words that match pattern " + str);

		var q = 'SELECT word FROM xwords ';
		q += parseSearchStr(str);
		q += 'length = ' + str.length + ' ORDER BY word ASC';
		// console.log("Running query: " + q);

		client.query(q, (err, data) => {
			if (err) {
				console.log("Errant request!", err);
				res.json({ message: false, data: err });
			} else if (data.rowCount <= 0) {
				// console.log("Query successful but no rows were found!");
				res.json({ message: false, err: "Query successful but no rows were returned for pattern '" + str + "'!" });
			} else {
				// console.log("Success! Returning data!");
				// Extracts each word from its dictionary and adds it to an array

				var words = []
				data.rows.forEach(word => {
					words.push(word.word)
				});
				res.json({ message: true, words: words });
			}
		});
	},
	create: (req, res) => {
		// que, the query, this will be added to 
		var que = {
			'text': "insert into xwords (word, chars, vowels, length) VALUES",
			'values': []
		}
		if (req.body['word']) {
			console.log("Attempting to create single new word", req.body['word']);
			let word = scrubWord(req.body['word'][0]);
			que = createWord(word, que, 1);
		}
		if (req.body['words']) {
			console.log("Attempting to create new words by list", req.body['words']);
			let x = 1;
			req.body['words'].forEach(w => {
				let word = scrubWord(w);
				que = createWord(word, que, x);
				x += 4;
			});
		}
		// Takes off the comma added to the end of the query
		que.text = que.text.slice(0, que.text.length - 1);

		client.query(que.text, que.values, (err, data) => {
			if (err) {
				console.log("Creation attempt errant!", err);
				res.json({ message: false, err: err });
			} else {
				// console.log("Creation attempt unerring!");
				res.json({ message: true, data: data });
			}
		});
	},
	update: (req, res) => {

		var word = scrubWord(req.body.word);
		console.log(getFormattedDate() + " | Updating " + req.params.word + " to " + word);

		var que = {
			'text': "UPDATE xwords SET word = $1, vowels=$2, chars=$3, length=$4 WHERE word=$5",
			'values': []
		};

		que = createUpdate(word, que);
		que.values.push(req.params.word);

		client.query(que.text, que.values, (err, data) => {
			if (err) {
				console.log("Update attempt errant!", err);
				res.json({ message: false, err: err });
			} else {
				console.log("Update attempt unerring!");
				res.json({ message: true, data: data });
			}
		});
	},
	destroy: (req, res) => {
		const word = req.params.word;
		console.log(getFormattedDate() + " | Deleting word: ", word);

		var text = "DELETE FROM xwords WHERE word = $1";
		values = [word];

		client.query(text, values, (err, data) => {
			if (err) {
				console.log("Deletion attempt errant!", err);
				res.json({ message: false, err: err });
			} else if (data.rowCount <= 0) {
				// console.log("Query successful but no rows were removed");
				res.json({ message: false, data: data });
			} else {
				// console.log("Successfully removed!");
				res.json({ message: true, data: data });
			}
		});
	},
	show: (req, res) => {
		const word = req.params.word;
		console.log(getFormattedDate() + " | Finding word: ", word);

		var text = "SELECT * FROM xwords WHERE word = $1";
		values = [word];

		client.query(text, values, (err, data) => {
			if (err) {
				console.log("Retrieval attempt errant!", err);
				res.json({ message: false, err: err });
			} else if (data.rowCount <= 0) {
				// console.log("Query successful but no rows were removed");
				res.json({ message: false, err: "Query successful but no rows were returned for word '" + word + "'. Be aware that the database is by no means comprehensive, but also case sensitive and stores words in all caps" });
			} else {
				// console.log("Word found successfully!");
				res.json({ message: true, data: data.rows });
			}
		});
	},
};
