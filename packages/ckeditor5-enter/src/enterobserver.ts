/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module enter/enterobserver
 */

import {
	Observer,
	DomEventData,
	BubblingEventInfo,
	type EditingView,
	type ViewDocumentInputEvent,
	type BubblingEvent,
	type ViewDocumentKeyDownEvent
} from '@ckeditor/ckeditor5-engine';

import { env } from '@ckeditor/ckeditor5-utils';

const ENTER_EVENT_TYPES: Record<string, { isSoft: boolean }> = {
	insertParagraph: { isSoft: false },
	insertLineBreak: { isSoft: true }
};

/**
 * Enter observer introduces the {@link module:engine/view/document~Document#event:enter `Document#enter`} event.
 */
export default class EnterObserver extends Observer {
	/**
	 * @inheritDoc
	 */
	constructor( view: EditingView ) {
		super( view );

		const doc = this.document;
		let shiftPressed = false;

		doc.on<ViewDocumentKeyDownEvent>( 'keydown', ( evt, data ) => {
			shiftPressed = data.shiftKey;
		} );

		doc.on<ViewDocumentInputEvent>( 'beforeinput', ( evt, data ) => {
			if ( !this.isEnabled ) {
				return;
			}

			let inputType = data.inputType;

			// See https://github.com/ckeditor/ckeditor5/issues/13321.
			if ( env.isSafari && shiftPressed && inputType == 'insertParagraph' ) {
				inputType = 'insertLineBreak';
			}

			const domEvent = data.domEvent;
			const enterEventSpec = ENTER_EVENT_TYPES[ inputType ];

			if ( !enterEventSpec ) {
				return;
			}

			const event = new BubblingEventInfo( doc, 'enter', data.targetRanges[ 0 ] );

			doc.fire( event, new DomEventData( view, domEvent, {
				isSoft: enterEventSpec.isSoft
			} ) );

			// Stop `beforeinput` event if `enter` event was stopped.
			// https://github.com/ckeditor/ckeditor5/issues/753
			if ( event.stop.called ) {
				evt.stop();
			}
		} );
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
 * Fired when the user presses the <kbd>Enter</kbd> key.
 *
 * Note: This event is fired by the {@link module:enter/enterobserver~EnterObserver observer}
 * (usually registered by the {@link module:enter/enter~Enter Enter feature} and
 * {@link module:enter/shiftenter~ShiftEnter ShiftEnter feature}).
 *
 * @eventName module:engine/view/document~Document#enter
 */
export type ViewDocumentEnterEvent = BubblingEvent<{
	name: 'enter';
	args: [ EnterEventData ];
}>;

export interface EnterEventData extends DomEventData<InputEvent> {

	/**
	 * Whether it is a soft enter (<kbd>Shift</kbd>+<kbd>Enter</kbd>) or a hard enter (<kbd>Enter</kbd>).
	 */
	isSoft: boolean;
}
