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
 * **Note:** This plugin support right–to–left (Arabic, Hebrew, etc.) content by mirroring its behavior
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
export default class TwoStepCaretMovement extends Plugin {
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
		 * A set of attributes to handle.
		 *
		 * @protected
		 * @property {module:typing/twostepcaretmovement~TwoStepCaretMovement}
		 */
		this.attributes = new Set();

		/**
		 * The current UID of the overridden gravity, as returned by
		 * {@link module:engine/model/writer~Writer#overrideSelectionGravity}.
		 *
		 * @private
		 * @member {String}
		 */
		this._overrideUid = null;
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

			let orientedHandlerMethod;
			if ( ( contentDirection === 'ltr' && arrowRightPressed ) || ( contentDirection === 'rtl' && arrowLeftPressed ) ) {
				orientedHandlerMethod = handleForwardMovement;
			} else {
				orientedHandlerMethod = handleBackwardMovement;
			}

			for ( const attribute of this.attributes ) {
				// If gravity was changed for at least one attribute, move on.
				const result = orientedHandlerMethod( position, data, this, attribute );
				if ( result === true ) {
					isMovementHandled = true;
					break;
				} else if ( result === 'next' ) {
					break;
				}
			}

			// Stop the keydown event if the two-step caret movement handled it. Avoid collisions
			// with other features which may also take over the caret movement (e.g. Widget).
			if ( isMovementHandled ) {
				evt.stop();
			}
		}, { priority: priorities.get( 'high' ) + 1 } );

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
		this.listenTo( modelSelection, 'change:range', ( evt, data ) => {
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
			const isAnyAtBoundary = Array.from( this.attributes )
				.some( attribute => isAtBoundary( modelSelection.getFirstPosition(), attribute ) );

			if ( !data.directChange && isAnyAtBoundary ) {
				return;
			}

			this._restoreGravity();
		} );
	}

	/**
	 * Registers a given attribute for the two-step caret movement.
	 *
	 * @param {String} attribute Name of the attribute to handle.
	 */
	registerAttribute( attribute ) {
		this.attributes.add( attribute );
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
	 * Overrides the gravity using the {@link module:engine/model/writer~Writer model writer}
	 * and stores the information about this fact in the {@link #_overrideUid}.
	 *
	 * A shorthand for {@link module:engine/model/writer~Writer#overrideSelectionGravity}.
	 *
	 * @private
	 */
	_overrideGravity() {
		this._overrideUid = this.editor.model.change( writer => {
			return writer.overrideSelectionGravity();
		} );
	}

	/**
	 * Restores the gravity using the {@link module:engine/model/writer~Writer model writer}.
	 *
	 * A shorthand for {@link module:engine/model/writer~Writer#restoreSelectionGravity}.
	 *
	 * @private
	 */
	_restoreGravity() {
		this.editor.model.change( writer => {
			writer.restoreSelectionGravity( this._overrideUid );
			this._overrideUid = null;
		} );
	}
}

/**
 * Updates the document selection and the view according to the two–step caret movement state
 * when moving **forwards**. Executed upon `keypress` in the {@link module:engine/view/view~View}.
 *
 * @param {module:engine/model/position~Position} position The model position at the moment of the key press.
 * @param {module:engine/view/observer/domeventdata~DomEventData} data Data of the key press.
 * @param {module:typing/src/twostepcaretmovement~TwoStepCaretMovement} plugin 2SCM plugin.
 * @param {String} attribute. The attribute to handle.
 * @returns {Boolean} `true` when the handler prevented caret movement
 */
function handleForwardMovement( position, data, plugin, attribute ) {
	const model = plugin.editor.model;
	// DON'T ENGAGE 2-SCM if gravity is already overridden. It means that we just entered
	//
	// 		<paragraph>foo<$text attribute>{}bar</$text>baz</paragraph>
	//
	// or left the attribute
	//
	// 		<paragraph>foo<$text attribute>bar</$text>{}baz</paragraph>
	//
	// and the gravity will be restored automatically.
	if ( plugin._isGravityOverridden ) {
		return;
	}

	const hasSelectionAttribute = model.document.selection.hasAttribute( attribute );

	// DON'T ENGAGE 2-SCM when the selection is at the beginning of the block AND already has the
	// attribute:
	// * when the selection was initially set there using the mouse,
	// * when the editor has just started
	//
	//		<paragraph><$text attribute>{}bar</$text>baz</paragraph>
	//
	if ( position.isAtStart && hasSelectionAttribute ) {
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
	if ( isBetweenDifferentValues( position, attribute ) && hasSelectionAttribute ) {
		preventCaretMovement( data );
		removeSelectionAttribute( model, attribute );

		return true;
	}

	// ENGAGE 2-SCM when entering an attribute:
	//
	// 		<paragraph>foo{}<$text attribute>bar</$text>baz</paragraph>
	//
	if ( isAtStartBoundary( position, attribute ) ) {
		preventCaretMovement( data );
		plugin._overrideGravity();

		return true;
	}

	// ENGAGE 2-SCM when leaving an attribute:
	//
	//		<paragraph>foo<$text attribute>bar{}</$text>baz</paragraph>
	//
	if ( isAtEndBoundary( position, attribute ) && hasSelectionAttribute ) {
		preventCaretMovement( data );
		plugin._overrideGravity();

		return true;
	}
}

/**
 * Updates the document selection and the view according to the two–step caret movement state
 * when moving **backwards**. Executed upon `keypress` in the {@link module:engine/view/view~View}.
 *
 * @param {module:engine/model/position~Position} position The model position at the moment of the key press.
 * @param {module:engine/view/observer/domeventdata~DomEventData} data Data of the key press.
 * @param {module:typing/src/twostepcaretmovement~TwoStepCaretMovement} plugin 2SCM plugin.
 * @param {String} attribute. The attribute to handle.
 * @returns {Boolean|String} `true` when the handler prevented caret movement,
 * 							`'next'` when the next gravity restoration should be skipped.
 */
function handleBackwardMovement( position, data, plugin, attribute ) {
	const model = plugin.editor.model;
	const hasSelectionAttribute = model.document.selection.hasAttribute( attribute );
	// When the gravity is already overridden...
	if ( plugin._isGravityOverridden ) {
		// ENGAGE 2-SCM & REMOVE SELECTION ATTRIBUTE
		// when about to leave one attribute value and enter another:
		//
		// 		<paragraph><$text attribute="1">foo</$text><$text attribute="2">{}bar</$text></paragraph>
		//
		// but DON'T when already in between of them (no attribute selection):
		//
		// 		<paragraph><$text attribute="1">foo</$text>{}<$text attribute="2">bar</$text></paragraph>
		//
		if ( isBetweenDifferentValues( position, attribute ) && hasSelectionAttribute ) {
			preventCaretMovement( data );
			plugin._restoreGravity();
			removeSelectionAttribute( plugin.editor.model, attribute );

			return true;
		}

		// ENGAGE 2-SCM when at any boundary of the attribute:
		//
		// 		<paragraph>foo<$text attribute>bar</$text>{}baz</paragraph>
		// 		<paragraph>foo<$text attribute>{}bar</$text>baz</paragraph>
		//
		else {
			preventCaretMovement( data );
			plugin._restoreGravity();

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
				removeSelectionAttribute( plugin.editor.model, attribute );
			}

			return true;
		}
	} else {
		// ENGAGE 2-SCM when between two different attribute values but selection has no attribute:
		//
		// 		<paragraph><$text attribute="1">foo</$text>{}<$text attribute="2">bar</$text></paragraph>
		//
		if ( isBetweenDifferentValues( position, attribute ) && !hasSelectionAttribute ) {
			preventCaretMovement( data );
			setSelectionAttributeFromTheNodeBefore( plugin.editor.model, attribute, position );

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
			if ( hasSelectionAttribute ) {
				// DON'T ENGAGE 2-SCM if the attribute at the end of the block which has length == 1.
				// Make sure the selection will not the attribute after it moves backwards.
				//
				// 		<paragraph>foo<$text attribute>b{}</$text></paragraph>
				//
				if ( isStepAfterTheAttributeBoundary( position, attribute ) ) {
					// Skip the automatic gravity restore upon the next selection#change:range event.
					// If not skipped, it would automatically restore the gravity, which should remain
					// overridden.
					plugin._isNextGravityRestorationSkipped = true;
					plugin._overrideGravity();

					// Don't return "true" here because we didn't call _preventCaretMovement.
					// Returning here will destabilize the filler logic, which also listens to
					// keydown (and the event would be stopped).
					return 'next';
				}

				return;
			}
			// ENGAGE 2-SCM if the selection has no attribute. This may happen when the user
			// left the attribute using a FORWARD 2-SCM.
			//
			// 		<paragraph><$text attribute>bar</$text>{}</paragraph>
			//
			else {
				preventCaretMovement( data );
				setSelectionAttributeFromTheNodeBefore( plugin.editor.model, attribute, position );

				return true;
			}
		}

		// REMOVE SELECTION ATRIBUTE when restoring gravity towards a non-existent content at the
		// beginning of the block.
		//
		// 		<paragraph>{}<$text attribute>bar</$text></paragraph>
		//
		if ( position.isAtStart ) {
			if ( hasSelectionAttribute ) {
				removeSelectionAttribute( model, attribute );
				preventCaretMovement( data );

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
			plugin._isNextGravityRestorationSkipped = true;
			plugin._overrideGravity();

			// Don't return "true" here because we didn't call _preventCaretMovement.
			// Returning here will destabilize the filler logic, which also listens to
			// keydown (and the event would be stopped).
			return 'next';
		}
	}
}

// Applies the {@link #attribute} to the current selection using using the
// value from the node before the current position. Uses
// the {@link module:engine/model/writer~Writer model writer}.
//
// @param {module:engine/model/model~Model}
// @param {String} attribute
// @param {module:engine/model/position~Position} position
function setSelectionAttributeFromTheNodeBefore( model, attribute, position ) {
	model.change( writer => {
		writer.setSelectionAttribute( attribute, position.nodeBefore.getAttribute( attribute ) );
	} );
}

// Removes the {@link #attribute} from the selection using using the
// {@link module:engine/model/writer~Writer model writer}.
// @param {module:engine/model/model~Model}
// @param {String} attribute
function removeSelectionAttribute( model, attribute ) {
	model.change( writer => {
		writer.removeSelectionAttribute( attribute );
	} );
}

// Prevents the caret movement in the view by calling `preventDefault` on the event data.
//
// @alias data.preventDefault
function preventCaretMovement( data ) {
	data.preventDefault();
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
