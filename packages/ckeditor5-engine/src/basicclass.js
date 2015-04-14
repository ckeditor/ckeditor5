/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * A class implementing basic features useful for other classes.
 *
 * @class BasicClass
 * @mixins Emitter
 */

CKEDITOR.define( [ 'emittermixin', 'utils' ], function( EmitterMixin, utils ) {
	function BasicClass() {
	}

	// Injects the events API.
	utils.extend( BasicClass.prototype, EmitterMixin );

	/**
	 * Creates a subclass constructor based on this class.
	 *
	 * The function to becuase a subclass constructor can be passed as `proto.constructor`.
	 *
	 * @static
	 * @param {Object} [proto] Extensions to be added to the subclass prototype.
	 * @param {Object} [statics] Extension to be added as static members of the subclass constructor.
	 * @returns {Object} The subclass constructor.
	 */
	BasicClass.extend = function( proto, statics ) {
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
			proto = utils.clone( proto );
			delete proto.constructor;
			utils.extend( child.prototype, proto );
		}

		return child;
	};

	return BasicClass;
} );
