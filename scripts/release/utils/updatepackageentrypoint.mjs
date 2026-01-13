/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @param {String} packagePath
 * @returns {Promise}
 */
export default async function updatePackageEntryPoint( packagePath ) {
	const { default: fs } = await import( 'fs-extra' );
	const { default: path } = await import( 'upath' );

	const packageJsonPath = path.join( packagePath, 'package.json' );
	const pkgJson = await fs.readJson( packageJsonPath );

	if ( pkgJson.name === 'ckeditor5' ) {
		pkgJson.exports = {
			'.': {
				'types': './dist/index.d.ts',
				'import': './dist/ckeditor5.js'
			},
			'./*': './dist/*',
			'./browser/*': null,
			'./package.json': './package.json'
		};

		pkgJson.types = 'dist/index.d.ts';

		return fs.writeJson( packageJsonPath, pkgJson );
	}

	if ( !isTypeScriptPackage( packagePath, pkgJson ) ) {
		return;
	}

	const main = pkgJson.main.replace( /src\/index/, 'dist/index' ).replace( /\.ts$/, '.js' );
	const types = pkgJson.main.replace( /src\/index/, 'dist/index' ).replace( /\.ts$/, '.d.ts' );
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
			types: './' + types,
			import: './dist/*',
			default: './dist/*'
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
	function isTypeScriptPackage( packagePath, pkgJson ) {
		// Almost all CKEditor 5 packages define an entry point. When it points to a TypeScript file,
		// the package is written in TS.
		if ( pkgJson.main ) {
			return pkgJson.main.includes( '.ts' );
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

