#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const minimist = require( 'minimist' );

const { DEFAULT_CONCURRENCY } = require( './constants' );

/**
 * Extracts base URL from the provided page URL. Base URL consists of a protocol, a host, a port, and a path.
 * A hash and search parts are omitted, because they would have navigated to the same page if they were set.
 *
 * @param {String} url Page URL.
 * @returns {String} Base URL from page URL.
 */
function getBaseUrl( url ) {
	const { origin, pathname } = new URL( url );

	return `${ origin }${ pathname }`;
}

/**
 * Parses CLI arguments and prepares configuration for the crawler.
 *
 * @param {Array.<String>} args CLI arguments and options.
 * @returns {Object} options
 * @returns {String} options.url The URL to start crawling.
 * @returns {Number} options.depth Defines how many nested page levels should be examined. Infinity by default.
 * @returns {String|Array.<String>} options.exclusions A pattern or array of patterns to exclude links. Empty array by default
 * to not exclude anything.
 * @returns {Number} options.concurrency Number of concurrent pages (browser tabs) to be used during crawling. By default all
 * links are opened one by one, sequentially (concurrency is 1).
 */
function parseArguments( args ) {
	const config = {
		string: [
			'url',
			'depth',
			'exclusions',
			'concurrency'
		],

		boolean: [
			'docs',
			'manual'
		],

		alias: {
			u: 'url',
			d: 'depth',
			e: 'exclusions',
			c: 'concurrency'
		}
	};

	const parsedOptions = minimist( args, config );

	if ( parsedOptions.docs && parsedOptions.manual ) {
		throw new Error( 'Mutually exclusive --docs and --manual arguments.' );
	}

	const defaultOptionsForDocs = minimist( [
		'-u', 'http://fake.ckeditor.com:8080/ckeditor5/latest/',
		'-e', '/api/',
		'-e', '/assets/',
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
		depth: options.depth ?
			Number( options.depth ) :
			Infinity,
		exclusions: options.exclusions ?
			toArray( options.exclusions ).filter( exclusion => exclusion.length > 0 ) :
			[],
		concurrency: options.concurrency ?
			Number( options.concurrency ) :
			1
	};
}

/**
 * Transforms any value to an array. If the provided value is already an array, it is returned unchanged.
 *
 * @param {*} data The value to transform to an array.
 * @returns {Array.<*>} An array created from data.
 */
function toArray( data ) {
	return Array.isArray( data ) ? data : [ data ];
}

module.exports = {
	getBaseUrl,
	parseArguments,
	toArray
};
