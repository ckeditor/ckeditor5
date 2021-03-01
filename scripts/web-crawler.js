#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const puppeteer = require( 'puppeteer' );
const chalk = require( 'chalk' );
const ora = require( 'ora' );
const minimist = require( 'minimist' );

const DEFAULT_CONCURRENCY = require( 'os' ).cpus().length / 2;

const DEFAULT_TIMEOUT = 15 * 1000;

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
	},
	NAVIGATION_ERROR: {
		// Navigation error does not have the `event` property, because this error is not emitted
		// by page.on() method as event, but it is thrown as exception from page.goto() method.
		description: 'Navigation error'
	}
};

const options = parseArguments( process.argv.slice( 2 ) );

startCrawler( options );

/**
 * Main crawler function. Its purpose is to:
 * - create Puppeteer's browser instance,
 * - open simultaneously (up to concurrency limit) links from the provided URL in a dedicated Puppeteer's page for each link,
 * - show error summary after all links have been visited.
 *
 * @param {Object} options Parsed CLI arguments.
 * @param {String} options.url The URL to start crawling. This argument is required.
 * @param {Number} options.depth Defines how many nested page levels should be examined. Infinity by default.
 * @param {RegExp|null} options.exclude A regular expression pattern to exclude links. Null by default to not exclude anything.
 * @param {Number} options.concurrency Number of concurrent pages (browser tabs) to be used during crawling. One by default.
 */
