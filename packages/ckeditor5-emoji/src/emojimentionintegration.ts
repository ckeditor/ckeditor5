/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module emoji/emojimentionintegration
 */

import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import EmojiLibraryIntegration from './emojilibraryintegration.js';
import { removeEmojiPrefix, getShowAllEmojiId, isEmojiId, DEFAULT_DROPDOWN_LIMIT } from './utils.js';

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

		this._setupMentionConfiguration();
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		this.editor.once( 'ready', this._overrideMentionExecuteListener.bind( this ) );
	}

	/**
	 * Initializes the configuration for emojis in the mention feature.
	 *
	 * @internal
	 */
	private _setupMentionConfiguration(): void {
		const editor = this.editor;
		const config = editor.config.get( 'mention.feeds' )! as Array<MentionFeed>;
		const emojiLibraryIntegration = editor.plugins.get( EmojiLibraryIntegration );

		config.push( {
			marker: ':',
			minimumCharacters: 1,
			dropdownLimit: this.emojiDropdownLimit,
			itemRenderer: this._customItemRenderer,
			feed: emojiLibraryIntegration.getQueryEmojiFn( this.emojiDropdownLimit )
		} );

		editor.config.set( 'mention.feeds', config );
	}

	/**
	 * Renders the emojis in the dropdown.
	 *
	 * @internal
	 */
	private _customItemRenderer( item: MentionFeedObjectItem ) {
		const itemElement = document.createElement( 'span' );

		itemElement.classList.add( 'custom-item' );
		itemElement.id = `mention-list-item-id-${ item.id }`;
		itemElement.style.width = '100%';
		itemElement.style.display = 'block';

		itemElement.textContent = item.id === getShowAllEmojiId() ?
			// TODO: Use `t()` here.
			'See more...' :
			`${ item.text } ${ removeEmojiPrefix( item.id ) }`;

		return itemElement;
	}

	/**
	 * Overrides the default mention execute listener to insert an emoji as plain text instead.
	 *
	 * @internal
	 */
	private _overrideMentionExecuteListener() {
		this.editor.commands.get( 'mention' )!.on( 'execute', ( event, data ) => {
			const eventData = data[ 0 ];

			if ( eventData.mention.id === getShowAllEmojiId() ) {
				console.log( 'SHOWING EMOJI WINDOW' );

				event.stop();
			} else if ( isEmojiId( eventData.mention.id ) ) {
				this.editor.model.change( () => {
					this.editor.execute( 'insertEmoji', eventData.mention.text, eventData.range );
				} );

				event.stop();
			}
		}, { priority: 'high' } );
	}
}
