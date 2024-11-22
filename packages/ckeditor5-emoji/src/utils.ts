/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

export const DEFAULT_DROPDOWN_LIMIT = 10;

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
