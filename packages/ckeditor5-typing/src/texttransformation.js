/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/texttransformation
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import TextWatcher from './textwatcher';

// All named transformations.
const TRANSFORMATIONS = {
	// Common symbols:
	copyright: { from: '(c)', to: '©' },
	registeredTrademark: { from: '(r)', to: '®' },
	trademark: { from: '(tm)', to: '™' },

	// Mathematical:
	oneHalf: { from: '1/2', to: '½' },
	oneThird: { from: '1/3', to: '⅓' },
	twoThirds: { from: '2/3', to: '⅔' },
	oneForth: { from: '1/4', to: '¼' },
	threeQuarters: { from: '3/4', to: '¾' },
	lessThenOrEqual: { from: '<=', to: '≤' },
	greaterThenOrEqual: { from: '>=', to: '≥' },
	notEqual: { from: '!=', to: '≠' },
	arrowLeft: { from: '<-', to: '←' },
	arrowRight: { from: '->', to: '→' },

	// Typography:
	horizontalEllipsis: { from: '...', to: '…' },
	enDash: { from: ' -- ', to: ' – ' },
	emDash: { from: ' --- ', to: ' — ' },

	// Quotations:
	// English, US
	quotesPrimary: { from: buildQuotesRegExp( '"' ), to: '$1“$2”' },
	quotesSecondary: { from: buildQuotesRegExp( '\'' ), to: '$1‘$2’' },

	// English, UK
	quotesPrimaryEnGb: { from: buildQuotesRegExp( '\'' ), to: '$1‘$2’' },
	quotesSecondaryEnGb: { from: buildQuotesRegExp( '"' ), to: '$1“$2”' },

	// Polish
	quotesPrimaryPl: { from: buildQuotesRegExp( '"' ), to: '$1„$2”' },
	quotesSecondaryPl: { from: buildQuotesRegExp( '\'' ), to: '$1‚$2’' }
};

