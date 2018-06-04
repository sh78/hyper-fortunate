/*jshint esversion: 6 */

const cheerio = require('cheerio');
const request = require('request');

const sources = [{
    'name': 'giphy',
		'url': 'https://giphy.com/',
		'imageSelector': 'img[data-gif]',
		'pageLinkSelector': 'a[class^=_gifLink]',
  }, {
    // 'name': 'imgur',
    // 'name': 'reddit',
    // 'name': 'buzzfeed',
}];

function randomIndex(arr) { // pick a random index of array and return it
  let count = arr.length - 1;
  let index = Math.floor(Math.random() * Math.floor(count));
  return arr[index];
}

const url = randomIndex(sources).url;
const fetchGif = new Promise((resolve, reject) => {
  request(url, (error, response, html) => {
    if (!error && response.statusCode == 200) {
      // console.log(html);
      const page = cheerio.load(html);
      // giphy renders their gif markup dynamically, and cheerio is not a browser, so
      // find the script where giphy calls their own API
      const gifData = page('script:contains("Giphy.renderHomepage")').html();
      // and tear up the string OG style
      const theGifs = gifData.split('\"').filter(function (item) {
          return item.startsWith("http") && item.endsWith('source.gif');
      });
      // console.log(theGifs);
      resolve(randomIndex(theGifs));
    }
  });
});

// assign gif once promise is fulfilled
let gif;
fetchGif.then(data => {
  gif = data;
});

// decorate Terminal, per https://hyper.is/#extensions-api
exports.decorateTerm = function (Term, { React }) {
	return class extends Term {
		render() {
			const output = React.createElement('div', {
				className: 'hyper-fortunate',
				style: {
					'zIndex': '1',
					'width': '100%',
					'height': 'auto',
					'maxHeight': '480px',
				}
			}, React.createElement('a', {
					href: gif,
			}, React.createElement('img', {
					src: gif,
          style: {
            'margin': '10px auto',
            'maxWidth': '480px',
          }
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
      }
			.hyper-fortunate img {
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
