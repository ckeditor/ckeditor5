/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/model
 */

import extend from '@ckeditor/ckeditor5-utils/src/lib/lodash/extend';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';

/**
 * The base MVC model class.
 *
 * @mixes module:utils/observablemixin~ObservableMixin
 */
export default class Model {
	/**
	 * Creates a new Model instance.
	 *
	 * @param {Object} [attributes] The model state attributes to be defined during the instance creation.
	 * @param {Object} [properties] The (out of state) properties to be appended to the instance during creation.
	 */
	constructor( attributes, properties ) {
		// Extend this instance with the additional (out of state) properties.
		if ( properties ) {
			extend( this, properties );
		}

		// Initialize the attributes.
		if ( attributes ) {
			this.set( attributes );
		}
	}
}

mix( Model, ObservableMixin );
