/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, expect, it, vi } from 'vitest';
import fs from 'node:fs/promises';
import { glob } from 'glob';
import yaml from 'js-yaml';
import { parseArgs } from 'node:util';

vi.mock( 'node:fs/promises' );
vi.mock( 'glob' );
vi.mock( 'js-yaml' );
vi.mock( 'node:util' );
vi.mock( '../../scripts/constants.mjs', () => ( {
	CKEDITOR5_ROOT_PATH: '/workspace/ckeditor5',
	CKEDITOR5_MAIN_PACKAGE_PATH: '/workspace/ckeditor5/packages/ckeditor5'
} ) );

const CIRCLECI_CONFIG_DIRECTORY_PATH = '/workspace/ckeditor5/.circleci';
const CONFIG_TESTS_PATH = `${ CIRCLECI_CONFIG_DIRECTORY_PATH }/config-tests.yml`;

describe( 'scripts/ci/generate-circleci-configuration', () => {
	it( 'creates one batch job per contiguous chunk of the sorted package list', async () => {
		const config = await generateCircleConfiguration( {
			packages: [
				'ckeditor5-table',
				'ckeditor5-alignment',
				'ckeditor5-core',
				'ckeditor5-engine',
				'ckeditor5-link',
				'ckeditor5-basic-styles',
				'ckeditor5-utils'
			]
		} );

		expect( getBatchJobNames( config ) ).toEqual( [
			'tests_batch_1',
			'tests_batch_2',
			'tests_batch_3'
		] );
		expect( getPackageTestOrder( config.jobs.tests_batch_1 ) ).toEqual( [
			'ckeditor5-alignment',
			'ckeditor5-basic-styles',
			'ckeditor5-core'
		] );
		expect( getPackageTestOrder( config.jobs.tests_batch_2 ) ).toEqual( [
			'ckeditor5-engine',
			'ckeditor5-link'
		] );
		expect( getPackageTestOrder( config.jobs.tests_batch_3 ) ).toEqual( [
			'ckeditor5-table',
			'ckeditor5-utils'
		] );
	} );

	it( 'bootstraps each batch job before running the package tests', async () => {
		const config = await generateCircleConfiguration();

		const { steps } = config.jobs.tests_batch_1;

		expect( steps.slice( 0, 3 ) ).toEqual( [
			'checkout_command',
			'bootstrap_repository_command',
			'prepare_environment_command'
		] );
		expect( steps[ 3 ].run.command ).toBe( 'mkdir .out' );
	} );

	it( 'collects the coverage of each package into the batch coverage file', async () => {
		const config = await generateCircleConfiguration();

		const testStep = config.jobs.tests_batch_1.steps.find( step => step.run?.command?.startsWith( 'pnpm run test' ) );

		expect( testStep.run.when ).toBe( 'always' );
		expect( testStep.run.command ).toBe(
			'pnpm run test --attempts 3 -c -f ckeditor5-alignment && ' +
			'cat packages/ckeditor5-alignment/coverage/lcov.info >> .out/combined_tests_batch_1.info'
		);
	} );

	it( 'skips the coverage collection for the aggregate packages', async () => {
		const config = await generateCircleConfiguration( {
			packages: [ 'ckeditor5', 'ckeditor5-core', 'ckeditor5-premium-features' ]
		} );

		expect( getPackageTestCommand( config.jobs.tests_batch_1, 'ckeditor5' ) ).toBe(
			'pnpm run test --attempts 3 -f ckeditor5'
		);
		expect( getPackageTestCommand( config.jobs.tests_batch_2, 'ckeditor5-core' ) ).toBe(
			'pnpm run test --attempts 3 -c -f ckeditor5-core && ' +
			'cat packages/ckeditor5-core/coverage/lcov.info >> .out/combined_tests_batch_2.info'
		);
		expect( getPackageTestCommand( config.jobs.tests_batch_3, 'ckeditor5-premium-features' ) ).toBe(
			'pnpm run test --attempts 3 -f ckeditor5-premium-features'
		);
	} );

	it( 'persists the batch coverage file to the workspace', async () => {
		const config = await generateCircleConfiguration();

		const persistStep = config.jobs.tests_batch_2.steps.find( step => step.persist_to_workspace );

		expect( persistStep ).toEqual( {
			persist_to_workspace: {
				root: '.out',
				paths: [ 'combined_tests_batch_2.info' ]
			}
		} );
	} );

	it( 'replaces the batch placeholder with the generated job names', async () => {
		const config = await generateCircleConfiguration();

		const workflowJobs = config.workflows.tests.jobs;

		expect( config.jobs.tests_batch_n ).toBeUndefined();
		expect( workflowJobs ).not.toContain( 'tests_batch_n' );
		expect( workflowJobs ).toContain( 'tests_batch_1' );
		expect( workflowJobs ).toContain( 'tests_batch_2' );
		expect( workflowJobs ).toContain( 'tests_batch_3' );

		const coverageJob = workflowJobs.find( job => job.cke5_coverage );

		expect( coverageJob.cke5_coverage.requires ).toEqual( [
			'tests_batch_1',
			'tests_batch_2',
			'tests_batch_3'
		] );
	} );

	it( 'expands a batch placeholder job that carries additional configuration', async () => {
		const branchesFilter = { filters: { branches: { ignore: [ 'stable' ] } } };
		const config = await generateCircleConfiguration();

		expect( config.workflows.nightly.jobs ).toEqual( [
			{ tests_batch_1: branchesFilter },
			{ tests_batch_2: branchesFilter },
			{ tests_batch_3: branchesFilter }
		] );
	} );

	it( 'merges the batch coverage files in the coverage job', async () => {
		const config = await generateCircleConfiguration();

		const mergeStep = config.jobs.cke5_coverage.steps.find( step => step.run?.command );

		expect( mergeStep.run.command ).toBe(
			'cat .out/combined_tests_batch_1.info .out/combined_tests_batch_2.info .out/combined_tests_batch_3.info ' +
			'> .out/combined_lcov.info'
		);
	} );

	it( 'inherits parameters from the `config.yml` file', async () => {
		const rootConfig = {
			parameters: {
				isLtsPipeline: {
					type: 'boolean',
					default: false
				},
				customParameterFromRoot: {
					type: 'string',
					default: 'root-value'
				}
			}
		};

		const config = await generateCircleConfiguration( { rootConfig } );

		expect( config.parameters ).toEqual( rootConfig.parameters );
		expect( config.parameters.placeholder ).toBeUndefined();
	} );

	it( 'uses the `GPL` license key in non-LTS pipelines', async () => {
		const config = await generateCircleConfiguration();

		expect( config.jobs.cke5_manual.environment ).toEqual( {
			EXISTING_ENV: 'keep-me',
			CKEDITOR_LICENSE_KEY: 'GPL'
		} );
		expect( config.jobs.tests_batch_1.environment ).toEqual( {
			CKEDITOR_LICENSE_KEY: 'GPL'
		} );
	} );

	it( 'does not use the GPL license key in LTS pipelines', async () => {
		const config = await generateCircleConfiguration( {
			cliArgs: [ '--is-lts-pipeline=true' ]
		} );

		expect( config.jobs.cke5_manual.environment ).toEqual( {
			EXISTING_ENV: 'keep-me'
		} );
		expect( config.jobs.tests_batch_1.environment ).toBeUndefined();
	} );

	it( 'stores the generated configuration file as `config-tests.yml`', async () => {
		const config = await generateCircleConfiguration();

		expect( fs.writeFile ).toHaveBeenCalledTimes( 1 );
		expect( fs.writeFile ).toHaveBeenCalledWith( CONFIG_TESTS_PATH, 'serialized-config' );
		expect( yaml.dump ).toHaveBeenCalledWith( config, { lineWidth: -1, noRefs: true } );
	} );

	it( 'reads `template.yml` and `config.yml` configuration files', async () => {
		await generateCircleConfiguration();

		expect( fs.readFile ).toHaveBeenCalledTimes( 2 );
		expect( fs.readFile ).toHaveBeenNthCalledWith( 1, `${ CIRCLECI_CONFIG_DIRECTORY_PATH }/template.yml` );
		expect( fs.readFile ).toHaveBeenNthCalledWith( 2, `${ CIRCLECI_CONFIG_DIRECTORY_PATH }/config.yml` );
	} );
} );

