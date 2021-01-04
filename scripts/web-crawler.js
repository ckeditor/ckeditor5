#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const puppeteer = require( 'puppeteer' );
const chalk = require( 'chalk' );
const ora = require( 'ora' );
const minimist = require( 'minimist' );

const ERROR_TYPES = {
	PAGE_CRASH: {
		event: 'error',
		description: 'Page crash'
	},
	UNCAUGHT_EXCEPTION: {
		event: 'pageerror',
		description: 'Uncaught exception'
	},
	REQUEST_FAILURE: {
		event: 'requestfailed',
		description: 'Request failure'
	},
	RESPONSE_FAILURE: {
		event: 'response',
		description: 'Response failure'
	},
	CONSOLE_ERROR: {
		event: 'console',
		description: 'Console error'
	}
};

const options = parseArguments( process.argv.slice( 2 ) );

startCrawler( options );

/**
 * Main crawler function. Its purpose is to:
 * - create puppeteer's browser,
 * - open new page instance,
 * - register error handlers,
 * - collect all links from the provided URL,
 * - open all collected links,
 * - show error summary.
 *
 * @param {Object} page The page instance from Puppeteer.
 * @param {Function} onError Called each time an error has been emitted.
 */
async function startCrawler( options ) {
	console.log( chalk.bold( '\n🔎 Starting the Crawler\n' ) );

	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	dismissDialogs( page );

	const spinner = createSpinner();

	spinner.start( 'Registering error handlers…' );

	const errors = new Map();

	registerErrorHandlers( page, handleError( errors ) );

	spinner.succeed( `Registering error handlers… ${ chalk.bold( 'Done' ) }` );

	spinner.start( 'Collecting links…' );

	const links = new Set( await getLinksFromUrl( page, options.url, ...options.selectors ) );

	spinner.succeed( `Collecting links… ${ chalk.bold( `${ links.size } found` ) }` );

	spinner.start( 'Checking pages…' );

	await openLinks( page, links, ( { current, total } ) => {
		spinner.text = `Checking pages… ${ chalk.bold( `${ Math.round( current / total * 100 ) }%` ) }`;
	} );

	spinner.succeed( `Checking pages… ${ chalk.bold( 'Done' ) }` );

	browser.close();

	logErrors( errors );
}

/**
 * Dismisses any dialogs (alert, prompt, confirm, beforeunload) that could be displayed on page load.
 *
 * @param {Object} page The page instance from Puppeteer.
 */
function dismissDialogs( page ) {
	page.on( 'dialog', async dialog => {
		await dialog.dismiss();
	} );
}

/**
 * Creates nice-looking CLI spinner.
 */
function createSpinner() {
	return ora( {
		indent: 2,
		spinner: {
			frames: [ '⣾', '⣷', '⣯', '⣟', '⡿', '⢿', '⣻', '⣽' ]
		}
	} );
}

/**
 * Returns an error handler, which is called each time new error is emitted.
 *
 * @param {Map<Object, Object>} errors All errors grouped by their type.
 * @returns {Function} Error handler.
 */
function handleError( errors ) {
	return error => {
		if ( !errors.has( error.type ) ) {
			errors.set( error.type, {
				errors: {},
				total: 0
			} );
		}

		const def = errors.get( error.type );

		def.errors[ error.message ] = def.errors[ error.message ] || {
			// Store only unique pages, because given error can occur multiple times on the same page.
			pages: new Set(),
			total: 0
		};

		def.errors[ error.message ].pages.add( error.page );
		def.errors[ error.message ].total++;

		def.total++;
	};
}

/**
 * Registers all error handlers on given page instance.
 *
 * @param {Object} page The page instance from Puppeteer.
 * @param {Function} onError Called each time an error has been emitted.
 */
function registerErrorHandlers( page, onError ) {
	page.on( ERROR_TYPES.PAGE_CRASH.event, error => onError( {
		page: page.url(),
		type: ERROR_TYPES.PAGE_CRASH,
		message: error.message
	} ) );

	page.on( ERROR_TYPES.UNCAUGHT_EXCEPTION.event, error => onError( {
		page: page.url(),
		type: ERROR_TYPES.UNCAUGHT_EXCEPTION,
		message: error.message
	} ) );

	page.on( ERROR_TYPES.REQUEST_FAILURE.event, request => onError( {
		page: page.url(),
		type: ERROR_TYPES.REQUEST_FAILURE,
		message: `${ request.failure().errorText } for ${ request.url() }`
	} ) );

	page.on( ERROR_TYPES.RESPONSE_FAILURE.event, response => {
		if ( response.status() > 399 ) {
			onError( {
				page: page.url(),
				type: ERROR_TYPES.RESPONSE_FAILURE,
				message: `HTTP code ${ response.status() } (${ response.statusText() }) for ${ response.url() }`
			} );
		}
	} );

	page.on( ERROR_TYPES.CONSOLE_ERROR.event, message => {
		const ignoredMessages = [
			// The resource loading failure, which is tracked in console, is already covered by the
			// `response` or `requestfailed` events.
			'Failed to load resource: the server responded with a status of'
		];

		if ( ignoredMessages.some( ignoredMessage => message.text().startsWith( ignoredMessage ) ) ) {
			return;
		}

		if ( message.type() === 'error' ) {
			onError( {
				page: page.url(),
				type: ERROR_TYPES.CONSOLE_ERROR,
				message: message.text()
			} );
		}
	} );
}

