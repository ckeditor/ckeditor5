/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { basename, dirname, resolve } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { availableParallelism } from 'node:os';
import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig, type ViteUserConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { NON_FULL_COVERAGE_PACKAGES } from './scripts/ci/constants.mjs';

const REPO_ROOT = dirname( fileURLToPath( import.meta.url ) );
const CHROME_EXECUTABLE_PATH = process.env.PUPPETEER_EXECUTABLE_PATH;

type TestOptions = NonNullable<ViteUserConfig[ 'test' ]>;

export interface PackageTestOptions extends TestOptions {

	/**
	 * Disables the 100% coverage thresholds enforced by default in coverage runs.
	 * Defaults to whether the package is listed in the repository's non-full-coverage policy
	 * (`NON_FULL_COVERAGE_PACKAGES`), so package configurations do not need to set it.
	 */
	allowNonFullCoverage?: boolean;
}

/**
 * Creates a Vitest configuration for a single package.
 *
 * Package-level `vitest.config.ts` files should use this factory instead of
 * configuring Vitest from scratch, so that common options stay in one place:
 *
 * ```ts
 * import { createVitestConfig } from '../../vitest.config';
 *
 * const config: ViteUserConfig = createVitestConfig( import.meta.dirname );
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
 * The directory basename also derives the project name (the short package name, without
 * the `ckeditor5-` prefix, as the test runner wrapper selects packages by this name) and
 * the default value of the `allowNonFullCoverage` option, which disables the 100% coverage
 * thresholds for packages listed in the repository's non-full-coverage policy.
 * Any other properties are merged into the `test` configuration as overrides.
 */
export function createVitestConfig( packageDir: string, options: PackageTestOptions = {} ): ViteUserConfig {
	const packageName = basename( packageDir );

	const {
		name = packageName.replace( /^ckeditor5-/, '' ),
		allowNonFullCoverage = NON_FULL_COVERAGE_PACKAGES.includes( packageName ),
		...testOverrides
	} = options;

	return mergeConfig(
		defineConfig( {
			root: packageDir,

			test: {
				name,

				// Restore all spies, stubbed globals, and stubbed environment variables before each
				// test, so no test can leak mocked state into the next one. Tests should not call
				// `vi.restoreAllMocks()`, `vi.unstubAllGlobals()`, or `vi.unstubAllEnvs()` in cleanup
				// hooks, with one exception: a manual restore is still needed when a mock applied by
				// a `beforeEach()` hook must be removed for a single test, or when the teardown itself
				// (for example `editor.destroy()`) must run against the real, unmocked implementations.
				restoreMocks: true,
				unstubGlobals: true,
				unstubEnvs: true,

				maxWorkers: Math.min( availableParallelism(), 4 ),
				include: [
					'tests/**/*.{js,ts}'
				],
				exclude: [
					'**/_utils',
					'**/fixtures',
					'**/manual'
				],
				setupFiles: [
					resolve( REPO_ROOT, 'scripts', 'vitest', 'test_setup.mjs' ),

					// Package stylesheets are imported by the package entry module (`src/index.ts`),
					// not by individual source modules. Tests import source modules directly, so the
					// package theme entry stylesheet must be loaded explicitly. Stylesheets of other
					// packages still arrive transitively through their `@ckeditor/*` entry imports.
					...existsSync( resolve( packageDir, 'theme', 'index.css' ) ) ?
						[ resolve( packageDir, 'theme', 'index.css' ) ] :
						[]
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

				coverage: {
					provider: 'v8',
					clean: true,
					reporter: [
						'text',
						// The per-file HTML report is useful locally but a waste of time in CI.
						...( process.env.CI ? [] : [ 'html' ] ),
						// The `projectRoot` option makes the lcov `SF:` paths relative to the
						// repository root instead of the package directory, so CI can concatenate
						// per-package reports into a single file consumable by coverage services.
						[ 'lcovonly', { projectRoot: resolve( packageDir, '..', '..' ) } ]
					] as NonNullable<TestOptions[ 'coverage' ]>[ 'reporter' ],
					include: [ 'src/**' ],
					// `mergeConfig()` concatenates arrays, so `coverage.exclude` entries passed by
					// a package configuration extend this list instead of replacing it.
					exclude: [
						'src/index.ts',
						'src/augmentation.ts',
						'src/legacyerrors.ts',
						'src/lib/**',
						'src/**/*config.ts'
					],
					thresholds: allowNonFullCoverage ? undefined : {
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
