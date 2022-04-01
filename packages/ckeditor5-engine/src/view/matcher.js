/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/matcher
 */

import { isPlainObject } from 'lodash-es';

import { logWarning } from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * View matcher class.
 * Instance of this class can be used to find {@link module:engine/view/element~Element elements} that match given pattern.
 */
export default class Matcher {
	/**
	 * Creates new instance of Matcher.
	 *
	 * @param {String|RegExp|Object} [pattern] Match patterns. See {@link module:engine/view/matcher~Matcher#add add method} for
	 * more information.
	 */
	constructor( ...pattern ) {
		/**
		 * @private
		 * @type {Array<String|RegExp|Object>}
		 */
		this._patterns = [];

		this.add( ...pattern );
	}

	/**
	 * Adds pattern or patterns to matcher instance.
	 *
	 *		// String.
	 *		matcher.add( 'div' );
	 *
	 *		// Regular expression.
	 *		matcher.add( /^\w/ );
	 *
	 *		// Single class.
	 *		matcher.add( {
	 *			classes: 'foobar'
	 *		} );
	 *
	 * See {@link module:engine/view/matcher~MatcherPattern} for more examples.
	 *
	 * Multiple patterns can be added in one call:
	 *
	 * 		matcher.add( 'div', { classes: 'foobar' } );
	 *
	 * @param {Object|String|RegExp|Function} pattern Object describing pattern details. If string or regular expression
	 * is provided it will be used to match element's name. Pattern can be also provided in a form
	 * of a function - then this function will be called with each {@link module:engine/view/element~Element element} as a parameter.
	 * Function's return value will be stored under `match` key of the object returned from
	 * {@link module:engine/view/matcher~Matcher#match match} or {@link module:engine/view/matcher~Matcher#matchAll matchAll} methods.
	 * @param {String|RegExp} [pattern.name] Name or regular expression to match element's name.
	 * @param {Object} [pattern.attributes] Object with key-value pairs representing attributes to match. Each object key
	 * represents attribute name. Value under that key can be either:
	 * * `true` - then attribute is just required (can be empty),
	 * * a string - then attribute has to be equal, or
	 * * a regular expression - then attribute has to match the expression.
	 * @param {String|RegExp|Array} [pattern.classes] Class name or array of class names to match. Each name can be
	 * provided in a form of string or regular expression.
	 * @param {Object} [pattern.styles] Object with key-value pairs representing styles to match. Each object key
	 * represents style name. Value under that key can be either a string or a regular expression and it will be used
	 * to match style value.
	 */
	add( ...pattern ) {
		for ( let item of pattern ) {
			// String or RegExp pattern is used as element's name.
			if ( typeof item == 'string' || item instanceof RegExp ) {
				item = { name: item };
			}

			this._patterns.push( item );
		}
	}

	/**
	 * Matches elements for currently stored patterns. Returns match information about first found
	 * {@link module:engine/view/element~Element element}, otherwise returns `null`.
	 *
	 * Example of returned object:
	 *
	 *		{
	 *			element: <instance of found element>,
	 *			pattern: <pattern used to match found element>,
	 *			match: {
	 *				name: true,
	 *				attributes: [ 'title', 'href' ],
	 *				classes: [ 'foo' ],
	 *				styles: [ 'color', 'position' ]
	 *			}
	 *		}
	 *
	 * @see module:engine/view/matcher~Matcher#add
	 * @see module:engine/view/matcher~Matcher#matchAll
	 * @param {...module:engine/view/element~Element} element View element to match against stored patterns.
	 * @returns {Object|null} result
	 * @returns {module:engine/view/element~Element} result.element Matched view element.
	 * @returns {Object|String|RegExp|Function} result.pattern Pattern that was used to find matched element.
	 * @returns {Object} result.match Object representing matched element parts.
	 * @returns {Boolean} [result.match.name] True if name of the element was matched.
	 * @returns {Array} [result.match.attributes] Array with matched attribute names.
	 * @returns {Array} [result.match.classes] Array with matched class names.
	 * @returns {Array} [result.match.styles] Array with matched style names.
	 */
	match( ...element ) {
		for ( const singleElement of element ) {
			for ( const pattern of this._patterns ) {
				const match = isElementMatching( singleElement, pattern );

				if ( match ) {
					return {
						element: singleElement,
						pattern,
						match
					};
				}
			}
		}

		return null;
	}