async function startCrawler( { url, depth, exclude, concurrency } ) {
	console.log( chalk.bold( '\n🔎 Starting the Crawler\n' ) );

	const spinner = createSpinner();

	spinner.start( 'Checking pages…' );

	const errors = new Map();

	const browser = await createBrowser();

	await openLinks( browser, {
		host: new URL( url ).host,
		linksQueue: [ { url, depth } ],
		foundLinks: [ url ],
		exclude,
		concurrency,
		onError: getErrorHandler( errors ),
		onProgress: getProgressHandler( spinner )
	} );

	spinner.succeed( `Checking pages… ${ chalk.bold( 'Done' ) }` );

	await browser.close();

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
 * Returns an error handler, which is called every time new error is found.
 *
 * @param {Map<Object, Object>} errors All errors grouped by their type.
 * @returns {Function} Error handler.
 */
function getErrorHandler( errors ) {
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
 * @param {Function} onError Called each time an error has been found.
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
				message: `HTTP code ${ response.status() } for ${ response.url() }`
			} );
		}
	} );

	page.on( ERROR_TYPES.CONSOLE_ERROR.event, message => {
		const ignoredMessages = [
			// The resource loading failure is already covered by the `response` or `requestfailed` events
			// so it should not be also reported as the "console error".
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
 * Returns a progress handler, which is called every time just before opening a new link.
 *
 * @param {Object} spinner Spinner instance
 * @returns {Function} Progress handler.
 */
function getProgressHandler( spinner ) {
	let current = 0;

	return ( { total } ) => {
		const progress = Math.round( current / total * 100 );

		spinner.text = `Checking pages… ${ chalk.bold( `${ progress }% (${ current } of ${ total })` ) }`;

		current++;
	};
}

/**
 * Searches and opens all found links in the document body from requested URL, recursively.
 *
 * @param {Object} browser The headless browser instance from Puppeteer.
 * @param {Object} data All data needed for crawling the links.
 * @param {String} data.host The host from the initial page URL.
 * @param {Array.<Link>} data.linksQueue An array of link to crawl.
 * @param {Array.<String>} data.foundLinks An array of all links, which have been already discovered.
 * @param {RegExp|null} data.exclude A regular expression pattern to exclude links. Null by default to not exclude anything.
 * @param {Number} data.concurrency Number of concurrent pages (browser tabs) to be used during crawling.
 * @param {Function} data.onError Callback called ever time an error has been found.
 * @param {Function} data.onProgress Callback called every time just before opening a new link.
 */
async function openLinks( browser, { host, linksQueue, foundLinks, exclude, concurrency, onError, onProgress } ) {
	const numberOfOpenPages = ( await browser.pages() ).length;

	// Check if the limit of simultaneously opened pages in the browser has been reached.
	if ( numberOfOpenPages >= concurrency ) {
		return;
	}

	// Get links from the queue, up to the concurrency limit.
	const links = linksQueue.splice( 0, concurrency - numberOfOpenPages );

	return Promise.all(
		links.map( async link => {
			const newLinks = await collectLinks( browser, { host, link, foundLinks, exclude, onError, onProgress } );

			newLinks.forEach( newLink => foundLinks.push( newLink ) );

			newLinks.forEach( newLink => linksQueue.push( {
				url: newLink,
				remainingNestedLevels: link.remainingNestedLevels - 1
			} ) );

			// When currently examined link has been checked, try to open new links up to the concurrency limit.
			return await openLinks( browser, { host, linksQueue, foundLinks, exclude, concurrency, onError, onProgress } );
		} )
	);
}

/**
 * Creates a dedicated Puppeteer's page for URL to be tested and collects all links from it. Only links from the same host as the
 * tested URL are collected. Only the main URL part consisting of a protocol, a host, a port, and a path is collected, without
 * a hash and search parts. Duplicated links, which were already collected and enqueued, are skipped to avoid loops. Explicitly
 * excluded links are also skipped. If the requested traversing depth has been reached, nested links from this URL are not collected
 * anymore.
 *
 * @param {Object} browser The headless browser instance from Puppeteer.
 * @param {Object} data All data needed for crawling the link.
 * @param {String} data.host The host from the initial page URL.
 * @param {Link} data.link A link to crawl.
 * @param {Array.<String>} data.foundLinks An array of all links, which have been already discovered.
 * @param {RegExp|null} data.exclude A regular expression pattern to exclude links. Null by default to not exclude anything.
 * @param {Function} data.onError Callback called ever time an error has been found.
 * @param {Function} data.onProgress Callback called every time just before opening a new link.
 */
async function collectLinks( browser, { host, link, foundLinks, exclude, onError, onProgress } ) {
	// Inform progress handler about current number of discovered links in total.
	onProgress( {
		total: foundLinks.length
	} );

	// Create dedicated page for current link.
	const page = await createPage( browser, onError );

	try {
		// Consider navigation to be finished when the `load` event is fired and there are no network connections for at least 500 ms.
		await page.goto( link.url, { waitUntil: [ 'load', 'networkidle0' ] } );
	} catch ( error ) {
		// Get first line from the error message.
		const errorMessage = error.message.match( /^.*$/m );

		onError( {
			page: page.url(),
			type: ERROR_TYPES.NAVIGATION_ERROR,
			message: errorMessage ? errorMessage[ 0 ] : 'Unknown navigation error'
		} );

		await page.close();

		return [];
	}

	// Skip crawling deeper, if the bottom has been reached.
	if ( link.remainingNestedLevels === 0 ) {
		await page.close();

		return [];
	}

	// Callback function executed in the page context to return an unique list of links.
	const evaluatePage = anchors => [ ...new Set( anchors
		.filter( anchor => /http(s)?:/.test( anchor.protocol ) )
		.map( anchor => `${ anchor.origin }${ anchor.pathname }` ) )
	];

	// Collect unique links from the page body.
	const links = ( await page.$$eval( 'body a[href]', evaluatePage ) )
		.filter( link => {
			// Skip external link.
			if ( new URL( link ).host !== host ) {
				return false;
			}

			// Skip already discovered link.
			if ( foundLinks.includes( link ) ) {
				return false;
			}

			// Skip explicitly excluded link.
			if ( exclude && exclude.test( link ) ) {
				return false;
			}

			return true;
		} );

	await page.close();

	return links;
}

/**
 * Creates a new browser instance and closes the default blank page.
 *
 * @returns {Object} The Puppeteer browser instance.
 */
async function createBrowser() {
	const browser = await puppeteer.launch();

	const [ defaultBlankPage ] = await browser.pages();

	if ( defaultBlankPage ) {
		await defaultBlankPage.close();
	}

	return browser;
}

/**
 * Creates a new page in Puppeteer's browser instance.
 *
 * @param {Object} browser The headless browser instance from Puppeteer.
 * @param {Function} onError Callback called every time just before opening a new link.
 * @returns {Object} The page instance from Puppeteer.
 */
async function createPage( browser, onError ) {
	const page = await browser.newPage();

	page.setDefaultTimeout( DEFAULT_TIMEOUT );

	dismissDialogs( page );

	registerErrorHandlers( page, onError );

	return page;
}

/**
 * Analyzes collected errors and logs them in the console.
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
 * @returns {String} options.url The URL to start crawling.
 * @returns {Number} options.depth Defines how many nested page levels should be examined. Infinity by default.
 * @returns {RegExp|null} options.exclude A regular expression pattern to exclude links. Null by default to not exclude anything.
 * @returns {Number} options.concurrency Number of concurrent pages (browser tabs) to be used during crawling. By default all
 * links are opened one by one, sequentially (concurrency is 1).
 */
function parseArguments( args ) {
	const config = {
		string: [
			'url',
			'depth',
			'exclude',
			'concurrency'
		],

		boolean: [
			'docs',
			'manual'
		],

		alias: {
			u: 'url',
			d: 'depth',
			e: 'exclude',
			c: 'concurrency'
		}
	};

	const parsedOptions = minimist( args, config );

	if ( parsedOptions.docs && parsedOptions.manual ) {
		throw new Error( 'Mutually exclusive --docs and --manual arguments.' );
	}

	const defaultOptionsForDocs = minimist( [
		'-u', 'http://fake.ckeditor.com:8080/ckeditor5/latest/',
		'-e', '/api/,/assets/',
		'-c', DEFAULT_CONCURRENCY
	], config );

	const defaultOptionsForManual = minimist( [
		'-u', 'http://localhost:8125/',
		'-d', 1,
		'-c', DEFAULT_CONCURRENCY
	], config );

	const options = {};

	if ( parsedOptions.docs ) {
		Object.assign( options, defaultOptionsForDocs, parsedOptions );
	}

	if ( parsedOptions.manual ) {
		Object.assign( options, defaultOptionsForManual, parsedOptions );
	}

	if ( !options.url ) {
		throw new Error( 'Missing required --url argument.' );
	}

	return {
		url: options.url,
		depth: options.depth ? Number( options.depth ) : Infinity,
		exclude: options.exclude ? new RegExp( options.exclude.replace( ',', '|' ) ) : null,
		concurrency: options.concurrency ? Number( options.concurrency ) : 1
	};
}

/**
 * @typedef {Object} Link
 *
 * @property {String} url The URL associated with the link.
 *
 * @property {Number} remainingNestedLevels The remaining number of nested levels to be checked. If `remainingNestedLevels` is 0,
 * the requested traversing depth has been reached and nested links from the URL associated with this link are not collected anymore.
 */
