/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module emoji/emojimentionintegration
 */

import { logWarning, type LocaleTranslate } from 'ckeditor5/src/utils.js';
import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import EmojiLibraryIntegration from './emojilibraryintegration.js';

import {
	DEFAULT_DROPDOWN_LIMIT,
	DEFAULT_MENTION_MARKER,
	getShowAllEmojiId,
	isEmojiId,
	removeEmojiPrefix
} from './utils.js';

import {
	type MentionFeed,
	type MentionFeedObjectItem
} from '@ckeditor/ckeditor5-mention';

/**
 * Part of the emoji logic.
 *
 * @internal
 */
export default class EmojiMentionIntegration extends Plugin {
	private emojiDropdownLimit: number;
	private mentionMarker: string;

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ EmojiLibraryIntegration ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'EmojiMentionIntegration' as const;
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

		this.emojiDropdownLimit = editor.config.get( 'emoji.dropdownLimit' ) || DEFAULT_DROPDOWN_LIMIT;
		this.mentionMarker = editor.config.get( 'emoji.marker' ) || DEFAULT_MENTION_MARKER;

		const mentionFeedsConfigs = this.editor.config.get( 'mention.feeds' )! as Array<MentionFeed>;
		const markerAlreadyUsed = mentionFeedsConfigs.some( config => config.marker === this.mentionMarker );

		if ( markerAlreadyUsed ) {
			/**
			 * The `marker` in the `emoji` config is already used by other mention plugin configuration.
			 *
			 * @error emoji-config-marker-already-used
			 * @param {string} marker Used marker.
			 */
			logWarning( 'emoji-config-marker-already-used', { marker: this.mentionMarker } );

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
			marker: this.mentionMarker,
			dropdownLimit: this.emojiDropdownLimit,
			itemRenderer: this._getCustomItemRendererFn( this.editor.t ),
			feed: emojiLibraryIntegration.getQueryEmojiFn( this.emojiDropdownLimit )
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

			if ( eventData.mention.id === getShowAllEmojiId() ) {
				textToInsert = '';

				console.log( 'SHOWING EMOJI WINDOW' );
			}

			this.editor.model.change( writer => {
				this.editor.model.insertContent( writer.createText( textToInsert ), eventData.range );
			} );

			event.stop();
		}, { priority: 'high' } );
	}
}
