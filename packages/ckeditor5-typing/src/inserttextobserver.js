/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/inserttextobserver
 */

import Observer from '@ckeditor/ckeditor5-engine/src/view/observer/observer';

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
 * Text insertion observer introduces the {@link module:engine/view/document~Document#event:insertText} event.
 *
 * @extends module:engine/view/observer/observer~Observer
 */
export default class InsertTextObserver extends Observer {
	/**
	 * @inheritDoc
	 */
	constructor( view ) {
		super( view );

		const viewDocument = view.document;

		viewDocument.on( 'beforeinput', ( evt, data ) => {
			if ( !this.isEnabled ) {
				return;
			}

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

	/**
	 * @inheritDoc
	 */
	observe() {}
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
 * @event module:engine/view/document~Document#event:insertText
 * @param {module:engine/view/observer/domeventdata~DomEventData} data
 * @param {String} data.text The text to be inserted.
 * @param {module:engine/view/selection~Selection} [data.selection] The selection into which the text should be inserted.
 * If not specified, the insertion should occur at the current view selection.
 * @param {module:engine/view/range~Range} [data.resultRange] The range that view selection should be set to after insertion.
 */
