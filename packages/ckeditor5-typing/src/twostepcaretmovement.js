/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/twostepcaretmovement
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import priorities from '@ckeditor/ckeditor5-utils/src/priorities';

/**
 * This plugin enables the two-step caret (phantom) movement behavior for
 * {@link module:typing/twostepcaretmovement~TwoStepCaretMovement#registerAttribute registered attributes}
 * on arrow right (<kbd>→</kbd>) and left (<kbd>←</kbd>) key press.
 *
 * Thanks to this (phantom) caret movement the user is able to type before/after as well as at the
 * beginning/end of an attribute.
 *
 * **Note:** This class support right–to–left (Arabic, Hebrew, etc.) content by mirroring its behavior
 * but for the sake of simplicity examples showcase only left–to–right use–cases.
 *
 * # Forward movement
 *
 * ## "Entering" an attribute:
 *
 * When this plugin is enabled and registered for the `a` attribute and the selection is right before it
 * (at the attribute boundary), pressing the right arrow key will not move the selection but update its
 * attributes accordingly:
 *
 * * When enabled:
 *
 *   		foo{}<$text a="true">bar</$text>
 *
 *    <kbd>→</kbd>
 *
 *   		foo<$text a="true">{}bar</$text>
 *
 * * When disabled:
 *
 *   		foo{}<$text a="true">bar</$text>
 *
 *   <kbd>→</kbd>
 *
 *   		foo<$text a="true">b{}ar</$text>
 *
 *
 * ## "Leaving" an attribute:
 *
 * * When enabled:
 *
 *   		<$text a="true">bar{}</$text>baz
 *
 *    <kbd>→</kbd>
 *
 *   		<$text a="true">bar</$text>{}baz
 *
 * * When disabled:
 *
 *   		<$text a="true">bar{}</$text>baz
 *
 *   <kbd>→</kbd>
 *
 *   		<$text a="true">bar</$text>b{}az
 *
 * # Backward movement
 *
 * * When enabled:
 *
 *   		<$text a="true">bar</$text>{}baz
 *
 *    <kbd>←</kbd>
 *
 *   		<$text a="true">bar{}</$text>baz
 *
 * * When disabled:
 *
 *   		<$text a="true">bar</$text>{}baz
 *
 *   <kbd>←</kbd>
 *
 *   		<$text a="true">ba{}r</$text>b{}az
 */
export class TwoStepCaretMovement extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TwoStepCaretMovement';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * A map of handlers for each attribute.
		 *
		 * @protected
		 * @property {module:typing/twostepcaretmovement~TwoStepCaretMovement}
		 */
		this._handlers = new Map();
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const model = editor.model;
		const view = editor.editing.view;
		const locale = editor.locale;

		const modelSelection = model.document.selection;

		// Listen to keyboard events and handle the caret movement according to the 2-step caret logic.
		//
		// Note: This listener has the "high+1" priority:
		// * "high" because of the filler logic implemented in the renderer which also engages on #keydown.
		// When the gravity is overridden the attributes of the (model) selection attributes are reset.
		// It may end up with the filler kicking in and breaking the selection.
		// * "+1" because we would like to avoid collisions with other features (like Widgets), which
		// take over the keydown events with the "high" priority. Two-step caret movement takes precedence
		// over Widgets in that matter.
		//
		// Find out more in https://github.com/ckeditor/ckeditor5-engine/issues/1301.
		this.listenTo( view.document, 'keydown', ( evt, data ) => {
			// Do nothing if the plugin is disabled.
			// if ( !this.isEnabled ) {
			// 	return;
			// }

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
			const contentDirection = locale.contentLanguageDirection;
			let isMovementHandled = false;

			if ( ( contentDirection === 'ltr' && arrowRightPressed ) || ( contentDirection === 'rtl' && arrowLeftPressed ) ) {
				for ( const [ , handler ] of this._handlers ) {
					isMovementHandled = isMovementHandled || handler.handleForwardMovement( position, data );
				}
			} else {
				for ( const [ , handler ] of this._handlers ) {
					isMovementHandled = isMovementHandled || handler.handleBackwardMovement( position, data );
				}
			}

			// Stop the keydown event if the two-step caret movement handled it. Avoid collisions
			// with other features which may also take over the caret movement (e.g. Widget).
			if ( isMovementHandled ) {
				evt.stop();
			}
		}, { priority: priorities.get( 'high' ) + 1 } );
	}

	/**
	 * Registers a given attribute for the two-step caret movement.
	 *
	 * @param {String} attribute Name of the attribute to handle.
	 */
	registerAttribute( attribute ) {
		this._handlers.set(
			attribute,
			new TwoStepCaretHandler( this.editor.model, this, attribute )
		);
	}
}
export default TwoStepCaretMovement;

