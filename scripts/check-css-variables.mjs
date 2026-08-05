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
 *    (or in the same graph of the baseline packages, or be a known runtime-provided variable).
 * 2. A custom property declared in the top-level `:root` scope of both graphs must have an
 *    identical value in every copy, as the copies shadow each other once both stylesheets are
 *    loaded on a single page.
 *
 * Options:
 *   --baseline <path>  Path to another packages directory whose declarations extend both graphs,
 *                      while its own usages are not validated by this run. Used by repositories
 *                      that build on top of the open-source packages.
 */

import { existsSync, globSync, readFileSync } from 'node:fs';
import { styleText } from 'node:util';
import upath from 'upath';
import minimist from 'minimist';
import { generate, parse, walk } from '@eslint/css-tree';
import { PACKAGES_DIRECTORY } from './release/utils/constants.mjs';

/**
 * Custom properties that are consumed by the stylesheets but are legitimately not declared in any
 * of them. Every entry must be justified; remove entries that stop being necessary.
 */
const KNOWN_UNDECLARED_VARIABLES = new Set( [
	// Set from JavaScript by the AI review feature (`aireviewcorereviewcommandlistitemview.ts`).
	'--ck-ai-review-check-list-item-index',

	// Declared by the document outline feature from the commercial distribution.
	'--ck-document-outline-item-default-color',

	// Pre-existing gaps: consumed by the theme without a matching declaration anywhere.
	'--ck-block-toolbar-size',
	'--ck-color-widget-type-around-button',

	// Pre-existing gap in the revision history styles.
	// See https://github.com/ckeditor/ckeditor5-commercial/issues/11082.
	'--ck-font-size-standard',

	// The track changes content styles still depend on this editor variable.
	// See https://github.com/ckeditor/ckeditor5-commercial/issues/11082.
	'--ck-color-base-background'
] );

const { baseline } = minimist( process.argv.slice( 2 ), {
	string: [ 'baseline' ]
} );

const errors = [];
const graphs = {
	editor: analyzeGraph( 'index-editor.css' ),
	content: analyzeGraph( 'index-content.css' )
};

validateUsages( 'editor', 'content' );
validateUsages( 'content', 'editor' );

validateRootValueSync( graphs.editor.rootDeclarations, graphs.content.rootDeclarations );

if ( errors.length ) {
	console.log( styleText( [ 'red', 'bold' ], 'Found problems with the CSS custom properties:' ) );
	errors.forEach( error => console.log( styleText( 'red', ` - ${ error }` ) ) );
	process.exit( 1 );
} else {
	console.log( styleText( 'green', 'The editor and content stylesheet graphs consume only declared CSS custom properties.' ) );
}

/**
 * Collects and parses all stylesheets reachable from the given entry file in every package.
 */
function analyzeGraph( entryFile ) {
	const analysis = {
		// All declared variable names, regardless of the scope.
		declared: new Set(),
		// variable name -> Map( normalized value -> [ locations ] ), for top-level `:root` declarations only.
		rootDeclarations: new Map(),
		// variable name -> [ locations ], for `var()` usages without a fallback.
		usedWithoutFallback: new Map()
	};

	collectPackages( upath.join( process.cwd(), PACKAGES_DIRECTORY ), entryFile, analysis );

	if ( baseline ) {
		// The baseline packages only extend the declarations available to the graph. Their own
		// usages are discarded, as they are validated by the baseline repository itself.
		collectPackages( upath.join( process.cwd(), baseline ), entryFile, {
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
				generate( this.rule.prelude ) === ':root';

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

function formatLocation( filePath, line ) {
	return `${ upath.relative( process.cwd(), filePath ) }:${ line }`;
}

function isKnownUndeclaredVariable( name ) {
	return KNOWN_UNDECLARED_VARIABLES.has( name ) ||
		// Set from JavaScript by the show blocks feature (`showblockscommand.ts`).
		name.startsWith( '--ck-show-blocks-label-' ) ||
		// Optional user-defined overrides consumed by the color definitions in `_colors.css`.
		name.startsWith( '--ck-custom-' );
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
 * Checks that every variable declared at the top-level `:root` scope of both the editor and
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
			`"${ name }" is declared at ":root" in both the editor and content styles ` +
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
