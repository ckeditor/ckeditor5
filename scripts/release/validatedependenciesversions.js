#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const { sync } = require( 'glob' );
const fs = require( 'fs' );
const chalk = require( 'chalk' );
const semver = require( 'semver' );
const { normalizeTrim } = require( 'upath' );
const isCKEditor5Package = require( './isckeditor5package' );

/**
 * Validates if the versions of packages and their dependencies in specified directory match the provided version.
 *
 * @param {Object} options
 * @param {String} releaseDirectory Path to directory with packages to validate.
 * @param {String} options.version Version that all packages and their dependencies need to match.
 */
module.exports = function validateDependenciesVersions( { releaseDirectory, version } ) {
	const normalizedReleaseDirectory = normalizeTrim( releaseDirectory );
	const globPattern = `${ normalizedReleaseDirectory }/*/package.json`;
	const pkgJsonPaths = sync( globPattern, { absolute: true, nodir: true } );

	const errors = pkgJsonPaths.flatMap( pkgJsonPath => {
		const pkgJson = JSON.parse( fs.readFileSync( pkgJsonPath, 'utf8' ) );

		return [
			...validatePackageMatchVersion( version, pkgJson ),
			...validateDependenciesMatchVersion( version, pkgJson )
		];
	} );

	if ( errors.length ) {
		throw new Error( 'Found version mismatches for specified packages:\n' + errors.join( '\n' ) );
	}

	console.log( chalk.green.bold( '✨ All released packages\' versions and their dependencies are valid.' ) );
};

/**
 * @param {String} version
 * @param {Object} pkgJson
 * @returns {Array.<String>}
 */
function validatePackageMatchVersion( version, pkgJson ) {
	return pkgJson.version !== version ?
		[ `${ pkgJson.name }: Package version is expected to be ${ version }, but is ${ pkgJson.version }.` ] :
		[];
}

/**
 * @param {String} version
 * @param {Object} pkgJson
 * @returns {Array.<String>}
 */
function validateDependenciesMatchVersion( version, pkgJson ) {
	const dependencies = pkgJson.dependencies || {};
	const devDependencies = pkgJson.devDependencies || {};
	const peerDependencies = pkgJson.peerDependencies || {};
	const allDependencies = { ...dependencies, ...devDependencies, ...peerDependencies };
	const ckeditor5Dependencies = Object.entries( allDependencies )
		.filter( ( [ depName ] ) => isCKEditor5Package( depName ) );

	return ckeditor5Dependencies.reduce( ( accum, [ depName, depVersion ] ) => {
		const semverMinVersion = semver.minVersion( depVersion ).version;

		return semverMinVersion !== version ?
			[ ...accum, `${ pkgJson.name }: ${ depName } is expected to be ${ version }, but is ${ semverMinVersion }.` ] :
			accum;
	}, [] );
}
