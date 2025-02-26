/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* eslint-env node */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import upath from 'upath';
import { globSync } from 'glob';
import { build as esbuild } from 'esbuild';

const require = createRequire( import.meta.url );
const __dirname = upath.dirname( fileURLToPath( import.meta.url ) );

/**
 * @param {Set<Snippet>} snippets Snippet collection extracted from documentation files.
 * @param {Record<string, any>} options
 * @param {Record<string, function>} umbertoHelpers
 * @returns {Promise<void>}
 */
export default async function snippetAdapter( snippets, _options, { getSnippetPlaceholder } ) {
	console.log( 'Started building snippets.' );

	const { snippetsInputPath, snippetsOutputPath } = getPaths( snippets );
	const constants = await getConstantDefinitions( snippets );
	const imports = await getImportMap();

	// Build global asset that is used in multiple snippets.
	// TODO: Use direct import to functions instead
	const globalAssets = await buildSnippet(
		{ js: upath.resolve( snippetsInputPath, 'assets.js' ) },
		snippetsOutputPath
	);

	// Gather global headers added to every document.
	const headerTags = [
		`<link
			rel="stylesheet"
			href="https://cdn.ckeditor.com/ckeditor5/nightly-next/ckeditor5.css"
		/>`,
		`<link
			rel="stylesheet"
			href="https://cdn.ckeditor.com/ckeditor5-premium-features/nightly-next/ckeditor5-premium-features.css"
		/>`,
		`<script type="importmap">${ JSON.stringify( { imports } ) }</script>`,
		`<script>window.CKEDITOR_GLOBAL_LICENSE_KEY = '${ constants.LICENSE_KEY }';</script>`,
		...globalAssets
	].join( '\n' );

	// Build all snippets and save them as HTML files. At this stage, the %BASE_PATH% placeholders are not replaced yet.
	await buildSnippets(
		getAllSnippets( snippetsInputPath ),
		snippetsOutputPath,
		constants,
		imports,
		headerTags
	);

	// Build all documents and replace the snippet and %BASE_PATH% placeholders with the actual content.
	await buildDocuments(
		snippets,
		headerTags,
		getSnippetPlaceholder
	);

	console.log( 'Finished building snippets.' );
}

/**
 * Returns input and output paths for snippets and other assets.
 *
 * @param {Set<Snippet>} snippets
 * @returns {Record<string, string>}
 */
function getPaths( [ snippet ] ) {
	const version = upath.normalize( snippet.outputPath ).split( upath.sep ).at( -2 );
	const inputPath = upath.normalize( snippet.snippetSources.html ).split( version, 1 ) + version;

	return {
		inputPath,
		outputPath: upath.resolve( snippet.outputPath, '..' ),
		snippetsInputPath: upath.resolve( inputPath, '_snippets' ),
		snippetsOutputPath: snippet.outputPath
	};
}

/**
 * Returns the content of the `package.json` file for a given package.
 *
 * @param {string} packageName
 * @returns {Promise<Record<string, unknown>>}
 */
async function getPackageJson( packageName ) {
	const path = require.resolve( `${ packageName }/package.json` );
	const content = fs.readFileSync( path, { encoding: 'utf-8' } );

	return JSON.parse( content );
}

/**
 * Returns snippet files grouped by their name.
 *
 * @param {string} path
 * @returns {Record<string, SnippetSource>}
 */
function getAllSnippets( path ) {
	// TODO: Most of this logic can be removed, if JS files directly import CSS files.

	// Snippets grouped by their name.
	const snippets = {};

	for ( const entry of fs.readdirSync( path, { withFileTypes: true, recursive: true } ) ) {
		if ( entry.isDirectory() ) {
			continue;
		}

		/**
		 * Given that the `snippetsFolder` is `/absolute/path/to`, the following values will be:
		 *
		 * path 					/absolute/path/to/some/resource.html
		 * dir						/absolute/path/to/some
		 * name						resource
		 * ext						.html
		 * snippetName		some/resource
		 */
		const filePath = upath.join( entry.parentPath, entry.name );
		const { dir, name, ext } = upath.parse( filePath );
		const snippetName = upath.relative( path, upath.join( dir, name ) );
		const data = snippets[ snippetName ] ??= {};

		data[ ext.substring( 1 ) ] = filePath;
	}

	return snippets;
}

/**
 * Builds all snippets from the provided paths and saves them to the output path.
 *
 * @param {Record<string, SnippetSource>} snippets
 * @param {string} snippetsOutputPath
 * @param {Record<string, any>} constants
 * @param {Record<string, any>} imports
 * @param {string} headerTags
 */
