/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module mention/textwatcher
 */

import mix from '@ckeditor/ckeditor5-utils/src/mix';
import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';

/**
 * Text watcher feature.
 *
 * Fires {@link module:mention/textwatcher~TextWatcher#event:matched matched} and
 * {@link module:mention/textwatcher~TextWatcher#event:unmatched unmatched} events on typing or selection changes.
 *
 * @private
 */
export default class TextWatcher {
	/**
	 * Creates a text watcher instance.
	 * @param {module:core/editor/editor~Editor} editor
	 * @param {Function} testCallback Function used to match the text.
	 * @param {Function} textMatcherCallback Function used to process matched text.
	 */
	constructor( editor, testCallback, textMatcherCallback ) {
		this.editor = editor;
		this.testCallback = testCallback;
		this.textMatcher = textMatcherCallback;

		this.hasMatch = false;

		this._startListening();
	}

	/**
	 * Last matched text.
	 *
	 * @property {String}
	 */
	get last() {
		return this._getText();
	}

	/**
	 * Starts listening the editor for typing & selection events.
	 *
	 * @private
	 */
	_startListening() {
		const editor = this.editor;

		editor.model.document.selection.on( 'change:range', ( evt, { directChange } ) => {
			// The indirect changes (ie when user types or external changes are applied) are handled in document's change event.
			if ( !directChange ) {
				return;
			}

			this._evaluateTextBeforeSelection();
		} );

		editor.model.document.on( 'change:data', ( evt, batch ) => {
			if ( batch.type == 'transparent' ) {
				return false;
			}

			this._evaluateTextBeforeSelection();
		} );
	}

	/**
	 * Checks the editor content for matched text.
	 *
	 * @fires matched
	 * @fires unmatched
	 *
	 * @private
	 */
	_evaluateTextBeforeSelection() {
		const text = this._getText();

		const textHasMatch = this.testCallback( text );

		if ( !textHasMatch && this.hasMatch ) {
			/**
			 * Fired whenever text doesn't match anymore. Fired only when text matcher was matched.
			 *
			 * @event unmatched
			 */
			this.fire( 'unmatched' );
		}

		this.hasMatch = textHasMatch;

		if ( textHasMatch ) {
			const matched = this.textMatcher( text );

			/**
			 * Fired whenever text matcher was matched.
			 *
			 * @event matched
			 */
			this.fire( 'matched', { text, matched } );
		}
	}

	/**
	 * Returns the text before the caret from the current selection block.
	 *
	 * @returns {String|undefined} Text from block or undefined if selection is not collapsed.
	 * @private
	 */
	_getText() {
		const editor = this.editor;
		const selection = editor.model.document.selection;

		// Do nothing if selection is not collapsed.
		if ( !selection.isCollapsed ) {
			return;
		}

		const block = selection.focus.parent;

		return _getText( editor.model.createRangeIn( block ) ).slice( 0, selection.focus.offset );
	}
}

/**
 * Returns whole text from given range by adding all data from text nodes together.
 *
 * @protected
 * @param {module:engine/model/range~Range} range
 * @returns {String}
 */
export function _getText( range ) {
	return Array.from( range.getItems() ).reduce( ( a, b ) => a + b.data, '' );
}

mix( TextWatcher, EmitterMixin );

