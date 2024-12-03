/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module emoji/emojimention
 */

import { logWarning, type LocaleTranslate } from 'ckeditor5/src/utils.js';
import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import EmojiLibraryIntegration from './emojilibraryintegration.js';
import EmojiPicker from './emojipicker.js';

import {
	getShowAllEmojiId,
	isEmojiId,
	removeEmojiPrefix
} from './utils.js';

import {
	type MentionFeed,
	type MentionFeedObjectItem
} from '@ckeditor/ckeditor5-mention';

/**
 * The emoji mention plugin.
 *
 * Introduces the autocomplete of emojis while typing.
 */
export default class EmojiMention extends Plugin {
	private _emojiDropdownLimit: number;
	private _mentionMarker: string;

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ 'Mention', EmojiLibraryIntegration ] as const;
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
			dropdownLimit: 6,
			marker: ':'
		} );

		this._emojiDropdownLimit = editor.config.get( 'emoji.dropdownLimit' )!;
		this._mentionMarker = editor.config.get( 'emoji.marker' )!;

		const mentionFeedsConfigs = this.editor.config.get( 'mention.feeds' )! as Array<MentionFeed>;
		const markerAlreadyUsed = mentionFeedsConfigs.some( config => config.marker === this._mentionMarker );

		if ( markerAlreadyUsed ) {
			/**
			 * The `marker` in the `emoji` config is already used by other mention plugin configuration.
			 *
			 * @error emoji-config-marker-already-used
			 * @param {string} marker Used marker.
			 */
			logWarning( 'emoji-config-marker-already-used', { marker: this._mentionMarker } );

			return;
		}

		this._setupMentionConfiguration( mentionFeedsConfigs );
		this.editor.once( 'ready', this._overrideMentionExecuteListener.bind( this ) );
	}

	/**
	 * Initializes the configuration for emojis in the mention feature.
	 *
	 * @internal
	 */
	private _setupMentionConfiguration( mentionFeedsConfigs: Array<MentionFeed> ): void {
		const emojiLibraryIntegration = this.editor.plugins.get( EmojiLibraryIntegration );

		const emojiMentionFeedConfig = {
			marker: this._mentionMarker,
			dropdownLimit: this._emojiDropdownLimit,
			itemRenderer: this._getCustomItemRendererFn( this.editor.t ),
			feed: emojiLibraryIntegration.getQueryEmojiFn( this._emojiDropdownLimit )
		};

		this.editor.config.set( 'mention.feeds', [ ...mentionFeedsConfigs, emojiMentionFeedConfig ] );
	}

	/**
	 * Returns the `itemRenderer()` callback for mention config.
	 *
	 * @internal
	 */
	private _getCustomItemRendererFn( t: LocaleTranslate ) {
		return ( item: MentionFeedObjectItem ) => {
			const itemElement = document.createElement( 'span' );

			itemElement.classList.add( 'custom-item' );
			itemElement.id = `mention-list-item-id-${ item.id }`;
			itemElement.style.width = '100%';
			itemElement.style.display = 'block';

			switch ( item.id ) {
				case getShowAllEmojiId():
					itemElement.textContent = t( 'Show all emoji...' );

					break;
				default:
					itemElement.textContent = `${ item.text } ${ removeEmojiPrefix( item.id ) }`;
			}

			return itemElement;
		};
	}

	/**
	 * Overrides the default mention execute listener to insert an emoji as plain text instead.
	 *
	 * @internal
	 */
	private _overrideMentionExecuteListener() {
		this.editor.commands.get( 'mention' )!.on( 'execute', ( event, data ) => {
			const eventData = data[ 0 ];

			if ( !isEmojiId( eventData.mention.id ) ) {
				return;
			}

			let textToInsert = eventData.mention.text;
			let shouldShowEmojiView;

			if ( eventData.mention.id === getShowAllEmojiId() ) {
				shouldShowEmojiView = true;

				textToInsert = '';

				// TODO: showUI() called from here does not focus properly.
			}

			this.editor.model.change( writer => {
				this.editor.model.insertContent( writer.createText( textToInsert ), eventData.range );
			} );

			if ( shouldShowEmojiView ) {
				this.editor.plugins.get( EmojiPicker ).showUI( eventData.mention.text );
			}

			event.stop();
		}, { priority: 'high' } );
	}
}
