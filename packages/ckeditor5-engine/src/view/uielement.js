/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/uielement
 */

import Element from './element';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import Node from './node';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

/**
 * UI element class. It should be used to represent editing UI which needs to be injected into the editing view
 * If possible, you should keep your UI outside the editing view. However, if that is not possible,
 * UI elements can be used.
 *
 * How a UI element is rendered is in your control (you pass a callback to
 * {@link module:engine/view/downcastwriter~DowncastWriter#createUIElement `downcastWriter#createUIElement()`}).
 * The editor will ignore your UI element – the selection cannot be placed in it, it is skipped (invisible) when
 * the user modifies the selection by using arrow keys and the editor does not listen to any mutations which
 * happen inside your UI elements.
 *
 * The limitation is that you cannot convert a model element to a UI element. UI elements need to be
 * created for {@link module:engine/model/markercollection~Marker markers} or as additinal elements
 * inside normal {@link module:engine/view/containerelement~ContainerElement container elements}.
 *
 * To create a new UI element use the
 * {@link module:engine/view/downcastwriter~DowncastWriter#createUIElement `downcastWriter#createUIElement()`} method.
 *
 * @extends module:engine/view/element~Element
 */
export default class UIElement extends Element {
	/**
	 * Creates new instance of UIElement.
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-uielement-cannot-add` when third parameter is passed,
	 * to inform that usage of UIElement is incorrect (adding child nodes to UIElement is forbidden).
	 *
	 * @see module:engine/view/downcastwriter~DowncastWriter#createUIElement
	 * @protected
	 * @param {module:engine/view/document~Document} document The document instance to which this element belongs.
	 * @param {String} name Node name.
	 * @param {Object|Iterable} [attributes] Collection of attributes.
	 * @param {module:engine/view/node~Node|Iterable.<module:engine/view/node~Node>} [children]
	 * A list of nodes to be inserted into created element.
	 */
	constructor( document, name, attributes, children ) {
		super( document, name, attributes, children );

		/**
		 * Returns `null` because filler is not needed for UIElements.
		 *
		 * @method #getFillerOffset
		 * @returns {null} Always returns null.
		 */
		this.getFillerOffset = getFillerOffset;
	}

	/**
	 * Checks whether this object is of the given.
	 *
	 *		uiElement.is( 'uiElement' ); // -> true
	 *		uiElement.is( 'element' ); // -> true
	 *		uiElement.is( 'node' ); // -> true
	 *		uiElement.is( 'view:uiElement' ); // -> true
	 *		uiElement.is( 'view:element' ); // -> true
	 *		uiElement.is( 'view:node' ); // -> true
	 *
	 *		uiElement.is( 'model:element' ); // -> false
	 *		uiElement.is( 'documentFragment' ); // -> false
	 *
	 * Assuming that the object being checked is an ui element, you can also check its
	 * {@link module:engine/view/uielement~UIElement#name name}:
	 *
	 *		uiElement.is( 'element', 'span' ); // -> true if this is a span ui element
	 *		uiElement.is( 'uiElement', 'span' ); // -> same as above
	 *		text.is( 'element', 'span' ); -> false
	 *
	 * {@link module:engine/view/node~Node#is Check the entire list of view objects} which implement the `is()` method.
	 *
	 * @param {String} type Type to check.
	 * @param {String} [name] Element name.
	 * @returns {Boolean}
	 */
	is( type, name = null ) {
		if ( !name ) {
			return type === 'uiElement' || type === 'view:uiElement' ||
				// From super.is(). This is highly utilised method and cannot call super. See ckeditor/ckeditor5#6529.
				type === 'element' || type === 'view:element' ||
				type === 'node' || type === 'view:node';
		} else {
			return name === this.name && (
				type === 'uiElement' || type === 'view:uiElement' ||
				type === 'element' || type === 'view:element'
			);
		}
	}

	/**
	 * Overrides {@link module:engine/view/element~Element#_insertChild} method.
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-uielement-cannot-add` to prevent adding any child nodes
	 * to UIElement.
	 *
	 * @protected
	 */
	_insertChild( index, nodes ) {
		if ( nodes && ( nodes instanceof Node || Array.from( nodes ).length > 0 ) ) {
			/**
			 * Cannot add children to {@link module:engine/view/uielement~UIElement}.
			 *
			 * @error view-uielement-cannot-add
			 */
			throw new CKEditorError( 'view-uielement-cannot-add', this );
		}
	}

