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
	let overrideUid;
	let skipNextChangeRange = false;

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

		// When user tries to expand the selection or jump over the whole word or to the beginning/end then
		// two-steps movement is not necessary.
		if ( data.shiftKey || data.altKey || data.ctrlKey ) {
			return;
		}

		const position = modelSelection.getFirstPosition();

		if ( arrowRightPressed ) {
			handleArrowRightPress( position, data );
		} else {
			handleArrowLeftPress( position, data );
		}
	} );

	emitter.listenTo( modelSelection, 'change:range', ( evt, data ) => {
		if ( skipNextChangeRange ) {
			skipNextChangeRange = false;

			return;
		}

		// Skip automatic restore when the gravity is not overridden — simply, there's nothing to restore
		// at this moment.
		if ( !overrideUid ) {
			return;
		}

		// Skip automatic restore when the change is indirect AND the selection is at the attribute boundary.
		// It means that e.g. if the change was external (collaboration) and the user had their
		// selection around the link, its gravity should remain intact in this change:range event.
		if ( !data.directChange && isAtBoundary( modelSelection.getFirstPosition(), attribute ) ) {
			return;
		}

		restoreGravity( model );
	} );

	function handleArrowRightPress( position, data ) {
		// DON'T ENGAGE 2-SCM if gravity is already overridden. It means that we just entered
		//
		// 		<paragraph>foo{}<$text attribute>bar</$text>baz</paragraph>
		//
		// or left the attribute
		//
		// 		<paragraph>foo<$text attribute>bar</$text>{}baz</paragraph>
		//
		// and the gravity will be restored automatically.
		if ( overrideUid ) {
			return;
		}

		// DON'T ENGAGE 2-SCM when the selection is at the beginning of an attribute AND already has it:
		// * when the selection was initially set there using the mouse,
		// * when the editor has just started
		//
		//		<paragraph><$text attribute>{}bar</$text>baz</paragraph>
		//
		if ( position.isAtStart && modelSelection.hasAttribute( attribute ) ) {
			return;
		}

		// ENGAGE 2-SCM when about to leave one attribute value and enter another:
		//
		// 		<paragraph><$text attribute="1">foo{}</$text><$text attribute="2">bar</$text></paragraph>
		//
		// but DON'T when already in between of them (no attribute selection):
		//
		// 		<paragraph><$text attribute="1">foo</$text>{}<$text attribute="2">bar</$text></paragraph>
		//
		if ( isBetweenDifferentValues( position, attribute ) && modelSelection.hasAttribute( attribute ) ) {
			preventCaretMovement( data );
			removeSelectionAttribute( model );
		} else {
			// ENGAGE 2-SCM when entering an attribute:
			//
			// 		<paragraph>foo{}<$text attribute>bar</$text>baz</paragraph>
			//
			if ( isAtStartBoundary( position, attribute ) ) {
				preventCaretMovement( data );
				overrideGravity( model );

				return;
			}

			// ENGAGE 2-SCM when leaving an attribute:
			//
			//		<paragraph>foo<$text attribute>bar{}</$text>baz</paragraph>
			//
			if ( isAtEndBoundary( position, attribute ) && modelSelection.hasAttribute( attribute ) ) {
				preventCaretMovement( data );
				overrideGravity( model );
			}
		}
	}

	function handleArrowLeftPress( position, data ) {
		// When the gravity is already overridden...
		if ( overrideUid ) {
			// ENGAGE 2-SCM & REMOVE SELECTION ATTRIBUTE
			// when about to leave one attribute value and enter another:
			//
			// 		<paragraph><$text attribute="1">foo</$text><$text attribute="2">{}bar</$text></paragraph>
			//
			// but DON'T when already in between of them (no attribute selection):
			//
			// 		<paragraph><$text attribute="1">foo</$text>{}<$text attribute="2">bar</$text></paragraph>
			//
			if ( isBetweenDifferentValues( position, attribute ) && modelSelection.hasAttribute( attribute ) ) {
				preventCaretMovement( data );
				restoreGravity( model );
				removeSelectionAttribute( model );
			}

			// ENGAGE 2-SCM when at any boundary of the attribute:
			//
			// 		<paragraph>foo<$text attribute>bar</$text>{}baz</paragraph>
			// 		<paragraph>foo<$text attribute>{}bar</$text>baz</paragraph>
			//
			else {
				preventCaretMovement( data );
				restoreGravity( model );

				// REMOVE SELECTION ATRIBUTE at the beginning of the block.
				// It's like restoring gravity but towards a non-existent content when
				// the gravity is overridden:
				//
				// 		<paragraph><$text attribute>{}bar</$text></paragraph>
				//
				// becomes:
				//
				// 		<paragraph>{}<$text attribute>bar</$text></paragraph>
				//
				if ( position.isAtStart ) {
					removeSelectionAttribute( model );
				}
			}
		} else {
			// ENGAGE 2-SCM when between two different attribute values but selection has no attribute:
			//
			// 		<paragraph><$text attribute="1">foo</$text>{}<$text attribute="2">bar</$text></paragraph>
			//
			if ( isBetweenDifferentValues( position, attribute ) && !modelSelection.hasAttribute( attribute ) ) {
				preventCaretMovement( data );
				setSelectionAttributeFromTheNodeBefore( model, position );

				return;
			}

			// DON'T ENGAGE 2-SCM if gravity is already overridden. It means that we have already entered
			//
			// 		<paragraph><$text attribute>bar{}</$text></paragraph>
			//
			if ( position.isAtEnd && isAtBoundary( position, attribute ) ) {
				if ( modelSelection.hasAttribute( attribute ) ) {
					return;
				} else {
					preventCaretMovement( data );
					setSelectionAttributeFromTheNodeBefore( model, position );

					return;
				}
			}

			// REMOVE SELECTION ATRIBUTE when restoring gravity towards a non-existent content at the
			// beginning of the block.
			//
			// 		<paragraph>{}<$text attribute>bar</$text></paragraph>
			//
			if ( position.isAtStart && isAtBoundary( position, attribute ) ) {
				if ( modelSelection.hasAttribute( attribute ) ) {
					removeSelectionAttribute( model );

					return;
				}

				return;
			}

			// DON'T ENGAGE 2-SCM when about to enter of leave an attribute.
			// We need to check if the caret is a one position before the attribute boundary:
			//
			// 		<paragraph>foo<$text attribute>b{}ar</$text>baz</paragraph>
			// 		<paragraph>foo<$text attribute>bar</$text>b{}az</paragraph>
			//
			if ( isAtBoundary( position.getShiftedBy( -1 ), attribute ) ) {
				// Skip the automatic gravity restore upon the next selection#change:range event.
				// If not skipped, it would automatically restore the gravity, which should remain
				// overridden.
				skipNextRangeChange();
				overrideGravity( model );
			}
		}
	}

	function overrideGravity( model ) {
		overrideUid = model.change( writer => writer.overrideSelectionGravity() );
	}

	function restoreGravity( model ) {
		model.change( writer => {
			writer.restoreSelectionGravity( overrideUid );
			overrideUid = null;
		} );
	}

	function preventCaretMovement( data ) {
		data.preventDefault();
	}

	function removeSelectionAttribute( model ) {
		model.change( writer => {
			writer.removeSelectionAttribute( attribute );
		} );
	}

	function setSelectionAttributeFromTheNodeBefore( model, position ) {
		model.change( writer => {
			writer.setSelectionAttribute( attribute, position.nodeBefore.getAttribute( attribute ) );
		} );
	}

	function skipNextRangeChange() {
		skipNextChangeRange = true;
	}
}

