/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module module:engine/view/upcastwriter
 */

import DocumentFragment from './documentfragment';
import Element from './element';
import Text from './text';
import { isPlainObject } from 'lodash-es';

/**
 * View upcast writer class. Provides set of methods used to properly manipulate nodes attached to
 * {@link module:engine/view/view~View view instance}. It should be only used to manipulate non-semantic view
 * (view created from HTML string). For view which was downcasted from the {@link module:engine/model/model~Model model}
 * see {@link module:engine/view/downcastwriter~DowncastWriter writer}.
 */
export default class UpcastWriter {
	/**
	 * Creates new {@link module:engine/view/documentfragment~DocumentFragment}.
	 *
	 * @see module:engine/view/documentfragment~DocumentFragment#constructor
	 * @param {module:engine/view/node~Node|Iterable.<module:engine/view/node~Node>} [children]
	 * List of nodes to be inserted into created document fragment.
	 * @returns {module:engine/view/documentfragment~DocumentFragment} Created document fragment.
	 */
	createDocumentFragment( children ) {
		return new DocumentFragment( children );
	}

	/**
	 * Creates new {@link module:engine/view/element~Element}.
	 *
	 * Attributes can be passed in various formats:
	 *
	 *		new Element( 'div', { 'class': 'editor', 'contentEditable': 'true' } ); // object
	 *		new Element( 'div', [ [ 'class', 'editor' ], [ 'contentEditable', 'true' ] ] ); // map-like iterator
	 *		new Element( 'div', mapOfAttributes ); // map
	 *
	 * @see module:engine/view/element~Element#constructor
	 * @param {String} name Node name.
	 * @param {Object|Iterable} [attrs] Collection of attributes.
	 * @param {module:engine/view/node~Node|Iterable.<module:engine/view/node~Node>} [children]
	 * List of nodes to be inserted into created element.
	 * @returns {module:engine/view/element~Element} Created element.
	 */
	createElement( name, attrs, children ) {
		return new Element( name, attrs, children );
	}

	/**
	 * Creates new {@link module:engine/view/text~Text}.
	 *
	 * @see module:engine/view/text~Text#constructor
	 * @param {String} data Text
	 * @returns {module:engine/view/text~Text} Created text.
	 */
	createText( data ) {
		return new Text( data );
	}

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
	 * @param {module:engine/view/item~Item|Iterable.<module:engine/view/item~Item>} items Items to be inserted.
	 * @param {module:engine/view/element~Element|module:engine/view/documentfragment~DocumentFragment} element Element
	 * to which items will be appended.
	 * @fires module:engine/view/node~Node#event:change
	 * @returns {Number} Number of appended nodes.
	 */
	appendChild( items, element ) {
		return element._appendChild( items );
	}

	/**
	 * Inserts a child node or a list of child nodes on the given index and sets the parent of these nodes to
	 * this element.
	 *
	 * @see module:engine/view/element~Element#_insertChild
	 * @param {Number} index Offset at which nodes should be inserted.
	 * @param {module:engine/view/item~Item|Iterable.<module:engine/view/item~Item>} items Items to be inserted.
	 * @param {module:engine/view/element~Element|module:engine/view/documentfragment~DocumentFragment} element Element
	 * to which items will be inserted.
	 * @fires module:engine/view/node~Node#event:change
	 * @returns {Number} Number of inserted nodes.
	 */
	insertChild( index, items, element ) {
		return element._insertChild( index, items );
	}

	/**
	 * Removes number of child nodes starting at the given index and set the parent of these nodes to `null`.
	 *
	 * @see module:engine/view/element~Element#_removeChildren
	 * @param {Number} index Offset from which nodes will be removed.
	 * @param {Number} howMany Number of nodes to remove.
	 * @param {module:engine/view/element~Element|module:engine/view/documentfragment~DocumentFragment} element Element
	 * which children will be removed.
	 * @fires module:engine/view/node~Node#event:change
	 * @returns {Array.<module:engine/view/node~Node>} The array containing removed nodes.
	 */
	removeChildren( index, howMany, element ) {
		return element._removeChildren( index, howMany );
	}

	/**
	 * Removes given element from the view structure. Will not have effect on detached elements.
	 *
	 * @param {module:engine/view/element~Element} element Element which will be removed.
	 * @returns {Array.<module:engine/view/node~Node>} The array containing removed nodes.
	 */
	remove( element ) {
		const parent = element.parent;

		if ( parent ) {
			return this.removeChildren( parent.getChildIndex( element ), 1, parent );
		}

		return [];
	}

