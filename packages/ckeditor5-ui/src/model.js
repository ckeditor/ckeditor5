/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import extend from '../utils/lib/lodash/extend.js';
import mix from '../utils/mix.js';
import ObservableMixin from '../utils/observablemixin.js';

/**
 * The base MVC model class.
 *
 * @memberOf ui
 * @mixes utils.ObservaleMixin
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
