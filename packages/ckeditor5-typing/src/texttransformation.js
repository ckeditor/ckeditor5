/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/texttransformation
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import TextWatcher from '@ckeditor/ckeditor5-utils/src/textwatcher';

// All named transformations.
const TRANSFORMATIONS = {
	// Common symbols:
	copyright: { from: '(c)', to: '©' },
	registered_trademark: { from: '(r)', to: '®' },
	trademark: { from: '(tm)', to: '™' },

	// Mathematical:
	one_half: { from: '1/2', to: '½' },
	one_third: { from: '1/3', to: '⅓' },
	two_thirds: { from: '2/3', to: '⅔' },
	one_forth: { from: '1/4', to: '¼' },
	three_quarters: { from: '3/4', to: '¾' },
	less_then_or_equal: { from: '<=', to: '≤' },
	greater_then_or_equal: { from: '>=', to: '≥' },
	not_equal: { from: '!=', to: '≠' },
	arrow_left: { from: '<-', to: '→' },
	arrow_right: { from: '->', to: '≠' },
	// one_fifth: { from: '1/5', to: '⅕' },
	// one_sixth: { from: '1/6', to: '⅙' },
	// one_seventh: { from: '1/7', to: '⅐' },
	// one_eight: { from: '1/8', to: '⅛' },
	// one_ninth: { from: '1/9', to: '⅑' },

	// Typography:
	horizontal_ellipsis: { from: '...', to: '…' },
	en_dash: { from: ' -- ', to: ' – ' },
	em_dash: { from: ' --- ', to: ' — ' },

	// Quotations:
	// English, US
	quotes_primary: { from: buildQuotesRegExp( '"' ), to: '$1“$2”' },
	quotes_secondary: { from: buildQuotesRegExp( '\'' ), to: '$1‘$2’' },

	// English, UK
	quotes_primary_en_gb: { from: buildQuotesRegExp( '\'' ), to: '$1‘$2’' },
	quotes_secondary_en_gb: { from: buildQuotesRegExp( '"' ), to: '$1“$2”' },

	// Polish
	quotes_primary_pl: { from: buildQuotesRegExp( '"' ), to: '$1„$2”' },
	quotes_secondary_pl: { from: buildQuotesRegExp( '\'' ), to: '$1‚$2’' }
};

// Transformation groups.
const TRANSFORMATION_GROUPS = {
	symbols: [ 'copyright', 'registered_trademark', 'trademark' ],
	mathematical: [
		'one_half', 'one_third', 'two_thirds', 'one_forth', 'three_quarters',
		'less_then_or_equal', 'greater_then_or_equal', 'not_equal',
		'arrow_left', 'arrow_right'
	],
	typography: [ 'horizontal_ellipsis', 'en_dash', 'em_dash' ],
	quotes: [ 'quotes_primary', 'quotes_secondary' ]
};

// Set of default transformations provided by the feature.
const DEFAULT_TRANSFORMATIONS = [
	'symbols',
	'mathematical',
	'typography',
	'quotes'
];

