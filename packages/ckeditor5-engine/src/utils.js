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

CKEDITOR.define( function() {
	var utils = {
		/**
		 * Extends one JavaScript object with the properties defined in one or more objects. Existing properties are
		 * overridden.
		 *
		 * @param {Object} target The object to be extended.
		 * @param {Object} source One or more objects which properties will be copied (by reference) to `target`.
		 * @returns {Object} The `target` object.
		 */
		extend: function( target, source ) {
			if ( !this.isObject( source ) && !this.isFunction( source ) ) {
				return target;
			}

			if ( arguments.length > 2 ) {
				var args = Array.prototype.splice.call( arguments, 1 );

				while ( args.length ) {
					this.extend( target, args.shift() );
				}
			} else {
				var keys = Object.keys( source );

				while ( keys.length ) {
					var key = keys.shift();
					target[ key ] = source[ key ];
				}
			}

			return target;
		},

		/**
		 * Checks if the provided object is a JavaScript function.
		 *
		 * @param obj The object to be checked.
		 * @returns {Boolean} `true` if the provided object is a JavaScript function. Otherwise `false`.
		 */
		isFunction: function( obj ) {
			return typeof obj == 'function';
		},

		/**
		 * Checks if the provided object is a "pure" JavaScript object. In other words, if it is not any other
		 * JavaScript native type, like Number or String.
		 *
		 * @param obj The object to be checked.
		 * @returns {Boolean} `true` if the provided object is a "pure" JavaScript object. Otherwise `false`.
		 */
		isObject: function( obj ) {
			return typeof obj === 'object' && !!obj;
		},

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
