/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module typing/inserttextobserver
 */

import { env, EventInfo } from '@ckeditor/ckeditor5-utils';

import {
	DomEventData,
	Observer,
	FocusObserver,
	type EditingView,
	type ViewDocumentCompositionEndEvent,
	type ViewDocumentInputEvent,
	type ViewDocumentSelection,
	type ViewSelection
} from '@ckeditor/ckeditor5-engine';

// @if CK_DEBUG_TYPING // const { _buildLogMessage } = require( '@ckeditor/ckeditor5-engine/src/dev-utils/utils.js' );

const TYPING_INPUT_TYPES = [
	// For collapsed range:
	//	- This one is a regular typing (all browsers, all systems).
	//	- This one is used by Chrome when typing accented letter – 2nd step when the user selects the accent (Mac).
	// For non-collapsed range:
	//	- This one is used by Chrome when typing accented letter – when the selection box first appears (Mac).
	//	- This one is used by Safari when accepting spell check suggestions from the context menu (Mac).
	'insertText',

	// This one is used by Safari when typing accented letter (Mac).
	// This one is used by Safari when accepting spell check suggestions from the autocorrection pop-up (Mac).
	'insertReplacementText'
];

const TYPING_INPUT_TYPES_ANDROID = [
	...TYPING_INPUT_TYPES,
	'insertCompositionText'
];

/**
 * Text insertion observer introduces the {@link module:engine/view/document~Document#event:insertText} event.
 */
export default class InsertTextObserver extends Observer {
	/**
	 * Instance of the focus observer. Insert text observer calls
	 * {@link module:engine/view/observer/focusobserver~FocusObserver#flush} to mark the latest focus change as complete.
	 */
	public readonly focusObserver: FocusObserver;

	/**
	 * @inheritDoc
	 */
	constructor( view: EditingView ) {
		super( view );

		this.focusObserver = view.getObserver( FocusObserver );

		// On Android composition events should immediately be applied to the model. Rendering is not disabled.
		// On non-Android the model is updated only on composition end.
		// On Android we can't rely on composition start/end to update model.
		const typingInputTypes = env.isAndroid ? TYPING_INPUT_TYPES_ANDROID : TYPING_INPUT_TYPES;

		const viewDocument = view.document;

		viewDocument.on<ViewDocumentInputEvent>( 'beforeinput', ( evt, data ) => {
			if ( !this.isEnabled ) {
				return;
			}

			const { data: text, targetRanges, inputType, domEvent, isComposing } = data;

			if ( !typingInputTypes.includes( inputType ) ) {
				return;
			}

			// Mark the latest focus change as complete (we are typing in editable after the focus
			// so the selection is in the focused element).
			this.focusObserver.flush();

			const eventInfo = new EventInfo( viewDocument, 'insertText' );

			viewDocument.fire( eventInfo, new DomEventData( view, domEvent, {
				text,
				selection: view.createSelection( targetRanges ),
				isComposing
			} ) );

			// Stop the beforeinput event if `delete` event was stopped.
			// https://github.com/ckeditor/ckeditor5/issues/753
			if ( eventInfo.stop.called ) {
				evt.stop();
			}
		} );

		// On Android composition events are immediately applied to the model.
		// On non-Android the model is updated only on composition end.
		// On Android we can't rely on composition start/end to update model.
		if ( !env.isAndroid ) {
			// Note: The priority must be lower than the CompositionObserver handler to call it after the renderer is unblocked.
			// This is important for view to DOM position mapping.
			// This causes the effect of first remove composed DOM and then reapply it after model modification.
			viewDocument.on<ViewDocumentCompositionEndEvent>( 'compositionend', ( evt, { data, domEvent } ) => {
				if ( !this.isEnabled ) {
					return;
				}

				// In case of aborted composition.
				if ( !data ) {
					return;
				}

				// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
				// @if CK_DEBUG_TYPING // 	console.log( ..._buildLogMessage( this, 'InsertTextObserver',
				// @if CK_DEBUG_TYPING // 		`%cFire insertText event, %c${ JSON.stringify( data ) }`,
				// @if CK_DEBUG_TYPING // 		'font-weight: bold',
				// @if CK_DEBUG_TYPING // 		 'color: blue'
				// @if CK_DEBUG_TYPING // 	) );
				// @if CK_DEBUG_TYPING // }

				// How do we know where to insert the composed text?
				// 1. The SelectionObserver is blocked and the view is not updated with the composition changes.
				// 2. The last moment before it's locked is the `compositionstart` event.
				// 3. The `SelectionObserver` is listening for `compositionstart` event and immediately converts
				//    the selection. Handle this at the low priority so after the rendering is blocked.
				viewDocument.fire( 'insertText', new DomEventData( view, domEvent, {
					text: data,
					isComposing: true
				} ) );
			}, { priority: 'low' } );
		}
	}

	/**
	 * @inheritDoc
	 */
	public observe(): void {}

	/**
	 * @inheritDoc
	 */
	public stopObserving(): void {}
}

/**
 * Event fired when the user types text, for instance presses <kbd>A</kbd> or <kbd>?</kbd> in the
 * editing view document.
 *
 * **Note**: This event will **not** fire for keystrokes such as <kbd>Delete</kbd> or <kbd>Enter</kbd>.
 * They have dedicated events, see {@link module:engine/view/document~Document#event:delete} and
 * {@link module:engine/view/document~Document#event:enter} to learn more.
 *
 * **Note**: This event is fired by the {@link module:typing/inserttextobserver~InsertTextObserver input feature}.
 *
 * @eventName module:engine/view/document~Document#insertText
 * @param data The event data.
 */
export type ViewDocumentInsertTextEvent = {
	name: 'insertText';
	args: [ data: InsertTextEventData ];
};

export interface InsertTextEventData extends DomEventData {

	/**
	 *  The text to be inserted.
	 */
	text: string;

	/**
	 * The selection into which the text should be inserted.
	 * If not specified, the insertion should occur at the current view selection.
	 */
	selection?: ViewSelection | ViewDocumentSelection;

	/**
	 * A flag indicating that event was fired during composition.
	 *
	 * Corresponds to the
	 * {@link module:engine/view/document~Document#event:compositionstart},
	 * {@link module:engine/view/document~Document#event:compositionupdate},
	 * and {@link module:engine/view/document~Document#event:compositionend } trio.
	 */
	isComposing?: boolean;
}