async function generateCircleConfiguration( {
	cliArgs = [],
	packages = [
		'ckeditor5-table',
		'ckeditor5-alignment',
		'ckeditor5-core',
		'ckeditor5-engine',
		'ckeditor5-link',
		'ckeditor5-basic-styles',
		'ckeditor5-utils'
	],
	templateConfig = getTemplateConfigFixture(),
	rootConfig = getRootConfigFixture()
} = {} ) {
	vi.resetModules();
	vi.clearAllMocks();

	vi.mocked( parseArgs ).mockReturnValue( {
		values: parseScriptOptionsFromCliArgs( cliArgs )
	} );

	vi.mocked( glob ).mockResolvedValue( [ ...packages ] );
	vi.mocked( fs.readFile ).mockImplementation( async filePath => {
		if ( filePath.endsWith( 'template.yml' ) ) {
			return 'template-yaml';
		}

		if ( filePath.endsWith( 'config.yml' ) ) {
			return 'root-yaml';
		}

		throw new Error( `Unexpected file read: ${ filePath }` );
	} );
	vi.mocked( yaml.load ).mockImplementation( value => {
		if ( value === 'template-yaml' ) {
			return deepClone( templateConfig );
		}

		if ( value === 'root-yaml' ) {
			return deepClone( rootConfig );
		}

		throw new Error( `Unexpected YAML payload: ${ value }` );
	} );

	let generatedConfig;

	vi.mocked( yaml.dump ).mockImplementation( config => {
		generatedConfig = config;

		return 'serialized-config';
	} );

	vi.mocked( fs.writeFile ).mockResolvedValue();

	await import( '../../scripts/ci/generate-circleci-configuration.mjs' );

	return generatedConfig;
}

