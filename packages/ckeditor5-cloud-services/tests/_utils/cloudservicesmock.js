/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

/**
 * Mocked CloudServices that
 */
export default class CloudServicesMock extends Plugin {
	init() {
		const editor = this.editor;
		const config = editor.config;

		const options = config.get( 'cloudServices' );

		for ( const optionName in options ) {
			this[ optionName ] = options[ optionName ];
		}

		this.token = {
			value: 'token'
		};
	}
}
