/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module line-height/lineheight
 */

import { Plugin } from 'ckeditor5/src/core.js';
import LineHeightEditing from './lineheightediting.js';
import LineHeightUI from './lineheightui.js';

/**
 * The line height plugin.
 *
 * This is a "glue" plugin that loads the {@link module:line-height/lineheightediting~LineHeightEditing line height editing feature}
 * and {@link module:line-height/lineheightui~LineHeightUI line height UI feature}.
 *
 * For a detailed overview, check the {@glink features/line-height Line height feature documentation}.
 */
export default class LineHeight extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ LineHeightEditing, LineHeightUI ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'LineHeight' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}
}
