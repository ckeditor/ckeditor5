/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { dirname, join } from 'node:path';
import { globSync, readFileSync } from 'node:fs';
import { findPackageJSON } from 'node:module';
import { pathToFileURL } from 'node:url';
import { parseSync } from 'oxc-parser';
import type { Plugin } from 'vite';

// CKEditor 5 packages: the `@ckeditor/ckeditor5-*` feature packages and the unscoped
// aggregates (`ckeditor5` and repository-specific `ckeditor5-*` bundles).
const CKEDITOR5_PACKAGE_PATTERN = /^((?:@ckeditor\/)?ckeditor5(?:-[^/]+)?)(?:\/|$)/;
const CROSS_PACKAGE_TESTS_SPECIFIER_PATTERN = /^@ckeditor\/ckeditor5-[^/]+\/tests\//;

interface PackageJsonFile {
	name: string;
	main?: string;
	dependencies?: Record<string, string>;
}

/**
 * Pre-bundles the CKEditor 5 dependencies used by a package's browser tests.
 */
export function prebundleDependencies( packageDir: string ): Plugin {
	return {
		name: 'ckeditor5-vitest-prebundle-dependencies',
		apply: 'serve',
		config: {
			order: 'pre',
			handler( config ) {
				const flag = process.env.CK_PREBUNDLE ?? process.env.CI;

				// Keep local watch sessions source-served by default, as optimized workspace
				// dependencies are refreshed only after restarting Vite.
				if ( !flag || [ '0', 'false' ].includes( flag.toLowerCase() ) ) {
					return;
				}

				const dependencies = collectPrebundledDependencies( packageDir, readPackageJson( packageDir ) );
				const exclude = new Set( [
					...dependencies.exclude,
					...( config.optimizeDeps?.exclude ?? [] )
				] );
				const include = new Set( [
					...( config.optimizeDeps?.include ?? [] ),
					...dependencies.include
				] );

				config.optimizeDeps = {
					...config.optimizeDeps,
					// Vite's optimize cache does not hash the (workspace-linked) dependencies' source,
					// so without re-optimizing on every run tests would silently use stale code.
					force: true,
					exclude: [ ...exclude ].sort(),
					include: [ ...include ]
						.filter( entry => !isExcluded( entry, exclude ) )
						.sort()
				};
			}
		}
	};
}

/**
 * Computes the `optimizeDeps` entries for the tested package.
 *
 * CKEditor 5 packages resolve to workspace-linked TypeScript source, which Vite serves module
 * by module unless pre-bundled explicitly. The include list must be complete upfront — anything
 * discovered only when the browser requests it triggers re-optimization and a mid-run page
 * reload. The graph starts with runtime imports found in the tested package's source and tests,
 * then follows the reachable CKEditor packages' runtime dependencies.
 */
