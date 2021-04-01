#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const puppeteer = require( 'puppeteer' );

const chalk = require( 'chalk' );

const stripAnsiEscapeCodes = require( 'strip-ansi' );

const { getBaseUrl, getFirstLineFromErrorMessage, parseArguments, toArray } = require( './utils' );

const { createSpinner, getProgressHandler } = require( './spinner' );

const {
	DEFAULT_TIMEOUT,
	DEFAULT_RESPONSIVENESS_CHECK_TIMEOUT,
	DEFAULT_REMAINING_ATTEMPTS,
	ERROR_TYPES,
	PATTERN_TYPE_TO_ERROR_TYPE_MAP,
	IGNORE_ALL_ERRORS_WILDCARD,
	META_TAG_NAME,
	DATA_ATTRIBUTE_NAME
} = require( './constants' );

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
 * @param {Array.<String>} options.exclusions An array of patterns to exclude links. Empty array by default to not exclude anything.
 * @param {Number} options.concurrency Number of concurrent pages (browser tabs) to be used during crawling. One by default.
 * @param {Boolean} options.quit Terminates the scan as soon as an error is found. False (off) by default.
 * @returns {Promise} Promise is resolved, when the crawler has finished the whole crawling procedure.
 */
async function startCrawler( { url, depth, exclusions, concurrency, quit } ) {
	console.log( chalk.bold( '\n🔎 Starting the Crawler\n' ) );

	const spinner = createSpinner();

	const errors = new Map();

	const browser = await createBrowser();

	spinner.start( 'Checking pages…' );

	let status = 'Done';

	await openLinks( browser, {
		baseUrl: getBaseUrl( url ),
		linksQueue: [ {
			url,
			parentUrl: '(none)',
			remainingNestedLevels: depth,
			remainingAttempts: DEFAULT_REMAINING_ATTEMPTS
		} ],
		foundLinks: [ url ],
		exclusions,
		concurrency,
		quit,
		onError: getErrorHandler( errors ),
		onProgress: getProgressHandler( spinner )
	} ).catch( () => {
		status = 'Terminated on first error';
	} );

	spinner.succeed( `Checking pages… ${ chalk.bold( status ) }` );

	await browser.close();

	logErrors( errors );

	if ( errors.size ) {
		process.exit( 1 );
	}
}

/**
 * Creates a new browser instance and closes the default blank page.
 *
 * @returns {Promise.<Object>} A promise, which resolves to the Puppeteer browser instance.
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
 * Returns an error handler, which is called every time new error is found.
 *
 * @param {Map.<ErrorType, ErrorCollection>} errors All errors grouped by their type.
 * @returns {Function} Error handler.
 */
function getErrorHandler( errors ) {
	return error => {
		if ( !errors.has( error.type ) ) {
			errors.set( error.type, new Map() );
		}

		const message = getFirstLineFromErrorMessage( error.message );

		const errorCollection = errors.get( error.type );

		if ( !errorCollection.has( message ) ) {
			errorCollection.set( message, {
				// Store only unique pages, because given error can occur multiple times on the same page.
				pages: new Set()
			} );
		}

		errorCollection.get( message ).pages.add( error.pageUrl );
	};
}

/**
 * Searches and opens all found links in the document body from requested URL, recursively.
 *
 * @param {Object} browser The headless browser instance from Puppeteer.
 * @param {Object} data All data needed for crawling the links.
 * @param {String} data.baseUrl The base URL from the initial page URL.
 * @param {Array.<Link>} data.linksQueue An array of link to crawl.
 * @param {Array.<String>} data.foundLinks An array of all links, which have been already discovered.
 * @param {Array.<String>} data.exclusions An array of patterns to exclude links. Empty array by default to not exclude anything.
 * @param {Number} data.concurrency Number of concurrent pages (browser tabs) to be used during crawling.
 * @param {Boolean} data.quit Terminates the scan as soon as an error is found.
 * @param {Function} data.onError Callback called ever time an error has been found.
 * @param {Function} data.onProgress Callback called every time just before opening a new link.
 * @returns {Promise} Promise is resolved, when all links have been visited.
 */
