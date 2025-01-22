/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/emojidatabase
 */

import Fuse from 'fuse.js';
import { groupBy } from 'lodash-es';

import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import { logWarning } from 'ckeditor5/src/utils.js';
import type { SkinToneId } from './emojiconfig.js';

// An endpoint from which the emoji database will be downloaded during plugin initialization.
// The `{version}` placeholder is replaced with the value from editor config.
const EMOJI_DATABASE_URL = 'https://cdn.ckeditor.com/ckeditor5/data/emoji/{version}/en.json';

const SKIN_TONE_MAP: Record<number, SkinToneId> = {
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
	private _emojiDatabase: Array<EmojiEntry>;

	/**
	 * An instance of the [Fuse.js](https://www.fusejs.io/) library.
	 */
	private _fuseSearch: Fuse<EmojiEntry> | null;

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

		this.editor.config.define( 'emoji', {
			version: 16
		} );

		this._emojiDatabase = [];
		this._fuseSearch = null;
	}

	/**
	 * @inheritDoc
	 */
	public async init(): Promise<void> {
		const emojiVersion = this.editor.config.get( 'emoji.version' )!;
		const emojiDatabaseUrl = EMOJI_DATABASE_URL.replace( '{version}', `${ emojiVersion }` );
		const emojiDatabase = await loadEmojiDatabase( emojiDatabaseUrl );

		// Skip the initialization if the emoji database download has failed.
		// An empty database prevents the initialization of other dependent plugins as well: EmojiMention and EmojiPicker.
		if ( !emojiDatabase.length ) {
			return;
		}

		const container = createEmojiWidthTestingContainer();

		// Store the emoji database after normalizing the raw data.
		this._emojiDatabase = emojiDatabase
			.filter( item => isEmojiGroupAllowed( item ) )
			.filter( item => EmojiDatabase._isEmojiSupported( item, container ) )
			.map( item => normalizeEmojiSkinTone( item ) );

		container.remove();

		// Create instance of the Fuse.js library with configured weighted search keys and disabled fuzzy search.
		this._fuseSearch = new Fuse( this._emojiDatabase, {
			keys: [
				{ name: 'emoticon', weight: 5 },
				{ name: 'annotation', weight: 3 },
				{ name: 'tags', weight: 1 }
			],
			minMatchCharLength: 2,
			threshold: 0,
			ignoreLocation: true
		} );
	}

	/**
	 * Returns an array of emoji entries that match the search query.
	 * If the emoji database is not loaded, it returns an empty array.
	 *
	 * @param searchQuery A search query to match emoji.
	 * @returns An array of emoji entries that match the search query.
	 */
	public getEmojiBySearchQuery( searchQuery: string ): Array<EmojiEntry> {
		if ( !this._fuseSearch ) {
			return [];
		}

		const searchQueryTokens = searchQuery.split( /\s/ ).filter( Boolean );

		// Perform the search only if there is at least two non-white characters next to each other.
		const shouldSearch = searchQueryTokens.some( token => token.length >= 2 );

		if ( !shouldSearch ) {
			return [];
		}

		return this._fuseSearch
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
	 * Groups all emojis by categories.
	 * If the emoji database is not loaded, it returns an empty array for each category.
	 *
	 * @returns An array of emoji entries grouped by categories.
	 */
	public getEmojiGroups(): Array<EmojiCategory> {
		const { t } = this.editor.locale;

		const categories = [
			{ title: t( 'Smileys & Expressions' ), icon: '😀', groupId: 0 },
			{ title: t( 'Gestures & People' ), icon: '👋', groupId: 1 },
			{ title: t( 'Animals & Nature' ), icon: '🐻', groupId: 3 },
			{ title: t( 'Food & Drinks' ), icon: '🍎', groupId: 4 },
			{ title: t( 'Travel & Places' ), icon: '🚘', groupId: 5 },
			{ title: t( 'Activities' ), icon: '🏀', groupId: 6 },
			{ title: t( 'Objects' ), icon: '💡', groupId: 7 },
			{ title: t( 'Symbols' ), icon: '🟢', groupId: 8 },
			{ title: t( 'Flags' ), icon: '🏁', groupId: 9 }
		];

		const groups = this.isDatabaseLoaded() ?
			groupBy( this._emojiDatabase, 'group' ) :
			null;

		return categories.map( category => {
			return {
				...category,
				items: groups ? groups[ category.groupId ] : []
			};
		} );
	}

	/**
	 * Returns an array of available skin tones.
	 */
	public getSkinTones(): Array<SkinTone> {
		const { t } = this.editor.locale;

		return [
			{ id: 'default', icon: '👋', tooltip: t( 'Default skin tone' ) },
			{ id: 'light', icon: '👋🏻', tooltip: t( 'Light skin tone' ) },
			{ id: 'medium-light', icon: '👋🏼', tooltip: t( 'Medium Light skin tone' ) },
			{ id: 'medium', icon: '👋🏽', tooltip: t( 'Medium skin tone' ) },
			{ id: 'medium-dark', icon: '👋🏾', tooltip: t( 'Medium Dark skin tone' ) },
			{ id: 'dark', icon: '👋🏿', tooltip: t( 'Dark skin tone' ) }
		];
	}

	/**
	 * Indicates whether the emoji database has been successfully downloaded and the plugin is operational.
	 */
	public isDatabaseLoaded(): boolean {
		return this._emojiDatabase.length > 0;
	}

	/**
	 * A function used to check if the given emoji is supported in the operating system.
	 *
	 * Referenced for unit testing purposes.
	 */
	private static _isEmojiSupported = isEmojiSupported;
}

