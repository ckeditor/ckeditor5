/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/emojirepository
 */

import Fuse from 'fuse.js';
import { groupBy } from 'es-toolkit/compat';

import { type Editor, Plugin } from 'ckeditor5/src/core.js';
import { logWarning, version as editorVersion } from 'ckeditor5/src/utils.js';
import EmojiUtils from './emojiutils.js';
import type { SkinToneId } from './emojiconfig.js';

// An endpoint from which the emoji data will be downloaded during plugin initialization.
// The `{version}` placeholder is replaced with the value from editor config.
const DEFAULT_EMOJI_DATABASE_URL = 'https://cdn.ckeditor.com/ckeditor5/data/emoji/{version}/en.json';

const DEFAULT_EMOJI_VERSION = 16;

/**
 * The emoji repository plugin.
 *
 * Loads the emoji repository from URL during plugin initialization and provides utility methods to search it.
 */
export default class EmojiRepository extends Plugin {
	/**
	 * A callback to resolve the {@link #_repositoryPromise} to control the return value of this promise.
	 */
	declare private _repositoryPromiseResolveCallback: ( value: boolean ) => void;

	/**
	 * An instance of the [Fuse.js](https://www.fusejs.io/) library.
	 */
	private _fuseSearch: Fuse<EmojiEntry> | null;

	/**
	 * The resolved URL from which the emoji repository is downloaded.
	 */
	private readonly _url: URL;

	/**
	 * A promise resolved after downloading the emoji collection.
	 * The promise resolves with `true` when the repository is successfully downloaded or `false` otherwise.
	 */
	private readonly _repositoryPromise: Promise<boolean>;

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

		editor.config.define( 'emoji', {
			version: undefined,
			skinTone: 'default',
			definitionsUrl: undefined
		} );

		this._url = this._getUrl();

		this._repositoryPromise = new Promise<boolean>( resolve => {
			this._repositoryPromiseResolveCallback = resolve;
		} );

