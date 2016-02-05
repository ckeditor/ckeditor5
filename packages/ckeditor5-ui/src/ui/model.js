/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import extend from '../lib/lodash/extend.js';
import utils from '../utils.js';
import ObservableMixin from '../observablemixin.js';

/**
 * The base MVC model class.
 *
 * @class core.ui.Model
 * @mixins core.ObservableMixin
 */

export default class Model {
	/**
	 * Creates a new Model instance.
	 *
	 * @param {Object} [attributes] The model state attributes to be defined during the instance creation.
	 * @param {Object} [properties] The (out of state) properties to be appended to the instance during creation.
	 * @method constructor
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

utils.mix( Model, ObservableMixin );
