/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/element
 */

import Node from './node';
import Text from './text';
import TextProxy from './textproxy';
import objectToMap from '@ckeditor/ckeditor5-utils/src/objecttomap';
import isIterable from '@ckeditor/ckeditor5-utils/src/isiterable';
import Matcher from './matcher';
import { isPlainObject } from 'lodash-es';

/**
 * View element.
 *
 * The editing engine does not define a fixed semantics of its elements (it is "DTD-free").
 * This is why the type of the {@link module:engine/view/element~Element} need to
 * be defined by the feature developer. When creating an element you should use one of the following methods:
 *
 * * {@link module:engine/view/downcastwriter~DowncastWriter#createContainerElement `downcastWriter#createContainerElement()`}
 * in order to create a {@link module:engine/view/containerelement~ContainerElement},
 * * {@link module:engine/view/downcastwriter~DowncastWriter#createAttributeElement `downcastWriter#createAttributeElement()`}
 * in order to create a {@link module:engine/view/attributeelement~AttributeElement},
 * * {@link module:engine/view/downcastwriter~DowncastWriter#createEmptyElement `downcastWriter#createEmptyElement()`}
 * in order to create a {@link module:engine/view/emptyelement~EmptyElement}.
 * * {@link module:engine/view/downcastwriter~DowncastWriter#createUIElement `downcastWriter#createUIElement()`}
 * in order to create a {@link module:engine/view/uielement~UIElement}.
 * * {@link module:engine/view/downcastwriter~DowncastWriter#createEditableElement `downcastWriter#createEditableElement()`}
 * in order to create a {@link module:engine/view/editableelement~EditableElement}.
 *
 * Note that for view elements which are not created from the model, like elements from mutations, paste or
 * {@link module:engine/controller/datacontroller~DataController#set data.set} it is not possible to define the type of the element.
 * In such cases the {@link module:engine/view/upcastwriter~UpcastWriter#createElement `UpcastWriter#createElement()`} method
 * should be used to create generic view elements.
 *
 * @extends module:engine/view/node~Node
 */
export default class Element extends Node {
	/**
	 * Creates a view element.
	 *
	 * Attributes can be passed in various formats:
	 *
	 *		new Element( 'div', { class: 'editor', contentEditable: 'true' } ); // object
	 *		new Element( 'div', [ [ 'class', 'editor' ], [ 'contentEditable', 'true' ] ] ); // map-like iterator
	 *		new Element( 'div', mapOfAttributes ); // map
	 *
	 * @protected
	 * @param {String} name Node name.
	 * @param {Object|Iterable} [attrs] Collection of attributes.
	 * @param {module:engine/view/node~Node|Iterable.<module:engine/view/node~Node>} [children]
	 * A list of nodes to be inserted into created element.
	 */
	constructor( name, attrs, children ) {
		super();

		/**
		 * Name of the element.
		 *
		 * @readonly
		 * @member {String}
		 */
		this.name = name;

		/**
		 * Map of attributes, where attributes names are keys and attributes values are values.
		 *
		 * @protected
		 * @member {Map} #_attrs
		 */
		this._attrs = parseAttributes( attrs );

		/**
		 * Array of child nodes.
		 *
		 * @protected
		 * @member {Array.<module:engine/view/node~Node>}
		 */
		this._children = [];

		if ( children ) {
			this._insertChild( 0, children );
		}

		/**
		 * Set of classes associated with element instance.
		 *
		 * @protected
		 * @member {Set}
		 */
		this._classes = new Set();

		if ( this._attrs.has( 'class' ) ) {
			// Remove class attribute and handle it by class set.
			const classString = this._attrs.get( 'class' );
			parseClasses( this._classes, classString );
			this._attrs.delete( 'class' );
		}

		/**
		 * Map of styles.
		 *
		 * @protected
		 * @member {Map} module:engine/view/element~Element#_styles
		 */
		this._styles = new Map();

		if ( this._attrs.has( 'style' ) ) {
			// Remove style attribute and handle it by styles map.
			parseInlineStyles( this._styles, this._attrs.get( 'style' ) );
			this._attrs.delete( 'style' );
		}

		/**
		 * Map of custom properties.
		 * Custom properties can be added to element instance, will be cloned but not rendered into DOM.
		 *
		 * @protected
		 * @member {Map}
		 */
		this._customProperties = new Map();
	}

