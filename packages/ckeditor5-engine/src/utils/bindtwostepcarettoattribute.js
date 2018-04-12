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
	const twoStepCaretHandler = new TwoStepCaretHandler( model, emitter, attribute );
	const modelSelection = model.document.selection;

	// Listen to keyboard events and handle cursor before the move.
	emitter.listenTo( view.document, 'keydown', ( evt, data ) => {
		// This implementation works only for collapsed selection.
		if ( !modelSelection.isCollapsed ) {
			return;
		}

		// When user tries to expand the selection or jump over the whole word or to the beginning/end then
		// two-steps movement is not necessary.
		if ( data.shiftKey || data.altKey || data.ctrlKey ) {
			return;
		}

		const arrowRightPressed = data.keyCode == keyCodes.arrowright;
		const arrowLeftPressed = data.keyCode == keyCodes.arrowleft;

		// When neither left or right arrow has been pressed then do noting.
		if ( !arrowRightPressed && !arrowLeftPressed ) {
			return;
		}

		const position = modelSelection.getFirstPosition();

		if ( arrowRightPressed ) {
			twoStepCaretHandler.handleForwardMovement( position, data );
		} else {
			twoStepCaretHandler.handleBackwardMovement( position, data );
		}
	} );
}

class TwoStepCaretHandler {
	constructor( model, emitter, attribute ) {
		this.model = model;
		this.attribute = attribute;

		this._modelSelection = model.document.selection;
		this._overrideUid = null;
		this._skipNextChangeRange = false;

		emitter.listenTo( this._modelSelection, 'change:range', ( evt, data ) => {
			if ( this._skipNextChangeRange ) {
				this._skipNextChangeRange = false;

				return;
			}

			// Skip automatic restore when the gravity is not overridden — simply, there's nothing to restore
			// at this moment.
			if ( !this._isGravityOverridden ) {
				return;
			}

			// Skip automatic restore when the change is indirect AND the selection is at the attribute boundary.
			// It means that e.g. if the change was external (collaboration) and the user had their
			// selection around the link, its gravity should remain intact in this change:range event.
			if ( !data.directChange && isAtBoundary( this._modelSelection.getFirstPosition(), attribute ) ) {
				return;
			}

			this._restoreGravity();
		} );
	}

	handleForwardMovement( position, data ) {
		const attribute = this.attribute;

		// DON'T ENGAGE 2-SCM if gravity is already overridden. It means that we just entered
		//
		// 		<paragraph>foo{}<$text attribute>bar</$text>baz</paragraph>
		//
		// or left the attribute
		//
		// 		<paragraph>foo<$text attribute>bar</$text>{}baz</paragraph>
		//
		// and the gravity will be restored automatically.
		if ( this._isGravityOverridden ) {
			return;
		}

		// DON'T ENGAGE 2-SCM when the selection is at the beginning of an attribute AND already has it:
		// * when the selection was initially set there using the mouse,
		// * when the editor has just started
		//
		//		<paragraph><$text attribute>{}bar</$text>baz</paragraph>
		//
		if ( position.isAtStart && this._hasAttribute ) {
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
		if ( isBetweenDifferentValues( position, attribute ) && this._hasAttribute ) {
			this._preventCaretMovement( data );
			this._removeSelectionAttribute();
		} else {
			// ENGAGE 2-SCM when entering an attribute:
			//
			// 		<paragraph>foo{}<$text attribute>bar</$text>baz</paragraph>
			//
			if ( isAtStartBoundary( position, attribute ) ) {
				this._preventCaretMovement( data );
				this._overrideGravity();

				return;
			}

			// ENGAGE 2-SCM when leaving an attribute:
			//
			//		<paragraph>foo<$text attribute>bar{}</$text>baz</paragraph>
			//
			if ( isAtEndBoundary( position, attribute ) && this._hasAttribute ) {
				this._preventCaretMovement( data );
				this._overrideGravity();
			}
		}
	}

	handleBackwardMovement( position, data ) {
		const attribute = this.attribute;

		// When the gravity is already overridden...
		if ( this._isGravityOverridden ) {
			// ENGAGE 2-SCM & REMOVE SELECTION ATTRIBUTE
			// when about to leave one attribute value and enter another:
			//
			// 		<paragraph><$text attribute="1">foo</$text><$text attribute="2">{}bar</$text></paragraph>
			//
			// but DON'T when already in between of them (no attribute selection):
			//
			// 		<paragraph><$text attribute="1">foo</$text>{}<$text attribute="2">bar</$text></paragraph>
			//
			if ( isBetweenDifferentValues( position, attribute ) && this._hasAttribute ) {
				this._preventCaretMovement( data );
				this._restoreGravity();
				this._removeSelectionAttribute();
			}

			// ENGAGE 2-SCM when at any boundary of the attribute:
			//
			// 		<paragraph>foo<$text attribute>bar</$text>{}baz</paragraph>
			// 		<paragraph>foo<$text attribute>{}bar</$text>baz</paragraph>
			//
			else {
				this._preventCaretMovement( data );
				this._restoreGravity();

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
					this._removeSelectionAttribute();
				}
			}
		} else {
			// ENGAGE 2-SCM when between two different attribute values but selection has no attribute:
			//
			// 		<paragraph><$text attribute="1">foo</$text>{}<$text attribute="2">bar</$text></paragraph>
			//
			if ( isBetweenDifferentValues( position, attribute ) && !this._hasAttribute ) {
				this._preventCaretMovement( data );
				this._setSelectionAttributeFromTheNodeBefore( position );

				return;
			}

			// DON'T ENGAGE 2-SCM if gravity is already overridden. It means that we have already entered
			//
			// 		<paragraph><$text attribute>bar{}</$text></paragraph>
			//
			if ( position.isAtEnd && isAtBoundary( position, attribute ) ) {
				if ( this._hasAttribute ) {
					return;
				} else {
					this._preventCaretMovement( data );
					this._setSelectionAttributeFromTheNodeBefore( position );

					return;
				}
			}

			// REMOVE SELECTION ATRIBUTE when restoring gravity towards a non-existent content at the
			// beginning of the block.
			//
			// 		<paragraph>{}<$text attribute>bar</$text></paragraph>
			//
			if ( position.isAtStart && isAtBoundary( position, attribute ) ) {
				if ( this._hasAttribute ) {
					this._removeSelectionAttribute();

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
				this._skipNextRangeChange();
				this._overrideGravity();
			}
		}
	}

	get _isGravityOverridden() {
		return !!this._overrideUid;
	}

	get _hasAttribute() {
		return this._modelSelection.hasAttribute( this.attribute );
	}

	_overrideGravity() {
		this._overrideUid = this.model.change( writer => writer.overrideSelectionGravity() );
	}

	_restoreGravity() {
		this.model.change( writer => {
			writer.restoreSelectionGravity( this._overrideUid );
			this._overrideUid = null;
		} );
	}

	_preventCaretMovement( data ) {
		data.preventDefault();
	}

	_removeSelectionAttribute() {
		this.model.change( writer => {
			writer.removeSelectionAttribute( this.attribute );
		} );
	}

	_setSelectionAttributeFromTheNodeBefore( position ) {
		const attribute = this.attribute;

		this.model.change( writer => {
			writer.setSelectionAttribute( this.attribute, position.nodeBefore.getAttribute( attribute ) );
		} );
	}

	_skipNextRangeChange() {
		this._skipNextChangeRange = true;
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
