/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module module:engine/view/upcastwriter
 */

import DocumentFragment from './documentfragment';
import Element from './element';
import Text from './text';
import { isPlainObject } from 'lodash-es';
import Position from './position';
import Range from './range';
import Selection from './selection';

/**
 * View upcast writer. It provides a set of methods used to manipulate non-semantic view trees.
 *
 * It should be used only while working on a non-semantic view
 * (e.g. a view created from HTML string on paste).
 * To manipulate a view which was or is being downcasted from the the model use the
 * {@link module:engine/view/downcastwriter~DowncastWriter downcast writer}.
 *
 * Read more about changing the view in the {@glink framework/architecture/editing-engine#changing-the-view Changing the view}
 * section of the {@glink framework/architecture/editing-engine Editing engine architecture} guide.
 *
 * Unlike `DowncastWriter`, which is available in the {@link module:engine/view/view~View#change `View#change()`} block,
 * `UpcastWriter` can be created wherever you need it:
 *
 *		const writer = new UpcastWriter( viewDocument );
 *		const text = writer.createText( 'foo!' );
 *
 *		writer.appendChild( text, someViewElement );
 */
export default class UpcastWriter {
	/**
	 * @param {module:engine/view/document~Document} document The view document instance in which this upcast writer operates.
	 */
	constructor( document ) {
		/**
		 * The view document instance in which this upcast writer operates.
		 *
		 * @readonly
		 * @type {module:engine/view/document~Document}
		 */
		this.document = document;
	}

	/**
	 * Creates a new {@link module:engine/view/documentfragment~DocumentFragment} instance.
	 *
	 * @param {module:engine/view/node~Node|Iterable.<module:engine/view/node~Node>} [children]
	 * A list of nodes to be inserted into the created document fragment.
	 * @returns {module:engine/view/documentfragment~DocumentFragment} The created document fragment.
	 */
	createDocumentFragment( children ) {
		return new DocumentFragment( this.document, children );
	}

	/**
	 * Creates a new {@link module:engine/view/element~Element} instance.
	 *
	 * Attributes can be passed in various formats:
	 *
	 *		upcastWriter.createElement( 'div', { class: 'editor', contentEditable: 'true' } ); // object
	 *		upcastWriter.createElement( 'div', [ [ 'class', 'editor' ], [ 'contentEditable', 'true' ] ] ); // map-like iterator
	 *		upcastWriter.createElement( 'div', mapOfAttributes ); // map
	 *
	 * @param {String} name Node name.
	 * @param {Object|Iterable} [attrs] Collection of attributes.
	 * @param {module:engine/view/node~Node|Iterable.<module:engine/view/node~Node>} [children]
	 * A list of nodes to be inserted into created element.
	 * @returns {module:engine/view/element~Element} Created element.
	 */
	createElement( name, attrs, children ) {
		return new Element( this.document, name, attrs, children );
	}

	/**
	 * Creates a new {@link module:engine/view/text~Text} instance.
	 *
	 * @param {String} data The text's data.
	 * @returns {module:engine/view/text~Text} The created text node.
	 */
	createText( data ) {
		return new Text( this.document, data );
	}

	/**
	 * Clones the provided element.
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
	 * Removes the given number of child nodes starting at the given index and set the parent of these nodes to `null`.
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
	 * Removes given element from view structure and places its children in its position.
	 * It does nothing if element has no parent.
	 *
	 * @param {module:engine/view/element~Element} element Element to unwrap.
	 */
	unwrapElement( element ) {
		const parent = element.parent;

		if ( parent ) {
			const index = parent.getChildIndex( element );

			this.remove( element );
			this.insertChild( index, element.getChildren(), parent );
		}
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
		const newElement = new Element( this.document, newName, element.getAttributes(), element.getChildren() );

		return this.replace( element, newElement ) ? newElement : null;
	}

	/**
	 * Adds or overwrites element's attribute with a specified key and value.
	 *
	 *		writer.setAttribute( 'href', 'http://ckeditor.com', linkElement );
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
	 *		writer.removeAttribute( 'href', linkElement );
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
	 *		writer.addClass( 'foo', linkElement );
	 *		writer.addClass( [ 'foo', 'bar' ], linkElement );
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
	 *		writer.removeClass( 'foo', linkElement );
	 *		writer.removeClass( [ 'foo', 'bar' ], linkElement );
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
	 *		writer.setStyle( 'color', 'red', element );
	 *		writer.setStyle( {
	 *			color: 'red',
	 *			position: 'fixed'
	 *		}, element );
	 *
	 * **Note**: This method can work with normalized style names if
	 * {@link module:engine/controller/datacontroller~DataController#addStyleProcessorRules a particular style processor rule is enabled}.
	 * See {@link module:engine/view/stylesmap~StylesMap#set `StylesMap#set()`} for details.
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
	 *		writer.removeStyle( 'color', element );  // Removes 'color' style.
	 *		writer.removeStyle( [ 'color', 'border-top' ], element ); // Removes both 'color' and 'border-top' styles.
	 *
	 * **Note**: This method can work with normalized style names if
	 * {@link module:engine/controller/datacontroller~DataController#addStyleProcessorRules a particular style processor rule is enabled}.
	 * See {@link module:engine/view/stylesmap~StylesMap#remove `StylesMap#remove()`} for details.
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

	/**
	 * Creates position at the given location. The location can be specified as:
	 *
	 * * a {@link module:engine/view/position~Position position},
	 * * parent element and offset (offset defaults to `0`),
	 * * parent element and `'end'` (sets position at the end of that element),
	 * * {@link module:engine/view/item~Item view item} and `'before'` or `'after'` (sets position before or after given view item).
	 *
	 * This method is a shortcut to other constructors such as:
	 *
	 * * {@link #createPositionBefore},
	 * * {@link #createPositionAfter},
	 *
	 * @param {module:engine/view/item~Item|module:engine/model/position~Position} itemOrPosition
	 * @param {Number|'end'|'before'|'after'} [offset] Offset or one of the flags. Used only when
	 * first parameter is a {@link module:engine/view/item~Item view item}.
	 * @returns {module:engine/view/position~Position}
	 */
	createPositionAt( itemOrPosition, offset ) {
		return Position._createAt( itemOrPosition, offset );
	}

