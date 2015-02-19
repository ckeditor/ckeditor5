/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * A utilities library.
 *
 * @class utils
 * @singleton
 */

CKEDITOR.define( [ 'utils-lodash', 'lib/lodash/lodash-ckeditor' ], function( lodashIncludes, lodash ) {
	var utils = {
		/**
		 * A mixin function to be used to implement the static `extend()` method in classes. It allows for easy creation
		 * of subclasses.
		 *
		 * @param {Object} [proto] Extensions to be added to the subclass prototype.
		 * @param {Object} [statics] Additional static properties to be added to the subclass constructor.
		 * @returns {Object} When executed as a static method of a class, it returns the new subclass constructor.
		 */
		extendMixin: function( proto, statics ) {
			var that = this;
			var child = ( proto && proto.hasOwnProperty( 'constructor' ) ) ?
					proto.constructor :
					function() {
						that.apply( this, arguments );
					};

			// Copy the statics.
			utils.extend( child, this, statics );

			// Use the same prototype.
			child.prototype = Object.create( this.prototype );

			// Add the new prototype stuff.
			if ( proto ) {
				utils.extend( child.prototype, proto );
			}

			return child;
		},

		/**
		 * Creates a spy function (ala Sinon.js) that can be used to inspect call to it.
		 *
		 * The following are the present features:
		 *
		 *  * spy.called: property set to `true` if the function has been called at least once.
		 *
		 * @returns {Function} The spy function.
		 */
		spy: function() {
			var spy = function() {
				spy.called = true;
			};

			return spy;
		},

		/**
		 * Returns a unique id. This id is a number (starting from 1) which will never get repeated on successive calls
		 * to this method.
		 *
		 * @returns {Number} A number representing the id.
		 */
		uid: ( function() {
			var next = 1;

			return function() {
				return next++;
			};
		} )()
	};

	// Extend "utils" with Lo-Dash methods.
	for ( var i = 0; i < lodashIncludes.length; i++ ) {
		utils[ lodashIncludes[ i ] ] = lodash[ lodashIncludes[ i ] ];
	}

	return utils;
} );

/**
 * Creates a subclass constructor based on this class.
 *
 * @member utils
 * @method extend
 * @abstract
 * @static
 * @inheritable
 *
 * @param {Object} [proto] Extensions to be added to the subclass prototype.
 * @param {Object} [statics] Extension to be added as static members of the subclass constructor.
 * @returns {Object} The subclass constructor.
 */
