/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/twostepcaretmovement
 */

import { Plugin, type Editor } from '@ckeditor/ckeditor5-core';

import { keyCodes } from '@ckeditor/ckeditor5-utils';

import type {
	DocumentSelection,
	DocumentSelectionChangeEvent,
	DomEventData,
	Model,
	Position,
	ViewDocumentArrowKeyEvent
} from '@ckeditor/ckeditor5-engine';

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
 * ```xml
 * foo{}<$text a="true">bar</$text>
 * ```
 *
 * 	<kbd>→</kbd>
 *
 * ```xml
 * foo<$text a="true">{}bar</$text>
 * ```
 *
 * * When disabled:
 *
 * ```xml
 * foo{}<$text a="true">bar</$text>
 * ```
 *
 * 	<kbd>→</kbd>
 *
 * ```xml
 * foo<$text a="true">b{}ar</$text>
 * ```
 *
 *
 * ## "Leaving" an attribute:
 *
 * * When enabled:
 *
 * ```xml
 * <$text a="true">bar{}</$text>baz
 * ```
 *
 * 	<kbd>→</kbd>
 *
 * ```xml
 * <$text a="true">bar</$text>{}baz
 * ```
 *
 * * When disabled:
 *
 * ```xml
 * <$text a="true">bar{}</$text>baz
 * ```
 *
 * 	<kbd>→</kbd>
 *
 * ```xml
 * <$text a="true">bar</$text>b{}az
 * ```
 *
 * # Backward movement
 *
 * * When enabled:
 *
 * ```xml
 * <$text a="true">bar</$text>{}baz
 * ```
 *
 * 	<kbd>←</kbd>
 *
 * ```xml
 * <$text a="true">bar{}</$text>baz
 * ```
 *
 * * When disabled:
 *
 * ```xml
 * <$text a="true">bar</$text>{}baz
 * ```
 *
 * 	<kbd>←</kbd>
 *
 * ```xml
 * <$text a="true">ba{}r</$text>b{}az
 * ```
 *
 * # Multiple attributes
 *
 * * When enabled and many attributes starts or ends at the same position:
 *
 * ```xml
 * <$text a="true" b="true">bar</$text>{}baz
 * ```
 *
 * 	<kbd>←</kbd>
 *
 * ```xml
 * <$text a="true" b="true">bar{}</$text>baz
 * ```
 *
 * * When enabled and one procedes another:
 *
 * ```xml
 * <$text a="true">bar</$text><$text b="true">{}bar</$text>
 * ```
 *
 * 	<kbd>←</kbd>
 *
 * ```xml
 * <$text a="true">bar{}</$text><$text b="true">bar</$text>
 * ```
 *
 */
export default class TwoStepCaretMovement extends Plugin {
	/**
	 * A set of attributes to handle.
	 */
	private attributes: Set<string>;

	/**
	 * The current UID of the overridden gravity, as returned by
	 * {@link module:engine/model/writer~Writer#overrideSelectionGravity}.
	 */
	private _overrideUid: string | null;

	/**
	 * A flag indicating that the automatic gravity restoration should not happen upon the next
	 * gravity restoration.
	 * {@link module:engine/model/selection~Selection#event:change:range} event.
	 */

	private _isNextGravityRestorationSkipped!: boolean;

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'TwoStepCaretMovement' {
		return 'TwoStepCaretMovement';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		this.attributes = new Set();
		this._overrideUid = null;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const model = editor.model;
		const view = editor.editing.view;
		const locale = editor.locale;

		const modelSelection = model.document.selection;

		// Listen to keyboard events and handle the caret movement according to the 2-step caret logic.
		this.listenTo<ViewDocumentArrowKeyEvent>( view.document, 'arrowKey', ( evt, data ) => {
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

			const contentDirection = locale.contentLanguageDirection;
			let isMovementHandled = false;

			if ( ( contentDirection === 'ltr' && arrowRightPressed ) || ( contentDirection === 'rtl' && arrowLeftPressed ) ) {
				isMovementHandled = this._handleForwardMovement( data );
			} else {
				isMovementHandled = this._handleBackwardMovement( data );
			}

			// Stop the keydown event if the two-step caret movement handled it. Avoid collisions
			// with other features which may also take over the caret movement (e.g. Widget).
			if ( isMovementHandled === true ) {
				evt.stop();
			}
		}, { context: '$text', priority: 'highest' } );

		this._isNextGravityRestorationSkipped = false;

		// The automatic gravity restoration logic.
		this.listenTo<DocumentSelectionChangeEvent>( modelSelection, 'change:range', ( evt, data ) => {
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
			if ( !data.directChange && isBetweenDifferentAttributes( modelSelection.getFirstPosition()!, this.attributes ) ) {
				return;
			}

			this._restoreGravity();
		} );
	}

