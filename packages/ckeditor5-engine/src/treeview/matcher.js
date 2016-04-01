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
	 * @param {Object} [patterns.attribute]
	 * @param {String|Array.<String>} [patterns.class] Class name or array of class names to match.
	 * @param {Object} [patterns.style]
	 */
	add( ...patterns ) {
		for ( let pattern of patterns ) {
			// String pattern is used as element's name.
			if ( typeof pattern == 'string' ) {
				pattern = { name: pattern };
			}

			// Single class name can be provided.
			if ( pattern.class && typeof pattern.class == 'string' ) {
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
		for ( let element in elements ) {
			for ( let pattern of this._patterns ) {
				let isMath = isElementMatching( element, pattern );

				if ( isMath ) {
					return true;
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
	if ( pattern.name && pattern.name !== element.name ) {
		return false;
	}

	// Check element's attributes.
	if ( pattern.attribute ) {
		for ( let name in pattern.attribute ) {
			if ( !element.hasAttribute( name ) || element.getAttribute( name ) !== pattern.attribute[ name ] ) {
				return false;
			}
		}
	}

	// Check element's classes.
	if ( pattern.class ) {
		if ( !element.hasClass( ...pattern.class ) ) {
			return false;
		}
	}

	// Check element's styles.
	if ( pattern.style ) {
		for ( let key in pattern.style ) {
			if ( !element.hasStyle( key ) || element.getStyle( key ) !== pattern.style[ name ] ) {
				return false;
			}
		}
	}

	return true;
}