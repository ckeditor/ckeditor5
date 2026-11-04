/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/emojirepository
 */

import fuzzysort from 'fuzzysort';
import { groupBy } from 'es-toolkit/compat';

import { type Editor, Plugin, type PluginDependenciesOf } from '@ckeditor/ckeditor5-core';
import { logWarning, version as editorVersion, type ObservableChangeEvent } from '@ckeditor/ckeditor5-utils';
import { EmojiUtils } from './emojiutils.js';
import { EmojiRepositoryCache } from './utils/emojirepositorycache.js';
import type { EmojiSkinToneId } from './emojiconfig.js';

// An endpoint from which the emoji data will be downloaded during plugin initialization.
// The `{version}` placeholder is replaced with the value from editor config.
const DEFAULT_EMOJI_DATABASE_URL = 'https://cdn.ckeditor.com/ckeditor5/data/emoji/{version}/en.json';

const DEFAULT_EMOJI_VERSION = 16;

/**
 * The emoji repository plugin.
 *
 * Loads the emoji repository during plugin initialization and provides utility methods to search it.
 * The repository comes from the {@link module:emoji/emojiconfig~EmojiConfig#definitions `emoji.definitions`}
 * configuration option, if provided. Otherwise, it is downloaded from URL.
 */
export class EmojiRepository extends Plugin {
	/**
	 * Whether the emoji repository has been successfully loaded.
	 *
	 * - `null` – the repository is still being loaded (initial state).
	 * - `true` – the repository has been loaded successfully.
	 * - `false` – the repository failed to load (e.g. network error or empty response).
	 */
	declare public isRepositoryReady: boolean | null;

	/**
	 * The resolved URL from which the emoji repository is downloaded.
	 *
	 * It is `null` when the emoji definitions are passed in the configuration.
	 */
	private readonly _url: URL | null;

	/**
	 * The emoji definitions passed in the configuration.
	 *
	 * It is `null` when the emoji definitions are downloaded from URL.
	 */
	private readonly _definitions: Array<EmojiDefinition> | null;