/**
 * This is a protected helper–class for {@link module:typing/twostepcaretmovement}.
 * It handles the state of the 2-step caret movement for a single {@link module:engine/model/model~Model}
 * attribute upon the `keypress` in the {@link module:engine/view/view~View}.
 *
 * @protected
 */
export class TwoStepCaretHandler {
	/*
	 * Creates two step handler instance.
	 *
	 * @param {module:engine/model/model~Model} model Data model instance.
	 * @param {module:utils/dom/emittermixin~Emitter} emitter The emitter to which this behavior should be added
	 * (e.g. a plugin instance).
	 * @param {String} attribute Attribute for which the behavior will be added.
	 */
	constructor( model, emitter, attribute ) {
		/**
		 * The model instance this class instance operates on.
		 *
		 * @readonly
		 * @member {module:engine/model/model~Model#schema}
		 */
		this.model = model;

		/**
		 * The Attribute this class instance operates on.
		 *
		 * @readonly
		 * @member {String}
		 */
		this.attribute = attribute;

		/**
		 * A reference to the document selection.
		 *
		 * @private
		 * @member {module:engine/model/selection~Selection}
		 */
		this._modelSelection = model.document.selection;

		/**
		 * The current UID of the overridden gravity, as returned by
		 * {@link module:engine/model/writer~Writer#overrideSelectionGravity}.
		 *
		 * @private
		 * @member {String}
		 */
		this._overrideUid = null;

		/**
		 * A flag indicating that the automatic gravity restoration for this attribute
		 * should not happen upon the next
		 * {@link module:engine/model/selection~Selection#event:change:range} event.
		 *
		 * @private
		 * @member {String}
		 */
		this._isNextGravityRestorationSkipped = false;

		// The automatic gravity restoration logic.
		emitter.listenTo( this._modelSelection, 'change:range', ( evt, data ) => {
			// Skipping the automatic restoration is needed if the selection should change
			// but the gravity must remain overridden afterwards. See the #handleBackwardMovement
			// to learn more.
			if ( this._isNextGravityRestorationSkipped ) {
				this._isNextGravityRestorationSkipped = false;

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

	/**
	 * Updates the document selection and the view according to the two–step caret movement state
	 * when moving **forwards**. Executed upon `keypress` in the {@link module:engine/view/view~View}.
	 *
	 * @param {module:engine/model/position~Position} position The model position at the moment of the key press.
	 * @param {module:engine/view/observer/domeventdata~DomEventData} data Data of the key press.
	 * @returns {Boolean} `true` when the handler prevented caret movement
	 */
	handleForwardMovement( position, data ) {
		const attribute = this.attribute;

		// DON'T ENGAGE 2-SCM if gravity is already overridden. It means that we just entered
		//
		// 		<paragraph>foo<$text attribute>{}bar</$text>baz</paragraph>
		//
		// or left the attribute
		//
		// 		<paragraph>foo<$text attribute>bar</$text>{}baz</paragraph>
		//
		// and the gravity will be restored automatically.
		if ( this._isGravityOverridden ) {
			return;
		}

		// DON'T ENGAGE 2-SCM when the selection is at the beginning of the block AND already has the
		// attribute:
		// * when the selection was initially set there using the mouse,
		// * when the editor has just started
		//
		//		<paragraph><$text attribute>{}bar</$text>baz</paragraph>
		//
		if ( position.isAtStart && this._hasSelectionAttribute ) {
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
		if ( isBetweenDifferentValues( position, attribute ) && this._hasSelectionAttribute ) {
			this._preventCaretMovement( data );
			this._removeSelectionAttribute();

			return true;
		}

		// ENGAGE 2-SCM when entering an attribute:
		//
		// 		<paragraph>foo{}<$text attribute>bar</$text>baz</paragraph>
		//
		if ( isAtStartBoundary( position, attribute ) ) {
			this._preventCaretMovement( data );
			this._overrideGravity();

			return true;
		}

		// ENGAGE 2-SCM when leaving an attribute:
		//
		//		<paragraph>foo<$text attribute>bar{}</$text>baz</paragraph>
		//
		if ( isAtEndBoundary( position, attribute ) && this._hasSelectionAttribute ) {
			this._preventCaretMovement( data );
			this._overrideGravity();

			return true;
		}
	}

	/**
	 * Updates the document selection and the view according to the two–step caret movement state
	 * when moving **backwards**. Executed upon `keypress` in the {@link module:engine/view/view~View}.
	 *
	 * @param {module:engine/model/position~Position} position The model position at the moment of the key press.
	 * @param {module:engine/view/observer/domeventdata~DomEventData} data Data of the key press.
	 * @returns {Boolean} `true` when the handler prevented caret movement
	 */
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
			if ( isBetweenDifferentValues( position, attribute ) && this._hasSelectionAttribute ) {
				this._preventCaretMovement( data );
				this._restoreGravity();
				this._removeSelectionAttribute();

				return true;
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

				return true;
			}
		} else {
			// ENGAGE 2-SCM when between two different attribute values but selection has no attribute:
			//
			// 		<paragraph><$text attribute="1">foo</$text>{}<$text attribute="2">bar</$text></paragraph>
			//
			if ( isBetweenDifferentValues( position, attribute ) && !this._hasSelectionAttribute ) {
				this._preventCaretMovement( data );
				this._setSelectionAttributeFromTheNodeBefore( position );

				return true;
			}

			// End of block boundary cases:
			//
			// 		<paragraph><$text attribute>bar{}</$text></paragraph>
			// 		<paragraph><$text attribute>bar</$text>{}</paragraph>
			//
			if ( position.isAtEnd && isAtEndBoundary( position, attribute ) ) {
				// DON'T ENGAGE 2-SCM if the selection has the attribute already.
				// This is a common selection if set using the mouse.
				//
				// 		<paragraph><$text attribute>bar{}</$text></paragraph>
				//
				if ( this._hasSelectionAttribute ) {
					// DON'T ENGAGE 2-SCM if the attribute at the end of the block which has length == 1.
					// Make sure the selection will not the attribute after it moves backwards.
					//
					// 		<paragraph>foo<$text attribute>b{}</$text></paragraph>
					//
					if ( isStepAfterTheAttributeBoundary( position, attribute ) ) {
						// Skip the automatic gravity restore upon the next selection#change:range event.
						// If not skipped, it would automatically restore the gravity, which should remain
						// overridden.
						this._skipNextAutomaticGravityRestoration();
						this._overrideGravity();

						// Don't return "true" here because we didn't call _preventCaretMovement.
						// Returning here will destabilize the filler logic, which also listens to
						// keydown (and the event would be stopped).
					}

					return;
				}
				// ENGAGE 2-SCM if the selection has no attribute. This may happen when the user
				// left the attribute using a FORWARD 2-SCM.
				//
				// 		<paragraph><$text attribute>bar</$text>{}</paragraph>
				//
				else {
					this._preventCaretMovement( data );
					this._setSelectionAttributeFromTheNodeBefore( position );

					return true;
				}
			}

			// REMOVE SELECTION ATRIBUTE when restoring gravity towards a non-existent content at the
			// beginning of the block.
			//
			// 		<paragraph>{}<$text attribute>bar</$text></paragraph>
			//
			if ( position.isAtStart ) {
				if ( this._hasSelectionAttribute ) {
					this._removeSelectionAttribute();
					this._preventCaretMovement( data );

					return true;
				}

				return;
			}

			// DON'T ENGAGE 2-SCM when about to enter of leave an attribute.
			// We need to check if the caret is a one position before the attribute boundary:
			//
			// 		<paragraph>foo<$text attribute>b{}ar</$text>baz</paragraph>
			// 		<paragraph>foo<$text attribute>bar</$text>b{}az</paragraph>
			//
			if ( isStepAfterTheAttributeBoundary( position, attribute ) ) {
				// Skip the automatic gravity restore upon the next selection#change:range event.
				// If not skipped, it would automatically restore the gravity, which should remain
				// overridden.
				this._skipNextAutomaticGravityRestoration();
				this._overrideGravity();

				// Don't return "true" here because we didn't call _preventCaretMovement.
				// Returning here will destabilize the filler logic, which also listens to
				// keydown (and the event would be stopped).
			}
		}
	}

	/**
	 * `true` when the gravity is overridden for the {@link #attribute}.
	 *
	 * @readonly
	 * @private
	 * @type {Boolean}
	 */
	get _isGravityOverridden() {
		return !!this._overrideUid;
	}

	/**
	 * `true` when the {@link module:engine/model/selection~Selection} has the {@link #attribute}.
	 *
	 * @readonly
	 * @private
	 * @type {Boolean}
	 */
	get _hasSelectionAttribute() {
		return this._modelSelection.hasAttribute( this.attribute );
	}

	/**
	 * Overrides the gravity using the {@link module:engine/model/writer~Writer model writer}
	 * and stores the information about this fact in the {@link #_overrideUid}.
	 *
	 * A shorthand for {@link module:engine/model/writer~Writer#overrideSelectionGravity}.
	 *
	 * @private
	 */
	_overrideGravity() {
		this._overrideUid = this.model.change( writer => writer.overrideSelectionGravity() );
	}

	/**
	 * Restores the gravity using the {@link module:engine/model/writer~Writer model writer}.
	 *
	 * A shorthand for {@link module:engine/model/writer~Writer#restoreSelectionGravity}.
	 *
	 * @private
	 */
	_restoreGravity() {
		this.model.change( writer => {
			writer.restoreSelectionGravity( this._overrideUid );
			this._overrideUid = null;
		} );
	}

	/**
	 * Prevents the caret movement in the view by calling `preventDefault` on the event data.
	 *
	 * @private
	 */
	_preventCaretMovement( data ) {
		data.preventDefault();
	}

	/**
	 * Removes the {@link #attribute} from the selection using using the
	 * {@link module:engine/model/writer~Writer model writer}.
	 *
	 * @private
	 */
	_removeSelectionAttribute() {
		this.model.change( writer => {
			writer.removeSelectionAttribute( this.attribute );
		} );
	}

	/**
	 * Applies the {@link #attribute} to the current selection using using the
	 * value from the node before the current position. Uses
	 * the {@link module:engine/model/writer~Writer model writer}.
	 *
	 * @private
	 * @param {module:engine/model/position~Position} position
	 */
	_setSelectionAttributeFromTheNodeBefore( position ) {
		const attribute = this.attribute;

		this.model.change( writer => {
			writer.setSelectionAttribute( this.attribute, position.nodeBefore.getAttribute( attribute ) );
		} );
	}

	/**
	 * Skips the next automatic selection gravity restoration upon the
	 * {@link module:engine/model/selection~Selection#event:change:range} event.
	 *
	 * See {@link #_isNextGravityRestorationSkipped}.
	 *
	 * @private
	 */
	_skipNextAutomaticGravityRestoration() {
		this._isNextGravityRestorationSkipped = true;
	}
}

// @param {module:engine/model/position~Position} position
// @param {String} attribute
// @returns {Boolean} `true` when position between the nodes sticks to the bound of text with given attribute.
function isAtBoundary( position, attribute ) {
	return isAtStartBoundary( position, attribute ) || isAtEndBoundary( position, attribute );
}

// @param {module:engine/model/position~Position} position
// @param {String} attribute
function isAtStartBoundary( position, attribute ) {
	const { nodeBefore, nodeAfter } = position;
	const isAttrBefore = nodeBefore ? nodeBefore.hasAttribute( attribute ) : false;
	const isAttrAfter = nodeAfter ? nodeAfter.hasAttribute( attribute ) : false;

	return isAttrAfter && ( !isAttrBefore || nodeBefore.getAttribute( attribute ) !== nodeAfter.getAttribute( attribute ) );
}

// @param {module:engine/model/position~Position} position
// @param {String} attribute
function isAtEndBoundary( position, attribute ) {
	const { nodeBefore, nodeAfter } = position;
	const isAttrBefore = nodeBefore ? nodeBefore.hasAttribute( attribute ) : false;
	const isAttrAfter = nodeAfter ? nodeAfter.hasAttribute( attribute ) : false;

	return isAttrBefore && ( !isAttrAfter || nodeBefore.getAttribute( attribute ) !== nodeAfter.getAttribute( attribute ) );
}

// @param {module:engine/model/position~Position} position
// @param {String} attribute
function isBetweenDifferentValues( position, attribute ) {
	const { nodeBefore, nodeAfter } = position;
	const isAttrBefore = nodeBefore ? nodeBefore.hasAttribute( attribute ) : false;
	const isAttrAfter = nodeAfter ? nodeAfter.hasAttribute( attribute ) : false;

	if ( !isAttrAfter || !isAttrBefore ) {
		return;
	}

	return nodeAfter.getAttribute( attribute ) !== nodeBefore.getAttribute( attribute );
}

// @param {module:engine/model/position~Position} position
// @param {String} attribute
function isStepAfterTheAttributeBoundary( position, attribute ) {
	return isAtBoundary( position.getShiftedBy( -1 ), attribute );
}
