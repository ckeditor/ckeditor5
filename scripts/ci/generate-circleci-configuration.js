#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
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
			} )
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
			} )
		]
	};

	if ( IS_COMMUNITY_PR ) {
		// CircleCI does not understand custom cloning when a PR comes from the community.
		// In such a case, the goal to use the built-in command.
		Object.keys( config.jobs )
			.forEach( jobName => {
				replaceShortCheckout( config, jobName );
			} );
	} else {
		// We aim to send the coverage report only from builds triggered by the CKEditor team.
		// For the community PRs we do not share secret variables.
		// Hence, some of the scripts will not. See: https://github.com/ckeditor/ckeditor5/issues/7745.
		config.jobs.cke5_tests_framework.steps.push( persistToWorkspace( 'combined_framework.info' ) );
		config.jobs.cke5_tests_features.steps.push( persistToWorkspace( 'combined_features.info' ) );
	}

	Object.keys( config.jobs )
		.filter( jobName => {
			if ( jobName === 'release_prepare' ) {
				return true;
			}

			if ( jobName.includes( 'tests' ) || jobName.includes( 'coverage' ) || jobName.includes( 'manual' ) ) {
				return true;
			}

			return false;
		} )
		.forEach( jobName => injectShortFlowDetection( config, jobName ) );

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

	job.steps = job.steps.map( ( item, index ) => {
		if ( index === 0 ) {
			return 'checkout';
		}

		return item;
	} );
}

/**
 * @param {CircleCIConfiguration} config
 * @param {String} jobName
 */
function injectShortFlowDetection( config, jobName ) {
	const job = config.jobs[ jobName ];
	job.environment = job.environment || {};

	const { steps, environment } = job;

	steps.splice( 3, 0, {
		run: {
			name: '⭐ Short flow breakpoint - Check if the build should continue',
			// This command should not impact on the error code.
			command: 'node scripts/ci/should-run-short-flow.js && circleci-agent step halt || echo ""'
		}
	} );

	environment.CKE5_IS_NIGHTLY_BUILD = '<< pipeline.parameters.isNightly >>';
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
