/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

export default class Matcher {
	constructor( ...patterns ) {
		this._patterns = [];

		this.add( ...patterns );
	}

	/**
	 * Adds pattern to matcher instance.
	 *
	 * @param {...Object|String} patterns Object describing pattern details or string representing element's name.
	 * @param {String} [patterns.name] Name of the element to match.
	 * @param {Array} [patterns.attribute]
	 * @param {String|Array.<String>} [patterns.class] Class name or array of class names to match.
	 * @param {Object} [patterns.style]
	 */
	add( ...patterns ) {
		for ( let pattern of patterns ) {
			// String pattern is used as element's name.
			if ( typeof pattern == 'string' ) {
				pattern = { name: pattern };
			}

			// Single class name/RegExp can be provided.
			if ( pattern.class && ( typeof pattern.class == 'string' || pattern.class instanceof RegExp ) ) {
				pattern.class = [ pattern.class ];
			}

			this._patterns.push( pattern );
		}
	}

	/**
	 * Matches elements for currently stored patterns. Returns information about first found element, otherwise returns
	 * `null`.
	 *
	 * @param {...Object} elements
	 * @returns {*}
	 */
	match( ...elements ) {
		for ( let element of elements ) {
			for ( let pattern of this._patterns ) {
				let isMath = isElementMatching( element, pattern );

				if ( isMath ) {
					return {
						element: element,
						pattern: pattern
					};
				}
			}
		}

		return null;
	}
}

function isElementMatching( element, pattern ) {
	// If pattern is provided as function - return result of that function;
	if ( typeof pattern == 'function' ) {
		return pattern( element );
	}

	// Check element's name.
	if ( pattern.name && !matchName( pattern.name, element.name ) ) {
		return false;
	}

	// Check element's attributes.
	if ( pattern.attribute && !matchAttributes( pattern.attribute, element ) ) {
		return false;
	}

	// Check element's classes.
	if ( pattern.class && !matchClasses( pattern.class, element ) ) {
		return false;
	}

	// Check element's styles.
	if ( pattern.style && !matchStyles( pattern.style, element ) ) {
		return false;
	}

	return true;
}

function matchName( pattern, name ) {
	// If pattern is provided as RegExp - test against this regexp.
	if ( pattern instanceof RegExp ) {
		return pattern.test( name );
	}

	return pattern === name;
}

function matchAttributes( patterns, element ) {
	for ( let name in patterns ) {
		const pattern = patterns[ name ];

		if ( element.hasAttribute( name ) ) {
			const attribute = element.getAttribute( name );

			if ( pattern instanceof RegExp ) {
				if ( !pattern.test( attribute ) ) {
					return false;
				}
			} else if ( attribute !== pattern  ) {
				return false;
			}
		} else {
			return false;
		}
	}

	return true;
}

function matchClasses( patterns, element ) {
	for ( let name in patterns ) {
		const pattern = patterns[ name ];

		if ( pattern instanceof RegExp ) {
			const classes = element.getClassNames();

			for ( let name of classes ) {
				if ( pattern.test( name ) ) {
					return true;
				}
			}

			return false;
		} else if ( !element.hasClass( pattern ) ) {
			return false;
		}
	}

	return true;
}

function matchStyles( patterns, element ) {
	for ( let name in patterns ) {
		const pattern = patterns[ name ];

		if ( element.hasStyle( name ) ) {
			const style = element.getStyle( name );

			if ( pattern instanceof RegExp ) {
				if ( !pattern.test( style ) ) {
					return false;
				}
			} else if ( style !== pattern  ) {
				return false;
			}
		} else {
			return false;
		}
	}

	return true;
}