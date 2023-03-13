/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/observer/inputobserver
 */

import DomEventObserver from './domeventobserver';
import type DomEventData from './domeventdata';
import type ViewRange from '../range';
import DataTransfer from '../datatransfer';
import { env } from '@ckeditor/ckeditor5-utils';

/**
 * Observer for events connected with data input.
 *
 * **Note**: This observer is attached by {@link module:engine/view/view~View} and available by default in all
 * editor instances.
 */
export default class InputObserver extends DomEventObserver<'beforeinput'> {
	/**
	 * @inheritDoc
	 */
	public readonly domEventType = 'beforeinput' as const;

	/**
	 * @inheritDoc
	 */
	public onDomEvent( domEvent: InputEvent ): void {
		// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
		// @if CK_DEBUG_TYPING // 	console.group( `%c[InputObserver]%c ${ domEvent.type }: ${ domEvent.inputType }`,
		// @if CK_DEBUG_TYPING // 		'color: green', 'color: default'
		// @if CK_DEBUG_TYPING // 	);
		// @if CK_DEBUG_TYPING // }

		const domTargetRanges = domEvent.getTargetRanges();
		const view = this.view;
		const viewDocument = view.document;

		let dataTransfer: DataTransfer | null = null;
		let data: string | null = null;
		let targetRanges: Array<ViewRange> = [];

		if ( domEvent.dataTransfer ) {
			dataTransfer = new DataTransfer( domEvent.dataTransfer );
		}

		if ( domEvent.data !== null ) {
			data = domEvent.data;

			// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
			// @if CK_DEBUG_TYPING // 	console.info( `%c[InputObserver]%c event data: %c${ JSON.stringify( data ) }`,
			// @if CK_DEBUG_TYPING // 		'color: green;font-weight: bold', 'font-weight:bold', 'color: blue;'
			// @if CK_DEBUG_TYPING // 	);
			// @if CK_DEBUG_TYPING // }
		} else if ( dataTransfer ) {
			data = dataTransfer.getData( 'text/plain' );

			// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
			// @if CK_DEBUG_TYPING // 	console.info( `%c[InputObserver]%c event data transfer: %c${ JSON.stringify( data ) }`,
			// @if CK_DEBUG_TYPING // 		'color: green;font-weight: bold', 'font-weight:bold', 'color: blue;'
			// @if CK_DEBUG_TYPING // 	);
			// @if CK_DEBUG_TYPING // }
		}

		// If the editor selection is fake (an object is selected), the DOM range does not make sense because it is anchored
		// in the fake selection container.
		if ( viewDocument.selection.isFake ) {
			// Future-proof: in case of multi-range fake selections being possible.
			targetRanges = Array.from( viewDocument.selection.getRanges() );

			// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
			// @if CK_DEBUG_TYPING // 	console.info( '%c[InputObserver]%c using fake selection:',
			// @if CK_DEBUG_TYPING // 		'color: green;font-weight: bold', 'font-weight:bold', targetRanges,
			// @if CK_DEBUG_TYPING // 		viewDocument.selection.isFake ? 'fake view selection' : 'fake DOM parent'
			// @if CK_DEBUG_TYPING // 	);
			// @if CK_DEBUG_TYPING // }
		} else if ( domTargetRanges.length ) {
			targetRanges = domTargetRanges.map( domRange => {
				return view.domConverter.domRangeToView( domRange )!;
			} );

			// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
			// @if CK_DEBUG_TYPING // 	console.info( '%c[InputObserver]%c using target ranges:',
			// @if CK_DEBUG_TYPING // 		'color: green;font-weight: bold', 'font-weight:bold', targetRanges
			// @if CK_DEBUG_TYPING // 	);
			// @if CK_DEBUG_TYPING // }
		}
		// For Android devices we use a fallback to the current DOM selection, Android modifies it according
		// to the expected target ranges of input event.
		else if ( env.isAndroid ) {
			const domSelection = ( domEvent.target as HTMLElement ).ownerDocument.defaultView!.getSelection()!;

			targetRanges = Array.from( view.domConverter.domSelectionToView( domSelection ).getRanges() );

			// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
			// @if CK_DEBUG_TYPING // 	console.info( '%c[InputObserver]%c using selection ranges:',
			// @if CK_DEBUG_TYPING // 		'color: green;font-weight: bold', 'font-weight:bold', targetRanges
			// @if CK_DEBUG_TYPING // 	);
			// @if CK_DEBUG_TYPING // }
		}

		// Android sometimes fires insertCompositionText with a new-line character at the end of the data
		// instead of firing insertParagraph beforeInput event.
		// Fire the correct type of beforeInput event and ignore the replaced fragment of text because
		// it wants to replace "test" with "test\n".
		// https://github.com/ckeditor/ckeditor5/issues/12368.
		if ( env.isAndroid && domEvent.inputType == 'insertCompositionText' && data && data.endsWith( '\n' ) ) {
			this.fire( domEvent.type, domEvent, {
				inputType: 'insertParagraph',
				targetRanges: [ view.createRange( targetRanges[ 0 ].end ) ]
			} );

			// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
			// @if CK_DEBUG_TYPING // 	console.groupEnd();
			// @if CK_DEBUG_TYPING // }

			return;
		}

		// Normalize the insertText data that includes new-line characters.
		// https://github.com/ckeditor/ckeditor5/issues/2045.
		if ( domEvent.inputType == 'insertText' && data && data.includes( '\n' ) ) {
			// There might be a single new-line or double for new paragraph, but we translate
			// it to paragraphs as it is our default action for enter handling.
			const parts = data.split( /\n{1,2}/g );

			let partTargetRanges = targetRanges;

			for ( let i = 0; i < parts.length; i++ ) {
				const dataPart = parts[ i ];

				if ( dataPart != '' ) {
					this.fire( domEvent.type, domEvent, {
						data: dataPart,
						dataTransfer,
						targetRanges: partTargetRanges,
						inputType: domEvent.inputType,
						isComposing: domEvent.isComposing
					} );

					// Use the result view selection so following events will be added one after another.
					partTargetRanges = [ viewDocument.selection.getFirstRange()! ];
				}

				if ( i + 1 < parts.length ) {
					this.fire( domEvent.type, domEvent, {
						inputType: 'insertParagraph',
						targetRanges: partTargetRanges
					} );

					// Use the result view selection so following events will be added one after another.
					partTargetRanges = [ viewDocument.selection.getFirstRange()! ];
				}
			}

			// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
			// @if CK_DEBUG_TYPING // 	console.groupEnd();
			// @if CK_DEBUG_TYPING // }

			return;
		}

		// Fire the normalized beforeInput event.
		this.fire( domEvent.type, domEvent, {
			data,
			dataTransfer,
			targetRanges,
			inputType: domEvent.inputType,
			isComposing: domEvent.isComposing
		} );

		// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
		// @if CK_DEBUG_TYPING // 	console.groupEnd();
		// @if CK_DEBUG_TYPING // }
	}
}