	/**
	 * Creates a new position after given view item.
	 *
	 * @param {module:engine/view/item~Item} item View item after which the position should be located.
	 * @returns {module:engine/view/position~Position}
	 */
	createPositionAfter( item ) {
		return Position._createAfter( item );
	}

	/**
	 * Creates a new position before given view item.
	 *
	 * @param {module:engine/view/item~Item} item View item before which the position should be located.
	 * @returns {module:engine/view/position~Position}
	 */
	createPositionBefore( item ) {
		return Position._createBefore( item );
	}

	/**
	 * Creates a range spanning from `start` position to `end` position.
	 *
	 * **Note:** This factory method creates it's own {@link module:engine/view/position~Position} instances basing on passed values.
	 *
	 * @param {module:engine/view/position~Position} start Start position.
	 * @param {module:engine/view/position~Position} [end] End position. If not set, range will be collapsed at `start` position.
	 * @returns {module:engine/view/range~Range}
	 */
	createRange( start, end ) {
		return new Range( start, end );
	}

	/**
	 * Creates a range that starts before given {@link module:engine/view/item~Item view item} and ends after it.
	 *
	 * @param {module:engine/view/item~Item} item
	 * @returns {module:engine/view/range~Range}
	 */
	createRangeOn( item ) {
		return Range._createOn( item );
	}

	/**
	 * Creates a range inside an {@link module:engine/view/element~Element element} which starts before the first child of
	 * that element and ends after the last child of that element.
	 *
	 * @param {module:engine/view/element~Element} element Element which is a parent for the range.
	 * @returns {module:engine/view/range~Range}
	 */
	createRangeIn( element ) {
		return Range._createIn( element );
	}

	/**
	 * Creates a new {@link module:engine/view/selection~Selection} instance.
	 *
	 * 		// Creates empty selection without ranges.
	 *		const selection = writer.createSelection();
	 *
	 *		// Creates selection at the given range.
	 *		const range = writer.createRange( start, end );
	 *		const selection = writer.createSelection( range );
	 *
	 *		// Creates selection at the given ranges
	 * 		const ranges = [ writer.createRange( start1, end2 ), writer.createRange( star2, end2 ) ];
	 *		const selection = writer.createSelection( ranges );
	 *
	 *		// Creates selection from the other selection.
	 *		const otherSelection = writer.createSelection();
	 *		const selection = writer.createSelection( otherSelection );
	 *
	 *		// Creates selection from the document selection.
	 *		const selection = writer.createSelection( editor.editing.view.document.selection );
	 *
	 * 		// Creates selection at the given position.
	 *		const position = writer.createPositionFromPath( root, path );
	 *		const selection = writer.createSelection( position );
	 *
	 *		// Creates collapsed selection at the position of given item and offset.
	 *		const paragraph = writer.createContainerElement( 'paragraph' );
	 *		const selection = writer.createSelection( paragraph, offset );
	 *
	 *		// Creates a range inside an {@link module:engine/view/element~Element element} which starts before the
	 *		// first child of that element and ends after the last child of that element.
	 *		const selection = writer.createSelection( paragraph, 'in' );
	 *
	 *		// Creates a range on an {@link module:engine/view/item~Item item} which starts before the item and ends
	 *		// just after the item.
	 *		const selection = writer.createSelection( paragraph, 'on' );
	 *
	 * `Selection`'s constructor allow passing additional options (`backward`, `fake` and `label`) as the last argument.
	 *
	 *		// Creates backward selection.
	 *		const selection = writer.createSelection( range, { backward: true } );
	 *
	 * Fake selection does not render as browser native selection over selected elements and is hidden to the user.
	 * This way, no native selection UI artifacts are displayed to the user and selection over elements can be
	 * represented in other way, for example by applying proper CSS class.
	 *
	 * Additionally fake's selection label can be provided. It will be used to describe fake selection in DOM
	 * (and be  properly handled by screen readers).
	 *
	 *		// Creates fake selection with label.
	 *		const selection = writer.createSelection( range, { fake: true, label: 'foo' } );
	 *
	 * @param {module:engine/view/selection~Selectable} [selectable=null]
	 * @param {Number|'before'|'end'|'after'|'on'|'in'} [placeOrOffset] Offset or place when selectable is an `Item`.
	 * @param {Object} [options]
	 * @param {Boolean} [options.backward] Sets this selection instance to be backward.
	 * @param {Boolean} [options.fake] Sets this selection instance to be marked as `fake`.
	 * @param {String} [options.label] Label for the fake selection.
	 * @returns {module:engine/view/selection~Selection}
	 */
	createSelection( selectable, placeOrOffset, options ) {
		return new Selection( selectable, placeOrOffset, options );
	}
}
