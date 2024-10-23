/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

import minimist from 'minimist';
import replaceKebabCaseWithCamelCase from '../utils/replacekebabcasewithcamelcase.mjs';

/**
 * @param {Array.<String>} args An array containing modifiers for the executed command.
 * @return {DocumentationOptions}
 */
export default function parseArguments( args ) {
	const options = minimist( args, {
		boolean: [
			'skip-api',
			'skip-snippets',
			'skip-validation',
			'skip-guides',
			'production',
			'watch',
			'verbose',
			'ts'
		],
		string: [
			'snippets',
			'guides'
		],
		default: {
			'skip-api': false,
			'skip-snippets': false,
			'skip-validation': false,
			'skip-guides': false,
			production: false,
			watch: false,
			verbose: false,
			snippets: [],
			guides: [],
			ts: false
		}
	} );

	splitOptionsToArray( options, [
		'snippets',
		'guides'
	] );

	replaceKebabCaseWithCamelCase( options, [
		'skip-api',
		'skip-snippets',
		'skip-validation',
		'skip-guides'
	] );

	return options;
}

/**
 * Splits by a comma (`,`) all values specified under keys to array.
 *
 * @param {Object} options
 * @param {Array.<String>} keys Kebab-case keys in `options` object.
 */
function splitOptionsToArray( options, keys ) {
	for ( const key of keys ) {
		if ( typeof options[ key ] === 'string' ) {
			options[ key ] = options[ key ].split( ',' ).filter( item => item.length );
		}
	}
}

/**
 * @typedef {Object} DocumentationOptions
 *
 * @param {Boolean} [skipApi=false] Whether to skip building API docs.
 *
 * @param {Boolean} [skipSnippets=false] Whether to skip building live snippets.
 *
 * @param {Boolean} [skipValidation=false] Whether to skip validating URLs in the generated documentation.
 *
 * @param {Boolean} [skipGuides=false] Whether to skip processing guides.
 *
 * @param {Boolean} [production=false] Whether the documentation is being built on the production environment. It means that all files
 * will be minified. Increases the time needed for processing all files.
 *
 * @param {Boolean} [watch=false] Whether to watch source files.
 *
 * @param {Boolean} [verbose=false] Whether to print additional logs.
 *
 * @param {Boolean} [ts=false] Whether to build API docs for TypeScript source code.
 *
 * @param {Array.<String>} [snippets=[]] An array containing the names of snippets that the snippet adapter should process.
 * An empty array means that the filtering mechanism is disabled.
 *
 * @param {Array.<String>} [guides=[]] An array containing the names of guides that should be processed by Umberto.
 * An empty array means that the filtering mechanism is disabled.
 */
