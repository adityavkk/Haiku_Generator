var request = require('request');

function headlineHaiku(callback, callbackArgsArr, resultCallback){
	var data = '';
	var numOfCalls = 0;

	var options = {
		url: "http://content.guardianapis.com/search?",
		qs: {
		  'api-key': "0f2a2989-af8e-444d-967d-68ab970b3871",
		  'page-size': "200",
		  'page': "1",
		}
	};

	var headlineParserCallback = function(err, res, body) {
		body = JSON.parse(body);
		data += body.response.results.map(e => e.webTitle).join('\n');
		numOfCalls++;
		if(numOfCalls < 1) {
			options.qs['page'] = Math.ceil(Math.random() * 100);
			request.get(options, headlineParserCallback);
		} else {
			callbackArgsArr.push(data);
			resultCallback(callback.apply(null, callbackArgsArr));
		}
	};
	return request.get(options, headlineParserCallback);
}

module.exports = headlineHaiku;
