const XWords = require('../controllers/xword');

module.exports = (app) => {
	app.get('/xwords', XWords.index);
	app.get('/xwords/str/:str', XWords.getWords);
	app.post('/xwords', XWords.create);
	app.get('/xwords/:word', XWords.show);
	app.put('/xwords/:word', XWords.update);
	app.delete('/xwords/:word', XWords.destroy);
};
