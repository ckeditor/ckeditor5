/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module emoji/emojilibraryintegration
 */

import { Plugin } from 'ckeditor5/src/core.js';
import type { MentionFeedObjectItem } from '@ckeditor/ckeditor5-mention';

import { Database } from 'emoji-picker-element';
// @ts-expect-error This import works.
import emojiDataRaw from 'emoji-picker-element-data/en/emojibase/data.json';

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
	 * Feed function for mention config.
	 *
	 * @public
	 */
	public queryEmoji( searchQuery: string ): Promise<Array<MentionFeedObjectItem>> {
		// TODO: Loading this url manually returns the proper object. Figure out why the Database throws NetworkError.
		const localDataUrl = URL.createObjectURL(
			new Blob( [ JSON.stringify( emojiDataRaw ) ] )
		);

		// TODO: load this only once in constructor or init, not every time while querying.
		const emojiDatabase = new Database( {
			dataSource: localDataUrl
		} );

		return emojiDatabase.ready()
			.then( () => {
				return emojiDatabase.getEmojiBySearchQuery( searchQuery );
			} )
			.then( queryResult => {
				return queryResult.map( ( emoji: any ) => { // TODO: fix type
					return {
						id: emoji.shortcodes[ 0 ],
						text: emoji.emoji
					};
				} );
			} );
	}
}
