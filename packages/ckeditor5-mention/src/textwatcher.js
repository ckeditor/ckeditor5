/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module mention/textwatcher
 */

import mix from '@ckeditor/ckeditor5-utils/src/mix';
import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';

/**
 * Text watcher feature.
 */
export default class TextWatcher {
	constructor( editor, callbackOrRegex, textMatcher ) {
		this.editor = editor;
		this.testCallback = callbackOrRegex;
		this.textMatcher = textMatcher;

		this.hasMatch = false;

		this._startListening();
	}

	get last() {
		return this._getText();
	}

	_startListening() {
		const editor = this.editor;

		editor.model.document.on( 'change', ( evt, batch ) => {
			if ( batch.type == 'transparent' ) {
				return;
			}

			const changes = Array.from( editor.model.document.differ.getChanges() );
			const entry = changes[ 0 ];

			// Typing is represented by only a single change.
			const isTypingChange = changes.length == 1 && entry.name == '$text' && entry.length == 1;
			// Selection is represented by empty changes.
			const isSelectionChange = changes.length == 0;

			if ( !isTypingChange && !isSelectionChange ) {
				return;
			}

			const text = this._getText();

			const textHasMatch = this.testCallback( text );

			if ( !textHasMatch && this.hasMatch ) {
				this.fire( 'unmatched' );
			}

			this.hasMatch = textHasMatch;

			if ( textHasMatch ) {
				const matched = this.textMatcher( text );

				this.fire( 'matched', { text, matched } );
			}
		} );
	}

	_getText() {
		const editor = this.editor;
		const selection = editor.model.document.selection;

		// Do nothing if selection is not collapsed.
		if ( !selection.isCollapsed ) {
			return;
		}

		const block = selection.focus.parent;

		return getText( block ).slice( 0, selection.focus.offset );
	}
}

// Returns whole text from parent element by adding all data from text nodes together.
// @todo copied from autoformat...

// @private
// @param {module:engine/model/element~Element} element
// @returns {String}
function getText( element ) {
	return Array.from( element.getChildren() ).reduce( ( a, b ) => a + b.data, '' );
}

mix( TextWatcher, EmitterMixin );

