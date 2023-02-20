/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/model
 */

import { ObservableMixin } from '@ckeditor/ckeditor5-utils';
import { extend } from 'lodash-es';

/**
 * The base MVC model class.
 */
export default class Model extends ObservableMixin() {
	[ x: string ]: unknown;

	/**
	 * Creates a new Model instance.
	 *
	 * @param attributes The model state attributes to be defined during the instance creation.
	 * @param properties The (out of state) properties to be appended to the instance during creation.
	 */
	constructor( attributes?: Record<string, unknown>, properties?: Record<string, unknown> ) {
		super();

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