function getTemplateConfigFixture() {
	return {
		version: 2.1,
		parameters: {
			placeholder: {
				type: 'string',
				default: 'placeholder'
			}
		},
		commands: {
			noop_command: {
				steps: [
					'noop_command_step'
				]
			}
		},
		jobs: {
			cke5_manual: {
				docker: [
					{ image: 'cimg/node:24.11.0-browsers' }
				],
				environment: {
					EXISTING_ENV: 'keep-me'
				},
				steps: [
					'checkout_command',
					'bootstrap_repository_command',
					'prepare_environment_command',
					{
						run: {
							name: 'Manual verification',
							command: 'pnpm run manual'
						}
					}
				]
			},
			cke5_coverage: {
				docker: [
					{ image: 'cimg/node:24.11.0' }
				],
				steps: [
					'checkout_command',
					{
						attach_workspace: {
							at: '.out'
						}
					},
					{
						run: {
							name: 'Merge coverage',
							command: 'cat .out/combined_tests_batch_n.info > .out/combined_lcov.info'
						}
					},
					{
						run: {
							name: 'No command'
						}
					}
				]
			},
			additional_job: {
				steps: [
					'checkout_command',
					'noop_step'
				]
			}
		},
		workflows: {
			version: 2,
			metadata: {
				description: 'No jobs here'
			},
			tests: {
				jobs: [
					'tests_batch_n',
					{
						cke5_coverage: {
							requires: [
								'tests_batch_n'
							]
						}
					},
					{
						some_job: {
							requires: [
								'cke5_validators'
							]
						}
					}
				]
			},
			nightly: {
				jobs: [
					{
						tests_batch_n: {
							filters: {
								branches: {
									ignore: [
										'stable'
									]
								}
							}
						}
					}
				]
			},
			post_release: {
				jobs: [
					{
						cke5_manual: {
							requires: [
								'some_job'
							]
						}
					}
				]
			}
		}
	};
}

function getRootConfigFixture() {
	return {
		parameters: {
			chromeVersion: {
				type: 'string',
				default: '144.0.7559.59'
			},
			isLtsPipeline: {
				type: 'boolean',
				default: false
			}
		}
	};
}

function getBatchJobNames( config ) {
	return Object.keys( config.jobs ).filter( jobName => jobName.startsWith( 'tests_batch_' ) );
}

function getPackageTestOrder( job ) {
	return job.steps
		.map( step => step.run?.name?.match( /^Execute tests for "(.+)"$/ )?.[ 1 ] )
		.filter( Boolean );
}

function getPackageTestCommand( job, packageName ) {
	return job.steps.find( step => step.run?.name === `Execute tests for "${ packageName }"` )?.run.command;
}

function deepClone( value ) {
	return JSON.parse( JSON.stringify( value ) );
}

function parseScriptOptionsFromCliArgs( cliArgs ) {
	const options = {
		'is-lts-pipeline': 'false'
	};

	for ( const arg of cliArgs ) {
		if ( arg.startsWith( '--is-lts-pipeline=' ) ) {
			options[ 'is-lts-pipeline' ] = arg.replace( '--is-lts-pipeline=', '' );
		}
	}

	return options;
}
