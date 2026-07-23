/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock( 'node:fs' );

describe( 'scripts/check-css-imports', () => {
	let fs;

	beforeEach( async () => {
		vi.resetModules();

		fs = await import( 'node:fs' );

		vi.spyOn( process, 'cwd' ).mockReturnValue( '/repo' );
		vi.spyOn( console, 'log' ).mockImplementation( () => {} );
		vi.spyOn( process, 'exit' ).mockImplementation( () => {} );
	} );

	function setupPackage( {
		packageName = 'ckeditor5-example',
		themeFiles = [],
		cssContents = {},
		indexContent,
		sideEffects
	} = {} ) {
		const packageDir = `/repo/packages/${ packageName }`;

		const resolvePath = file => file.startsWith( '../' ) ?
			`${ packageDir }/${ file.slice( 3 ) }` :
			`${ packageDir }/theme/${ file }`;

		vi.mocked( fs.globSync ).mockImplementation( pattern => {
			if ( pattern.endsWith( 'package.json' ) ) {
				return [ `${ packageDir }/package.json` ];
			}

			return themeFiles.map( file => `${ packageDir }/theme/${ file }` );
		} );

		vi.mocked( fs.existsSync ).mockImplementation( path => {
			if ( path === `${ packageDir }/src/index.ts` ) {
				return indexContent !== undefined;
			}

			return Object.keys( cssContents ).some( file => path === resolvePath( file ) );
		} );

		vi.mocked( fs.readFileSync ).mockImplementation( path => {
			if ( path === `${ packageDir }/package.json` ) {
				return JSON.stringify( sideEffects === undefined ? {} : { sideEffects } );
			}

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

	const VALID_INDEX_TS = [
		'export { Example } from \'./example.js\';',
		'',
		'import \'../theme/index-editor.css\';',
		'import \'../theme/index-content.css\';',
		''
	].join( '\n' );

	it( 'passes when each theme stylesheet is reachable from exactly one entry point', async () => {
		setupPackage( {
			themeFiles: [ 'index-editor.css', 'index-content.css', 'editor.css', 'content.css', 'nested/content.css' ],
			cssContents: {
				'index-editor.css': '@import "./editor.css";\n',
				'index-content.css': '@import url("./content.css");\n',
				'editor.css': '.ck-editor {}',
				'content.css': '@import \'./nested/content.css\';\n.ck-content {}',
				'nested/content.css': '.ck-content p {}'
			},
			indexContent: VALID_INDEX_TS
		} );

		await import( '../scripts/check-css-imports.mjs' );

		expect( process.exit ).not.toHaveBeenCalled();
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining( 'exactly one CSS entry point' ) );
	} );

	it( 'passes for a package without theme stylesheets', async () => {
		setupPackage();

		await import( '../scripts/check-css-imports.mjs' );

		expect( process.exit ).not.toHaveBeenCalled();
	} );

	it( 'allows a flat content entry point', async () => {
		setupPackage( {
			themeFiles: [ 'index-editor.css', 'index-content.css', 'feature.css' ],
			cssContents: {
				'index-editor.css': '@import "./feature.css";',
				'index-content.css': '.ck-content {}',
				'feature.css': '.ck-content {}'
			},
			indexContent: VALID_INDEX_TS
		} );

		await import( '../scripts/check-css-imports.mjs' );

		expect( process.exit ).not.toHaveBeenCalled();
	} );

	it( 'allows bare imports of stylesheets from other packages', async () => {
		setupPackage( {
			themeFiles: [ 'index-editor.css', 'index-content.css', 'feature.css' ],
			cssContents: {
				'index-editor.css': '@import "@ckeditor/ckeditor5-ui/theme/index-editor.css";\n@import "./feature.css";',
				'index-content.css': '',
				'feature.css': '.ck {}'
			},
			indexContent: VALID_INDEX_TS
		} );

		await import( '../scripts/check-css-imports.mjs' );

		expect( process.exit ).not.toHaveBeenCalled();
	} );

	it( 'rejects bare imports from the content entry point', async () => {
		setupPackage( {
			themeFiles: [ 'index-editor.css', 'index-content.css' ],
			cssContents: {
				'index-editor.css': '',
				'index-content.css': '@import "@ckeditor/ckeditor5-ui/theme/index-content.css";'
			},
			indexContent: VALID_INDEX_TS
		} );

		await import( '../scripts/check-css-imports.mjs' );

		expect( process.exit ).toHaveBeenCalledWith( 1 );
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining( 'content styles must not import' ) );
	} );

	it( 'rejects an unsupported @import', async () => {
		setupPackage( {
			themeFiles: [ 'index-editor.css', 'index-content.css' ],
			cssContents: {
				'index-editor.css': '@import foo;',
				'index-content.css': ''
			},
			indexContent: VALID_INDEX_TS
		} );

		await import( '../scripts/check-css-imports.mjs' );

		expect( process.exit ).toHaveBeenCalledWith( 1 );
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining( 'contains an unsupported @import: "foo"' ) );
	} );

	it.each( [ 'index-editor.css', 'index-content.css' ] )( 'fails when %s is missing', async missingEntry => {
		const existingEntry = missingEntry === 'index-editor.css' ? 'index-content.css' : 'index-editor.css';

		setupPackage( {
			themeFiles: [ existingEntry, 'feature.css' ],
			cssContents: {
				[ existingEntry ]: '@import "./feature.css";',
				'feature.css': '.ck {}'
			},
			indexContent: VALID_INDEX_TS
		} );

		await import( '../scripts/check-css-imports.mjs' );

		expect( process.exit ).toHaveBeenCalledWith( 1 );
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining( `missing the "theme/${ missingEntry }"` ) );
	} );

	it( 'fails when a stylesheet is unreachable', async () => {
		setupPackage( {
			themeFiles: [ 'index-editor.css', 'index-content.css', 'orphan.css' ],
			cssContents: {
				'index-editor.css': '',
				'index-content.css': '',
				'orphan.css': '.ck {}'
			},
			indexContent: VALID_INDEX_TS
		} );

		await import( '../scripts/check-css-imports.mjs' );

		expect( process.exit ).toHaveBeenCalledWith( 1 );
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining( '"theme/orphan.css" is not imported' ) );
	} );

	it( 'fails when a stylesheet is reachable from both entry points', async () => {
		setupPackage( {
			themeFiles: [ 'index-editor.css', 'index-content.css', 'shared.css' ],
			cssContents: {
				'index-editor.css': '@import "./shared.css";',
				'index-content.css': '@import "./shared.css";',
				'shared.css': '.ck {}'
			},
			indexContent: VALID_INDEX_TS
		} );

		await import( '../scripts/check-css-imports.mjs' );

		expect( process.exit ).toHaveBeenCalledWith( 1 );
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining( 'imported by both theme entry points' ) );
	} );

	it( 'fails when entry points import one another', async () => {
		setupPackage( {
			themeFiles: [ 'index-editor.css', 'index-content.css' ],
			cssContents: {
				'index-editor.css': '@import "./index-content.css";',
				'index-content.css': ''
			},
			indexContent: VALID_INDEX_TS
		} );

		await import( '../scripts/check-css-imports.mjs' );

		expect( process.exit ).toHaveBeenCalledWith( 1 );
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining( 'must not import "theme/index-content.css"' ) );
	} );

	it( 'fails for missing and outside-theme imports', async () => {
		setupPackage( {
			themeFiles: [ 'index-editor.css', 'index-content.css' ],
			cssContents: {
				'index-editor.css': '@import "./missing.css";\n@import "../src/outside.css";',
				'index-content.css': '',
				'../src/outside.css': '.ck {}'
			},
			indexContent: VALID_INDEX_TS
		} );

		await import( '../scripts/check-css-imports.mjs' );

		expect( process.exit ).toHaveBeenCalledWith( 1 );
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining( 'non-existing file "./missing.css"' ) );
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining( 'from outside the "theme" directory' ) );
	} );

	it.each( [ 'index-editor.css', 'index-content.css' ] )( 'requires the %s import in src/index.ts', async missingImport => {
		setupPackage( {
			themeFiles: [ 'index-editor.css', 'index-content.css' ],
			cssContents: {
				'index-editor.css': '',
				'index-content.css': ''
			},
			indexContent: VALID_INDEX_TS.replace( `import '../theme/${ missingImport }';\n`, '' )
		} );

		await import( '../scripts/check-css-imports.mjs' );

		expect( process.exit ).toHaveBeenCalledWith( 1 );
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining( `does not import "../theme/${ missingImport }"` ) );
	} );

	it( 'ignores commented-out imports in CSS and TypeScript', async () => {
		setupPackage( {
			themeFiles: [ 'index-editor.css', 'index-content.css', 'feature.css' ],
			cssContents: {
				'index-editor.css': '/* @import "./missing.css"; */\n@import "./feature.css";',
				'index-content.css': '',
				'feature.css': '.ck {}'
			},
			indexContent: '/*\nimport \'../theme/index-content.css\';\n*/\nimport \'../theme/index-editor.css\';\n'
		} );

		await import( '../scripts/check-css-imports.mjs' );

		expect( process.exit ).toHaveBeenCalledWith( 1 );
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining( 'does not import "../theme/index-content.css"' ) );
	} );

	it( 'validates the package sideEffects metadata', async () => {
		setupPackage( {
			themeFiles: [ 'index-editor.css', 'index-content.css' ],
			cssContents: {
				'index-editor.css': '',
				'index-content.css': ''
			},
			indexContent: VALID_INDEX_TS,
			sideEffects: [ '*.css' ]
		} );

		await import( '../scripts/check-css-imports.mjs' );

		expect( process.exit ).toHaveBeenCalledWith( 1 );
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining( 'must include "src/index.ts"' ) );
	} );

	it( 'rejects package metadata that disables all side effects', async () => {
		setupPackage( {
			themeFiles: [ 'index-editor.css', 'index-content.css' ],
			cssContents: {
				'index-editor.css': '',
				'index-content.css': ''
			},
			indexContent: VALID_INDEX_TS,
			sideEffects: false
		} );

		await import( '../scripts/check-css-imports.mjs' );

		expect( process.exit ).toHaveBeenCalledWith( 1 );
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining( 'must not disable' ) );
	} );
} );
