/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/matcher
 */

import { logWarning } from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import { isPlainObject } from 'lodash-es';

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
		return pattern.test( name );
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
// @param {Array} items An array of key/value pairs, e.g.:
//
//	[
//		[ 'src', 'https://example.com' ],
//		[ 'rel', 'nofollow' ]
//	]
//
// @param {Function} valueGetter A function providing value for a given item key.
// @returns {Array|null} Returns array with matched attribute names or `null` if no attributes were matched.
function matchPatterns( patterns, items, valueGetter ) {
	const normalizedPatterns = normalizePatterns( patterns );
	const normalizedItems = Array.from( items );
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

// Bring all the possible pattern forms to an array of objects with `key` and `value` property.
// For example:
//
//	{
//		src: /https:.*/
//	}
//
// to:
//
//	{
//		key: 'src',
//		value: /https:.*/
//	}
// @param {Object|Array} patterns
// @returns {Array|null} Returns an array of objects or null if provided patterns were not in an expected form.
function normalizePatterns( patterns ) {
	if ( Array.isArray( patterns ) ) {
		return patterns.map( pattern => {
			if ( isPlainObject( pattern ) ) {
				if ( pattern.key === undefined || pattern.value === undefined ) {
					// Documented at the end of matcher.js.
					logWarning( 'matcher-patterns-pattern-missing-key-or-value', pattern );
				}

				return [ pattern.key, pattern.value ];
			}

			// Assume the pattern is either String or RegExp.
			return [ pattern, true ];
		} );
	} else if ( isPlainObject( patterns ) ) {
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
		patternKey instanceof RegExp && patternKey.test( itemKey );
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

	return patternValue === itemValue || patternValue instanceof RegExp && patternValue.test( itemValue );
}

// Checks if attributes of provided element can be matched against provided patterns.
//
// @param {Object} patterns Object with information about attributes to match. Each key of the object will be
// used as attribute name. Value of each key can be a string or regular expression to match against attribute value.
// @param {module:engine/view/element~Element} element Element which attributes will be tested.
// @returns {Array|null} Returns array with matched attribute names or `null` if no attributes were matched.
function matchAttributes( patterns, element ) {
	return matchPatterns( patterns, element.getAttributeKeys(), key => element.getAttribute( key ) );
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
 *
 *		// Match view element's name.
 *		const pattern = { name: /^p/ };
 *
 *		// Match view element with any attribute value.
 *		const pattern = {
 *			attributes: true
 *		}
 *
 *		// Match view element which has matching attributes.
 *		const pattern = {
 *			attributes: {
 *				title: 'foobar',	// Attribute title should equal 'foobar'.
 *				foo: /^\w+/,		// Attribute foo should match /^\w+/ regexp.
 *				bar: true			// Attribute bar should be set (can be empty).
 *			}
 *		};
 *
 *		// Match view element which has given class.
 *		const pattern = {
 *			classes: 'foobar'
 *		};
 *
 *		// Match view element class using regular expression.
 *		const pattern = {
 *			classes: /foo.../
 *		};
 *
 *		// Multiple classes to match.
 *		const pattern = {
 *			classes: [ 'baz', 'bar', /foo.../ ]
 *		};
 *
 *		// Multiple attributes to match, value does not matter.
 *		const pattern = {
 *			attributes: [ 'title', 'href', /^data-foo.*$/ ]
 *		};
 *
 *		// Match view element which has given styles.
 *		const pattern = {
 *			styles: {
 *				position: 'absolute',
 *				color: /^\w*blue$/
 *			}
 *		};
 *
 *		// Match view element which has many custom data attributes.
 *		const pattern = {
 *			attributes: [
 *				{ key: /data-.+/, value: true }
 *			]
 *		}
 *
 *		// Pattern with multiple properties.
 *		const pattern = {
 *			name: 'span',
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
 * @property {String|RegExp|Array.<String|RegExp>} [classes] View element's class name(s) to match.
 * @property {Object} [styles] Object with key-value pairs representing styles to match.
 * Each object key represents style name. Value can be given as `String` or `RegExp`.
 * @property {Object} [attributes] Object with key-value pairs representing attributes to match.
 * Each object key represents attribute name. Value can be given as `String` or `RegExp`.
 */

/**
 * The key-value matcher pattern is missing key or value. Both must be present.
 * Refer the documentation: {@link module:engine/view/matcher~MatcherPattern}.
 *
 * @param {Object} pattern Pattern with missing properties.
 * @error matcher-patterns-pattern-missing-key-or-value
 */
