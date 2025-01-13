/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/emojidatabase
 */

import Fuse from 'fuse.js';
import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import { logWarning } from 'ckeditor5/src/utils.js';

// An endpoint from which the emoji database will be downloaded during plugin initialization.
const EMOJI_DATABASE_URL = 'https://cdn.ckeditor.com/ckeditor5/data/emoji/16/en.json';

/**
 * The emoji database plugin.
 *
 * Loads the emoji database from URL during plugin initialization and provides utility methods to search it.
 */
export default class EmojiDatabase extends Plugin {
	/**
	 * Emoji database.
	 */
	private _emojiDatabase: Array<EmojiDatabaseEntry>;

	/**
	 * An instance of the [Fuse.js](https://www.fusejs.io/) library.
	 */
	private _fuseSearch: Fuse<EmojiDatabaseEntry> | null;

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'EmojiDatabase' as const;
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

		this._emojiDatabase = [];
		this._fuseSearch = null;
	}

	/**
	 * @inheritDoc
	 */
	public async init(): Promise<void> {
		this._emojiDatabase = await loadEmojiDatabase();

		this._fuseSearch = new Fuse( this._emojiDatabase, {
			keys: [
				{
					name: 'emoticon',
					weight: 5
				},
				{
					name: 'annotation',
					weight: 3
				},
				{
					name: 'tags',
					weight: 1
				}
			],
			minMatchCharLength: 2,
			threshold: 0,
			ignoreLocation: true
		} );
	}

	/**
	 * Returns an array of emoji entries that match the search query.
	 *
	 * @param searchQuery A search query to match emoji.
	 * @returns An array of emoji entries that match the search query.
	 */
	public getEmojiBySearchQuery( searchQuery: string ): Array<EmojiDatabaseEntry> {
		const searchQueryTokens = searchQuery.split( /\s/ ).filter( Boolean );

		// Perform the search only if there is at least two non-white characters next to each other.
		const shouldSearch = searchQueryTokens.some( token => token.length >= 2 );

		if ( !shouldSearch ) {
			return [];
		}

		return this._fuseSearch!
			.search( {
				'$or': [
					{
						emoticon: searchQuery
					},
					{
						'$and': searchQueryTokens.map( token => ( { annotation: token } ) )
					},
					{
						'$and': searchQueryTokens.map( token => ( { tags: token } ) )
					}
				]
			} )
			.map( result => result.item );
	}

	/**
	 * Returns an array of emoji entries that belong to the provided group.
	 *
	 * @param group An identifier of the emoji group.
	 * @returns An array of emoji entries that belong to the provided group.
	 */
	public getEmojiByGroup( group: number ): Array<EmojiDatabaseEntry> {
		return this._emojiDatabase.filter( entry => entry.group === group );
	}
}

/**
 * Makes the HTTP request to download the emoji database.
 *
 * @returns A promise that resolves with an array of emoji entries.
 */
async function loadEmojiDatabase(): Promise<Array<EmojiDatabaseEntry>> {
	const response = await fetch( EMOJI_DATABASE_URL );

	if ( !response.ok ) {
		/**
		 * Unable to load the emoji database from CDN.
		 *
		 * @error emoji-database-load-failed
		 */
		logWarning( 'emoji-database-load-failed' );

		return [];
	}

	return response.json();
}

interface EmojiDatabaseEntry {
	annotation: string;
	emoji: string;
	group: number;
	order: number;
	version: number;
	emoticon?: string;
	shortcodes?: Array<string>;
	skins?: Array<EmojiSkin>;
	tags?: Array<string>;
}

interface EmojiSkin {
	emoji: string;
	tone: EmojiSkinTone;
	version: number;
}

enum EmojiSkinTone {
	Default = 0,
	Light = 1,
	MediumLight = 2,
	Medium = 3,
	MediumDark = 4,
	Dark = 5
}
