/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Manages UI Controllers.
 *
 * @class ControllerCollection
 * @extends Collection
 */
CKEDITOR.define( [
	'collection',
	'ckeditorerror'
], ( Collection, CKEditorError ) => {
	class ControllerCollection extends Collection {
		/**
		 * Creates an instance of the ControllerCollection class, initializing it with a name.
		 *
		 * @constructor
		 */
		constructor( name ) {
			super();

			if ( !name ) {
				/**
				 * ControllerCollection must be initialized with a name.
				 *
				 * @error ui-controllercollection-no-name
				 */
				throw new CKEditorError( 'ui-controllercollection-no-name: ControllerCollection must be initialized with a name.' );
			}

			this.name = name;
		}

	}

	return ControllerCollection;
} );
