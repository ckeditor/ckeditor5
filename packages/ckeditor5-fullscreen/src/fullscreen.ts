/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module fullscreen/fullscreen
 */

import { Plugin } from 'ckeditor5/src/core.js';

import FullscreenEditing from './fullscreenediting.js';
import FullscreenUI from './fullscreenui.js';

/**
 * The fullscreen mode feature.
 */
export default class Fullscreen extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ FullscreenEditing, FullscreenUI ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'Fullscreen' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}
}
