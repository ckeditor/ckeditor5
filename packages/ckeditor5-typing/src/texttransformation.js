/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/texttransformation
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
				{ from: '\\(c\\)$', to: '©' },
				{ from: '\\(tm\\)$', to: '™' },
				{ from: '\\.\\.\\.$', to: '…' },
				{ from: '1/2$', to: '½' },
				{ from: '<=$', to: '≤' },

				// TODO: not nice - needs special order.
				// TODO: not nice - needs spaces.
				{ from: ' --- $', to: ' — ' },
				{ from: ' -- $', to: ' – ' },

				// English quotation - primary.
				{ from: buildQuotesPattern( '"' ), to: '“$1”' },
				// English quotation - secondary.
				{ from: buildQuotesPattern( '\'' ), to: '‘$1’' }
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
			// TODO: always add $ to the string regexp!
			const regExp = new RegExp( transformation.from, 'u' );

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

				const textToInsert = message.replace( regExp, transformation.to );

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
 * Text transformation definition object.
 *
 *		const transformations = [
 *			// Will replace foo text before caret (ie typed) by user to bar:
 *			{ from: 'foo', to: 'bar' },
 *
 *			// Will remove @ from emails on example.com domain, ie from user@example.com -> user.at.example.com
 *			{ from: /([a-z-])@(example.com)$/, to: '$1.at.$2' }
 *		]
 *
 * @typedef {Object} module:typing/texttransformation~TextTransformationDescription
 * @property {String|RegExp} from The pattern to transform.
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

/* eslint-disable max-len */
/**
 * The default text transformations supported by the editor.
 *
 * @member {Array.<module:typing/texttransformation~TextTransformationDescription>} module:typing/texttransformation~TextTransformationConfig#transformations
 */
/* eslint-enable max-len */
