/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module emoji/emojimentionintegration
 */

import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import EmojiLibraryIntegration from './emojilibraryintegration.js';

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
			dropdownLimit: editor.config.get( 'emoji.dropdownLimit' ) || Infinity,
			itemRenderer: this._customItemRenderer,
			feed: emojiLibraryIntegration.queryEmoji
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
		itemElement.textContent = `${ item.text } ${ item.id } `;
		itemElement.style.width = '100%';
		itemElement.style.display = 'block';

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

			if ( eventData.mention.id.startsWith( 'emoji:' ) ) {
				this.editor.model.change( () => {
					this.editor.execute( 'insertEmoji', eventData.text, eventData.range );

					event.stop();
				} );
			}
		}, { priority: 'high' } );
	}
}
