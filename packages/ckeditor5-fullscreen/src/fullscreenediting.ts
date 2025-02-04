/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module fullscreen/fullscreenediting
 */

import { Plugin } from 'ckeditor5/src/core.js';

import FullscreenCommand from './fullscreencommand.js';

export default class FullscreenEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'FullscreenEditing' as const;
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
		this.editor.commands.add( 'fullscreen', new FullscreenCommand( this.editor ) );
	}
}
