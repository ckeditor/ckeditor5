/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/textwatcher
 */

import mix from '@ckeditor/ckeditor5-utils/src/mix';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import getLastTextLine from './utils/getlasttextline';

/**
 * The text watcher feature.
 *
 * Fires the {@link module:typing/textwatcher~TextWatcher#event:matched:data `matched:data`},
 * {@link module:typing/textwatcher~TextWatcher#event:matched:selection `matched:selection`} and
 * {@link module:typing/textwatcher~TextWatcher#event:unmatched `unmatched`} events on typing or selection changes.
 *
 * @private
 * @mixes module:utils/observablemixin~ObservableMixin
 */
export default class TextWatcher {
	/**
	 * Creates a text watcher instance.
	 *
	 * @param {module:engine/model/model~Model} model
	 * @param {module:typing/textwatcher~TextWatcher#testCallback} testCallback
	 */
	constructor( model, testCallback ) {
		/**
		 * The editor's model.
		 *
		 * @readonly
		 * @member {module:engine/model/model~Model}
		 */
		this.model = model;

		/**
		 * The function used to match the text.
		 *
		 * The test callback can return 3 values:
		 *
		 * * `false` if there is no match,
		 * * `true` if there is a match,
		 * * an object if there is a match and we want to pass some additional information to the {@link #matched:data} event.
		 *
		 * @member {Function} #testCallback
		 * @returns {Object} testResult
		 */
		this.testCallback = testCallback;

		/**
		 * Whether there is a match currently.
		 *
		 * @readonly
		 * @member {Boolean}
		 */
		this.hasMatch = false;

		/**
		 * Flag indicating whether the `TextWatcher` instance is enabled or disabled.
		 * A disabled TextWatcher will not evaluate text.
		 *
		 * To disable TextWatcher:
		 *
		 *		const watcher = new TextWatcher( editor.model, testCallback );
		 *
		 *		// After this a testCallback will not be called.
		 *		watcher.isEnabled = false;
		 *
		 * @observable
		 * @member {Boolean} #isEnabled
		 */
		this.set( 'isEnabled', true );

		// Toggle text watching on isEnabled state change.
		this.on( 'change:isEnabled', () => {
			if ( this.isEnabled ) {
				this._startListening();
			} else {
				this.stopListening( model.document.selection );
				this.stopListening( model.document );
			}
		} );

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

		this.listenTo( document.selection, 'change:range', ( evt, { directChange } ) => {
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

		this.listenTo( document, 'change:data', ( evt, batch ) => {
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
		const model = this.model;
		const document = model.document;
		const selection = document.selection;

		const rangeBeforeSelection = model.createRange( model.createPositionAt( selection.focus.parent, 0 ), selection.focus );

		const { text, range } = getLastTextLine( rangeBeforeSelection, model );

		const testResult = this.testCallback( text );

		if ( !testResult && this.hasMatch ) {
			this.fire( 'unmatched' );
		}

		this.hasMatch = !!testResult;

		if ( testResult ) {
			const eventData = Object.assign( data, { text, range } );

			// If the test callback returns an object with additional data, assign the data as well.
			if ( typeof testResult == 'object' ) {
				Object.assign( eventData, testResult );
			}

			this.fire( `matched:${ suffix }`, eventData );
		}
	}
}

mix( TextWatcher, ObservableMixin );

/**
 * Fired whenever the text watcher found a match for data changes.
 *
 * @event matched:data
 * @param {Object} data Event data.
 * @param {String} data.text The full text before selection to which the regexp was applied.
 * @param {module:engine/model/range~Range} data.range The range representing the position of the `data.text`.
 * @param {Object} data.testResult [Optional] The additional data returned from the {module:typing/textwatcher~TextWatcher#testCallback}.
 */

/**
 * Fired whenever the text watcher found a match for selection changes.
 *
 * @event matched:selection
 * @param {Object} data Event data.
 * @param {String} data.text The full text before selection.
 * @param {module:engine/model/range~Range} data.range The range representing the position of the `data.text`.
 * @param {Object} data.testResult [Optional] The additional data returned from the {module:typing/textwatcher~TextWatcher#testCallback}.
 */

/**
 * Fired whenever the text does not match anymore. Fired only when the text watcher found a match.
 *
 * @event unmatched
 */
