var apiai = require('apiai');

var app = apiai("e3c53c6218c94e06a47b9bf8a806c1ba", "0bd0a11c228c4fedb38247f051947432");

function ask(text, options) {
	return new Promise((resolve, reject) => {
		var defaultOptions = {
			sessionId: '12345', // use any arbitrary id - doesn't matter
		};

		let request = app.textRequest(text, Object.assign(defaultOptions, options));

		request.on('response', (response) => {
      console.log('request on');
			return resolve(response);
		});

		request.on('error', (error) => {
			return reject(error);
		});

		request.end();
	})
}

function getAllIntents(options) {
	return new Promise((resolve, reject) => {
		let request = app.intentGetRequest(options);

		request.on('response', (response) => {
      console.log("response", response);
			return resolve(response);
		});

		request.on('error', (error) => {
			return reject(error);
		});

		request.end();
	})
}

// ask something
ask('hi')
	.then(response => {
		console.log(response);
	}).catch(error => {
		console.log(error)
	});

// get list of all intents
getAllIntents()
	.then(intents => {
		console.log(intents);
	}).catch(error => {
		console.log(error)
	});