	/**
	 * Matches elements for currently stored patterns. Returns array of match information with all found
	 * {@link module:engine/view/element~Element elements}. If no element is found - returns `null`.
	 *
	 * @see module:engine/view/matcher~Matcher#add
	 * @see module:engine/view/matcher~Matcher#match
	 * @param {...module:engine/view/element~Element} element View element to match against stored patterns.
	 * @returns {Array.<Object>|null} Array with match information about found elements or `null`. For more information
	 * see {@link module:engine/view/matcher~Matcher#match match method} description.
	 */
	matchAll( ...element ) {
		const results = [];

		for ( const singleElement of element ) {
			for ( const pattern of this._patterns ) {
				const match = isElementMatching( singleElement, pattern );

				if ( match ) {
					results.push( {
						element: singleElement,
						pattern,
						match
					} );
				}
			}
		}

		return results.length > 0 ? results : null;
	}

	/**
	 * Returns the name of the element to match if there is exactly one pattern added to the matcher instance
	 * and it matches element name defined by `string` (not `RegExp`). Otherwise, returns `null`.
	 *
	 * @returns {String|null} Element name trying to match.
	 */
	getElementName() {
		if ( this._patterns.length !== 1 ) {
			return null;
		}

		const pattern = this._patterns[ 0 ];
		const name = pattern.name;

		return ( typeof pattern != 'function' && name && !( name instanceof RegExp ) ) ? name : null;
	}
}

// Returns match information if {@link module:engine/view/element~Element element} is matching provided pattern.
// If element cannot be matched to provided pattern - returns `null`.
//
// @param {module:engine/view/element~Element} element
// @param {Object|String|RegExp|Function} pattern
// @returns {Object|null} Returns object with match information or null if element is not matching.
function isElementMatching( element, pattern ) {
	// If pattern is provided as function - return result of that function;
	if ( typeof pattern == 'function' ) {
		return pattern( element );
	}

	const match = {};
	// Check element's name.
	if ( pattern.name ) {
		match.name = matchName( pattern.name, element.name );

		if ( !match.name ) {
			return null;
		}
	}

	// Check element's attributes.
	if ( pattern.attributes ) {
		match.attributes = matchAttributes( pattern.attributes, element );

		if ( !match.attributes ) {
			return null;
		}
	}

	// Check element's classes.
	if ( pattern.classes ) {
		match.classes = matchClasses( pattern.classes, element );

		if ( !match.classes ) {
			return false;
		}
	}

	// Check element's styles.
	if ( pattern.styles ) {
		match.styles = matchStyles( pattern.styles, element );

		if ( !match.styles ) {
			return false;
		}
	}

	return match;
}

// Checks if name can be matched by provided pattern.
//
// @param {String|RegExp} pattern
// @param {String} name
// @returns {Boolean} Returns `true` if name can be matched, `false` otherwise.
function matchName( pattern, name ) {
	// If pattern is provided as RegExp - test against this regexp.
	if ( pattern instanceof RegExp ) {
		return !!name.match( pattern );
	}

	return pattern === name;
}

