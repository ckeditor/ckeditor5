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
 * const config: ViteUserConfig = createVitestConfig( import.meta.dirname, { name: 'special-characters' } );
 *
 * export default config;
 * ```
 *
 * The `packageDir` argument must be the absolute path to the package directory (always pass
 * `import.meta.dirname`). It is used as the Vite `root`, so that all relative paths (test include
 * globs, coverage globs, report directories) resolve against the package directory regardless of
 * the process working directory. This makes the configuration work identically for the test runner
 * wrapper (which spawns Vitest with cwd set to the package directory) and for IDE integrations
 * like WebStorm (which spawn Vitest from the repository root).
 *
 * The `name` option must be the short package name (without the `ckeditor5-` prefix),
 * as the test runner wrapper selects packages by this name.
 * Any other properties are merged into the `test` configuration as overrides.
 */
export function createVitestConfig( packageDir: string, { name, ...testOverrides }: TestOptions ): ViteUserConfig {
	return mergeConfig(
		defineConfig( {
			root: packageDir,

			test: {
				name,

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
					headless: true,
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

				// Applies to standalone runs (`pnpm vitest` in a package directory or an IDE run).
				// The test runner wrapper overrides the reporters and the reports directory
				// via `--coverage.*` flags when merging per-package coverage.
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
 * The workspace configuration read by Vitest when it is launched from the repository root
 * without an explicit configuration file, which is how IDE integrations (for example
 * WebStorm) run tests. Vitest matches the test file filter against the listed projects
 * and runs it with the package's own configuration.
 *
 * It is intended for filtered, single-package runs only. Do not run all projects at once
 * through this configuration (a bare `vitest --run` from the repository root) — dependency
 * optimization across all browser-mode projects takes excessive time. The test runner
 * wrapper instead spawns a separate Vitest process per package.
 */
const workspaceConfig: ViteUserConfig = defineConfig( {
	test: {
		projects: [
			'packages/*'
		]
	}
} );

export default workspaceConfig;
