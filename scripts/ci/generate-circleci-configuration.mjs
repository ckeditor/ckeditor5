#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

// The script assumes that it is executed from the CKEditor 5 Commercial directory and aims to load
// the template file (`.circleci/template.yml`) and store it under the `.circleci/config-tests.yml` path,
// a source for a new workflow triggered from the main thread when a new build starts.
//
// See: https://circleci.com/docs/using-dynamic-configuration/.

import upath from 'upath';
import fs from 'fs/promises';
import { glob } from 'glob';
import yaml from 'js-yaml';
import IS_COMMUNITY_PR from './is-community-pr.mjs';
import { CKEDITOR5_ROOT_PATH } from '../constants.mjs';

const CIRCLECI_CONFIGURATION_DIRECTORY = upath.join( CKEDITOR5_ROOT_PATH, '.circleci' );

const FEATURE_TEST_BATCH_NAME_PLACEHOLDER = 'cke5_tests_features_batch_n';
const FEATURE_COVERAGE_BATCH_FILENAME_PLACEHOLDER = '.out/combined_features_batch_n.info';

/**
 * This variable determines amount and size of feature test batches.
 *
 * If there are more feature packages than the sum of all batches defined here,
 * one batch will be automatically added to cover remaining tests.
 */
const FEATURE_BATCH_SIZES = [
	20,
	15
];

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

const listBatchPackages = packageNames => {
	const text = [
		`A total of ${ packageNames.length } packages will be tested in this batch:`,
		packageNames.map( packageName => ` - ${ packageName }` ).join( '\\n' ),
		''
	].join( '\\n\\n' );

	return {
		run: {
			when: 'always',
			name: 'List packages tested in this batch',
			command: `printf "${ text }"`
		}
	};
};

const persistToWorkspace = fileName => ( {
	persist_to_workspace: {
		root: '.out',
		paths: [ fileName ]
	}
} );

( async () => {
	const frameworkPackages = ( await fs.readdir( upath.join( CKEDITOR5_ROOT_PATH, 'src' ) ) )
		.filter( filename => !filename.startsWith( 'index' ) )
		.map( filename => 'ckeditor5-' + filename.replace( /\.(js|ts)$/, '' ) );

	const featurePackages = ( await glob( '*/', { cwd: upath.join( CKEDITOR5_ROOT_PATH, 'packages' ) } ) )
		.filter( packageName => !frameworkPackages.includes( packageName ) );

	featurePackages.sort();

	/**
	 * @type CircleCIConfiguration
	 */
	const config = yaml.load(
		await fs.readFile( upath.join( CIRCLECI_CONFIGURATION_DIRECTORY, 'template.yml' ) )
	);

	const featureTestBatches = featurePackages.reduce( ( output, packageName, packageIndex ) => {
		let currentBatch = FEATURE_BATCH_SIZES.findIndex( ( batchSize, batchIndex, allBatches ) => {
			return packageIndex < allBatches.slice( 0, batchIndex + 1 ).reduce( ( a, b ) => a + b );
		} );

		// Additional batch for the remaining tests not included in defined batch sizes.
		if ( currentBatch === -1 ) {
			currentBatch = FEATURE_BATCH_SIZES.length;
		}

		if ( !output[ currentBatch ] ) {
			output[ currentBatch ] = [];
		}

		output[ currentBatch ].push( packageName );

		return output;
	}, [] );

	const featureTestBatchNames = featureTestBatches.map( ( batch, batchIndex ) => {
		return FEATURE_TEST_BATCH_NAME_PLACEHOLDER.replace( /(?<=_)n$/, batchIndex + 1 );
	} );
	const featureCoverageBatchFilenames = featureTestBatches.map( ( batch, batchIndex ) => {
		return FEATURE_COVERAGE_BATCH_FILENAME_PLACEHOLDER.replace( /(?<=_)n(?=\.info$)/, batchIndex + 1 );
	} );

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

	// Adding batches to the root `jobs`.
	featureTestBatches.forEach( ( batch, batchIndex ) => {
		config.jobs[ featureTestBatchNames[ batchIndex ] ] = {
			machine: true,
			steps: [
				...bootstrapCommands(),
				'install_newest_emoji',
				prepareCodeCoverageDirectories(),
				listBatchPackages( batch ),
				...generateTestSteps( batch, {
					checkCoverage: true,
					coverageFile: featureCoverageBatchFilenames[ batchIndex ]
				} ),
				'community_verification_command',
				persistToWorkspace( featureCoverageBatchFilenames[ batchIndex ].replace( /^\.out\//, '' ) )
			]
		};
	} );

	Object.values( config.workflows ).forEach( workflow => {
		if ( !( workflow instanceof Object ) ) {
			return;
		}

		if ( !workflow.jobs ) {
			return;
		}

		// Replacing the placeholder batch names in `requires` arrays in `workflows`.
		workflow.jobs.forEach( job => {
			const { requires } = Object.values( job )[ 0 ];

			if ( requires ) {
				replacePlaceholderBatchNameInArray( requires, featureTestBatchNames );
			}
		} );

		// Replacing the placeholder batch names in `jobs` arrays in `workflows`.
		replacePlaceholderBatchNameInArray( workflow.jobs, featureTestBatchNames );

		// Replacing the placeholder batch objects in `jobs` arrays in `workflows`.
		const placeholderJobIndex = workflow.jobs.findIndex( job => job[ FEATURE_TEST_BATCH_NAME_PLACEHOLDER ] );

		if ( placeholderJobIndex === -1 ) {
			return;
		}

		const placeholderJobContent = workflow.jobs[ placeholderJobIndex ][ FEATURE_TEST_BATCH_NAME_PLACEHOLDER ];
		const newBatchJobs = featureTestBatchNames.map( featureTestBatchName => {
			return {
				[ featureTestBatchName ]: placeholderJobContent
			};
		} );

		workflow.jobs.splice( placeholderJobIndex, 1, ...newBatchJobs );
	} );

	// Replacing the coverage filename placeholder in coverage steps.
	Object.values( config.jobs.cke5_coverage.steps ).forEach( step => {
		if ( !( step instanceof Object ) ) {
			return;
		}

		if ( !step.run || !step.run.command ) {
			return;
		}

		step.run.command = step.run.command.replace(
			FEATURE_COVERAGE_BATCH_FILENAME_PLACEHOLDER,
			featureCoverageBatchFilenames.join( ' ' )
		);
	} );

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
			'scripts/ci/check-unit-tests-for-package.mjs',
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

function replacePlaceholderBatchNameInArray( array, featureTestBatchNames ) {
	const placeholderIndex = array.findIndex( item => item === FEATURE_TEST_BATCH_NAME_PLACEHOLDER );

	if ( placeholderIndex === -1 ) {
		return;
	}

	array.splice( placeholderIndex, 1, ...featureTestBatchNames );
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
