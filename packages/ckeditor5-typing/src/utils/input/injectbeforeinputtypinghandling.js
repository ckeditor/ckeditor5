/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/utils/input/injectbeforeinputhandling
 */

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

/**
 * This helper handles `beforeinput` editing view events caused by typing or spell checking.
 *
 * It fires the {@link module:engine/view/document~Document#event:insertText} event.
 *
 * @protected
 * @param {module:core/editor/view/view~View} view The editor editing view instance.
 */
export default function injectBeforeInputTypingHandling( view ) {
	const viewDocument = view.document;

	viewDocument.on( 'beforeinput', ( evt, data ) => {
		const { data: text, targetRanges, inputType } = data;

		if ( !TYPING_INPUT_TYPES.includes( inputType ) ) {
			return;
		}

		viewDocument.fire( 'insertText', {
			text,
			selection: view.createSelection( targetRanges )
		} );

		// If this listener handled the event, there's no point in propagating it any further
		// to other callbacks.
		evt.stop();

		// Without this preventDefault(), typing accented characters in Chrome on Mac does not work (inserts 2 characters).
		// The **second** beforeInput event (the one when user accepts the choice) comes with a collapsed DOM range
		// (should be expanded instead to replace the character from the first step). That's why this particular input must
		// be preventDefaulted().
		data.preventDefault();
	} );
}
