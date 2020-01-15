/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/stylesmap
 */

import { get, isObject, merge, set, unset } from 'lodash-es';

/**
 * Styles class.
 *
 * Handles styles normalization.
 */
export default class StylesMap {
	/**
	 * Creates Styles instance.
	 */
	constructor() {
		/**
		 * Keeps and internal representation of styles map. Normalized styles are kept as object tree to allow unified modification and
		 * value access model using lodash's get, set, unset, etc methods.
		 *
		 * When no style processor rules are defined the it acts as simple key-value storage.
		 *
		 * @type {Object}
		 * @private
		 */
		this._styles = {};

		// Hide _styleProcessor from the watchdog by making this property non-enumarable. Watchdog checks errors for their editor origin
		// by checking if two objects are connected through properties. Using singleton is against this check as it would detect
		// that two editors are connected through single style processor instance.
		Object.defineProperty( this, '_styleProcessor', {
			get() {
				return StylesMap._styleProcessor;
			},
			enumerable: false
		} );
	}

	/**
	 * Returns true if style map has no styles set.
	 *
	 * @returns {Boolean}
	 */
	get isEmpty() {
		const entries = Object.entries( this._styles );
		const from = Array.from( entries );

		return !from.length;
	}

	/**
	 * Number of styles defined.
	 *
	 * @type {Number}
	 */
	get size() {
		if ( this.isEmpty ) {
			return 0;
		}

		return this.getStyleNames().length;
	}

	/**
	 * Set styles map to a new value.
	 *
	 *		styles.setTo( 'border:1px solid blue;margin-top:1px;' );
	 *
	 * @param {String} inlineStyle
	 */
	setTo( inlineStyle ) {
		this.clear();

		const parsedStyles = Array.from( parseInlineStyles( inlineStyle ).entries() );

		for ( const [ key, value ] of parsedStyles ) {
			this._styleProcessor.toNormalizedForm( key, value, this._styles );
		}
	}

	/**
	 * Checks if a given style is set.
	 *
	 *		styles.setTo( 'margin-left:1px;' );
	 *
	 *		styles.has( 'margin-left' );    // returns true
	 *		styles.has( 'padding' );        // returns false
	 *
	 * *Note:* This check supports normalized style names.
	 *
	 *		// Enable 'margin' shorthand processing:
	 *		editor.editing.view.document.addStyleProcessorRules( addMarginRules );
	 *
	 *		styles.setTo( 'margin:2px;' );
	 *
	 *		styles.has( 'margin' );         // returns true
	 *		styles.has( 'margin-top' );     // returns true
	 *		styles.has( 'margin-left' );    // returns true
	 *
	 *		styles.remove( 'margin-top' );
	 *
	 *		styles.has( 'margin' );         // returns false
	 *		styles.has( 'margin-top' );     // returns false
	 *		styles.has( 'margin-left' );    // returns true
	 *
	 * @param {String} name Style name.
	 * @returns {Boolean}
	 */
	has( name ) {
		if ( this.isEmpty ) {
			return false;
		}

		const styles = this._styleProcessor.getReducedForm( name, this._styles );

		const propertyDescriptor = styles.find( ( [ property ] ) => property === name );

		// Only return a value if it is set;
		return Array.isArray( propertyDescriptor );
	}

