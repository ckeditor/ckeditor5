/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module full-screen/fullscreen
 */

import { Plugin } from 'ckeditor5/src/core.js';

import FullScreenUI from './fullscreenui.js';
import FullScreenEditing from './fullscreenediting.js';

/**
 * The full screen mode feature.
 */
export default class FullScreen extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ FullScreenEditing, FullScreenUI ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'FullScreen' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		console.log( 'Plugin loaded.' );
	}
}
