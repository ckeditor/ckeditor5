/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/model
 */

import { ObservableMixin, type ObservableMixinConstructor } from '@ckeditor/ckeditor5-utils';
import { extend } from 'es-toolkit/compat';

/**
 * The base MVC model class.
 */
const UIModelBase: ObservableMixinConstructor = /* #__PURE__ */ ObservableMixin();

export class UIModel extends UIModelBase {
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