// Checks if an array of key/value pairs can be matched against provided patterns.
//
// Patterns can be provided in a following ways:
// 	- a boolean value matches any attribute with any value (or no value):
//
//			pattern: true
//
//	- a RegExp expression or object matches any attribute name:
//
//			pattern: /h[1-6]/
//
//	- an object matches any attribute that has the same name as the object item's key, where object item's value is:
//		- equal to `true`, which matches any attribute value:
//
//			pattern: {
//				required: true
//			}
//
//		- a string that is equal to attribute value:
//
//			pattern: {
//				rel: 'nofollow'
//			}
//
//		- a regular expression that matches attribute value,
//
//			pattern: {
//				src: /https.*/
//			}
//
//	- an array with items, where the item is:
//		- a string that is equal to attribute value:
//
//			pattern: [ 'data-property-1', 'data-property-2' ],
//
//		- an object with `key` and `value` property, where `key` is a regular expression matching attribute name and
//		  `value` is either regular expression matching attribute value or a string equal to attribute value:
//
//			pattern: [
//				{ key: /data-property-.*/, value: true },
//				// or:
//				{ key: /data-property-.*/, value: 'foobar' },
//				// or:
//				{ key: /data-property-.*/, value: /foo.*/ }
//			]
//
// @param {Object} patterns Object with information about attributes to match.
// @param {Iterable.<String>} keys Attribute, style or class keys.
// @param {Function} valueGetter A function providing value for a given item key.
// @returns {Array|null} Returns array with matched attribute names or `null` if no attributes were matched.
function matchPatterns( patterns, keys, valueGetter ) {
	const normalizedPatterns = normalizePatterns( patterns );
	const normalizedItems = Array.from( keys );
	const match = [];

	normalizedPatterns.forEach( ( [ patternKey, patternValue ] ) => {
		normalizedItems.forEach( itemKey => {
			if (
				isKeyMatched( patternKey, itemKey ) &&
				isValueMatched( patternValue, itemKey, valueGetter )
			) {
				match.push( itemKey );
			}
		} );
	} );

	// Return matches only if there are at least as many of them as there are patterns.
	// The RegExp pattern can match more than one item.
	if ( !normalizedPatterns.length || match.length < normalizedPatterns.length ) {
		return null;
	}

	return match;
}

// Bring all the possible pattern forms to an array of arrays where first item is a key and second is a value.
//
// Examples:
//
// Boolean pattern value:
//
//		true
//
// to
//
//		[ [ true, true ] ]
//
// Textual pattern value:
//
//		'attribute-name-or-class-or-style'
//
// to
//
//		[ [ 'attribute-name-or-class-or-style', true ] ]
//
// Regular expression:
//
//		/^data-.*$/
//
// to
//
//		[ [ /^data-.*$/, true ] ]
//
// Objects (plain or with `key` and `value` specified explicitly):
//
//		{
//			src: /^https:.*$/
//		}
//
// or
//
//		[ {
//			key: 'src',
//			value: /^https:.*$/
//		} ]
//
// to:
//
//		[ [ 'src', /^https:.*$/ ] ]
//
// @param {Object|Array} patterns
// @returns {Array|null} Returns an array of objects or null if provided patterns were not in an expected form.
function normalizePatterns( patterns ) {
	if ( Array.isArray( patterns ) ) {
		return patterns.map( pattern => {
			if ( isPlainObject( pattern ) ) {
				if ( pattern.key === undefined || pattern.value === undefined ) {
					// Documented at the end of matcher.js.
					logWarning( 'matcher-pattern-missing-key-or-value', pattern );
				}

				return [ pattern.key, pattern.value ];
			}

			// Assume the pattern is either String or RegExp.
			return [ pattern, true ];
		} );
	}

	if ( isPlainObject( patterns ) ) {
		return Object.entries( patterns );
	}

	// Other cases (true, string or regexp).
	return [ [ patterns, true ] ];
}

// @param {String|RegExp} patternKey A pattern representing a key we want to match.
// @param {String} itemKey An actual item key (e.g. `'src'`, `'background-color'`, `'ck-widget'`) we're testing against pattern.
// @returns {Boolean}
function isKeyMatched( patternKey, itemKey ) {
	return patternKey === true ||
		patternKey === itemKey ||
		patternKey instanceof RegExp && itemKey.match( patternKey );
}

// @param {String|RegExp} patternValue A pattern representing a value we want to match.
// @param {String} itemKey An item key, e.g. `background`, `href`, 'rel', etc.
// @param {Function} valueGetter A function used to provide a value for a given `itemKey`.
// @returns {Boolean}
function isValueMatched( patternValue, itemKey, valueGetter ) {
	if ( patternValue === true ) {
		return true;
	}

	const itemValue = valueGetter( itemKey );

	// For now, the reducers are not returning the full tree of properties.
	// Casting to string preserves the old behavior until the root cause is fixed.
	// More can be found in https://github.com/ckeditor/ckeditor5/issues/10399.
	return patternValue === itemValue ||
		patternValue instanceof RegExp && !!String( itemValue ).match( patternValue );
}

