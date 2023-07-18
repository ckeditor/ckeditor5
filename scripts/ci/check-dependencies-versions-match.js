#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

// This script ensures that all "dependencies" in package JSONs listed below, use the same versions of
// dependencies. It also checks that all versions and are pinned, and they don't use the caret operator "^".
// If you provide "--fix" argument, the script will automatically fix the errors for you.

const semver = require( 'semver' );
const { globSync } = require( 'glob' );
const fs = require( 'fs-extra' );

const shouldFix = process.argv[ 2 ] === '--fix';
const [ packageJsons, pathMappings ] = getPackageJsons( [
	'package.json',
	'packages/*/package.json',
	'external/ckeditor5-internal/packages/*/package.json',
	'external/ckeditor5-internal/package.json',
	'external/collaboration-features/packages/*/package.json',
	'external/collaboration-features/package.json'
] );

const expectedDependencies = getExpectedDepsVersions( packageJsons );

if ( shouldFix ) {
	fixDependenciesVersions( expectedDependencies, packageJsons, pathMappings );
} else {
	checkDependenciesMatch( expectedDependencies, packageJsons );
}

/**
 * @param {Object.<String, String>} expectedDependencies
 * @param {Array.<Object>} packageJsons
 * @param {Object.<String, String>} pathMappings
 */
function fixDependenciesVersions( expectedDependencies, packageJsons, pathMappings ) {
	packageJsons
		.filter( packageJson => packageJson.dependencies )
		.forEach( packageJson => {
			Object.entries( packageJson.dependencies )
				.forEach( ( [ dependency, version ] ) => {
					if ( version !== expectedDependencies[ dependency ] ) {
						packageJson.dependencies[ dependency ] = expectedDependencies[ dependency ];
					}
				} );

			fs.writeJsonSync( pathMappings[ packageJson.name ], packageJson, { spaces: 2 } );
		} );
}

/**
 * @param {Object.<String, String>} expectedDependencies
 * @param {Array.<Object>} packageJsons
 */
function checkDependenciesMatch( expectedDependencies, packageJsons ) {
	const errors = packageJsons
		.filter( packageJson => packageJson.dependencies )
		.flatMap( packageJson => Object.entries( packageJson.dependencies )
			.map( ( [ dependency, version ] ) => {
				if ( version !== expectedDependencies[ dependency ] ) {
					return getWrongVersionErrorMsg( dependency, packageJson.name, version, expectedDependencies );
				}
			} )
			.filter( Boolean )
		);

	if ( errors.length ) {
		console.error( errors );
		process.exit( 1 );
	}
}

/**
 * @param {String} dependency
 * @param {String} name
 * @param {String} version
 * @param {Object.<String, String>} expectedDependencies
 * @return {String}
 */
function getWrongVersionErrorMsg( dependency, name, version, expectedDependencies ) {
	return `"${ dependency }" in "${ name }" in version "${ version }" should be set to "${ expectedDependencies[ dependency ] }".`;
}

/**
 * @param {Array.<Object>} packageJsons
 * @return {Object.<String, String>} expectedDependencies
 */
function getExpectedDepsVersions( packageJsons ) {
	return packageJsons
		.map( packageJson => packageJson.dependencies )
		.filter( Boolean )
		.reduce( ( expectedDependencies, dependencies ) => {
			Object.entries( dependencies ).forEach( ( [ dependency, version ] ) => {
				expectedDependencies[ dependency ] = getNewestVersion( version, expectedDependencies[ dependency ] );
			} );

			return expectedDependencies;
		}, {} );
}

/**
 * @param {String|undefined} versionA
 * @param {String|undefined} versionB
 * @return {String}
 */
function getNewestVersion( versionA, versionB ) {
	const versionAStripped = semver.valid( semver.coerce( versionA ) ) || '0.0.0';
	const versionBStripped = semver.valid( semver.coerce( versionB ) ) || '0.0.0';

	return semver.gt( versionAStripped, versionBStripped ) ? versionAStripped : versionBStripped;
}

/**
 * @param {Array.<String>} directories
 * @return {[Array.<Object>, Object.<String, String>]}
 */
function getPackageJsons( directories ) {
	const packageJsonPaths = globSync( directories, { absolute: true } );
	const packageJsons = packageJsonPaths.map( packageJsonPath => require( packageJsonPath ) );
	const nameToPathMappings = packageJsonPaths
		.reduce( ( accum, packageJsonPath ) => ( { ...accum, [ require( packageJsonPath ).name ]: packageJsonPath } ), {} );

	return [ packageJsons, nameToPathMappings ];
}
