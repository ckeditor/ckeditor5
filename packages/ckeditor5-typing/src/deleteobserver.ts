/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/deleteobserver
 */

import { env, keyCodes } from '@ckeditor/ckeditor5-utils';
import {
	BubblingEventInfo,
	DomEventData,
	Observer,
	type BubblingEvent,
	type ViewDocumentInputEvent,
	type ViewDocumentKeyDownEvent,
	type ViewDocumentKeyUpEvent,
	type ViewDocumentSelection,
	type ViewSelection,
	type View
} from '@ckeditor/ckeditor5-engine';

const DELETE_CHARACTER = 'character';
const DELETE_WORD = 'word';
const DELETE_CODE_POINT = 'codePoint';
const DELETE_SELECTION = 'selection';
const DELETE_BACKWARD = 'backward';
const DELETE_FORWARD = 'forward';

type DeleteEventSpec = {
	unit: 'selection' | 'codePoint' | 'character' | 'word';
	direction: 'backward' | 'forward';
};

const DELETE_EVENT_TYPES: Record<string, DeleteEventSpec> = {
	// --------------------------------------- Backward delete types -----------------------------------------------------

	// This happens in Safari on Mac when some content is selected and Ctrl + K is pressed.
	deleteContent: {
		unit: DELETE_SELECTION,

		// According to the Input Events Level 2 spec, this delete type has no direction
		// but to keep things simple, let's default to backward.
		direction: DELETE_BACKWARD
	},
	// Chrome and Safari on Mac: Backspace or Ctrl + H
	deleteContentBackward: {
		// This kind of deletions must be done on the code point-level instead of target range provided by the DOM beforeinput event.
		// Take for instance "👨‍👩‍👧‍👧", it equals:
		//
		//	* [ "👨", "ZERO WIDTH JOINER", "👩", "ZERO WIDTH JOINER", "👧", "ZERO WIDTH JOINER", "👧" ]
		//	* or simply "\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F467}"
		//
		// The range provided by the browser would cause the entire multi-byte grapheme to disappear while the user
		// intention when deleting backwards ("👨‍👩‍👧‍👧[]", then backspace) is gradual "decomposition" (first to "👨‍👩‍👧‍[]",
		// then to "👨‍👩‍[]", etc.).
		//
		//	* "👨‍👩‍👧‍👧[]" + backward delete (by code point)  -> results in "👨‍👩‍👧[]", removed the last "👧" 👍
		//	* "👨‍👩‍👧‍👧[]" + backward delete (by character)  -> results in "[]", removed the whole grapheme 👎
		//
		// Deleting by code-point is simply a better UX. See "deleteContentForward" to learn more.
		unit: DELETE_CODE_POINT,
		direction: DELETE_BACKWARD
	},
	// On Mac: Option + Backspace.
	// On iOS: Hold the backspace for a while and the whole words will start to disappear.
	deleteWordBackward: {
		unit: DELETE_WORD,
		direction: DELETE_BACKWARD
	},
	// Safari on Mac: Cmd + Backspace
	deleteHardLineBackward: {
		unit: DELETE_SELECTION,
		direction: DELETE_BACKWARD
	},
	// Chrome on Mac: Cmd + Backspace.
	deleteSoftLineBackward: {
		unit: DELETE_SELECTION,
		direction: DELETE_BACKWARD
	},

	// --------------------------------------- Forward delete types -----------------------------------------------------

	// Chrome on Mac: Fn + Backspace or Ctrl + D
	// Safari on Mac: Ctrl + K or Ctrl + D
	deleteContentForward: {
		// Unlike backward delete, this delete must be performed by character instead of by code point, which
		// provides the best UX for working with accented letters.
		// Take, for example "b̂" ("\u0062\u0302", or [ "LATIN SMALL LETTER B", "COMBINING CIRCUMFLEX ACCENT" ]):
		//
		//	* "b̂[]" + backward delete (by code point)  -> results in "b[]", removed the combining mark 👍
		//	* "[]b̂" + forward delete (by code point)   -> results in "[]^", a bare combining mark does that not make sense when alone 👎
		//	* "[]b̂" + forward delete (by character)    -> results in "[]", removed both "b" and the combining mark 👍
		//
		// See: "deleteContentBackward" to learn more.
		unit: DELETE_CHARACTER,
		direction: DELETE_FORWARD
	},
	// On Mac: Fn + Option + Backspace.
	deleteWordForward: {
		unit: DELETE_WORD,
		direction: DELETE_FORWARD
	},
	// Chrome on Mac: Ctrl + K (you have to disable the Link plugin first, though, because it uses the same keystroke)
	// This is weird that it does not work in Safari on Mac despite being listed in the official shortcuts listing
	// on Apple's webpage.
	deleteHardLineForward: {
		unit: DELETE_SELECTION,
		direction: DELETE_FORWARD
	},
	// At this moment there is no known way to trigger this event type but let's keep it for the symmetry with
	// deleteSoftLineBackward.
	deleteSoftLineForward: {
		unit: DELETE_SELECTION,
		direction: DELETE_FORWARD
	}
};

