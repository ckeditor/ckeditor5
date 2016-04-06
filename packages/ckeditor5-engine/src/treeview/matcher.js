/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * View matcher class.
 * Instance of this class can be used to find {@link engine.treeView.Element elements} that match given pattern.
 *
 * @memberOf engine.treeView
 */
export default class Matcher {
	/**
	 * Creates new instance of Matcher.
	 *
	 * @param {String|RegExp|Object} [pattern] Match patterns. See {@link engine.treeView.Matcher#add add method} for
	 * more information.
	 */
	constructor( ...pattern ) {
		this._patterns = [];

		this.add( ...pattern );
	}

	/**
	 * Adds pattern or patterns to matcher instance.
	 *
	 * Example patterns matching element's name:
	 *
	 *		// String.
	 *		matcher.add( 'div' );
	 *		matcher.add( { name: 'div' } );
	 *
	 *		// Regular expression.
	 *		matcher.add( /^\w/ );
	 *		matcher.add( { name: /^\w/ } );
	 *
	 * Example pattern matching element's attributes:
	 *
	 *		matcher.add( {
	 *			attributes: {
	 *				title: 'foobar',
	 *				foo: /^\w+/
	 *			}
	 *		} );
	 *
	 * Example patterns matching element's classes:
	 *
	 *		// Single class.
	 *		matcher.add( {
	 *			class: 'foobar'
	 *		} );
	 *
	 *		// Single class using regular expression.
	 *		matcher.add( {
	 *			class: /foo.../
	 *		} );
	 *
	 *		// Multiple classes to match.
	 *		matcher.add( {
	 *			class: [ 'baz', 'bar', /foo.../ ]
	 *		} ):
	 *
	 * Example pattern matching element's styles:
	 *
	 *		matcher.add( {
	 *			style: {
	 *				position: 'absolute',
	 *				color: /^\w*blue$/
	 *			}
	 *		} );
	 *
	 * Example function pattern:
	 *
	 *		matcher.add( ( element ) => {
	 *			// Result of this function will be included in `match`
	 *			// property of the object returned from matcher.match() call.
	 *			if ( element.name === 'div' && element.getChildCount() > 0 ) {
	 *				return { name: true };
	 *			}
	 *
	 *			return null;
	 *		} );
	 *
	 * Multiple patterns can be added in one call:
	 *
	 * 		matcher.add( 'div', { class: 'foobar' } );
	 *
	 * @param {Object|String|RegExp|function} pattern Object describing pattern details. If string or regular expression
	 * is provided it will be used to match element's name. Pattern can be also provided in a form
	 * of a function - then this function will be called with each {@link engine.treeView.Element element} as a parameter.
	 * Function's return value will be stored under `match` key of the object returned from
	 * {@link engine.treeView.Matcher#match match} or {@link engine.treeView.Matcher#matchAll matchAll} methods.
	 * @param {String|RegExp} [pattern.name] Name or regular expression to match element's name.
	 * @param {Object} [pattern.attribute] Object with key-value pairs representing attributes to match. Each object key
	 * represents attribute name. Value under that key can be either a string or a regular expression and it will be
	 * used to match attribute value.
	 * @param {String|RegExp|Array} [pattern.class] Class name or array of class names to match. Each name can be
	 * provided in a form of string or regular expression.
	 * @param {Object} [pattern.style] Object with key-value pairs representing styles to match. Each object key
	 * represents style name. Value under that key can be either a string or a regular expression and it will be used
	 * to match style value.
	 */
	add( ...pattern ) {
		for ( let item of pattern ) {
			// String or RegExp pattern is used as element's name.
			if ( typeof item == 'string' || item instanceof RegExp ) {
				item = { name: item };
			}

			// Single class name/RegExp can be provided.
			if ( item.class && ( typeof item.class == 'string' || item.class instanceof RegExp ) ) {
				item.class = [ item.class ];
			}

			this._patterns.push( item );
		}
	}

	/**
	 * Matches elements for currently stored patterns. Returns match information about first found
	 * {@link engine.treeView.Element element}, otherwise returns `null`.
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
	 * @see engine.treeView.Matcher#add
	 * @see engine.treeView.Matcher#matchAll
	 * @param {...core.treeView.Element} element View element to match against stored patterns.
	 * @returns {Object|null} result
	 * @returns {core.treeView.Element} result.element Matched view element.
	 * @returns {Object|String|RegExp|function} result.pattern Pattern that was used to find matched element.
	 * @returns {Object} result.match Object representing matched element parts.
	 * @returns {Boolean} [result.match.name] True if name of the element was matched.
	 * @returns {Array} [result.match.attribute] Array with matched attribute names.
	 * @returns {Array} [result.match.class] Array with matched class names.
	 * @returns {Array} [result.match.style] Array with matched style names.
	 */
	match( ...element ) {
		for ( let singleElement of element ) {
			for ( let pattern of this._patterns ) {
				const match = isElementMatching( singleElement, pattern );

				if ( match ) {
					return {
						element: singleElement,
						pattern: pattern,
						match: match
					};
				}
			}
		}

		return null;
	}

