/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const fs = require( 'fs-extra' );
const upath = require( 'upath' );

/**
 * @param {Boolean} isNightly
 * @returns {Object}
 */
module.exports = function getCKEditor5PackageJson() {
	const pkgJson = fs.readJsonSync(
		upath.join( __dirname, '..', '..', '..', 'package.json' )
	);

	return {
		name: pkgJson.name,
		version: pkgJson.version,
		keywords: pkgJson.keywords,
		description: 'A set of ready-to-use rich text editors created with a powerful framework.' +
			' Made with real-time collaborative editing in mind.',
		type: 'module',
		main: 'dist/ckeditor5.js',
		module: 'dist/ckeditor5.js',
		types: 'dist/types/index.d.ts',
		exports: {
			'.': {
				'types': './dist/types/index.d.ts',
				'import': './dist/ckeditor5.js'
			},
			'./translations/*.js': {
				'types': './dist/translations/*.d.ts',
				'import': './dist/translations/*.js'
			},
			'./*.css': './dist/*.css',
			'./build/*': './build/*',
			'./src/*': './src/*',
			'./package.json': './package.json'
		},
		dependencies: pkgJson.dependencies,
		engines: pkgJson.engines,
		author: pkgJson.author,
		license: pkgJson.license,
		homepage: pkgJson.homepage,
		bugs: pkgJson.bugs,
		repository: pkgJson.repository,
		files: [
			// Do not add the entire `build/` directory as it contains files produced by internal scripts:
			// automated/manual tests, translations, documentation, content styles.
			// If you need to release anything from the directory, insert a relative path to the file/directory.
			'dist',
			'src/*.js',
			'src/*.d.ts',
			'build/ckeditor5-dll.js',
			'build/ckeditor5-dll.manifest.json',
			'build/translations/*.js',
			// npm default files.
			'CHANGELOG.md',
			'LICENSE.md',
			'README.md'
		]
	};
};