	/**
	 * Sets a given style.
	 *
	 * Can insert one by one
	 *
	 *		styles.set( 'color', 'blue' );
	 *		styles.set( 'margin-right', '1em' );
	 *
	 * or many styles at once:
	 *
	 *		styles.set( {
	 *			color: 'blue',
	 *			'margin-right': '1em'
	 *		} );
	 *
	 * *Note:* This method supports normalized styles if defined.
	 *
	 *		// Enable 'margin' shorthand processing:
	 *		editor.editing.view.document.addStyleProcessorRules( addMarginRules );
	 *
	 *		styles.set( 'margin', '2px' );
	 *
	 * The above code will set margin to a normalized value:
	 *
	 *		const margin = {
	 *			top: '2px',
	 *			right: '2px',
	 *			bottom: '2px',
	 *			left: '2px',
	 *		};
	 *
	 * This method allows also to set normalized values directly:
	 *
	 *		styles.set( 'border-color', { top: 'blue' } );
	 *		styles.set( 'margin', { right: '2em' } );
	 *
	 * @param {String|Object} nameOrObject Style property name or object with multiple properties.
	 * @param {String|Object} valueOrObject Value to set.
	 */
	set( nameOrObject, valueOrObject ) {
		if ( isObject( nameOrObject ) ) {
			for ( const [ key, value ] of Object.entries( nameOrObject ) ) {
				this._styleProcessor.toNormalizedForm( key, value, this._styles );
			}
		} else {
			this._styleProcessor.toNormalizedForm( nameOrObject, valueOrObject, this._styles );
		}
	}

	/**
	 * Removes given style.
	 *
	 *		styles.setTo( 'background:#f00;margin-right:2px;' );
	 *
	 *		styles.remove( 'background' );
	 *
	 *		styles.toString();   // returns 'margin-right:2px;'
	 *
	 * *Note:* This method supports normalized styles if defined.
	 *
	 *		// Enable 'margin' shorthand processing:
	 *		editor.editing.view.document.addStyleProcessorRules( addMarginRules );
	 *
	 *		styles.setTo( 'margin:1px' );
	 *
	 *		styles.remove( 'margin-top' );
	 *		styles.remove( 'margin-right' );
	 *
	 *		styles.toString();   // returns 'margin-bottom:1px;margin-left:1px;'
	 *
	 * @param {String} name Style name.
	 */
	remove( name ) {
		unset( this._styles, toPath( name ) );
		delete this._styles[ name ];
	}

	/**
	 * Returns a normalized style object or a single value.
	 *
	 *		// Enable 'margin' shorthand processing:
	 *		editor.editing.view.document.addStyleProcessorRules( addMarginRules );
	 *
	 *		const styles = new Styles();
	 *		styles.setTo( 'margin:1px 2px 3em;' );
	 *
	 *		console.log( styles.getNormalized( 'margin' ) );
	 *		// will log:
	 *		// {
	 *		//     top: '1px',
	 *		//     right: '2px',
	 *		//     bottom: '3em',
	 *		//     left: '2px'     // normalized value from margin shorthand
	 *		// }
	 *
	 *		console.log( styles.getNormalized( 'margin-left' ) ); // will log '2px'
	 *
	 * *Note*: This method will only return normalized styles if a style processor was defined.
	 *
	 * @param {String} name Style name.
	 * @returns {Object|String|undefined}
	 */
	getNormalized( name ) {
		return this._styleProcessor.getNormalized( name, this._styles );
	}

	/**
	 * Returns a normalized style string. Styles are sorted by name.
	 *
	 *		styles.set( 'margin' , '1px' );
	 *		styles.set( 'background', '#f00' );
	 *
	 *		styles.toString();
	 *	 	// Will return: 'background:#f00;margin:1px;'
	 *
	 * *Note:* This method supports normalized styles if defined.
	 *
	 *		// Enable 'margin' shorthand processing:
	 *		editor.editing.view.document.addStyleProcessorRules( addMarginRules );
	 *
	 *		styles.set( 'margin' , '1px' );
	 *		styles.set( 'background', '#f00' );
	 *		styles.remove( 'margin-top' );
	 *		styles.remove( 'margin-right' );
	 *
	 *		styles.toString();
	 *	 	// Will return: 'background:#f00;margin-bottom:1px;margin-left:1px;'
	 *
	 * @returns {String}
	 */
	toString() {
		if ( this.isEmpty ) {
			return '';
		}

		return this._getStylesEntries()
			.map( arr => arr.join( ':' ) )
			.sort()
			.join( ';' ) + ';';
	}

