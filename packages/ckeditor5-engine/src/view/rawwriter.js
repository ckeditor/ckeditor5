/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module module:engine/view/rawwriter
 */

import Element from './element';

/**
 * View raw writer class. Provides set of methods used to properly manipulate nodes attached to
 * {@link module:engine/view/view~View view instance}. It should be only used to manipulate non-semantic view
 * (view created from HTML string). For view which was downcasted from the {@link module:engine/model/model~Model model}
 * see {@link module:engine/view/writer~Writer writer}.
 */
export default class RawWriter {
	/**
	 * Clones provided element.
	 *
	 * @see module:engine/view/element~Element#_clone
	 * @param {module:engine/view/element~Element} element Element to be cloned.
	 * @param {Boolean} [deep=false] If set to `true` clones element and all its children recursively. When set to `false`,
	 * element will be cloned without any children.
	 * @returns {module:engine/view/element~Element} Clone of this element.
	 */
	clone( element, deep = false ) {
		return element._clone( deep );
	}

	/**
	 * Appends a child node or a list of child nodes at the end of this node
	 * and sets the parent of these nodes to this element.
	 *
	 * @see module:engine/view/element~Element#_appendChild
	 * @param {module:engine/view/element~Element|module:engine/view/documentfragment~DocumentFragment} element Element
	 * to which items will be appended.
	 * @param {module:engine/view/item~Item|Iterable.<module:engine/view/item~Item>} items Items to be inserted.
	 * @fires module:engine/view/node~Node#change
	 * @returns {Number} Number of appended nodes.
	 */
	appendChild( element, items ) {
		return element._appendChild( items );
	}

	/**
	 * Inserts a child node or a list of child nodes on the given index and sets the parent of these nodes to
	 * this element.
	 *
	 * @see module:engine/view/element~Element#_insertChild
	 * @param {module:engine/view/element~Element|module:engine/view/documentfragment~DocumentFragment} element Element
	 * to which items will be inserted.
	 * @param {Number} index Position where nodes should be inserted.
	 * @param {module:engine/view/item~Item|Iterable.<module:engine/view/item~Item>} items Items to be inserted.
	 * @fires module:engine/view/node~Node#change
	 * @returns {Number} Number of inserted nodes.
	 */
	insertChild( element, index, items ) {
		return element._insertChild( index, items );
	}

	/**
	 * Removes number of child nodes starting at the given index and set the parent of these nodes to `null`.
	 *
	 * @see module:engine/view/element~Element#_removeChildren
	 * @param {module:engine/view/element~Element|module:engine/view/documentfragment~DocumentFragment} element Element
	 * from which children will be removed.
	 * @param {Number} index Number of the first node to remove.
	 * @param {Number} [howMany=1] Number of nodes to remove.
	 * @fires module:engine/view/node~Node#change
	 * @returns {Array.<module:engine/view/node~Node>} The array of removed nodes.
	 */
	removeChildren( element, index, howMany = 1 ) {
		return element._removeChildren( index, howMany );
	}

	/**
	 * Removes given element from the view structure. Will not have effect on detached elements.
	 *
	 * @param {module:engine/view/element~Element} element Element which will be removed.
	 * @returns {Array.<module:engine/view/node~Node>} The array of removed nodes.
	 */
	remove( element ) {
		const parent = element.parent;
		if ( parent ) {
			return this.removeChildren( parent, parent.getChildIndex( element ) );
		}

		return [];
	}

	/**
	 * Replaces given element with the new one in the view structure. Will not have effect on detached elements.
	 *
	 * @param {module:engine/view/element~Element} oldElement Element which will be replaced.
	 * @param {module:engine/view/element~Element} newElement Element which will inserted in the place of the old element.
	 * @returns {Boolean} Whether old element was successfully replaced.
	 */
	replace( oldElement, newElement ) {
		const parent = oldElement.parent;

		if ( parent ) {
			const index = parent.getChildIndex( oldElement );

			this.removeChildren( parent, index );
			this.insertChild( parent, index, newElement );

			return true;
		}

		return false;
	}