async function openLinks( browser, { baseUrl, linksQueue, foundLinks, exclusions, concurrency, quit, onError, onProgress } ) {
	const numberOfOpenPages = ( await browser.pages() ).length;

	// Check if the limit of simultaneously opened pages in the browser has been reached.
	if ( numberOfOpenPages >= concurrency ) {
		return;
	}

	return Promise.all(
		linksQueue
			// Get links from the queue, up to the concurrency limit...
			.splice( 0, concurrency - numberOfOpenPages )
			// ...and open each of them in a dedicated page to collect nested links and errors (if any) they contain.
			.map( async link => {
				let newErrors = [];
				let newLinks = [];

				onProgress( {
					total: foundLinks.length
				} );

				// If opening a given link causes an error, try opening it again until the limit of remaining attempts is reached.
				do {
					const { errors, links } = await openLink( browser, { baseUrl, link, foundLinks, exclusions } );

					link.remainingAttempts--;

					newErrors = [ ...errors ];
					newLinks = [ ...links ];
				} while ( newErrors.length && link.remainingAttempts );

				newErrors.forEach( newError => onError( newError ) );

				newLinks.forEach( newLink => {
					foundLinks.push( newLink );

					linksQueue.push( {
						url: newLink,
						parentUrl: link.url,
						remainingNestedLevels: link.remainingNestedLevels - 1,
						remainingAttempts: DEFAULT_REMAINING_ATTEMPTS
					} );
				} );

				// Terminate the scan as soon as an error is found, if `--quit` or `-q` CLI argument has been set.
				if ( newErrors.length > 0 && quit ) {
					return Promise.reject();
				}

				// When currently examined link has been checked, try to open new links up to the concurrency limit.
				return openLinks( browser, { baseUrl, linksQueue, foundLinks, exclusions, concurrency, quit, onError, onProgress } );
			} )
	);
}

/**
 * Creates a dedicated Puppeteer's page for URL to be tested and collects all links from it. Only links from the same base URL
 * as the tested URL are collected. Only the base URL part consisting of a protocol, a host, a port, and a path is stored, without
 * a hash and search parts. Duplicated links, which were already found and enqueued, are skipped to avoid loops. Explicitly
 * excluded links are also skipped. If the requested traversing depth has been reached, nested links from this URL are not collected
 * anymore.
 *
 * @param {Object} browser The headless browser instance from Puppeteer.
 * @param {Object} data All data needed for crawling the link.
 * @param {String} data.baseUrl The base URL from the initial page URL.
 * @param {Link} data.link A link to crawl.
 * @param {Array.<String>} data.foundLinks An array of all links, which have been already discovered.
 * @param {Array.<String>} data.exclusions An array of patterns to exclude links. Empty array by default to not exclude anything.
 * @returns {Promise.<ErrorsAndLinks>} A promise, which resolves to a collection of unique errors and links.
 */
async function openLink( browser, { baseUrl, link, foundLinks, exclusions } ) {
	const errors = [];

	const onError = error => errors.push( error );

	// Create dedicated page for current link.
	const page = await createPage( browser, { link, onError } );

	try {
		// Consider navigation to be finished when the `load` event is fired and there are no network connections for at least 500 ms.
		await page.goto( link.url, { waitUntil: [ 'load', 'networkidle0' ] } );
	} catch ( error ) {
		const errorMessage = error.message || 'Unknown navigation error';

		// All navigation errors starting with the `net::` prefix are already covered by the "request" error handler, so it should
		// not be also reported as the "navigation error".
		const ignoredMessage = 'net::';

		if ( !errorMessage.startsWith( ignoredMessage ) ) {
			onError( {
				pageUrl: link.url,
				type: ERROR_TYPES.NAVIGATION_ERROR,
				message: errorMessage
			} );
		}

		const isResponding = await isPageResponding( page );

		// Exit immediately and do not try to call any function in the context of the page, that is not responding or if it has not been
		// opened. However, once the page has been opened (its URL is the same as the one requested), continue as usual and do not close
		// the page yet, because the page may contain error exclusions, that should be taken into account. Such a case can happen when,
		// for example, the `load` event was not fired because the external resource was not loaded yet.
		if ( !isResponding || page.url() !== link.url ) {
			await page.close();

			return {
				errors,
				links: []
			};
		}
	}

	// Create patterns from meta tags to ignore errors.
	const errorIgnorePatterns = await getErrorIgnorePatternsFromPage( page );

	// Iterates over recently found errors to mark them as ignored ones, if they match the patterns.
	markErrorsAsIgnored( errors, errorIgnorePatterns );

	// Skip crawling deeper, if the bottom has been reached, or get all unique links from the page body otherwise.
	const links = link.remainingNestedLevels === 0 ?
		[] :
		await getLinksFromPage( page, { baseUrl, foundLinks, exclusions } );

	await page.close();

	return {
		errors: errors.filter( error => !error.ignored ),
		links
	};
}

