/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Node from './node.js';
import utils from '../../utils/utils.js';
import isPlainObject from '../../utils/lib/lodash/isPlainObject.js';

/**
 * Tree view element.
 *
 * @memberOf core.treeView
 * @extends core.treeView.Node
 */
export default class Element extends Node {
	/**
	 * Creates a tree view element.
	 *
	 * Attributes can be passed in various formats:
	 *
	 *		new Element( 'div', { 'class': 'editor', 'contentEditable': 'true' } ); // object
	 *		new Element( 'div', [ [ 'class', 'editor' ], [ 'contentEditable', 'true' ] ] ); // map-like iterator
	 *		new Element( 'div', mapOfAttributes ); // map
	 *
	 * @param {String} name Node name.
	 * @param {Object|Iterable} [attrs] Collection of attributes.
	 * @param {core.treeView.Node|Iterable.<core.treeView.Node>} [children] List of nodes to be inserted into created element.
	 */
	constructor( name, attrs, children ) {
		super();

		/**
		 * Name of the element.
		 *
		 * @readonly
		 * @member {String} core.treeView.Element#name
		 */
		this.name = name;

		/**
		 * Map of attributes, where attributes names are keys and attributes values are values.
		 *
		 * @protected
		 * @member {Map} core.treeView.Element#_attrs
		 */
		if ( isPlainObject( attrs ) ) {
			this._attrs = utils.objectToMap( attrs );
		} else {
			this._attrs = new Map( attrs );
		}

		/**
		 * Array of child nodes.
		 *
		 * @protected
		 * @member {Array.<core.treeView.Node>} core.treeView.Element#_children
		 */
		this._children = [];

		if ( children ) {
			this.insertChildren( 0, children );
		}

		/**
		 * Set of classes associated with element instance.
		 *
		 * @protected
		 * @member {Set} core.treeView.Element#_classes
		 */
		if ( this._attrs.has( 'class' ) ) {
			// Remove class attribute and handle it by class set.
			const classString = this._attrs.get( 'class' );
			const classArray = classString.split( /\s+/ );
			this._classes = new Set( classArray );
			this._attrs.delete( 'class' );
		} else {
			this._classes = new Set();
		}

		/**
		 * Map of styles.
		 *
		 * @protected
		 * @member {Set} core.treeView.Element#_styles
		 */
		this._styles = new Map();

		if ( this._attrs.has( 'style' ) ) {
			parseInlineStyles( this._styles, this._attrs.get( 'style' ) );
			this._attrs.delete( 'style' );
		}
	}

	/**
	 * Clones provided element.
	 *
	 * @param {Boolean} deep If set to `true` clones element and all its children recursively. When set to `false`,
	 * element will be cloned without any children.
	 * @returns {Element} Clone of this element.
	 */
	clone( deep ) {
		const childrenClone = [];

		if ( deep ) {
			for ( let child of this.getChildren() ) {
				childrenClone.push( child.clone( deep ) );
			}
		}

		const cloned = new Element( this.name, this._attrs, childrenClone );

		// Classes and styles are cloned separately - it solution is faster than adding them back to attributes and
		// parse once again in constructor.
		cloned._classes = new Set( this._classes );
		cloned._styles = new Map( this._styles );

		return cloned;
	}

	/**
	 * {@link core.treeView.Element#insert Insert} a child node or a list of child nodes at the end of this node and sets
	 * the parent of these nodes to this element.
	 *
	 * @fires core.treeView.Node#change
	 * @param {core.treeView.Node|Iterable.<core.treeView.Node>} nodes Node or the list of nodes to be inserted.
	 * @returns {Number} Number of appended nodes.

	 */
	appendChildren( nodes ) {
		return this.insertChildren( this.getChildCount(), nodes );
	}

	/**
	 * Gets child at the given index.
	 *
	 * @param {Number} index Index of child.
	 * @returns {core.treeView.Node} Child node.
	 */
	getChild( index ) {
		return this._children[ index ];
	}

	/**
	 * Gets the number of element's children.
	 *
	 * @returns {Number} The number of element's children.
	 */
	getChildCount() {
		return this._children.length;
	}

	/**
	 * Gets index of the given child node. Returns `-1` if child node is not found.
	 *
	 * @param {core.treeView.Node} node Child node.
	 * @returns {Number} Index of the child node.
	 */
	getChildIndex( node ) {
		return this._children.indexOf( node );
	}

