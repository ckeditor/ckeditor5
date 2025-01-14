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
import { groupBy } from 'lodash-es';
import type { SkinToneId } from './ui/emojitoneview.js';

// An endpoint from which the emoji database will be downloaded during plugin initialization.
const EMOJI_DATABASE_URL = 'https://cdn.ckeditor.com/ckeditor5/data/emoji/16/en.json';

const skinToneMap: Record<number, SkinToneId> = {
	0: 'default',
	1: 'light',
	2: 'medium-light',
	3: 'medium',
	4: 'medium-dark',
	5: 'dark'
};

const BASELINE_EMOJI_WIDTH = 24;

/**
 * The emoji database plugin.
 *
 * Loads the emoji database from URL during plugin initialization and provides utility methods to search it.
 */
export default class EmojiDatabase extends Plugin {
	/**
	 * Emoji database.
	 */
	private _emojiDatabase: Array<MappedEmojiDatabaseEntry>;

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
		const container = createEmojiWidthTestingContainer();

		this._emojiDatabase = ( await loadEmojiDatabase() )
			.filter( item => {
				// Category group=2 contains skin tones only.
				// It represents invalid elements which we do not want to render.
				return item.group !== 2;
			} )
			.filter( item => {
				const emojiWidth = getNodeWidth( container, item.emoji );

				// On Windows, some supported emoji are ~50% bigger than the baseline emoji, but what we really want to guard
				// against are the ones that are 2x the size, because those are truly broken (person with red hair = person with
				// floating red wig, black cat = cat with black square, polar bear = bear with snowflake, etc.)
				// So here we set the threshold at 1.8 times the size of the baseline emoji.
				return ( emojiWidth / 1.8 < BASELINE_EMOJI_WIDTH ) && ( emojiWidth >= BASELINE_EMOJI_WIDTH );
			} )
			.map( item => {
				const entry = {
					...item,
					skins: {
						default: item.emoji
					}
				};

				if ( item.skins ) {
					item.skins.forEach( skin => {
						const skinTone = skinToneMap[ skin.tone ];

						entry.skins[ skinTone ] = skin.emoji;
					} );
				}

				return entry;
			} );

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

		container.remove();
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

	public getEmojiGroups(): Arrary<EmojiCategory> {
		const categories = [
			{ title: 'Smileys & Expressions', icon: '😀', groupId: 0 },
			{ title: 'Gestures & People', icon: '👋', groupId: 1 },
			{ title: 'Animals & Nature', icon: '🐻', groupId: 3 },
			{ title: 'Food & Drinks', icon: '🍎', groupId: 4 },
			{ title: 'Travel & Places', icon: '🚘', groupId: 5 },
			{ title: 'Activities', icon: '🏀', groupId: 6 },
			{ title: 'Objects', icon: '💡', groupId: 7 },
			{ title: 'Symbols', icon: '🟢', groupId: 8 },
			{ title: 'Flags', icon: '🏁', groupId: 9 }
		];

		const groups = groupBy( this._emojiDatabase, 'group' );

		return categories.map( category => {
			return {
				...category,
				items: groups[ category.groupId ]
			};
		} );
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

/**
 * Creates a div for emoji width testing purposes.
 */
function createEmojiWidthTestingContainer(): HTMLDivElement {
	const container = document.createElement( 'div' );

	container.setAttribute( 'aria-hidden', 'true' );
	container.style.position = 'absolute';
	container.style.left = '-9999px';
	container.style.whiteSpace = 'nowrap';
	container.style.fontSize = BASELINE_EMOJI_WIDTH + 'px';
	document.body.appendChild( container );

	return container;
}

/**
 * Returns the width of the provided node.
 */
function getNodeWidth( container: HTMLDivElement, node: string ): number {
	const span = document.createElement( 'span' );
	span.textContent = node;
	container.appendChild( span );
	const nodeWidth = span.offsetWidth;
	container.removeChild( span );

	return nodeWidth;
}

export interface EmojiCategory {
	title: string;
	icon: string;
	groupId: number;
	items: Array<EmojiDatabaseEntry>;
}

export interface EmojiDatabaseEntry {
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

export interface MappedEmojiDatabaseEntry extends EmojiDatabaseEntry {
	skins: Record<SkinToneId, string>
}

export interface EmojiSkin {
	emoji: string;
	tone: EmojiSkinTone;
	version: number;
}

export enum EmojiSkinTone {
	Default = 0,
	Light = 1,
	MediumLight = 2,
	Medium = 3,
	MediumDark = 4,
	Dark = 5
}
