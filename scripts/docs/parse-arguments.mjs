/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { parseArgs, styleText } from 'util';
import replaceKebabCaseWithCamelCase from '../utils/replacekebabcasewithcamelcase.mjs';

/**
 * @param {Array<string>} args An array containing modifiers for the executed command.
 * @return {DocumentationOptions}
 */
export default function parseArguments( args ) {
	const { values } = parseArgs( {
		args,
		strict: true,
		options: {
			'skip-api': {
				type: 'boolean',
				default: false
			},
			'skip-snippets': {
				type: 'boolean',
				default: false
			},
			'skip-validation': {
				type: 'boolean',
				default: false
			},
			'skip-guides': {
				type: 'boolean',
				default: false
			},
			'skip-ckeditor5': {
				type: 'boolean',
				default: false
			},
			'skip-commercial': {
				type: 'boolean',
				default: false
			},
			dev: {
				type: 'boolean',
				default: false
			},
			production: {
				type: 'boolean',
				default: false
			},
			strict: {
				type: 'boolean',
				default: false
			},
			watch: {
				type: 'boolean',
				default: false
			},
			verbose: {
				type: 'boolean',
				default: false
			},
			snippets: {
				type: 'string',
				default: ''
			},
			guides: {
				type: 'string',
				default: ''
			}
		}
	} );

	if ( values.dev && values.production ) {
		throw new Error( 'The --dev and --production flags are mutually exclusive.' );
	} else {
		// Ensure that both `dev` and `production` options are set, even if only one is passed.
		values.production ||= !values.dev;
		values.dev ||= !values.production;
	}

	if ( values.dev ) {
		warnAboutUsingDevEnvironment();
	}

	splitOptionsToArray( values, [
		'snippets',
		'guides'
	] );

	replaceKebabCaseWithCamelCase( values, [
		'skip-api',
		'skip-snippets',
		'skip-validation',
		'skip-guides',
		'skip-ckeditor5',
		'skip-commercial'
	] );

	return values;
}

/**
 * Splits by a comma (`,`) all values specified under keys to array.
 *
 * @param {Object} options
 * @param {Array<string>} keys Kebab-case keys in `options` object.
 * @returns {void}
 */
function splitOptionsToArray( options, keys ) {
	for ( const key of keys ) {
		if ( typeof options[ key ] === 'string' ) {
			options[ key ] = options[ key ].split( ',' ).filter( item => item.length );
		}
	}
}

/**
 * Logs a warning about not sharing the documentation built with the `--dev` flag.
 */
function warnAboutUsingDevEnvironment() {
	const warning = styleText(
		'bgRed',
		'The "--dev" flag prevents the code from being optimized or obfuscated. Please do not share it with anyone!'
	);

	console.log( `\n${ warning }\n` );
}

/**
 * @typedef {Object} DocumentationOptions
 * @param {boolean} [skipApi=false] Whether to skip preparing API pages.
 * @param {boolean} [skipSnippets=false] Whether to skip generating snippets.
 * @param {boolean} [skipValidation=false] Whether to skip validating URLs in the generated documentation.
 * @param {boolean} [skipGuides=false] Whether to skip processing guides.
 * @param {boolean} [skipCkeditor5=false] Whether to skip preparing CKEditor 5 assets (import map sources).
 * @param {boolean} [skipCommercial=false] Whether to skip preparing the CKEditor 5 commercial assets (import map sources).
 * @param {boolean} [dev=false] Whether the documentation is being built on the dev environment. This will skip some time consuming
 * code optimizations and obfuscation.
 * @param {boolean} [production=false] Whether the documentation is being built on the production environment. It means that all files
 * will be minified. Increases the time needed for processing all files.
 * @param {boolean} [watch=false] Whether to watch source files.
 * @param {boolean} [verbose=false] Whether to print additional logs.
 * @param {boolean} [ts=false] Whether to build API docs for TypeScript source code.
 * @param {Array<string>} [snippets=[]] An array containing the names of snippets that the snippet adapter should process.
 * An empty array means that the filtering mechanism is disabled.
 * @param {Array<string>} [guides=[]] An array containing the names of guides that should be processed by Umberto.
 * An empty array means that the filtering mechanism is disabled.
 */
