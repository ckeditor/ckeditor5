/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
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
	afterEach( () => {
		vi.unstubAllEnvs();
	} );

	it( 'creates the `cke5_tests_framework` job', async () => {
		const { generatedConfig } = await runScript();

		expect( generatedConfig.jobs.cke5_tests_framework ).toBeDefined();
	} );

	it( 'injects `halt_if_short_flow` into generated test jobs', async () => {
		const { generatedConfig } = await runScript( {
			featurePackages: [ 'ckeditor5-feature-a', 'ckeditor5-feature-b' ]
		} );

		expect( generatedConfig.jobs.cke5_tests_framework.steps ).toContain( 'halt_if_short_flow' );

		getFeatureBatchJobNames( generatedConfig ).forEach( jobName => {
			expect( generatedConfig.jobs[ jobName ].steps ).toContain( 'halt_if_short_flow' );
		} );
	} );

	it( 'allows non-full coverage for the `ckeditor5-minimap` package', async () => {
		const { generatedConfig } = await runScript( {
			featurePackages: [ 'ckeditor5-minimap' ]
		} );

		const minimapTestCommand = getPackageTestCommand( generatedConfig.jobs.cke5_tests_features_batch_1, 'ckeditor5-minimap' );

		expect( minimapTestCommand ).toContain( '--allow-non-full-coverage' );
	} );

	it( 'replaces the feature batch placeholder with generated jobs', async () => {
		const { generatedConfig } = await runScript( {
			featurePackages: [ 'ckeditor5-feature-a' ]
		} );

		const workflowJobs = generatedConfig.workflows.tests.jobs;

		expect( generatedConfig.jobs.cke5_tests_features_batch_n ).toBeUndefined();
		expect( generatedConfig.jobs.cke5_tests_features_batch_1 ).toBeDefined();
		expect( workflowJobs ).not.toContain( 'cke5_tests_features_batch_n' );
		expect( workflowJobs.some( job => job.cke5_tests_features_batch_n ) ).toBe( false );
	} );

	it( 'calculates feature batches using configured sizes and overflow batch', async () => {
		const { generatedConfig } = await runScript( {
			featurePackages: createFeaturePackages( 38 )
		} );

		expect( getFeatureBatchJobNames( generatedConfig ) ).toEqual( [
			'cke5_tests_features_batch_1',
			'cke5_tests_features_batch_2',
			'cke5_tests_features_batch_3'
		] );
		expect( getPackageTestStepCount( generatedConfig.jobs.cke5_tests_features_batch_1 ) ).toBe( 20 );
		expect( getPackageTestStepCount( generatedConfig.jobs.cke5_tests_features_batch_2 ) ).toBe( 15 );
		expect( getPackageTestStepCount( generatedConfig.jobs.cke5_tests_features_batch_3 ) ).toBe( 3 );
	} );

	it( 'inherits parameters from the `config.yml` file', async () => {
		const rootConfig = {
			parameters: {
				isNightly: {
					type: 'boolean',
					default: false
				},
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

		const { generatedConfig } = await runScript( { rootConfig } );

		expect( generatedConfig.parameters ).toEqual( rootConfig.parameters );
		expect( generatedConfig.parameters.placeholder ).toBeUndefined();
	} );

	it( 'substitutes the provided chrome version in jobs and commands', async () => {
		const { generatedConfig } = await runScript( {
			cliArgs: [ '--chrome-version=123.0.0.0' ]
		} );

		expect( getChromeInstallStep( generatedConfig.jobs.cke5_manual.steps ) ).toEqual( {
			'browser-tools/install_chrome': {
				chrome_version: '123.0.0.0',
				timeout: '5m'
			}
		} );
		expect( getChromeInstallStep( generatedConfig.commands.command_with_chrome.steps ) ).toEqual( {
			'browser-tools/install_chrome': {
				chrome_version: '123.0.0.0',
				timeout: '5m'
			}
		} );
	} );

	it( 'uses the `GPL` license key in non-LTS pipelines', async () => {
		const { generatedConfig } = await runScript();

		expect( generatedConfig.jobs.cke5_manual.environment ).toEqual( {
			EXISTING_ENV: 'keep-me',
			CKEDITOR_LICENSE_KEY: 'GPL'
		} );
		expect( generatedConfig.jobs.cke5_tests_framework.environment ).toEqual( {
			CKEDITOR_LICENSE_KEY: 'GPL'
		} );
		expect( generatedConfig.jobs.cke5_tests_features_batch_1.environment ).toEqual( {
			CKEDITOR_LICENSE_KEY: 'GPL'
		} );
	} );

	it( 'does not use the GPL license key in LTS pipelines', async () => {
		const { generatedConfig } = await runScript( {
			cliArgs: [ '--is-lts-pipeline=true' ]
		} );

		expect( generatedConfig.jobs.cke5_manual.environment ).toEqual( {
			EXISTING_ENV: 'keep-me'
		} );
		expect( generatedConfig.jobs.cke5_tests_framework.environment ).toBeUndefined();
		expect( generatedConfig.jobs.cke5_tests_features_batch_1.environment ).toBeUndefined();
	} );

	it( 'keeps `checkout_command` in non-community runs', async () => {
		const { generatedConfig } = await runScript();

		expect( generatedConfig.jobs.cke5_manual.steps ).toContain( 'checkout_command' );
		expect( generatedConfig.jobs.cke5_tests_framework.steps ).toContain( 'checkout_command' );
		expect( generatedConfig.jobs.cke5_manual.steps ).not.toContain( 'checkout' );
	} );

	it( 'replaces `checkout_command` with `checkout` for community pull requests', async () => {
		const { generatedConfig } = await runScript( {
			isCommunityPr: true
		} );

		Object.values( generatedConfig.jobs ).forEach( job => {
			const stringSteps = job.steps.filter( step => typeof step === 'string' );

			expect( stringSteps ).not.toContain( 'checkout_command' );
		} );

		expect( generatedConfig.jobs.cke5_manual.steps ).toContain( 'checkout' );
		expect( generatedConfig.jobs.cke5_tests_framework.steps ).toContain( 'checkout' );
	} );

	it( 'stores the generated configuration file as `config-tests.yml`', async () => {
		const { generatedConfig } = await runScript();

		expect( fs.writeFile ).toHaveBeenCalledTimes( 1 );
		expect( fs.writeFile ).toHaveBeenCalledWith( CONFIG_TESTS_PATH, 'serialized-config' );
		expect( yaml.dump ).toHaveBeenCalledWith( generatedConfig, { lineWidth: -1 } );
	} );

	it( 'reads `template.yml` and `config.yml` configuration files', async () => {
		await runScript();

		expect( fs.readFile ).toHaveBeenCalledTimes( 2 );
		expect( fs.readFile ).toHaveBeenNthCalledWith( 1, `${ CIRCLECI_CONFIG_DIRECTORY_PATH }/template.yml` );
		expect( fs.readFile ).toHaveBeenNthCalledWith( 2, `${ CIRCLECI_CONFIG_DIRECTORY_PATH }/config.yml` );
	} );
} );