	/**
	 * Number of element's children.
	 *
	 * @readonly
	 * @type {Number}
	 */
	get childCount() {
		return this._children.length;
	}

	/**
	 * Is `true` if there are no nodes inside this element, `false` otherwise.
	 *
	 * @readonly
	 * @type {Boolean}
	 */
	get isEmpty() {
		return this._children.length === 0;
	}

	/**
	 * Checks whether this view object is of the given type.
	 *
	 *		obj.is( 'element' ); // true
	 *		obj.is( 'li' ); // true
	 *		obj.is( 'element', 'li' ); // true
	 *		obj.is( 'text' ); // false
	 *		obj.is( 'element', 'img' ); // false
	 *
	 * Read more in {@link module:engine/view/node~Node#is `Node#is()`}.
	 *
	 * @param {String} type
	 * @param {String} [name] Element name.
	 * @returns {Boolean}
	 */
	is( type, name = null ) {
		if ( !name ) {
			return type == 'element' || type == this.name || super.is( type );
		} else {
			return type == 'element' && name == this.name;
		}
	}

	/**
	 * Gets child at the given index.
	 *
	 * @param {Number} index Index of child.
	 * @returns {module:engine/view/node~Node} Child node.
	 */
	getChild( index ) {
		return this._children[ index ];
	}

	/**
	 * Gets index of the given child node. Returns `-1` if child node is not found.
	 *
	 * @param {module:engine/view/node~Node} node Child node.
	 * @returns {Number} Index of the child node.
	 */
	getChildIndex( node ) {
		return this._children.indexOf( node );
	}

	/**
	 * Gets child nodes iterator.
	 *
	 * @returns {Iterable.<module:engine/view/node~Node>} Child nodes iterator.
	 */
	getChildren() {
		return this._children[ Symbol.iterator ]();
	}

	/**
	 * Returns an iterator that contains the keys for attributes. Order of inserting attributes is not preserved.
	 *
	 * @returns {Iterable.<String>} Keys for attributes.
	 */
	* getAttributeKeys() {
		if ( this._classes.size > 0 ) {
			yield 'class';
		}

		if ( this._styles.size > 0 ) {
			yield 'style';
		}

		yield* this._attrs.keys();
	}

	/**
	 * Returns iterator that iterates over this element's attributes.
	 *
	 * Attributes are returned as arrays containing two items. First one is attribute key and second is attribute value.
	 * This format is accepted by native `Map` object and also can be passed in `Node` constructor.
	 *
	 * @returns {Iterable.<*>}
	 */
	* getAttributes() {
		yield* this._attrs.entries();

		if ( this._classes.size > 0 ) {
			yield [ 'class', this.getAttribute( 'class' ) ];
		}

		if ( this._styles.size > 0 ) {
			yield [ 'style', this.getAttribute( 'style' ) ];
		}
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

				for ( const [ property, value ] of this._styles ) {
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
			return this._classes.size > 0;
		}

		if ( key == 'style' ) {
			return this._styles.size > 0;
		}

		return this._attrs.has( key );
	}

