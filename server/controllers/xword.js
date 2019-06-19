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
	// console.log(typeof(str));

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
	var arr = [];
	var numvow = 0;
	var numcon = 0;
	for (let x = 0; x < str.length; x++) {
		// console.log(str.charAt(x));

		switch (str.charAt(x)) {
			case "A": case "E": case "I": case "O": case "U":
				arr.push(0);
				numvow += 1;
				break;
			default:
				arr.push(1);
				numcon += 1;
				break;
		}
	}
	arr.push(numcon);
	arr.push(numvow);
	return arr;
}
function parseSearchStr(str) {
	let q = "where ";
	for (let x = 0; x < str.length; x++) {
		if (str.charAt(x) == '0' || str.charAt(x) == '1') {
			q += "vowels[" + (x + 1) + "] = " + str.charAt(x) + " AND ";
		} else if (str.charAt(x) == '2') {
			// Do nothing
		} else {
			q += "chars[" + (x + 1) + "] = '" + str.charAt(x) + "' AND ";
		}
	}
	return q;
}
function createWord(word, que, x) {

	let text = ` ($${x}, $${x + 1}, $${x + 2}, $${x + 3}, $${x + 4}, $${x + 5}),`;
	que.text += text;
	que.values.push(word);
	que.values.push(word.length);
	var vowels = parseVowels(word);
	que.values.push(vowels.pop());
	que.values.push(vowels.pop());
	que.values.push(vowels);
	que.values.push(parseChars(word));
	return que;
}

function createUpdate(word, que) {

	// var values = [];
	que.values.push(word);
	que.values.push(word.length);
	var vowels = parseVowels(word);
	que.values.push(vowels.pop());
	que.values.push(vowels.pop());
	que.values.push(vowels);
	que.values.push(parseChars(word));
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
				var words = [];
				data.rows.forEach(word => {
					words.push(word.word);
				});
				res.json({ message: true, count: data.rowCount, words: words });
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

				var words = [];
				data.rows.forEach(word => {
					words.push(word.word);
				});
				res.json({ message: true, count: data.rowCount, words: words });
			}
		});
	},
	getWordsVow: (req, res) => {
		var str = req.params.str.toUpperCase();
		var v = req.params.v.toUpperCase();
		var c = req.params.c.toUpperCase();
		console.log(getFormattedDate() + ` | Finding words that match pattern ${str} and have ${v} vowel(s) and ${c} consonant(s)`);

		var q = 'SELECT word FROM xwords ';
		q += parseSearchStr(str);
		if(c > -1){
			q += 'numcon = ' + c + " AND ";
		}
		if(v > -1){
			q += 'numvow = ' + v + " AND ";
		}
		q += 'length = ' + str.length;
		q += ' ORDER BY word ASC';

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

				var words = [];
				data.rows.forEach(word => {
					words.push(word.word);
				});
				res.json({ message: true, count: data.rowCount, words: words });
			}
		});
	},
	getCount: (req, res) => {
		console.log(getFormattedDate() + " | Returning total number of words");
		client.query('SELECT word FROM xwords ORDER BY word', (err, data) => {
			if (err) {
				console.log("Errant request!", err);
				res.json({ message: false, data: err });
			} else {
				// Returns total number of words stored in database.				
				res.json({ message: true, count: data.rowCount });
			}
		});
	},
	create: (req, res) => {
		// que, the query, this will be added to 
		var que = {
			'text': "insert into xwords (word, length, numvow, numcon, vowels, chars) VALUES",
			'values': []
		};
		if (req.body['word']) {
			console.log("Attempting to create single new word", req.body['word']);
			var word = scrubWord(req.body.word);
			que = createWord(word, que, 1);

		} else if (req.body.words) {
			console.log("Attempting to create new words by list", req.body['words']);
			let x = 1;
			req.body.words.forEach(w => {
				let word = scrubWord(w);
				que = createWord(word, que, x);
				x += 6;
			});
		} else {
			console.log("Could not create new words! Request did not contain 'word' or 'words' object!");
			res.json({ message: true, err: "Could not create new words! Request did not contain 'word' or 'words' object!" });
			return;
		}
		// Takes off the comma added to the end of the query
		que.text = que.text.slice(0, que.text.length - 1);
		que.text += " ON CONFLICT DO NOTHING;";
		console.log("Calling DB with query: " + que.text);

		client.query(que.text, que.values, (err, data) => {
			if (err) {
				console.log("Creation attempt errant!", err);
				res.json({ message: false, err: err });
			} else {
				if (req.body['word']) {
					console.log("Creation attempt unerring! Word: " + word + " added");
				} else {
					console.log("Creation attempt unerring! Added " + data.rowCount + " words");
				}
				res.json({ message: true, data: data });
			}
		});
	},
	update: (req, res) => {

		var word = scrubWord(req.body.word);
		console.log(getFormattedDate() + " | Updating " + req.params.word);

		var que = {
			'text': "UPDATE xwords SET word=$1, length=$2, numvow = $3, numcon = $4, vowels = $5, chars = $6 WHERE word = $7",
			'values': []
		};

		que = createUpdate(word, que);
		que.values.push(req.params.word);
		console.log("Calling DB with query: " + que.values);

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
	updateAll: (req, res) => {

		console.log(getFormattedDate() + " | Updating all words");
		if (req.body.password == "a18f44b8141622b27ec9") {
			client.query('SELECT word FROM xwords ORDER BY word', (err, data) => {
				if (err) {
					console.log("Errant request!", err);
					res.json({ message: false, data: err });
				} else {
					// Extracts each word from its dictionary and adds it to an array
					var successes = 0;
					var failures = 0;
					data.rows.forEach(word => {

						// word.word
						let thisWord = scrubWord(word.word);
						let que = {
							'text': "UPDATE xwords SET word=$1, length=$2, numvow = $3, numcon = $4, vowels = $5, chars = $6 WHERE word = $7",
							'values': []
						};

						que = createUpdate(thisWord, que);
						que.values.push(thisWord);

						client.query(que.text, que.values, (err, data) => {
							console.log(successes);

							if (err) {
								successes += 1;
								// console.log("Update attempt errant!", err);
								// res.json({ message: false, err: err });
							} else {
								failures += 1;
								// console.log("Update attempt unerring!");
								// res.json({ message: true, data: data });
							}
						});
					});
					res.json({ message: true, successes: successes, failures: failures });
				}
			});
		} else {
			var message = { message: "Password incorrect!" };
			res.json({ message: false, err: message });
		}
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
		var word = scrubWord(req.params.word);
		console.log(getFormattedDate() + " | Finding word: ", word);

		var text = "SELECT * FROM xwords WHERE word = $1";
		values = [word];

		client.query(text, values, (err, data) => {
			if (err) {
				console.log("Retrieval attempt errant!", err);
				res.json({ message: false, err: err });
			} else if (data.rowCount <= 0) {
				// console.log("Query successful but no rows were removed");
				res.json({ message: false, err: "Query successful but no rows were returned for word '" + word + "'. Be aware that the database is by no means comprehensive" });
			} else {
				// console.log("Word found successfully!");
				res.json({ message: true, data: data.rows });
			}
		});
	},
};