export function collectPrebundledDependencies(
	packageDir: string,
	packageJson: PackageJsonFile
): { include: Array<string>; exclude: Array<string> } {
	const sourceImports = scanImports( join( packageDir, 'src' ) );
	const testImports = scanImports( join( packageDir, 'tests' ), [ '**/manual/**' ] );
	const queue = [ ...sourceImports, ...testImports ];
	const visited = new Set( [ packageJson.name ] );
	const entries = new Set<string>();

	// The iterator visits entries appended during the iteration, so the loop runs until no
	// dependency adds new names (the dependency graph is cyclic, hence the `visited` set).
	for ( const [ specifier, importerDir ] of queue ) {
		const name = CKEDITOR5_PACKAGE_PATTERN.exec( specifier )?.[ 1 ];

		if ( !name || visited.has( name ) ) {
			continue;
		}

		visited.add( name );

		const dependencyDir = resolvePackageDir( name, importerDir );
		const dependencyJson = dependencyDir && readPackageJson( dependencyDir );

		// Skip CKEditor 5 tooling that is not served as TypeScript source, for example
		// the `@ckeditor/ckeditor5-dev-*` development packages.
		if ( !dependencyJson || dependencyJson.main !== './src/index.ts' ) {
			continue;
		}

		entries.add( name );

		for ( const dependencyName of Object.keys( dependencyJson.dependencies ?? {} ) ) {
			queue.push( [ dependencyName, dependencyDir ] );
		}
	}

	const exclude = new Set( [ packageJson.name ] );

	for ( const [ specifier, importerDir ] of testImports ) {
		if ( CROSS_PACKAGE_TESTS_SPECIFIER_PATTERN.test( specifier ) && !specifier.startsWith( `${ packageJson.name }/` ) ) {
			entries.add( specifier );
			continue;
		}

		if ( specifier.startsWith( '.' ) ) {
			const importedPackageDir = resolvePackageDir( specifier, importerDir );
			const importedPackageName = importedPackageDir && readPackageJson( importedPackageDir ).name;

			if ( importedPackageName && entries.has( importedPackageName ) ) {
				exclude.add( importedPackageName );
			}
		}
	}

	// Vite's scanner does not crawl into source-served packages, so their bare third-party
	// imports (for example `es-toolkit/compat`) would only be discovered mid-run — pre-bundle
	// them upfront instead.
	for ( const excludedName of exclude ) {
		const excludedDir = excludedName === packageJson.name ?
			packageDir :
			resolvePackageDir( excludedName, packageDir );

		if ( !excludedDir ) {
			continue;
		}

		const imports = excludedName === packageJson.name ? sourceImports : scanImports( join( excludedDir, 'src' ) );

		for ( const [ specifier ] of imports ) {
			if (
				!specifier.startsWith( '.' ) &&
				!CKEDITOR5_PACKAGE_PATTERN.test( specifier ) &&
				!specifier.endsWith( '.css' ) &&
				resolvePackageDir( specifier, excludedDir )
			) {
				entries.add( specifier );
			}
		}
	}

	return {
		include: [ ...entries ].filter( entry => !isExcluded( entry, exclude ) ).sort(),
		exclude: [ ...exclude ].sort()
	};
}

function isExcluded( specifier: string, exclude: Set<string> ): boolean {
	return [ ...exclude ].some( name => specifier === name || specifier.startsWith( `${ name }/` ) );
}

function readPackageJson( packageDir: string ): PackageJsonFile {
	return JSON.parse( readFileSync( join( packageDir, 'package.json' ), 'utf-8' ) ) as PackageJsonFile;
}

/**
 * Resolves the directory of the package providing the specifier — from the importing package's
 * own directory, following the same workspace symlinks as module resolution at serve time —
 * or `null` when the specifier does not resolve.
 */
function resolvePackageDir( specifier: string, importerDir: string ): string | null {
	try {
		const packageJsonPath = findPackageJSON( specifier, pathToFileURL( join( importerDir, 'package.json' ) ) );

		return packageJsonPath ? dirname( packageJsonPath ) : null;
	} catch {
		return null;
	}
}

/**
 * Collects the `[ specifier, importerDir ]` pairs of all imports in the directory's JavaScript
 * and TypeScript modules, based on the ESM metadata returned by the `oxc` parser: static imports
 * and re-exports (except type-only ones) and dynamic `import()` calls with a literal argument.
 */
function scanImports( dir: string, exclude?: Array<string> ): Array<[ string, string ]> {
	const imports: Array<[ string, string ]> = [];

	for ( const filePath of globSync( '**/*.{js,ts}', { cwd: dir, exclude } ) ) {
		const importerDir = dirname( join( dir, filePath ) );
		const source = readFileSync( join( dir, filePath ), 'utf-8' );
		const result = parseSync( filePath, source );

		if ( result.errors.length ) {
			throw new Error( `Could not parse imports from "${ join( dir, filePath ) }": ${ result.errors[ 0 ].message }` );
		}

		const { staticImports, staticExports, dynamicImports } = result.module;

		for ( const { moduleRequest, entries } of staticImports ) {
			if ( !entries.length || entries.some( entry => !entry.isType ) ) {
				imports.push( [ moduleRequest.value, importerDir ] );
			}
		}

		for ( const { moduleRequest, isType } of staticExports.flatMap( staticExport => staticExport.entries ) ) {
			if ( moduleRequest && !isType ) {
				imports.push( [ moduleRequest.value, importerDir ] );
			}
		}

		for ( const { moduleRequest } of dynamicImports ) {
			const literalMatch = source.slice( moduleRequest.start, moduleRequest.end ).match( /^['"`]([^'"`$]+)['"`]$/ );

			if ( literalMatch ) {
				imports.push( [ literalMatch[ 1 ], importerDir ] );
			}
		}
	}

	return imports;
}
