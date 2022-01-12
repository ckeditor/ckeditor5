/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/model
 */

import mix from '@ckeditor/ckeditor5-utils/src/mix';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import { extend } from 'lodash-es';

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
