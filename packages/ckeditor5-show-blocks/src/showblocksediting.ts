/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module show-blocks/showblocksediting
 */

import { Plugin } from 'ckeditor5/src/core.js';
import ShowBlocksCommand from './showblockscommand.js';

/**
 * The show blocks editing plugin.
 */
export default class ShowBlocksEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ShowBlocksEditing' as const;
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
		const { editor } = this;

		editor.commands.add( 'showBlocks', new ShowBlocksCommand( editor ) );
	}
}
