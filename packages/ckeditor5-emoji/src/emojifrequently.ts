/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/emojidatabase
 */

import { Plugin } from 'ckeditor5/src/core.js';
import EmojiRepository from './emojirepository.js';
import type { DecoratedMethodEvent } from 'ckeditor5/src/utils.js';
import EmojiPicker, { type EmojiPickerInsertEvent } from './emojipicker.js';
import type { EmojiMentionInsertEvent } from './emojimention.js';

export default class Emojifrequently extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ EmojiRepository, EmojiPicker ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'EmojiFrequently' as const;
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
	public async init(): Promise<void> {
		const t = this.editor.locale!.t;
		const repositoryPlugin = this.editor.plugins.get( 'EmojiRepository' );
		const frequentlyUsed = t( 'Frequently used' );

		repositoryPlugin.decorate( 'getEmojiCategories' );

		this.listenTo<DecoratedMethodEvent<EmojiRepository, 'getEmojiCategories'>>( repositoryPlugin, 'getEmojiCategories', event => {
			event.return = [
				...event.return!,
				{
					title: frequentlyUsed,
					icon: '»',
					groupId: 10,
					get items() {
						const frequentlyUsedEmoji = window.localStorage.getItem( 'ckeditor5_emoji' ) || '{}';
						const parsedFrequentlyUsedEmoji = JSON.parse( frequentlyUsedEmoji );

						return Object.entries( parsedFrequentlyUsedEmoji )
							.sort( ( a: any, b: any ) => a[ 1 ] < b[ 1 ] ? 1 : -1 )
							.slice( 0, 20 )
							.map( item => repositoryPlugin.getEmojiByName( item[ 0 ] ) );
					}
				}
			];
		}, { priority: 'low' } );

		const emojiPicker = this.editor.plugins.get( 'EmojiPicker' );

		this.listenTo<EmojiPickerInsertEvent>( emojiPicker, 'insert', ( evt, data ) => {
			if ( emojiPicker.emojiPickerView!.gridView.categoryName !== frequentlyUsed ) {
				this._storeEmojiInDatabase( data.name );
			}
		} );

		if ( this.editor.plugins.has( 'EmojiMention' ) ) {
			const emojiMention = this.editor.plugins.get( 'EmojiMention' );

			this.listenTo<EmojiMentionInsertEvent>( emojiMention, 'insert', ( evt, data ) => {
				this._storeEmojiInDatabase( data.name );
			} );
		}
	}

	private _storeEmojiInDatabase( name: string ) {
		const localStorage = window.localStorage.getItem( 'ckeditor5_emoji' ) || '{}';
		const db = JSON.parse( localStorage );

		db[ name ] ??= 0;
		db[ name ] += 1;

		window.localStorage.setItem( 'ckeditor5_emoji', JSON.stringify( db ) );
	}
}
