/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { parseArgs, styleText } from 'node:util';
import replaceKebabCaseWithCamelCase from '../utils/replacekebabcasewithcamelcase.mjs';
import { IS_ISOLATED_REPOSITORY } from '../constants.mjs';

const OPTION_GROUPS = [
	{
		// name: 'Options',
		options: {
			help: {
				type: 'boolean',
				short: 'h',
				default: false,
				description: 'Print this help page.'
			}
		}
	},
	{
		name: 'Build configuration',
		options: {
			dev: {
				type: 'boolean',
				default: false,
				description: 'Build on the dev environment. Skips code optimizations and obfuscation. Mutually exclusive with --production.'
			},
			production: {
				type: 'boolean',
				default: false,
				description: 'Minify the assets and perform other production-only optimizations. Mutually exclusive with --dev.'
			},
			watch: {
				type: 'boolean',
				default: false,
				description: 'Run the documentation generator in watch mode. Covers guides but not API docs.'
			},
			strict: {
				type: 'boolean',
				default: false,
				description: 'Treat warnings as errors during API docs build.'
			},
			verbose: {
				type: 'boolean',
				default: false,
				description: 'Print additional logs.'
			}
		}
	},
	{
		name: 'Skip steps',
		hint: 'Use these flags to skip expensive steps when a full build is not needed.',
		options: {
			'skip-api': {
				type: 'boolean',
				default: false,
				description: 'Skip building the API documentation.'
			},
			'skip-snippets': {
				type: 'boolean',
				default: false,
				description: 'Skip building live snippets.'
			},
			'skip-validation': {
				type: 'boolean',
				default: IS_ISOLATED_REPOSITORY,
				description: 'Skip the final link validation.'
			},
			'skip-guides': {
				type: 'boolean',
				default: false,
				description: [
					'Skip building all guides except the index.md files',
					'which allows navigating over the partially built documentation.'
				].join( ' ' )
			},
			'skip-ckeditor5': {
				type: 'boolean',
				default: false,
				description: 'Skip preparing CKEditor 5 assets (import map sources).'
			},
			'skip-commercial': {
				type: 'boolean',
				default: false,
				description: 'Skip preparing the CKEditor 5 commercial assets (import map sources).'
			},
			'skip-obfuscation': {
				type: 'boolean',
				default: false,
				description: 'Skip code obfuscation when building assets.'
			}
		}
	},
	{
		name: 'Filtering',
		hint: 'Use these flags to build only specific guides or snippets instead of everything.',
		options: {
			snippets: {
				type: 'string',
				default: '',
				description: 'Comma-separated list of snippet names to process (empty = all).'
			},
			guides: {
				type: 'string',
				default: '',
				description: 'Comma-separated guide names to build. Accepts glob patterns (empty = all).',
				examples: [
					'pnpm run docs --guides=image                                  # matches roughly "*image*"',
					'pnpm run docs --guides="features/*"                           # matches roughly "*features/*"',
					'pnpm run docs --guides=features/image --skip-api --skip-validation'
				]
			}
		}
	}
];

// Flat options map required by `parseArgs`.
const OPTIONS_CONFIG = Object.assign(
	{},
	...OPTION_GROUPS.map( group => group.options )
);

/**
 * @param {Array<string>} args An array containing modifiers for the executed command.
 * @return {DocumentationOptions}
 */
export default function parseArguments( args ) {
	let values;

	try {
		const parsedArgs = parseArgs( {
			args,
			strict: true,
			options: OPTIONS_CONFIG
		} );

		values = parsedArgs.values;
	} catch ( err ) {
		console.error( `${ err.message }\n` );
		console.error( 'Run "pnpm run docs --help" to see all available options.' );
		process.exit( 1 );
	}

	if ( values.help ) {
		printHelp();
		process.exit( 0 );
	}

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
		'skip-commercial',
		'skip-obfuscation'
	] );

	return values;
}

/**
 * Prints a help page describing all available options.
 */
function printHelp() {
	console.log( styleText( 'bold', '\nBuilding CKEditor 5 documentation.' ) );
	console.log( `${ styleText( 'bold', 'Usage:' ) } pnpm run docs [options]` );

	for ( const group of OPTION_GROUPS ) {
		printOptionGroup( group );
	}
}

/**
 * Prints a single group of options with a header.
 *
 * @param {Object} group
 * @param {string} group.name The group header text.
 * @param {Object} group.options The options map for this group.
 * @param {string} [group.hint] An optional hint displayed below the header.
 */
function printOptionGroup( { name, options, hint } ) {
	if ( name ) {
		console.log( styleText( 'bold', `${ name }:` ) );
	}

	if ( hint ) {
		console.log( `  ${ styleText( 'italic', hint ) }` );
	}

	console.log( '' );

	for ( const [ name, config ] of Object.entries( options ) ) {
		const shortFlag = config.short ? `-${ config.short }, ` : '    ';
		const typeHint = config.type === 'string' ? ' <value>' : '';
		const flag = `${ shortFlag }--${ name }${ typeHint }`;

		console.log( `  ${ styleText( 'cyan', flag.padEnd( 36 ) ) }${ config.description }` );

		if ( config.examples ) {
			console.log( '' );

			for ( const example of config.examples ) {
				console.log( `${ ' '.repeat( 40 ) }  ${ styleText( 'dim', '$ ' + example ) }` );
			}
		}
	}

	console.log( '' );
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
