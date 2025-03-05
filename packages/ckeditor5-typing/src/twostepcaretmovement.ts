/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module typing/twostepcaretmovement
 */

import { Plugin, type Editor } from '@ckeditor/ckeditor5-core';

import { keyCodes } from '@ckeditor/ckeditor5-utils';

import {
	MouseObserver,
	TouchObserver,
	type DocumentSelection,
	type DocumentSelectionChangeRangeEvent,
	type DomEventData,
	type Model,
	type Position,
	type ViewDocumentArrowKeyEvent,
	type ViewDocumentMouseDownEvent,
	type ViewDocumentSelectionChangeEvent,
	type ViewDocumentTouchStartEvent,
	type ModelInsertContentEvent,
	type ModelDeleteContentEvent
} from '@ckeditor/ckeditor5-engine';

import type { ViewDocumentDeleteEvent } from './deleteobserver.js';

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

	private _isNextGravityRestorationSkipped = false;

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TwoStepCaretMovement' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
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

		// The automatic gravity restoration logic.
		this.listenTo<DocumentSelectionChangeRangeEvent>( modelSelection, 'change:range', ( evt, data ) => {
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

		// Handle a click at the beginning/end of a two-step element.
		this._enableClickingAfterNode();

		// Change the attributes of the selection in certain situations after the two-step node was inserted into the document.
		this._enableInsertContentSelectionAttributesFixer();

		// Handle removing the content after the two-step node.
		this._handleDeleteContentAfterNode();
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
	 * @internal
	 * @param eventData Data of the key press.
	 * @returns `true` when the handler prevented caret movement.
	 */
	public _handleForwardMovement( eventData?: DomEventData ): boolean {
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
			if ( eventData ) {
				preventCaretMovement( eventData );
			}

			// CLEAR 2-SCM attributes if we are at the end of one 2-SCM and before
			// the next one with a different value of the same attribute.
			//
			//		<paragraph>foo<$text attribute=1>bar{}</$text><$text attribute=2>bar</$text>baz</paragraph>
			//
			if (
				hasAnyAttribute( selection, attributes ) &&
				isBetweenDifferentAttributes( position, attributes, true )
			) {
				clearSelectionAttributes( model, attributes );
			} else {
				this._overrideGravity();
			}

			return true;
		}

		return false;
	}

	/**
	 * Updates the document selection and the view according to the two–step caret movement state
	 * when moving **backwards**. Executed upon `keypress` in the {@link module:engine/view/view~View}.
	 *
	 * @internal
	 * @param eventData Data of the key press.
	 * @returns `true` when the handler prevented caret movement
	 */
	public _handleBackwardMovement( eventData?: DomEventData ): boolean {
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
			if ( eventData ) {
				preventCaretMovement( eventData );
			}

			this._restoreGravity();

			// CLEAR 2-SCM attributes if we are at the end of one 2-SCM and before
			// the next one with a different value of the same attribute.
			//
			//		<paragraph>foo<$text attribute=1>bar</$text><$text attribute=2>{}bar</$text>baz</paragraph>
			//
			if ( isBetweenDifferentAttributes( position, attributes, true ) ) {
				clearSelectionAttributes( model, attributes );
			} else {
				setSelectionAttributesFromTheNodeBefore( model, attributes, position );
			}

			return true;
		} else {
			// REMOVE SELECTION ATTRIBUTE when restoring gravity towards a non-existent content at the
			// beginning of the block.
			//
			// 		<paragraph>{}<$text attribute>bar</$text></paragraph>
			//
			if ( position.isAtStart ) {
				if ( hasAnyAttribute( selection, attributes ) ) {
					if ( eventData ) {
						preventCaretMovement( eventData );
					}

					setSelectionAttributesFromTheNodeBefore( model, attributes, position );

					return true;
				}

				return false;
			}

			// SET 2-SCM attributes if we are between nodes with the same attribute but with different values.
			//
			//		<paragraph>foo<$text attribute=1>bar</$text>[]<$text attribute=2>bar</$text>baz</paragraph>
			//
			if (
				!hasAnyAttribute( selection, attributes ) &&
				isBetweenDifferentAttributes( position, attributes, true )
			) {
				if ( eventData ) {
					preventCaretMovement( eventData );
				}

				setSelectionAttributesFromTheNodeBefore( model, attributes, position );

				return true;
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
					if ( eventData ) {
						preventCaretMovement( eventData );
					}

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
	 * Starts listening to {@link module:engine/view/document~Document#event:mousedown} and
	 * {@link module:engine/view/document~Document#event:selectionChange} and puts the selection before/after a 2-step node
	 * if clicked at the beginning/ending of the 2-step node.
	 *
	 * The purpose of this action is to allow typing around the 2-step node directly after a click.
	 *
	 * See https://github.com/ckeditor/ckeditor5/issues/1016.
	 */
	private _enableClickingAfterNode(): void {
		const editor = this.editor;
		const model = editor.model;
		const selection = model.document.selection;
		const document = editor.editing.view.document;

		editor.editing.view.addObserver( MouseObserver );
		editor.editing.view.addObserver( TouchObserver );

		let touched = false;
		let clicked = false;

		// This event should be fired before selection on mobile devices.
		this.listenTo<ViewDocumentTouchStartEvent>( document, 'touchstart', () => {
			clicked = false;
			touched = true;
		} );

		// Track mouse click event.
		// Keep in mind that it's often called after the selection change on iOS devices.
		// On the Android devices, it's called before the selection change.
		// That's why we watch `touchstart` event on mobile and set `touched` flag, as it's fired before the selection change.
		// See more: https://github.com/ckeditor/ckeditor5/issues/17171
		this.listenTo<ViewDocumentMouseDownEvent>( document, 'mousedown', () => {
			clicked = true;
		} );

		// When the selection has changed...
		this.listenTo<ViewDocumentSelectionChangeEvent>( document, 'selectionChange', () => {
			const attributes = this.attributes;

			if ( !clicked && !touched ) {
				return;
			}

			// ...and it was caused by the click or touch...
			clicked = false;
			touched = false;

			// ...and no text is selected...
			if ( !selection.isCollapsed ) {
				return;
			}

			// ...and clicked text is the 2-step node...
			if ( !hasAnyAttribute( selection, attributes ) ) {
				return;
			}

			const position = selection.getFirstPosition()!;

			if ( !isBetweenDifferentAttributes( position, attributes ) ) {
				return;
			}

			// The selection at the start of a block would use surrounding attributes
			// from text after the selection so just clear 2-SCM attributes.
			//
			// Also, clear attributes for selection between same attribute with different values.
			if (
				position.isAtStart ||
				isBetweenDifferentAttributes( position, attributes, true )
			) {
				clearSelectionAttributes( model, attributes );
			}
			else if ( !this._isGravityOverridden ) {
				this._overrideGravity();
			}
		} );
	}

	/**
	 * Starts listening to {@link module:engine/model/model~Model#event:insertContent} and corrects the model
	 * selection attributes if the selection is at the end of a two-step node after inserting the content.
	 *
	 * The purpose of this action is to improve the overall UX because the user is no longer "trapped" by the
	 * two-step attribute of the selection, and they can type a "clean" (`linkHref`–less) text right away.
	 *
	 * See https://github.com/ckeditor/ckeditor5/issues/6053.
	 */
	private _enableInsertContentSelectionAttributesFixer(): void {
		const editor = this.editor;
		const model = editor.model;
		const selection = model.document.selection;
		const attributes = this.attributes;

		this.listenTo<ModelInsertContentEvent>( model, 'insertContent', () => {
			const position = selection.getFirstPosition()!;

			if (
				hasAnyAttribute( selection, attributes ) &&
				isBetweenDifferentAttributes( position, attributes )
			) {
				clearSelectionAttributes( model, attributes );
			}
		}, { priority: 'low' } );
	}

	/**
	 * Starts listening to {@link module:engine/model/model~Model#deleteContent} and checks whether
	 * removing a content right after the tow-step attribute.
	 *
	 * If so, the selection should not preserve the two-step attribute. However, if
	 * the {@link module:typing/twostepcaretmovement~TwoStepCaretMovement} plugin is active and
	 * the selection has the two-step attribute due to overridden gravity (at the end), the two-step attribute should stay untouched.
	 *
	 * The purpose of this action is to allow removing the link text and keep the selection outside the link.
	 *
	 * See https://github.com/ckeditor/ckeditor5/issues/7521.
	 */
	private _handleDeleteContentAfterNode(): void {
		const editor = this.editor;
		const model = editor.model;
		const selection = model.document.selection;
		const view = editor.editing.view;

		let isBackspace = false;
		let shouldPreserveAttributes = false;

		// Detect pressing `Backspace`.
		this.listenTo<ViewDocumentDeleteEvent>( view.document, 'delete', ( evt, data ) => {
			isBackspace = data.direction === 'backward';
		}, { priority: 'high' } );

		// Before removing the content, check whether the selection is inside a two-step attribute.
		// If so, we want to preserve those attributes.
		this.listenTo<ModelDeleteContentEvent>( model, 'deleteContent', () => {
			if ( !isBackspace ) {
				return;
			}

			const position = selection.getFirstPosition()!;

			shouldPreserveAttributes = hasAnyAttribute( selection, this.attributes ) &&
				!isStepAfterAnyAttributeBoundary( position, this.attributes );
		}, { priority: 'high' } );

		// After removing the content, check whether the current selection should preserve the `linkHref` attribute.
		this.listenTo<ModelDeleteContentEvent>( model, 'deleteContent', () => {
			if ( !isBackspace ) {
				return;
			}

			isBackspace = false;

			// Do not escape two-step attribute if it was inside it before content deletion.
			if ( shouldPreserveAttributes ) {
				return;
			}

			// Use `model.enqueueChange()` in order to execute the callback at the end of the changes process.
			editor.model.enqueueChange( () => {
				const position = selection.getFirstPosition()!;

				if (
					hasAnyAttribute( selection, this.attributes ) &&
					isBetweenDifferentAttributes( position, this.attributes )
				) {
					if ( position.isAtStart || isBetweenDifferentAttributes( position, this.attributes, true ) ) {
						clearSelectionAttributes( model, this.attributes );
					}
					else if ( !this._isGravityOverridden ) {
						this._overrideGravity();
					}
				}
			} );
		}, { priority: 'low' } );
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
			const attributes: Array<[string, unknown]> = [];
			const isInlineObject = model.schema.isObject( nodeBefore ) && model.schema.isInline( nodeBefore );

			for ( const [ key, value ] of nodeBefore.getAttributes() ) {
				if (
					model.schema.checkAttribute( '$text', key ) &&
					( !isInlineObject || model.schema.getAttributeProperties( key ).copyFromObject !== false )
				) {
					attributes.push( [ key, value ] );
				}
			}

			writer.setSelectionAttribute( attributes );
		} else {
			writer.removeSelectionAttribute( attributes );
		}
	} );
}

/**
 * Removes 2-SCM attributes from the selection.
 */
function clearSelectionAttributes( model: Model, attributes: Set<string> ) {
	model.change( writer => {
		writer.removeSelectionAttribute( attributes );
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
function isBetweenDifferentAttributes( position: Position, attributes: Set<string>, isStrict: boolean = false ): boolean {
	const { nodeBefore, nodeAfter } = position;

	for ( const observedAttribute of attributes ) {
		const attrBefore = nodeBefore ? nodeBefore.getAttribute( observedAttribute ) : undefined;
		const attrAfter = nodeAfter ? nodeAfter.getAttribute( observedAttribute ) : undefined;

		if ( isStrict && ( attrBefore === undefined || attrAfter === undefined ) ) {
			continue;
		}

		if ( attrAfter !== attrBefore ) {
			return true;
		}
	}

	return false;
}
