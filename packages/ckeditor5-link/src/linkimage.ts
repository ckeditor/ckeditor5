/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module link/linkimage
 */

import { Plugin } from 'ckeditor5/src/core.js';
import LinkImageEditing from './linkimageediting.js';
import LinkImageUI from './linkimageui.js';

import '../theme/linkimage.css';

/**
 * The `LinkImage` plugin.
 *
 * This is a "glue" plugin that loads the {@link module:link/linkimageediting~LinkImageEditing link image editing feature}
 * and {@link module:link/linkimageui~LinkImageUI link image UI feature}.
 */
export default class LinkImage extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ LinkImageEditing, LinkImageUI ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'LinkImage' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}
}
