/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/rawelement
 */

import Element from './element';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import Node from './node';

/**
 * The raw element class.
 *
 * It is used to represent elements that TODO.
 *
 * To create a new raw element use the
 * {@link module:engine/view/downcastwriter~DowncastWriter#createRawElement `downcastWriter#createRawElement()`} method.
 *
 * @extends module:engine/view/element~Element
 */
export default class RawElement extends Element {
	/**
	 * Creates new instance of RawElement.
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-rawelement-cannot-add` when `children` parameter
	 * is passed, to inform that usage of `RawElement` is incorrect (adding child nodes to `RawElement` is forbidden).
	 *
	 * @see module:engine/view/downcastwriter~DowncastWriter#createRawElement
	 * @protected
	 * @param {module:engine/view/document~Document} document The document instance to which this element belongs.
	 * @param {String} name Node name.
	 * @param {Object|Iterable} [attrs] Collection of attributes.
	 * @param {module:engine/view/node~Node|Iterable.<module:engine/view/node~Node>} [children]
	 * A list of nodes to be inserted into created element.
	 */
	constructor( document, name, attrs, children ) {
		super( document, name, attrs, children );

		/**
		 * Returns `null` because filler is not needed for RawElements.
		 *
		 * @method #getFillerOffset
		 * @returns {null} Always returns null.
		 */
		this.getFillerOffset = getFillerOffset;
	}

	/**
	 * Checks whether this object is of the given type or name.
	 *
	 *		rawElement.is( 'rawElement' ); // -> true
	 *		rawElement.is( 'element' ); // -> true
	 *		rawElement.is( 'node' ); // -> true
	 *		rawElement.is( 'view:rawElement' ); // -> true
	 *		rawElement.is( 'view:element' ); // -> true
	 *		rawElement.is( 'view:node' ); // -> true
	 *
	 *		rawElement.is( 'model:element' ); // -> false
	 *		rawElement.is( 'documentFragment' ); // -> false
	 *
	 * Assuming that the object being checked is a raw element, you can also check its
	 * {@link module:engine/view/rawelement~RawElement#name name}:
	 *
	 *		rawElement.is( 'img' ); // -> true if this is a img element
	 *		rawElement.is( 'rawElement', 'img' ); // -> same as above
	 *		text.is( 'img' ); -> false
	 *
	 * {@link module:engine/view/node~Node#is Check the entire list of view objects} which implement the `is()` method.
	 *
	 * @param {String} type Type to check when `name` parameter is present.
	 * Otherwise, it acts like the `name` parameter.
	 * @param {String} [name] Element name.
	 * @returns {Boolean}
	 */
	is( type, name = null ) {
		if ( !name ) {
			return type === 'rawElement' || type === 'view:rawElement' ||
				// From super.is(). This is highly utilised method and cannot call super. See ckeditor/ckeditor5#6529.
				type === this.name || type === 'view:' + this.name ||
				type === 'element' || type === 'view:element' ||
				type === 'node' || type === 'view:node';
		} else {
			return name === this.name && (
				type === 'rawElement' || type === 'view:rawElement' ||
				type === 'element' || type === 'view:element'
			);
		}
	}

	/**
	 * Overrides {@link module:engine/view/element~Element#_insertChild} method.
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-rawelement-cannot-add` to prevent
	 * adding any child nodes to a `RawElement`.
	 *
	 * @protected
	 */
	_insertChild( index, nodes ) {
		if ( nodes && ( nodes instanceof Node || Array.from( nodes ).length > 0 ) ) {
			/**
			 * Cannot add children to a {@link module:engine/view/rawelement~RawElement}.
			 *
			 * @error view-rawelement-cannot-add
			 */
			throw new CKEditorError(
				'view-rawelement-cannot-add: Cannot add child nodes to RawElement instance.',
				[ this, nodes ]
			);
		}
	}

	/**
	 * Renders this {@link module:engine/view/rawelement~RawElement} to DOM. This method is called by
	 * {@link module:engine/view/domconverter~DomConverter}.
	 * Do not use inheritance to create custom rendering method, replace `render()` method instead:
	 *
	 *		const myRawElement = downcastWriter.createRawElement( 'span' );
	 *
	 *		myRawElement.render = function( domDocument ) {
	 *			const domElement = this.toDomElement( domDocument );
	 *			domElement.innerHTML = '<b>this is ui element</b>';
	 *
	 *			return domElement;
	 *		};
	 *
	 * If changes in your raw element should trigger some editor UI update you should call
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
	 * Creates DOM element based on this view `RawElement`.
	 *
	 * **Note**: Each time this method is called new DOM element is created.
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

// Returns `null` because block filler is not needed for RawElements.
//
// @returns {null}
function getFillerOffset() {
	return null;
}