async function buildSnippets( snippets, snippetsOutputPath, constants, imports, headerTags ) {
	const external = Object.keys( imports );
	const define = {};

	for ( const definitionKey in constants ) {
		define[ definitionKey ] = JSON.stringify( constants[ definitionKey ] );
	}

	for ( const [ name, files ] of Object.entries( snippets ) ) {
		if ( !files.html || !files.js ) {
			continue;
		}

		const result = await buildSnippet( files, snippetsOutputPath, external, define );

		const data = [
			'<div class="live-snippet">',
			fs.readFileSync( files.html, { encoding: 'utf-8' } ),
			...result,
			'</div>'
		]
			.join( '\n' )
			.replace( '<!--UMBERTO: SNIPPET: CSS-->', () => headerTags )
			.replace( '<!--UMBERTO: SNIPPET: JS-->', () => '' );

		const path = upath.resolve( snippetsOutputPath, name, 'snippet.html' );

		fs.mkdirSync( upath.dirname( path ), { recursive: true } );
		fs.writeFileSync( path, data );
	}
}

/**
 * Build individual snippet.
 *
 * @param {SnippetSource} files
 * @param {string} outputPath
 * @param {Array<string>} externals
 * @param {Record<string, string>} define
 * @returns {Promise<Array<string>>}
 */
async function buildSnippet( files, outputPath, externals = [], define = {} ) {
	const { name, dir, base } = upath.parse( files.js );

	const result = await esbuild( {
		/**
		 * TODO: If all JS snippets directly import CSS files, then we can use `entryPoints`
		 * instead of `stdin` and simplify this.
		 * https://esbuild.github.io/api/#entry-points
		 */
		stdin: {
			contents: `
				${ files.css ? `import './${ name }.css';` : '' }
				${ fs.readFileSync( files.js, { encoding: 'utf-8' } ) }
			`,
			resolveDir: dir,
			sourcefile: base,
			loader: 'jsx'
		},
		entryNames: '[dir]/snippet',
		bundle: true,
		minify: true,
		write: false,
		define,
		outdir: upath.join( outputPath, name ),
		platform: 'browser',
		legalComments: 'none',
		format: 'esm',
		target: 'es2022',
		tsconfigRaw: {},
		loader: {
			'.js': 'jsx',
			'.svg': 'text'
		},
		plugins: [
			/**
			 * TODO: Esbuild has an `external` property. However, it doesn't look for direct match, but checks if the
			 * path starts with the provided value. This means that if the `external` array includes `@ckeditor/ckeditor5-core`
			 * and we import like `@ckeditor/ckeditor5-core/tests/...`, then it will be marked as external instead of bundled.
			 * This will cause issues, because the `tests` directory is not available in the CDN build.
			 *
			 * If we update all imports in snippets to use the `ckeditor5` or `ckeditor5-premium-features` for all code that
			 * is available publicly, then we can use the `external` property and simplify this.
			 */
			{
				name: 'external',
				setup( build ) {
					build.onResolve( { filter: /.*/ }, args => ( {
						external: externals.some( name => name.endsWith( '/' ) ? args.path.startsWith( name ) : args.path === name )
					} ) );
				}
			}
		]
	} );

	return result.outputFiles.map( output => {
		return upath.extname( output.path ) === '.css' ?
			`<style data-cke="true">${ output.text }</style>` :
			`<script type="module">${ output.text }</script>`;
	} );
}

/**
 * Builds documents and replaces all placeholders with the actual content.
 *
 * @param {Array<Snippet>} snippets
 * @param {string} headerTags
 * @param {function} getSnippetPlaceholder
 */
async function buildDocuments( snippets, headerTags, getSnippetPlaceholder ) {
	const { outputPath, snippetsOutputPath } = getPaths( snippets );

	// Group snippets by the destination document.
	const documents = {};

	// TODO: Use `Object.groupBy` instead, when we migrate to Node 22.
	for ( const snippet of snippets ) {
		documents[ snippet.destinationPath ] ??= [];
		documents[ snippet.destinationPath ].push( snippet );
	}

	for ( const [ document, documentSnippets ] of Object.entries( documents ) ) {
		const snippetSrc = upath.relative( upath.dirname( document ), upath.join( outputPath, 'assets', 'snippet.js' ) );

		let documentContent = fs
			.readFileSync( document, { encoding: 'utf-8' } )
			.replace( '<!--UMBERTO: SNIPPET: CSS-->', () => headerTags + `<script src="${ snippetSrc }"></script>` )
			.replace( '<!--UMBERTO: SNIPPET: JS-->', () => '' );

		for ( const snippet of documentSnippets ) {
			const data = fs.readFileSync(
				upath.resolve( snippetsOutputPath, snippet.snippetName, 'snippet.html' ),
				{ encoding: 'utf-8' }
			);

			documentContent = documentContent.replace(
				getSnippetPlaceholder( snippet.snippetName ),
				() => data.replaceAll( /%BASE_PATH%/g, () => snippet.basePath )
			);
		}

		fs.writeFileSync( document, documentContent );
	}
}

