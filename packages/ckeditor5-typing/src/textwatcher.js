/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/textwatcher
 */

import mix from '@ckeditor/ckeditor5-utils/src/mix';
import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';

/**
 * The text watcher feature.
 *
 * Fires the {@link module:typing/textwatcher~TextWatcher#event:matched:data `matched:data`},
 * {@link module:typing/textwatcher~TextWatcher#event:matched:selection `matched:selection`} and
 * {@link module:typing/textwatcher~TextWatcher#event:unmatched `unmatched`} events on typing or selection changes.
 *
 * @private
 */
export default class TextWatcher {
	/**
	 * Creates a text watcher instance.
	 * @param {module:engine/model/model~Model} model
	 * @param {Function} testCallback The function used to match the text.
	 */
	constructor( model, testCallback ) {
		this.model = model;
		this.testCallback = testCallback;
		this.hasMatch = false;

		this._startListening();
	}

	/**
	 * Starts listening to the editor for typing and selection events.
	 *
	 * @private
	 */
	_startListening() {
		const model = this.model;
		const document = model.document;

		document.selection.on( 'change:range', ( evt, { directChange } ) => {
			// Indirect changes (i.e. when the user types or external changes are applied) are handled in the document's change event.
			if ( !directChange ) {
				return;
			}

			// Act only on collapsed selection.
			if ( !document.selection.isCollapsed ) {
				if ( this.hasMatch ) {
					this.fire( 'unmatched' );
					this.hasMatch = false;
				}

				return;
			}

			this._evaluateTextBeforeSelection( 'selection' );
		} );

		document.on( 'change:data', ( evt, batch ) => {
			if ( batch.type == 'transparent' ) {
				return;
			}

			this._evaluateTextBeforeSelection( 'data', { batch } );
		} );
	}

	/**
	 * Checks the editor content for matched text.
	 *
	 * @fires matched:data
	 * @fires matched:selection
	 * @fires unmatched
	 *
	 * @private
	 * @param {'data'|'selection'} suffix A suffix used for generating the event name.
	 * @param {Object} data Data object for event.
	 */
	_evaluateTextBeforeSelection( suffix, data = {} ) {
		const text = this._getText();

		const textHasMatch = this.testCallback( text );

		if ( !textHasMatch && this.hasMatch ) {
			/**
			 * Fired whenever the text does not match anymore. Fired only when the text watcher found a match.
			 *
			 * @event unmatched
			 */
			this.fire( 'unmatched' );
		}

		this.hasMatch = textHasMatch;

		if ( textHasMatch ) {
			const eventData = Object.assign( data, { text } );

			/**
			 * Fired whenever the text watcher found a match for data changes.
			 *
			 * @event matched:data
			 * @param {Object} data Event data.
			 * @param {String} data.text The full text before selection.
			 * @param {module:engine/model/batch~Batch} data.batch A batch associated with a change.
			 */
			/**
			 * Fired whenever the text watcher found a match for selection changes.
			 *
			 * @event matched:selection
			 * @param {Object} data Event data.
			 * @param {String} data.text The full text before selection.
			 */
			this.fire( `matched:${ suffix }`, eventData );
		}
	}

	/**
	 * Returns the text before the caret from the current selection block.
	 *
	 * @returns {String|undefined} The text from the block or undefined if the selection is not collapsed.
	 * @private
	 */
	_getText() {
		const model = this.model;
		const document = model.document;
		const selection = document.selection;

		const rangeBeforeSelection = model.createRange( model.createPositionAt( selection.focus.parent, 0 ), selection.focus );

		return _getText( rangeBeforeSelection );
	}
}

// Returns the whole text from a given range by adding all data from the text nodes together.
//
// @param {module:engine/model/range~Range} range
// @returns {String}
function _getText( range ) {
	return Array.from( range.getItems() ).reduce( ( rangeText, node ) => {
		if ( node.is( 'softBreak' ) ) {
			// Trim text to a softBreak.
			return '';
		}

		return rangeText + node.data;
	}, '' );
}

mix( TextWatcher, EmitterMixin );

