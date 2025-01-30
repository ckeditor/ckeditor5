/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/emojimention
 */

import { logWarning, type LocaleTranslate } from 'ckeditor5/src/utils.js';
import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import { Typing } from 'ckeditor5/src/typing.js';
import type { MentionFeed, MentionFeedObjectItem, ItemRenderer } from '@ckeditor/ckeditor5-mention';

import EmojiRepository from './emojirepository.js';
import type EmojiPicker from './emojipicker.js';
import type { SkinToneId } from './emojiconfig.js';

const EMOJI_MENTION_MARKER = ':';
const EMOJI_SHOW_ALL_OPTION_ID = ':__EMOJI_SHOW_ALL:';
const EMOJI_HINT_OPTION_ID = ':__EMOJI_HINT:';

/**
 * The emoji mention plugin.
 *
 * Introduces the autocomplete of emojis while typing.
 */
export default class EmojiMention extends Plugin {
	/**
	 * An instance of the {@link module:emoji/emojipicker~EmojiPicker} plugin if it is loaded in the editor.
	 */
	declare private _emojiPickerPlugin: EmojiPicker | null;

	/**
	 * An instance of the {@link module:emoji/emojirepository~EmojiRepository} plugin.
	 */
	declare private _emojiRepositoryPlugin: EmojiRepository;

	/**
	 * Defines a number of displayed items in the auto complete dropdown.
	 *
	 * It includes the "Show all emoji..." option if the `EmojiPicker` plugin is loaded.
	 */
	private readonly _emojiDropdownLimit: number;

