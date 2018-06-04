/*jshint esversion: 6 */

const cheerio = require('cheerio');
const request = require('request');

// set some defaults for request
// req = request.defaults({
// 	jar: true, // save cookies to jar
// 	rejectUnauthorized: false, 
// 	followAllRedirects: true // allow redirection
// });

const sources = {
	'giphy': {
		'url': 'https://giphy.com/',
		'imageSelector': 'img[data-gif]',
		'pageLinkSelector': 'a[class^=_gifLink]',
	},
	// 'imgur': {},
	// 'reddit': {},
	// 'buzzfeed': {}
};

class Gif {
	constructor(source) {	
		this.sourceURL = sources[source].url;
	}
	
	get aGif() { // return a url to a raw, random gif
		// return new Promise((resolve, reject) => {
		return request(this.sourceURL, (error, response, html) => {
				if (!error && response.statusCode == 200) {
					// console.log(html);
					const page = cheerio.load(html);
					const gifData = page('script:contains("Giphy.renderHomepage")').html();
					const theGifs = gifData.split('\"').filter(function (item) {
							return item.startsWith("https") && item.endsWith('source.gif');
					});
					console.log(this.randomIndex(theGifs));
					return this.randomIndex(theGifs);
				}
			});
	}

	randomIndex(arr) { // pick a random index of array and return it
		let count = arr.length - 1;
		let index = Math.floor(Math.random() * Math.floor(count));
		// console.log(count, index);
		return arr[index];
	}

}

exports.decorateTerm = function (Term, { React }) {
	return class extends Term {
		render() {
			const gif = new Gif('giphy').aGif;
			const output = React.createElement('div', {
				className: 'hyper-fortunate',
				style: {
					'zIndex': '1',
					'width': '100%',
				} 
			}, React.createElement('a', {
					href: gif,
			}, React.createElement('img', { 
					src: gif,
			})));

			// append out element to hyper's childrenBefore
			const customChildrenBefore = Array.from(this.props.customChildrenBefore || []).concat(output);
			return React.createElement(Term, Object.assign({}, this.props, {
				customChildrenBefore
			}));
		}
	};
};

exports.decorateConfig = function (config) {
  return Object.assign({}, config, {
    css: `
      .hyper-fortunate {
        width: 100%;
        height: 200px;
      }
			.hyper-fortunate img {
				margin: 10px auto;
			}
    `
  });
};

// exports.decorateTerm = (Term, { React, notify }) => {
// 	return class extends React.Component {
// 		constructor (props, context) {
// 			super(props, context);

// 			// set state
// 			this.state = {gifInProgress: false};
// 			this.onTerminal = this.onTerminal.bind(this);

// 			// optional user conf
// 			// const userConfig = config.getConfig().hyperFortunate || {};
// 			// this.config = Object.assign({}, defaultConfig, userConfig);
// 		}

// 		tellFortune() {
// 			const match = commands.exec(this.props.query);

// 			// check if in progress
// 			if (match && !this.state.gifInProgress) {
// 				// get the gifs
// 				const gifElements = [];

// 				const gifCount = gifElements.length - 1;
// 				const gifIndex = Math.floor(Math.random() * (gifCount + 1));

// 				this.div.style.cssText = `
// 					background: url('${gifElements[gifIndex]}');
// 					background-size: cover;
// 					background-position: center;
// 					background-repeat: no-repeat;
// 				`;

// 				this.setState({gifInProgress: true})

// 				setTimeout(() => this.clearGif(), 5000)
// 			}
// 		}

// 		clearGif() {
// 			this.div.style.background = '';
// 			this.setState({gifInProgress: false});
// 		}

// 		onTerminal(term) {
// 			this.div = term.div_;

// 			term.document_.addEventListener(
// 				'keyup', event => this.handleKeyUp(event),
// 				false
// 			);
// 		}

// 		handleKeyUp(event) {
// 			const {keyCode} = event;

// 			if(keyCode === 13) {
// 				this.tellFortune();

// 				store.dispatch({
// 					type: 'SET_QUERY',
// 					query: ' '
// 				});
// 			} else if (keyCode === 8) {
// 				store.dispatch({
// 					type: 'SET_QUERY',
// 					query: this.props.query.slice(0, -1)
// 				});
// 			}
// 		}

// 		render () {
// 			return React.createElement(
// 				Term,
// 				Object.assign(
// 					{},
// 					this.props,
// 					{onTerminal: this.onTerminal}
// 				)
// 			);
// 		}
// 	}
// };
