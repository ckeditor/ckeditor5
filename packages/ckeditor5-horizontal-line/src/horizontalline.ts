/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module horizontal-line/horizontalline
 */

import { Plugin } from '@ckeditor/ckeditor5-core';
import { Widget } from '@ckeditor/ckeditor5-widget';
import { HorizontalLineEditing } from './horizontallineediting.js';
import { HorizontalLineUI } from './horizontallineui.js';

/**
 * The horizontal line feature.
 *
 * It provides the possibility to insert a horizontal line into the rich-text editor.
 *
 * For a detailed overview, check the {@glink features/horizontal-line Horizontal line feature} documentation.
 */
export class HorizontalLine extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ HorizontalLineEditing, HorizontalLineUI, Widget ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'HorizontalLine' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}
}
