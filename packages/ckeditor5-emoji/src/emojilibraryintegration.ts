/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module emoji/emojilibraryintegration
 */

import { Plugin } from 'ckeditor5/src/core.js';

import type { MentionFeedObjectItem } from '@ckeditor/ckeditor5-mention';

import emojiDatabase from 'emojibase-data/en/data.json';

/**
 * Integration with external emoji library.
 *
 * @internal
 */
export default class EmojiLibraryIntegration extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'EmojiLibraryIntegration' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * Feed function for mention config.
	 *
	 * @public
	 */
	public queryEmoji( searchQuery: string ): Array<MentionFeedObjectItem> {
		const queryMatcher = new RegExp( '(?<=\\b|_)' + normalizeString( searchQuery ) );

		return emojiDatabase
			.filter( emojiData => {
				const searchItems = [ emojiData.label, ...( emojiData.tags || [] ) ].map( normalizeString );

				return searchItems.some( ( item: string ) => queryMatcher.exec( item ) );
			} )
			.map( emojiData => {
				return {
					id: `emoji:${ normalizeString( emojiData.label ) }:`,
					text: emojiData.emoji
				};
			} );
	}
}

/**
 * This function modifies strings by:
 * - replacing spaces with underscores
 * - removing colons
 * - casting all characters to lowercase
 */
function normalizeString( string: string ): string {
	return string
		.replace( / /g, '_' )
		.replace( /:/g, '' )
		.toLocaleLowerCase();
}
