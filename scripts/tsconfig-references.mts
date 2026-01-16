#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * Syncs project references in package tsconfig files with workspace dependencies.
 *
 * Usage:
 *     pnpm run tsconfig:references
 *     pnpm run tsconfig:references --check
 */

import { readFile, writeFile, glob } from 'node:fs/promises';
import { join, dirname, relative, sep } from 'node:path';
import { styleText } from 'node:util';
import { PACKAGES_DIRECTORY } from './release/utils/constants.mjs';

interface PackageJson {
	name: string;
	dependencies?: Record<string, string>;
}

interface PackageInfo {
	packageDir: string;
	packageJson: PackageJson;
	tsconfig: Record<string, any>;
}

const cwd = process.cwd();
const check = process.argv.includes( '--check' ) || process.argv.includes( '--check-only' );
const packages = await getPackages();
const packageMap = new Map( packages.map( pkg => [ pkg.packageJson.name, pkg ] ) );
const results = await Promise.all( packages.map( pkg => syncPackageReferences( pkg, packageMap, check ) ) );
const rootResult = await syncRootReferences( packages, check );
const changedConfigs = [ ...results, rootResult ].filter( result => result.changed );

reportResults( changedConfigs, check );

/**
 * Gets all workspace packages with their tsconfig paths.
 */
async function getPackages(): Promise<Array<PackageInfo>> {
	const patterns = [
		join(cwd, PACKAGES_DIRECTORY, '*', 'tsconfig.json'),
		join(cwd, 'external', '*', PACKAGES_DIRECTORY, '*', 'tsconfig.json')
	];
	// @ts-ignore
	const tsconfigPaths: Array<string> = await Array.fromAsync( glob( patterns ) );

	return Promise.all( tsconfigPaths.map( async tsconfigPath => {
		const packageDir = dirname( tsconfigPath );
		const packageJsonPath = join( packageDir, 'package.json' );
		const packageJson = await readJson(packageJsonPath);
		const tsconfig = await readJson( tsconfigPath );

		return {
			packageDir,
			packageJson,
			tsconfig
		} satisfies PackageInfo;
	} ) );
}

/**
 * Syncs the `references` field in the package tsconfig file.
 */
async function syncPackageReferences( pkg: PackageInfo, packageMap: Map<string, PackageInfo>, checkOnly: boolean ) {
	const references = collectReferences( pkg, packageMap );
	const updatedConfig = { ...pkg.tsconfig };

	if ( references.length ) {
		updatedConfig.references = references;
	} else {
		delete updatedConfig.references;
	}

	return syncConfig( {
		name: pkg.packageJson.name,
		packageDir: pkg.packageDir,
		updatedConfig,
		checkOnly
	} );
}

/**
 * Syncs the `references` field in the root tsconfig file.
 */
async function syncRootReferences( packages: Array<PackageInfo>, checkOnly: boolean ) {
	const references = packages
		.slice()
		.sort( ( first, second ) => first.packageJson.name.localeCompare( second.packageJson.name ) )
		.map( pkg => ( {
			path: normalizeReferencePath( relative( cwd, pkg.packageDir ) )
		} ) );

	const tsconfigPath = join( cwd, 'tsconfig.json' );
	const tsconfig = await readJson( tsconfigPath );
	const updatedConfig = {
		...tsconfig,
		files: tsconfig.files ?? [],
		references
	};

	return syncConfig( {
		name: 'tsconfig.json',
		packageDir: cwd,
		updatedConfig,
		checkOnly
	} );
}

/**
 * Updates the tsconfig.json file with the provided configuration.
 */
async function syncConfig( { name, packageDir, updatedConfig, checkOnly }: {
	name: string;
	packageDir: string;
	updatedConfig: Record<string, unknown> & { references?: Array<{ path: string }> };
	checkOnly: boolean;
}) {
	const configPath = join( packageDir, 'tsconfig.json' );
	const updatedContent = formatTsconfig( updatedConfig );
	const currentContent = await readFile( configPath, 'utf-8' );
	const changed = currentContent !== updatedContent;

	if ( changed && !checkOnly ) {
		await writeFile( configPath, updatedContent, 'utf-8' );
	}

	return {
		name,
		changed
	};
}

/**
 * Collects workspace package dependencies to be used as project references.
 */
function collectReferences( pkg: PackageInfo, packageMap: Map<string, PackageInfo> ) {
	return Object
		.keys(pkg.packageJson.dependencies || {})
		.filter( dependencyName => dependencyName !== pkg.packageJson.name && packageMap.has( dependencyName ) )
		.sort( ( first, second ) => first.localeCompare( second ) )
		.map( dependencyName => {
			const dependency = packageMap.get( dependencyName );

			return {
				path: normalizeReferencePath( relative( pkg.packageDir, dependency!.packageDir ) )
			};
		} );
}

/**
 * Ensures the reference path is relative and uses forward slashes.
 */
function normalizeReferencePath( referencePath: string ) {
	const normalizedPath = referencePath.split(sep).join('/');

	return normalizedPath.startsWith( '.' ) ? normalizedPath : `./${ normalizedPath }`;
}

/**
 * Formats the tsconfig.json content with inlined references.
 */
function formatTsconfig( config: Record<string, unknown> ) {
	let output = JSON.stringify( config, null, '\t' ) + '\n';

	// Inline `references` entries: { "path": "..." }
	return output.replaceAll( /\{\s*"path":\s*"(.*?)"\s*\}/g, '{ "path": "$1" }' );
}

/**
 * Reports the results to the console.
 */
function reportResults( changedPackages: Array<{ name: string; changed: boolean }>, checkOnly: boolean ) {
	if ( checkOnly ) {
		if ( changedPackages.length ) {
			console.log( styleText( 'red', 'Detected out-of-date package tsconfig references:' ) );
			changedPackages.forEach( result => console.log( `- ${ result.name }` ) );
			process.exit( 1 );
		}

		console.log( styleText( 'green', 'All package tsconfig references are up to date.' ) );
		return;
	}

	if ( !changedPackages.length ) {
		console.log( styleText( 'green', 'All package tsconfig references are already up to date.' ) );
		return;
	}

	console.log( styleText( 'green', `Updated ${ changedPackages.length } package tsconfig(s).` ) );
}

/**
 * Reads and parses a JSON file.
 */
async function readJson(filePath: string): Promise<any> {
	return JSON.parse( await readFile( filePath, 'utf-8' ) );
}
