/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module text-transformation/texttransformation
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import TextWatcher from '@ckeditor/ckeditor5-mention/src/textwatcher';

/**
 * The text transformation plugin.
 *
 * For a detailed overview, check the {@glink features/text-transformation Text transformation feature documentation}.
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
			transformations: [
				// TODO: not nice definition - needs RegExp escaping.
				{ in: '\\(c\\)$', out: '©' },
				{ in: '\\(tm\\)$', out: '™' },
				{ in: '\\.\\.\\.$', out: '…' },
				{ in: '1/2', out: '½' },
				{ in: '<=', out: '≤' },

				// TODO: not nice - needs special order.
				// TODO: not nice - needs spaces.
				{ in: ' --- $', out: ' — ' },
				{ in: ' -- $', out: ' – ' },

				// English quotation - primary.
				{ in: buildQuotesPattern( '"' ), out: '“$1”' },
				// English quotation - secondary.
				{ in: buildQuotesPattern( '\'' ), out: '‘$1’' }
			]
		} );
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TextTransformation';
	}

	init() {
		const editor = this.editor;
		const model = editor.model;

		const transformations = editor.config.get( 'textTransformation.transformations' );

		for ( const transformation of transformations ) {
			const regExp = new RegExp( transformation.in, 'u' );

			// setup text watcher
			const watcher = new TextWatcher( editor, text => regExp.test( text ), text => {
				const match = text.match( regExp );

				return {
					text: match[ 0 ],
					groups: match
				};
			} );

			watcher.on( 'matched', ( evt, data ) => {
				const selection = editor.model.document.selection;
				const focus = selection.focus;
				const message = data.matched.text;
				const textToReplaceLength = message.length;

				const textToInsert = message.replace( regExp, transformation.out );

				// TODO: use model.insertContent()
				model.enqueueChange( model.createBatch(), writer => {
					const replaceRange = writer.createRange( focus.getShiftedBy( -textToReplaceLength ), focus );

					writer.remove( replaceRange );
					writer.insertText( textToInsert, selection.getAttributes(), selection.focus );
				} );
			} );
		}
	}
}

// Returns a RegExp pattern string that detects a sentence inside a quote.
//
// @param {String} quoteCharacter a character to creat a pattern for.
// @returns {String}
function buildQuotesPattern( quoteCharacter ) {
	return `${ quoteCharacter }([^${ quoteCharacter }]+)${ quoteCharacter }$`;
}

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
 * Read more about {@glink features/text-transformation#configuration configuring the text transformation feature}.
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

/**
 * The default text transformations supported by the editor.
 *
 * @member {*} module:typing/texttransformation~TextTransformationConfig#transformations
 */
