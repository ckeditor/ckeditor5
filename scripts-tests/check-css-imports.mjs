/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock( 'fs-extra' );
vi.mock( 'glob' );

vi.mock( 'chalk', () => {
	const passthrough = text => text;

	passthrough.bold = passthrough;

	return {
		default: {
			red: passthrough,
			green: passthrough
		}
	};
} );

describe( 'scripts/check-css-imports', () => {
	let fs, glob;

	beforeEach( async () => {
		vi.resetModules();

		fs = await import( 'fs-extra' );
		glob = await import( 'glob' );

		vi.spyOn( process, 'cwd' ).mockReturnValue( '/repo' );
		vi.spyOn( console, 'log' ).mockImplementation( () => {} );
		vi.spyOn( process, 'exit' ).mockImplementation( () => {} );
	} );

	function setupPackage( { packageName = 'ckeditor5-example', themeFiles = [], cssContents = {}, indexContent, sideEffects } = {} ) {
		const packageDir = `/repo/packages/${ packageName }`;

		vi.mocked( fs.default.readJsonSync ).mockImplementation( path => {
			if ( path === `${ packageDir }/package.json` ) {
				return sideEffects === undefined ? {} : { sideEffects };
			}

			throw new Error( `Unexpected JSON read: ${ path }` );
		} );

		// Resolve the stylesheet map keys the same way the tested script resolves `@import` targets.
		const resolvePath = file => file.startsWith( '../' ) ?
			`${ packageDir }/${ file.slice( 3 ) }` :
			`${ packageDir }/theme/${ file }`;

		vi.mocked( glob.globSync ).mockImplementation( pattern => {
			if ( pattern.endsWith( 'package.json' ) ) {
				return [ `${ packageDir }/package.json` ];
			}

			return themeFiles.map( file => `${ packageDir }/theme/${ file }` );
		} );

		vi.mocked( fs.default.existsSync ).mockImplementation( path => {
			if ( path === `${ packageDir }/theme/index.css` ) {
				return 'index.css' in cssContents;
			}

			if ( path === `${ packageDir }/src/index.ts` ) {
				return indexContent !== undefined;
			}

			return Object.keys( cssContents ).some( file => path === resolvePath( file ) );
		} );

		vi.mocked( fs.default.readFileSync ).mockImplementation( path => {
			if ( path === `${ packageDir }/src/index.ts` ) {
				return indexContent;
			}

			const file = Object.keys( cssContents ).find( file => path === resolvePath( file ) );

			if ( file === undefined ) {
				throw new Error( `Unexpected file read: ${ path }` );
			}

			return cssContents[ file ];
		} );
	}

	const VALID_INDEX_TS = 'export { Example } from \'./example.js\';\n\nimport \'../theme/index.css\';\n';

	it( 'should pass when all theme stylesheets are reachable from the entry point', async () => {
		setupPackage( {
			themeFiles: [ 'index.css', 'example.css', 'nested/other.css' ],
			cssContents: {
				'index.css': '@import "./example.css";\n@import "./nested/other.css";\n',
				'example.css': '.ck {}',
				'nested/other.css': '.ck {}'
			},
			indexContent: VALID_INDEX_TS
		} );

		await import( '../scripts/check-css-imports.mjs' );

		expect( process.exit ).not.toHaveBeenCalled();
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining( 'All package stylesheets are imported' ) );
	} );

	it( 'should pass for a package without theme stylesheets', async () => {
		setupPackage( { themeFiles: [] } );

		await import( '../scripts/check-css-imports.mjs' );

		expect( process.exit ).not.toHaveBeenCalled();
	} );

	it( 'should follow imports through nested stylesheets', async () => {
		setupPackage( {
			themeFiles: [ 'index.css', 'example.css', 'nested/other.css' ],
			cssContents: {
				'index.css': '@import "./example.css";\n',
				'example.css': '@import "./nested/other.css";\n.ck {}',
				'nested/other.css': '.ck {}'
			},
			indexContent: VALID_INDEX_TS
		} );

		await import( '../scripts/check-css-imports.mjs' );

		expect( process.exit ).not.toHaveBeenCalled();
	} );

	it( 'should support single-quoted and url() import forms', async () => {
		setupPackage( {
			themeFiles: [ 'index.css', 'single.css', 'url.css' ],
			cssContents: {
				'index.css': '@import \'./single.css\';\n@import url("./url.css");\n',
				'single.css': '.ck {}',
				'url.css': '.ck {}'
			},
			indexContent: VALID_INDEX_TS
		} );

		await import( '../scripts/check-css-imports.mjs' );

		expect( process.exit ).not.toHaveBeenCalled();
	} );

	it( 'should ignore commented-out imports', async () => {
		setupPackage( {
			themeFiles: [ 'index.css', 'example.css' ],
			cssContents: {
				'index.css': '/* @import "./missing.css"; */\n@import "./example.css";\n',
				'example.css': '.ck {}'
			},
			indexContent: VALID_INDEX_TS
		} );

		await import( '../scripts/check-css-imports.mjs' );

		expect( process.exit ).not.toHaveBeenCalled();
	} );

	it( 'should tolerate bare import specifiers pointing to other packages', async () => {
		setupPackage( {
			themeFiles: [ 'index.css', 'example.css' ],
			cssContents: {
				'index.css': '@import "@example/other-package/styles.css";\n@import "./example.css";\n',
				'example.css': '.ck {}'
			},
			indexContent: VALID_INDEX_TS
		} );

		await import( '../scripts/check-css-imports.mjs' );

		expect( process.exit ).not.toHaveBeenCalled();
	} );

	it( 'should fail when the entry point is missing', async () => {
		setupPackage( {
			themeFiles: [ 'example.css' ],
			cssContents: {
				'example.css': '.ck {}'
			},
			indexContent: VALID_INDEX_TS
		} );

		await import( '../scripts/check-css-imports.mjs' );

		expect( process.exit ).toHaveBeenCalledWith( 1 );
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining( 'missing the "theme/index.css" entry point' ) );
	} );

	it( 'should fail when a theme stylesheet is not reachable from the entry point', async () => {
		setupPackage( {
			themeFiles: [ 'index.css', 'example.css', 'orphan.css' ],
			cssContents: {
				'index.css': '@import "./example.css";\n',
				'example.css': '.ck {}',
				'orphan.css': '.ck {}'
			},
			indexContent: VALID_INDEX_TS
		} );

		await import( '../scripts/check-css-imports.mjs' );

		expect( process.exit ).toHaveBeenCalledWith( 1 );
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining( '"theme/orphan.css" is not imported in "theme/index.css"' ) );
	} );

	it( 'should fail when an import points to a non-existing file', async () => {
		setupPackage( {
			themeFiles: [ 'index.css', 'example.css' ],
			cssContents: {
				'index.css': '@import "./example.css";\n@import "./missing.css";\n',
				'example.css': '.ck {}'
			},
			indexContent: VALID_INDEX_TS
		} );

		await import( '../scripts/check-css-imports.mjs' );

		expect( process.exit ).toHaveBeenCalledWith( 1 );
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining( 'imports the non-existing file "./missing.css"' ) );
	} );

	it( 'should fail when an import escapes the theme directory', async () => {
		setupPackage( {
			themeFiles: [ 'index.css' ],
			cssContents: {
				'index.css': '@import "../src/example.css";\n',
				'../src/example.css': '.ck {}'
			},
			indexContent: VALID_INDEX_TS
		} );

		await import( '../scripts/check-css-imports.mjs' );

		expect( process.exit ).toHaveBeenCalledWith( 1 );
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining( 'from outside the "theme" directory' ) );
	} );

	it( 'should fail when "src/index.ts" does not import the entry point', async () => {
		setupPackage( {
			themeFiles: [ 'index.css', 'example.css' ],
			cssContents: {
				'index.css': '@import "./example.css";\n',
				'example.css': '.ck {}'
			},
			indexContent: 'export { Example } from \'./example.js\';\n'
		} );

		await import( '../scripts/check-css-imports.mjs' );

		expect( process.exit ).toHaveBeenCalledWith( 1 );
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining( '"src/index.ts" does not import "../theme/index.css"' ) );
	} );

	it( 'should not treat a commented-out entry point import in "src/index.ts" as valid', async () => {
		setupPackage( {
			themeFiles: [ 'index.css', 'example.css' ],
			cssContents: {
				'index.css': '@import "./example.css";\n',
				'example.css': '.ck {}'
			},
			indexContent: '/* import \'../theme/index.css\'; */\nexport { Example } from \'./example.js\';\n'
		} );

		await import( '../scripts/check-css-imports.mjs' );

		expect( process.exit ).toHaveBeenCalledWith( 1 );
	} );

	it( 'should pass when the "sideEffects" list includes the package entry point', async () => {
		setupPackage( {
			themeFiles: [ 'index.css', 'example.css' ],
			cssContents: {
				'index.css': '@import "./example.css";\n',
				'example.css': '.ck {}'
			},
			indexContent: VALID_INDEX_TS,
			sideEffects: [ '*.css', 'src/index.ts' ]
		} );

		await import( '../scripts/check-css-imports.mjs' );

		expect( process.exit ).not.toHaveBeenCalled();
	} );

	it( 'should fail when the "sideEffects" list does not include the package entry point', async () => {
		setupPackage( {
			themeFiles: [ 'index.css', 'example.css' ],
			cssContents: {
				'index.css': '@import "./example.css";\n',
				'example.css': '.ck {}'
			},
			indexContent: VALID_INDEX_TS,
			sideEffects: [ '*.css' ]
		} );

		await import( '../scripts/check-css-imports.mjs' );

		expect( process.exit ).toHaveBeenCalledWith( 1 );
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining( 'must include "src/index.ts"' ) );
	} );

	it( 'should fail when the "sideEffects" field disables all side effects', async () => {
		setupPackage( {
			themeFiles: [ 'index.css', 'example.css' ],
			cssContents: {
				'index.css': '@import "./example.css";\n',
				'example.css': '.ck {}'
			},
			indexContent: VALID_INDEX_TS,
			sideEffects: false
		} );

		await import( '../scripts/check-css-imports.mjs' );

		expect( process.exit ).toHaveBeenCalledWith( 1 );
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining( 'must not disable' ) );
	} );
} );
