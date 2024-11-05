/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module emoji/emojimentionintegration
 */

import { Plugin, type Editor } from 'ckeditor5/src/core.js';

import type {
	MentionFeed,
	MentionFeedObjectItem
} from '@ckeditor/ckeditor5-mention';

import emojiMartData from '@emoji-mart/data';
import { init, SearchIndex } from 'emoji-mart';

/**
 * Part of the emoji logic.
 *
 * @internal
 */
export default class EmojiMentionIntegration extends Plugin {
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

		init( { data: emojiMartData } );

		this._setupMentionConfiguration();
		this._defineConverters();
	}

	/**
	 * Initializes the configuration for emojis in the mention feature.
	 *
	 * @internal
	 */
	private _setupMentionConfiguration(): void {
		const editor = this.editor;
		const config = editor.config.get( 'mention.feeds' )! as Array<MentionFeed>;

		config.push( {
			marker: ':',
			minimumCharacters: 1,
			dropdownLimit: editor.config.get( 'emoji.dropdownLimit' ) || Infinity,
			itemRenderer: this._customItemRenderer,
			feed: this._mentionFeed
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

		return itemElement;
	}

	/**
	 * Feed function for mention config.
	 *
	 * @internal
	 */
	private _mentionFeed( searchQuery: string ) {
		return SearchIndex.search( searchQuery ).then( searchResults => {
			return searchResults.map( ( emoji: any ) => {
				return {
					id: `:${ emoji.id }:`,
					text: emoji.skins[ 0 ].native
				};
			} );
		} );
	}

	/**
	 * Registers the converters for the emoji feature.
	 *
	 * @internal
	 */
	private _defineConverters(): void {
		const conversion = this.editor.conversion;

		conversion.for( 'upcast' ).elementToAttribute( {
			view: 'span',
			model: 'mention'
		} );

		conversion.for( 'downcast' ).attributeToElement( {
			model: 'mention',
			view: 'span'
		} );
	}
}
