/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module full-screen/fullscreenediting
 */

import { Plugin } from 'ckeditor5/src/core.js';

import FullScreenCommand from './fullscreencommand.js';

export default class FullScreenEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'FullScreenEditing' as const;
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
		this.editor.commands.add( 'fullScreen', new FullScreenCommand( this.editor ) );
	}
}
