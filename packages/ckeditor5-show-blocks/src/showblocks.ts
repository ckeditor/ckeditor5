/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module show-blocks/showblocks
 */

import { Plugin } from 'ckeditor5/src/core.js';

import ShowBlocksEditing from './showblocksediting.js';
import ShowBlocksUI from './showblocksui.js';

/**
 * The show blocks feature.
 *
 * For a detailed overview, check the {@glink features/show-blocks Show blocks} feature guide.
 */
export default class ShowBlocks extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ShowBlocks' as const;
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
	public static get requires() {
		return [ ShowBlocksEditing, ShowBlocksUI ] as const;
	}
}
