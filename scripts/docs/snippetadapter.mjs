/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import url from 'url';
import { constants, readFile, writeFile, copyFile, access, mkdir } from 'fs/promises';
import upath from 'upath';
import { build as esbuild } from 'esbuild';
import { CKEDITOR5_COMMERCIAL_PATH, CKEDITOR5_ROOT_PATH } from '../constants.mjs';

/**
 * @param {Set<Snippet>} snippets Snippet collection extracted from documentation files.
 * @param {Record<string, any>} options
 * @param {Record<string, function>} umbertoHelpers
 * @returns {Promise<void>}
 */
export default async function snippetAdapter( snippets, _options, { getSnippetPlaceholder } ) {
	console.log( 'Started building snippets.' );

	const paths = getPaths( snippets );
	const imports = await getImportMap();
	const constants = await getConstants();

	await addBootstrapSnippet( snippets, paths );
	await buildSnippets( snippets, paths, constants, imports );
	await buildDocuments( snippets, paths, constants, imports, getSnippetPlaceholder );

	console.log( 'Finished building snippets.' );
}

/**
 * Returns input and output paths for snippets and other assets.
 *
 * @param {Set<Snippet>} snippets
 * @returns {Paths}
 */
function getPaths( [ snippet ] ) {
	const version = upath.normalize( snippet.outputPath ).split( upath.sep ).at( -2 );
	const input = upath.normalize( snippet.snippetSources.html ).split( version, 1 ) + version;

	return {
		input,
		output: upath.resolve( snippet.outputPath, '..' ),
		snippetsInput: upath.resolve( input, '_snippets' ),
		snippetsOutput: snippet.outputPath
	};
}

/**
 * Returns dependencies of a given package.
 *
 * @param {string} packageName
 * @returns {Promise<Array<string>>}
 */
async function getDependencies( packageName ) {
	try {
		const path = new URL( import.meta.resolve( `${ packageName }/package.json` ) );
		const content = await readFile( path, { encoding: 'utf-8' } );

		return Object.keys( JSON.parse( content ).dependencies );
	} catch {
		return [];
	}
}

/**
 * Builds all snippets from the provided paths and saves them to the output path.
 *
 * @param {Set<Snippet>} snippets
 * @param {Paths} paths
 * @param {Record<string, string>} constants
 * @param {Record<string, any>} imports
 * @returns {Promise<void>}
 */
async function buildSnippets( snippets, paths, constants, imports ) {
	const externals = Object.keys( imports );

	await esbuild( {
		entryPoints: Array.from( snippets ).map( snippet => snippet.snippetSources.js ).filter( Boolean ),
		define: Object.fromEntries( Object.entries( constants ).map( ( [ key, value ] ) => [ key, JSON.stringify( value ) ] ) ),
		outdir: paths.snippetsOutput,
		entryNames: '[dir]/[name]/snippet',
		nodePaths: [
			/**
			 * This script can be run from a location where the local `node_modules` directory is not available
			 * (e.g. in https://github.com/cksource/docs/). To ensure that all dependencies can be resolved,
			 * we need to add the local `node_modules` directory to the list of node paths.
			 */
			upath.join( CKEDITOR5_ROOT_PATH, 'node_modules' )
		],
		bundle: true,
		minify: true,
		treeShaking: true,
		platform: 'browser',
		legalComments: 'none',
		format: 'esm',
		target: 'es2022',
		tsconfigRaw: {},
		alias: {
			'@snippets': paths.snippetsInput,
			'@assets': upath.resolve( paths.input, 'assets' )
		},
		loader: {
			'.js': 'jsx',
			'.svg': 'text'
		},
		plugins: [
			/**
			 * Esbuild has an `external` property. However, it doesn't look for direct match, but checks if the path starts
			 * with the provided value. This means that if the `external` array includes `@ckeditor/ckeditor5-core` and we
			 * have an import like `@ckeditor/ckeditor5-core/tests/...`, then it will be marked as external instead of being
			 * bundled. This will cause issues, because the `tests` directory is not available in the CDN build.
			 */
			{
				name: 'externalize-ckeditor5',
				setup( build ) {
					build.onResolve( { filter: /.*/ }, args => ( {
						external: externals.some( name => name.endsWith( '/' ) ? args.path.startsWith( name ) : args.path === name )
					} ) );
				}
			},

			/**
			 * Code from "ckeditor5" and "ckeditor5-premium-features" is externalized to avoid bundling it with the snippet
			 * code. However, if the source file is imported directly, it can be bundled and (in case of commercial features)
			 * not obfuscated. To prevent this, we throw an error if such an import is detected.
			 */
			{
				name: 'throw-on-source-import',
				setup( build ) {
					build.onLoad( { filter: /packages[\\/].*[\\/]src/ }, args => ( {
						errors: [
							{
								// eslint-disable-next-line @stylistic/max-len
								text: `Can't use the source file "${ args.path }" in the snippet. Use "ckeditor5" or "ckeditor5-premium-features" import instead.`
							}
						]
					} ) );
				}
			}
		]
	} );
}

