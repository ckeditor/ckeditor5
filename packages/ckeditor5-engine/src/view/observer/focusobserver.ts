/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/observer/focusobserver
 */

/* globals setTimeout, clearTimeout */

import DomEventObserver from './domeventobserver';
import type DomEventData from './domeventdata';
import type View from '../view';

/**
 * {@link module:engine/view/document~Document#event:focus Focus}
 * and {@link module:engine/view/document~Document#event:blur blur} events observer.
 * Focus observer handle also {@link module:engine/view/rooteditableelement~RootEditableElement#isFocused isFocused} property of the
 * {@link module:engine/view/rooteditableelement~RootEditableElement root elements}.
 *
 * Note that this observer is attached by the {@link module:engine/view/view~View} and is available by default.
 *
 * @extends module:engine/view/observer/domeventobserver~DomEventObserver
 */
export default class FocusObserver extends DomEventObserver<'focus' | 'blur'> {
	private _renderTimeoutId!: ReturnType<typeof setTimeout>;
	private _isFocusChanging: boolean = false;

	constructor( view: View ) {
		super( view );

		this.domEventType = [ 'focus', 'blur' ];
		this.useCapture = true;
		const document = this.document;

		document.on<ViewDocumentFocusEvent>( 'focus', () => {
			/**
			 * Set to `true` if the document is in the process of setting the focus.
			 *
			 * The flag is used to indicate that setting the focus is in progress.
			 *
			 * @internal
			 * @type {Boolean} module:engine/view/observer/focusobserver#_isFocusChanging
			 */
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
				this.flush();
				view.change( () => {} );
			}, 50 );
		} );

		document.on<ViewDocumentFocusEvent>( 'blur', ( evt, data ) => {
			const selectedEditable = document.selection.editableElement;

			if ( selectedEditable === null || selectedEditable === data.target ) {
				document.isFocused = false;
				this._isFocusChanging = false;

				// Re-render the document to update view elements
				// (changing document.isFocused already marked view as changed since last rendering).
				view.change( () => {} );
			}
		} );

		/**
		 * Identifier of the timeout currently used by focus listener to delay rendering execution.
		 *
		 * @private
		 * @member {Number} #_renderTimeoutId
		 */
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

	public onDomEvent( domEvent: FocusEvent ): void {
		this.fire( domEvent.type, domEvent );
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		if ( this._renderTimeoutId ) {
			clearTimeout( this._renderTimeoutId );
		}

		super.destroy();
	}
}

export type ViewDocumentFocusEvent = {
	name: 'focus' | 'blur';
	args: [ data: DomEventData<FocusEvent> ];
};

/**
 * Fired when one of the editables gets focus.
 *
 * Introduced by {@link module:engine/view/observer/focusobserver~FocusObserver}.
 *
 * Note that because {@link module:engine/view/observer/focusobserver~FocusObserver} is attached by the
 * {@link module:engine/view/view~View} this event is available by default.
 *
 * @see module:engine/view/observer/focusobserver~FocusObserver
 * @event module:engine/view/document~Document#event:focus
 * @param {module:engine/view/observer/domeventdata~DomEventData} data Event data.
 */

/**
 * Fired when one of the editables loses focus.
 *
 * Introduced by {@link module:engine/view/observer/focusobserver~FocusObserver}.
 *
 * Note that because {@link module:engine/view/observer/focusobserver~FocusObserver} is attached by the
 * {@link module:engine/view/view~View} this event is available by default.
 *
 * @see module:engine/view/observer/focusobserver~FocusObserver
 * @event module:engine/view/document~Document#event:blur
 * @param {module:engine/view/observer/domeventdata~DomEventData} data Event data.
 */