// Checks if attributes of provided element can be matched against provided patterns.
//
// @param {Object} patterns Object with information about attributes to match. Each key of the object will be
// used as attribute name. Value of each key can be a string or regular expression to match against attribute value.
// @param {module:engine/view/element~Element} element Element which attributes will be tested.
// @returns {Array|null} Returns array with matched attribute names or `null` if no attributes were matched.
function matchAttributes( patterns, element ) {
	const attributeKeys = new Set( element.getAttributeKeys() );

	// `style` and `class` attribute keys are deprecated. Only allow them in object pattern
	// for backward compatibility.
	if ( isPlainObject( patterns ) ) {
		if ( patterns.style !== undefined ) {
			// Documented at the end of matcher.js.
			logWarning( 'matcher-pattern-deprecated-attributes-style-key', patterns );
		}
		if ( patterns.class !== undefined ) {
			// Documented at the end of matcher.js.
			logWarning( 'matcher-pattern-deprecated-attributes-class-key', patterns );
		}
	} else {
		attributeKeys.delete( 'style' );
		attributeKeys.delete( 'class' );
	}

	return matchPatterns( patterns, attributeKeys, key => element.getAttribute( key ) );
}

// Checks if classes of provided element can be matched against provided patterns.
//
// @param {Array.<String|RegExp>} patterns Array of strings or regular expressions to match against element's classes.
// @param {module:engine/view/element~Element} element Element which classes will be tested.
// @returns {Array|null} Returns array with matched class names or `null` if no classes were matched.
function matchClasses( patterns, element ) {
	// We don't need `getter` here because patterns for classes are always normalized to `[ className, true ]`.
	return matchPatterns( patterns, element.getClassNames() );
}

// Checks if styles of provided element can be matched against provided patterns.
//
// @param {Object} patterns Object with information about styles to match. Each key of the object will be
// used as style name. Value of each key can be a string or regular expression to match against style value.
// @param {module:engine/view/element~Element} element Element which styles will be tested.
// @returns {Array|null} Returns array with matched style names or `null` if no styles were matched.
function matchStyles( patterns, element ) {
	return matchPatterns( patterns, element.getStyleNames( true ), key => element.getStyle( key ) );
}

