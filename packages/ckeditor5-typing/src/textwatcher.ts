/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/textwatcher
 */

import { ObservableMixin, type ObservableChangeEvent } from '@ckeditor/ckeditor5-utils';
import getLastTextLine from './utils/getlasttextline';

import type {
	Batch,
	Model,
	Range,
	DocumentChangeEvent,
	DocumentSelectionChangeEvent
} from '@ckeditor/ckeditor5-engine';

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
export default class TextWatcher extends ObservableMixin() {
	public readonly model: Model;
	public testCallback: ( text: string ) => unknown;

	private _hasMatch: boolean;

	declare public isEnabled: boolean;

	/**
	 * Creates a text watcher instance.
	 *
	 * @param {module:engine/model/model~Model} model
	 * @param {Function} testCallback See {@link module:typing/textwatcher~TextWatcher#testCallback}.
	 */
	constructor( model: Model, testCallback: ( text: string ) => unknown ) {
		super();

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
		 * * an object if there is a match and we want to pass some additional information to the {@link #event:matched:data} event.
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
		this._hasMatch = false;

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
		this.on<ObservableChangeEvent>( 'change:isEnabled', () => {
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
	 * TODO
	 */
	public get hasMatch(): boolean {
		return this._hasMatch;
	}

	/**
	 * Starts listening to the editor for typing and selection events.
	 *
	 * @private
	 */
	private _startListening(): void {
		const model = this.model;
		const document = model.document;

		this.listenTo<DocumentSelectionChangeEvent>( document.selection, 'change:range', ( evt, { directChange } ) => {
			// Indirect changes (i.e. when the user types or external changes are applied) are handled in the document's change event.
			if ( !directChange ) {
				return;
			}

			// Act only on collapsed selection.
			if ( !document.selection.isCollapsed ) {
				if ( this.hasMatch ) {
					this.fire( 'unmatched' );
					this._hasMatch = false;
				}

				return;
			}

			this._evaluateTextBeforeSelection( 'selection' );
		} );

		this.listenTo<DocumentChangeEvent>( document, 'change:data', ( evt, batch ) => {
			if ( batch.isUndo || !batch.isLocal ) {
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
	private _evaluateTextBeforeSelection( suffix: 'data' | 'selection', data: { batch?: Batch } = {} ): void {
		const model = this.model;
		const document = model.document;
		const selection = document.selection;

		const rangeBeforeSelection = model.createRange( model.createPositionAt( selection.focus!.parent, 0 ), selection.focus! );

		const { text, range } = getLastTextLine( rangeBeforeSelection, model );

		const testResult = this.testCallback( text );

		if ( !testResult && this.hasMatch ) {
			this.fire( 'unmatched' );
		}

		this._hasMatch = !!testResult;

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

export type TextWatcherMatchedEvent<TCallbackResult extends Record<string, unknown> = Record<string, unknown>> = {
	name: 'matched' | 'matched:data' | 'matched:selection';
	args: [ {
		text: string;
		range: Range;
		batch?: Batch;
	} & TCallbackResult ];
};

/**
 * Fired whenever the text watcher found a match for data changes.
 *
 * @event matched:data
 * @param {Object} data Event data.
 * @param {String} data.text The full text before selection to which the regexp was applied.
 * @param {module:engine/model/range~Range} data.range The range representing the position of the `data.text`.
 * @param {Object} [data.testResult] The additional data returned from the {@link module:typing/textwatcher~TextWatcher#testCallback}.
 */
export type TextWatcherMatchedDataEvent<TCallbackResult extends Record<string, unknown>> = {
	name: 'matched:data';
	args: [ {
		text: string;
		range: Range;
		batch: Batch;
	} & TCallbackResult ];
};

/**
 * Fired whenever the text watcher found a match for selection changes.
 *
 * @event matched:selection
 * @param {Object} data Event data.
 * @param {String} data.text The full text before selection.
 * @param {module:engine/model/range~Range} data.range The range representing the position of the `data.text`.
 * @param {Object} [data.testResult] The additional data returned from the {@link module:typing/textwatcher~TextWatcher#testCallback}.
 */
export type TextWatcherMatchedSelectionEvent<TCallbackResult extends Record<string, unknown>> = {
	name: 'matched:selection';
	args: [ {
		text: string;
		range: Range;
	} & TCallbackResult ];
};

/**
 * Fired whenever the text does not match anymore. Fired only when the text watcher found a match.
 *
 * @event unmatched
 */
