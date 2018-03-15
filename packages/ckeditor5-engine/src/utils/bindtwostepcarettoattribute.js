/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/utils/bindtwostepcarettoattribute
 */

import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

/**
 * This helper adds two-step caret movement behavior for the given attribute.
 *
 * For example, when this behavior is enabled for the `linkHref` attribute (which converts to `<a>` element in the view)
 * and the caret is just before an `<a>` element (at a link boundary), then pressing
 * the right arrow key will move caret into that `<a>`element instead of moving it after the next character:
 *
 * * With two-step caret movement: `<p>foo{}<a>bar</a>biz<p>` + <kbd>→</kbd> => `<p>foo<a>{}bar</a>biz<p>`
 * * Without two-step caret movement: `<p>foo{}<a>bar</a>biz<p>` + <kbd>→</kbd> => `<p>foo<a>b{}ar</a>biz<p>`
 *
 * The same behavior will be changed fo "leaving" an attribute element:
 *
 * * With two-step caret movement: `<p>foo<a>bar{}</a>biz<p>` + <kbd>→</kbd> => `<p>foo<a>bar</a>{}biz<p>`
 * * Without two-step caret movement: `<p>foo<a>bar{}</a>biz<p>` + <kbd>→</kbd> => `<p>foo<a>bar</a>b{}iz<p>`
 *
 * And when moving left:
 *
 * * With two-step caret movement: `<p>foo<a>bar</a>b{}iz<p>` + <kbd>←</kbd> => `<p>foo<a>bar</a>{}biz<p>` +
 * <kbd>←</kbd> => `<p>foo<a>bar{}</a>biz<p>`
 * * Without two-step caret movement: `<p>foo<a>bar</a>b{}iz<p>` + <kbd>←</kbd> => `<p>foo<a>bar{}</a>biz<p>`
 *
 * @param {module:engine/view/view~View} view View controller instance.
 * @param {module:engine/model/model~Model} model Data model instance.
 * @param {module:utils/dom/emittermixin~Emitter} emitter The emitter to which this behavior should be added
 * (e.g. a plugin instance).
 * @param {String} attribute Attribute for which this behavior will be added.
 */
export default function bindTwoStepCaretToAttribute( view, model, emitter, attribute ) {
	const modelSelection = model.document.selection;

	// Listen to keyboard events and handle cursor before the move.
	emitter.listenTo( view.document, 'keydown', ( evt, data ) => {
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

		// When user tries to expand selection or jump over the whole word or to the beginning/end then
		// two-steps movement is not necessary.
		if ( data.shiftKey || data.altKey || data.ctrlKey ) {
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
			if ( isAtAttributeBoundary( position.nodeAfter, position.nodeBefore, attribute ) ) {
				// So we need to prevent caret from being moved.
				data.preventDefault();
				// And override default selection gravity.
				model.change( writer => writer.overrideSelectionGravity() );
			}

		// Moving left.
		} else {
			// If caret sticks to the bound of Text with attribute and gravity is already overridden it means that
			// we are going to enter `foo<a>bar</a>{}biz` or leave `foo<a>{}bar</a>biz` text with attribute.
			if ( modelSelection.isGravityOverridden && isAtAttributeBoundary( position.nodeBefore, position.nodeAfter, attribute ) ) {
				// So we need to prevent cater from being moved.
				data.preventDefault();
				// And restore the gravity.
				model.change( writer => writer.restoreSelectionGravity() );

				return;
			}

			// If we are here we need to check if caret is a one character before the text with attribute bound
			// `foo<a>bar</a>b{}iz` or `foo<a>b{}ar</a>biz`.
			const nextPosition = position.getShiftedBy( -1 );

			// When position is the same it means that parent bound has been reached.
			if ( !nextPosition.isBefore( position ) ) {
				return;
			}

			// When caret is going stick to the bound of Text with attribute after movement then we need to override
			// the gravity before the move. But we need to do it in a custom way otherwise `selection#change:range`
			// event following the overriding will restore the gravity.
			if ( isAtAttributeBoundary( nextPosition.nodeBefore, nextPosition.nodeAfter, attribute ) ) {
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
function isAtAttributeBoundary( nextNode, prevNode, attribute ) {
	const isAttrInNext = nextNode ? nextNode.hasAttribute( attribute ) : false;
	const isAttrInPrev = prevNode ? prevNode.hasAttribute( attribute ) : false;

	if ( isAttrInNext && isAttrInPrev && nextNode.getAttributeKeys( attribute ) !== prevNode.getAttribute( attribute ) ) {
		return true;
	}

	return isAttrInNext && !isAttrInPrev || !isAttrInNext && isAttrInPrev;
}