/**
 * The text transformation plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TextTransformation extends Plugin {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		editor.config.define( 'typing', {
			transformation: {
				include: DEFAULT_TRANSFORMATIONS
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TextTransformation';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const model = editor.model;

		const configuredTransformations = getConfiguredTransformations( editor.config.get( 'typing.transformation' ) );

		for ( const transformation of configuredTransformations ) {
			const { from, to } = transformation;

			let testCallback;
			let textReplacer;

			if ( from instanceof RegExp ) {
				testCallback = text => from.test( text );
				textReplacer = message => message.replace( from, to );
			} else {
				testCallback = text => text.endsWith( from );
				textReplacer = message => message.slice( 0, message.length - from.length ) + to;
			}

			const watcher = new TextWatcher( editor.model, testCallback );

			watcher.on( 'matched:data', ( evt, data ) => {
				const selection = editor.model.document.selection;
				const focus = selection.focus;
				const textToReplaceLength = data.text.length;
				const textToInsert = textReplacer( data.text );

				model.enqueueChange( model.createBatch(), writer => {
					const replaceRange = writer.createRange( focus.getShiftedBy( -textToReplaceLength ), focus );

					model.insertContent( writer.createText( textToInsert, selection.getAttributes() ), replaceRange );
				} );
			} );
		}
	}
}

// Returns a RegExp pattern string that detects a sentence inside a quote.
//
// @param {String} quoteCharacter a character to creat a pattern for.
// @returns {String}
function buildQuotesRegExp( quoteCharacter ) {
	return new RegExp( `(^|\\s)${ quoteCharacter }([^${ quoteCharacter }]+)${ quoteCharacter }$` );
}

// Reads text transformation config and returns normalized array of transformations objects.
//
// @param {module:typing/texttransformation~TextTransformationDescription} config
// @returns {Array.<module:typing/texttransformation~TextTransformationDescription>}
function getConfiguredTransformations( config ) {
	const extra = config.extra || [];
	const remove = config.remove || [];
	const isNotRemoved = transformation => !remove.includes( transformation );

	const configured = config.include.concat( extra ).filter( isNotRemoved );

	return expandGroupsAndRemoveDuplicates( configured )
		.filter( isNotRemoved ) // Filter out 'remove' transformations as they might be set in group
		.map( transformation => TRANSFORMATIONS[ transformation ] || transformation );
}

// Reads definitions and expands named groups if needed to transformation names.
// This method also removes duplicated named transformations if any.
//
// @param {Array.<String|Object>} definitions
// @returns {Array.<String|Object>}
function expandGroupsAndRemoveDuplicates( definitions ) {
	// Set is using to make sure that transformation names are not duplicated.
	const definedTransformations = new Set();

	for ( const transformationOrGroup of definitions ) {
		if ( TRANSFORMATION_GROUPS[ transformationOrGroup ] ) {
			for ( const transformation of TRANSFORMATION_GROUPS[ transformationOrGroup ] ) {
				definedTransformations.add( transformation );
			}
		} else {
			definedTransformations.add( transformationOrGroup );
		}
	}

	return Array.from( definedTransformations );
}

/**
 * Text transformation definition object.
 *
 *		const transformations = [
 *			// Will replace foo text before caret (ie typed) by user to bar:
 *			{ from: 'foo', to: 'bar' },
 *
 *			// Will remove @ from emails on example.com domain, ie from user@example.com -> user.at.example.com:
 *			{ from: /([a-z-])@(example.com)$/i, to: '$1.at.$2' }
 *		]
 *
 * *Note*: The text watcher always evaluates end of an input - a text before a caret in single node. If passing a RegExp object you must
 * include `$` token to match end of string.
 *
 * @typedef {Object} module:typing/texttransformation~TextTransformationDescription
 * @property {String|RegExp} from The string or RegExp to transform.
 * @property {String} to The text to transform compatible with `String.replace()`
 */

/**
 * The configuration of the {@link module:typing/texttransformation~TextTransformation} feature.
 *
 * Read more in {@link module:typing/texttransformation~TextTransformationConfig}.
 *
 * @member {module:typing/texttransformation~TextTransformationConfig} module:typing/typing~TypingConfig#transformation
 */

/**
 * The configuration of the text transformation feature.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				typing: {
 *					transformation:  ... // Text transformation feature options.
 *				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * By default the editor provides transformations defined in {@link module:typing/texttransformation~TextTransformationConfig#include}:
 *
 * ## Typography
 *
 * name | from | to
 * -----|------|----
 * ellipsis | `...` | `…`
 * en dash | ` -- ` | ` – `
 * em dash | ` --- ` | ` — `
 *
 *
 * ## Quotations
 *
 * name | from | to
 * -----|------|----
 * primary | `"Foo bar"` | `“Foo bar”`
 * secondary | `'Foo bar'` | `‘Foo bar’`
 *
 * ## Symbols
 *
 * name | from | to
 * -----|------|----
 * trademark | `(tm)` | `™`
 * registered trademark | `(r)` | `®`
 * copyright | `(c)` | `©`
 *
 * ## Mathematical
 *
 * name | from | to
 * -----|------|----
 * trademark | `1/2` | `½`
 * registered trademark | `<=` | `≤`
 *
 * @interface TextTransformationConfig
 */

/* eslint-disable max-len */
/**
 * The default text transformations supported by the editor.
 *
 * @member {Array.<module:typing/texttransformation~TextTransformationDescription>} module:typing/texttransformation~TextTransformationConfig#include
 */

/**
 * The extra text transformations that are added to the transformations defined in
 * {@link module:typing/texttransformation~TextTransformationConfig#include}.
 *
 * @member {Array.<module:typing/texttransformation~TextTransformationDescription>} module:typing/texttransformation~TextTransformationConfig#extra
 */

/**
 * The text transformations names that are removed from transformations defined in
 * {@link module:typing/texttransformation~TextTransformationConfig#include} or module:typing/texttransformation~TextTransformationConfig#extra.
 *
 * @member {Array.<module:typing/texttransformation~TextTransformationDescription>} module:typing/texttransformation~TextTransformationConfig#remove
 */
/* eslint-enable max-len */