	/**
	 * Renders this {@link module:engine/view/uielement~UIElement} to DOM. This method is called by
	 * {@link module:engine/view/domconverter~DomConverter}.
	 * Do not use inheritance to create custom rendering method, replace `render()` method instead:
	 *
	 *		const myUIElement = downcastWriter.createUIElement( 'span' );
	 *		myUIElement.render = function( domDocument ) {
	 *			const domElement = this.toDomElement( domDocument );
	 *			domElement.innerHTML = '<b>this is ui element</b>';
	 *
	 *			return domElement;
	 *		};
	 *
	 * If changes in your UI element should trigger some editor UI update you should call
	 * the {@link module:core/editor/editorui~EditorUI#update `editor.ui.update()`} method
	 * after rendering your UI element.
	 *
	 * @param {Document} domDocument
	 * @returns {HTMLElement}
	 */
	render( domDocument ) {
		return this.toDomElement( domDocument );
	}

	/**
	 * Creates DOM element based on this view UIElement.
	 * Note that each time this method is called new DOM element is created.
	 *
	 * @param {Document} domDocument
	 * @returns {HTMLElement}
	 */
	toDomElement( domDocument ) {
		const domElement = domDocument.createElement( this.name );

		for ( const key of this.getAttributeKeys() ) {
			domElement.setAttribute( key, this.getAttribute( key ) );
		}

		return domElement;
	}
}

/**
 * This function injects UI element handling to the given {@link module:engine/view/document~Document document}.
 *
 * A callback is added to {@link module:engine/view/document~Document#event:keydown document keydown event}.
 * The callback handles the situation when right arrow key is pressed and selection is collapsed before a UI element.
 * Without this handler, it would be impossible to "jump over" UI element using right arrow key.
 *
 * @param {module:engine/view/view~View} view View controller to which the quirks handling will be injected.
 */
export function injectUiElementHandling( view ) {
	view.document.on( 'keydown', ( evt, data ) => jumpOverUiElement( evt, data, view.domConverter ) );
}

// Returns `null` because block filler is not needed for UIElements.
//
// @returns {null}
function getFillerOffset() {
	return null;
}

// Selection cannot be placed in a `UIElement`. Whenever it is placed there, it is moved before it. This
// causes a situation when it is impossible to jump over `UIElement` using right arrow key, because the selection
// ends up in ui element (in DOM) and is moved back to the left. This handler fixes this situation.
function jumpOverUiElement( evt, data, domConverter ) {
	if ( data.keyCode == keyCodes.arrowright ) {
		const domSelection = data.domTarget.ownerDocument.defaultView.getSelection();
		const domSelectionCollapsed = domSelection.rangeCount == 1 && domSelection.getRangeAt( 0 ).collapsed;

		// Jump over UI element if selection is collapsed or shift key is pressed. These are the cases when selection would extend.
		if ( domSelectionCollapsed || data.shiftKey ) {
			const domParent = domSelection.focusNode;
			const domOffset = domSelection.focusOffset;

			const viewPosition = domConverter.domPositionToView( domParent, domOffset );

			// In case if dom element is not converted to view or is not mapped or something. Happens for example in some tests.
			if ( viewPosition === null ) {
				return;
			}

			// Skip all following ui elements.
			let jumpedOverAnyUiElement = false;

			const nextViewPosition = viewPosition.getLastMatchingPosition( value => {
				if ( value.item.is( 'uiElement' ) ) {
					// Remember that there was at least one ui element.
					jumpedOverAnyUiElement = true;
				}

				// Jump over ui elements, jump over empty attribute elements, move up from inside of attribute element.
				if ( value.item.is( 'uiElement' ) || value.item.is( 'attributeElement' ) ) {
					return true;
				}

				// Don't jump over text or don't get out of container element.
				return false;
			} );

			// If anything has been skipped, fix position.
			// This `if` could be possibly omitted but maybe it is better not to mess with DOM selection if not needed.
			if ( jumpedOverAnyUiElement ) {
				const newDomPosition = domConverter.viewPositionToDom( nextViewPosition );

				if ( domSelectionCollapsed ) {
					// Selection was collapsed, so collapse it at further position.
					domSelection.collapse( newDomPosition.parent, newDomPosition.offset );
				} else {
					// Selection was not collapse, so extend it instead of collapsing.
					domSelection.extend( newDomPosition.parent, newDomPosition.offset );
				}
			}
		}
	}
}