/**
 * An entity that is a valid pattern recognized by a matcher. `MatcherPattern` is used by {@link ~Matcher} to recognize
 * if a view element fits in a group of view elements described by the pattern.
 *
 * `MatcherPattern` can be given as a `String`, a `RegExp`, an `Object` or a `Function`.
 *
 * If `MatcherPattern` is given as a `String` or `RegExp`, it will match any view element that has a matching name:
 *
 *		// Match any element with name equal to 'div'.
 *		const pattern = 'div';
 *
 *		// Match any element which name starts on 'p'.
 *		const pattern = /^p/;
 *
 * If `MatcherPattern` is given as an `Object`, all the object's properties will be matched with view element properties.
 * If the view element does not meet all of the object's pattern properties, the match will not happen.
 * Available `Object` matching properties:
 *
 * Matching view element:
 *
 *		// Match view element's name using String:
 *		const pattern = { name: 'p' };
 *
 *		// or by providing RegExp:
 *		const pattern = { name: /^(ul|ol)$/ };
 *
 *		// The name can also be skipped to match any view element with matching attributes:
 *		const pattern = {
 *			attributes: {
 *				'title': true
 *			}
 *		};
 *
 * Matching view element attributes:
 *
 *		// Match view element with any attribute value.
 *		const pattern = {
 *			name: 'p',
 *			attributes: true
 *		};
 *
 *		// Match view element which has matching attributes (String).
 *		const pattern = {
 *			name: 'figure',
 *			attributes: 'title' // Match title attribute (can be empty).
 *		};
 *
 *		// Match view element which has matching attributes (RegExp).
 *		const pattern = {
 *			name: 'figure',
 *			attributes: /^data-.*$/ // Match attributes starting with `data-` e.g. `data-foo` with any value (can be empty).
 *		};
 *
 *		// Match view element which has matching attributes (Object).
 *		const pattern = {
 *			name: 'figure',
 *			attributes: {
 *				title: 'foobar',           // Match `title` attribute with 'foobar' value.
 *				alt: true,                 // Match `alt` attribute with any value (can be empty).
 *				'data-type': /^(jpg|png)$/ // Match `data-type` attribute with `jpg` or `png` value.
 *			}
 *		};
 *
 *		// Match view element which has matching attributes (Array).
 *		const pattern = {
 *			name: 'figure',
 *			attributes: [
 *				'title',    // Match `title` attribute (can be empty).
 *				/^data-*$/ // Match attributes starting with `data-` e.g. `data-foo` with any value (can be empty).
 *			]
 *		};
 *
 *		// Match view element which has matching attributes (key-value pairs).
 *		const pattern = {
 *			name: 'input',
 *			attributes: [
 *				{
 *					key: 'type',                     // Match `type` as an attribute key.
 *					value: /^(text|number|date)$/	 // Match `text`, `number` or `date` values.
 *				},
 *				{
 *					key: /^data-.*$/,                // Match attributes starting with `data-` e.g. `data-foo`.
 *					value: true                      // Match any value (can be empty).
 *				}
 *			]
 *		};
 *
 * Matching view element styles:
 *
 *		// Match view element with any style.
 *		const pattern = {
 *			name: 'p',
 *			styles: true
 *		};
 *
 *		// Match view element which has matching styles (String).
 *		const pattern = {
 *			name: 'p',
 *			styles: 'color' // Match attributes with `color` style.
 *		};
 *
 *		// Match view element which has matching styles (RegExp).
 *		const pattern = {
 *			name: 'p',
 *			styles: /^border.*$/ // Match view element with any border style.
 *		};
 *
 *		// Match view element which has matching styles (Object).
 *		const pattern = {
 *			name: 'p',
 *			styles: {
 *				color: /rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/, // Match `color` in RGB format only.
 *				'font-weight': 600,                              // Match `font-weight` only if it's `600`.
 *				'text-decoration': true                          // Match any text decoration.
 *			}
 *		};
 *
 *		// Match view element which has matching styles (Array).
 *		const pattern = {
 *			name: 'p',
 *			styles: [
 *				'color',      // Match `color` with any value.
 *				/^border.*$/ // Match all border properties.
 *			]
 *		};
 *
 *		// Match view element which has matching styles (key-value pairs).
 *		const pattern = {
 *			name: 'p',
 *			styles: [
 *				{
 *					key: 'color',                                  		// Match `color` as an property key.
 *					value: /rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/		// Match RGB format only.
 *				},
 *				{
 *					key: /^border.*$/, // Match any border style.
 *					value: true        // Match any value.
 *				}
 *			]
 *		};
 *
 * Matching view element classes:
 *
 *		// Match view element with any class.
 *		const pattern = {
 *			name: 'p',
 *			classes: true
 *		};
 *
 *		// Match view element which has matching class (String).
 *		const pattern = {
 *			name: 'p',
 *			classes: 'highlighted' // Match `highlighted` class.
 *		};
 *
 *		// Match view element which has matching classes (RegExp).
 *		const pattern = {
 *			name: 'figure',
 *			classes: /^image-side-(left|right)$/ // Match `image-side-left` or `image-side-right` class.
 *		};
 *
 *		// Match view element which has matching classes (Object).
 *		const pattern = {
 *			name: 'p',
 *			classes: {
 *				highlighted: true, // Match `highlighted` class.
 *				marker: true       // Match `marker` class.
 *			}
 *		};
 *
 *		// Match view element which has matching classes (Array).
 *		const pattern = {
 *			name: 'figure',
 *			classes: [
 *				'image',                    // Match `image` class.
 *				/^image-side-(left|right)$/ // Match `image-side-left` or `image-side-right` class.
 *			]
 *		};
 *
 *		// Match view element which has matching classes (key-value pairs).
 *		const pattern = {
 *			name: 'figure',
 *			classes: [
 *				{
 *					key: 'image', // Match `image` class.
 *					value: true
 *				},
 *				{
 *					key: /^image-side-(left|right)$/, // Match `image-side-left` or `image-side-right` class.
 *					value: true
 *				}
 *			]
 *		};
 *
 * Pattern can combine multiple properties allowing for more complex view element matching:
 *
 *		const pattern = {
 *			name: 'span',
 *			attributes: [ 'title' ],
 *			styles: {
 *				'font-weight': 'bold'
 *			},
 *			classes: 'highlighted'
 *		};
 *
 * If `MatcherPattern` is given as a `Function`, the function takes a view element as a first and only parameter and
 * the function should decide whether that element matches. If so, it should return what part of the view element has been matched.
 * Otherwise, the function should return `null`. The returned result will be included in `match` property of the object
 * returned by {@link ~Matcher#match} call.
 *
 *		// Match an empty <div> element.
 *		const pattern = element => {
 *			if ( element.name == 'div' && element.childCount > 0 ) {
 *				// Return which part of the element was matched.
 *				return { name: true };
 *			}
 *
 *			return null;
 *		};
 *
 *		// Match a <p> element with big font ("heading-like" element).
 *		const pattern = element => {
 *			if ( element.name == 'p' ) {
 *				const fontSize = element.getStyle( 'font-size' );
 *				const size = fontSize.match( /(\d+)/px );
 *
 *				if ( size && Number( size[ 1 ] ) > 26 ) {
 *					return { name: true, attribute: [ 'font-size' ] };
 *				}
 *			}
 *
 *			return null;
 *		};
 *
 * `MatcherPattern` is defined in a way that it is a superset of {@link module:engine/view/elementdefinition~ElementDefinition},
 * that is, every `ElementDefinition` also can be used as a `MatcherPattern`.
 *
 * @typedef {String|RegExp|Object|Function} module:engine/view/matcher~MatcherPattern
 *
 * @property {String|RegExp} [name] View element name to match.
 * @property {Boolean|String|RegExp|Object|Array.<String|RegExp|Object>} [classes] View element's classes to match.
 * @property {Boolean|String|RegExp|Object|Array.<String|RegExp|Object>} [styles] View element's styles to match.
 * @property {Boolean|String|RegExp|Object|Array.<String|RegExp|Object>} [attributes] View element's attributes to match.
 */

