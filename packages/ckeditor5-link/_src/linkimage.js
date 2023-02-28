/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module link/linkimage
 */

import { Plugin } from 'ckeditor5/src/core';
import LinkImageEditing from './linkimageediting';
import LinkImageUI from './linkimageui';

import '../theme/linkimage.css';

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