/**
 * Makes the HTTP request to download the emoji database.
 */
async function loadEmojiDatabase( emojiDatabaseUrl: string ): Promise<Array<EmojiCdnResource>> {
	const result = await fetch( emojiDatabaseUrl )
		.then( response => {
			if ( !response.ok ) {
				return [];
			}

			return response.json();
		} )
		.catch( () => {
			return [];
		} );

	if ( !result.length ) {
		/**
		 * Unable to load the emoji database from CDN.
		 *
		 * TODO: It could be a problem of CKEditor 5 CDN, but also, Content Security Policy that disallow the request.
		 * It would be good to explain what to do in such a case.
		 *
		 * @error emoji-database-load-failed
		 */
		logWarning( 'emoji-database-load-failed' );
	}

	return result;
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

/**
 * Checks whether the emoji is supported in the operating system.
 */
function isEmojiSupported( item: EmojiCdnResource, container: HTMLDivElement ): boolean {
	const emojiWidth = getNodeWidth( container, item.emoji );

	// On Windows, some supported emoji are ~50% bigger than the baseline emoji, but what we really want to guard
	// against are the ones that are 2x the size, because those are truly broken (person with red hair = person with
	// floating red wig, black cat = cat with black square, polar bear = bear with snowflake, etc.)
	// So here we set the threshold at 1.8 times the size of the baseline emoji.
	return ( emojiWidth / 1.8 < BASELINE_EMOJI_WIDTH ) && ( emojiWidth >= BASELINE_EMOJI_WIDTH );
}

/**
 * Adds default skin tone property to each emoji. If emoji defines other skin tones, they are added as well.
 */
function normalizeEmojiSkinTone( item: EmojiCdnResource ): EmojiEntry {
	const entry: EmojiEntry = {
		...item,
		skins: {
			default: item.emoji
		}
	};

	if ( item.skins ) {
		item.skins.forEach( skin => {
			const skinTone = SKIN_TONE_MAP[ skin.tone ];

			entry.skins[ skinTone ] = skin.emoji;
		} );
	}

	return entry;
}

/**
 * Checks whether the emoji belongs to a group that is allowed.
 */
function isEmojiGroupAllowed( item: EmojiCdnResource ): boolean {
	// Category group=2 contains skin tones only, which we do not want to render.
	return item.group !== 2;
}

/**
 * Represents a single group of the emoji category, e.g., "Smileys & Expressions".
 */
export type EmojiCategory = {

	/**
	 * A name of the category.
	 */
	title: string;

	/**
	 * An example emoji representing items belonging to the category.
	 */
	icon: string;

	/**
	 * Group id used to assign {@link #items}.
	 */
	groupId: number;

	/**
	 * An array of emojis.
	 */
	items: Array<EmojiEntry>;
};

/**
 * Represents a single item fetched from the CDN.
 */
export type EmojiCdnResource = {
	annotation: string;
	emoji: string;
	group: number;
	order: number;
	version: number;
	emoticon?: string;
	shortcodes?: Array<string>;
	skins?: Array<{
		emoji: string;
		tone: number;
		version: number;
	}>;
	tags?: Array<string>;
};

/**
 * Represents a single emoji item used by the emoji feature.
 */
export type EmojiEntry = Omit<EmojiCdnResource, 'skins'> & {
	skins: EmojiMap;
};

/**
 * Represents mapping between a skin tone and its corresponding emoji.
 *
 * The `default` key is always present. Additional values are assigned only if an emoji supports skin tones.
 */
export type EmojiMap = { [K in Exclude<SkinToneId, 'default'>]?: string; } & {
	default: string;
};

/**
 * Represents an emoji skin tone variant.
 */
export type SkinTone = {
	id: SkinToneId;
	icon: string;
	tooltip: string;
};