	/**
	 * Checks if this element is similar to other element.
	 * Both elements should have the same name and attributes to be considered as similar. Two similar elements
	 * can contain different set of children nodes.
	 *
	 * @param {module:engine/view/element~Element} otherElement
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

		// Check number of attributes, classes and styles.
		if ( this._attrs.size !== otherElement._attrs.size || this._classes.size !== otherElement._classes.size ||
			this._styles.size !== otherElement._styles.size ) {
			return false;
		}

		// Check if attributes are the same.
		for ( const [ key, value ] of this._attrs ) {
			if ( !otherElement._attrs.has( key ) || otherElement._attrs.get( key ) !== value ) {
				return false;
			}
		}

		// Check if classes are the same.
		for ( const className of this._classes ) {
			if ( !otherElement._classes.has( className ) ) {
				return false;
			}
		}

		// Check if styles are the same.
		for ( const [ property, value ] of this._styles ) {
			if ( !otherElement._styles.has( property ) || otherElement._styles.get( property ) !== value ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Returns true if class is present.
	 * If more then one class is provided - returns true only when all classes are present.
	 *
	 *		element.hasClass( 'foo' ); // Returns true if 'foo' class is present.
	 *		element.hasClass( 'foo', 'bar' ); // Returns true if 'foo' and 'bar' classes are both present.
	 *
	 * @param {...String} className
	 */
	hasClass( ...className ) {
		for ( const name of className ) {
			if ( !this._classes.has( name ) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Returns iterator that contains all class names.
	 *
	 * @returns {Iterable.<String>}
	 */
	getClassNames() {
		return this._classes.keys();
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
	 * Returns iterator that contains all style names.
	 *
	 * @returns {Iterable.<String>}
	 */
	getStyleNames() {
		return this._styles.keys();
	}

	/**
	 * Returns true if style keys are present.
	 * If more then one style property is provided - returns true only when all properties are present.
	 *
	 *		element.hasStyle( 'color' ); // Returns true if 'border-top' style is present.
	 *		element.hasStyle( 'color', 'border-top' ); // Returns true if 'color' and 'border-top' styles are both present.
	 *
	 * @param {...String} property
	 */
	hasStyle( ...property ) {
		for ( const name of property ) {
			if ( !this._styles.has( name ) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Returns ancestor element that match specified pattern.
	 * Provided patterns should be compatible with {@link module:engine/view/matcher~Matcher Matcher} as it is used internally.
	 *
	 * @see module:engine/view/matcher~Matcher
	 * @param {Object|String|RegExp|Function} patterns Patterns used to match correct ancestor.
	 * See {@link module:engine/view/matcher~Matcher}.
	 * @returns {module:engine/view/element~Element|null} Found element or `null` if no matching ancestor was found.
	 */
	findAncestor( ...patterns ) {
		const matcher = new Matcher( ...patterns );
		let parent = this.parent;

		while ( parent ) {
			if ( matcher.match( parent ) ) {
				return parent;
			}

			parent = parent.parent;
		}

		return null;
	}

	/**
	 * Returns the custom property value for the given key.
	 *
	 * @param {String|Symbol} key
	 * @returns {*}
	 */
	getCustomProperty( key ) {
		return this._customProperties.get( key );
	}

	/**
	 * Returns an iterator which iterates over this element's custom properties.
	 * Iterator provides `[ key, value ]` pairs for each stored property.
	 *
	 * @returns {Iterable.<*>}
	 */
	* getCustomProperties() {
		yield* this._customProperties.entries();
	}

	/**
	 * Returns identity string based on element's name, styles, classes and other attributes.
	 * Two elements that {@link #isSimilar are similar} will have same identity string.
	 * It has the following format:
	 *
	 *		'name class="class1,class2" style="style1:value1;style2:value2" attr1="val1" attr2="val2"'
 	 *
	 * For example:
	 *
	 *		const element = writer.createContainerElement( 'foo', {
	 *			banana: '10',
	 *			apple: '20',
	 *			style: 'color: red; border-color: white;',
	 *			class: 'baz'
	 *		} );
	 *
	 *		// returns 'foo class="baz" style="border-color:white;color:red" apple="20" banana="10"'
	 *		element.getIdentity();
	 *
	 * NOTE: Classes, styles and other attributes are sorted alphabetically.
	 *
	 * @returns {String}
	 */
	getIdentity() {
		const classes = Array.from( this._classes ).sort().join( ',' );
		const styles = Array.from( this._styles ).map( i => `${ i[ 0 ] }:${ i[ 1 ] }` ).sort().join( ';' );
		const attributes = Array.from( this._attrs ).map( i => `${ i[ 0 ] }="${ i[ 1 ] }"` ).sort().join( ' ' );

		return this.name +
			( classes == '' ? '' : ` class="${ classes }"` ) +
			( styles == '' ? '' : ` style="${ styles }"` ) +
			( attributes == '' ? '' : ` ${ attributes }` );
	}

	/**
	 * Clones provided element.
	 *
	 * @protected
	 * @param {Boolean} [deep=false] If set to `true` clones element and all its children recursively. When set to `false`,
	 * element will be cloned without any children.
	 * @returns {module:engine/view/element~Element} Clone of this element.
	 */
	_clone( deep = false ) {
		const childrenClone = [];

		if ( deep ) {
			for ( const child of this.getChildren() ) {
				childrenClone.push( child._clone( deep ) );
			}
		}

		// ContainerElement and AttributeElement should be also cloned properly.
		const cloned = new this.constructor( this.name, this._attrs, childrenClone );

		// Classes and styles are cloned separately - this solution is faster than adding them back to attributes and
		// parse once again in constructor.
		cloned._classes = new Set( this._classes );
		cloned._styles = new Map( this._styles );

		// Clone custom properties.
		cloned._customProperties = new Map( this._customProperties );

		// Clone filler offset method.
		// We can't define this method in a prototype because it's behavior which
		// is changed by e.g. toWidget() function from ckeditor5-widget. Perhaps this should be one of custom props.
		cloned.getFillerOffset = this.getFillerOffset;

		return cloned;
	}

	/**
	 * {@link module:engine/view/element~Element#_insertChild Insert} a child node or a list of child nodes at the end of this node
	 * and sets the parent of these nodes to this element.
	 *
	 * @see module:engine/view/downcastwriter~DowncastWriter#insert
	 * @protected
	 * @param {module:engine/view/item~Item|Iterable.<module:engine/view/item~Item>} items Items to be inserted.
	 * @fires module:engine/view/node~Node#change
	 * @returns {Number} Number of appended nodes.
	 */
	_appendChild( items ) {
		return this._insertChild( this.childCount, items );
	}

	/**
	 * Inserts a child node or a list of child nodes on the given index and sets the parent of these nodes to
	 * this element.
	 *
	 * @see module:engine/view/downcastwriter~DowncastWriter#insert
	 * @protected
	 * @param {Number} index Position where nodes should be inserted.
	 * @param {module:engine/view/item~Item|Iterable.<module:engine/view/item~Item>} items Items to be inserted.
	 * @fires module:engine/view/node~Node#change
	 * @returns {Number} Number of inserted nodes.
	 */
	_insertChild( index, items ) {
		this._fireChange( 'children', this );
		let count = 0;

		const nodes = normalize( items );

		for ( const node of nodes ) {
			// If node that is being added to this element is already inside another element, first remove it from the old parent.
			if ( node.parent !== null ) {
				node._remove();
			}

			node.parent = this;

			this._children.splice( index, 0, node );
			index++;
			count++;
		}

		return count;
	}

	/**
	 * Removes number of child nodes starting at the given index and set the parent of these nodes to `null`.
	 *
	 * @see module:engine/view/downcastwriter~DowncastWriter#remove
	 * @protected
	 * @param {Number} index Number of the first node to remove.
	 * @param {Number} [howMany=1] Number of nodes to remove.
	 * @fires module:engine/view/node~Node#change
	 * @returns {Array.<module:engine/view/node~Node>} The array of removed nodes.
	 */
	_removeChildren( index, howMany = 1 ) {
		this._fireChange( 'children', this );

		for ( let i = index; i < index + howMany; i++ ) {
			this._children[ i ].parent = null;
		}

		return this._children.splice( index, howMany );
	}

	/**
	 * Adds or overwrite attribute with a specified key and value.
	 *
	 * @see module:engine/view/downcastwriter~DowncastWriter#setAttribute
	 * @protected
	 * @param {String} key Attribute key.
	 * @param {String} value Attribute value.
	 * @fires module:engine/view/node~Node#change
	 */
	_setAttribute( key, value ) {
		value = String( value );

		this._fireChange( 'attributes', this );

		if ( key == 'class' ) {
			parseClasses( this._classes, value );
		} else if ( key == 'style' ) {
			parseInlineStyles( this._styles, value );
		} else {
			this._attrs.set( key, value );
		}
	}

	/**
	 * Removes attribute from the element.
	 *
	 * @see module:engine/view/downcastwriter~DowncastWriter#removeAttribute
	 * @protected
	 * @param {String} key Attribute key.
	 * @returns {Boolean} Returns true if an attribute existed and has been removed.
	 * @fires module:engine/view/node~Node#change
	 */
	_removeAttribute( key ) {
		this._fireChange( 'attributes', this );

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
	 * Adds specified class.
	 *
	 *		element._addClass( 'foo' ); // Adds 'foo' class.
	 *		element._addClass( [ 'foo', 'bar' ] ); // Adds 'foo' and 'bar' classes.
	 *
	 * @see module:engine/view/downcastwriter~DowncastWriter#addClass
	 * @protected
	 * @param {Array.<String>|String} className
	 * @fires module:engine/view/node~Node#change
	 */
	_addClass( className ) {
		this._fireChange( 'attributes', this );

		className = Array.isArray( className ) ? className : [ className ];
		className.forEach( name => this._classes.add( name ) );
	}

	/**
	 * Removes specified class.
	 *
	 *		element._removeClass( 'foo' );  // Removes 'foo' class.
	 *		element._removeClass( [ 'foo', 'bar' ] ); // Removes both 'foo' and 'bar' classes.
	 *
	 * @see module:engine/view/downcastwriter~DowncastWriter#removeClass
	 * @protected
	 * @param {Array.<String>|String} className
	 * @fires module:engine/view/node~Node#change
	 */
	_removeClass( className ) {
		this._fireChange( 'attributes', this );

		className = Array.isArray( className ) ? className : [ className ];
		className.forEach( name => this._classes.delete( name ) );
	}

	/**
	 * Adds style to the element.
	 *
	 *		element._setStyle( 'color', 'red' );
	 *		element._setStyle( {
	 *			color: 'red',
	 *			position: 'fixed'
	 *		} );
	 *
	 * @see module:engine/view/downcastwriter~DowncastWriter#setStyle
	 * @protected
	 * @param {String|Object} property Property name or object with key - value pairs.
	 * @param {String} [value] Value to set. This parameter is ignored if object is provided as the first parameter.
	 * @fires module:engine/view/node~Node#change
	 */
	_setStyle( property, value ) {
		this._fireChange( 'attributes', this );

		if ( isPlainObject( property ) ) {
			const keys = Object.keys( property );

			for ( const key of keys ) {
				this._styles.set( key, property[ key ] );
			}
		} else {
			this._styles.set( property, value );
		}
	}

	/**
	 * Removes specified style.
	 *
	 *		element._removeStyle( 'color' );  // Removes 'color' style.
	 *		element._removeStyle( [ 'color', 'border-top' ] ); // Removes both 'color' and 'border-top' styles.
	 *
	 * @see module:engine/view/downcastwriter~DowncastWriter#removeStyle
	 * @protected
	 * @param {Array.<String>|String} property
	 * @fires module:engine/view/node~Node#change
	 */
	_removeStyle( property ) {
		this._fireChange( 'attributes', this );

		property = Array.isArray( property ) ? property : [ property ];
		property.forEach( name => this._styles.delete( name ) );
	}

	/**
	 * Sets a custom property. Unlike attributes, custom properties are not rendered to the DOM,
	 * so they can be used to add special data to elements.
	 *
	 * @see module:engine/view/downcastwriter~DowncastWriter#setCustomProperty
	 * @protected
	 * @param {String|Symbol} key
	 * @param {*} value
	 */
	_setCustomProperty( key, value ) {
		this._customProperties.set( key, value );
	}

	/**
	 * Removes the custom property stored under the given key.
	 *
	 * @see module:engine/view/downcastwriter~DowncastWriter#removeCustomProperty
	 * @protected
	 * @param {String|Symbol} key
	 * @returns {Boolean} Returns true if property was removed.
	 */
	_removeCustomProperty( key ) {
		return this._customProperties.delete( key );
	}

	/**
	 * Returns block {@link module:engine/view/filler filler} offset or `null` if block filler is not needed.
	 *
	 * @abstract
	 * @method module:engine/view/element~Element#getFillerOffset
	 */
}

// Parses attributes provided to the element constructor before they are applied to an element. If attributes are passed
// as an object (instead of `Map`), the object is transformed to the map. Attributes with `null` value are removed.
// Attributes with non-`String` value are converted to `String`.
//
// @param {Object|Map} attrs Attributes to parse.
// @returns {Map} Parsed attributes.
function parseAttributes( attrs ) {
	if ( isPlainObject( attrs ) ) {
		attrs = objectToMap( attrs );
	} else {
		attrs = new Map( attrs );
	}

	for ( const [ key, value ] of attrs ) {
		if ( value === null ) {
			attrs.delete( key );
		} else if ( typeof value != 'string' ) {
			attrs.set( key, String( value ) );
		}
	}

	return attrs;
}

// Parses inline styles and puts property - value pairs into styles map.
// Styles map is cleared before insertion.
//
// @param {Map.<String, String>} stylesMap Map to insert parsed properties and values.
// @param {String} stylesString Styles to parse.
function parseInlineStyles( stylesMap, stylesString ) {
	// `null` if no quote was found in input string or last found quote was a closing quote. See below.
	let quoteType = null;
	let propertyNameStart = 0;
	let propertyValueStart = 0;
	let propertyName = null;

	stylesMap.clear();

	// Do not set anything if input string is empty.
	if ( stylesString === '' ) {
		return;
	}

	// Fix inline styles that do not end with `;` so they are compatible with algorithm below.
	if ( stylesString.charAt( stylesString.length - 1 ) != ';' ) {
		stylesString = stylesString + ';';
	}

	// Seek the whole string for "special characters".
	for ( let i = 0; i < stylesString.length; i++ ) {
		const char = stylesString.charAt( i );

		if ( quoteType === null ) {
			// No quote found yet or last found quote was a closing quote.
			switch ( char ) {
				case ':':
					// Most of time colon means that property name just ended.
					// Sometimes however `:` is found inside property value (for example in background image url).
					if ( !propertyName ) {
						// Treat this as end of property only if property name is not already saved.
						// Save property name.
						propertyName = stylesString.substr( propertyNameStart, i - propertyNameStart );
						// Save this point as the start of property value.
						propertyValueStart = i + 1;
					}

					break;

				case '"':
				case '\'':
					// Opening quote found (this is an opening quote, because `quoteType` is `null`).
					quoteType = char;

					break;

				case ';': {
					// Property value just ended.
					// Use previously stored property value start to obtain property value.
					const propertyValue = stylesString.substr( propertyValueStart, i - propertyValueStart );

					if ( propertyName ) {
						// Save parsed part.
						stylesMap.set( propertyName.trim(), propertyValue.trim() );
					}

					propertyName = null;

					// Save this point as property name start. Property name starts immediately after previous property value ends.
					propertyNameStart = i + 1;

					break;
				}
			}
		} else if ( char === quoteType ) {
			// If a quote char is found and it is a closing quote, mark this fact by `null`-ing `quoteType`.
			quoteType = null;
		}
	}
}

// Parses class attribute and puts all classes into classes set.
// Classes set s cleared before insertion.
//
// @param {Set.<String>} classesSet Set to insert parsed classes.
// @param {String} classesString String with classes to parse.
function parseClasses( classesSet, classesString ) {
	const classArray = classesString.split( /\s+/ );
	classesSet.clear();
	classArray.forEach( name => classesSet.add( name ) );
}

// Converts strings to Text and non-iterables to arrays.
//
// @param {String|module:engine/view/item~Item|Iterable.<String|module:engine/view/item~Item>}
// @returns {Iterable.<module:engine/view/node~Node>}
function normalize( nodes ) {
	// Separate condition because string is iterable.
	if ( typeof nodes == 'string' ) {
		return [ new Text( nodes ) ];
	}

	if ( !isIterable( nodes ) ) {
		nodes = [ nodes ];
	}

	// Array.from to enable .map() on non-arrays.
	return Array.from( nodes )
		.map( node => {
			if ( typeof node == 'string' ) {
				return new Text( node );
			}

			if ( node instanceof TextProxy ) {
				return new Text( node.data );
			}

			return node;
		} );
}