	/**
	 * Gets child nodes iterator.
	 *
	 * @returns {Iterable.<core.treeView.Node>} Child nodes iterator.
	 */
	getChildren() {
		return this._children[ Symbol.iterator ]();
	}

	/**
	 * Returns an iterator that contains the keys for attributes.
	 * Order of inserting attributes is not preserved.
	 *
	 * @returns {Iterator.<String>} Keys for attributes.
	 */
	*getAttributeKeys() {
		if ( this._classes.size > 0 ) {
			yield 'class';
		}

		if ( this._styles.size > 0 ) {
			yield 'style';
		}

		yield* this._attrs.keys();
	}

	/**
	 * Gets attribute by key. If attribute is not present - returns undefined.
	 *
	 * @param {String} key Attribute key.
	 * @returns {String|undefined} Attribute value.
	 */
	getAttribute( key ) {
		if ( key == 'class' ) {
			if ( this._classes.size > 0 ) {
				return [ ...this._classes ].join( ' ' );
			}

			return undefined;
		}

		if ( key == 'style' ) {
			if ( this._styles.size > 0 ) {
				let styleString = '';

				for ( let [ property, value ] of this._styles ) {
					styleString += `${ property }:${ value };`;
				}

				return styleString;
			}

			return undefined;
		}

		return this._attrs.get( key );
	}

	/**
	 * Returns a boolean indicating whether an attribute with the specified key exists in the element.
	 *
	 * @param {String} key Attribute key.
	 * @returns {Boolean} `true` if attribute with the specified key exists in the element, false otherwise.
	 */
	hasAttribute( key ) {
		if ( key == 'class' ) {
			return this._classes.size  > 0;
		}

		if ( key == 'style' ) {
			return this._styles.size > 0;
		}

		return this._attrs.has( key );
	}

	/**
	 * Adds or overwrite attribute with a specified key and value.
	 *
	 * @param {String} key Attribute key.
	 * @param {String} value Attribute value.
	 * @fires core.treeView.Node#change
	 */
	setAttribute( key, value ) {
		this._fireChange( 'ATTRIBUTES', this );

		if ( key == 'class' ) {
			const classArray = value.split( /\s+/ );
			this._classes.clear();
			classArray.forEach( name => this._classes.add( name ) );
		} else if ( key == 'style' ) {
			parseInlineStyles( this._styles, value );
		} else {
			this._attrs.set( key, value );
		}
	}

	/**
	 * Inserts a child node or a list of child nodes on the given index and sets the parent of these nodes to
	 * this element.
	 *
	 * @param {Number} index Position where nodes should be inserted.
	 * @param {core.treeView.Node|Iterable.<core.treeView.Node>} nodes Node or the list of nodes to be inserted.
	 * @fires core.treeView.Node#change
	 * @returns {Number} Number of inserted nodes.
	 */
	insertChildren( index, nodes ) {
		this._fireChange( 'CHILDREN', this );
		let count = 0;

		if ( !utils.isIterable( nodes ) ) {
			nodes = [ nodes ];
		}

		for ( let node of nodes ) {
			node.parent = this;

			this._children.splice( index, 0, node );
			index++;
			count++;
		}

		return count;
	}

	/**
	 * Removes attribute from the element.
	 *
	 * @param {String} key Attribute key.
	 * @returns {Boolean} Returns true if an attribute existed and has been removed.
	 * @fires core.treeView.Node#change
	 */
	removeAttribute( key ) {
		this._fireChange( 'ATTRIBUTES', this );

		// Remove class attribute.
		if ( key == 'class' ) {
			if ( this._classes.size > 0 ) {
				this._classes.clear();

				return true;
			}

			return false;
		}

		// Remove style attribute.
		if ( key == 'style' ) {
			if ( this._styles.size > 0 ) {
				this._styles.clear();

				return true;
			}

			return false;
		}

		// Remove other attributes.
		return this._attrs.delete( key );
	}

	/**
	 * Removes number of child nodes starting at the given index and set the parent of these nodes to `null`.
	 *
	 * @param {Number} index Number of the first node to remove.
	 * @param {Number} [howMany=1] Number of nodes to remove.
	 * @returns {Array.<core.treeView.Node>} The array of removed nodes.
	 * @fires core.treeView.Node#change
	 */
	removeChildren( index, howMany = 1 ) {
		this._fireChange( 'CHILDREN', this );

		for ( let i = index; i < index + howMany; i++ ) {
			this._children[ i ].parent = null;
		}

		return this._children.splice( index, howMany );
	}

