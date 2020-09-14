/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';

/**
 * @module typing/utils/delete/injectbeforeinputhandling
 */

const DELETE_CHARACTER = 'character';
const DELETE_WORD = 'word';
const DELETE_CODE_POINT = 'codePoint';
const DELETE_LINE = 'line';
const DELETE_BACKWARD = 'backward';
const DELETE_FORWARD = 'forward';

const DELETE_EVENT_TYPES = {
	// --------------------------------------- Backward delete types -----------------------------------------------------

	// This happens in Safari on Mac when a widget is selected and Ctrl + K is pressed.
	deleteContent: {
		// ??????
		unit: DELETE_CHARACTER,

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
		unit: DELETE_LINE,
		direction: DELETE_BACKWARD
	},
	// Chrome on Mac: Cmd + Backspace.
	deleteSoftLineBackward: {
		unit: DELETE_LINE,
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
		unit: DELETE_LINE,
		direction: DELETE_FORWARD
	},
	// ???
	deleteSoftLineForward: {
		unit: DELETE_LINE,
		direction: DELETE_FORWARD
	}
};

/**
 * TODO
 *
 * @param {module:core/editor/editor~Editor} editor The editor instance.
 */
export default function injectBeforeInputDeleteHandling( editor ) {
	const editingView = editor.editing.view;
	const viewDocument = editingView.document;

	// It matters how many subsequent deletions were made, e.g. when the backspace key was pressed and held
	// by the user for some time. For instance, if such scenario ocurred and the heading the selection was
	// anchored to was the only content of the editor, it will not be converted into a paragraph (the user
	// wanted to clean it up, not remove it, it's about UX). Check out the DeleteCommand implementation to learn more.
	//
	// Fun fact: Safari on Mac won't fire beforeinput for backspace in an empty heading (only content).
	let deleteSequence = 0;

	viewDocument.on( 'keydown', () => {
		deleteSequence++;
	} );

	viewDocument.on( 'keyup', () => {
		deleteSequence = 0;
	} );

	viewDocument.on( 'beforeinput', ( evt, data ) => {
		const { targetRanges, domEvent, inputType } = data;
		const deleteEventSpec = DELETE_EVENT_TYPES[ inputType ];

		if ( deleteEventSpec ) {
			// The (View)Document#delete event works as a proxy between beforeinput (Input Events) world and the
			// high-level features.
			viewDocument.fire( 'delete', new DomEventData( editingView, domEvent, {
				// Standard "delete" event data.
				direction: deleteEventSpec.direction,
				sequence: deleteSequence,
				unit: deleteEventSpec.unit,
				selectionToRemove: editingView.createSelection( targetRanges[ 0 ] ),

				// beforeinput data extension.
				inputType
			} ) );

			// If this listener handled the event, there's no point in propagating it any further
			// to other callbacks.
			evt.stop();
			data.preventDefault();
		}
	} );

	viewDocument.on( 'delete', ( evt, data ) => {
		const { direction, sequence, selectionToRemove, inputType, unit } = data;

		// Both "deleteContentBackward" and "deleteContentForward" must operate on the unit-level despite the
		// editing view range available and used efficiently to delete content in case of other input types.
		// This is related to the multi-byte characters decomposition (like complex emojis). Check out
		// the comments in DELETE_EVENT_TYPES to learn more.
		if ( inputType === 'deleteContentBackward' ) {
			editor.execute( 'delete', {
				unit,
				sequence
			} );
		} else if ( inputType === 'deleteContentForward' ) {
			editor.execute( 'forwardDelete', {
				unit,
				sequence
			} );
		}
		// In case of other delete (beforeinput) types, use the range provided by the beforeinput event.
		else {
			const modelRange = editor.editing.mapper.toModelRange( selectionToRemove.getFirstRange() );
			const selection = editor.model.createSelection( modelRange );
			const isForwardDelete = direction === DELETE_FORWARD;

			editor.execute( isForwardDelete ? 'forwardDelete' : 'delete', {
				selection,
				sequence
			} );
		}

		editingView.scrollToTheSelection();
	} );
}
