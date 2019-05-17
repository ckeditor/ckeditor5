/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/texttransformation
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import TextWatcher from '@ckeditor/ckeditor5-utils/src/textwatcher';

// Set of default transformations provided by the feature.
const DEFAULT_TRANSFORMATIONS = [
	// Common symbols:
	{ from: '(c)', to: '©' },
	{ from: '(tm)', to: '™' },

	// Mathematical:
	{ from: '1/2', to: '½' },
	{ from: '<=', to: '≤' },

	// Typography:
	{ from: '...', to: '…' },
	{ from: ' -- ', to: ' – ' },
	{ from: ' --- ', to: ' — ' },

	// Quotations:
	// English primary.
	{ from: buildQuotesRegExp( '"' ), to: '“$1”' },
	// English secondary.
	{ from: buildQuotesRegExp( '\'' ), to: '‘$1’' }
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

		editor.config.define( 'textTransformation', {
			transformations: DEFAULT_TRANSFORMATIONS
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

		const transformations = editor.config.get( 'textTransformation.transformations' );

		for ( const transformation of transformations ) {
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
	return new RegExp( `${ quoteCharacter }([^${ quoteCharacter }]+)${ quoteCharacter }$` );
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
 * @member {module:typing/texttransformation~TextTransformationConfig} module:core/editor/editorconfig~EditorConfig#textTransformation
 */

/**
 * The configuration of the text transformation feature.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				textTransformation: ... // Text transformation feature options.
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface TextTransformationConfig
 */

/* eslint-disable max-len */
/**
 * The default text transformations supported by the editor.
 *
 * @member {Array.<module:typing/texttransformation~TextTransformationDescription>} module:typing/texttransformation~TextTransformationConfig#transformations
 */
/* eslint-enable max-len */
