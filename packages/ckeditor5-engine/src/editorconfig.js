/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Handles a configuration dictionary for an editor instance.
 *
 * The basic difference between {@link EditorConfig} and {@link Config} is that {@link EditorConfig#get} retrieves
 * configurations from {@link CKEDITOR#config} if they are not found.
 *
 * @class EditorConfig
 * @extends Config
 */

import CKEDITOR from '../ckeditor.js';
import Config from './config.js';

export default class EditorConfig extends Config {
	/**
	 * @inheritdoc core.Config#get
	 */
	get() {
		// Try to take it from this editor instance.
		let value = super.get.apply( this, arguments );

		// If the configuration is not defined in the instance, try to take it from CKEDITOR.config.
		if ( typeof value == 'undefined' ) {
			value = super.get.apply( CKEDITOR.config, arguments );
		}

		return value;
	}
}