/**
 * Fired before the web browser inputs, deletes, or formats some data.
 *
 * This event is introduced by {@link module:engine/view/observer/inputobserver~InputObserver} and available
 * by default in all editor instances (attached by {@link module:engine/view/view~View}).
 *
 * @see module:engine/view/observer/inputobserver~InputObserver
 * @eventName module:engine/view/document~Document#beforeinput
 * @param data Event data containing detailed information about the event.
 */
export type ViewDocumentInputEvent = {
	name: 'beforeinput';
	args: [ data: InputEventData ];
};

/**
 * The value of the {@link ~ViewDocumentInputEvent} event.
 */
export interface InputEventData extends DomEventData<InputEvent> {

	/**
	 * The type of the input event (e.g. "insertText" or "deleteWordBackward"). Corresponds to native `InputEvent#inputType`.
	 */
	readonly inputType: string;

	/**
	 * A unified text data passed along with the input event. Depending on:
	 *
	 * * the web browser and input events implementation (for instance [Level 1](https://www.w3.org/TR/input-events-1/) or
	 * [Level 2](https://www.w3.org/TR/input-events-2/)),
	 * * {@link module:engine/view/observer/inputobserver~InputEventData#inputType input type}
	 *
	 * text data is sometimes passed in the `data` and sometimes in the `dataTransfer` property.
	 *
	 * * If `InputEvent#data` was set, this property reflects its value.
	 * * If `InputEvent#data` is unavailable, this property contains the `'text/plain'` data from
	 * {@link module:engine/view/observer/inputobserver~InputEventData#dataTransfer}.
	 * * If the event ({@link module:engine/view/observer/inputobserver~InputEventData#inputType input type})
	 * provides no data whatsoever, this property is `null`.
	 */
	readonly data: string | null;

	/**
	 * The data transfer instance of the input event. Corresponds to native `InputEvent#dataTransfer`.
	 *
	 * The value is `null` when no `dataTransfer` was passed along with the input event.
	 */
	readonly dataTransfer: DataTransfer;

	/**
	 * A flag indicating that the `beforeinput` event was fired during composition.
	 *
	 * Corresponds to the
	 * {@link module:engine/view/document~Document#event:compositionstart},
	 * {@link module:engine/view/document~Document#event:compositionupdate},
	 * and {@link module:engine/view/document~Document#event:compositionend } trio.
	 */
	readonly isComposing: boolean;

	/**
	 * Editing {@link module:engine/view/range~Range view ranges} corresponding to DOM ranges provided by the web browser
	 * (as returned by `InputEvent#getTargetRanges()`).
	 */
	readonly targetRanges: Array<ViewRange>;
}
