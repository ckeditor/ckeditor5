/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock( 'node:fs' );

describe( 'scripts/check-css-token-docs', () => {
	let fs, originalArgv;

	beforeEach( async () => {
		vi.resetModules();

		fs = await import( 'node:fs' );

		originalArgv = process.argv;
		process.argv = [ 'node', 'check-css-token-docs.mjs' ];

		vi.spyOn( process, 'cwd' ).mockReturnValue( '/repo' );
		vi.spyOn( console, 'log' ).mockImplementation( () => {} );
		vi.spyOn( process, 'exit' ).mockImplementation( () => {} );
	} );

	afterEach( () => {
		process.argv = originalArgv;
	} );

	// Registers the theme stylesheets of the primary (and optionally base) packages in the mocked file system.
	// Stylesheet paths are relative to the packages directory, as in `ckeditor5-ui/theme/globals/_border.css`.
	function setup( { packages = {}, basePackages = {} } = {} ) {
		const files = new Map();

		for ( const [ packagesDir, packageFiles ] of [
			[ '/repo/packages', packages ],
			[ '/repo/external/packages', basePackages ]
		] ) {
			for ( const [ file, contents ] of Object.entries( packageFiles ) ) {
				files.set( `${ packagesDir }/${ file }`, contents );
			}
		}

		vi.mocked( fs.globSync ).mockImplementation( pattern => {
			const packagesDir = pattern.slice( 0, pattern.indexOf( '/*/theme/' ) );

			return [ ...files.keys() ].filter( path => path.startsWith( `${ packagesDir }/` ) );
		} );

		vi.mocked( fs.readFileSync ).mockImplementation( path => {
			if ( !files.has( path ) ) {
				throw new Error( `Unexpected file read: ${ path }` );
			}

			return files.get( path );
		} );
	}

	async function run() {
		await import( '../scripts/check-css-token-docs.mjs' );
	}

	function expectError( text ) {
		expect( process.exit ).toHaveBeenCalledWith( 1 );
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining( text ) );
	}

	it( 'passes when the doc comments follow the format', async () => {
		setup( {
			packages: {
				'ckeditor5-example/theme/example.css': [
					'/**',
					' * The file description.',
					' */',
					':root,',
					':host {',
					'	/* A plain note. */',
					'	--ck-example-background: red; /* 8px */',
					'',
					'	/**',
					'	 * The text on the example background.',
					'	 * @pair --ck-example-background',
					'	 */',
					'	/* A note between the description and the declaration. */',
					'	--ck-example-text: blue;',
					'}',
					'',
					'/**',
					' * A class description.',
					' */',
					'.ck-example {',
					'	--ck-example-background: green;',
					'}',
					''
				].join( '\n' )
			}
		} );

		await run();

		expect( process.exit ).not.toHaveBeenCalled();
		expect( console.log ).toHaveBeenCalledWith( expect.stringContaining( 'follow the format' ) );
	} );

	it( 'fails when a doc comment is placed inside a value', async () => {
		setup( {
			packages: {
				'ckeditor5-example/theme/example.css': ':root {\n\t--ck-example: calc( /**\n * Value.\n */ 1px );\n}\n'
			}
		} );

		await run();

		expectError( 'The doc comment in packages/ckeditor5-example/theme/example.css:2 is placed inside a value' );
	} );

	it( 'fails when a doc comment uses the one-line form', async () => {
		setup( {
			packages: {
				'ckeditor5-example/theme/example.css': ':root {\n\t/** One line. */\n\t--ck-example: 1px;\n}\n'
			}
		} );

		await run();

		expectError( 'The doc comment in packages/ckeditor5-example/theme/example.css:2 must use the multi-line form' );
	} );

	it( 'fails when a doc comment is followed by the end of a block', async () => {
		setup( {
			packages: {
				'ckeditor5-example/theme/example.css': ':root {\n\t--ck-example: 1px;\n\n\t/**\n\t * Orphan.\n\t */\n}\n'
			}
		} );

		await run();

		expectError( 'The doc comment in packages/ckeditor5-example/theme/example.css:4 does not describe anything' );
	} );

	it( 'fails when a doc comment is followed by another doc comment', async () => {
		setup( {
			packages: {
				'ckeditor5-example/theme/example.css': ':root {\n\t/**\n\t * First.\n' +
					'\t */\n\t/**\n\t * Second.\n\t */\n\t--ck-example: 1px;\n}\n'
			}
		} );

		await run();

		expectError( 'The doc comment in packages/ckeditor5-example/theme/example.css:2 does not describe anything' );
		expect( console.log ).not.toHaveBeenCalledWith( expect.stringContaining( 'example.css:5 does not describe' ) );
	} );

	it( 'fails when a doc comment is at the end of the file', async () => {
		setup( {
			packages: {
				'ckeditor5-example/theme/example.css': ':root {\n\t--ck-example: 1px;\n}\n\n/**\n * Orphan.\n */\n'
			}
		} );

		await run();

		expectError( 'The doc comment in packages/ckeditor5-example/theme/example.css:5 does not describe anything' );
	} );

	it( 'fails when a doc comment describes a token outside the root rules', async () => {
		setup( {
			packages: {
				'ckeditor5-example/theme/example.css': '.ck-example {\n\t/**\n\t * Not read.\n\t */\n\t--ck-example: 1px;\n}\n'
			}
		} );

		await run();

		expectError( 'describes "--ck-example" outside the top-level ":root, :host" rules' );
	} );

	it( 'passes when a doc comment describes a regular property', async () => {
		setup( {
			packages: {
				'ckeditor5-example/theme/example.css': '.ck-example {\n\t/**\n\t * Why the color.\n\t */\n\tcolor: red;\n}\n'
			}
		} );

		await run();

		expect( process.exit ).not.toHaveBeenCalled();
	} );

	it( 'fails when a @pair tag names a token that is not declared', async () => {
		setup( {
			packages: {
				'ckeditor5-example/theme/example.css': ':root {\n\t/**\n\t * Text.\n' +
					'\t * @pair --ck-missing\n\t */\n\t--ck-example: red;\n}\n'
			}
		} );

		await run();

		expectError( 'The @pair tag in packages/ckeditor5-example/theme/example.css:2 names "--ck-missing", which is not declared' );
	} );

	it( 'fails when a @pair tag ends with a dot', async () => {
		setup( {
			packages: {
				'ckeditor5-example/theme/example.css': ':root {\n\t/**\n\t * Text.\n' +
					'\t * @pair --ck-example.\n\t */\n\t--ck-example: red;\n}\n'
			}
		} );

		await run();

		expectError( 'The @pair tag in packages/ckeditor5-example/theme/example.css:2 must not end with a dot' );
		expect( console.log ).not.toHaveBeenCalledWith( expect.stringContaining( 'which is not declared' ) );
	} );

	it( 'fails when a @pair tag does not name a single token', async () => {
		setup( {
			packages: {
				'ckeditor5-example/theme/example.css': ':root {\n\t/**\n\t * Text.\n' +
					'\t * @pair the background\n\t */\n\t--ck-example: red;\n}\n'
			}
		} );

		await run();

		expectError( 'must name a single token' );
	} );

	it( 'passes when a @deprecated tag names a declared token', async () => {
		setup( {
			packages: {
				'ckeditor5-example/theme/example.css': ':root {\n\t--ck-example: red;\n\n\t/**\n\t * An alias of `--ck-example`.\n' +
					'\t * @deprecated --ck-example\n\t */\n\t--ck-example-old: var(--ck-example);\n}\n'
			}
		} );

		await run();

		expect( process.exit ).not.toHaveBeenCalled();
	} );

	it( 'fails when a @deprecated tag names a token that is not declared', async () => {
		setup( {
			packages: {
				'ckeditor5-example/theme/example.css': ':root {\n\t/**\n\t * An alias.\n' +
					'\t * @deprecated --ck-missing\n\t */\n\t--ck-example: red;\n}\n'
			}
		} );

		await run();

		expectError(
			'The @deprecated tag in packages/ckeditor5-example/theme/example.css:2 names "--ck-missing", which is not declared'
		);
	} );

	it( 'fails when a @deprecated tag ends with a dot', async () => {
		setup( {
			packages: {
				'ckeditor5-example/theme/example.css': ':root {\n\t/**\n\t * An alias.\n' +
					'\t * @deprecated --ck-example.\n\t */\n\t--ck-example: red;\n}\n'
			}
		} );

		await run();

		expectError( 'The @deprecated tag in packages/ckeditor5-example/theme/example.css:2 must not end with a dot' );
	} );

	it( 'fails when a @deprecated tag does not name a single token', async () => {
		setup( {
			packages: {
				'ckeditor5-example/theme/example.css': ':root {\n\t/**\n\t * An alias.\n' +
					'\t * @deprecated Use the medium step instead\n\t */\n\t--ck-example: red;\n}\n'
			}
		} );

		await run();

		expectError( 'must name a single token, as in "@deprecated --ck-spacing-md"' );
	} );

	it( 'fails when a doc comment has more than one @deprecated tag', async () => {
		setup( {
			packages: {
				'ckeditor5-example/theme/example.css': [
					':root {',
					'	--ck-example-a: red;',
					'	--ck-example-b: blue;',
					'',
					'	/**',
					'	 * An alias.',
					'	 * @deprecated --ck-example-a',
					'	 * @deprecated --ck-example-b',
					'	 */',
					'	--ck-example-old: var(--ck-example-a);',
					'}',
					''
				].join( '\n' )
			}
		} );

		await run();

		expectError( 'The doc comment in packages/ckeditor5-example/theme/example.css:5 has more than one @deprecated tag' );
	} );

	it( 'fails when a doc comment has an unknown tag', async () => {
		setup( {
			packages: {
				'ckeditor5-example/theme/example.css': ':root {\n\t--ck-example: red;\n\n\t/**\n\t * An alias.\n' +
					'\t * @depreacted --ck-example\n\t */\n\t--ck-example-old: var(--ck-example);\n}\n'
			}
		} );

		await run();

		expectError(
			'The doc comment in packages/ckeditor5-example/theme/example.css:4 has an unknown @depreacted tag. ' +
			'Use one of: @pair, @deprecated.'
		);
	} );

	it( 'reports a tag that starts with the name of a known tag only as unknown', async () => {
		setup( {
			packages: {
				'ckeditor5-example/theme/example.css': ':root {\n\t/**\n\t * Text.\n' +
					'\t * @pair-foo --ck-example\n\t */\n\t--ck-example: red;\n}\n'
			}
		} );

		await run();

		expectError( 'has an unknown @pair-foo tag' );
		expect( console.log ).not.toHaveBeenCalledWith( expect.stringContaining( 'must name a single token' ) );
	} );

	it( 'resolves @deprecated tags against the tokens of the base packages', async () => {
		process.argv.push( '--base-packages', 'external/packages' );

		setup( {
			packages: {
				'ckeditor5-example/theme/example.css': ':root {\n\t/**\n\t * An alias.\n' +
					'\t * @deprecated --ck-base-spacing\n\t */\n\t--ck-example: red;\n}\n'
			},
			basePackages: {
				'ckeditor5-base/theme/base.css': ':root {\n\t--ck-base-spacing: 8px;\n}\n'
			}
		} );

		await run();

		expect( process.exit ).not.toHaveBeenCalled();
	} );

	it( 'resolves @pair tags against the tokens of the base packages', async () => {
		process.argv.push( '--base-packages', 'external/packages' );

		setup( {
			packages: {
				'ckeditor5-example/theme/example.css': ':root {\n\t/**\n\t * Text.\n' +
					'\t * @pair --ck-base-background\n\t */\n\t--ck-example: red;\n}\n'
			},
			basePackages: {
				'ckeditor5-base/theme/base.css': ':root {\n\t--ck-base-background: white;\n}\n'
			}
		} );

		await run();

		expect( process.exit ).not.toHaveBeenCalled();
	} );

	it( 'does not validate the files of the base packages', async () => {
		process.argv.push( '--base-packages', 'external/packages' );

		setup( {
			packages: {
				'ckeditor5-example/theme/example.css': ':root {\n\t--ck-example: red;\n}\n'
			},
			basePackages: {
				'ckeditor5-base/theme/base.css': [
					':root {',
					'	/** One line. */',
					'	--ck-base: white;',
					'',
					'	/**',
					'	 * Text.',
					'	 * @pair --ck-missing',
					'	 */',
					'	--ck-base-text: black;',
					'}',
					''
				].join( '\n' )
			}
		} );

		await run();

		expect( process.exit ).not.toHaveBeenCalled();
	} );

	it( 'reports the problems of many files in the order of their paths', async () => {
		setup( {
			packages: {
				'ckeditor5-b/theme/b.css': ':root {\n\t/** B. */\n\t--ck-b: 1px;\n}\n',
				'ckeditor5-a/theme/a.css': ':root {\n\t/** A. */\n\t--ck-a: 1px;\n}\n'
			}
		} );

		await run();

		const messages = vi.mocked( console.log ).mock.calls.map( ( [ message ] ) => message );
		const indexOfA = messages.findIndex( message => message.includes( 'ckeditor5-a/theme/a.css:2' ) );
		const indexOfB = messages.findIndex( message => message.includes( 'ckeditor5-b/theme/b.css:2' ) );

		expect( indexOfA ).toBeGreaterThan( -1 );
		expect( indexOfB ).toBeGreaterThan( indexOfA );
	} );

	it( 'fails when a foundation file has no description', async () => {
		setup( {
			packages: {
				'ckeditor5-ui/theme/globals/_border.css': ':root,\n:host {\n\t--ck-border-width-thin: 1px;\n}\n'
			}
		} );

		await run();

		expectError( 'packages/ckeditor5-ui/theme/globals/_border.css:1: the file has no description' );
	} );

	it( 'does not take the description of a token as the file description', async () => {
		setup( {
			packages: {
				'ckeditor5-ui/theme/globals/_border.css': [
					'.ck-example {',
					'	color: red;',
					'}',
					'',
					':root {',
					'	/**',
					'	 * A token description.',
					'	 */',
					'	--ck-border-width-thin: 1px;',
					'}',
					''
				].join( '\n' )
			}
		} );

		await run();

		expectError( 'packages/ckeditor5-ui/theme/globals/_border.css:5: the file has no description' );
	} );

	it( 'fails when a token in the foundation colors has no description', async () => {
		setup( {
			packages: {
				'ckeditor5-ui/theme/globals/colors/_foundation.css': [
					'/**',
					' * The file description.',
					' */',
					':root,',
					':host {',
					'	/**',
					'	 * Described.',
					'	 */',
					'	--ck-color-base-background: white;',
					'	--ck-color-base-border: gray;',
					'}',
					''
				].join( '\n' )
			}
		} );

		await run();

		expectError( '"--ck-color-base-border" has no description (packages/ckeditor5-ui/theme/globals/colors/_foundation.css:10)' );
		expect( console.log ).not.toHaveBeenCalledWith( expect.stringContaining( '"--ck-color-base-background" has no description' ) );
	} );

	it( 'does not take the file description as the description of the first token', async () => {
		setup( {
			packages: {
				'ckeditor5-ui/theme/globals/colors/_foundation.css': '/**\n' +
					' * The file.\n */\n:root {\n\t--ck-color-base-background: white;\n}\n'
			}
		} );

		await run();

		expectError( '"--ck-color-base-background" has no description' );
	} );

	it( 'fails when a doc comment describes a token in a root rule nested in an at-rule', async () => {
		setup( {
			packages: {
				'ckeditor5-example/theme/example.css': [
					'@media (forced-colors: active) {',
					'	:root {',
					'		/**',
					'		 * Not read.',
					'		 */',
					'		--ck-example: CanvasText;',
					'	}',
					'}',
					''
				].join( '\n' )
			}
		} );

		await run();

		expectError( 'The doc comment in packages/ckeditor5-example/theme/example.css:3 describes "--ck-example" outside' );
	} );

	it( 'does not take a root rule nested in an at-rule as the first root rule of a file', async () => {
		setup( {
			packages: {
				'ckeditor5-ui/theme/globals/_border.css': [
					'@media (forced-colors: active) {',
					'	:root {',
					'		--ck-border-width-thin: 2px;',
					'	}',
					'}',
					'',
					'/**',
					' * The file description.',
					' */',
					':root,',
					':host {',
					'	--ck-border-width-thin: 1px;',
					'}',
					''
				].join( '\n' )
			}
		} );

		await run();

		expect( console.log ).not.toHaveBeenCalledWith( expect.stringContaining( 'the file has no description' ) );
		expect( console.log ).not.toHaveBeenCalledWith( expect.stringContaining( '"ckeditor5-ui/theme/globals/_border.css" is listed' ) );
	} );

	it( 'does not report a file in FILES_WITHOUT_TOKEN_DESCRIPTIONS that has a description', async () => {
		setup( {
			packages: {
				'ckeditor5-ui/theme/globals/_border.css': '/**\n * The file.\n */\n:root,\n:host {\n\t--ck-border-width-thin: 1px;\n}\n'
			}
		} );

		await run();

		expect( console.log ).not.toHaveBeenCalledWith( expect.stringContaining( 'the file has no description' ) );
		expect( console.log ).not.toHaveBeenCalledWith( expect.stringContaining( '"ckeditor5-ui/theme/globals/_border.css" is listed' ) );
	} );

	it( 'accepts plain comments between the description and a token in the foundation colors', async () => {
		setup( {
			packages: {
				'ckeditor5-ui/theme/globals/colors/_foundation.css': [
					'/**',
					' * The file description.',
					' */',
					':root,',
					':host {',
					'	/**',
					'	 * Described.',
					'	 */',
					'	/* A note for maintainers,',
					'	   on two lines. */',
					'	--ck-color-base-background: white;',
					'}',
					''
				].join( '\n' )
			}
		} );

		await run();

		expect( console.log ).not.toHaveBeenCalledWith( expect.stringContaining( 'has no description' ) );
	} );

	it( 'validates every @pair tag of a doc comment', async () => {
		setup( {
			packages: {
				'ckeditor5-example/theme/example.css': [
					':root {',
					'	--ck-example-surface: white;',
					'	--ck-example-surface-hover: gray;',
					'',
					'	/**',
					'	 * Text.',
					'	 * @pair --ck-example-surface',
					'	 * @pair --ck-example-surface-hover',
					'	 * @pair --ck-missing',
					'	 */',
					'	--ck-example-text: black;',
					'}',
					''
				].join( '\n' )
			}
		} );

		await run();

		expectError( 'names "--ck-missing", which is not declared' );
		expect( console.log ).not.toHaveBeenCalledWith( expect.stringContaining( 'names "--ck-example-surface' ) );
	} );

	it( 'passes when a doc comment has many valid @pair tags', async () => {
		setup( {
			packages: {
				'ckeditor5-example/theme/example.css': [
					':root {',
					'	--ck-example-surface: white;',
					'	--ck-example-surface-hover: gray;',
					'',
					'	/**',
					'	 * Text.',
					'	 * @pair --ck-example-surface',
					'	 * @pair --ck-example-surface-hover',
					'	 */',
					'	--ck-example-text: black;',
					'}',
					''
				].join( '\n' )
			}
		} );

		await run();

		expect( process.exit ).not.toHaveBeenCalled();
	} );

	it( 'fails when a file listed in the maps of exceptions does not exist', async () => {
		setup( {
			packages: {
				'ckeditor5-ui/theme/globals/_border.css': '/**\n * The file.\n */\n:root {\n\t--ck-border-width-thin: 1px;\n}\n'
			}
		} );

		await run();

		expectError(
			'"ckeditor5-ui/theme/globals/_spacing.css" is listed in FILES_WITHOUT_TOKEN_DESCRIPTIONS, ' +
			'but it does not exist or has no ":root, :host" rule'
		);
		expectError( '"ckeditor5-ui/theme/globals/_poweredby.css" is listed in FILES_WITHOUT_DOC_COMMENTS' );
		expect( console.log ).not.toHaveBeenCalledWith( expect.stringContaining( '"ckeditor5-ui/theme/globals/_border.css" is listed' ) );
	} );

	it( 'fails when a file listed in the maps of exceptions has no root rule', async () => {
		setup( {
			packages: {
				'ckeditor5-ui/theme/globals/_border.css': '.ck-example {\n\t--ck-border-width-thin: 1px;\n}\n'
			}
		} );

		await run();

		expectError( '"ckeditor5-ui/theme/globals/_border.css" is listed in FILES_WITHOUT_TOKEN_DESCRIPTIONS' );
	} );

	it( 'fails when a new file with tokens in the globals of ckeditor5-ui has no description', async () => {
		setup( {
			packages: {
				'ckeditor5-ui/theme/globals/_semantic-example.css': ':root,\n:host {\n\t--ck-example: 1px;\n}\n'
			}
		} );

		await run();

		expectError(
			'packages/ckeditor5-ui/theme/globals/_semantic-example.css:1: the file has no description. ' +
			'Add a doc comment above its first ":root, :host" rule, or list the file in FILES_WITHOUT_DOC_COMMENTS with the reason.'
		);
	} );

	it( 'fails when a token in a new file in the globals of ckeditor5-ui has no description', async () => {
		setup( {
			packages: {
				'ckeditor5-ui/theme/globals/_semantic-example.css': '/**\n * The file.\n */\n:root,\n:host {\n\t--ck-example: 1px;\n}\n'
			}
		} );

		await run();

		expectError(
			'"--ck-example" has no description (packages/ckeditor5-ui/theme/globals/_semantic-example.css:6). ' +
			'Add a doc comment above it, or, if it is a step of the scale that the file description explains, ' +
			'add it to the `steps` of the file in FILES_WITHOUT_TOKEN_DESCRIPTIONS.'
		);
		expect( console.log ).not.toHaveBeenCalledWith( expect.stringContaining( 'the file has no description' ) );
	} );

	it( 'does not require token descriptions in a file in FILES_WITHOUT_TOKEN_DESCRIPTIONS', async () => {
		setup( {
			packages: {
				'ckeditor5-ui/theme/globals/_spacing.css': '/**\n * The file.\n */\n:root,\n:host {\n\t--ck-spacing-base: 1px;\n}\n'
			}
		} );

		await run();

		expect( console.log ).not.toHaveBeenCalledWith( expect.stringContaining( '_spacing.css' ) );
	} );

	it( 'requires the file description in a file in FILES_WITHOUT_TOKEN_DESCRIPTIONS', async () => {
		setup( {
			packages: {
				'ckeditor5-ui/theme/globals/_spacing.css': ':root,\n:host {\n\t--ck-spacing-base: 1px;\n}\n'
			}
		} );

		await run();

		expectError( 'packages/ckeditor5-ui/theme/globals/_spacing.css:1: the file has no description' );
	} );

	it( 'fails when every step of a file in FILES_WITHOUT_TOKEN_DESCRIPTIONS has a description', async () => {
		setup( {
			packages: {
				'ckeditor5-ui/theme/globals/_spacing.css': '/**\n * The file.\n */\n:root,\n:host {\n' +
					'\t/**\n\t * The base step.\n\t */\n\t--ck-spacing-base: 1px;\n}\n'
			}
		} );

		await run();

		expectError(
			'Every step of "ckeditor5-ui/theme/globals/_spacing.css" in FILES_WITHOUT_TOKEN_DESCRIPTIONS has a description. ' +
			'Remove the file from FILES_WITHOUT_TOKEN_DESCRIPTIONS.'
		);
	} );

	it( 'fails when a doc comment is followed by a semicolon', async () => {
		setup( {
			packages: {
				'ckeditor5-ui/theme/globals/colors/_foundation.css': [
					'/**',
					' * The file description.',
					' */',
					':root,',
					':host {',
					'	/**',
					'	 * Separated by a semicolon.',
					'	 */',
					'	;',
					'	--ck-color-base-background: white;',
					'}',
					''
				].join( '\n' )
			}
		} );

		await run();

		expectError( 'The doc comment in packages/ckeditor5-ui/theme/globals/colors/_foundation.css:6 does not describe anything' );
		expectError( '"--ck-color-base-background" has no description' );
	} );

	it( 'fails when a semicolon is hidden between two plain comments after a doc comment', async () => {
		setup( {
			packages: {
				'ckeditor5-ui/theme/globals/colors/_foundation.css': [
					'/**',
					' * The file description.',
					' */',
					':root,',
					':host {',
					'	/**',
					'	 * Separated by a semicolon between plain comments.',
					'	 */',
					'	/* a */ ; /* b */',
					'	--ck-color-base-background: white;',
					'}',
					''
				].join( '\n' )
			}
		} );

		await run();

		// A lazy match of the comment body would join the plain comments into one comment that hides the semicolon.
		expectError( 'The doc comment in packages/ckeditor5-ui/theme/globals/colors/_foundation.css:6 does not describe anything' );
		expectError( '"--ck-color-base-background" has no description' );
	} );

	it( 'takes a doc comment that ends where the declaration starts as its description', async () => {
		setup( {
			packages: {
				'ckeditor5-ui/theme/globals/colors/_foundation.css': '/**\n * The file.\n */\n:root,\n:host {\n' +
					'\t/**\n\t * Touching.\n\t */--ck-color-base-background: white;\n}\n'
			}
		} );

		await run();

		expect( console.log ).not.toHaveBeenCalledWith( expect.stringContaining( 'does not describe anything' ) );
		expect( console.log ).not.toHaveBeenCalledWith( expect.stringContaining( 'has no description' ) );
	} );

	it( 'fails when a doc comment describes a token in a root rule nested in a style rule', async () => {
		setup( {
			packages: {
				'ckeditor5-example/theme/example.css': [
					'.ck-example {',
					'	:root {',
					'		/**',
					'		 * Not read.',
					'		 */',
					'		--ck-example: red;',
					'	}',
					'}',
					''
				].join( '\n' )
			}
		} );

		await run();

		expectError( 'The doc comment in packages/ckeditor5-example/theme/example.css:3 describes "--ck-example" outside' );
	} );

	it( 'does not require descriptions of the tokens in a root rule nested in a style rule', async () => {
		setup( {
			packages: {
				'ckeditor5-ui/theme/globals/colors/_foundation.css': [
					'/**',
					' * The file description.',
					' */',
					':root,',
					':host {',
					'	/**',
					'	 * Described.',
					'	 */',
					'	--ck-color-base-background: white;',
					'}',
					'',
					'.ck-example {',
					'	:root {',
					'		--ck-color-base-background: black;',
					'	}',
					'}',
					''
				].join( '\n' )
			}
		} );

		await run();

		expect( console.log ).not.toHaveBeenCalledWith( expect.stringContaining( 'has no description' ) );
	} );

	it( 'fails when a doc comment describes a token in an at-rule nested in a root rule', async () => {
		setup( {
			packages: {
				'ckeditor5-example/theme/example.css': [
					':root,',
					':host {',
					'	--ck-example: red;',
					'',
					'	@media (prefers-reduced-motion: reduce) {',
					'		/**',
					'		 * Not read.',
					'		 */',
					'		--ck-example: blue;',
					'	}',
					'}',
					''
				].join( '\n' )
			}
		} );

		await run();

		expectError( 'The doc comment in packages/ckeditor5-example/theme/example.css:6 describes "--ck-example" outside' );
	} );

	it( 'does not require descriptions of the tokens in an at-rule nested in a root rule', async () => {
		setup( {
			packages: {
				'ckeditor5-ui/theme/globals/colors/_foundation.css': [
					'/**',
					' * The file description.',
					' */',
					':root,',
					':host {',
					'	/**',
					'	 * Described.',
					'	 */',
					'	--ck-color-base-background: white;',
					'',
					'	@media (prefers-color-scheme: dark) {',
					'		--ck-color-base-background: black;',
					'	}',
					'',
					'	/**',
					'	 * Described after the at-rule.',
					'	 */',
					'	--ck-color-base-foreground: black;',
					'}',
					''
				].join( '\n' )
			}
		} );

		await run();

		expect( console.log ).not.toHaveBeenCalledWith( expect.stringContaining( 'has no description' ) );
		expect( console.log ).not.toHaveBeenCalledWith( expect.stringContaining( 'outside the top-level' ) );
	} );

	it( 'requires the description of a token declared after an at-rule nested in a root rule', async () => {
		setup( {
			packages: {
				'ckeditor5-ui/theme/globals/colors/_foundation.css': [
					'/**',
					' * The file description.',
					' */',
					':root,',
					':host {',
					'	/**',
					'	 * Described.',
					'	 */',
					'	--ck-color-base-background: white;',
					'',
					'	@media (prefers-color-scheme: dark) {',
					'		--ck-color-base-background: black;',
					'	}',
					'',
					'	--ck-color-base-foreground: black;',
					'}',
					''
				].join( '\n' )
			}
		} );

		await run();

		expectError( '"--ck-color-base-foreground" has no description (packages/ckeditor5-ui/theme/globals/colors/_foundation.css:15)' );
	} );

	it( 'fails when a @pair or @deprecated tag is in the file description', async () => {
		setup( {
			packages: {
				'ckeditor5-example/theme/example.css': [
					'/**',
					' * The file description.',
					' * @pair --ck-example',
					' * @deprecated --ck-example',
					' */',
					':root {',
					'	--ck-example: red;',
					'}',
					''
				].join( '\n' )
			}
		} );

		await run();

		expectError(
			'The doc comment in packages/ckeditor5-example/theme/example.css:1 has the @pair and @deprecated tags, ' +
			'but it does not describe a token.'
		);
	} );

	it( 'fails when a tag is in the doc comment of a regular property', async () => {
		setup( {
			packages: {
				'ckeditor5-example/theme/example.css': ':root {\n\t--ck-example: red;\n}\n\n' +
					'.ck-example {\n\t/**\n\t * Why the color.\n\t * @pair --ck-example\n\t */\n\tcolor: red;\n}\n'
			}
		} );

		await run();

		expectError(
			'The doc comment in packages/ckeditor5-example/theme/example.css:6 has the @pair tag, but it does not describe a token'
		);
	} );

	it( 'fails when a tag is in the doc comment of a style rule or an at-rule', async () => {
		setup( {
			packages: {
				'ckeditor5-example/theme/example.css': [
					':root {',
					'	--ck-example: red;',
					'}',
					'',
					'/**',
					' * A class description.',
					' * @pair --ck-example',
					' */',
					'.ck-example {',
					'	color: red;',
					'}',
					'',
					'/**',
					' * A media query description.',
					' * @deprecated --ck-example',
					' */',
					'@media (forced-colors: active) {',
					'	.ck-example {',
					'		color: CanvasText;',
					'	}',
					'}',
					''
				].join( '\n' )
			}
		} );

		await run();

		expectError(
			'The doc comment in packages/ckeditor5-example/theme/example.css:5 has the @pair tag, but it does not describe a token'
		);
		expectError(
			'The doc comment in packages/ckeditor5-example/theme/example.css:13 has the @deprecated tag, but it does not describe a token'
		);
	} );

	it( 'requires descriptions of the roles in a file in FILES_WITHOUT_TOKEN_DESCRIPTIONS, but not of its steps', async () => {
		setup( {
			packages: {
				'ckeditor5-ui/theme/globals/_semantic-spacing.css': [
					'/**',
					' * The file description.',
					' */',
					':root,',
					':host {',
					'	--ck-spacing-control-padding-block: 4px;',
					'	--ck-spacing-padding: 8px;',
					'	--ck-spacing-padding-compact: 4px;',
					'	--ck-spacing-gap-spacious: 16px;',
					'	--ck-spacing-padding-control: 4px;',
					'	--ck-legacy--ck-spacing-gap: 8px;',
					'}',
					''
				].join( '\n' )
			}
		} );

		await run();

		expectError( '"--ck-spacing-control-padding-block" has no description' );
		// The steps pattern is matched against the whole name, so a token that only starts or ends with a tier is not
		// exempted, such as a future role with the prefix of a tier.
		expectError( '"--ck-spacing-padding-control" has no description' );
		expectError( '"--ck-legacy--ck-spacing-gap" has no description' );

		for ( const step of [ '--ck-spacing-padding', '--ck-spacing-padding-compact', '--ck-spacing-gap-spacious' ] ) {
			expect( console.log ).not.toHaveBeenCalledWith( expect.stringContaining( `"${ step }" has no description` ) );
		}
	} );

	it( 'requires the description of a token that is not a step in a file in FILES_WITHOUT_TOKEN_DESCRIPTIONS', async () => {
		setup( {
			packages: {
				'ckeditor5-ui/theme/globals/_fonts.css': '/**\n * The file.\n */\n:root,\n:host {\n' +
					'\t--ck-font-size-base: 16px;\n\t--ck-font-family: sans-serif;\n}\n'
			}
		} );

		await run();

		expectError( '"--ck-font-family" has no description (packages/ckeditor5-ui/theme/globals/_fonts.css:7)' );
		expect( console.log ).not.toHaveBeenCalledWith( expect.stringContaining( '"--ck-font-size-base" has no description' ) );
	} );

	it( 'fails when the steps of a file in FILES_WITHOUT_TOKEN_DESCRIPTIONS match no token of the file', async () => {
		setup( {
			packages: {
				'ckeditor5-ui/theme/globals/_zindex.css': '/**\n * The file.\n */\n:root,\n:host {\n' +
					'\t/**\n\t * Renamed.\n\t */\n\t--ck-layer-base: 1;\n}\n'
			}
		} );

		await run();

		expectError(
			'The steps of "ckeditor5-ui/theme/globals/_zindex.css" in FILES_WITHOUT_TOKEN_DESCRIPTIONS match no token of the file.'
		);
		expect( console.log ).not.toHaveBeenCalledWith( expect.stringContaining( 'Every step of "ckeditor5-ui/theme/globals/_zindex' ) );
	} );

	it( 'does not take a step declared outside the root rules as a step of the file', async () => {
		setup( {
			packages: {
				'ckeditor5-ui/theme/globals/_zindex.css': '/**\n * The file.\n */\n:root,\n:host {\n' +
					'\t/**\n\t * Renamed.\n\t */\n\t--ck-layer-base: 1;\n}\n\n.ck-example {\n\t--ck-z-base: 2;\n}\n'
			}
		} );

		await run();

		expectError( 'The steps of "ckeditor5-ui/theme/globals/_zindex.css" in FILES_WITHOUT_TOKEN_DESCRIPTIONS match no token' );
	} );

	it( 'does not require doc comments in a file in FILES_WITHOUT_DOC_COMMENTS', async () => {
		setup( {
			packages: {
				'ckeditor5-ui/theme/globals/_poweredby.css': ':root,\n:host {\n\t--ck-powered-by-background: red;\n}\n'
			}
		} );

		await run();

		expect( console.log ).not.toHaveBeenCalledWith( expect.stringContaining( '_poweredby.css' ) );
	} );

	it( 'does not require doc comments in a file in the globals of ckeditor5-ui that has no root rule', async () => {
		setup( {
			packages: {
				'ckeditor5-ui/theme/globals/_hidden.css': '.ck-hidden {\n\tdisplay: none;\n}\n'
			}
		} );

		await run();

		expect( console.log ).not.toHaveBeenCalledWith( expect.stringContaining( '_hidden.css' ) );
	} );

	it( 'does not require doc comments in a file with tokens outside the globals of ckeditor5-ui', async () => {
		setup( {
			packages: {
				'ckeditor5-ui/theme/components/example/example.css': ':root,\n:host {\n\t--ck-example: 1px;\n}\n'
			}
		} );

		await run();

		expect( console.log ).not.toHaveBeenCalledWith( expect.stringContaining( 'example.css' ) );
	} );

	it( 'does not check the maps of exceptions when the validated packages do not include ckeditor5-ui', async () => {
		process.argv.push( '--base-packages', 'external/packages' );

		setup( {
			packages: {
				'ckeditor5-example/theme/example.css': ':root {\n\t--ck-example: red;\n}\n'
			},
			basePackages: {
				'ckeditor5-ui/theme/globals/_border.css': ':root {\n\t--ck-border-width-thin: 1px;\n}\n'
			}
		} );

		await run();

		expect( process.exit ).not.toHaveBeenCalled();
	} );

	it( 'does not require descriptions of the tokens in other files', async () => {
		setup( {
			packages: {
				'ckeditor5-example/theme/example.css': ':root {\n\t--ck-example: red;\n}\n'
			}
		} );

		await run();

		expect( process.exit ).not.toHaveBeenCalled();
	} );
} );
