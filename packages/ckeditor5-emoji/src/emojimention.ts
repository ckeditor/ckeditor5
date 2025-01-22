/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/emojimention
 */

import { logWarning, type LocaleTranslate } from 'ckeditor5/src/utils.js';
import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import type { MentionFeed, MentionFeedObjectItem } from '@ckeditor/ckeditor5-mention';

import EmojiPicker from './emojipicker.js';
import EmojiDatabase from './emojidatabase.js';

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
	 * Defines a number of displayed items in the auto complete dropdown.
	 *
	 * It includes the "Show all emoji..." option if the `EmojiPicker` plugin is loaded.
	 */
	private readonly _emojiDropdownLimit: number;

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ EmojiDatabase, 'Mention' ] as const;
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

		const mentionFeedsConfigs = this.editor.config.get( 'mention.feeds' )! as Array<MentionFeed>;
		const mergeFieldsPrefix = this.editor.config.get( 'mergeFields.prefix' )! as string;
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
		this.editor.once( 'ready', this._overrideMentionExecuteListener.bind( this ) );
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		this._emojiPickerPlugin = this.editor.plugins.has( EmojiPicker ) ? this.editor.plugins.get( EmojiPicker ) : null;
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
	private _customItemRendererFactory( t: LocaleTranslate ) {
		return ( item: MentionFeedObjectItem ) => {
			const itemElement = document.createElement( 'button' );

			itemElement.classList.add( 'ck' );
			itemElement.classList.add( 'ck-button' );
			itemElement.classList.add( 'ck-button_with-text' );
			itemElement.id = `mention-list-item-id${ item.id.slice( 0, -1 ) }`;
			itemElement.type = 'button';
			itemElement.tabIndex = '-1';

			const labelElement = document.createElement( 'span' );

			labelElement.classList.add( 'ck' );
			labelElement.classList.add( 'ck-button__label' );

			itemElement.appendChild( labelElement );

			if ( item.id === EMOJI_HINT_OPTION_ID ) {
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
	private _overrideMentionExecuteListener() {
		const editor = this.editor;
		const emojiPickerPlugin = this._emojiPickerPlugin;

		this.editor.commands.get( 'mention' )!.on( 'execute', ( event, data ) => {
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

				emojiPickerPlugin.showUI( text.slice( 1 ) );
			} else {
				editor.model.change( writer => {
					editor.model.insertContent( writer.createText( eventData.mention.text ), eventData.range );
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

			// TODO: Add error handling if the database was not initialized properly.
			const emojiDatabasePlugin = this.editor.plugins.get( 'EmojiDatabase' );

			const emojis: Array<MentionFeedObjectItem> = emojiDatabasePlugin.getEmojiBySearchQuery( searchQuery )
				.map( emoji => {
					// TODO: The configuration `emoji.skinTone` option is ignored here.
					let text = emoji.skins.default;

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
