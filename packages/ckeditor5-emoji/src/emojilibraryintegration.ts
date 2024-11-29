/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module emoji/emojilibraryintegration
 */

import { Database } from 'emoji-picker-element';
import { formatEmojiId, getShowAllEmojiId } from './utils.js';
import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import emojiDataRaw from 'emoji-picker-element-data/en/emojibase/data.json';
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
	declare protected _localDataUrl: string;

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

	constructor( editor: Editor ) {
		super( editor );

		// Make it available via getter.
		this._localDataUrl = URL.createObjectURL(
			new Blob( [ JSON.stringify( emojiDataRaw ) ] )
		);
	}

	public get localDataUrl(): string {
		return this._localDataUrl;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		this._hasEmojiPicker = this.editor.plugins.has( EmojiPicker );
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		// Make sure it works as expected. In tests, after destroying a plugin, try to read this resource. It should not be possible.
		URL.revokeObjectURL( this._localDataUrl );
	}

	/**
	 * Returns the `feed()` callback for mention config.
	 */
	public getQueryEmojiFn( queryLimit: number ): ( searchQuery: string ) => Promise<Array<MentionFeedObjectItem>> {
		const emojiDatabase = new Database( {
			dataSource: this._localDataUrl
		} );

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