/**
 * Finds all links in opened page and filters out external, already discovered and exlicitly excluded ones.
 *
 * @param {Object} page The page instance from Puppeteer.
 * @param {Object} data All data needed for crawling the link.
 * @param {String} data.baseUrl The base URL from the initial page URL.
 * @param {Array.<String>} data.foundLinks An array of all links, which have been already discovered.
 * @param {Array.<String>} data.exclusions An array patterns to exclude links. Empty array by default to not exclude anything.
 * @returns {Promise.<Array.<String>>} A promise, which resolves to an array of unique links.
 */
async function getLinksFromPage( page, { baseUrl, foundLinks, exclusions } ) {
	const evaluatePage = anchors => [ ...new Set( anchors
		.filter( anchor => /http(s)?:/.test( anchor.protocol ) )
		.map( anchor => `${ anchor.origin }${ anchor.pathname }` ) )
	];

	return ( await page.$$eval( `body a[href]:not([${ DATA_ATTRIBUTE_NAME }])`, evaluatePage ) )
		.filter( link => {
			// Skip external link.
			if ( !link.startsWith( baseUrl ) ) {
				return false;
			}

			// Skip already discovered link.
			if ( foundLinks.includes( link ) ) {
				return false;
			}

			// Skip explicitly excluded link.
			if ( exclusions.some( exclusion => link.includes( exclusion ) ) ) {
				return false;
			}

			return true;
		} );
}

/**
 * Finds all meta tags, that contain a pattern to ignore errors, and then returns a map between error type and these patterns.
 *
 * @param {Object} page The page instance from Puppeteer.
 * @returns {Promise.<Map.<ErrorType, Set.<String>>>} A promise, which resolves to a map between an error type and a set of patterns.
 */
async function getErrorIgnorePatternsFromPage( page ) {
	const metaTag = await page.$( `head > meta[name=${ META_TAG_NAME }]` );

	const patterns = new Map();

	// If meta tag is not defined, return an empty map.
	if ( !metaTag ) {
		return patterns;
	}

	const contentString = await metaTag.evaluate( metaTag => metaTag.getAttribute( 'content' ) );

	let content;

	try {
		// Try to parse value from meta tag...
		content = JSON.parse( contentString );
	} catch ( error ) {
		// ...but if it is not a valid JSON, return an empty map.
		return patterns;
	}

	Object.entries( content ).forEach( ( [ type, pattern ] ) => {
		const patternCollection = new Set( toArray( pattern )
			// Only string patterns are supported, as the error message produced by the crawler is always a string.
			.filter( pattern => typeof pattern === 'string' )
			// Only non-empty patterns are supported, because an empty pattern would cause all errors in a given type to be ignored.
			.filter( pattern => pattern.length > 0 )
		);

		if ( !patternCollection.size ) {
			return;
		}

		const errorType = PATTERN_TYPE_TO_ERROR_TYPE_MAP[ type ];

		patterns.set( errorType, patternCollection );
	} );

	return patterns;
}

/**
 * Iterates over all found errors from given link and marks errors as ingored, if their message match the ignore pattern.
 *
 * @param {Array.<Error>} errors An array of errors to check.
 * @param {Map.<ErrorType, Set.<String>>} errorIgnorePatterns A map between an error type and a set of patterns.
 */
function markErrorsAsIgnored( errors, errorIgnorePatterns ) {
	errors.forEach( error => {
		// Skip, if there is no pattern defined for currently examined error type.
		if ( !errorIgnorePatterns.has( error.type ) ) {
			return;
		}

		const patterns = [ ...errorIgnorePatterns.get( error.type ) ];

		const isPatternMatched = pattern => {
			if ( pattern === IGNORE_ALL_ERRORS_WILDCARD ) {
				return true;
			}

			if ( stripAnsiEscapeCodes( error.message ).includes( pattern ) ) {
				return true;
			}

			if ( error.failedResourceUrl && error.failedResourceUrl.includes( pattern ) ) {
				return true;
			}

			return false;
		};

		// If at least one pattern matches the error message, mark currently examined error as ignored.
		if ( patterns.some( isPatternMatched ) ) {
			error.ignored = true;
		}
	} );
}