	/**
	 * The normalized emoji definitions passed in the configuration.
	 *
	 * They are stored per editor instance instead of the process-global cache, because each editor
	 * can be configured with its own set of definitions.
	 */
	private _definitionsItems: Array<EmojiEntry> | null = null;

	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependenciesOf<[ EmojiUtils ]> {
		return [ EmojiUtils ];
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
			definitionsUrl: undefined,
			definitions: undefined,
			useCustomFont: false
		} );

		this.set( 'isRepositoryReady', null );

		// Read the definitions only once. The configuration returns a deep copy of an array on each read.
		const definitions = editor.config.get( 'emoji.definitions' );

		if ( definitions ) {
			this._definitions = definitions;
			this._url = null;
			this._warnAboutRedundantOptions();
		} else {
			this._definitions = null;
			this._url = this._getUrl();
		}
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		if ( this._definitions ) {
			const definitions = this._definitions;

			// Normalize asynchronously, so the repository becomes ready in the same way as when it is downloaded.
			Promise.resolve()
				.then( () => this._normalizeEmoji( definitions ) )
				.catch( () => [] )
				.then( items => {
					this._definitionsItems = items;
					this._onRepositoryLoaded();
				} );

			return;
		}

		this._warnAboutCdnUse();

		EmojiRepository._cache
			.fetch( {
				url: this._url!.toString(),
				cacheKeys: this._cacheKeys,
				transform: raw => this._normalizeEmoji( raw )
			} )
			.then( () => this._onRepositoryLoaded() );
	}

	/**
	 * Calls `callback` once the repository finishes loading, passing the result as the argument.
	 *
	 * @param callback Receives `true` when the repository loaded successfully, `false` on failure.
	 * Note: if the editor is destroyed before loading completes, the callback may never be called.
	 * Use {@link #isReady} instead if you need a guaranteed resolution in all cases.
	 */
	public onReady( callback: ( isReady: boolean ) => void ): void {
		if ( this.editor.state === 'destroyed' ) {
			return;
		}

		if ( this.isRepositoryReady !== null ) {
			callback( this.isRepositoryReady );
			return;
		}

		this.once<ObservableChangeEvent<boolean | null>>( 'change:isRepositoryReady', ( evt, name, isReady ) => {
			callback( !!isReady );
		} );
	}

	/**
	 * Returns an array of emoji entries that match the search query.
	 * If the emoji repository is not loaded this method returns an empty array.
	 *
	 * @param searchQuery A search query to match emoji.
	 * @returns An array of emoji entries that match the search query.
	 */
	public getEmojiByQuery( searchQuery: string ): Array<EmojiEntry> {
		const items = this._getItems();

		if ( !items ) {
			return [];
		}

		const searchQueryTokens = searchQuery.split( /\s/ ).filter( Boolean );

		// Perform the search only if there is at least two non-white characters next to each other.
		const shouldSearch = searchQueryTokens.some( token => token.length >= 2 );

		if ( !shouldSearch ) {
			return [];
		}

		return fuzzysort
			.go( searchQuery, items, {
				threshold: 0.6,
				keys: [
					'emoticon',
					'annotation',
					( emojiEntry: EmojiEntry ) => {
						// Instead of searching over all tags, let's use only those that matches the query.
						// It enables searching in tags with the space character in names.
						const searchQueryTokens = searchQuery.split( /\s/ ).filter( Boolean );

						const matchedTags = searchQueryTokens.flatMap( tok => {
							return emojiEntry.tags?.filter( t => t.startsWith( tok ) );
						} );

						return matchedTags.join();
					}
				]
			} )
			.map( result => result.obj );
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
			{ title: t( 'Smileys & Expressions' ), icon: '😄', groupId: 0 },
			{ title: t( 'Gestures & People' ), icon: '👋', groupId: 1 },
			{ title: t( 'Animals & Nature' ), icon: '🐻', groupId: 3 },
			{ title: t( 'Food & Drinks' ), icon: '🍎', groupId: 4 },
			{ title: t( 'Travel & Places' ), icon: '🚘', groupId: 5 },
			{ title: t( 'Activities' ), icon: '🏀', groupId: 6 },
			{ title: t( 'Objects' ), icon: '💡', groupId: 7 },
			{ title: t( 'Symbols' ), icon: '🔵', groupId: 8 },
			{ title: t( 'Flags' ), icon: '🏁', groupId: 9 }
		];

		const groups = groupBy( repository, item => item.group );

		return categories.map( category => {
			return {
				...category,
				items: groups[ category.groupId ] || []
			};
		} );
	}

	/**
	 * Returns an array of available skin tones.
	 */
	public getSkinTones(): Array<EmojiSkinTone> {
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
	 * Returns a promise that resolves once the repository finishes loading.
	 *
	 * Resolves with `true` if the repository loaded successfully, or `false` if loading failed.
	 * Rejects if the editor was destroyed before loading completed.
	 */
	public isReady(): Promise<boolean> {
		return new Promise( ( resolve, reject ) => {
			const fail = () => reject(
				new Error( 'The editor was destroyed before the emoji repository finished loading.' )
			);

			if ( this.editor.state === 'destroyed' ) {
				fail();
			} else {
				this.onReady( resolve );
				this.editor.once( 'destroy', fail );
			}
		} );
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
		 * It was detected that your installation uses a commercial license key,
		 * and the default {@glink features/emoji#emoji-source CKEditor CDN for Emoji plugin data}.
		 *
		 * To avoid this, you can use the {@link module:emoji/emojiconfig~EmojiConfig#definitionsUrl `emoji.definitionsUrl`}
		 * configuration option to provide a URL to your own emoji repository.
		 *
		 * If you want to suppress this warning, while using the default CDN, set this configuration option to `cdn`.
		 *
		 * @error emoji-repository-cdn-use
		 */
		logWarning( 'emoji-repository-cdn-use' );
	}

	/**
	 * Returns the normalised emoji repository for this editor instance if it is
	 * a non-empty array, or `null` otherwise.
	 */
	private _getItems(): Array<EmojiEntry> | null {
		const repository = this._definitions ? this._definitionsItems : EmojiRepository._cache.getSync( {
			url: this._url!.toString(),
			cacheKeys: this._cacheKeys
		} );

		return repository && repository.length ? repository : null;
	}

	/**
	 * Updates the {@link #isRepositoryReady} flag once the repository finishes loading.
	 */
	private _onRepositoryLoaded(): void {
		if ( this.editor.state === 'destroyed' ) {
			return;
		}

		const ready = !!this._getItems();

		if ( !ready ) {
			/**
			 * Unable to identify the available emoji to display.
			 *
			 * See the {@glink features/emoji#troubleshooting troubleshooting} section in
			 * the {@glink features/emoji Emoji feature} guide for more details.
			 *
			 * @error emoji-repository-empty
			 */
			logWarning( 'emoji-repository-empty' );
		}

		this.isRepositoryReady = ready;
	}

	/**
	 * Warns about the options that are ignored because the emoji definitions are passed in the configuration.
	 */
	private _warnAboutRedundantOptions(): void {
		// Read the options separately. Reading the whole `emoji` object would also copy the `definitions` array.
		const definitionsUrl = this.editor.config.get( 'emoji.definitionsUrl' );
		const version = this.editor.config.get( 'emoji.version' );

		// The `cdn` value only suppresses the warning about using CDN. It does not point to any emoji database.
		if ( ( definitionsUrl && definitionsUrl !== 'cdn' ) || version ) {
			/**
			 * The {@link module:emoji/emojiconfig~EmojiConfig#definitions `emoji.definitions`} configuration option is set
			 * together with other options that point to the emoji database: {@link module:emoji/emojiconfig~EmojiConfig#definitionsUrl
			 * `emoji.definitionsUrl`} or {@link module:emoji/emojiconfig~EmojiConfig#version `emoji.version`}.
			 * Only the `emoji.definitions` option will be used.
			 *
			 * The other options will be ignored and should be removed from the configuration.
			 *
			 * @error emoji-repository-redundant-options
			 */
			logWarning( 'emoji-repository-redundant-options' );
		}
	}

	/**
	 * Normalizes the raw data fetched from CDN. By normalization, we meant:
	 *
	 *  * Filter out unsupported emoji (these that will not render correctly),
	 *  * Prepare skin tone variants if an emoji defines them.
	 */
	private _normalizeEmoji( data: Array<EmojiDefinition> ): Array<EmojiEntry> {
		const editor = this.editor;
		const useCustomFont = editor.config.get( 'emoji.useCustomFont' );
		const emojiUtils = editor.plugins.get( 'EmojiUtils' );

		const insertableEmoji = data.filter( item => emojiUtils.isEmojiCategoryAllowed( item ) );

		// When using a custom font, the feature does not filter any emoji.
		if ( useCustomFont ) {
			return insertableEmoji.map( item => emojiUtils.normalizeEmojiSkinTone( item ) );
		}

		const emojiSupportedVersionByOs = emojiUtils.getEmojiSupportedVersionByOs();

		const container = emojiUtils.createEmojiWidthTestingContainer();

		// The container must be attached to the main document, because widths cannot be measured in a tree
		// that is not rendered. The editor root may still be detached or hidden at this point.
		//
		// Skipping the shadow DOM check is safe here. The container is hidden, placed off-screen and removed
		// right after measuring, so it never touches the editor UI. It only checks how the system font draws
		// an emoji, which does not depend on the editor styles.
		// eslint-disable-next-line ckeditor5-rules/no-shadow-unsafe-dom-apis
		document.body.appendChild( container );

		const results = insertableEmoji
			.filter( item => emojiUtils.isEmojiSupported( item, emojiSupportedVersionByOs, container ) )
			.map( item => emojiUtils.normalizeEmojiSkinTone( item ) );

		container.remove();

		return results;
	}

	/**
	 * Cache key segments that distinguish the transformation result for this editor instance.
	 */
	private get _cacheKeys(): Array<string> {
		const useCustomFont = this.editor.config.get( 'emoji.useCustomFont' );

		return [ `useCustomFont:${ !!useCustomFont }` ];
	}

	/**
	 * Process-global cache that stores fetched emojis.
	 */
	private static _cache = new EmojiRepositoryCache();
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
 * Represents a single emoji definition, as stored in the emoji database. The database is either downloaded
 * from {@link module:emoji/emojiconfig~EmojiConfig#definitionsUrl `emoji.definitionsUrl`} or passed directly
 * in {@link module:emoji/emojiconfig~EmojiConfig#definitions `emoji.definitions`}.
 */
export type EmojiDefinition = {
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
 * Represents a single item fetched from the CDN.
 *
 * @deprecated Use {@link module:emoji/emojirepository~EmojiDefinition `EmojiDefinition`} instead.
 */
export type EmojiCdnResource = EmojiDefinition;

/**
 * Represents a single emoji item used by the Emoji feature.
 */
export type EmojiEntry = Omit<EmojiDefinition, 'skins'> & {
	skins: EmojiMap;
};

/**
 * Represents mapping between a skin tone and its corresponding emoji.
 *
 * The `default` key is always present. Additional values are assigned only if an emoji supports skin tones.
 */
export type EmojiMap = { [K in Exclude<EmojiSkinToneId, 'default'>]?: string; } & {
	default: string;
};

/**
 * Represents an emoji skin tone variant.
 */
export type EmojiSkinTone = {
	id: EmojiSkinToneId;
	icon: string;
	tooltip: string;
};

/**
 * Unable to load the emoji repository from the URL.
 *
 * If the URL works properly and there is no disruption of communication, please check your
 * {@glink getting-started/setup/csp Content Security Policy (CSP)} setting and make sure
 * the URL connection is allowed by the editor.
 *
 * @error emoji-repository-load-failed
 */