	/**
	 * Registers a given attribute for the two-step caret movement.
	 *
	 * @param attribute Name of the attribute to handle.
	 */
	public registerAttribute( attribute: string ): void {
		this.attributes.add( attribute );
	}

	/**
	 * Updates the document selection and the view according to the two–step caret movement state
	 * when moving **forwards**. Executed upon `keypress` in the {@link module:engine/view/view~View}.
	 *
	 * @param data Data of the key press.
	 * @returns `true` when the handler prevented caret movement.
	 */
	private _handleForwardMovement( data: DomEventData ): boolean {
		const attributes = this.attributes;
		const model = this.editor.model;
		const selection = model.document.selection;
		const position = selection.getFirstPosition()!;

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
			return false;
		}

		// DON'T ENGAGE 2-SCM when the selection is at the beginning of the block AND already has the
		// attribute:
		// * when the selection was initially set there using the mouse,
		// * when the editor has just started
		//
		//		<paragraph><$text attribute>{}bar</$text>baz</paragraph>
		//
		if ( position.isAtStart && hasAnyAttribute( selection, attributes ) ) {
			return false;
		}

		// ENGAGE 2-SCM When at least one of the observed attributes changes its value (incl. starts, ends).
		//
		//		<paragraph>foo<$text attribute>bar{}</$text>baz</paragraph>
		//		<paragraph>foo<$text attribute>bar{}</$text><$text otherAttribute>baz</$text></paragraph>
		//		<paragraph>foo<$text attribute=1>bar{}</$text><$text attribute=2>baz</$text></paragraph>
		//		<paragraph>foo{}<$text attribute>bar</$text>baz</paragraph>
		//
		if ( isBetweenDifferentAttributes( position, attributes ) ) {
			preventCaretMovement( data );
			this._overrideGravity();

			return true;
		}