/**
 * Returns an import map for the CKEditor 5 packages.
 *
 * @returns {Promise<Object<string, string>>}
 */
async function getImportMap() {
	/**
	 * TODO: If we update all imports in snippets to use the `ckeditor5` or `ckeditor5-premium-features` for all code that
	 * is available publicly, then we can skip loading the package.json files and have a static import map.
	 */
	const core = await getPackageJson( 'ckeditor5' );
	const commercial = await getPackageJson( 'ckeditor5-premium-features' );

	const imports = {
		'ckeditor5': 'https://cdn.ckeditor.com/ckeditor5/nightly-next/ckeditor5.js',
		'ckeditor5/': 'https://cdn.ckeditor.com/ckeditor5/nightly-next/',
		'ckeditor5-premium-features': 'https://cdn.ckeditor.com/ckeditor5-premium-features/nightly-next/ckeditor5-premium-features.js',
		'ckeditor5-premium-features/': 'https://cdn.ckeditor.com/ckeditor5-premium-features/nightly-next/'
	};

	/**
	 * Some snippets may use imports from individual packages instead of the main `ckeditor5` or
	 * `ckeditor5-premium-features` packages. In such cases, we need to add these imports to the import map.
	 */
	for ( const dependency of Object.keys( core.dependencies ) ) {
		imports[ dependency ] ||= imports.ckeditor5;
		imports[ `${ dependency }/dist/index.js` ] ||= imports.ckeditor5;
	}

	for ( const dependency of Object.keys( commercial.dependencies ) ) {
		imports[ dependency ] ||= imports[ 'ckeditor5-premium-features' ];
		imports[ `${ dependency }/dist/index.js` ] ||= imports[ 'ckeditor5-premium-features' ];
	}

	return imports;
}

/**
 * Adds constants to the webpack process from external repositories containing `docs/constants.js` files.
 *
 * @param {Array<Snippet>} snippets
 * @returns {Promise<Record<string, unknown>>}
 */
async function getConstantDefinitions( snippets ) {
	const knownPaths = new Set();
	const constantDefinitions = {};
	const constantOrigins = new Map();

	for ( const snippet of snippets ) {
		if ( !snippet.pageSourcePath ) {
			continue;
		}

		let directory = upath.dirname( snippet.pageSourcePath );

		while ( !knownPaths.has( directory ) ) {
			knownPaths.add( directory );

			const constantsFiles = globSync( 'constants.*js', {
				absolute: true,
				cwd: upath.join( directory, 'docs' )
			} );

			for ( const item of constantsFiles ) {
				const importPathToConstants = upath.relative( __dirname, item );

				const { default: packageConstantDefinitions } = await import( './' + importPathToConstants );

				for ( const constantName in packageConstantDefinitions ) {
					const constantValue = packageConstantDefinitions[ constantName ];

					if ( constantDefinitions[ constantName ] && constantDefinitions[ constantName ] !== constantValue ) {
						throw new Error(
							`Definition for the '${ constantName }' constant is duplicated` +
							` (${ importPathToConstants }, ${ constantOrigins.get( constantName ) }).`
						);
					}

					constantDefinitions[ constantName ] = constantValue;
					constantOrigins.set( constantName, importPathToConstants );
				}

				Object.assign( constantDefinitions, packageConstantDefinitions );
			}

			directory = upath.dirname( directory );
		}
	}

	return constantDefinitions;
}

/**
 * @typedef {Object} Snippet
 * @property {SnippetSource} snippetSources Sources of the snippet.
 * @property {string} snippetName Name of the snippet. Defined directly after `@snippet` tag.
 * @property {string} outputPath An absolute path where to write file produced by the `snippetAdapter`.
 * @property {string} destinationPath An absolute path to the file where the snippet is being used.
 * @property {string} basePath Relative path from the processed file to the root of the documentation.
 * @property {string} relativeOutputPath The same like `basePath` but for the output path (where processed file will be saved).
 */

/**
 * @typedef {Object} SnippetSource
 * @property {string} html An absolute path to the HTML sample.
 * @property {string} css An absolute path to the CSS sample.
 * @property {string} js An absolute path to the JS sample.
 */
