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
 * - create Puppeteer's browser,
 * - create Puppeteer's page instance from browser instance,
 * - register error handlers,
 * - open sequentially all links from the provided URL,
 * - show error summary after all links have been visited.
 *
 * @param {Object} options Parsed CLI arguments.
 * @param {String} options.url The URL to start crawling.
 * @param {Number} options.depth Defines how many nested page levels should be examined. Infinity by default.
 * @param {RegExp|null} options.exclude A regular expression pattern to exclude links. Null by default to not exclude anything.
 */
async function startCrawler( { url, depth, exclude } ) {
	console.log( chalk.bold( '\n🔎 Starting the Crawler\n' ) );

	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	dismissDialogs( page );

	const spinner = createSpinner();

	spinner.start( 'Registering error handlers…' );

	const errors = new Map();

	registerErrorHandlers( page, getErrorHandler( errors ) );

	spinner.succeed( `Registering error handlers… ${ chalk.bold( 'Done' ) }` );

	spinner.start( 'Checking pages…' );

	await openLink( page, {
		host: new URL( url ).host,
		link: url,
		foundLinks: [ url ],
		exclude,
		depth,
		onProgress: getProgressHandler( spinner )
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
				message: `HTTP code ${ response.status() } (${ response.statusText() }) for ${ response.url() }`
			} );
		}
	} );

	page.on( ERROR_TYPES.CONSOLE_ERROR.event, message => {
		const ignoredMessages = [
			// The resource loading failure is already covered by the `response` or `requestfailed` events.
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
 * Searches and opens all found links in the document body from requested URL, recursively. Only links from the same
 * host are collected and opened sequentially. Only the main URL part consisting of a protocol, a host, a port and
 * a path is collected, without a hash and search parts. Duplicated links, which were already collected and enqueued,
 * are skipped to avoid loops. Explicitly excluded links are also skipped.
 *
 * @param {Object} page The page instance from Puppeteer.
 * @param {Object} data All data needed for crawling the links.
 * @param {String} data.host The host from the initial page URL.
 * @param {String} data.link The link to crawl.
 * @param {Array.<String>} data.foundLinks An array of links, which have been already discovered.
 * @param {RegExp|null} data.exclude A regular expression pattern to exclude links. Null by default to not exclude anything.
 * @param {Number} data.depth Defines how many nested page levels should be examined. Infinity by default.
 * @param {Function} data.onProgress Callback called every time just before opening a new link.
 */
async function openLink( page, { host, link, foundLinks, exclude, depth, onProgress } ) {
	// Inform progress handler about current number of total discovered links.
	onProgress( {
		total: foundLinks.length
	} );

	try {
		// Consider navigation to be finished when there are no network connections for at least 500 ms.
		await page.goto( link, { waitUntil: 'networkidle0' } );
	} catch ( err ) {
		// Page opening failure is already covered by the `requestfailed` event.
		return;
	}

	// Skip crawling deeper, if the bottom has been reached.
	if ( depth === 0 ) {
		return;
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

	// Remember new links to avoid loops in subsequent pages.
	links.forEach( link => foundLinks.push( link ) );

	// Visit all new links sequentially.
	for ( const link of links ) {
		await openLink( page, {
			host,
			link,
			foundLinks,
			exclude,
			depth: depth - 1,
			onProgress
		} );
	}
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
 */
function parseArguments( args ) {
	const config = {
		string: [
			'url',
			'depth',
			'exclude'
		],

		boolean: [
			'docs',
			'manual'
		],

		alias: {
			u: 'url',
			d: 'depth',
			e: 'exclude'
		}
	};

	const parsedOptions = minimist( args, config );

	if ( parsedOptions.docs && parsedOptions.manual ) {
		throw new Error( 'Mutually exclusive --docs and --manual arguments.' );
	}

	const defaultOptionsForDocs = minimist( '-u http://fake.ckeditor.com:8080/ckeditor5/ -e /api/,/assets/'.split( ' ' ), config );
	const defaultOptionsForManual = minimist( '-u http://localhost:8125/ -d 1'.split( ' ' ), config );
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
		exclude: options.exclude ? new RegExp( options.exclude.replace( ',', '|' ) ) : null
	};
}