	/**
	 * Returns property as a value string or undefined if property is not set.
	 *
	 *		// Enable 'margin' shorthand processing:
	 *		editor.editing.view.document.addStyleProcessorRules( addMarginRules );
	 *
	 *		const styles = new Styles();
	 *		styles.setTo( 'margin:1px;' );
	 *		styles.set( 'margin-bottom:3em;' );
	 *
	 *		styles.getAsString( 'margin' );
	 *		// will return 'margin: 1px 1px 3em;'
	 *
	 * *Note*: To get normalized version of a longhand property use {@link #getNormalized} method.
	 *
	 * @param {String} propertyName
	 * @returns {String|undefined}
	 */
	getAsString( propertyName ) {
		if ( this.isEmpty ) {
			return;
		}

		if ( this._styles[ propertyName ] && !isObject( this._styles[ propertyName ] ) ) {
			// Try return styles set directly - values that are not parsed.
			return this._styles[ propertyName ];
		}

		const styles = this._styleProcessor.getReducedForm( propertyName, this._styles );

		const propertyDescriptor = styles.find( ( [ property ] ) => property === propertyName );

		// Only return a value if it is set;
		if ( Array.isArray( propertyDescriptor ) ) {
			return propertyDescriptor[ 1 ];
		}
	}

	/**
	 * Returns style properties names as the would appear when using {@link #toString}
	 *
	 * @returns {Array.<String>}
	 */
	getStyleNames() {
		if ( this.isEmpty ) {
			return [];
		}

		const entries = this._getStylesEntries();

		return entries.map( ( [ key ] ) => key );
	}

	/**
	 * Removes all styles.
	 */
	clear() {
		this._styles = {};
	}

	/**
	 * Returns normalized styles entries for further processing.
	 *
	 * @private
	 * @returns {Array.<String, String>}
	 */
	_getStylesEntries() {
		const parsed = [];

		const keys = Object.keys( this._styles );

		for ( const key of keys ) {
			parsed.push( ...this._styleProcessor.getReducedForm( key, this._styles ) );
		}

		return parsed;
	}

	/**
	 * Returns global StylesProcessor instance.
	 *
	 * @returns {module:engine/view/stylesmap~StylesProcessor}
	 * @private
	 */
	static get _styleProcessor() {
		if ( !this._processor ) {
			this._processor = new StylesProcessor();
		}

		return this._processor;
	}

	/**
	 * Set new StylesProcessor instance.
	 *
	 * This is an internal method used mostly in tests.
	 *
	 * @param processor
	 * @protected
	 */
	static _setProcessor( processor ) {
		this._processor = processor;
	}
}

/**
 * Style processor is responsible for writing and reading a normalized styles object.
 */
export class StylesProcessor {
	/**
	 * Creates StylesProcessor instance.
	 *
	 * @private
	 */
	constructor() {
		this._normalizers = new Map();
		this._extractors = new Map();
		this._reducers = new Map();
	}

	/**
	 * Parse style string value to a normalized object and appends it to styles object.
	 *
	 *		const styles = {};
	 *
	 *		stylesProcessor.toNormalizedForm( 'margin', '1px', styles );
	 *
	 *		// styles will consist: { margin: { top: '1px', right: '1px', bottom: '1px', left: '1px; } }
	 *
	 * *Note*: To define normalizer callbacks use {@link #setNormalizer}.
	 *
	 * @param {String} name Name of style property.
	 * @param {String} propertyValue Value of style property.
	 * @param {Object} styles Object holding normalized styles.
	 */
	toNormalizedForm( name, propertyValue, styles ) {
		if ( isObject( propertyValue ) ) {
			appendStyleValue( styles, toPath( name ), propertyValue );

			return;
		}

		if ( this._normalizers.has( name ) ) {
			const normalizer = this._normalizers.get( name );

			const { path, value } = normalizer( propertyValue );

			appendStyleValue( styles, path, value );
		} else {
			appendStyleValue( styles, name, propertyValue );
		}
	}