/**
 * Builds documents and replaces all placeholders with the actual content.
 *
 * @param {Set<Snippet>} snippets
 * @param {Paths} paths
 * @param {Record<string, string>} constants
 * @param {Record<string, any>} imports
 * @param {function} getSnippetPlaceholder
 * @returns {Promise<void>}
 */
async function buildDocuments( snippets, paths, constants, imports, getSnippetPlaceholder ) {
	const getStyle = href => `<link rel="stylesheet" href="${ href }" data-cke="true">`;
	const getScript = src => `<script type="module" src="${ src }"></script>`;
	const documents = {};

	// TODO: Use `Object.groupBy` instead, when we migrate to Node 22.
	for ( const snippet of snippets ) {
		documents[ snippet.destinationPath ] ??= [];
		documents[ snippet.destinationPath ].push( snippet );
	}

	// Gather global tags added to each document that do not require relative paths.
	const globalTags = [
		`<script type="importmap">${ JSON.stringify( { imports } ) }</script>`,
		`<script>window.CKEDITOR_GLOBAL_LICENSE_KEY = '${ constants.LICENSE_KEY }';</script>`,
		'<script defer src="%BASE_PATH%/assets/global.js"></script>',
		'<script defer src="https://cdn.ckbox.io/ckbox/latest/ckbox.js"></script>',
		getStyle( '%BASE_PATH%/assets/ckeditor5/ckeditor5.css' ),
		getStyle( '%BASE_PATH%/assets/ckeditor5-premium-features/ckeditor5-premium-features.css' ),
		getStyle( '%BASE_PATH%/assets/global.css' ),
		'<link rel="modulepreload" href="%BASE_PATH%/assets/ckeditor5/ckeditor5.js">',
		'<link rel="modulepreload" href="%BASE_PATH%/assets/ckeditor5-premium-features/ckeditor5-premium-features.js">'
	];

	// Iterate over each document and replace placeholders with the actual content.
	for ( const [ document, documentSnippets ] of Object.entries( documents ) ) {
		const documentTags = [ ...globalTags ];
		const relativeOutputPath = upath.relative( upath.dirname( document ), paths.output );

		let documentContent = await readFile( document, { encoding: 'utf-8' } );

		// Iterate over each snippet in the document and replace placeholders with the actual content.
		for ( const snippet of documentSnippets ) {
			const data = await readFile( snippet.snippetSources.html, { encoding: 'utf-8' } );

			documentContent = documentContent.replace(
				getSnippetPlaceholder( snippet.snippetName ),
				() => `<div class="live-snippet">${ data }</div>`
			);

			if ( await fileExists( upath.join( snippet.outputPath, snippet.snippetName, 'snippet.js' ) ) ) {
				documentTags.push( getScript( `%BASE_PATH%/snippets/${ snippet.snippetName }/snippet.js` ) );
			}

			if ( await fileExists( upath.join( snippet.outputPath, snippet.snippetName, 'snippet.css' ) ) ) {
				documentTags.push( getStyle( `%BASE_PATH%/snippets/${ snippet.snippetName }/snippet.css` ) );
			}
		}

		documentContent = documentContent
			.replace( '<!--UMBERTO: SNIPPET: CSS-->', () => documentTags.join( '\n' ) )
			.replace( '<!--UMBERTO: SNIPPET: JS-->', () => '' )
			.replaceAll( /%BASE_PATH%/g, () => relativeOutputPath );

		await writeFile( document, documentContent );
	}
}

