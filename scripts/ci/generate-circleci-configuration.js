#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

// The script assumes that it is executed from the CKEditor 5 Commercial directory and aims to load
// the template file (`.circleci/template.yml`) and store it under the `.circleci/config-tests.yml` path,
// a source for a new workflow triggered from the main thread when a new build starts.
//
// See: https://circleci.com/docs/using-dynamic-configuration/.

'use strict';

const upath = require( 'upath' );
const fs = require( 'fs/promises' );
const { glob } = require( 'glob' );
const yaml = require( 'js-yaml' );
const IS_COMMUNITY_PR = require( './is-community-pr' );

const CKEDITOR5_ROOT_DIRECTORY = upath.join( __dirname, '..', '..' );
const CIRCLECI_CONFIGURATION_DIRECTORY = upath.join( CKEDITOR5_ROOT_DIRECTORY, '.circleci' );

const NON_FULL_COVERAGE_PACKAGES = [
	'ckeditor5-minimap'
];

const bootstrapCommands = () => ( [
	'checkout_command',
	'halt_if_short_flow',
	'bootstrap_repository_command',
	'prepare_environment_command'
] );

const prepareCodeCoverageDirectories = () => ( {
	run: {
		when: 'always',
		name: 'Prepare the code coverage directory',
		command: 'mkdir .nyc_output .out'
	}
} );

const persistToWorkspace = fileName => ( {
	persist_to_workspace: {
		root: '.out',
		paths: [ fileName ]
	}
} );

( async () => {
	const frameworkPackages = ( await fs.readdir( upath.join( CKEDITOR5_ROOT_DIRECTORY, 'src' ) ) )
		.filter( filename => !filename.startsWith( 'index' ) )
		.map( filename => 'ckeditor5-' + filename.replace( /\.(js|ts)$/, '' ) );

	const featurePackages = ( await glob( '*/', { cwd: upath.join( CKEDITOR5_ROOT_DIRECTORY, 'packages' ) } ) )
		.filter( packageName => !frameworkPackages.includes( packageName ) );

	featurePackages.sort();

	/**
	 * @type CircleCIConfiguration
	 */
	const config = yaml.load(
		await fs.readFile( upath.join( CIRCLECI_CONFIGURATION_DIRECTORY, 'template.yml' ) )
	);

	config.jobs.cke5_tests_framework = {
		machine: true,
		steps: [
			...bootstrapCommands(),
			prepareCodeCoverageDirectories(),
			...generateTestSteps( frameworkPackages, {
				checkCoverage: true,
				coverageFile: '.out/combined_framework.info'
			} ),
			'community_verification_command',
			persistToWorkspace( 'combined_framework.info' )
		]
	};

	config.jobs.cke5_tests_features = {
		machine: true,
		steps: [
			...bootstrapCommands(),
			prepareCodeCoverageDirectories(),
			...generateTestSteps( featurePackages, {
				checkCoverage: true,
				coverageFile: '.out/combined_features.info'
			} ),
			'community_verification_command',
			persistToWorkspace( 'combined_features.info' )
		]
	};

	if ( IS_COMMUNITY_PR ) {
		// CircleCI does not understand custom cloning when a PR comes from the community.
		// In such a case, the goal to use the built-in command.
		Object.keys( config.jobs )
			.forEach( jobName => {
				replaceShortCheckout( config, jobName );
			} );
	}

	await fs.writeFile(
		upath.join( CIRCLECI_CONFIGURATION_DIRECTORY, 'config-tests.yml' ),
		yaml.dump( config, { lineWidth: -1 } )
	);
} )();

/**
 * @param {Array.<String>}packages
 * @param {Object} options
 * @param {Boolean} options.checkCoverage
 * @param {String|null} [options.coverageFile=null]
 * @returns {Array.<CircleCITask>}
 */
function generateTestSteps( packages, { checkCoverage, coverageFile = null } ) {
	return packages.map( packageName => {
		const allowNonFullCoverage = NON_FULL_COVERAGE_PACKAGES.includes( packageName );

		const testCommand = [
			'node',
			'scripts/ci/check-unit-tests-for-package.js',
			'--package-name',
			packageName,
			checkCoverage ? '--check-coverage' : null,
			allowNonFullCoverage ? '--allow-non-full-coverage' : null,
			coverageFile ? `--coverage-file ${ coverageFile }` : null
		].filter( Boolean ).join( ' ' );

		return {
			run: {
				// When a previous package failed, we still want to check the entire repository.
				when: 'always',
				name: `Execute tests for "${ packageName }"`,
				command: testCommand
			}
		};
	} );
}

/**
 * @param {CircleCIConfiguration} config
 * @param {String} jobName
 */
function replaceShortCheckout( config, jobName ) {
	const job = config.jobs[ jobName ];

	job.steps = job.steps.map( item => {
		if ( item === 'checkout_command' ) {
			return 'checkout';
		}

		return item;
	} );
}

/**
 * This type partially covers supported options on CircleCI.
 * To see the complete guide, follow: https://circleci.com/docs/configuration-reference.
 *
 * @typedef {Object} CircleCIConfiguration
 *
 * @property {String} version
 *
 * @property {Object.<String, CircleCIParameter>} parameters
 *
 * @property {Object.<String, CircleCIJob>} jobs
 *
 * @property {Object.<String, CircleCICommand>} command
 *
 * @property {Object} workflows
 *
 * @property {Boolean} [setup]
 */

/**
 * @typedef {Object} CircleCIParameter
 *
 * @property {'string'|'boolean'|'integer'|'enum'} type
 *
 * @property {String|Number|Boolean} default
 */

/**
 * @typedef {Object} CircleCIJob
 *
 * @property {Boolean} machine
 *
 * @property {Array.<String|CircleCITask>} steps
 *
 * @property {Object.<String, CircleCIParameter>} [parameters]
 */

/**
 * @typedef {Object} CircleCICommand
 *
 * @property {String} description
 *
 * @property {Array.<String|CircleCITask>} steps
 *
 * @property {Object.<String, CircleCIParameter>} [parameters]
 */

/**
 * @typedef {Object} CircleCITask
 *
 * @property {Object} [persist_to_workspace]
 *
 * @property {String} [persist_to_workspace.root]
 *
 * @property {Array.<String>} [persist_to_workspace.paths]
 *
 * @property {Object} [run]
 *
 * @property {String} [run.name]
 *
 * @property {String} [run.command]
 *
 * @property {String} [run.when]
 *
 * @property {String} [run.working_directory]
 */