/**
 * The key-value matcher pattern is missing key or value. Both must be present.
 * Refer the documentation: {@link module:engine/view/matcher~MatcherPattern}.
 *
 * @param {Object} pattern Pattern with missing properties.
 * @error matcher-pattern-missing-key-or-value
 */

/**
 * The key-value matcher pattern for `attributes` option is using deprecated `style` key.
 *
 * Use `styles` matcher pattern option instead:
 *
 * 		// Instead of:
 * 		const pattern = {
 * 			attributes: {
 * 				key1: 'value1',
 * 				key2: 'value2',
 * 				style: /^border.*$/
 * 			}
 * 		}
 *
 * 		// Use:
 * 		const pattern = {
 * 			attributes: {
 * 				key1: 'value1',
 * 				key2: 'value2'
 * 			},
 * 			styles: /^border.*$/
 * 		}
 *
 * Refer to the {@glink updating/migration-to-29##migration-to-ckeditor-5-v2910 Migration to v29.1.0} guide
 * and {@link module:engine/view/matcher~MatcherPattern} documentation.
 *
 * @param {Object} pattern Pattern with missing properties.
 * @error matcher-pattern-deprecated-attributes-style-key
 */

/**
 * The key-value matcher pattern for `attributes` option is using deprecated `class` key.
 *
 * Use `classes` matcher pattern option instead:
 *
 * 		// Instead of:
 * 		const pattern = {
 * 			attributes: {
 * 				key1: 'value1',
 * 				key2: 'value2',
 * 				class: 'foobar'
 * 			}
 * 		}
 *
 * 		// Use:
 * 		const pattern = {
 * 			attributes: {
 * 				key1: 'value1',
 * 				key2: 'value2'
 * 			},
 * 			classes: 'foobar'
 * 		}
 *
 * Refer to the {@glink updating/migration-to-29##migration-to-ckeditor-5-v2910 Migration to v29.1.0} guide
 * and the {@link module:engine/view/matcher~MatcherPattern} documentation.
 *
 * @param {Object} pattern Pattern with missing properties.
 * @error matcher-pattern-deprecated-attributes-class-key
 */