/**
 * Creates a new page in Puppeteer's browser instance.
 *
 * @param {Object} browser The headless browser instance from Puppeteer.
 * @param {Object} data All data needed for creating a new page.
 * @param {Link} data.link A link to crawl.
 * @param {Function} data.onError Callback called every time just before opening a new link.
 * @returns {Promise.<Object>} A promise, which resolves to the page instance from Puppeteer.
 */
async function createPage( browser, { link, onError } ) {
	const page = await browser.newPage();

	page.setDefaultTimeout( DEFAULT_TIMEOUT );

	page.setCacheEnabled( false );

	dismissDialogs( page );

	registerErrorHandlers( page, { link, onError } );

	await registerRequestInterception( page );

	return page;
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
 * Registers all error handlers on given page instance.
 *
 * @param {Object} page The page instance from Puppeteer.
 * @param {Object} data All data needed for registering error handlers.
 * @param {Link} data.link A link to crawl associated with Puppeteer's page.
 * @param {Function} data.onError Called each time an error has been found.
 */
function registerErrorHandlers( page, { link, onError } ) {
	page.on( ERROR_TYPES.PAGE_CRASH.event, error => onError( {
		pageUrl: page.url(),
		type: ERROR_TYPES.PAGE_CRASH,
		message: error.message
	} ) );

	page.on( ERROR_TYPES.UNCAUGHT_EXCEPTION.event, error => onError( {
		pageUrl: page.url(),
		type: ERROR_TYPES.UNCAUGHT_EXCEPTION,
		message: error.message
	} ) );

	page.on( ERROR_TYPES.REQUEST_FAILURE.event, request => {
		const errorText = request.failure().errorText;

		// Do not log errors explicitly aborted by the crawler.
		if ( errorText !== 'net::ERR_BLOCKED_BY_CLIENT.Inspector' ) {
			const url = request.url();
			const host = new URL( url ).host;
			const isNavigation = isNavigationRequest( request );
			const message = isNavigation ?
				`Failed to open link ${ chalk.bold( url ) }` :
				`Failed to load resource from ${ chalk.bold( host ) }`;

			onError( {
				pageUrl: isNavigation ? link.parentUrl : page.url(),
				type: ERROR_TYPES.REQUEST_FAILURE,
				message: `${ message } (failure message: ${ chalk.bold( errorText ) })`,
				failedResourceUrl: url
			} );
		}
	} );

	page.on( ERROR_TYPES.RESPONSE_FAILURE.event, response => {
		const responseStatus = response.status();

		if ( responseStatus > 399 ) {
			const url = response.url();
			const host = new URL( url ).host;
			const isNavigation = isNavigationRequest( response.request() );
			const message = isNavigation ?
				`Failed to open link ${ chalk.bold( url ) }` :
				`Failed to load resource from ${ chalk.bold( host ) }`;

			onError( {
				pageUrl: isNavigation ? link.parentUrl : page.url(),
				type: ERROR_TYPES.RESPONSE_FAILURE,
				message: `${ message } (HTTP response status code: ${ chalk.bold( responseStatus ) })`,
				failedResourceUrl: url
			} );
		}
	} );

	page.on( ERROR_TYPES.CONSOLE_ERROR.event, async message => {
		// The resource loading failure is already covered by the "request" or "response" error handlers, so it should
		// not be also reported as the "console error".
		const ignoredMessage = 'Failed to load resource:';

		if ( message.text().startsWith( ignoredMessage ) ) {
			return;
		}

		if ( message.type() !== 'error' ) {
			return;
		}

		const serializeArgumentInPageContext = argument => {
			// Since errors are not serializable, return message from this error as the output text.
			if ( argument instanceof Error ) {
				return argument.message;
			}

			// Return argument right away. Since we use `executionContext().evaluate()`, it'll return JSON value of the
			// argument if possible, or `undefined` if it fails to stringify it.
			return argument;
		};

		const serializeArguments = argument => argument
			.executionContext()
			.evaluate( serializeArgumentInPageContext, argument );

		const serializedArguments = await Promise.all( message.args().map( serializeArguments ) );

		onError( {
			pageUrl: page.url(),
			type: ERROR_TYPES.CONSOLE_ERROR,
			message: serializedArguments.length ? serializedArguments.join( '. ' ) : message.text()
		} );
	} );
}

/**
 * Checks, if HTTP request was a navigation one, i.e. request that is driving frame's navigation. Requests sent from child frames
 * (i.e. from <iframe>) are not treated as a navigation. Only a request from a top-level frame is navigation.
 *
 * @param {Object} request The Puppeteer's HTTP request instance.
 * @returns {Boolean}
 */
function isNavigationRequest( request ) {
	return request.isNavigationRequest() && request.frame().parentFrame() === null;
}

/**
 * Checks, if the page is not hung by trying to evaluate a function within the page context in defined time.
 *
 * @param {Object} page The page instance from Puppeteer.
 * @returns {Promise.<Boolean>}
 */
async function isPageResponding( page ) {
	return Promise.race( [
		page.title(),
		new Promise( ( resolve, reject ) => setTimeout( () => reject(), DEFAULT_RESPONSIVENESS_CHECK_TIMEOUT ) )
	] ).then( () => true ).catch( () => false );
}

/**
 * Registers a request interception procedure to explicitly block all 'media' requests (resources loaded by a <video> or <audio> elements).
 *
 * @param {Object} page The page instance from Puppeteer.
 * @returns {Promise} Promise is resolved, when the request interception procedure is registered.
 */
async function registerRequestInterception( page ) {
	await page.setRequestInterception( true );

	page.on( 'request', request => {
		const resourceType = request.resourceType();

		// Block all 'media' requests, as they are likely to fail anyway due to limitations in Puppeteer.
		if ( resourceType === 'media' ) {
			request.abort( 'blockedbyclient' );
		} else {
			request.continue();
		}
	} );
}

/**
 * Analyzes collected errors and logs them in the console.
 *
 * @param {Map.<ErrorType, ErrorCollection>} errors All found errors grouped by their type.
 */
function logErrors( errors ) {
	if ( !errors.size ) {
		console.log( chalk.green.bold( '\n✨ No errors have been found.\n' ) );
		return;
	}

	console.log( chalk.red.bold( '\n🔥 The following errors have been found:' ) );

	errors.forEach( ( errorCollection, errorType ) => {
		const numberOfErrors = errorCollection.size;
		const separator = chalk.gray( ' ➜ ' );
		const errorName = chalk.bgRed.white.bold( ` ${ errorType.description.toUpperCase() } ` );
		const errorSummary = chalk.red( `${ chalk.bold( numberOfErrors ) } ${ numberOfErrors > 1 ? 'errors' : 'error' }` );

		console.group( `\n${ errorName } ${ separator } ${ errorSummary }` );

		errorCollection.forEach( ( error, message ) => {
			console.group( `\n❌ ${ message }` );

			console.log( chalk.red( `\n…found on the following ${ error.pages.size > 1 ? 'pages' : 'page' }:` ) );

			error.pages.forEach( pageUrl => console.log( chalk.gray( `➥  ${ pageUrl }` ) ) );

			console.groupEnd();
		} );

		console.groupEnd();
	} );

	// Blank message only to separate the errors output log.
	console.log();
}

/**
 * @typedef {Object.<String, String|Number>} Link
 * @property {String} url The URL associated with the link.
 * @property {String} parentUrl The page on which the link was found.
 * @property {Number} remainingNestedLevels The remaining number of nested levels to be checked. If this value is 0, the
 * requested traversing depth has been reached and nested links from the URL associated with this link are not collected anymore.
 * @property {Number} remainingAttempts The total number of reopenings allowed for the given link.
 */

/**
 * @typedef {Object.<String, String>} ErrorType
 * @property {String} [event] The event name emitted by Puppeteer.
 * @property {String} description Human-readable description of the error.
 */

/**
 * @typedef {Object.<String, String|Boolean|ErrorType>} Error
 * @property {String} pageUrl The URL, where error has occurred.
 * @property {ErrorType} type Error type.
 * @property {String} message Error message.
 * @property {String} [failedResourceUrl] Full resource URL, that has failed. Necessary for matching against exclusion patterns.
 * @property {Boolean} [ignored] Indicates that error should be ignored, because its message matches the exclusion pattern.
 */

/**
 * @typedef {Object.<String, Set.<String>>} ErrorOccurrence
 * @property {Set.<String>} pages A set of unique pages, where error has been found.
 */

/**
 * @typedef {Map.<String, ErrorOccurrence>} ErrorCollection
 * @property {ErrorOccurrence} [*] Error message.
 */

/**
 * @typedef {Object.<String, Array.<String>>} ErrorsAndLinks Collection of unique errors and links.
 * @property {Array.<String>} errors An array of errors.
 * @property {Array.<String>} links An array of links.
 */