		return false;
	}

	/**
	 * Updates the document selection and the view according to the two–step caret movement state
	 * when moving **backwards**. Executed upon `keypress` in the {@link module:engine/view/view~View}.
	 *
	 * @param data Data of the key press.
	 * @returns `true` when the handler prevented caret movement
	 */
	private _handleBackwardMovement( data: DomEventData ): boolean {
		const attributes = this.attributes;
		const model = this.editor.model;
		const selection = model.document.selection;
		const position = selection.getFirstPosition()!;

		// When the gravity is already overridden (by this plugin), it means we are on the two-step position.
		// Prevent the movement, restore the gravity and update selection attributes.
		//
		//		<paragraph>foo<$text attribute=1>bar</$text><$text attribute=2>{}baz</$text></paragraph>
		//		<paragraph>foo<$text attribute>bar</$text><$text otherAttribute>{}baz</$text></paragraph>
		//		<paragraph>foo<$text attribute>{}bar</$text>baz</paragraph>
		//		<paragraph>foo<$text attribute>bar</$text>{}baz</paragraph>
		//
		if ( this._isGravityOverridden ) {
			preventCaretMovement( data );
			this._restoreGravity();
			setSelectionAttributesFromTheNodeBefore( model, attributes, position );

			return true;
		} else {
			// REMOVE SELECTION ATTRIBUTE when restoring gravity towards a non-existent content at the
			// beginning of the block.
			//
			// 		<paragraph>{}<$text attribute>bar</$text></paragraph>
			//
			if ( position.isAtStart ) {
				if ( hasAnyAttribute( selection, attributes ) ) {
					preventCaretMovement( data );
					setSelectionAttributesFromTheNodeBefore( model, attributes, position );

					return true;
				}

				return false;
			}

			// When we are moving from natural gravity, to the position of the 2SCM, we need to override the gravity,
			// and make sure it won't be restored. Unless it's at the end of the block and an observed attribute.
			// We need to check if the caret is a one position before the attribute boundary:
			//
			//		<paragraph>foo<$text attribute=1>bar</$text><$text attribute=2>b{}az</$text></paragraph>
			//		<paragraph>foo<$text attribute>bar</$text><$text otherAttribute>b{}az</$text></paragraph>
			//		<paragraph>foo<$text attribute>b{}ar</$text>baz</paragraph>
			//		<paragraph>foo<$text attribute>bar</$text>b{}az</paragraph>
			//
			if ( isStepAfterAnyAttributeBoundary( position, attributes ) ) {
				// ENGAGE 2-SCM if the selection has no attribute. This may happen when the user
				// left the attribute using a FORWARD 2-SCM.
				//
				// 		<paragraph><$text attribute>bar</$text>{}</paragraph>
				//
				if (
					position.isAtEnd &&
					!hasAnyAttribute( selection, attributes ) &&
					isBetweenDifferentAttributes( position, attributes )
				) {
					preventCaretMovement( data );
					setSelectionAttributesFromTheNodeBefore( model, attributes, position );

					return true;
				}
				// Skip the automatic gravity restore upon the next selection#change:range event.
				// If not skipped, it would automatically restore the gravity, which should remain
				// overridden.
				this._isNextGravityRestorationSkipped = true;
				this._overrideGravity();

				// Don't return "true" here because we didn't call _preventCaretMovement.
				// Returning here will destabilize the filler logic, which also listens to
				// keydown (and the event would be stopped).
				return false;
			}
		}

		return false;
	}

	/**
	 * `true` when the gravity is overridden for the plugin.
	 */
	private get _isGravityOverridden(): boolean {
		return !!this._overrideUid;
	}

	/**
	 * Overrides the gravity using the {@link module:engine/model/writer~Writer model writer}
	 * and stores the information about this fact in the {@link #_overrideUid}.
	 *
	 * A shorthand for {@link module:engine/model/writer~Writer#overrideSelectionGravity}.
	 */
	private _overrideGravity(): void {
		this._overrideUid = this.editor.model.change( writer => {
			return writer.overrideSelectionGravity();
		} );
	}

	/**
	 * Restores the gravity using the {@link module:engine/model/writer~Writer model writer}.
	 *
	 * A shorthand for {@link module:engine/model/writer~Writer#restoreSelectionGravity}.
	 */
	private _restoreGravity(): void {
		this.editor.model.change( writer => {
			writer.restoreSelectionGravity( this._overrideUid! );
			this._overrideUid = null;
		} );
	}
}

/**
 * Checks whether the selection has any of given attributes.
 */
function hasAnyAttribute( selection: DocumentSelection, attributes: Set<string> ): boolean {
	for ( const observedAttribute of attributes ) {
		if ( selection.hasAttribute( observedAttribute ) ) {
			return true;
		}
	}

	return false;
}

/**
 * Applies the given attributes to the current selection using using the
 * values from the node before the current position. Uses
 * the {@link module:engine/model/writer~Writer model writer}.
 */
function setSelectionAttributesFromTheNodeBefore( model: Model, attributes: Set<string>, position: Position ) {
	const nodeBefore = position.nodeBefore;
	model.change( writer => {
		if ( nodeBefore ) {
			writer.setSelectionAttribute( nodeBefore.getAttributes() );
		} else {
			writer.removeSelectionAttribute( attributes );
		}
	} );
}

/**
 * Prevents the caret movement in the view by calling `preventDefault` on the event data.
 *
 * @alias data.preventDefault
 */
function preventCaretMovement( data: DomEventData ) {
	data.preventDefault();
}

/**
 * Checks whether the step before `isBetweenDifferentAttributes()`.
 */
function isStepAfterAnyAttributeBoundary( position: Position, attributes: Set<string> ): boolean {
	const positionBefore = position.getShiftedBy( -1 );
	return isBetweenDifferentAttributes( positionBefore, attributes );
}

/**
 * Checks whether the given position is between different values of given attributes.
 */
function isBetweenDifferentAttributes( position: Position, attributes: Set<string> ): boolean {
	const { nodeBefore, nodeAfter } = position;
	for ( const observedAttribute of attributes ) {
		const attrBefore = nodeBefore ? nodeBefore.getAttribute( observedAttribute ) : undefined;
		const attrAfter = nodeAfter ? nodeAfter.getAttribute( observedAttribute ) : undefined;

		if ( attrAfter !== attrBefore ) {
			return true;
		}
	}
	return false;
}
