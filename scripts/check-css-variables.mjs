/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * Validates that the editor and content stylesheet graphs are self-sufficient with respect to
 * CSS custom properties. See:
 * https://github.com/ckeditor/ckeditor5-internal/issues/4268
 *
 * The `theme/index-editor.css` and `theme/index-content.css` graphs are distributed as standalone
 * stylesheets, so each of them must work without the other one being loaded:
 *
 * 1. Every custom property consumed without a fallback in a graph must be declared in that graph
 *    (or in the same graph of the base packages, or be a known runtime-provided variable).
 * 2. A custom property declared in the top-level root scope (`:root` or `:host`) of both graphs
 *    must have an identical value in every copy, as the copies shadow each other once both
 *    stylesheets are loaded on a single page.
 * 3. Every `--ck-*` custom property consumed without a fallback outside the graphs – in the source
 *    code, in the code blocks of the guides, and in the documentation snippets and assets – must be
 *    declared in one of the graphs (or by the documentation itself, for the documentation), or be set
 *    from JavaScript. Such a `var()` resolves to nothing when the variable is gone, so the property
 *    silently falls back to its initial value.
 *
 * Options:
 *   --base-packages <path>  Path to another packages directory whose declarations extend both
 *                           graphs, while its own usages are not validated by this run. Used by
 *                           repositories that build on top of the open-source packages.
 */

import { existsSync, globSync, readFileSync } from 'node:fs';
import { styleText } from 'node:util';
import upath from 'upath';
import minimist from 'minimist';
import { generate, parse, walk } from '@eslint/css-tree';
import { PACKAGES_DIRECTORY } from './release/utils/constants.mjs';

/**
 * Custom properties that are set from JavaScript, so they have a value in the browser even though no
 * stylesheet declares them. They are accepted everywhere. See also `isRuntimeVariable()`.
 */
const RUNTIME_VARIABLES = new Set( [
	// Set by the AI review feature (`aireviewcorereviewcommandlistitemview.ts`).
	'--ck-ai-review-check-list-item-index'
] );

/**
 * Custom properties that are consumed by the stylesheets but are legitimately not declared in any
 * of them. Every entry must be justified; remove entries that stop being necessary. They are accepted
 * only in the stylesheet graphs, so new code and docs cannot start reading them.
 */
const KNOWN_UNDECLARED_VARIABLES = new Set( [
	// Pre-existing gaps: consumed by the theme without a matching declaration anywhere.
	'--ck-block-toolbar-size',

	// The track changes content styles still depend on this editor variable.
	// See https://github.com/ckeditor/ckeditor5-commercial/issues/11082.
	'--ck-color-base-background'
] );

/**
 * Files outside the stylesheet graphs that consume the `--ck-*` custom properties, relative to the
 * packages directory. The source code sets them in inline styles, template style bindings, and code
 * examples in the API docs.
 */
const SOURCE_PATTERNS = [ '*/src/**/*.ts' ];

/**
 * Documentation directories, relative to the repository root, and the files in them that consume the
 * `--ck-*` custom properties, relative to each documentation directory: the guides, the snippets, and
 * the stylesheets in `assets` that the snippets load. Only the code blocks of the guides are checked,
 * as their prose names variables without consuming them.
 */
const DOCS_DIRECTORIES = [ 'docs', `${ PACKAGES_DIRECTORY }/*/docs` ];
const DOCS_PATTERNS = [ '**/*.md', '_snippets/**/*.{css,html,js}', 'assets/**/*.css' ];

/**
 * Documentation that names undeclared variables on purpose, relative to the repository root. The
 * migration guide to the refreshed theme shows the removed variables next to their replacements, and
 * the code style guide uses illustrative variable names.
 */
const IGNORED_DOCS_PATHS = [ 'docs/updating/migration-to-refreshed-theme.md', 'docs/framework/contributing/code-style.md' ];

