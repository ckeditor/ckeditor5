/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import minimist from 'minimist';
import { cpus, freemem } from 'node:os';
import replaceKebabCaseWithCamelCase from '../../utils/replacekebabcasewithcamelcase.mjs';

/**
 * @param {Array.<String>} cliArguments
 * @returns {ReleaseOptions} options
 */
export default function parseArguments( cliArguments ) {
	const config = {
		boolean: [
			'internal',
			'nightly',
			'nightly-alpha',
			'nightly-next',
			'verbose',
			'compile-only',
			'ci',
			'external',
			'dry-run'
		],

		number: [
			'concurrency'
		],

		string: [
			'branch',
			'date',
			'npm-tag',
			'packages',
			'release-state'
		],

		default: {
			internal: false,
			nightly: false,
			'nightly-alpha': false,
			'nightly-next': false,
			// Set concurrency to guarantee at least 1 CPU core and 1 GB of free RAM per task.
			// No less than 1, no more than 8.
			concurrency: Math.max(
				1,
				Math.min(
					cpus().length,
					Math.floor( freemem() / ( 1024 ** 3 ) ),
					8
				)
			),
			'compile-only': false,
			packages: null,
			'release-state': null,
			branch: 'release',
			// A stable release uses `staging-v<version>`. The version is known only when publishing (see `publishpackages.mjs`).
			'npm-tag': null,
			verbose: false,
			ci: false,
			external: true,
			'dry-run': false
		}
	};

	const options = minimist( cliArguments, config );

	if ( typeof options.packages === 'string' ) {
		options.packages = options.packages.split( ',' );
	}

	replaceKebabCaseWithCamelCase( options, [
		'npm-tag',
		'release-state',
		'compile-only',
		'nightly-alpha',
		'nightly-next',
		'dry-run'
	] );

	if ( options.nightly ) {
		options.npmTag = 'nightly';
	}

	if ( options.nightlyAlpha ) {
		options.branch = 'release';
		options.npmTag = 'alpha';
	}

	if ( options.internal ) {
		options.npmTag = 'internal';
	}

	if ( process.env.CI ) {
		options.ci = true;
	}

	return options;
}

/**
 * @typedef {Object} ReleaseOptions
 *
 * @property {Boolean} internal
 *
 * @property {Boolean} nightly
 *
 * @property {Boolean} nightlyAlpha
 *
 * @property {Boolean} nightlyNext
 *
 * @property {Boolean} external
 *
 * @property {Boolean} dryRun=false
 *
 * @property {Boolean} compileOnly=false
 *
 * @property {Number} concurrency
 *
 * @property {String} branch='release'
 *
 * @property {String|null} npmTag=null|'nightly'|'alpha'|'internal' `null` means a stable release.
 *
 * @property {Array.<String>|null} packages=null
 *
 * @property {String|null} releaseState=null A path to a JSON file whose `packages` array lists the names of the published
 * packages. When it is set, the npm tag scripts handle these packages instead of the packages found in the working tree.
 *
 * @property {Boolean} verbose=false
 *
 * @property {Boolean} ci=false
 *
 * @property {String} [date]
 */
