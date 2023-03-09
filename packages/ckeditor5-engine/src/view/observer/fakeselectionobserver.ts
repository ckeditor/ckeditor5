/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/observer/fakeselectionobserver
 */

import Observer from './observer';
import type { ViewDocumentArrowKeyEvent } from './arrowkeysobserver';
import ViewSelection from '../selection';
import type View from '../view';
import type {
	ViewDocumentSelectionChangeEvent,
	ViewDocumentSelectionChangeDoneEvent,
	ViewDocumentSelectionEventData
} from './selectionobserver';
import { keyCodes } from '@ckeditor/ckeditor5-utils';
import { debounce, type DebouncedFunc } from 'lodash-es';

/**
 * Fake selection observer class. If view selection is fake it is placed in dummy DOM container. This observer listens
 * on {@link module:engine/view/document~Document#event:keydown keydown} events and handles moving fake view selection to the correct place
 * if arrow keys are pressed.
 * Fires {@link module:engine/view/document~Document#event:selectionChange selectionChange event} simulating natural behaviour of
 * {@link module:engine/view/observer/selectionobserver~SelectionObserver SelectionObserver}.
 */
export default class FakeSelectionObserver extends Observer {
	/**
	 * Fires debounced event `selectionChangeDone`. It uses `lodash#debounce` method to delay function call.
	 */
	private readonly _fireSelectionChangeDoneDebounced: DebouncedFunc<( data: ViewDocumentSelectionEventData ) => void>;

	/**
	 * Creates new FakeSelectionObserver instance.
	 */
	constructor( view: View ) {
		super( view );

		this._fireSelectionChangeDoneDebounced = debounce( data => {
			this.document.fire<ViewDocumentSelectionChangeDoneEvent>( 'selectionChangeDone', data );
		}, 200 );
	}

	/**
	 * @inheritDoc
	 */
	public override observe(): void {
		const document = this.document;

		document.on<ViewDocumentArrowKeyEvent>( 'arrowKey', ( eventInfo, data ) => {
			const selection = document.selection;

			if ( selection.isFake && this.isEnabled ) {
				// Prevents default key down handling - no selection change will occur.
				data.preventDefault();
			}
		}, { context: '$capture' } );

		document.on<ViewDocumentArrowKeyEvent>( 'arrowKey', ( eventInfo, data ) => {
			const selection = document.selection;

			if ( selection.isFake && this.isEnabled ) {
				this._handleSelectionMove( data.keyCode );
			}
		}, { priority: 'lowest' } );
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		this._fireSelectionChangeDoneDebounced.cancel();
	}

	/**
	 * Handles collapsing view selection according to given key code. If left or up key is provided - new selection will be
	 * collapsed to left. If right or down key is pressed - new selection will be collapsed to right.
	 *
	 * This method fires {@link module:engine/view/document~Document#event:selectionChange} and
	 * {@link module:engine/view/document~Document#event:selectionChangeDone} events imitating behaviour of
	 * {@link module:engine/view/observer/selectionobserver~SelectionObserver}.
	 */
	private _handleSelectionMove( keyCode: number ): void {
		const selection = this.document.selection;
		const newSelection = new ViewSelection( selection.getRanges(), { backward: selection.isBackward, fake: false } );

		// Left or up arrow pressed - move selection to start.
		if ( keyCode == keyCodes.arrowleft || keyCode == keyCodes.arrowup ) {
			newSelection.setTo( newSelection.getFirstPosition() );
		}

		// Right or down arrow pressed - move selection to end.
		if ( keyCode == keyCodes.arrowright || keyCode == keyCodes.arrowdown ) {
			newSelection.setTo( newSelection.getLastPosition() );
		}

		const data = {
			oldSelection: selection,
			newSelection,
			domSelection: null
		};

		// Fire dummy selection change event.
		this.document.fire<ViewDocumentSelectionChangeEvent>( 'selectionChange', data );

		// Call` #_fireSelectionChangeDoneDebounced` every time when `selectionChange` event is fired.
		// This function is debounced what means that `selectionChangeDone` event will be fired only when
		// defined int the function time will elapse since the last time the function was called.
		// So `selectionChangeDone` will be fired when selection will stop changing.
		this._fireSelectionChangeDoneDebounced( data );
	}
}