/**
 * Delete observer introduces the {@link module:engine/view/document~Document#event:delete} event.
 */
export default class DeleteObserver extends Observer {
	/**
	 * @inheritDoc
	 */
	constructor( view: View ) {
		super( view );

		const document = view.document;

		// It matters how many subsequent deletions were made, e.g. when the backspace key was pressed and held
		// by the user for some time. For instance, if such scenario ocurred and the heading the selection was
		// anchored to was the only content of the editor, it will not be converted into a paragraph (the user
		// wanted to clean it up, not remove it, it's about UX). Check out the DeleteCommand implementation to learn more.
		//
		// Fun fact: Safari on Mac won't fire beforeinput for backspace in an empty heading (only content).
		let sequence = 0;

		document.on( 'keydown', () => {
			sequence++;
		} );

		document.on( 'keyup', () => {
			sequence = 0;
		} );

		document.on<ViewDocumentInputEvent>( 'beforeinput', ( evt, data ) => {
			if ( !this.isEnabled ) {
				return;
			}

			const { targetRanges, domEvent, inputType } = data;
			const deleteEventSpec = DELETE_EVENT_TYPES[ inputType ];

			if ( !deleteEventSpec ) {
				return;
			}

			const deleteData: Partial<DeleteEventData> = {
				direction: deleteEventSpec.direction,
				unit: deleteEventSpec.unit,
				sequence
			};

			if ( deleteData.unit == DELETE_SELECTION ) {
				deleteData.selectionToRemove = view.createSelection( targetRanges[ 0 ] );
			}

			// The default deletion unit for deleteContentBackward is a single code point
			// but on Android it sometimes passes a wider target range, so we need to change
			// the unit of deletion to include the whole range to be removed and not a single code point.
			if ( env.isAndroid && inputType === 'deleteContentBackward' ) {
				// On Android, deleteContentBackward has sequence 1 by default.
				deleteData.sequence = 1;

				// IME wants more than a single character to be removed.
				if (
					targetRanges.length == 1 && (
						targetRanges[ 0 ].start.parent != targetRanges[ 0 ].end.parent ||
						targetRanges[ 0 ].start.offset + 1 != targetRanges[ 0 ].end.offset
					)
				) {
					deleteData.unit = DELETE_SELECTION;
					deleteData.selectionToRemove = view.createSelection( targetRanges );
				}
			}

			const eventInfo = new BubblingEventInfo( document, 'delete', targetRanges[ 0 ] );

			document.fire( eventInfo, new DomEventData( view, domEvent, deleteData ) );

			// Stop the beforeinput event if `delete` event was stopped.
			// https://github.com/ckeditor/ckeditor5/issues/753
			if ( eventInfo.stop.called ) {
				evt.stop();
			}
		} );

		// TODO: to be removed when https://bugs.chromium.org/p/chromium/issues/detail?id=1365311 is solved.
		if ( env.isBlink ) {
			enableChromeWorkaround( this );
		}
	}