	/**
	 * Replaces given element with the new one in the view structure. Will not have effect on detached elements.
	 *
	 * @param {module:engine/view/element~Element} oldElement Element which will be replaced.
	 * @param {module:engine/view/element~Element} newElement Element which will be inserted in the place of the old element.
	 * @returns {Boolean} Whether old element was successfully replaced.
	 */
	replace( oldElement, newElement ) {
		const parent = oldElement.parent;

		if ( parent ) {
			const index = parent.getChildIndex( oldElement );

			this.removeChildren( index, 1, parent );
			this.insertChild( index, newElement, parent );

			return true;
		}

		return false;
	}

	/**
	 * Renames element by creating a copy of a given element but with its name changed and then moving contents of the
	 * old element to the new one.
	 *
	 * Since this function creates a new element and removes the given one, the new element is returned to keep reference.
	 *
	 * @param {String} newName New element name.
	 * @param {module:engine/view/element~Element} element Element to be renamed.
	 * @returns {module:engine/view/element~Element|null} New element or null if the old element
	 * was not replaced (happens for detached elements).
	 */
	rename( newName, element ) {
		const newElement = new Element( newName, element.getAttributes(), element.getChildren() );

		return this.replace( element, newElement ) ? newElement : null;
	}

	/**
	 * Adds or overwrites element's attribute with a specified key and value.
	 *
	 *		writer.setAttribute( linkElement, 'href', 'http://ckeditor.com' );
	 *
	 * @see module:engine/view/element~Element#_setAttribute
	 * @param {String} key Attribute key.
	 * @param {String} value Attribute value.
	 * @param {module:engine/view/element~Element} element Element for which attribute will be set.
	 */
	setAttribute( key, value, element ) {
		element._setAttribute( key, value );
	}

	/**
	 * Removes attribute from the element.
	 *
	 *		writer.removeAttribute( linkElement, 'href' );
	 *
	 * @see module:engine/view/element~Element#_removeAttribute
	 * @param {String} key Attribute key.
	 * @param {module:engine/view/element~Element} element Element from which attribute will be removed.
	 */
	removeAttribute( key, element ) {
		element._removeAttribute( key );
	}

	/**
	 * Adds specified class to the element.
	 *
	 *		writer.addClass( linkElement, 'foo' );
	 *		writer.addClass( linkElement, [ 'foo', 'bar' ] );
	 *
	 * @see module:engine/view/element~Element#_addClass
	 * @param {Array.<String>|String} className Single class name or array of class names which will be added.
	 * @param {module:engine/view/element~Element} element Element for which class will be added.
	 */
	addClass( className, element ) {
		element._addClass( className );
	}

	/**
	 * Removes specified class from the element.
	 *
	 *		writer.removeClass( linkElement, 'foo' );
	 *		writer.removeClass( linkElement, [ 'foo', 'bar' ] );
	 *
	 * @see module:engine/view/element~Element#_removeClass
	 * @param {Array.<String>|String} className Single class name or array of class names which will be removed.
	 * @param {module:engine/view/element~Element} element Element from which class will be removed.
	 */
	removeClass( className, element ) {
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
	 * @param {String|Object} property Property name or object with key - value pairs.
	 * @param {String} [value] Value to set. This parameter is ignored if object is provided as the first parameter.
	 * @param {module:engine/view/element~Element} element Element for which style will be added.
	 */
	setStyle( property, value, element ) {
		if ( isPlainObject( property ) && element === undefined ) {
			element = value;
		}
		element._setStyle( property, value );
	}

	/**
	 * Removes specified style from the element.
	 *
	 *		writer.removeStyle( element, 'color' );  // Removes 'color' style.
	 *		writer.removeStyle( element, [ 'color', 'border-top' ] ); // Removes both 'color' and 'border-top' styles.
	 *
	 * @see module:engine/view/element~Element#_removeStyle
	 * @param {Array.<String>|String} property Style property name or names to be removed.
	 * @param {module:engine/view/element~Element} element Element from which style will be removed.
	 */
	removeStyle( property, element ) {
		element._removeStyle( property );
	}

	/**
	 * Sets a custom property on element. Unlike attributes, custom properties are not rendered to the DOM,
	 * so they can be used to add special data to elements.
	 *
	 * @see module:engine/view/element~Element#_setCustomProperty
	 * @param {String|Symbol} key Custom property name/key.
	 * @param {*} value Custom property value to be stored.
	 * @param {module:engine/view/element~Element} element Element for which custom property will be set.
	 */
	setCustomProperty( key, value, element ) {
		element._setCustomProperty( key, value );
	}

	/**
	 * Removes a custom property stored under the given key.
	 *
	 * @see module:engine/view/element~Element#_removeCustomProperty
	 * @param {String|Symbol} key Name/key of the custom property to be removed.
	 * @param {module:engine/view/element~Element} element Element from which the custom property will be removed.
	 * @returns {Boolean} Returns true if property was removed.
	 */
	removeCustomProperty( key, element ) {
		return element._removeCustomProperty( key );
	}
}