const { 'base-packages': basePackages } = minimist( process.argv.slice( 2 ), {
	string: [ 'base-packages' ]
} );

const errors = [];
const graphs = {
	editor: analyzeGraph( 'index-editor.css' ),
	content: analyzeGraph( 'index-content.css' )
};

validateUsages( 'editor', 'content' );
validateUsages( 'content', 'editor' );

validateRootValueSync( graphs.editor.rootDeclarations, graphs.content.rootDeclarations );

const declaredInGraphs = new Set( [ ...graphs.editor.declared, ...graphs.content.declared ] );
const sources = analyzeFilesOutsideGraphs( getSourcePaths() );
const docs = analyzeFilesOutsideGraphs( getDocsPaths() );

validateUsagesOutsideGraphs( 'source code', sources.usedWithoutFallback, declaredInGraphs );
validateUsagesOutsideGraphs( 'documentation', docs.usedWithoutFallback, new Set( [ ...declaredInGraphs, ...docs.declared ] ) );

if ( errors.length ) {
	console.log( styleText( [ 'red', 'bold' ], 'Found problems with the CSS custom properties:' ) );
	errors.forEach( error => console.log( styleText( 'red', ` - ${ error }` ) ) );
	process.exit( 1 );
} else {
	console.log( styleText( 'green',
		'The stylesheet graphs, the source code, and the documentation consume only declared CSS custom properties.'
	) );
}

/**
 * Collects and parses all stylesheets reachable from the given entry file in every package.
 */
function analyzeGraph( entryFile ) {
	const analysis = {
		// All declared variable names, regardless of the scope.
		declared: new Set(),
		// variable name -> Map( normalized value -> [ locations ] ), for top-level root scope declarations only.
		rootDeclarations: new Map(),
		// variable name -> [ locations ], for `var()` usages without a fallback.
		usedWithoutFallback: new Map()
	};

	collectPackages( upath.join( process.cwd(), PACKAGES_DIRECTORY ), entryFile, analysis );

	if ( basePackages ) {
		// The base packages only extend the declarations available to the graph. Their own
		// usages are discarded, as they are validated by their own repository.
		collectPackages( upath.join( process.cwd(), basePackages ), entryFile, {
			...analysis,
			usedWithoutFallback: new Map()
		} );
	}

	return analysis;
}

function collectPackages( packagesDir, entryFile, analysis ) {
	const entryPaths = globSync( upath.join( packagesDir, '*', 'theme', entryFile ) )
		.map( entryPath => upath.normalize( entryPath ) )
		.sort();

	for ( const entryPath of entryPaths ) {
		analyzeFile( entryPath, analysis, new Set() );
	}
}

/**
 * Returns the source files of the packages. The base packages are skipped, as their usages are
 * validated by their own repository.
 */
function getSourcePaths() {
	return globPaths( SOURCE_PATTERNS.map( pattern => upath.join( process.cwd(), PACKAGES_DIRECTORY, pattern ) ) );
}

/**
 * Returns the guides and snippets of the repository and its packages, except for the ignored ones.
 */
function getDocsPaths() {
	const patterns = DOCS_DIRECTORIES.flatMap( directory => {
		return DOCS_PATTERNS.map( pattern => upath.join( process.cwd(), directory, pattern ) );
	} );

	return globPaths( patterns ).filter( filePath => !IGNORED_DOCS_PATHS.includes( upath.relative( process.cwd(), filePath ) ) );
}

function globPaths( patterns ) {
	return patterns
		.flatMap( pattern => globSync( pattern ) )
		.map( filePath => upath.normalize( filePath ) )
		.sort();
}

/**
 * Extracts custom property declarations and `var()` usages from a single stylesheet and follows
 * its relative `@import` targets. Import graph validity (unreachable or shared files, bare
 * imports in content styles, and so on) is enforced by `check-css-imports.mjs`, so bare and
 * missing imports are skipped here without reporting.
 */
