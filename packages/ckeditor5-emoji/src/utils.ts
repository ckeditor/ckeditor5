/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type { Editor } from 'ckeditor5/src/core.js';
import { ButtonView, type MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';

export const DEFAULT_DROPDOWN_LIMIT = 6;
export const DEFAULT_MENTION_MARKER = ':';

const EMOJI_PREFIX = 'emoji';
const SHOW_ALL_EMOJI = '__SHOW_ALL_EMOJI__';

export function isEmojiId( string: string ): boolean {
	return new RegExp( `^${ EMOJI_PREFIX }:[^:]+:$` ).test( string );
}

export function formatEmojiId( id: string ): string {
	return `${ EMOJI_PREFIX }:${ id }:`;
}

export function removeEmojiPrefix( formattedEmojiId: string ): string {
	return formattedEmojiId.replace( new RegExp( `^${ EMOJI_PREFIX }:` ), ':' );
}

export function getShowAllEmojiId(): string {
	return formatEmojiId( SHOW_ALL_EMOJI );
}

/**
 * Returns a function that creates a (toolbar or menu bar) button for the emoji picker feature.
 */
export function getEmojiButtonCreator( {
	editor,
	icon,
	label,
	callback
}: {
	editor: Editor;
	icon: string;
	label: string;
	callback: () => void;
} ) {
	return <T extends typeof ButtonView | typeof MenuBarMenuListItemButtonView>( ButtonClass: T ): InstanceType<T> => {
		const button = new ButtonClass( editor.locale ) as InstanceType<T>;

		button.set( { label, icon } );

		if ( button instanceof ButtonView ) {
			button.set( {
				tooltip: true
			} );
		}

		button.on( 'execute', callback );

		return button;
	};
}
