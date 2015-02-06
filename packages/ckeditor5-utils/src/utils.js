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
	return {
		/**
		 * Extends one JavaScript object with the properties defined in one or more objects. Existing properties are
		 * overridden.
		 *
		 * @param {Object} target The object to be extended.
		 * @param {Object} source One or more objects which properties will be copied (by reference) to `target`.
		 * @returns {Object} The `target` object.
		 */
		extend: function( target, source ) {
			if ( !this.isObject( source ) ) {
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
} );