function analyzeFile( filePath, analysis, analyzedFiles ) {
	if ( analyzedFiles.has( filePath ) ) {
		return;
	}

	analyzedFiles.add( filePath );

	const ast = parse( readFileSync( filePath, 'utf-8' ), {
		positions: true,
		parseCustomProperty: true
	} );

	walk( ast, function( node ) {
		if ( node.type === 'Atrule' && node.name.toLowerCase() === 'import' ) {
			const firstChild = node.prelude?.children?.first;

			if ( ( firstChild?.type === 'String' || firstChild?.type === 'Url' ) && firstChild.value.startsWith( '.' ) ) {
				const targetPath = upath.join( upath.dirname( filePath ), firstChild.value );

				if ( existsSync( targetPath ) ) {
					analyzeFile( targetPath, analysis, analyzedFiles );
				}
			}
		}

		if ( node.type === 'Declaration' && node.property.startsWith( '--' ) ) {
			analysis.declared.add( node.property );

			const isTopLevelRootRule = !this.atrule && this.rule?.prelude?.type === 'SelectorList' &&
				hasRootSelector( this.rule.prelude );

			if ( isTopLevelRootRule ) {
				const value = generate( node.value );
				const values = analysis.rootDeclarations.get( node.property ) || new Map();
				const locations = values.get( value ) || [];

				locations.push( formatLocation( filePath, node.loc.start.line ) );
				values.set( value, locations );
				analysis.rootDeclarations.set( node.property, values );
			}
		}

		if ( node.type === 'Function' && node.name.toLowerCase() === 'var' ) {
			const children = node.children.toArray();
			const name = children[ 0 ].name;
			const hasFallback = children.length > 1;

			if ( !hasFallback ) {
				const locations = analysis.usedWithoutFallback.get( name ) || [];

				locations.push( formatLocation( filePath, node.loc.start.line ) );
				analysis.usedWithoutFallback.set( name, locations );
			}
		}
	} );
}

/**
 * Extracts `--ck-*` custom property declarations and `var()` usages from files outside the stylesheet
 * graphs. These files mix CSS with other languages, so they are scanned line by line instead of being
 * parsed. A nested `var()` is matched on its own, so, as in the stylesheets, the innermost variable of
 * a fallback chain is the one consumed without a fallback.
 */
function analyzeFilesOutsideGraphs( filePaths ) {
	const analysis = {
		declared: new Set(),
		usedWithoutFallback: new Map()
	};

	for ( const filePath of filePaths ) {
		for ( const { text, line } of getCheckedLines( filePath ) ) {
			for ( const [ , name ] of text.matchAll( /(--ck-[\w-]+)\s*:/g ) ) {
				analysis.declared.add( name );
			}

			for ( const [ , name ] of text.matchAll( /var\(\s*(--ck-[\w-]+)\s*\)/g ) ) {
				const locations = analysis.usedWithoutFallback.get( name ) || [];

				locations.push( formatLocation( filePath, line ) );
				analysis.usedWithoutFallback.set( name, locations );
			}
		}
	}

	return analysis;
}

/**
 * Returns the lines of a file to check, with their line numbers: every line of a source file or a
 * snippet, but only the fenced code blocks of a guide. Inline `<style>` blocks of a guide, outside
 * the code blocks, are not checked.
 */
