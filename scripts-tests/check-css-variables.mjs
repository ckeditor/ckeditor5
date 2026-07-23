/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock( 'node:fs' );

describe( 'scripts/check-css-variables', () => {
	let fs, originalArgv;

	beforeEach( async () => {
		vi.resetModules();

		fs = await import( 'node:fs' );

		originalArgv = process.argv;
		process.argv = [ 'node', 'check-css-variables.mjs' ];

		vi.spyOn( process, 'cwd' ).mockReturnValue( '/repo' );
		vi.spyOn( console, 'log' ).mockImplementation( () => {} );
		vi.spyOn( process, 'exit' ).mockImplementation( () => {} );
	} );

	afterEach( () => {
		process.argv = originalArgv;
	} );

	// Registers the theme stylesheets of the primary (and optionally baseline) packages in the
	// mocked file system. Stylesheet paths are relative to the `theme` directory of a package.
	function setup( { packages = {}, baselinePackages = {} } = {} ) {
		const files = new Map();
		const packageDirs = { '/repo/packages': [], '/repo/external/packages': [] };

		for ( const [ packagesDir, packageSet ] of [
			[ '/repo/packages', packages ],
			[ '/repo/external/packages', baselinePackages ]
		] ) {
			for ( const [ packageName, themeFiles ] of Object.entries( packageSet ) ) {
				packageDirs[ packagesDir ].push( `${ packagesDir }/${ packageName }` );

				for ( const [ file, contents ] of Object.entries( themeFiles ) ) {
					files.set( `${ packagesDir }/${ packageName }/theme/${ file }`, contents );
				}
			}
		}

		vi.mocked( fs.globSync ).mockImplementation( pattern => {
			const packagesDir = Object.keys( packageDirs ).find( dir => pattern.startsWith( `${ dir }/` ) );
			const entryFile = pattern.split( '/' ).at( -1 );

			return packagesDir ? packageDirs[ packagesDir ]
				.map( packageDir => `${ packageDir }/theme/${ entryFile }` )
				.filter( entryPath => files.has( entryPath ) ) : [];
		} );

		vi.mocked( fs.existsSync ).mockImplementation( path => files.has( path ) );
		vi.mocked( fs.readFileSync ).mockImplementation( path => {
			if ( !files.has( path ) ) {
				throw new Error( `Unexpected file read: ${ path }` );
			}

			return files.get( path );
		} );
	}

	it( 'passes when each graph declares the variables it consumes', async () => {
		setup( {
			packages: {
				'ckeditor5-example': {
					'index-editor.css': '@import "./editor.css";\n:root {\n\t--ck-color-example: red;\n}\n',
					'index-content.css': [
						':root {',
						'	--ck-content-spacing: 1em;',
						'}',
						'.ck-content p {',
						'	margin: var(--ck-content-spacing);',
						'}',
						''
					].join( '\n' ),
					'editor.css': '.ck.ck-example {\n\tcolor: var(--ck-color-example);\n}\n'
				}
			}
		} );

		await import( '../scripts/check-css-variables.mjs' );

		expect( process.exit ).not.toHaveBeenCalled();
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining( 'only declared CSS custom properties' ) );
	} );

	it( 'fails when the editor styles consume a variable declared only in the content styles', async () => {
		setup( {
			packages: {
				'ckeditor5-example': {
					'index-editor.css': '.ck.ck-example {\n\tcolor: var(--ck-content-color);\n}\n',
					'index-content.css': ':root {\n\t--ck-content-color: red;\n}\n'
				}
			}
		} );

		await import( '../scripts/check-css-variables.mjs' );

		expect( process.exit ).toHaveBeenCalledWith( 1 );
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining(
			'"--ck-content-color" is used in the editor styles but is declared only in the content styles'
		) );
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining(
			'packages/ckeditor5-example/theme/index-editor.css:2'
		) );
	} );

	it( 'passes when the undeclared variable is consumed with a fallback', async () => {
		setup( {
			packages: {
				'ckeditor5-example': {
					'index-editor.css': '.ck.ck-example {\n\tcolor: var(--ck-color-example, red);\n}\n',
					'index-content.css': ''
				}
			}
		} );

		await import( '../scripts/check-css-variables.mjs' );

		expect( process.exit ).not.toHaveBeenCalled();
	} );

	it( 'treats the innermost variable of a nested "var()" fallback as the effective dependency', async () => {
		setup( {
			packages: {
				'ckeditor5-example': {
					'index-editor.css': '.ck.ck-example {\n\tcolor: var(--ck-primary, var(--ck-fallback));\n}\n',
					'index-content.css': ''
				}
			}
		} );

		await import( '../scripts/check-css-variables.mjs' );

		// The outer usage has a fallback, so `--ck-primary` is not required. The inner usage has
		// no fallback, so `--ck-fallback` is the one that must be declared.
		expect( process.exit ).toHaveBeenCalledWith( 1 );
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining(
			'"--ck-fallback" is used in the editor styles but is never declared'
		) );
		expect( console.log ).not.toHaveBeenCalledWith( expect.stringContaining( '--ck-primary' ) );
	} );

	it( 'treats an empty "var()" fallback as a fallback', async () => {
		setup( {
			packages: {
				'ckeditor5-example': {
					'index-editor.css': '.ck.ck-example {\n\tcolor: var(--ck-color-example,);\n}\n',
					'index-content.css': ''
				}
			}
		} );

		await import( '../scripts/check-css-variables.mjs' );

		expect( process.exit ).not.toHaveBeenCalled();
	} );

	it( 'resolves declarations through the same graph of the baseline packages', async () => {
		process.argv = [ ...process.argv, '--baseline', 'external/packages' ];

		setup( {
			packages: {
				'ckeditor5-premium': {
					'index-editor.css': '.ck.ck-premium {\n\tcolor: var(--ck-color-base);\n}\n',
					'index-content.css': ''
				}
			},
			baselinePackages: {
				'ckeditor5-base': {
					'index-editor.css': ':root {\n\t--ck-color-base: red;\n}\n',
					'index-content.css': ''
				}
			}
		} );

		await import( '../scripts/check-css-variables.mjs' );

		expect( process.exit ).not.toHaveBeenCalled();
	} );

	it( 'rejects declarations available only in the other graph of the baseline packages', async () => {
		process.argv = [ ...process.argv, '--baseline', 'external/packages' ];

		setup( {
			packages: {
				'ckeditor5-premium': {
					'index-editor.css': '.ck.ck-premium {\n\tcolor: var(--ck-content-color);\n}\n',
					'index-content.css': ''
				}
			},
			baselinePackages: {
				'ckeditor5-base': {
					'index-editor.css': '',
					'index-content.css': ':root {\n\t--ck-content-color: red;\n}\n'
				}
			}
		} );

		await import( '../scripts/check-css-variables.mjs' );

		expect( process.exit ).toHaveBeenCalledWith( 1 );
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining(
			'"--ck-content-color" is used in the editor styles but is declared only in the content styles'
		) );
	} );

	it( 'does not validate the usages of the baseline packages', async () => {
		process.argv = [ ...process.argv, '--baseline', 'external/packages' ];

		setup( {
			packages: {
				'ckeditor5-premium': {
					'index-editor.css': '',
					'index-content.css': ''
				}
			},
			baselinePackages: {
				'ckeditor5-base': {
					'index-editor.css': '.ck.ck-base {\n\tcolor: var(--ck-color-undeclared);\n}\n',
					'index-content.css': ''
				}
			}
		} );

		await import( '../scripts/check-css-variables.mjs' );

		expect( process.exit ).not.toHaveBeenCalled();
	} );

	it( 'resolves declarations across packages within the same graph', async () => {
		setup( {
			packages: {
				'ckeditor5-base': {
					'index-editor.css': ':root {\n\t--ck-color-shared: red;\n}\n',
					'index-content.css': ''
				},
				'ckeditor5-feature': {
					'index-editor.css': '.ck.ck-feature {\n\tcolor: var(--ck-color-shared);\n}\n',
					'index-content.css': ''
				}
			}
		} );

		await import( '../scripts/check-css-variables.mjs' );

		expect( process.exit ).not.toHaveBeenCalled();
	} );

	it( 'still requires a declaration in the same graph across packages', async () => {
		setup( {
			packages: {
				'ckeditor5-base': {
					'index-editor.css': '',
					'index-content.css': ':root {\n\t--ck-content-shared: 1em;\n}\n'
				},
				'ckeditor5-feature': {
					'index-editor.css': '.ck.ck-feature {\n\tmargin: var(--ck-content-shared);\n}\n',
					'index-content.css': ''
				}
			}
		} );

		await import( '../scripts/check-css-variables.mjs' );

		expect( process.exit ).toHaveBeenCalledWith( 1 );
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining(
			'"--ck-content-shared" is used in the editor styles but is declared only in the content styles'
		) );
	} );

	it( 'allows the known undeclared variables', async () => {
		setup( {
			packages: {
				'ckeditor5-example': {
					'index-editor.css': [
						'.ck.ck-example {',
						'	color: var(--ck-custom-background);',
						'	width: var(--ck-block-toolbar-size);',
						'}',
						''
					].join( '\n' ),
					'index-content.css': ''
				}
			}
		} );

		await import( '../scripts/check-css-variables.mjs' );

		expect( process.exit ).not.toHaveBeenCalled();
	} );

	it( 'does not treat exact known variable names as prefixes', async () => {
		setup( {
			packages: {
				'ckeditor5-example': {
					'index-editor.css': '.ck { width: var(--ck-block-toolbar-size-extra); }',
					'index-content.css': ''
				}
			}
		} );

		await import( '../scripts/check-css-variables.mjs' );

		expect( process.exit ).toHaveBeenCalledWith( 1 );
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining( '"--ck-block-toolbar-size-extra"' ) );
	} );

	it( 'allows a known undeclared variable even when the other graph declares it', async () => {
		setup( {
			packages: {
				'ckeditor5-example': {
					// `--ck-color-base-background` is declared by the editor styles and consumed by the
					// content styles. Without the allowlist this cross-graph dependency would be reported;
					// the allowlist tolerates it while the styles are being separated.
					'index-editor.css': ':root {\n\t--ck-color-base-background: white;\n}\n',
					'index-content.css': '.ck-content .ck-example {\n\tbackground: var(--ck-color-base-background);\n}\n'
				}
			}
		} );

		await import( '../scripts/check-css-variables.mjs' );

		expect( process.exit ).not.toHaveBeenCalled();
	} );

	it( 'fails when a ":root" variable is declared with different values in the editor and content graphs', async () => {
		setup( {
			packages: {
				'ckeditor5-example': {
					'index-editor.css': ':root {\n\t--ck-shared-size: 16px;\n}\n.ck.ck-example {\n\twidth: var(--ck-shared-size);\n}\n',
					'index-content.css': ':root {\n\t--ck-shared-size: 15px;\n}\n.ck-content p {\n\twidth: var(--ck-shared-size);\n}\n'
				}
			}
		} );

		await import( '../scripts/check-css-variables.mjs' );

		expect( process.exit ).toHaveBeenCalledWith( 1 );
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining(
			'"--ck-shared-size" is declared at ":root" in both the editor and content styles with different values'
		) );
	} );

	it( 'passes when the ":root" variable copies in both graphs have identical values', async () => {
		setup( {
			packages: {
				'ckeditor5-example': {
					'index-editor.css': ':root {\n\t--ck-shared-size: 16px;\n}\n.ck.ck-example {\n\twidth: var(--ck-shared-size);\n}\n',
					'index-content.css': ':root {\n\t--ck-shared-size: 16px;\n}\n.ck-content p {\n\twidth: var(--ck-shared-size);\n}\n'
				}
			}
		} );

		await import( '../scripts/check-css-variables.mjs' );

		expect( process.exit ).not.toHaveBeenCalled();
	} );

	it( 'preserves significant whitespace in ":root" variable values', async () => {
		setup( {
			packages: {
				'ckeditor5-example': {
					'index-editor.css': ':root {\n\t--ck-label: "two  spaces";\n}\n',
					'index-content.css': ':root {\n\t--ck-label: "two spaces";\n}\n'
				}
			}
		} );

		await import( '../scripts/check-css-variables.mjs' );

		expect( process.exit ).toHaveBeenCalledWith( 1 );
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining( '"--ck-label"' ) );
	} );

	it( 'allows scoped redeclarations with values different than the ":root" one', async () => {
		setup( {
			packages: {
				'ckeditor5-example': {
					'index-editor.css': ':root {\n\t--ck-marker-border: red;\n}\n.ck.ck-example {\n\tborder: var(--ck-marker-border);\n}\n',
					'index-content.css': '.ck-content .ck-example-viewer {\n\t--ck-marker-border: none;\n}\n'
				}
			}
		} );

		await import( '../scripts/check-css-variables.mjs' );

		expect( process.exit ).not.toHaveBeenCalled();
	} );

	it( 'ignores declarations and usages inside comments', async () => {
		setup( {
			packages: {
				'ckeditor5-example': {
					'index-editor.css': [
						'/* .ck.ck-fake { color: var(--ck-commented-out); } */',
						'/* :root { --ck-color-example: blue; } */',
						'.ck.ck-example {',
						'	color: var(--ck-color-example);',
						'}',
						''
					].join( '\n' ),
					'index-content.css': ''
				}
			}
		} );

		await import( '../scripts/check-css-variables.mjs' );

		expect( process.exit ).toHaveBeenCalledWith( 1 );
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining( '"--ck-color-example"' ) );
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining(
			'packages/ckeditor5-example/theme/index-editor.css:4'
		) );
		expect( console.log ).not.toHaveBeenCalledWith( expect.stringContaining( '--ck-commented-out' ) );
	} );

	it( 'collects declarations and usages through the "@import" chain', async () => {
		setup( {
			packages: {
				'ckeditor5-example': {
					'index-editor.css': '@import "./variables.css";\n@import "./nested/feature.css";\n',
					'index-content.css': '',
					'variables.css': ':root {\n\t--ck-color-example: red;\n}\n',
					'nested/feature.css': '.ck.ck-example {\n\tcolor: var(--ck-color-example);\n\twidth: var(--ck-undeclared);\n}\n'
				}
			}
		} );

		await import( '../scripts/check-css-variables.mjs' );

		expect( process.exit ).toHaveBeenCalledWith( 1 );
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining(
			'"--ck-undeclared" is used in the editor styles but is never declared'
		) );
		expect( console.log ).not.toHaveBeenCalledWith( expect.stringContaining( '"--ck-color-example"' ) );
	} );

	it( 'skips bare imports of stylesheets from other packages', async () => {
		setup( {
			packages: {
				'ckeditor5-example': {
					'index-editor.css': '@import "@ckeditor/ckeditor5-theme/theme/theme.css";\n',
					'index-content.css': ''
				}
			}
		} );

		await import( '../scripts/check-css-variables.mjs' );

		expect( process.exit ).not.toHaveBeenCalled();
	} );

	it( 'treats a ":root" rule nested in an at-rule as a scoped declaration', async () => {
		setup( {
			packages: {
				'ckeditor5-example': {
					'index-editor.css': ':root {\n\t--ck-shared-size: 16px;\n}\n.ck.ck-example {\n\twidth: var(--ck-shared-size);\n}\n',
					'index-content.css': '@media print {\n\t:root {\n\t\t--ck-shared-size: 15px;\n\t}\n}\n'
				}
			}
		} );

		await import( '../scripts/check-css-variables.mjs' );

		expect( process.exit ).not.toHaveBeenCalled();
	} );
} );
