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
import type { NativeEmoji } from 'emoji-picker-element/shared.d.ts';
// @ts-expect-error This import works.
import emojiDataRaw from 'emoji-picker-element-data/en/emojibase/data.json';

/**
 * Integration with external emoji library.
 *
 * @internal
 */
export default class EmojiLibraryIntegration extends Plugin {
	private localDataUrl!: string;
	private emojiDatabase!: Database;

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
	public init(): void {
		this.localDataUrl = URL.createObjectURL(
			new Blob( [ JSON.stringify( emojiDataRaw ) ] )
		);
	}

	/**
	 * Feed function for mention config.
	 *
	 * @public
	 */
	public queryEmoji( searchQuery: string ): Promise<Array<MentionFeedObjectItem>> {
		this.emojiDatabase = new Database( {
			dataSource: this.localDataUrl
		} );

		return this.emojiDatabase.getEmojiBySearchQuery( searchQuery )
			.then( queryResult => {
				return ( queryResult as Array<NativeEmoji> ).map( emoji => {
					return {
						id: `emoji:${ emoji.annotation.replace( / /g, '_' ) }:`,
						text: emoji.unicode
					};
				} );
			} );
	}
}
