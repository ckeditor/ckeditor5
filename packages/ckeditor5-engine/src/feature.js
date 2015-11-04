/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Represents a single editor instance.
 *
 * @class Editor
 * @extends Model
 */

CKEDITOR.define( [
	'plugin'
], function( Plugin ) {
	class Feature extends Plugin {
		constructor( editor ) {
			super( editor );

			this.set( 'state', false );
			this.set( 'disabled', false );
		}
	}

	return Feature;
} );

/**
 * Fired when this editor instance is destroyed. The editor at this point is not usable and this event should be used to
 * perform the clean-up in any plugin.
 *
 * @event destroy
 */
