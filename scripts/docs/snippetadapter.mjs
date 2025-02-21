/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* eslint-env node */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import upath from 'upath';
import { build } from 'vite';
import { globSync } from 'glob';
import { viteSingleFile } from 'vite-plugin-singlefile';

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
	const { inputPath, outputPath, snippetsInputPath, snippetsOutputPath } = getPaths( snippets );
	const constants = await getConstantDefinitions( snippets );
	const imports = await getImportMap();
	const globalAsset = await buildGlobalAsset( upath.resolve( snippetsInputPath, 'assets.js' ) );

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
		`<script>${ globalAsset }</script>`
	];

	await buildSnippets(
		getAllSnippets( snippetsInputPath ),
		inputPath,
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
		let documentContent = fs.readFileSync( document, { encoding: 'utf-8' } );

		for ( const snippet of documentSnippets ) {
			const path = upath.resolve( snippetsOutputPath, snippet.snippetName, 'snippet.html' );

			documentContent = documentContent.replace(
				getSnippetPlaceholder( snippet.snippetName ),
				() => fs.readFileSync( path, { encoding: 'utf-8' } )
			);
		}

		const tags = [
			...headerTags,
			`<script src="${ upath.relative( upath.dirname( document ), upath.join( outputPath, 'assets', 'snippet.js' ) ) }"></script>`
		];

		documentContent = documentContent.replace( '<!--UMBERTO: SNIPPET: CSS-->', () => tags.join( '\n' ) );
		documentContent = documentContent.replace( '<!--UMBERTO: SNIPPET: JS-->', () => '' );

		fs.writeFileSync( document, documentContent );
	}

	console.log( 'Finished building snippets.' );
}

function getPaths( [ snippet ] ) {
	const snippetsInputPath = upath.resolve( snippet.snippetSources.html, snippet.basePath );

	return {
		inputPath: upath.resolve( snippetsInputPath, '..' ),
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

/**
 * @param {String} entry
 * @returns {Promise<String>}
 */
async function buildGlobalAsset( entry ) {
	const result = await build( {
		clearScreen: false,
		logLevel: 'warn',
		build: {
			lib: {
				entry,
				name: 'asset',
				fileName: 'asset.js',
				formats: [ 'es' ]
			},
			modulePreload: false,
			target: 'es2022',
			cssTarget: [ 'es2022' ],
			write: false
		},
		plugins: [
			viteSingleFile( {
				removeViteModuleLoader: true
			} )
		]
	} );

	return result[ 0 ].output[ 0 ].code;
}

async function buildSnippets( snippets, inputPath, snippetsOutputPath, constants, imports, headerTags ) {
	const external = Object.keys( imports );
	const define = {};

	for ( const definitionKey in constants ) {
		define[ definitionKey ] = JSON.stringify( constants[ definitionKey ] );
	}

	for ( const [ name, files ] of Object.entries( snippets ) ) {
		if ( !files.html ) {
			continue; // Do not build JS- and CSS-only snippets.
		}

		const result = await build( {
			clearScreen: false,
			logLevel: 'warn',
			define,
			build: {
				modulePreload: false,
				target: 'es2022',
				cssTarget: [ 'es2022' ],
				write: false,
				rollupOptions: {
					input: files.html,
					external
				}
			},
			plugins: [
				{
					name: 'virtual-html',
					resolveId( id ) {
						if ( id === files.html ) {
							return id;
						}
					},
					async load( id ) {
						if ( id === files.html ) {
							return [
								'<div class="live-snippet">',
								files.css && `<link rel="stylesheet" href="${ files.css }" type="text/css" data-cke="true">`,
								fs.readFileSync( files.html, { encoding: 'utf-8' } ),
								files.js && `<script type="module" src="${ files.js }"></script>`,
								'</div>'
							]
								.filter( Boolean )
								.join( '\n' )
								.replace( /%BASE_PATH%/g, () => upath.relative( upath.dirname( files.html ), inputPath ) );
						}
					}
				},
				viteSingleFile( {
					removeViteModuleLoader: true
				} )
			],

			/**
			 * The configuration below allows for JSX code in JS files. This is needed for snippets
			 * that use React components, but still need the `.js` extension to be found by Umberto.
			 */
			esbuild: {
				loader: 'jsx',
				include: /.*\.jsx?$/,
				exclude: []
			},
			optimizeDeps: {
				esbuildOptions: {
					loader: {
						'.js': 'jsx'
					}
				}
			}
		} );

		const data = result.output[ 0 ].source
			.replace( '<!--UMBERTO: SNIPPET: CSS-->', () => headerTags.join( '\n' ) )
			.replace( '<!--UMBERTO: SNIPPET: JS-->', () => '' );

		const path = upath.resolve( snippetsOutputPath, name, 'snippet.html' );

		fs.mkdirSync( upath.dirname( path ), { recursive: true } );
		fs.writeFileSync( path, data );
	}
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
		'ckeditor5/translations/ar.js': 'https://cdn.ckeditor.com/ckeditor5/nightly-next/translations/ar.js',
		'ckeditor5/translations/es.js': 'https://cdn.ckeditor.com/ckeditor5/nightly-next/translations/es.js',
		'ckeditor5-premium-features': 'https://cdn.ckeditor.com/ckeditor5-premium-features/nightly-next/ckeditor5-premium-features.js',
		'ckeditor5-premium-features/': 'https://cdn.ckeditor.com/ckeditor5-premium-features/nightly-next/',
		'@ckeditor/ckeditor5-inspector': 'https://esm.sh/@ckeditor/ckeditor5-inspector@4.1.0/es2022/ckeditor5-inspector.mjs',
		'@ckeditor/ckeditor5-inspector/build/miniinspector.js':
			'https://esm.sh/@ckeditor/ckeditor5-inspector@4.1.0/es2022/build/miniinspector.mjs',
		'react': 'https://esm.sh/react@18.2.0/es2022/react.mjs',
		'react-dom/client': 'https://esm.sh/react-dom@18.2.0/es2022/client.bundle.mjs',
		'lodash-es': 'https://esm.sh/lodash-es@4.17.15/es2022/lodash-es.bundle.mjs',
		'mermaid/dist/mermaid.js': 'https://esm.sh/mermaid@9.4.3/es2022/mermaid.bundle.mjs'
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
