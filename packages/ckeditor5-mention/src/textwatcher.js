/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module mention/textwatcher
 */

import mix from '@ckeditor/ckeditor5-utils/src/mix';
import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import priorities from '@ckeditor/ckeditor5-utils/src/priorities';

// Fire all "unmatched" events before any "matched" events.
const UNMATCH_EVENT_PRIORITY = priorities.normal + 10;
const MATCH_EVENT_PRIORITY = priorities.normal;

/**
 * Text watcher feature.
 *
 * Fires {@link module:mention/textwatcher~TextWatcher#event:matched matched} and
 * {@link module:mention/textwatcher~TextWatcher#event:unmatched unmatched} events on typing or selection changes.
 *
 * **Note**: The "unmatched" events for any created text watchers are fired before any "matched" events of another text watchers.
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

		// Register "unmatch" evaluator for selection changes.
		editor.model.document.selection.on( 'change', ( evt, { directChange } ) => {
			// The indirect changes (ie on typing) are handled in document's change event.
			if ( !directChange ) {
				return;
			}

			this._evaluateTextBeforeSelectionForUnmatch();
		}, { priority: UNMATCH_EVENT_PRIORITY } );

		// Register "match" evaluator for selection changes.
		editor.model.document.selection.on( 'change', ( evt, { directChange } ) => {
			// The indirect changes (ie on typing) are handled in document's change event.
			if ( !directChange ) {
				return;
			}

			this._evaluateTextBeforeSelectionForMatch();
		}, { priority: MATCH_EVENT_PRIORITY } );

		// Register "unmatch" evaluator for typing changes.
		editor.model.document.on( 'change:data', ( evt, batch ) => {
			if ( !this._isTypingChange( batch ) ) {
				return;
			}

			this._evaluateTextBeforeSelectionForUnmatch();
		}, { priority: UNMATCH_EVENT_PRIORITY } );

		// Register "match" evaluator for typing changes.
		editor.model.document.on( 'change:data', ( evt, batch ) => {
			if ( !this._isTypingChange( batch ) ) {
				return;
			}

			this._evaluateTextBeforeSelectionForMatch();
		}, { priority: MATCH_EVENT_PRIORITY } );
	}

	/**
	 * Checks the editor content for matched text.
	 *
	 * @fires module:mention/textwatcher~TextWatcher#unmatched
	 *
	 * @private
	 */
	_evaluateTextBeforeSelectionForUnmatch() {
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
	}

	/**
	 * Checks the editor content for unmatched text.
	 *
	 * @fires module:mention/textwatcher~TextWatcher#matched
	 *
	 * @private
	 */
	_evaluateTextBeforeSelectionForMatch() {
		const text = this._getText();
		const textHasMatch = this.testCallback( text );

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
	 * Returns true if batch contains typing change. Typing change is detected as single character insertion.
	 *
	 * @param {module:engine/model/batch~Batch} batch
	 * @returns {Boolean}
	 * @private
	 */
	_isTypingChange( batch ) {
		const editor = this.editor;

		if ( batch.type == 'transparent' ) {
			return false;
		}

		const changes = Array.from( editor.model.document.differ.getChanges() );
		const entry = changes[ 0 ];

		// Typing is represented by only a single change.
		return changes.length == 1 && entry.name == '$text' && entry.length == 1;
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

