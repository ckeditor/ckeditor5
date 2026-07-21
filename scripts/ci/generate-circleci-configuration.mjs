#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

// The script aims to load the template file (`.circleci/template.yml`) and store it under
// the `.circleci/config-tests.yml` path, a source for a new workflow triggered from the main
// thread when a new build starts.
//
// It generates the `tests_batch_<n>` jobs: the sorted package list is split into `BATCH_COUNT`
// contiguous alphabetical chunks, one per batch job, with one step per package. Each batch
// concatenates the coverage reports of its packages into a single lcov file that the
// `cke5_coverage` job merges and uploads.
//
// See: https://circleci.com/docs/using-dynamic-configuration/.

import { globSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import yaml from 'js-yaml';
import { parseArgs } from 'node:util';
import { CKEDITOR5_ROOT_PATH } from '../constants.mjs';

const CIRCLECI_CONFIGURATION_DIRECTORY = join( CKEDITOR5_ROOT_PATH, '.circleci' );

// Fewer batchs duplicate less environment setup, but each batch job runs longer — keep the batch
// jobs shorter than the pipeline's critical path (the slowest non-test job).
const BATCH_COUNT = 3;
const BATCH_JOB_PLACEHOLDER = 'tests_batch_n';
const BATCH_COVERAGE_FILE_PLACEHOLDER = `.out/combined_${ BATCH_JOB_PLACEHOLDER }.info`;

// The aggregate packages provide no tests for the modules they re-export, so the test wrapper
// (`scripts/test.mjs`) always runs their plain `test` script and no coverage report is produced.
const AGGREGATE_PACKAGES = [
	'ckeditor5',
	'ckeditor5-premium-features'
];

const { values: options } = parseArgs( {
	options: {
		// A boolean flag does not accept positional arguments. Hence, `string`, and custom casting.
		'is-lts-pipeline': {
			type: 'string',
			default: 'false'
		}
	}
} );

const isLtsPipeline = options[ 'is-lts-pipeline' ] === 'true';

const packages = listPackages( join( CKEDITOR5_ROOT_PATH, 'packages' ) );

const config = yaml.load( await readFile( join( CIRCLECI_CONFIGURATION_DIRECTORY, 'template.yml' ) ) );
const rootConfig = yaml.load( await readFile( join( CIRCLECI_CONFIGURATION_DIRECTORY, 'config.yml' ) ) );

config.parameters = rootConfig.parameters;

const batchJobNames = Array.from( { length: BATCH_COUNT }, ( _, index ) => BATCH_JOB_PLACEHOLDER.replace( /(?<=_)n$/, index + 1 ) );
const batchCoverageFiles = batchJobNames.map( jobName => `.out/combined_${ jobName }.info` );

batchJobNames.forEach( ( jobName, batchIndex ) => {
	const coverageFile = batchCoverageFiles[ batchIndex ];

	config.jobs[ jobName ] = {
		docker: [ { image: 'cimg/node:24.11.0-browsers' } ],
		steps: [
			'checkout_command',
			'bootstrap_repository_command',
			'prepare_environment_command',
			{
				run: {
					when: 'always',
					name: 'Prepare the code coverage directory',
					command: 'mkdir .out'
				}
			},
			...generateTestSteps( batchOf( packages, batchIndex ), { coverageFile } ),
			{
				persist_to_workspace: {
					root: '.out',
					paths: [ coverageFile.replace( /^\.out\//, '' ) ]
				}
			}
		]
	};
} );

// Force using the `GPL` license by default; the LTS pipeline tests against the license
// configured in the project environment variables.
if ( !isLtsPipeline ) {
	for ( const jobName of [ 'cke5_manual', ...batchJobNames ] ) {
		config.jobs[ jobName ].environment = {
			...config.jobs[ jobName ].environment,
			CKEDITOR_LICENSE_KEY: 'GPL'
		};
	}
}

expandPlaceholderInWorkflows( config, BATCH_JOB_PLACEHOLDER, batchJobNames );

// Replacing the coverage filename placeholder in the coverage job steps.
for ( const step of config.jobs.cke5_coverage.steps ) {
	if ( step instanceof Object && step.run && step.run.command ) {
		step.run.command = step.run.command.replace( BATCH_COVERAGE_FILE_PLACEHOLDER, batchCoverageFiles.join( ' ' ) );
	}
}

await writeFile(
	join( CIRCLECI_CONFIGURATION_DIRECTORY, 'config-tests.yml' ),
	yaml.dump( config, { lineWidth: -1, noRefs: true } )
);

function listPackages( absolutePackagesDir ) {
	return globSync( '*/', { cwd: absolutePackagesDir } ).sort();
}

// Contiguous alphabetical chunks (not round-robin), so it is predictable which batch runs
// a given package.
function batchOf( packages, batchIndex ) {
	const baseSize = Math.floor( packages.length / BATCH_COUNT );
	const remainder = packages.length % BATCH_COUNT;

	const start = batchIndex * baseSize + Math.min( batchIndex, remainder );
	const size = baseSize + ( batchIndex < remainder ? 1 : 0 );

	return packages.slice( start, start + size );
}

function generateTestSteps( packages, { coverageFile } ) {
	return packages.map( packageName => {
		// When checking coverage, the 100% coverage thresholds configured by `createVitestConfig()`
		// make Vitest exit with a non-zero code on a violation, so no external coverage check is needed.
		//
		// The lcov report contains repository-relative `SF:` paths (`createVitestConfig()` sets the
		// reporter's `projectRoot`), so per-package reports can be concatenated verbatim.
		//
		// The aggregate packages never produce a coverage report, so their steps skip
		// the coverage flag and the report concatenation.
		const collectCoverage = !AGGREGATE_PACKAGES.includes( packageName );
		const testCommand = [
			'node --run test -- --attempts 3',
			collectCoverage ? '-c' : null,
			`-f ${ packageName }`,
			collectCoverage ? `&& cat packages/${ packageName }/coverage/lcov.info >> ${ coverageFile }` : null
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

function expandPlaceholderInWorkflows( config, placeholder, jobNames ) {
	Object.values( config.workflows ).forEach( workflow => {
		if ( !( workflow instanceof Object ) || !workflow.jobs ) {
			return;
		}

		workflow.jobs.forEach( job => {
			const { requires } = Object.values( job )[ 0 ] || {};

			if ( requires ) {
				replacePlaceholderInArray( requires, placeholder, jobNames );
			}
		} );

		replacePlaceholderInArray( workflow.jobs, placeholder, jobNames );

		while ( true ) {
			const placeholderJobIndex = workflow.jobs.findIndex( job => {
				return typeof job === 'object' && job[ placeholder ];
			} );

			if ( placeholderJobIndex === -1 ) {
				break;
			}

			const placeholderJobContent = workflow.jobs[ placeholderJobIndex ][ placeholder ];
			const newJobs = jobNames.map( jobName => ( { [ jobName ]: placeholderJobContent } ) );

			workflow.jobs.splice( placeholderJobIndex, 1, ...newJobs );
		}
	} );
}

function replacePlaceholderInArray( array, placeholder, replacements ) {
	const i = array.findIndex( item => item === placeholder );

	if ( i === -1 ) {
		return;
	}

	array.splice( i, 1, ...replacements );
}
