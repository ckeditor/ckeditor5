/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module link/linkimageui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Image from '@ckeditor/ckeditor5-image/src/image';
import LinkUI from './linkui';

export default class LinkImageUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ Image, LinkUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'LinkImageUI';
	}

	init() {
	}
}
