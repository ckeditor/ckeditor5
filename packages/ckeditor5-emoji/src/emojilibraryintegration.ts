/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module emoji/emojilibraryintegration
 */

import { Database } from 'emoji-picker-element';
import { formatEmojiId, getShowAllEmojiId } from './utils.js';
import { Plugin } from 'ckeditor5/src/core.js';
import EmojiPicker from './emojipicker.js';
import type { MentionFeedObjectItem } from '@ckeditor/ckeditor5-mention';
import type { NativeEmoji } from 'emoji-picker-element/shared.d.ts';

/**
 * Integration with external emoji library.
 *
 * @internal
 */
export default class EmojiLibraryIntegration extends Plugin {
	declare protected _hasEmojiPicker: boolean;

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
		this._hasEmojiPicker = this.editor.plugins.has( EmojiPicker );
	}

	/**
	 * Returns the `feed()` callback for mention config.
	 */
	public getQueryEmojiFn( queryLimit: number ): ( searchQuery: string ) => Promise<Array<MentionFeedObjectItem>> {
		const emojiDatabase = new Database();

		return async ( searchQuery: string ) => {
			// `getEmojiBySearchQuery()` returns nothing when querying with a single character.
			if ( searchQuery.length < 2 ) {
				return [];
			}

			const emojis = await emojiDatabase.getEmojiBySearchQuery( searchQuery )
				.then( queryResult => {
					return ( queryResult as Array<NativeEmoji> ).map( emoji => {
						const id = emoji.annotation.replace( /[ :]+/g, '_' ).toLocaleLowerCase();

						return {
							id: formatEmojiId( id ),
							text: emoji.unicode
						};
					} );
				} );

			return this._hasEmojiPicker ?
				[ ...emojis.slice( 0, queryLimit - 1 ), { id: getShowAllEmojiId(), text: searchQuery } ] :
				emojis.slice( 0, queryLimit );
		};
	}
}