	/**
	 * @inheritDoc
	 */
	public observe(): void {}
}

/**
 * Event fired when the user tries to delete content (e.g. presses <kbd>Delete</kbd> or <kbd>Backspace</kbd>).
 *
 * Note: This event is fired by the {@link module:typing/deleteobserver~DeleteObserver delete observer}
 * (usually registered by the {@link module:typing/delete~Delete delete feature}).
 *
 * @eventName module:engine/view/document~Document#delete
 * @param data The event data.
 */
export type ViewDocumentDeleteEvent = BubblingEvent<{
	name: 'delete';
	args: [ data: DeleteEventData ];
}>;

export interface DeleteEventData extends DomEventData<InputEvent> {

	/**
	 * The direction in which the deletion should happen.
	 */
	direction: 'backward' | 'forward';

	/**
	 * The "amount" of content that should be deleted.
	 */
	unit: 'selection' | 'codePoint' | 'character' | 'word';

	/**
	 * A number describing which subsequent delete event it is without the key being released.
	 * If it's 2 or more it means that the key was pressed and hold.
	 */
	sequence: number;

	/**
	 * View selection which content should be removed. If not set,
	 * current selection should be used.
	 */
	selectionToRemove?: ViewSelection | ViewDocumentSelection;
}

/**
 * Enables workaround for the issue https://github.com/ckeditor/ckeditor5/issues/11904.
 */
function enableChromeWorkaround( observer: DeleteObserver ) {
	const view = observer.view;
	const document = view.document;

	let pressedKeyCode: number | null = null;
	let beforeInputReceived = false;

	document.on<ViewDocumentKeyDownEvent>( 'keydown', ( evt, { keyCode } ) => {
		pressedKeyCode = keyCode;
		beforeInputReceived = false;
	} );

	document.on<ViewDocumentKeyUpEvent>( 'keyup', ( evt, { keyCode, domEvent } ) => {
		const selection = document.selection;
		const shouldFireDeleteEvent = observer.isEnabled &&
			keyCode == pressedKeyCode &&
			isDeleteKeyCode( keyCode ) &&
			!selection.isCollapsed &&
			!beforeInputReceived;

		pressedKeyCode = null;

		if ( shouldFireDeleteEvent ) {
			const targetRange = selection.getFirstRange()!;
			const eventInfo = new BubblingEventInfo( document, 'delete', targetRange );
			const deleteData: Partial<DeleteEventData> = {
				unit: DELETE_SELECTION,
				direction: getDeleteDirection( keyCode ),
				selectionToRemove: selection
			};

			document.fire( eventInfo, new DomEventData( view, domEvent, deleteData ) );
		}
	} );

	document.on<ViewDocumentInputEvent>( 'beforeinput', ( evt, { inputType } ) => {
		const deleteEventSpec = DELETE_EVENT_TYPES[ inputType ];
		const isMatchingBeforeInput = isDeleteKeyCode( pressedKeyCode ) &&
			deleteEventSpec &&
			deleteEventSpec.direction == getDeleteDirection( pressedKeyCode );

		if ( isMatchingBeforeInput ) {
			beforeInputReceived = true;
		}
	}, { priority: 'high' } );

	document.on<ViewDocumentInputEvent>( 'beforeinput', ( evt, { inputType, data } ) => {
		const shouldIgnoreBeforeInput = pressedKeyCode == keyCodes.delete &&
			inputType == 'insertText' &&
			data == '\x7f'; // Delete character :P

		if ( shouldIgnoreBeforeInput ) {
			evt.stop();
		}
	}, { priority: 'high' } );

	function isDeleteKeyCode( keyCode: number | null ): boolean {
		return keyCode == keyCodes.backspace || keyCode == keyCodes.delete;
	}

	function getDeleteDirection( keyCode: number | null ): 'backward' | 'forward' {
		return keyCode == keyCodes.backspace ? DELETE_BACKWARD : DELETE_FORWARD;
	}
}