	/**
	 * Defines a skin tone that is set in the emoji config.
	 */
	private readonly _skinTone: SkinToneId;

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ EmojiRepository, Typing, 'Mention' ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'EmojiMention' as const;
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
			dropdownLimit: 6
		} );

		this._emojiDropdownLimit = editor.config.get( 'emoji.dropdownLimit' )!;
		this._skinTone = editor.config.get( 'emoji.skinTone' )!;

		const mentionFeedsConfigs = editor.config.get( 'mention.feeds' )! as Array<MentionFeed>;
		const mergeFieldsPrefix = editor.config.get( 'mergeFields.prefix' )! as string;
		const markerAlreadyUsed = mentionFeedsConfigs.some( config => config.marker === EMOJI_MENTION_MARKER );
		const isMarkerUsedByMergeFields = mergeFieldsPrefix ? mergeFieldsPrefix[ 0 ] === EMOJI_MENTION_MARKER : false;

		if ( markerAlreadyUsed || isMarkerUsedByMergeFields ) {
			/**
			 * The `marker` in the `emoji` config is already used by other plugin configuration.
			 *
			 * @error emoji-config-marker-already-used
			 * @param {string} marker Used marker.
			 */
			logWarning( 'emoji-config-marker-already-used', { marker: EMOJI_MENTION_MARKER } );

			return;
		}

		this._setupMentionConfiguration( mentionFeedsConfigs );
	}

	/**
	 * @inheritDoc
	 */
	public async init(): Promise<void> {
		const editor = this.editor;

		this._emojiPickerPlugin = editor.plugins.has( 'EmojiPicker' ) ? editor.plugins.get( 'EmojiPicker' ) : null;
		this._emojiRepositoryPlugin = editor.plugins.get( 'EmojiRepository' );

		// Skip overriding the `mention` command listener if the emoji repository is not ready.
		if ( !await this._emojiRepositoryPlugin.isReady() ) {
			return;
		}

		editor.once( 'ready', this._overrideMentionExecuteListener.bind( this ) );
	}

	/**
	 * Initializes the configuration for emojis in the mention feature.
	 */
	private _setupMentionConfiguration( mentionFeedsConfigs: Array<MentionFeed> ): void {
		const emojiMentionFeedConfig = {
			marker: EMOJI_MENTION_MARKER,
			dropdownLimit: this._emojiDropdownLimit,
			itemRenderer: this._customItemRendererFactory( this.editor.t ),
			feed: this._queryEmojiCallbackFactory()
		};

		this.editor.config.set( 'mention.feeds', [ ...mentionFeedsConfigs, emojiMentionFeedConfig ] );
	}

	/**
	 * Returns the `itemRenderer()` callback for mention config.
	 */
	private _customItemRendererFactory( t: LocaleTranslate ): ItemRenderer {
		return ( item: MentionFeedObjectItem ) => {
			const itemElement = document.createElement( 'button' );

			itemElement.classList.add( 'ck' );
			itemElement.classList.add( 'ck-button' );
			itemElement.classList.add( 'ck-button_with-text' );

			itemElement.id = `mention-list-item-id${ item.id.slice( 0, -1 ) }`;
			itemElement.type = 'button';
			itemElement.tabIndex = -1;

			const labelElement = document.createElement( 'span' );

			labelElement.classList.add( 'ck' );
			labelElement.classList.add( 'ck-button__label' );

			itemElement.appendChild( labelElement );

			if ( item.id === EMOJI_HINT_OPTION_ID ) {
				itemElement.classList.add( 'ck-list-item-button' );
				itemElement.classList.add( 'ck-disabled' );
				labelElement.textContent = t( 'Keep on typing to see the emoji.' );
			} else if ( item.id === EMOJI_SHOW_ALL_OPTION_ID ) {
				labelElement.textContent = t( 'Show all emoji...' );
			} else {
				labelElement.textContent = `${ item.text } ${ item.id }`;
			}

			return itemElement;
		};
	}

	/**
	 * Overrides the default mention execute listener to insert an emoji as plain text instead.
	 */
	private _overrideMentionExecuteListener(): void {
		const editor = this.editor;

		editor.commands.get( 'mention' )!.on( 'execute', ( event, data ) => {
			const eventData = data[ 0 ];

			// Ignore non-emoji auto-complete actions.
			if ( eventData.marker !== EMOJI_MENTION_MARKER ) {
				return;
			}

			// Do not propagate the event.
			event.stop();

			// Do nothing when executing after selecting a hint message.
			if ( eventData.mention.id === EMOJI_HINT_OPTION_ID ) {
				return;
			}

			// Trigger the picker UI.
			if ( eventData.mention.id === EMOJI_SHOW_ALL_OPTION_ID ) {
				const text = [ ...eventData.range.getItems() ]
					.filter( item => item.is( '$textProxy' ) )
					.map( item => item.data )
					.reduce( ( result, text ) => result + text, '' );

				editor.model.change( writer => {
					editor.model.deleteContent( writer.createSelection( eventData.range ) );
				} );

				const emojiPickerPlugin = this._emojiPickerPlugin!;

				emojiPickerPlugin.showUI( text.slice( 1 ) );

				setTimeout( () => {
					emojiPickerPlugin.emojiPickerView!.focus();
				} );
			}
			// Or insert the emoji to editor.
			else {
				editor.execute( 'insertText', {
					text: eventData.mention.text,
					range: eventData.range
				} );
			}
		}, { priority: 'high' } );
	}

	/**
	 * Returns the `feed()` callback for mention config.
	 */
	private _queryEmojiCallbackFactory(): ( searchQuery: string ) => Array<MentionFeedObjectItem> {
		return ( searchQuery: string ) => {
			// Do not show anything when a query starts with a space.
			if ( searchQuery.startsWith( ' ' ) ) {
				return [];
			}

			const emojis: Array<MentionFeedObjectItem> = this._emojiRepositoryPlugin.getEmojiByQuery( searchQuery )
				.map( emoji => {
					let text = emoji.skins[ this._skinTone ] || emoji.skins.default;

					if ( this._emojiPickerPlugin ) {
						text = emoji.skins[ this._emojiPickerPlugin.skinTone ] || emoji.skins.default;
					}

					return {
						id: `:${ emoji.annotation }:`,
						text
					};
				} );

			if ( !this._emojiPickerPlugin ) {
				return emojis.slice( 0, this._emojiDropdownLimit );
			}

			const actionItem: MentionFeedObjectItem = {
				id: searchQuery.length > 1 ? EMOJI_SHOW_ALL_OPTION_ID : EMOJI_HINT_OPTION_ID
			};

			return [
				...emojis.slice( 0, this._emojiDropdownLimit - 1 ),
				actionItem
			];
		};
	}
}