/**
 * Returns the license key or 'GPL' if the file with the license key is not found.
 *
 * @returns {Promise<Record<string, string>>}
 */
async function getConstants() {
	try {
		const scriptPath = upath.join( CKEDITOR5_COMMERCIAL_PATH, 'docs', 'constants.cjs' );
		const { href } = url.pathToFileURL( scriptPath );
		const { default: constants } = await import( href );

		return constants;
	} catch {
		return { LICENSE_KEY: 'GPL' };
	}
}

/**
 * Returns an import map for the CKEditor 5 packages.
 *
 * @returns {Promise<Object<string, string>>}
 */
async function getImportMap() {
	const core = await getDependencies( 'ckeditor5' );
	const commercial = await getDependencies( 'ckeditor5-premium-features' );

	const imports = {
		'ckeditor5': '%BASE_PATH%/assets/ckeditor5/ckeditor5.js',
		'ckeditor5/': '%BASE_PATH%/assets/ckeditor5/',
		'ckeditor5-premium-features': '%BASE_PATH%/assets/ckeditor5-premium-features/ckeditor5-premium-features.js',
		'ckeditor5-premium-features/': '%BASE_PATH%/assets/ckeditor5-premium-features/'
	};

	/**
	 * Some snippets may use imports from individual packages instead of the main `ckeditor5` or
	 * `ckeditor5-premium-features` packages. In such cases, we need to add these imports to the import map.
	 */
	for ( const dependency of core ) {
		imports[ dependency ] ||= imports.ckeditor5;
		imports[ `${ dependency }/dist/index.js` ] ||= imports.ckeditor5;
	}

	for ( const dependency of commercial ) {
		imports[ dependency ] ||= imports[ 'ckeditor5-premium-features' ];
		imports[ `${ dependency }/dist/index.js` ] ||= imports[ 'ckeditor5-premium-features' ];
	}

	return imports;
}

/**
 * Checks if a file exists at the given path.
 *
 * @param {string} path The path to the file.
 * @returns {Promise<boolean>} True if the file exists, false otherwise.
 */
async function fileExists( path ) {
	try {
		await access( path, constants.F_OK );

		return true;
	} catch {
		return false;
	}
}

/**
 * The `examples/bootstrap-ui.html` is a special case, because it cannot be inlined like other snippets.
 * This is because it includes Bootstrap assets which leak into the rest of the document, breaking the
 * styles, so, we need to load it in an iframe. This function creates the necessary data for to process
 * this snippet like a regular document, rather than a snippet.
 *
 * @param {Set<Snippet>} snippets
 * @param {Paths} paths
 * @returns {Promise<void>}
 */
async function addBootstrapSnippet( snippets, paths ) {
	const destinationPath = upath.join( paths.snippetsOutput, 'examples', 'bootstrap-ui.html' );
	const basePath = upath.relative( upath.dirname( destinationPath ), paths.output );

	const snippet = {
		basePath,
		destinationPath,
		outputPath: paths.snippetsOutput,
		pageSourcePath: '',
		relativeOutputPath: upath.join( basePath, 'snippets' ),
		snippetName: 'examples/bootstrap-ui',
		snippetSources: {
			html: upath.join( paths.snippetsInput, 'examples', 'bootstrap-ui.html' ),
			js: upath.join( paths.snippetsInput, 'examples', 'bootstrap-ui.js' )
		}
	};

	await mkdir( upath.dirname( destinationPath ), { recursive: true } );
	await copyFile( snippet.snippetSources.html, destinationPath );

	snippets.add( snippet );
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

/**
 * @typedef {Object} Paths
 * @property {string} input Path to the directory created by Umberto containing all the documentation files.
 * @property {string} output Path to the output directory where processed documentation will be saved.
 * @property {string} snippetsInput Path to the directory created by Umberto containing the input snippets.
 * @property {string} snippetsOutput Path to the directory where output snippets will be written.
 */
