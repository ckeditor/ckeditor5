/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/emojidatabase
 */

import { Plugin } from 'ckeditor5/src/core.js';
import EmojiDatabase from './emojidatabase.js';
import type { DecoratedMethodEvent } from 'ckeditor5/src/utils.js';
import EmojiPicker, { type EmojiPickerInsertEvent } from './emojipicker.js';
import type { EmojiMentionInsertEvent } from './emojimention.js';

export default class EmojiFrequently extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ EmojiDatabase, EmojiPicker ] as const;
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
		const databasePlugin = this.editor.plugins.get( 'EmojiDatabase' );

		databasePlugin.decorate( 'getEmojiGroups' );

		this.listenTo<DecoratedMethodEvent<EmojiDatabase, 'getEmojiGroups'>>( databasePlugin, 'getEmojiGroups', event => {
			event.return = [
				...event.return!,
				{
					title: t( 'Frequently used' ),
					icon: '»',
					groupId: 10,
					get items() {
						const itemsAsString = window.localStorage.getItem( 'ckeditor5_emoji' ) || '{}';
						const items = JSON.parse( itemsAsString );

						return Object.keys( items ).map( item => databasePlugin.getEmojiByName( item ) );
					}
				}
			];
		}, { priority: 'low' } );

		const emojiPicker = this.editor.plugins.get( 'EmojiPicker' );

		this.listenTo<EmojiPickerInsertEvent>( emojiPicker, 'insert', ( evt, data ) => {
			this._storeEmojiInDatabase( data.name );
		} );

		if ( this.editor.plugins.has( 'EmojiMention' ) ) {
			const emojiMention = this.editor.plugins.get( 'EmojiMention' );

			this.listenTo<EmojiMentionInsertEvent>( emojiMention, 'insert', ( evt, data ) => {
				this._storeEmojiInDatabase( data.name );
			} );
		}
	}

	private _storeEmojiInDatabase( name: string ) {
		// TODO: Sort?
		// TODO: Store max 20 items.
		const localStorage = window.localStorage.getItem( 'ckeditor5_emoji' ) || '{}';
		const db = JSON.parse( localStorage );

		db[ name ] ??= 0;
		db[ name ] += 1;

		window.localStorage.setItem( 'ckeditor5_emoji', JSON.stringify( db ) );
	}
}
