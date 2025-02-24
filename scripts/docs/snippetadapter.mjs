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
 * @param {Set.<Snippet>} snippets Snippet collection extracted from documentation files.
 * @param {Object} options
 * @param {Boolean} options.production Whether to build snippets in production mode.
 * @param {Array.<String>|undefined} options.allowedSnippets An array that contains glob patterns of snippets that should be built.
 * If not specified or if passed the empty array, all snippets will be built.
 * @param {Object.<String, Function>} umbertoHelpers
 * @returns {Promise}
 */
export default async function snippetAdapter( snippets, _, { getSnippetPlaceholder } ) {
	const { outputPath, snippetsInputPath, snippetsOutputPath } = getPaths( snippets );
	const constants = await getConstantDefinitions( snippets );
	const imports = await getImportMap();
	const globalAssets = await buildSnippet(
		{ js: upath.resolve( snippetsInputPath, 'assets.js' ) },
		snippetsOutputPath
	);

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

	await buildSnippets(
		getAllSnippets( snippetsInputPath ),
		snippetsOutputPath,
		constants,
		imports,
		headerTags
	);

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

	console.log( 'Finished building snippets.' );
}

function getPaths( [ snippet ] ) {
	const snippetsInputPath = upath.resolve( snippet.snippetSources.html, snippet.basePath );

	return {
		outputPath: upath.resolve( snippet.outputPath, '..' ),
		snippetsInputPath,
		snippetsOutputPath: snippet.outputPath
	};
}

/**
 *
 * @param {String} packageName
 * @returns {Promise<Object>}
 */
async function getPackageJson( packageName ) {
	const path = require.resolve( `${ packageName }/package.json` );
	const content = fs.readFileSync( path, { encoding: 'utf-8' } );

	return JSON.parse( content );
}

function getAllSnippets( path ) {
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

async function buildSnippets( snippets, snippetsOutputPath, constants, imports, headerTags ) {
	const external = Object.keys( imports );
	const define = {};

	for ( const definitionKey in constants ) {
		define[ definitionKey ] = JSON.stringify( constants[ definitionKey ] );
	}

	for ( const [ name, files ] of Object.entries( snippets ) ) {
		if ( !files.html || !files.js ) {
			continue; // Only build snippets that have both HTML and JS files.
		}

		const result = await buildSnippet( files, snippetsOutputPath, external, define );

		const data = [
			'<div class="live-snippet">',
			fs.readFileSync( files.html, { encoding: 'utf-8' } ),
			...result,
			'</div>'
		]
			.filter( Boolean )
			.join( '\n' )
			.replace( '<!--UMBERTO: SNIPPET: CSS-->', () => headerTags )
			.replace( '<!--UMBERTO: SNIPPET: JS-->', () => '' );

		const path = upath.resolve( snippetsOutputPath, name, 'snippet.html' );

		fs.mkdirSync( upath.dirname( path ), { recursive: true } );
		fs.writeFileSync( path, data );
	}
}

async function buildSnippet( files, outputPath, externals = [], define = {} ) {
	const { name, dir, base } = upath.parse( files.js );

	const result = await esbuild( {
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
 * @param {Array.<String>} coreDependencies
 * @param {Array.<String>} commercialDependencies
 * @returns {Promise.<Object.<String,String>>}
 */
async function getImportMap() {
	const core = await getPackageJson( 'ckeditor5' );
	const commercial = await getPackageJson( 'ckeditor5-premium-features' );

	const imports = {
		'ckeditor5': 'https://cdn.ckeditor.com/ckeditor5/nightly-next/ckeditor5.js',
		'ckeditor5/': 'https://cdn.ckeditor.com/ckeditor5/nightly-next/',
		'ckeditor5-premium-features': 'https://cdn.ckeditor.com/ckeditor5-premium-features/nightly-next/ckeditor5-premium-features.js',
		'ckeditor5-premium-features/': 'https://cdn.ckeditor.com/ckeditor5-premium-features/nightly-next/',
		'@ckeditor/ckeditor5-inspector': 'https://esm.sh/@ckeditor/ckeditor5-inspector@4.1.0/es2022/ckeditor5-inspector.mjs',
		'@ckeditor/ckeditor5-inspector/build/miniinspector.js':
			'https://esm.sh/@ckeditor/ckeditor5-inspector@4.1.0/es2022/build/miniinspector.mjs'
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
 * @param {Array.<Object>} snippets
 * @returns {Object}
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
 *
 * @property {SnippetSource} snippetSources Sources of the snippet.
 *
 * @property {String} snippetName Name of the snippet. Defined directly after `@snippet` tag.
 *
 * @property {String} outputPath An absolute path where to write file produced by the `snippetAdapter`.
 *
 * @property {String} destinationPath An absolute path to the file where the snippet is being used.
 *
 * @property {String} [basePath] Relative path from the processed file to the root of the documentation.
 *
 * @property {String} [relativeOutputPath] The same like `basePath` but for the output path (where processed file will be saved).
 */

/**
 * @typedef {Object} SnippetSource
 *
 * @property {String} html An absolute path to the HTML sample.
 *
 * @property {String} css An absolute path to the CSS sample.
 *
 * @property {String} js An absolute path to the JS sample.
 */
