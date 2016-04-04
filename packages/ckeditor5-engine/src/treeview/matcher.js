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
				const match = isElementMatching( element, pattern );

				if ( match ) {
					return {
						element: element,
						pattern: pattern,
						match: match
					};
				}
			}
		}

		return null;
	}
}

function isElementMatching( element, pattern ) {
	const match = {};

	// If pattern is provided as function - return result of that function;
	if ( typeof pattern == 'function' ) {
		return pattern( element );
	}

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

function matchName( pattern, name ) {
	// If pattern is provided as RegExp - test against this regexp.
	if ( pattern instanceof RegExp ) {
		return pattern.test( name );
	}

	return pattern === name;
}

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

function matchClasses( patterns, element ) {
	const match = [];

	for ( let name in patterns ) {
		const pattern = patterns[ name ];

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