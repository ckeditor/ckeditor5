/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/utils/bindtwostepcarettoattribute
 */

import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

/**
 * This helper adds two-steps caret movement behaviour for given attribute.
 *
 * When caret is moving by arrow keys and reach bound of text with attribute for which behaviour is enabled
 * then typing does not expand this attribute. Additional arrow key press is needed to "enter" to the text
 * and start typing with this attribute. The same is is for leaving this text.
 *
 * When behaviour is enabled for bold attribute and caret is just before the attribute element then pressing right arrow
 * will move caret to the attribute element instead of moving after next character:
 *
 * 		<p>foo[]<strong>bar</strong>biz<p> `->` <p>foo<strong>[]foo</strong>barr<p>
 *
 * The same is for "leaving" text:
 *
 * 		<p>foo<strong>bar[]</strong>biz<p> `->` <p>foo<strong>bar</strong>[]biz<p>
 *
 * And when moving left:
 *
 * 		<p>foo<strong>bar</strong>[]biz<p> `<-` <p>foo<strong>bar[]</strong>biz<p>
 * 		<p>foo<strong>[]bar</strong>biz<p> `<-` <p>foo[]<strong>bar</strong>biz<p>
 *
 * @param {module:core/editor/editor~Editor} editor The Editor instance.
 * @param {module:utils/dom/emittermixin~Emitter} emitter The emitter to which this behavior should be added.
 * @param {String} attribute Attribute for which behaviour will be added.
 */
export default function bindTwoStepCaretToAttribute( editor, emitter, attribute ) {
	const model = editor.model;
	const editingView = editor.editing.view;
	const modelSelection = model.document.selection;

	// Creates a closure for each helper call to make possible to keep states.
	( function twoStepCaretMovementHandler( emitter, attribute ) {
		// When set as `true` it means that first step has been made and default gravity was programmatically
		// restored on `keydown` event and `keyup` event should not override it.
		// Used only while moving left.
		let isFirstStepMade = false;

		// Listen to keyboard events and handle cursor after move.
		emitter.listenTo( editingView, 'keyup', ( evt, data ) => {
			// Only left arrow is handled on keyup.
			if ( data.keyCode != keyCodes.arrowleft ) {
				return;
			}

			// Current implementation works only for collapsed selection.
			if ( !modelSelection.isCollapsed ) {
				return;
			}

			const position = modelSelection.getFirstPosition();

			// If caret sticks to beginning or end of Text with attribute and first step has not been made yet let's make it.
			if ( !isFirstStepMade && isStickToAttribute( position.nodeBefore, position.nodeAfter, attribute ) ) {
				// While moving left we need to override gravity for the first step.
				model.change( writer => writer.overrideSelectionGravity() );
			}
		} );

		// Listen to keyboard events and handle cursor before move.
		emitter.listenTo( editingView, 'keydown', ( evt, data ) => {
			const arrowRightPressed = data.keyCode == keyCodes.arrowright;
			const arrowLeftPressed = data.keyCode == keyCodes.arrowleft;

			// When neither left or right arrow has been pressed then do noting.
			if ( !arrowRightPressed && !arrowLeftPressed ) {
				return;
			}

			// Current implementation works only for collapsed selection.
			if ( !modelSelection.isCollapsed ) {
				return;
			}

			const position = modelSelection.getFirstPosition();

			// Moving left.
			// This is a second part of moving caret to the left. When first step has been handled by `keyup`
			// event (after caret movement) we need to handle second step using `keydown` event (before caret movement).
			if ( arrowLeftPressed ) {
				// If default gravity is not overridden then do nothing.
				// It means that second step might be already made or caret does not stick to the Text with attribute.
				if ( !modelSelection.isGravityOverridden ) {
					return;
				}

				// If caret sticks to beginning or end of Text with attribute
				// it means that first step is already made and we need to make the second.
				if ( isStickToAttribute( position.nodeBefore, position.nodeAfter, attribute ) ) {
					// Prevent cater from being moved.
					data.preventDefault();
					// Restore default gravity.
					model.change( writer => writer.restoreSelectionGravity() );
					// Remember that second step has been made (needed by `keyup` listener).
					isFirstStepMade = true;
				}

			// Moving right.
			// Here situation is easy to handle because gravity in the first step
			// is consistent with default gravity and for second step is enough to override it.
			} else {
				// If default gravity is already overridden then do nothing.
				// It means that second step has been already made.
				if ( modelSelection.isGravityOverridden ) {
					return;
				}

				// If caret sticks to beginning or end of Text with attribute it means that first step has been made
				// and we need to make a second step.
				if ( isStickToAttribute( position.nodeAfter, position.nodeBefore, attribute ) ) {
					// Prevent caret from being moved.
					data.preventDefault();
					// And override default selection gravity.
					model.change( writer => writer.overrideSelectionGravity() );
				}
			}
		} );

		// Clear state every time when selection is changed directly by the user.
		emitter.listenTo( modelSelection, 'change:range', ( evt, data ) => {
			if ( data.directChange ) {
				isFirstStepMade = false;
			}
		} );
	}( emitter, attribute ) );
}

function isStickToAttribute( nextNode, prevNode, attribute ) {
	const isAttrInNext = nextNode ? nextNode.hasAttribute( attribute ) : false;
	const isAttrInPrev = prevNode ? prevNode.hasAttribute( attribute ) : false;

	return isAttrInNext && !isAttrInPrev || !isAttrInNext && isAttrInPrev;
}