/**
 * Collects all links from requested URL. Each selector is passed to the `document.querySelectorAll()` method,
 * which is invoked within the page context and returns matched elements: that is anchors with the `href` attribute
 * with the same host as the page. External links are excluded.
 *
 * This function is called recursively to support multi-page sites: for each link found inside nth selector, the
 * (n+1)th selector (if exists) is searched for anchors. Example: if a site has a main navigation bar on top and
 * each page has also additional navigation section aside, then providing 2 selectors (first one for the bar on top,
 * and second one for the aside container), this function will automatically collect all these links. It is not
 * limited to only 2 navigation containers, but it works with any number of nested sub-pages!
 *
 * @param {Object} page The page instance from Puppeteer.
 * @param {String} url The URL to open and collect links.
 * @param {Array.<String>} selectors An array of CSS selector strings to search for links.
 * @returns {Array.<String>} An array of collected links.
 */
async function getLinksFromUrl( page, url, ...selectors ) {
	// Consider navigation to be finished when there are no network connections for at least 500 ms.
	await page.goto( url, { waitUntil: 'networkidle0' } );

	const host = new URL( url ).host;

	const links = await page.$$eval( selectors.shift(), ( links, host ) => {
		return links
			.filter( link => link.href && new URL( link.href ).host === host )
			.map( link => link.href );
	}, host );

	if ( selectors.length ) {
		for ( const link of [ ...links ] ) {
			links.push( ...await getLinksFromUrl( page, link, ...selectors ) );
		}
	}

	return links;
}

/**
 * Opens sequentially all provided links to pages.
 *
 * @param {Object} page The page instance from Puppeteer.
 * @param {Array.<String>} links An array of links to pages to examine.
 * @param {Function} onProgress Called each time a link to a page has been opened.
 */
async function openLinks( page, links, onProgress ) {
	let current = 0;

	for ( const link of links ) {
		// Consider navigation to be finished when there are no network connections for at least 500 ms.
		await page.goto( link, { waitUntil: 'networkidle0' } );

		onProgress( {
			current: ++current,
			total: links.size
		} );
	}
}

/**
 * Analyzes the error collection and logs them in the console.
 *
 * @param {Map<Object, Object>} errors All found errors grouped by their type.
 */
function logErrors( errors ) {
	if ( !errors.size ) {
		console.log( chalk.green.bold( '\n✨ No errors have been found.' ) );
		return;
	}

	console.log( chalk.red.bold( '\n🔥 The following errors have been found:' ) );

	for ( const [ errorType, errorCollection ] of errors ) {
		const numberOfErrors = Object.keys( errorCollection.errors ).length;
		const numberOfErrorOccurrences = errorCollection.total;
		const separator = chalk.gray( ' ➜ ' );
		const errorName = chalk.bgRed.white.bold( ` ${ errorType.description.toUpperCase() } ` );
		const errorSummary = chalk.red(
			`${ chalk.bold( numberOfErrors ) } error(s), occurred ${ chalk.bold( numberOfErrorOccurrences ) } time(s) in total`
		);

		console.group( `\n${ errorName } ${ separator } ${ errorSummary }` );

		Object.entries( errorCollection.errors ).forEach( ( [ message, error ] ) => {
			console.group( `\n❌ ${ message }` );

			console.log( chalk.red( `\n…occurred ${ chalk.bold( error.total ) } time(s) on the following page(s):` ) );

			error.pages.forEach( page => console.log( chalk.gray( `➥  ${ page }` ) ) );

			console.groupEnd();
		} );

		console.groupEnd();
	}
}

/**
 * Parses CLI arguments and prepares configuration for the crawler.
 *
 * @param {Array.<String>} args CLI arguments and options.
 * @returns {Object} options
 * @returns {String} options.url A page URL to crawl and and check its pages.
 * @returns {Array.<String>} options.selectors An array of CSS selector strings to search for links.
 */
function parseArguments( args ) {
	const config = {
		string: [
			'url',
			'containers'
		],

		alias: {
			u: 'url',
			c: 'containers'
		},

		default: {
			containers: 'body'
		}
	};

	const options = minimist( args, config );

	if ( !options.url ) {
		throw new Error( 'Missing required --url parameter.' );
	}

	return {
		url: options.url,
		// Multiple containers are supported by separating them with a comma.
		// To prepare a selector pointing to anchors inside a container, each
		// of them must end with an 'a' tag.
		selectors: options.containers
			.split( ',' )
			.map( container => `${ container } a` )
	};
}