	/**
	 * Returns a normalized version of a style property.
	 *		const styles = {
	 *			margin: { top: '1px', right: '1px', bottom: '1px', left: '1px; },
	 *			background: { color: '#f00' }
	 *		};
	 *
	 *		stylesProcessor.getNormalized( 'background' );
	 *		// will return: { color: '#f00' }
	 *
	 *		stylesProcessor.getNormalized( 'margin-top' );
	 *		// will return: '1px'
	 *
	 * *Note*: In some cases extracting single value requires defining an extractor callback {@link #setExtractor}.
	 *
	 * @param {String} name Name of style property.
	 * @param {Object} styles Object holding normalized styles.
	 * @returns {*}
	 */
	getNormalized( name, styles ) {
		if ( !name ) {
			return merge( {}, styles );
		}

		// Might be empty string.
		if ( styles[ name ] !== undefined ) {
			return styles[ name ];
		}

		if ( this._extractors.has( name ) ) {
			const extractor = this._extractors.get( name );

			if ( typeof extractor === 'string' ) {
				return get( styles, extractor );
			}

			const value = extractor( name, styles );

			if ( value ) {
				return value;
			}
		}

		return get( styles, toPath( name ) );
	}

	/**
	 * Returns a reduced form of style property form normalized object.
	 *
	 * For default margin reducer, the below code:
	 *
	 *		stylesProcessor.getReducedForm( 'margin', {
	 *			margin: { top: '1px', right: '1px', bottom: '2px', left: '1px; }
	 *		} );
	 *
	 * will return:
	 *
	 *		[
	 *			[ 'margin', '1px 1px 2px' ]
	 *		]
	 *
	 * because it might be represented as a shorthand 'margin' value. However if one of margin long hand values is missing it should return:
	 *
	 *		[
	 *			[ 'margin-top', '1px' ],
	 *			[ 'margin-right', '1px' ],
	 *			[ 'margin-bottom', '2px' ]
	 *			// the 'left' value is missing - cannot use 'margin' shorthand.
	 *		]
	 *
	 * *Note*: To define reducer callbacks use {@link #setReducer}.
	 *
	 * @param {String} name
	 * @param {String} name Name of style property.
	 * @param {Object} styles Object holding normalized styles.
	 * @returns {Array.<Array.<String, String>>}
	 */
	getReducedForm( name, styles ) {
		const normalizedValue = this.getNormalized( name, styles );

		// Might be empty string.
		if ( normalizedValue === undefined ) {
			return [];
		}

		if ( this._reducers.has( name ) ) {
			const reducer = this._reducers.get( name );

			return reducer( normalizedValue );
		}

		return [ [ name, normalizedValue ] ];
	}

	/**
	 * Adds a normalizer method for a style property.
	 *
	 * A normalizer returns describing how the value should be normalized.
	 *
	 * For instance 'margin' style is a shorthand for four margin values:
	 *
	 * - 'margin-top'
	 * - 'margin-right'
	 * - 'margin-bottom'
	 * - 'margin-left'
	 *
	 * and can be written in various ways if some values are equal to others. For instance `'margin: 1px 2em;'` is a shorthand for
	 * `'margin-top: 1px;margin-right: 2em;margin-bottom: 1px;margin-left: 2em'`.
	 *
	 * A normalizer should parse various margin notations as a single object:
	 *
	 *		const styles = {
	 *			margin: {
	 *				top: '1px',
	 *				right: '2em',
	 *				bottom: '1px',
	 *				left: '2em'
	 *			}
	 *		};
	 *
	 * Thus a normalizer for 'margin' style should return an object defining style path and value to store:
	 *
	 *		const returnValue = {
	 *			path: 'margin',
	 *			value: {
	 *				top: '1px',
	 *				right: '2em',
	 *				bottom: '1px',
	 *				left: '2em'
	 *			}
	 *		};
	 *
	 * Additionally to fully support all margin notations there should be also defined 4 normalizers for longhand margin notations. Below
	 * is an example for 'margin-top' style property normalizer:
	 *
	 *		stylesProcessor.setNormalizer( 'margin-top', valueString => {
	 *			return {
	 *				path: 'margin.top',
	 *				value: valueString
	 *			}
	 *		} );
	 *
	 * @param {String} name
	 * @param {Function} callback
	 */
	setNormalizer( name, callback ) {
		this._normalizers.set( name, callback );
	}

