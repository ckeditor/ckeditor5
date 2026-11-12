/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { matchesGlob } from 'node:path';
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

	// Registers the theme stylesheets of the primary (and optionally base) packages, and other files of
	// the repository, in the mocked file system. Stylesheet paths are relative to the `theme` directory
	// of a package, and other file paths are relative to the repository root.
	function setup( { packages = {}, basePackages = {}, files: repositoryFiles = {} } = {} ) {
		const files = new Map();

		for ( const [ packagesDir, packageSet ] of [
			[ '/repo/packages', packages ],
			[ '/repo/external/packages', basePackages ]
		] ) {
			for ( const [ packageName, themeFiles ] of Object.entries( packageSet ) ) {
				for ( const [ file, contents ] of Object.entries( themeFiles ) ) {
					files.set( `${ packagesDir }/${ packageName }/theme/${ file }`, contents );
				}
			}
		}

		for ( const [ file, contents ] of Object.entries( repositoryFiles ) ) {
			files.set( `/repo/${ file }`, contents );
		}

		vi.mocked( fs.globSync ).mockImplementation( pattern => {
			return [ ...files.keys() ].filter( filePath => matchesGlob( filePath, pattern ) );
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

	it( 'resolves declarations through the same graph of the base packages', async () => {
		process.argv = [ ...process.argv, '--base-packages', 'external/packages' ];

		setup( {
			packages: {
				'ckeditor5-premium': {
					'index-editor.css': '.ck.ck-premium {\n\tcolor: var(--ck-color-base);\n}\n',
					'index-content.css': ''
				}
			},
			basePackages: {
				'ckeditor5-base': {
					'index-editor.css': ':root {\n\t--ck-color-base: red;\n}\n',
					'index-content.css': ''
				}
			}
		} );

		await import( '../scripts/check-css-variables.mjs' );

		expect( process.exit ).not.toHaveBeenCalled();
	} );

	it( 'rejects declarations available only in the other graph of the base packages', async () => {
		process.argv = [ ...process.argv, '--base-packages', 'external/packages' ];

		setup( {
			packages: {
				'ckeditor5-premium': {
					'index-editor.css': '.ck.ck-premium {\n\tcolor: var(--ck-content-color);\n}\n',
					'index-content.css': ''
				}
			},
			basePackages: {
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

	it( 'does not validate the usages of the base packages', async () => {
		process.argv = [ ...process.argv, '--base-packages', 'external/packages' ];

		setup( {
			packages: {
				'ckeditor5-premium': {
					'index-editor.css': '',
					'index-content.css': ''
				}
			},
			basePackages: {
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
			'"--ck-shared-size" is declared at the root scope in both the editor and content styles with different values'
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

	describe( 'usages outside the stylesheet graphs', () => {
		// The theme declares `--ck-color-example`, which the files outside the graphs consume.
		const packages = {
			'ckeditor5-example': {
				'index-editor.css': ':root {\n\t--ck-color-example: red;\n}\n',
				'index-content.css': ''
			}
		};

		describe( 'source code', () => {
			it( 'passes when the source code consumes only declared variables', async () => {
				setup( {
					packages,
					files: {
						'packages/ckeditor5-example/src/view.ts': 'element.style.color = \'var(--ck-color-example)\';\n'
					}
				} );

				await import( '../scripts/check-css-variables.mjs' );

				expect( process.exit ).not.toHaveBeenCalled();
			} );

			it( 'fails when the source code consumes an undeclared variable without a fallback', async () => {
				setup( {
					packages,
					files: {
						'packages/ckeditor5-example/src/view.ts': [
							'const counterWidth = 10;',
							'element.style.padding = \'calc( 2 * var(--ck-spacing-removed) + 10px )\';',
							''
						].join( '\n' )
					}
				} );

				await import( '../scripts/check-css-variables.mjs' );

				expect( process.exit ).toHaveBeenCalledWith( 1 );
				expect( console.log ).toHaveBeenCalledWith( expect.stringContaining(
					'"--ck-spacing-removed" is used in the source code but is never declared ' +
					'(packages/ckeditor5-example/src/view.ts:2)'
				) );
			} );

			it( 'checks the code examples in the API docs', async () => {
				setup( {
					packages,
					files: {
						'packages/ckeditor5-example/src/view.ts': [
							'/**',
							' * ```js',
							' * style: { padding: \'var(--ck-spacing-removed)\' }',
							' * ```',
							' */',
							''
						].join( '\n' )
					}
				} );

				await import( '../scripts/check-css-variables.mjs' );

				expect( process.exit ).toHaveBeenCalledWith( 1 );
				expect( console.log ).toHaveBeenCalledWith( expect.stringContaining(
					'"--ck-spacing-removed" is used in the source code but is never declared ' +
					'(packages/ckeditor5-example/src/view.ts:3)'
				) );
			} );

			it( 'passes when the source code consumes an undeclared variable with a fallback', async () => {
				setup( {
					packages,
					files: {
						'packages/ckeditor5-example/src/view.ts':
							'element.style.color = \'var(--ck-color-removed, var(--ck-color-example))\';\n'
					}
				} );

				await import( '../scripts/check-css-variables.mjs' );

				expect( process.exit ).not.toHaveBeenCalled();
			} );

			it( 'treats the innermost variable of a nested "var()" fallback as the effective dependency', async () => {
				setup( {
					packages,
					files: {
						'packages/ckeditor5-example/src/view.ts':
							'element.style.color = \'var(--ck-color-example, var(--ck-color-removed))\';\n'
					}
				} );

				await import( '../scripts/check-css-variables.mjs' );

				expect( process.exit ).toHaveBeenCalledWith( 1 );
				expect( console.log ).toHaveBeenCalledWith( expect.stringContaining(
					'"--ck-color-removed" is used in the source code but is never declared'
				) );
				expect( console.log ).not.toHaveBeenCalledWith( expect.stringContaining( '"--ck-color-example"' ) );
			} );

			it( 'skips variables whose names are built at runtime', async () => {
				setup( {
					packages,
					files: {
						'packages/ckeditor5-example/src/view.ts': 'element.style.color = \'var(--ck-color-\' + name + \')\';\n'
					}
				} );

				await import( '../scripts/check-css-variables.mjs' );

				expect( process.exit ).not.toHaveBeenCalled();
			} );

			it( 'allows the variables set from JavaScript', async () => {
				setup( {
					packages,
					files: {
						'packages/ckeditor5-example/src/view.ts':
							'element.style.content = \'var(--ck-show-blocks-label-paragraph)\';\n' +
							'element.style.order = \'var(--ck-ai-review-check-list-item-index)\';\n'
					}
				} );

				await import( '../scripts/check-css-variables.mjs' );

				expect( process.exit ).not.toHaveBeenCalled();
			} );

			it( 'does not accept the known gaps of the stylesheets', async () => {
				setup( {
					packages,
					files: {
						'packages/ckeditor5-example/src/view.ts': 'element.style.width = \'var(--ck-block-toolbar-size)\';\n'
					}
				} );

				await import( '../scripts/check-css-variables.mjs' );

				expect( process.exit ).toHaveBeenCalledWith( 1 );
				expect( console.log ).toHaveBeenCalledWith( expect.stringContaining(
					'"--ck-block-toolbar-size" is used in the source code but is never declared'
				) );
			} );

			it( 'does not accept a variable declared only by the documentation', async () => {
				setup( {
					packages,
					files: {
						'docs/_snippets/features/example.css': ':root {\n\t--ck-color-docs: red;\n}\n',
						'packages/ckeditor5-example/src/view.ts': 'element.style.color = \'var(--ck-color-docs)\';\n'
					}
				} );

				await import( '../scripts/check-css-variables.mjs' );

				expect( process.exit ).toHaveBeenCalledWith( 1 );
				expect( console.log ).toHaveBeenCalledWith( expect.stringContaining(
					'"--ck-color-docs" is used in the source code but is never declared'
				) );
			} );

			it( 'does not validate the source code of the base packages', async () => {
				process.argv = [ ...process.argv, '--base-packages', 'external/packages' ];

				setup( {
					packages,
					files: {
						'external/packages/ckeditor5-base/src/view.ts': 'element.style.color = \'var(--ck-color-removed)\';\n'
					}
				} );

				await import( '../scripts/check-css-variables.mjs' );

				expect( process.exit ).not.toHaveBeenCalled();
			} );
		} );

		describe( 'documentation', () => {
			it( 'fails when a code block in a guide consumes an undeclared variable without a fallback', async () => {
				setup( {
					packages,
					files: {
						'docs/features/example.md': [
							'# Example',
							'',
							'```css',
							'.ck-content .example {',
							'	color: var(--ck-color-example);',
							'	margin: var(--ck-spacing-removed);',
							'}',
							'```',
							''
						].join( '\n' )
					}
				} );

				await import( '../scripts/check-css-variables.mjs' );

				expect( process.exit ).toHaveBeenCalledWith( 1 );
				expect( console.log ).toHaveBeenCalledWith( expect.stringContaining(
					'"--ck-spacing-removed" is used in the documentation but is never declared (docs/features/example.md:6)'
				) );
				expect( console.log ).not.toHaveBeenCalledWith( expect.stringContaining( '"--ck-color-example"' ) );
			} );

			it( 'checks the guides of the packages', async () => {
				setup( {
					packages,
					files: {
						'packages/ckeditor5-example/docs/features/example.md': '```css\n.ck { margin: var(--ck-spacing-removed); }\n```\n'
					}
				} );

				await import( '../scripts/check-css-variables.mjs' );

				expect( process.exit ).toHaveBeenCalledWith( 1 );
				expect( console.log ).toHaveBeenCalledWith( expect.stringContaining(
					'"--ck-spacing-removed" is used in the documentation but is never declared ' +
					'(packages/ckeditor5-example/docs/features/example.md:2)'
				) );
			} );

			it( 'checks the code blocks of a guide in any language', async () => {
				setup( {
					packages,
					files: {
						'docs/features/example.md': [
							'```js',
							'const options = [ { color: \'var(--ck-color-removed)\' } ];',
							'```',
							''
						].join( '\n' )
					}
				} );

				await import( '../scripts/check-css-variables.mjs' );

				expect( process.exit ).toHaveBeenCalledWith( 1 );
				expect( console.log ).toHaveBeenCalledWith( expect.stringContaining( '"--ck-color-removed"' ) );
			} );

			it( 'skips the prose of a guide', async () => {
				setup( {
					packages,
					files: {
						'docs/features/example.md': [
							'Old names keep working as override fallbacks, as in `var(--ck-old)`.',
							'',
							'| Token | Default |',
							'|-------|---------|',
							'| `--ck-example` | `var(--ck-color-removed)` |',
							''
						].join( '\n' )
					}
				} );

				await import( '../scripts/check-css-variables.mjs' );

				expect( process.exit ).not.toHaveBeenCalled();
			} );

			it( 'closes a code block only with a fence of the same character and at least the same length', async () => {
				setup( {
					packages,
					files: {
						'docs/features/example.md': [
							'````md',
							'```css',
							'.ck { color: var(--ck-color-inside-inner-fence); }',
							'```',
							'~~~',
							'.ck { color: var(--ck-color-after-inner-fence); }',
							'````',
							'Prose after the block: `var(--ck-color-prose)`.',
							''
						].join( '\n' )
					}
				} );

				await import( '../scripts/check-css-variables.mjs' );

				expect( process.exit ).toHaveBeenCalledWith( 1 );
				expect( console.log ).toHaveBeenCalledWith( expect.stringContaining( '"--ck-color-inside-inner-fence"' ) );
				expect( console.log ).toHaveBeenCalledWith( expect.stringContaining( '"--ck-color-after-inner-fence"' ) );
				expect( console.log ).not.toHaveBeenCalledWith( expect.stringContaining( '"--ck-color-prose"' ) );
			} );

			it( 'fails when a snippet consumes an undeclared variable without a fallback', async () => {
				setup( {
					packages,
					files: {
						'docs/_snippets/features/example.css': '.example {\n\tcolor: var(--ck-color-removed);\n}\n',
						'packages/ckeditor5-example/docs/_snippets/features/example.html': [
							'<div class="example"></div>',
							'<style>',
							'	.example { margin: var(--ck-spacing-removed); }',
							'</style>',
							''
						].join( '\n' )
					}
				} );

				await import( '../scripts/check-css-variables.mjs' );

				expect( process.exit ).toHaveBeenCalledWith( 1 );
				expect( console.log ).toHaveBeenCalledWith( expect.stringContaining(
					'"--ck-color-removed" is used in the documentation but is never declared (docs/_snippets/features/example.css:2)'
				) );
				expect( console.log ).toHaveBeenCalledWith( expect.stringContaining(
					'"--ck-spacing-removed" is used in the documentation but is never declared ' +
					'(packages/ckeditor5-example/docs/_snippets/features/example.html:3)'
				) );
			} );

			it( 'fails when a stylesheet in the docs assets consumes an undeclared variable without a fallback', async () => {
				setup( {
					packages,
					files: {
						'packages/ckeditor5-example/docs/assets/example.css': '.example {\n\tcolor: var(--ck-color-removed);\n}\n'
					}
				} );

				await import( '../scripts/check-css-variables.mjs' );

				expect( process.exit ).toHaveBeenCalledWith( 1 );
				expect( console.log ).toHaveBeenCalledWith( expect.stringContaining(
					'"--ck-color-removed" is used in the documentation but is never declared ' +
					'(packages/ckeditor5-example/docs/assets/example.css:2)'
				) );
			} );

			it( 'accepts variables declared by the documentation itself', async () => {
				setup( {
					packages,
					files: {
						'docs/_snippets/_utils/css/demo.css': ':root {\n\t--ck-demo-spacing: 1em;\n}\n',
						'packages/ckeditor5-example/docs/_snippets/features/example.css':
							'.example {\n\tmargin: var(--ck-demo-spacing);\n}\n',
						'docs/features/example.md': [
							'```css',
							'.ck-content {',
							'	--ck-my-widget-color: var(--ck-color-example);',
							'	color: var(--ck-my-widget-color);',
							'}',
							'```',
							''
						].join( '\n' )
					}
				} );

				await import( '../scripts/check-css-variables.mjs' );

				expect( process.exit ).not.toHaveBeenCalled();
			} );

			it( 'does not accept the known gaps of the stylesheets', async () => {
				setup( {
					packages,
					files: {
						'docs/features/example.md': '```css\n.ck { width: var(--ck-block-toolbar-size); }\n```\n'
					}
				} );

				await import( '../scripts/check-css-variables.mjs' );

				expect( process.exit ).toHaveBeenCalledWith( 1 );
				expect( console.log ).toHaveBeenCalledWith( expect.stringContaining(
					'"--ck-block-toolbar-size" is used in the documentation but is never declared'
				) );
			} );

			it( 'skips the migration guide to the refreshed theme and the code style guide', async () => {
				setup( {
					packages,
					files: {
						'docs/updating/migration-to-refreshed-theme.md': '```css\n.ck { margin: var(--ck-spacing-removed); }\n```\n',
						'docs/framework/contributing/code-style.md': '```css\n.ck { color: var(--ck-color-link); }\n```\n'
					}
				} );

				await import( '../scripts/check-css-variables.mjs' );

				expect( process.exit ).not.toHaveBeenCalled();
			} );

			it( 'checks the other update guides', async () => {
				setup( {
					packages,
					files: {
						'docs/updating/update-to-1.md': '```css\n.ck { margin: var(--ck-spacing-removed); }\n```\n'
					}
				} );

				await import( '../scripts/check-css-variables.mjs' );

				expect( process.exit ).toHaveBeenCalledWith( 1 );
				expect( console.log ).toHaveBeenCalledWith( expect.stringContaining(
					'"--ck-spacing-removed" is used in the documentation but is never declared'
				) );
			} );
		} );
	} );
} );
