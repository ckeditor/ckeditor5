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

/**
 * The emoji database plugin.
 *
 * Loads the emoji database from CDN and provides utility methods to search it.
 */
export default class EmojiDatabase extends Plugin {
	private _emojiDatabase: Array<EmojiDatabaseEntry>;
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
					weight: 10
				},
				{
					name: 'annotation',
					weight: 5
				},
				{
					name: 'tags',
					weight: 1
				}
			],
			threshold: 0.2,
			ignoreLocation: true
		} );
	}

	public getEmojiBySearchQuery( searchQuery: string ): Array<EmojiDatabaseEntry> {
		const searchQueryTokens = searchQuery.split( ' ' ).filter( Boolean );

		return this._fuseSearch!
			.search( {
				'$or': [
					{ emoticon: searchQuery },
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

	public getEmojiByGroup( group: number ): Array<EmojiDatabaseEntry> {
		return this._emojiDatabase.filter( entry => entry.group === group );
	}
}

async function loadEmojiDatabase(): Promise<Array<EmojiDatabaseEntry>> {
	const endpoint = 'https://cdn.ckeditor.com/ckeditor5/data/emoji/16/en.json';
	const response = await fetch( endpoint );

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
