/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/observer/focusobserver
 */

/* globals setTimeout, clearTimeout */

import DomEventObserver from './domeventobserver.js';
import type DomEventData from './domeventdata.js';
import type View from '../view.js';
import type { ViewDocumentInputEvent } from './inputobserver.js';

/**
 * {@link module:engine/view/document~Document#event:focus Focus}
 * and {@link module:engine/view/document~Document#event:blur blur} events observer.
 * Focus observer handle also {@link module:engine/view/rooteditableelement~RootEditableElement#isFocused isFocused} property of the
 * {@link module:engine/view/rooteditableelement~RootEditableElement root elements}.
 *
 * Note that this observer is attached by the {@link module:engine/view/view~View} and is available by default.
 */
export default class FocusObserver extends DomEventObserver<'focus' | 'blur'> {
	/**
	 * Identifier of the timeout currently used by focus listener to delay rendering execution.
	 */
	private _renderTimeoutId: ReturnType<typeof setTimeout> | null = null;

	/**
	 * Set to `true` if the document is in the process of setting the focus.
	 *
	 * The flag is used to indicate that setting the focus is in progress.
	 */
	private _isFocusChanging: boolean = false;

	/**
	 * @inheritDoc
	 */
	public readonly domEventType = [ 'focus', 'blur' ] as const;

	/**
	 * @inheritDoc
	 */
	constructor( view: View ) {
		super( view );

		this.useCapture = true;
		const document = this.document;

		document.on<ViewDocumentFocusEvent>( 'focus', () => this._handleFocus() );
		document.on<ViewDocumentBlurEvent>( 'blur', ( evt, data ) => this._handleBlur( data ) );

		// Focus the editor in cases where browser dispatches `beforeinput` event to a not-focused editable element.
		// This is flushed by the beforeinput listener in the `InsertTextObserver`.
		// Note that focus is set only if the document is not focused yet.
		// See https://github.com/ckeditor/ckeditor5/issues/14702.
		document.on<ViewDocumentInputEvent>( 'beforeinput', () => {
			if ( !document.isFocused ) {
				this._handleFocus();
			}
		}, { priority: 'highest' } );
	}

	/**
	 * Finishes setting the document focus state.
	 */
	public flush(): void {
		if ( this._isFocusChanging ) {
			this._isFocusChanging = false;
			this.document.isFocused = true;
		}
	}

	/**
	 * @inheritDoc
	 */
	public onDomEvent( domEvent: FocusEvent ): void {
		this.fire( domEvent.type, domEvent );
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		this._clearTimeout();
		super.destroy();
	}

	/**
	 * The `focus` event handler.
	 */
	private _handleFocus(): void {
		this._clearTimeout();
		this._isFocusChanging = true;

		// Unfortunately native `selectionchange` event is fired asynchronously.
		// We need to wait until `SelectionObserver` handle the event and then render. Otherwise rendering will
		// overwrite new DOM selection with selection from the view.
		// See https://github.com/ckeditor/ckeditor5-engine/issues/795 for more details.
		// Long timeout is needed to solve #676 and https://github.com/ckeditor/ckeditor5-engine/issues/1157 issues.
		//
		// Using `view.change()` instead of `view.forceRender()` to prevent double rendering
		// in a situation where `selectionchange` already caused selection change.
		this._renderTimeoutId = setTimeout( () => {
			this._renderTimeoutId = null;
			this.flush();
			this.view.change( () => {} );
		}, 50 );
	}

	/**
	 * The `blur` event handler.
	 */
	private _handleBlur( data: DomEventData<FocusEvent> ): void {
		const selectedEditable = this.document.selection.editableElement;

		if ( selectedEditable === null || selectedEditable === data.target ) {
			this.document.isFocused = false;
			this._isFocusChanging = false;

			// Re-render the document to update view elements
			// (changing document.isFocused already marked view as changed since last rendering).
			this.view.change( () => {} );
		}
	}

	/**
	 * Clears timeout.
	 */
	private _clearTimeout(): void {
		if ( this._renderTimeoutId ) {
			clearTimeout( this._renderTimeoutId );
			this._renderTimeoutId = null;
		}
	}
}

/**
 * Fired when one of the editables gets focus.
 *
 * Introduced by {@link module:engine/view/observer/focusobserver~FocusObserver}.
 *
 * Note that because {@link module:engine/view/observer/focusobserver~FocusObserver} is attached by the
 * {@link module:engine/view/view~View} this event is available by default.
 *
 * @see module:engine/view/observer/focusobserver~FocusObserver
 * @eventName module:engine/view/document~Document#focus
 * @param data Event data.
 */
export type ViewDocumentFocusEvent = {
	name: 'focus';
	args: [ data: DomEventData<FocusEvent> ];
};

/**
 * Fired when one of the editables loses focus.
 *
 * Introduced by {@link module:engine/view/observer/focusobserver~FocusObserver}.
 *
 * Note that because {@link module:engine/view/observer/focusobserver~FocusObserver} is attached by the
 * {@link module:engine/view/view~View} this event is available by default.
 *
 * @see module:engine/view/observer/focusobserver~FocusObserver
 * @eventName module:engine/view/document~Document#blur
 * @param data Event data.
 */
export type ViewDocumentBlurEvent = {
	name: 'blur';
	args: [ data: DomEventData<FocusEvent> ];
};