		this._fuseSearch = null;
	}

	/**
	 * @inheritDoc
	 */
	public async init(): Promise<void> {
		this._warnAboutCdnUse();

		await this._loadAndCacheEmoji();

		const items = this._getItems();

		// Skip plugin initialization if the emoji repository is not available.
		// The initialization of other dependent plugins, such as `EmojiMention` and `EmojiPicker`, is prevented as well.
		if ( !items ) {
			return this._repositoryPromiseResolveCallback( false );
		}

		// Create instance of the Fuse.js library with configured weighted search keys and disabled fuzzy search.
		this._fuseSearch = new Fuse( items, {
			keys: [
				{ name: 'emoticon', weight: 5 },
				{ name: 'annotation', weight: 3 },
				{ name: 'tags', weight: 1 }
			],
			minMatchCharLength: 2,
			threshold: 0,
			ignoreLocation: true
		} );

		return this._repositoryPromiseResolveCallback( true );
	}

	/**
	 * Returns an array of emoji entries that match the search query.
	 * If the emoji repository is not loaded, the [Fuse.js](https://www.fusejs.io/) instance is not created,
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
	 * If the emoji repository is not loaded, it returns an empty array.
	 *
	 * @returns An array of emoji entries grouped by categories.
	 */
	public getEmojiCategories(): Array<EmojiCategory> {
		const repository = this._getItems();

		if ( !repository ) {
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

		const groups = groupBy( repository, item => item.group );

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
	 * Indicates whether the emoji repository has been successfully downloaded and the plugin is operational.
	 */
	public isReady(): Promise<boolean> {
		return this._repositoryPromise;
	}

	/**
	 * Returns the URL from which the emoji repository is downloaded. If the URL is not provided
	 * in the configuration, the default URL is used with the version from the configuration.
	 *
	 * If both the URL and version are provided, a warning is logged.
	 */
	private _getUrl(): URL {
		const { definitionsUrl, version } = this.editor.config.get( 'emoji' )!;

		if ( !definitionsUrl || definitionsUrl === 'cdn' ) {
			// URL was not provided or is set to 'cdn', so we use the default CDN URL.
			const urlVersion = version || DEFAULT_EMOJI_VERSION;
			const url = new URL( DEFAULT_EMOJI_DATABASE_URL.replace( '{version}', urlVersion.toString() ) );

			url.searchParams.set( 'editorVersion', editorVersion );

			return url;
		}

		if ( version ) {
			/**
			 * Both {@link module:emoji/emojiconfig~EmojiConfig#definitionsUrl `emoji.definitionsUrl`} and
			 * {@link module:emoji/emojiconfig~EmojiConfig#version `emoji.version`} configuration options
			 * are set. Only the `emoji.definitionsUrl` option will be used.
			 *
			 * The `emoji.version` option will be ignored and should be removed from the configuration.
			 *
			 * @error emoji-repository-redundant-version
			 */
			logWarning( 'emoji-repository-redundant-version' );
		}

		return new URL( definitionsUrl );
	}

	/**
	 * Warn users on self-hosted installations that this plugin uses a CDN to fetch the emoji repository.
	 */
	private _warnAboutCdnUse(): void {
		const editor = this.editor;
		const config = editor.config.get( 'emoji' );
		const licenseKey = editor.config.get( 'licenseKey' );
		const distributionChannel = ( window as any )[ Symbol.for( 'cke distribution' ) ];

		if ( licenseKey === 'GPL' ) {
			// Don't warn GPL users.
			return;
		}

		if ( distributionChannel === 'cloud' ) {
			// Don't warn cloud users, because they already use our CDN.
			return;
		}

		if ( config && config.definitionsUrl ) {
			// Don't warn users who have configured their own definitions URL.
			return;
		}

		/**
		 * By default, the Emoji plugin fetches the emoji repository from CKEditor 5 CDN. To avoid this,
		 * you can use the {@link module:emoji/emojiconfig~EmojiConfig#definitionsUrl `emoji.definitionsUrl`}
		 * configuration option to provide a URL to your own emoji repository.
		 *
		 * If you only want to suppress this warning, set this configuration option to `cdn`.
		 *
		 * @error emoji-repository-cdn-use
		 */
		logWarning( 'emoji-repository-cdn-use' );
	}

	/**
	 * Returns the emoji repository in a configured version if it is a non-empty array. Returns `null` otherwise.
	 */
	private _getItems(): Array<EmojiEntry> | null {
		const repository = EmojiRepository._results[ this._url.href ];

		return repository && repository.length ? repository : null;
	}

	/**
	 * Loads the emoji repository. If the repository is already loaded, it returns the cached result.
	 * Otherwise, it fetches the repository from the URL and adds it to the cache.
	 */
	private async _loadAndCacheEmoji(): Promise<void> {
		if ( EmojiRepository._results[ this._url.href ] ) {
			// The repository has already been downloaded.
			return;
		}

		const result: Array<EmojiCdnResource> = await fetch( this._url, { cache: 'force-cache' } )
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
			 * Unable to load the emoji repository from the URL.
			 *
			 * If the URL works properly and there is no disruption of communication, please check your
			 * {@glink getting-started/setup/csp Content Security Policy (CSP)} setting and make sure
			 * the URL connection is allowed by the editor.
			 *
			 * @error emoji-repository-load-failed
			 */
			logWarning( 'emoji-repository-load-failed' );
		}

		EmojiRepository._results[ this._url.href ] = this._normalizeEmoji( result );
	}

	/**
	 * Normalizes the raw data fetched from CDN. By normalization, we meant:
	 *
	 *  * Filter out unsupported emoji (these that will not render correctly),
	 *  * Prepare skin tone variants if an emoji defines them.
	 */
	private _normalizeEmoji( data: Array<EmojiCdnResource> ): Array<EmojiEntry> {
		const emojiUtils = this.editor.plugins.get( 'EmojiUtils' );
		const emojiSupportedVersionByOs = emojiUtils.getEmojiSupportedVersionByOs();

		const container = emojiUtils.createEmojiWidthTestingContainer();
		document.body.appendChild( container );

		const results = data
			.filter( item => emojiUtils.isEmojiCategoryAllowed( item ) )
			.filter( item => emojiUtils.isEmojiSupported( item, emojiSupportedVersionByOs, container ) )
			.map( item => emojiUtils.normalizeEmojiSkinTone( item ) );

		container.remove();

		return results;
	}

	/**
	 * Versioned emoji repository.
	 */
	private static _results: {
		[ key in string ]?: Array<EmojiEntry>
	} = {};
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