// @param {module:engine/model/position~Position} position
// @param {String} attribute Attribute name.
function isAtStartBoundary( position, attribute ) {
	const prevNode = position.nodeBefore;
	const nextNode = position.nodeAfter;
	const isAttrInNext = nextNode ? nextNode.hasAttribute( attribute ) : false;
	const isAttrInPrev = prevNode ? prevNode.hasAttribute( attribute ) : false;

	if ( ( !isAttrInPrev && isAttrInNext ) || isBetweenDifferentValues( position, attribute ) ) {
		return true;
	}

	return false;
}

// @param {module:engine/model/position~Position} position
// @param {String} attribute Attribute name.
function isAtEndBoundary( position, attribute ) {
	const prevNode = position.nodeBefore;
	const nextNode = position.nodeAfter;
	const isAttrInNext = nextNode ? nextNode.hasAttribute( attribute ) : false;
	const isAttrInPrev = prevNode ? prevNode.hasAttribute( attribute ) : false;

	if ( ( isAttrInPrev && !isAttrInNext ) || isBetweenDifferentValues( position, attribute ) ) {
		return true;
	}

	return false;
}

// @param {module:engine/model/position~Position} position
// @param {String} attribute Attribute name.
function isBetweenDifferentValues( position, attribute ) {
	const prevNode = position.nodeBefore;
	const nextNode = position.nodeAfter;
	const isAttrInNext = nextNode ? nextNode.hasAttribute( attribute ) : false;
	const isAttrInPrev = prevNode ? prevNode.hasAttribute( attribute ) : false;

	if ( !isAttrInPrev || !isAttrInNext ) {
		return;
	}

	return nextNode.getAttribute( attribute ) !== prevNode.getAttribute( attribute );
}

// @param {module:engine/model/position~Position} position
// @param {String} attribute Attribute name.
// @returns {Boolean} `true` when position between the nodes sticks to the bound of text with given attribute.
function isAtBoundary( position, attribute ) {
	return isAtStartBoundary( position, attribute ) || isAtEndBoundary( position, attribute );
}
