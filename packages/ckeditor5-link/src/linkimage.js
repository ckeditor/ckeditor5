/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module link/linkimage
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import LinkImageEditing from './linkimageediting';
import LinkImageUI from './linkimageui';

/**
 * The `LinkImage` plugin.
 *
 * This is a "glue" plugin that loads the {@link module:link/linkimageediting~LinkImageEditing link image editing feature}
 * and {@link module:link/linkimageui~LinkImageUI link image UI feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class LinkImage extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ LinkImageEditing, LinkImageUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'LinkImage';
	}
}
