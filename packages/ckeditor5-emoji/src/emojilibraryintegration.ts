/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module emoji/emojilibraryintegration
 */

import { Plugin, type Editor } from 'ckeditor5/src/core.js';

import type { MentionFeedObjectItem } from '@ckeditor/ckeditor5-mention';

import emojiMartData from '@emoji-mart/data';
import { init, SearchIndex } from 'emoji-mart';

/**
 * Integration with external emoji library.
 *
 * @internal
 */
export default class EmojiLibraryIntegration extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'EmojiLibraryIntegration' as const;
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
	constructor( editor: Editor ) {
		super( editor );

		init( { data: emojiMartData } );
	}

	/**
	 * Feed function for mention config.
	 *
	 * @public
	 */
	public queryEmoji( searchQuery: string ): Promise<Array<MentionFeedObjectItem>> {
		return SearchIndex.search( searchQuery ).then( searchResults => {
			return searchResults.map( ( emoji: any ) => {
				return {
					id: `:${ emoji.id }:`,
					text: emoji.skins[ 0 ].native
				};
			} );
		} );
	}
}