	/**
	 * Checks if this element is similar to other element.
	 * Both elements should have the same name and attributes to be considered as similar. Two similar elements
	 * can contain different set of children nodes.
	 *
	 * @param {Element} otherElement
	 * @returns {Boolean}
	 */
	isSimilar( otherElement ) {
		if ( !( otherElement instanceof Element ) ) {
			return false;
		}

		// If exactly the same Element is provided - return true immediately.
		if ( this === otherElement ) {
			return true;
		}

		// Check element name.
		if ( this.name != otherElement.name ) {
			return false;
		}

		// Check number of attributes and classes.
		if ( this._attrs.size !== otherElement._attrs.size || this._classes.size !== otherElement._classes.size ) {
			return false;
		}

		// Check if attributes are the same.
		for ( let key of this._attrs.keys() ) {
			if ( !otherElement._attrs.has( key ) || otherElement._attrs.get( key ) !== this._attrs.get( key ) ) {
				return false;
			}
		}

		// Check if classes are the same.
		for ( let className of this._classes ) {
			if ( !otherElement._classes.has( className ) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Adds specified class.
	 *
	 * @example
	 * element.addClass( 'foo' ); // Adds 'foo' class.
	 * element.addClass( 'foo', 'bar' ); // Adds 'foo' and 'bar' classes.
	 *
	 * @param {...String} className
	 */
	addClass( ...className ) {
		className.forEach( name => this._classes.add( name ) );
	}

	/**
	 * Removes specified class.
	 *
	 * @example
 	 * element.removeClass( 'foo' );  // Removes 'foo' class.
	 * element.removeClass( 'foo', 'bar' ); // Removes both 'foo' and 'bar' classes.
	 *
	 * @param {...String} className
	 */
	removeClass( ...className ) {
		className.forEach( name => this._classes.delete( name ) );
	}

	/**
	 * Returns true if class is present.
	 * If more then one class is provided - returns true only when all classes are present.
	 *
	 * @example
	 * element.hasClass( 'foo' ); // Returns true if 'foo' class is present.
	 * element.hasClass( 'foo', 'bar' ); // Returns true if 'foo' and 'bar' classes are both present.
	 *
	 * @param {...String} className
	 */
	hasClass( ...className ) {
		for ( let name of className ) {
			if ( !this._classes.has( name ) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Adds style to the element.
	 *
	 * @param {String} property
	 * @param {String} value
	 */
	setStyle( property, value ) {
		this._styles.set( property, value );
	}

	/**
	 * Returns style value for given property.
	 * Undefined is returned if style does not exist.
	 *
	 * @param {String} property
	 * @returns {String|undefined}
	 */
	getStyle( property ) {
		return this._styles.get( property );
	}

	/**
	 * Returns true if style property is present.
	 * If more then one style property is provided - returns true only when all properties are present.
	 *
	 * @example
	 * element.hasStyle( 'color' ); // Returns true if 'border-top' style is present.
	 * element.hasStyle( 'color', 'border-top' ); // Returns true if 'color' and 'border-top' styles are both present.
	 *
	 * @param {...String} property
	 */
	hasStyle( ...property ) {
		for ( let name of property ) {
			if ( !this._styles.has( name ) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Removes specified style.
	 *
	 * @example
	 * element.removeStyle( 'color' );  // Removes 'color' style.
	 * element.removeStyle( 'color', 'border-top' ); // Removes both 'color' and 'border-top' styles.
	 *
	 * @param {...String} property
	 */
	removeStyle( ...property ) {
		property.forEach( name => this._styles.delete( name ) );
	}
}

// Parses inline styles and puts property - value pairs into styles map.
// Styles map is cleared before insertion.
//
// @param {Map.<String, String>} stylesMap Map to insert parsed properties and values.
// @param {String} stylesString Styles to parse.
function parseInlineStyles( stylesMap, stylesString ) {
	const regex = /\s*([^:;\s]+)\s*:\s*([^;]+)\s*(?=;|$)/g;
	let matchStyle;
	stylesMap.clear();

	while ( ( matchStyle = regex.exec( stylesString ) ) !== null ) {
		stylesMap.set( matchStyle[ 1 ], matchStyle[ 2 ].trim() );
	}
}