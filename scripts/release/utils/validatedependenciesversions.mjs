/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { glob } from 'glob';
import { readFile } from 'fs/promises';
import semver from 'semver';
import upath from 'upath';
import isCKEditor5PackageFactory from './isckeditor5packagefactory.mjs';

/**
 * Validates if the versions of packages and their dependencies in specified directory match the provided version.
 *
 * @param {Object} options
 * @param {String} options.packagesDirectory Path to directory with packages to validate.
 * @param {String} options.version Version that all packages and their dependencies need to match.
 * @param {Array.<String>} [options.skipPackages] Packages names that should not be validated.
 */
export default async function validateDependenciesVersions( { packagesDirectory, version, skipPackages = [] } ) {
	const normalizedReleaseDirectory = upath.normalizeTrim( packagesDirectory );
	const globPattern = `${ normalizedReleaseDirectory }/*/package.json`;
	const pkgJsonPaths = await glob( globPattern, { absolute: true, nodir: true } );

	const pkgJsons = await Promise.all(
		pkgJsonPaths.map( async pkgJsonPath => JSON.parse( await readFile( pkgJsonPath, 'utf8' ) ) )
	);

	const isCKEditor5Package = await isCKEditor5PackageFactory();

	const errors = pkgJsons
		.filter( pkgJson => !skipPackages.includes( pkgJson.name ) )
		.flatMap( pkgJson => ( [
			...validatePackageMatchVersion( version, pkgJson ),
			...validateDependenciesMatchVersion( version, pkgJson, skipPackages, isCKEditor5Package )
		] ) );

	if ( errors.length ) {
		const error = new Error( `Found version mismatches for specified packages (${ errors.length }).` );
		error.details = errors.slice( 0, 10 );

		if ( errors.length > 10 ) {
			error.details.push( `...${ errors.length - 10 } more item(s)` );
		}

		throw error;
	}
}

/**
 * @param {String} version
 * @param {Object} pkgJson
 * @returns {Array.<String>}
 */
function validatePackageMatchVersion( version, pkgJson ) {
	return pkgJson.version !== version ?
		[ `${ pkgJson.name }: package version is expected to be "${ version }", but is "${ pkgJson.version }".` ] :
		[];
}

/**
 * @param {String} version
 * @param {Object} pkgJson
 * @param {Array.<String>} skipPackages
 * @param {Function} isCKEditor5Package
 * @returns {Array.<String>}
 */
function validateDependenciesMatchVersion( version, pkgJson, skipPackages, isCKEditor5Package ) {
	const dependencies = pkgJson.dependencies || {};
	const devDependencies = pkgJson.devDependencies || {};
	const peerDependencies = pkgJson.peerDependencies || {};
	const allDependencies = { ...dependencies, ...devDependencies, ...peerDependencies };
	const ckeditor5Dependencies = Object.entries( allDependencies )
		.filter( ( [ depName ] ) => !skipPackages.includes( depName ) )
		.filter( ( [ depName ] ) => isCKEditor5Package( depName ) );

	return ckeditor5Dependencies.reduce( ( accum, [ depName, depVersion ] ) => {
		const semverMinVersion = semver.minVersion( depVersion ).version;

		return semverMinVersion !== version ?
			[ ...accum, `${ pkgJson.name }: "${ depName }" is expected to be "${ version }", but is "${ semverMinVersion }".` ] :
			accum;
	}, [] );
}