	/**
	 * Adds a extractor callback for a style property.
	 *
	 * Most normalized style values are stored as one level objects. It is assumed that `'margin-top'` style will be stored as:
	 *
	 *		const styles = {
	 *			margin: {
	 *				top: 'value'
	 *			}
	 *		}
	 *
	 * However, some styles can have conflicting notations and thus it might be harder to extract a style value from shorthand. For instance
	 * the 'border-top-style' can be defined using `'border-top:solid'`, `'border-style:solid none none none'` or by `'border:solid'`
	 * shorthands. The default border styles processors stores styles as:
	 *
	 *		const styles = {
	 *			border: {
	 *				style: {
	 *					top: 'solid'
	 *				}
	 *			}
	 *		}
	 *
	 * as it is better to modify border style independently from other values. On the other part the output of the border might be
	 * desired as `border-top`, `border-left`, etc notation.
	 *
	 * In the above example a reducer should return a side border value that combines style, color and width:
	 *
	 *		stylesConverter.setExtractor( 'border-top', styles => {
	 *			return {
	 *				color: styles.border.color.top,
	 *				style: styles.border.style.top,
	 *				width: styles.border.width.top
	 *			}
	 *		} );
	 *
	 * @param {String} name
	 * @param {Function|String} callbackOrPath Callback that return a requested value or path string for single values.
	 */
	setExtractor( name, callbackOrPath ) {
		this._extractors.set( name, callbackOrPath );
	}

	/**
	 * Adds a reducer callback for a style property.
	 *
	 * Reducer returns a minimal notation for given style name. For longhand properties it is not required to write a reducer as
	 * by default the direct value from style path is taken.
	 *
	 * For shorthand styles a reducer should return minimal style notation either by returning single name-value tuple or multiple tuples
	 * if a shorthand cannot be used. For instance for a margin shorthand a reducer might return:
	 *
	 *		const marginShortHandTuple = [
	 *			[ 'margin', '1px 1px 2px' ]
	 *		];
	 *
	 * or a longhand tuples for defined values:
	 *
	 *		// Considering margin.bottom and margin.left are undefined.
	 *		const marginLonghandsTuples = [
	 *			[ 'margin-top', '1px' ],
	 *			[ 'margin-right', '1px' ]
	 *		];
	 *
	 * A reducer obtains a normalized style value:
	 *
	 *		// Simplified reducer that always outputs 4 values which are always present:
	 *		stylesProcessor.setReducer( 'margin', margin => {
	 *			return [
	 *				[ 'margin', `${ margin.top } ${ margin.right } ${ margin.bottom } ${ margin.left }` ]
	 *			]
	 *		} );
	 *
	 * @param {String} name
	 * @param {Function} callback
	 */
	setReducer( name, callback ) {
		this._reducers.set( name, callback );
	}
}

// Parses inline styles and puts property - value pairs into styles map.
//
// @param {String} stylesString Styles to parse.
// @returns {Map.<String, String>} stylesMap Map of parsed properties and values.
function parseInlineStyles( stylesString ) {
	// `null` if no quote was found in input string or last found quote was a closing quote. See below.
	let quoteType = null;
	let propertyNameStart = 0;
	let propertyValueStart = 0;
	let propertyName = null;

	const stylesMap = new Map();

	// Do not set anything if input string is empty.
	if ( stylesString === '' ) {
		return stylesMap;
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

	return stylesMap;
}

// Return lodash compatible path from style name.
function toPath( name ) {
	return name.replace( '-', '.' );
}

// Appends style definition to the styles object.
//
// @param {String} nameOrPath
// @param {String|Object} valueOrObject
// @private
function appendStyleValue( stylesObject, nameOrPath, valueOrObject ) {
	let valueToSet = valueOrObject;

	if ( isObject( valueOrObject ) ) {
		valueToSet = merge( {}, get( stylesObject, nameOrPath ), valueOrObject );
	}

	set( stylesObject, nameOrPath, valueToSet );
}
