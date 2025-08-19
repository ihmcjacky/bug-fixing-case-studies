// import './wdyr';
import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import _ from 'underscore'
import './css/index.css';
import './css/scrollbar.css'
import './css/simpletabs.css';
import 'fontsource-roboto';
import {BrowserRouter} from 'react-router-dom';
import Main from './init/Main';
import store from './redux/store';
import { Provider } from 'react-redux';

window.$ = $;
window.__ = _;
if (process.env.NODE_ENV === 'production') {
	window.console.log = () => null;
}

ReactDOM.render(
	<React.StrictMode>
		<Provider store={store}>
			<BrowserRouter>
				<Main />
			</BrowserRouter>
		</Provider>
	</React.StrictMode>,
	document.getElementById('root')
);
