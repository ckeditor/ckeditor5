/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module typing/textwatcher
 */

import { ObservableMixin, type ObservableChangeEvent } from '@ckeditor/ckeditor5-utils';
import getLastTextLine from './utils/getlasttextline.js';

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
 */
export default class TextWatcher extends /* #__PURE__ */ ObservableMixin() {
	/**
	 * The editor's model.
	 */
	public readonly model: Model;

	/**
	 * The function used to match the text.
	 *
	 * The test callback can return 3 values:
	 *
	 * * `false` if there is no match,
	 * * `true` if there is a match,
	 * * an object if there is a match and we want to pass some additional information to the {@link #event:matched:data} event.
	 */
	public testCallback: ( text: string ) => unknown;

	/**
	 * Whether there is a match currently.
	 */
	private _hasMatch: boolean;

	/**
	 * Flag indicating whether the `TextWatcher` instance is enabled or disabled.
	 * A disabled TextWatcher will not evaluate text.
	 *
	 * To disable TextWatcher:
	 *
	 * ```ts
	 * const watcher = new TextWatcher( editor.model, testCallback );
	 *
	 * // After this a testCallback will not be called.
	 * watcher.isEnabled = false;
	 * ```
	 */
	declare public isEnabled: boolean;

	/**
	 * Creates a text watcher instance.
	 *
	 * @param testCallback See {@link module:typing/textwatcher~TextWatcher#testCallback}.
	 */
	constructor( model: Model, testCallback: ( text: string ) => unknown ) {
		super();

		this.model = model;
		this.testCallback = testCallback;
		this._hasMatch = false;

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
	 * Flag indicating whether there is a match currently.
	 */
	public get hasMatch(): boolean {
		return this._hasMatch;
	}

	/**
	 * Starts listening to the editor for typing and selection events.
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
	 * @param suffix A suffix used for generating the event name.
	 * @param data Data object for event.
	 */
	private _evaluateTextBeforeSelection( suffix: 'data' | 'selection', data: { batch?: Batch } = {} ): void {
		const model = this.model;
		const document = model.document;
		const selection = document.selection;

		const rangeBeforeSelection = model.createRange( model.createPositionAt( selection.focus!.parent, 0 ), selection.focus! );

		const { text, range } = getLastTextLine( rangeBeforeSelection, model );

		const testResult = this.testCallback( text );

		if ( !testResult && this.hasMatch ) {
			this.fire<TextWatcherUnmatchedEvent>( 'unmatched' );
		}

		this._hasMatch = !!testResult;

		if ( testResult ) {
			const eventData = Object.assign( data, { text, range } );

			// If the test callback returns an object with additional data, assign the data as well.
			if ( typeof testResult == 'object' ) {
				Object.assign( eventData, testResult );
			}

			this.fire<TextWatcherMatchedEvent>( `matched:${ suffix }`, eventData );
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
 * @eventName ~TextWatcher#matched:data
 * @param data Event data.
 * @param data.testResult The additional data returned from the {@link module:typing/textwatcher~TextWatcher#testCallback}.
 */
export type TextWatcherMatchedDataEvent<TCallbackResult extends Record<string, unknown>> = {
	name: 'matched:data';
	args: [ data: TextWatcherMatchedDataEventData & TCallbackResult ];
};

export interface TextWatcherMatchedDataEventData {

	/**
	 * The full text before selection to which the regexp was applied.
	 */
	text: string;

	/**
	 * The range representing the position of the `data.text`.
	 */
	range: Range;

	batch: Batch;
}

/**
 * Fired whenever the text watcher found a match for selection changes.
 *
 * @eventName ~TextWatcher#matched:selection
 * @param data Event data.
 * @param data.testResult The additional data returned from the {@link module:typing/textwatcher~TextWatcher#testCallback}.
 */
export type TextWatcherMatchedSelectionEvent<TCallbackResult extends Record<string, unknown>> = {
	name: 'matched:selection';
	args: [ data: TextWatcherMatchedSelectionEventData & TCallbackResult ];
};

export interface TextWatcherMatchedSelectionEventData {

	/**
	 * The full text before selection.
	 */
	text: string;

	/**
	 * The range representing the position of the `data.text`.
	 */
	range: Range;
}

/**
 * Fired whenever the text does not match anymore. Fired only when the text watcher found a match.
 *
 * @eventName ~TextWatcher#unmatched
 */
export type TextWatcherUnmatchedEvent = {
	name: 'unmatched';
	args: [];
};
