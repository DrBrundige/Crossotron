const XWords = require('../controllers/xword');

module.exports = (app) => {
	app.get('/xwords', XWords.index);
	app.get('/xwords/count', XWords.getCount);
	app.get('/xwords/str/:str', XWords.getWords);
	app.get('/xwords/str/:str/v/:v/c/:c', XWords.getWordsVow);
	app.post('/xwords', XWords.create);
	app.get('/xwords/:word', XWords.show);
	app.put('/xwords/:word', XWords.update);
	app.put('/xwords/', XWords.updateAll);
	app.delete('/xwords/:word', XWords.destroy);
};