async function runScript( {
	cliArgs = [],
	isCommunityPr = false,
	frameworkEntries = [ 'index.ts', 'foo.js', 'bar.ts' ],
	featurePackages = [ 'ckeditor5-feature-a' ],
	templateConfig = getTemplateConfigFixture(),
	rootConfig = getRootConfigFixture()
} = {} ) {
	vi.resetModules();
	vi.clearAllMocks();

	vi.mocked( parseArgs ).mockReturnValue( {
		values: parseScriptOptionsFromCliArgs( cliArgs )
	} );

	vi.stubEnv( 'CIRCLE_PR_NUMBER', isCommunityPr ? '1234' : '' );

	vi.mocked( fs.readdir ).mockResolvedValue( frameworkEntries );
	vi.mocked( glob ).mockResolvedValue( featurePackages );
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

	return { generatedConfig };
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
			command_with_chrome: {
				steps: [
					'browser-tools/install_chrome',
					'noop_command_step'
				]
			},
			command_without_chrome: {
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
					'browser-tools/install_chrome',
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
					'community_verification_command',
					'checkout_command',
					{
						attach_workspace: {
							at: '.out'
						}
					},
					{
						run: {
							name: 'Merge coverage',
							command: 'cat .out/combined_framework.info .out/combined_features_batch_n.info > .out/combined_lcov.info'
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
					'cke5_tests_framework',
					'cke5_tests_features_batch_n',
					{
						cke5_coverage: {
							requires: [
								'cke5_tests_framework',
								'cke5_tests_features_batch_n'
							]
						}
					},
					{
						some_job: {
							requires: [
								'cke5_tests_framework'
							]
						}
					},
					{
						cke5_tests_features_batch_n: {
							requires: [
								'cke5_tests_framework'
							]
						}
					}
				]
			},
			post_release: {
				jobs: [
					{
						cke5_manual: {
							requires: [
								'cke5_tests_framework'
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
			isNightly: {
				type: 'boolean',
				default: false
			},
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

function createFeaturePackages( amount ) {
	return Array.from( { length: amount }, ( _, index ) => {
		return `ckeditor5-feature-${ String( index + 1 ).padStart( 2, '0' ) }`;
	} );
}

function getFeatureBatchJobNames( config ) {
	return Object.keys( config.jobs ).filter( jobName => jobName.startsWith( 'cke5_tests_features_batch_' ) );
}

function getPackageTestStepCount( job ) {
	return job.steps.filter( step => step.run?.command?.includes( 'scripts/ci/check-unit-tests-for-package.mjs' ) ).length;
}

function getPackageTestCommand( job, packageName ) {
	return job.steps.find( step => step.run?.command?.includes( `--package-name ${ packageName }` ) )?.run.command;
}

function getChromeInstallStep( steps ) {
	return steps.find( step => step[ 'browser-tools/install_chrome' ] );
}

function deepClone( value ) {
	return JSON.parse( JSON.stringify( value ) );
}

function parseScriptOptionsFromCliArgs( cliArgs ) {
	const options = {
		'chrome-version': 'latest',
		'is-lts-pipeline': 'false'
	};

	for ( const arg of cliArgs ) {
		if ( arg.startsWith( '--chrome-version=' ) ) {
			options[ 'chrome-version' ] = arg.replace( '--chrome-version=', '' );
		}

		if ( arg.startsWith( '--is-lts-pipeline=' ) ) {
			options[ 'is-lts-pipeline' ] = arg.replace( '--is-lts-pipeline=', '' );
		}
	}

	return options;
}
