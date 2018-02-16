/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/utils/bindtwostepcarettoattribute
 */

import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import first from '@ckeditor/ckeditor5-utils/src/first';

/**
 * This helper adds two-steps caret movement behaviour for given attribute.
 *
 * When caret is moving by arrow keys and reach bound of text with attribute for which behaviour is enabled
 * then typing does not expand this attribute. Additional arrow key press is needed to "enter" to the text
 * and start typing with this attribute. The same is is for leaving this text.
 *
 * When behaviour is enabled for `linkHref` attribute and caret is just before the attribute element then pressing
 * right arrow will move caret inside the attribute element instead of moving after next character:
 *
 * 		<p>foo{}<a>bar</a>biz<p> `->` <p>foo<a>{}foo</a>barr<p>
 *
 * The same is for "leaving" attribute element:
 *
 * 		<p>foo<a>bar{}</a>biz<p> `->` <p>foo<a>bar</a>{}biz<p>
 *
 * And when moving left:
 *
 * 		<p>foo<a>bar</a>{}biz<p> `<-` <p>foo<a>bar{}</a>biz<p>
 * 		<p>foo<a>{}bar</a>biz<p> `<-` <p>foo{}<a>bar</a>biz<p>
 *
 * @param {module:core/editor/editor~Editor} editor The Editor instance.
 * @param {module:utils/dom/emittermixin~Emitter} emitter The emitter to which this behavior should be added.
 * @param {String} attribute Attribute for which behaviour will be added.
 */
export default function bindTwoStepCaretToAttribute( editor, emitter, attribute ) {
	const model = editor.model;
	const editingView = editor.editing.view;
	const modelSelection = model.document.selection;

	// Listen to keyboard events and handle cursor before the move.
	emitter.listenTo( editingView, 'keydown', ( evt, data ) => {
		const arrowRightPressed = data.keyCode == keyCodes.arrowright;
		const arrowLeftPressed = data.keyCode == keyCodes.arrowleft;

		// When neither left or right arrow has been pressed then do noting.
		if ( !arrowRightPressed && !arrowLeftPressed ) {
			return;
		}

		// This implementation works only for collapsed selection.
		if ( !modelSelection.isCollapsed ) {
			return;
		}

		const position = modelSelection.getFirstPosition();

		// Moving right.
		if ( arrowRightPressed ) {
			// If gravity is already overridden then do nothing.
			// It means that we already enter `foo<a>{}bar</a>biz` or left `foo<a>bar</a>{}biz` text with attribute
			// and gravity will be restored just after caret movement.
			if ( modelSelection.isGravityOverridden ) {
				return;
			}

			// If caret sticks to the bound of Text with attribute it means that we are going to
			// enter `foo{}<a>bar</a>biz` or leave `foo<a>bar{}</a>biz` the text with attribute.
			if ( isStickToAttribute( position.nodeAfter, position.nodeBefore, attribute ) ) {
				// So we need to prevent caret from being moved.
				data.preventDefault();
				// And override default selection gravity.
				model.change( writer => writer.overrideSelectionGravity() );
			}

		// Moving left.
		} else {
			// If caret sticks to the bound of Text with attribute and gravity is already overridden it means that
			// we are going to enter `foo<a>bar</a>{}biz` or leave `foo<a>{}bar</a>biz` text with attribute.
			if ( modelSelection.isGravityOverridden && isStickToAttribute( position.nodeBefore, position.nodeAfter, attribute ) ) {
				// So we need to prevent cater from being moved.
				data.preventDefault();
				// And restore the gravity.
				model.change( writer => writer.restoreSelectionGravity() );

				return;
			}

			// If we are here we need to check if caret is a one character before the text with attribute bound
			// `foo<a>bar</a>b{}iz` or `foo<a>b{}ar</a>biz`.
			const nextPosition = getPreviousPosition( position );

			// When there is no position it means that parent bound has been reached.
			if ( !nextPosition ) {
				return;
			}

			// When caret is going stick to the bound of Text with attribute after movement then we need to override
			// the gravity before the move. But we need to do it in a custom way otherwise `selection#change:range`
			// event following the overriding will restore the gravity.
			if ( isStickToAttribute( nextPosition.nodeBefore, nextPosition.nodeAfter, attribute ) ) {
				model.change( writer => {
					let counter = 0;

					// So let's override the gravity.
					writer.overrideSelectionGravity( true );

					// But skip the following `change:range` event and restore the gravity on the next one.
					emitter.listenTo( modelSelection, 'change:range', ( evt, data ) => {
						if ( counter++ && data.directChange ) {
							writer.restoreSelectionGravity();
							evt.off();
						}
					} );
				} );
			}
		}
	} );
}

// @param {module:engine/model/node~Node} nextNode Node before the position.
// @param {module:engine/model/node~Node} prevNode Node after the position.
// @param {String} attribute Attribute name.
// @returns {Boolean} `true` when position between the nodes sticks to the bound of text with given attribute.
function isStickToAttribute( nextNode, prevNode, attribute ) {
	const isAttrInNext = nextNode ? nextNode.hasAttribute( attribute ) : false;
	const isAttrInPrev = prevNode ? prevNode.hasAttribute( attribute ) : false;

	return isAttrInNext && !isAttrInPrev || !isAttrInNext && isAttrInPrev;
}

// @param {module:engine/model/position~Position} position Initial position.
// @returns {module:engine/model/position~Position|undefined} Previous position according to initial position in range.
function getPreviousPosition( position ) {
	const iterator = Range.createIn( position.parent ).getPositions( {
		direction: 'backward',
		singleCharacters: true,
		startPosition: position
	} );

	// First position is the same as initial so we need to skip it.
	first( iterator );

	// Get position before the previous node of initial position.
	return first( iterator );
}