	/**
	 * Renames element by creating a copy of renamed element but with changed name and then moving contents of the
	 * old element to the new one.
	 *
	 * Since this function creates a new element and removes the given one, the new element is returned to keep reference.
	 *
	 * @param {module:engine/view/element~Element} element Element to be renamed.
	 * @param {String} newName New name for element.
	 * @returns {module:engine/view/element~Element|null} New element or null if the old element
	 * was not replaced (happens for detached elements).
	 */
	rename( element, newName ) {
		const newElement = new Element( newName, element.getAttributes(), element.getChildren() );

		return this.replace( element, newElement ) ? newElement : null;
	}

	/**
	 * Adds or overwrite element's attribute with a specified key and value.
	 *
	 *		writer.setAttribute( linkElement, 'href', 'http://ckeditor.com' );
	 *
	 * @see module:engine/view/element~Element#_setAttribute
	 * @param {module:engine/view/element~Element} element
	 * @param {String} key Attribute key.
	 * @param {String} value Attribute value.
	 */
	setAttribute( element, key, value ) {
		element._setAttribute( key, value );
	}

	/**
	 * Removes attribute from the element.
	 *
	 *		writer.removeAttribute( linkElement, 'href' );
	 *
	 * @see module:engine/view/element~Element#_removeAttribute
	 * @param {module:engine/view/element~Element} element
	 * @param {String} key Attribute key.
	 */
	removeAttribute( element, key ) {
		element._removeAttribute( key );
	}

	/**
	 * Adds specified class to the element.
	 *
	 *		writer.addClass( linkElement, 'foo' );
	 *		writer.addClass( linkElement, [ 'foo', 'bar' ] );
	 *
	 * @see module:engine/view/element~Element#_addClass
	 * @param {module:engine/view/element~Element} element
	 * @param {Array.<String>|String} className
	 */
	addClass( element, className ) {
		element._addClass( className );
	}

	/**
	 * Removes specified class from the element.
	 *
	 *		writer.removeClass( linkElement, 'foo' );
	 *		writer.removeClass( linkElement, [ 'foo', 'bar' ] );
	 *
	 * @see module:engine/view/element~Element#_removeClass
	 * @param {module:engine/view/element~Element} element
	 * @param {Array.<String>|String} className
	 */
	removeClass( element, className ) {
		element._removeClass( className );
	}

	/**
	 * Adds style to the element.
	 *
	 *		writer.setStyle( element, 'color', 'red' );
	 *		writer.setStyle( element, {
	 *			color: 'red',
	 *			position: 'fixed'
	 *		} );
	 *
	 * @see module:engine/view/element~Element#_setStyle
	 * @param {module:engine/view/element~Element} element
	 * @param {String|Object} property Property name or object with key - value pairs.
	 * @param {String} [value] Value to set. This parameter is ignored if object is provided as the first parameter.
	 */
	setStyle( element, property, value ) {
		element._setStyle( property, value );
	}

	/**
	 * Removes specified style from the element.
	 *
	 *		writer.removeStyle( element, 'color' );  // Removes 'color' style.
	 *		writer.removeStyle( element, [ 'color', 'border-top' ] ); // Removes both 'color' and 'border-top' styles.
	 *
	 * @see module:engine/view/element~Element#_removeStyle
	 * @param {module:engine/view/element~Element} element
	 * @param {Array.<String>|String} property
	 */
	removeStyle( element, property ) {
		element._removeStyle( property );
	}

	/**
	 * Sets a custom property on element. Unlike attributes, custom properties are not rendered to the DOM,
	 * so they can be used to add special data to elements.
	 *
	 * @see module:engine/view/element~Element#_setCustomProperty
	 * @param {module:engine/view/element~Element} element
	 * @param {String|Symbol} key
	 * @param {*} value
	 */
	setCustomProperty( element, key, value ) {
		element._setCustomProperty( key, value );
	}

	/**
	 * Removes a custom property stored under the given key.
	 *
	 * @see module:engine/view/element~Element#_removeCustomProperty
	 * @param {module:engine/view/element~Element} element
	 * @param {String|Symbol} key
	 * @returns {Boolean} Returns true if property was removed.
	 */
	removeCustomProperty( element, key ) {
		return element._removeCustomProperty( key );
	}
}