// Transformation groups.
const TRANSFORMATION_GROUPS = {
	symbols: [ 'copyright', 'registeredTrademark', 'trademark' ],
	mathematical: [
		'oneHalf', 'oneThird', 'twoThirds', 'oneForth', 'threeQuarters',
		'lessThenOrEqual', 'greaterThenOrEqual', 'notEqual',
		'arrowLeft', 'arrowRight'
	],
	typography: [ 'horizontalEllipsis', 'enDash', 'emDash' ],
	quotes: [ 'quotesPrimary', 'quotesSecondary' ]
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
	static get pluginName() {
		return 'TextTransformation';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		editor.config.define( 'typing', {
			transformations: {
				include: DEFAULT_TRANSFORMATIONS
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const model = editor.model;

		const configuredTransformations = getConfiguredTransformations( editor.config.get( 'typing.transformations' ) );

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
 *			// Will replace foo with bar:
 *			{ from: 'foo', to: 'bar' },
 *
 *
 *			// The following (naive) rule will remove @ from emails.
 *			// For example, user@example.com will become user.at.example.com.
 *			{ from: /([a-z-]+)@([a-z]+\.[a-z]{2,})$/i, to: '$1.at.$2' }
 *		]
 *
 * **Note:** The text watcher always evaluates the end of the input (the typed text). If you're passing a RegExp object you must
 * include `$` token to match the end of string.
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
 * @member {module:typing/texttransformation~TextTransformationConfig} module:typing/typing~TypingConfig#transformations
 */

/**
 * The configuration of the text transformation feature.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				typing: {
 *					transformations: ... // Text transformation feature options.
 *				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * By default, the feature comes pre-configured
 * (via {@link module:typing/texttransformation~TextTransformationConfig#include `config.typing.transformations.include`}) with the
 * following groups of transformations:
 *
 * * Typography (group name: `typography`)
 *   - `ellipsis`: transforms `...` to `…`
 *   - `enDash`: transforms ` -- ` to ` – `
 *   - `emDash`: transforms ` --- ` to ` — `
 * * Quotations (group name: `quotations`)
 *   - `quotesPrimary`: transforms `"Foo bar"` to `“Foo bar”`
 *   - `quotesSecondary`: transforms `'Foo bar'` to `‘Foo bar’`
 * * Symbols (group name: `symbols`)
 *   - `trademark`: transforms `(tm)` to `™`
 *   - `registeredTrademark`: transforms `(r)` to `®`
 *   - `copyright`: transforms `(c)` to `©`
 * * Mathematical (group name: `mathematical`)
 *   - `oneHalf`: transforms `1/2`, to: `½`
 *   - `oneThird`: transforms `1/3`, to: `⅓`
 *   - `twoThirds`: transforms `2/3`, to: `⅔`
 *   - `oneForth`: transforms `1/4`, to: `¼`
 *   - `threeQuarters`: transforms `3/4`, to: `¾`
 *   - `lessThenOrEqual`: transforms `<=`, to: `≤`
 *   - `greaterThenOrEqual`: transforms `>=`, to: `≥`
 *   - `notEqual`: transforms `!=`, to: `≠`
 *   - `arrowLeft`: transforms `<-`, to: `←`
 *   - `arrowRight`: transforms `->`, to: `→`
 * * Misc:
 *   - `quotesPrimaryEnGb`: transforms `'Foo bar'` to `‘Foo bar’`
 *   - `quotesSecondaryEnGb`: transforms `"Foo bar"` to `“Foo bar”`
 *   - `quotesPrimaryPl`: transforms `"Foo bar"` to `„Foo bar”`
 *   - `quotesSecondaryPl`:  transforms `'Foo bar'` to `‚Foo bar’`
 *
 * In order to load additional transformations, use the
 * {@link module:typing/texttransformation~TextTransformationConfig#extra `transformations.extra` option}.
 *
 * In order to narrow down the list of transformations, use the
 * {@link module:typing/texttransformation~TextTransformationConfig#remove `transformations.remove` option}.
 *
 * In order to completely override the supported transformations, use the
 * {@link module:typing/texttransformation~TextTransformationConfig#include `transformations.include` option}.
 *
 * Example:
 *
 *		const transformationsConfig = {
 *			include: [
 *				// Use only the 'quotes' and 'typography' groups.
 *				'quotes',
 *				'typography',

 *				// Plus, some custom transformation.
 *				{ from: 'CKE', to: 'CKEditor }
 *			],
 *
 *			// Remove the 'ellipsis' transformation loaded by the 'typography' group.
 *			remove: [ 'ellipsis' ]
 *		};
 *
 * @interface TextTransformationConfig
 */

/* eslint-disable max-len */
/**
 * The standard list of text transformations supported by the editor. By default it comes pre-configured with a couple dozen of them
 * (see {@link module:typing/texttransformation~TextTransformationConfig} for the full list of them). You can override this list completely
 * by setting this option or use the other two options
 * ({@link module:typing/texttransformation~TextTransformationConfig#extra `transformations.extra`},
 * {@link module:typing/texttransformation~TextTransformationConfig#remove `transformations.remove`}) to fine tune the default list.
 *
 * @member {Array.<module:typing/texttransformation~TextTransformationDescription>} module:typing/texttransformation~TextTransformationConfig#include
 */

/**
 * The extra text transformations that are added to the transformations defined in
 * {@link module:typing/texttransformation~TextTransformationConfig#include `transformations.include`}.
 *
 *		const transformationsConfig = {
 *			extra: [
 *				{ from: 'CKE', to: 'CKEditor' }
 *			]
 *		};
 *
 * @member {Array.<module:typing/texttransformation~TextTransformationDescription>} module:typing/texttransformation~TextTransformationConfig#extra
 */

/**
 * The text transformations names that are removed from transformations defined in
 * {@link module:typing/texttransformation~TextTransformationConfig#include `transformations.include`} or
 * {@link module:typing/texttransformation~TextTransformationConfig#extra `transformations.extra`}.
 *
 *		const transformationsConfig = {
 *			remove: [
 *				'ellipsis',    // Remove only 'ellipsis' from 'typography group.
 *				'mathematical' // Remove all transformations from 'mathematical' group.
 *			]
 *		}
 *
 * @member {Array.<module:typing/texttransformation~TextTransformationDescription>} module:typing/texttransformation~TextTransformationConfig#remove
 */
/* eslint-enable max-len */
