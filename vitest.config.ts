/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { dirname, resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig, type ViteUserConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

const REPO_ROOT = dirname( fileURLToPath( import.meta.url ) );
const CHROME_EXECUTABLE_PATH = process.env.PUPPETEER_EXECUTABLE_PATH;

type TestOptions = NonNullable<ViteUserConfig[ 'test' ]>;

/**
 * Creates a Vitest configuration for a single package.
 *
 * Package-level `vitest.config.ts` files should use this factory instead of
 * configuring Vitest from scratch, so that common options stay in one place:
 *
 * ```ts
 * import { createVitestConfig } from '../../vitest.config';
 *
 * const config: ViteUserConfig = createVitestConfig( { name: 'special-characters' } );
 *
 * export default config;
 * ```
 *
 * The `name` option must be the short package name (without the `ckeditor5-` prefix),
 * as the test runner wrapper selects packages via `--project <short-name>`.
 * Any other properties are merged into the `test` configuration as overrides.
 */
export function createVitestConfig( { name, ...testOverrides }: TestOptions ): ViteUserConfig {
	return mergeConfig(
		defineConfig( {
			test: {
				name,
				globals: true,

				include: [
					'tests/**/*.{js,ts}'
				],
				exclude: [
					'**/_utils',
					'**/fixtures',
					'**/manual'
				],
				setupFiles: [
					resolve( REPO_ROOT, 'test_setup.js' )
				],
				testTimeout: 5_000,

				browser: {
					enabled: true,
					isolate: false,
					provider: playwright( {
						launchOptions: CHROME_EXECUTABLE_PATH ?
							{ executablePath: CHROME_EXECUTABLE_PATH } :
							{ channel: 'chrome' }
					} ),
					screenshotFailures: false,
					instances: [
						{ browser: 'chromium', viewport: { width: 1920, height: 1080 } }
					]
				},

				// Applies to standalone runs (`pnpm vitest` in a package directory). In workspace
				// runs, the root-level coverage configuration from `createWorkspaceConfig()` wins.
				coverage: {
					provider: 'v8',
					clean: true,
					reporter: [ 'text', 'html' ],
					include: [ 'src/**' ],
					exclude: [
						'src/index.ts',
						'src/augmentation.ts',
						'src/**/*config.ts'
					],
					thresholds: {
						100: true
					}
				}
			},

			publicDir: resolve( REPO_ROOT, 'packages/ckeditor5-utils/tests/_assets' ),

			optimizeDeps: {
				include: [ '@vitest/coverage-v8/browser' ]
			},

			plugins: [
				{
					name: 'load-svg',
					enforce: 'pre',
					load( id: string ) {
						if ( id.endsWith( '.svg' ) ) {
							const content = readFileSync( id, 'utf-8' );

							return `export default ${ JSON.stringify( content ) };`;
						}
					}
				}
			]
		} ),
		defineConfig( { test: testOverrides } )
	);
}

/**
 * Creates the workspace configuration read by Vitest when run from a repository root.
 * The coverage setup is shared by all repositories using this factory: the `json` and
 * `lcovonly` reporters are required by the test runner wrapper and the CI coverage checks.
 * The wrapper prints the final combined `text-summary` after merging per-package JSON
 * reports, so the workspace coverage configuration intentionally omits `text-summary` to
 * avoid printing the summary twice.
 */
export function createWorkspaceConfig( projects: Array<string> ): ViteUserConfig {
	return defineConfig( {
		test: {
			projects,
			coverage: {
				provider: 'v8',
				reporter: [ 'html', 'json', 'lcovonly' ],
				reportsDirectory: 'coverage-vitest'
			}
		}
	} );
}

const workspaceConfig: ViteUserConfig = createWorkspaceConfig( [ 'packages/*/vitest.config.ts' ] );

export default workspaceConfig;
