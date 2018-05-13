var moment = require('moment');

var generateMessage = (from, text) => {

	return {

		from,
		text,
		createdAt: moment.valueOf()
	};
};

var generateLocationMessage = (from, lat, long) => {

		return {

			from,
			url: `https://google.com/maps?q=${lat},${long}`,
			createdAt: moment.valueOf()
		};
};

module.exports = {

	generateMessage,
	generateLocationMessage
};