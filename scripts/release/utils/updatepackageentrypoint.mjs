/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @param {String} packagePath
 * @returns {Promise}
 */
export default async function updatePackageEntryPoint( packagePath ) {
	const { default: fs } = await import( 'fs-extra' );
	const { default: path } = await import( 'upath' );

	if ( !( await isTypeScriptPackage( packagePath ) ) ) {
		return;
	}

	const packageJsonPath = path.join( packagePath, 'package.json' );
	const pkgJson = await fs.readJson( packageJsonPath );
	const main = pkgJson.main.replace( /\.ts$/, '.js' );
	const types = pkgJson.main.replace( /\.ts$/, '.d.ts' );
	const files = pkgJson.files || [];

	pkgJson.main = main;
	pkgJson.types = types;

	pkgJson.exports = {
		'.': {
			types: './' + types,
			import: './' + main,
			default: './' + main
		},
		'./dist/*': {
			/**
			 * To avoid problems caused by having two different copies of the declaration
			 * files, the new installation methods will temporarily use those from the
			 * old installation methods. Once the old methods are removed, the declaration
			 * files will be moved to the `dist` directory.
			 */
			types: './' + types,
			import: './dist/*',
			default: './dist/*'
		},
		'./src/*': {
			types: './src/*.d.ts',
			import: './src/*',
			default: './src/*'
		}
	};

	if ( files.includes( 'build' ) ) {
		pkgJson.exports[ './build/*' ] = './build/*';
	}

	if ( await checkPathExists( path.join( packagePath, 'lang' ) ) ) {
		pkgJson.exports[ './lang/*' ] = './lang/*';
	}

	if ( await checkPathExists( path.join( packagePath, 'theme' ) ) ) {
		pkgJson.exports[ './theme/*' ] = './theme/*';
	}

	if ( files.includes( 'ckeditor5-metadata.json' ) ) {
		pkgJson.exports[ './ckeditor5-metadata.json' ] = './ckeditor5-metadata.json';
	}

	pkgJson.exports[ './package.json' ] = './package.json';

	return fs.writeJson( packageJsonPath, pkgJson );

	/**
	 * @param {String} packagePath
	 * @returns {Promise.<Boolean>}
	 */
	async function isTypeScriptPackage( packagePath ) {
		const packageJsonPath = path.join( packagePath, 'package.json' );
		const packageJson = await fs.readJson( packageJsonPath );

		// Almost all CKEditor 5 packages define an entry point. When it points to a TypeScript file,
		// the package is written in TS.
		if ( packageJson.main ) {
			return packageJson.main.includes( '.ts' );
		}

		// Otherwise, let's check if the package contains a `tsconfig.json` file.
		return checkPathExists( path.join( packagePath, 'tsconfig.json' ) );
	}

	/**
	 * @param {String} file
	 * @returns {Promise.<Boolean>}
	 */
	function checkPathExists( file ) {
		return fs.access( file, fs.constants.F_OK )
			.then( () => true )
			.catch( () => false );
	}
}

