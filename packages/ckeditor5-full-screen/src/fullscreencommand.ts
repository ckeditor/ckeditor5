/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module full-screen/fullscreencommand
 */

import { Command } from 'ckeditor5/src/core.js';

export default class FullScreenCommand extends Command {
	/**
	 * @observable
	 * @readonly
	*/
	public override value = false;

	public override execute(): void {
		if ( this.value ) {
			this._disableFullScreenMode();
		} else {
			this._enableFullScreenMode();
		}
	}

	private _enableFullScreenMode(): void {
		this.value = true;
	}

	private _disableFullScreenMode(): void {
		this.value = false;
	}
}
