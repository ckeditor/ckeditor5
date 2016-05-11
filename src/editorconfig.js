/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import CKEDITOR from '../ckeditor.js';
import Config from './utils/config.js';
import CKEditorError from './utils/ckeditorerror.js';

/**
 * Handles a configuration dictionary for an editor instance.
 *
 * The basic difference between {@link ckeditor5.EditorConfig} and {@link utils.Config} is that {@link ckeditor5.EditorConfig#get} retrieves
 * configurations from {@link CKEDITOR#config} if they are not found.
 *
 * @memberOf ckeditor5
 * @extends utils.Config
 */
export default class EditorConfig extends Config {
	/**
	 * @inheritDoc
	 */
	get() {
		let value;

		try {
			// Try to take it from this editor instance.
			value = super.get.apply( this, arguments );
		} catch ( err ) {
			// If there is an error it could be because of undefined option in configuration.
			if ( !CKEditorError.isErrorWithName( err, 'config-undefined-option' ) ) {
				// If not just throw it further.
				throw err;
			}

			// If the configuration is not defined in the instance, try to take it from CKEDITOR.config.
			value = super.get.apply( CKEDITOR.config, arguments );
		}

		return value;
	}
}