function getCheckedLines( filePath ) {
	const lines = readFileSync( filePath, 'utf-8' )
		.split( '\n' )
		.map( ( text, index ) => ( { text, line: index + 1 } ) );

	if ( !filePath.endsWith( '.md' ) ) {
		return lines;
	}

	let fence = null;

	return lines.filter( ( { text } ) => {
		const marker = text.match( /^\s*(`{3,}|~{3,})/ )?.[ 1 ];

		if ( !fence ) {
			fence = marker || null;

			return false;
		}

		// Only a fence of the same character and at least the same length closes the block.
		if ( marker && marker[ 0 ] === fence[ 0 ] && marker.length >= fence.length ) {
			fence = null;

			return false;
		}

		return true;
	} );
}

/**
 * Checks whether the given selector list declares the root scope, which either `:root` or `:host`
 * does. The stylesheets pair the two (`:root,\n:host { … }`) so that one stylesheet resolves its
 * custom properties in the light DOM and inside a shadow root alike – hence the selector list
 * cannot be compared as a whole string, and either selector on its own marks the root scope.
 */
function hasRootSelector( prelude ) {
	return prelude.children.some( selector => {
		const text = generate( selector ).toLowerCase();

		return text === ':root' || text === ':host';
	} );
}

function formatLocation( filePath, line ) {
	return `${ upath.relative( process.cwd(), filePath ) }:${ line }`;
}

function isKnownUndeclaredVariable( name ) {
	return KNOWN_UNDECLARED_VARIABLES.has( name ) || isRuntimeVariable( name );
}

function isRuntimeVariable( name ) {
	return RUNTIME_VARIABLES.has( name ) ||
		// Set from JavaScript by the show blocks feature (`showblockscommand.ts`).
		name.startsWith( '--ck-show-blocks-label-' );
}

/**
 * Checks that every custom property consumed without a fallback is declared in the graph or is
 * a known runtime-provided variable.
 */
function validateUsages( kind, otherKind ) {
	for ( const [ name, locations ] of graphs[ kind ].usedWithoutFallback ) {
		if ( graphs[ kind ].declared.has( name ) ) {
			continue;
		}

		if ( isKnownUndeclaredVariable( name ) ) {
			continue;
		}

		errors.push( graphs[ otherKind ].declared.has( name ) ?
			`"${ name }" is used in the ${ kind } styles but is declared only in the ${ otherKind } styles, ` +
			`so it is missing when the ${ kind } stylesheet is loaded alone (${ formatLocations( locations ) }).` :
			`"${ name }" is used in the ${ kind } styles but is never declared (${ formatLocations( locations ) }).`
		);
	}
}

/**
 * Checks that every `--ck-*` custom property consumed without a fallback outside the stylesheet
 * graphs is declared or is set from JavaScript. The known gaps of the stylesheets are not accepted here.
 */
function validateUsagesOutsideGraphs( kind, usedWithoutFallback, declared ) {
	for ( const [ name, locations ] of usedWithoutFallback ) {
		if ( declared.has( name ) || isRuntimeVariable( name ) ) {
			continue;
		}

		errors.push( `"${ name }" is used in the ${ kind } but is never declared (${ formatLocations( locations ) }).` );
	}
}

/**
 * Checks that every variable declared at the top-level root scope of both the editor and
 * content graphs has an identical value in every copy.
 */
function validateRootValueSync( editorDeclarations, contentDeclarations ) {
	for ( const [ name, editorValues ] of editorDeclarations ) {
		const contentValues = contentDeclarations.get( name );

		if ( !contentValues || new Set( [ ...editorValues.keys(), ...contentValues.keys() ] ).size === 1 ) {
			continue;
		}

		const details = [
			...[ ...editorValues ].map( ( [ value, locations ] ) => `"${ value }" (editor: ${ formatLocations( locations ) })` ),
			...[ ...contentValues ].map( ( [ value, locations ] ) => `"${ value }" (content: ${ formatLocations( locations ) })` )
		];

		errors.push(
			`"${ name }" is declared at the root scope in both the editor and content styles ` +
			`with different values: ${ details.join( ', ' ) }.`
		);
	}
}

function formatLocations( locations ) {
	const cap = 3;
	const unique = [ ...new Set( locations ) ];
	const shown = unique.slice( 0, cap ).join( ', ' );

	return unique.length > cap ? `${ shown } and ${ unique.length - cap } more` : shown;
}
