/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/emojirepository
 */

import Fuse from 'fuse.js';
import { groupBy } from 'lodash-es';

import { type Editor, Plugin } from 'ckeditor5/src/core.js';
import { logWarning } from 'ckeditor5/src/utils.js';
import EmojiUtils from './utils/emojiutils.js';
import type { SkinToneId } from './emojiconfig.js';

// An endpoint from which the emoji database will be downloaded during plugin initialization.
// The `{version}` placeholder is replaced with the value from editor config.
const EMOJI_DATABASE_URL = 'https://cdn.ckeditor.com/ckeditor5/data/emoji/{version}/en.json';

/**
 * The emoji repository plugin.
 *
 * Loads the emoji database from URL during plugin initialization and provides utility methods to search it.
 */
export default class EmojiRepository extends Plugin {
	/**
	 * An instance of the {@link module:emoji/utils/emojiutils~EmojiUtils} plugin.
	 */
	declare public emojiUtilsPlugin: EmojiUtils;

	/**
	 * A callback to resolve the {@link #_databasePromise} to control the return value of this promise.
	 */
	declare private _databasePromiseResolveCallback: ( value: boolean ) => void;

	/**
	 * An instance of the [Fuse.js](https://www.fusejs.io/) library.
	 */
	private _fuseSearch: Fuse<EmojiEntry> | null;

	/**
	 * Emoji database.
	 */
	private _database: Array<EmojiEntry>;

	/**
	 * A promise resolved after downloading the emoji database.
	 * The promise resolves with `true` when the database is successfully downloaded or `false` otherwise.
	 */
	private readonly _databasePromise: Promise<boolean>;

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ EmojiUtils ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'EmojiRepository' as const;
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
			version: 16,
			skinTone: 'default'
		} );

		this._database = [];
		this._databasePromise = new Promise<boolean>( resolve => {
			this._databasePromiseResolveCallback = resolve;
		} );

		this._fuseSearch = null;

		// TODO fix casting
		this.emojiUtilsPlugin = this.editor.plugins.get( 'EmojiUtils' ) as EmojiUtils;
	}

	/**
	 * @inheritDoc
	 */
	public async init(): Promise<void> {
		// TODO how to get rid of ! char
		const emojiUtils = this.emojiUtilsPlugin;
		const emojiVersion = this.editor.config.get( 'emoji.version' )!;
		const emojiDatabaseUrl = EMOJI_DATABASE_URL.replace( '{version}', `${ emojiVersion }` );
		const emojiDatabase = await loadEmojiDatabase( emojiDatabaseUrl );
		const emojiSupportedVersionByOs = emojiUtils.getEmojiSupportedVersionByOs();

		// Skip the initialization if the emoji database download has failed.
		// An empty database prevents the initialization of other dependent plugins, such as `EmojiMention` and `EmojiPicker`.
		if ( !emojiDatabase.length ) {
			return this._databasePromiseResolveCallback( false );
		}

		const container = emojiUtils.createEmojiWidthTestingContainer();

		// Store the emoji database after normalizing the raw data.
		this._database = emojiDatabase
			.filter( item => emojiUtils.isEmojiCategoryAllowed( item ) )
			.filter( item => emojiUtils.isEmojiSupported( item, emojiSupportedVersionByOs, container ) )
			.map( item => emojiUtils.normalizeEmojiSkinTone( item ) );

		container.remove();

		// Create instance of the Fuse.js library with configured weighted search keys and disabled fuzzy search.
		this._fuseSearch = new Fuse( this._database, {
			keys: [
				{ name: 'emoticon', weight: 5 },
				{ name: 'annotation', weight: 3 },
				{ name: 'tags', weight: 1 }
			],
			minMatchCharLength: 2,
			threshold: 0,
			ignoreLocation: true
		} );

		return this._databasePromiseResolveCallback( true );
	}

	/**
	 * Returns an array of emoji entries that match the search query.
	 * If the emoji database is not loaded, the [Fuse.js](https://www.fusejs.io/) instance is not created,
	 * hence this method returns an empty array.
	 *
	 * @param searchQuery A search query to match emoji.
	 * @returns An array of emoji entries that match the search query.
	 */
	public getEmojiByQuery( searchQuery: string ): Array<EmojiEntry> {
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
	 * If the emoji database is not loaded, it returns an empty array.
	 *
	 * @returns An array of emoji entries grouped by categories.
	 */
	public getEmojiCategories(): Array<EmojiCategory> {
		if ( !this._database.length ) {
			return [];
		}

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

		const groups = groupBy( this._database, 'group' );

		return categories.map( category => {
			return {
				...category,
				items: groups[ category.groupId ]
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
	public isReady(): Promise<boolean> {
		return this._databasePromise;
	}
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