	/**
	 * Matches elements for currently stored patterns. Returns array of match information with all found
	 * {@link engine.treeView.Element elements}. If no element is found - returns `null`.
	 *
	 * @see engine.treeView.Matcher#add
	 * @see engine.treeView.Matcher#match
	 * @param {...engine.treeView.Element} element View element to match against stored patterns.
	 * @returns {Array.<Object>|null} Array with match information about found elements or `null`. For more information
	 * see {@link engine.treeView.Matcher#match match method} description.
	 */
	matchAll( ...element ) {
		const results = [];

		for ( let singleElement of element ) {
			for ( let pattern of this._patterns ) {
				const match = isElementMatching( singleElement, pattern );

				if ( match ) {
					results.push( {
						element: singleElement,
						pattern: pattern,
						match: match
					} );
				}
			}
		}

		return results.length > 0 ? results : null;
	}
}

// Returns match information if {@link engine.treeView.Element element} is matching provided pattern.
// If element cannot be matched to provided pattern - returns `null`.
//
// @param {engine.treeView.Element} element
// @param {Object|String|RegExp|function} pattern
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
	if ( pattern.attribute ) {
		match.attribute = matchAttributes( pattern.attribute, element );

		if ( !match.attribute ) {
			return null;
		}
	}

	// Check element's classes.
	if ( pattern.class ) {
		match.class = matchClasses( pattern.class, element );

		if ( !match.class ) {
			return false;
		}
	}

	// Check element's styles.
	if ( pattern.style ) {
		match.style = matchStyles( pattern.style, element );

		if ( !match.style ) {
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

// Checks if attributes of provided element can be matched against provided patterns.
//
// @param {Object} patterns Object with information about attributes to match. Each key of the object will be
// used as attribute name. Value of each key can be a string or regular expression to match against attribute value.
// @param {engine.treeView.Element} element Element which attributes will be tested.
// @returns {Array|null} Returns array with matched attribute names or `null` if no attributes were matched.
function matchAttributes( patterns, element ) {
	const match = [];

	for ( let name in patterns ) {
		const pattern = patterns[ name ];

		if ( element.hasAttribute( name ) ) {
			const attribute = element.getAttribute( name );

			if ( pattern instanceof RegExp ) {
				if ( pattern.test( attribute ) ) {
					match.push( name );
				} else {
					return null;
				}
			} else if ( attribute === pattern  ) {
				match.push( name );
			} else {
				return null;
			}
		} else {
			return null;
		}
	}

	return match;
}

// Checks if classes of provided element can be matched against provided patterns.
//
// @param {Array.<String|RegExp>} patterns Array of strings or regular expressions to match against element's classes.
// @param {engine.treeView.Element} element Element which classes will be tested.
// @returns {Array|null} Returns array with matched class names or `null` if no classes were matched.
function matchClasses( patterns, element ) {
	const match = [];

	for ( let pattern of patterns ) {
		if ( pattern instanceof RegExp ) {
			const classes = element.getClassNames();

			for ( let name of classes ) {
				if ( pattern.test( name ) ) {
					match.push( name );
				}
			}

			if ( match.length === 0 ) {
				return null;
			}
		} else if ( element.hasClass( pattern ) ) {
			match.push( pattern );
		} else {
			return null;
		}
	}

	return match;
}

// Checks if styles of provided element can be matched against provided patterns.
//
// @param {Object} patterns Object with information about styles to match. Each key of the object will be
// used as style name. Value of each key can be a string or regular expression to match against style value.
// @param {engine.treeView.Element} element Element which styles will be tested.
// @returns {Array|null} Returns array with matched style names or `null` if no styles were matched.
function matchStyles( patterns, element ) {
	const match = [];

	for ( let name in patterns ) {
		const pattern = patterns[ name ];

		if ( element.hasStyle( name ) ) {
			const style = element.getStyle( name );

			if ( pattern instanceof RegExp ) {
				if ( pattern.test( style ) ) {
					match.push( name );
				} else {
					return null;
				}
			} else if ( style === pattern  ) {
				match.push( name );
			} else {
				return null;
			}
		} else {
			return null;
		}
	}

	return match;
}
