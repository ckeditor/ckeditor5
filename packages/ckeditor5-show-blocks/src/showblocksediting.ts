/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module show-blocks/showblocksediting
 */

import { Plugin } from 'ckeditor5/src/core';
import ShowBlocksCommand from './showblockscommand';

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
	public init(): void {
		const { editor } = this;

		editor.commands.add( 'showBlocks', new ShowBlocksCommand( editor ) );
	}
}
