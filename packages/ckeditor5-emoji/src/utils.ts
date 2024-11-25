/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

export const DEFAULT_DROPDOWN_LIMIT = 6;
export const DEFAULT_MENTION_MARKER = ':';

const EMOJI_PREFIX = 'emoji';
const SHOW_ALL_EMOJI = '__SHOW_ALL_EMOJI__';
const NO_RESULTS = '__NO_RESULTS__';

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

export function getNoResultsEmojiId(): string {
	return formatEmojiId( NO_RESULTS );
}
