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
	static get pluginName() {
		return 'TextTransformation';
	}

	init() {
		const editor = this.editor;
		const model = editor.model;

		const transformations = [
			// TODO: not nice definition - needs RegExp escaping.
			{ in: '\\(c\\)$', out: '©' },
			{ in: '\\(tm\\)$', out: '™' },
			{ in: '\\.\\.\\.$', out: '…' },
			{ in: '1/2', out: '½' },
			{ in: '<=', out: '≤' },
			// TODO: not nice - needs special order.
			{ in: ' --- $', out: ' — ' },
			// TODO: not nice - needs spaces.
			{ in: ' -- $', out: ' – ' },
			// TODO: add language rules
			// TODO: add secondary support
			{ in: '"([a-zA-Z -]+)"$', out: '„$1”' }
		];

		for ( const transformation of transformations ) {
			const regExp = new RegExp( transformation.in );

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
