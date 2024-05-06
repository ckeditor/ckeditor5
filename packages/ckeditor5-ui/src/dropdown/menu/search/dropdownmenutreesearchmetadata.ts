/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/search/dropdownmenutreesearchmetadata
 */

/**
 * Represents the metadata for tree search in a dropdown menu.
 */
export type TreeSearchMetadata = {

	/**
	 * The raw search string.
	 * This field can contain the original text of a button, for example.
	 */
	raw: string;

	/**
	 * The processed search string.
	 */
	text: string;
};

/**
 * Represents an object that contains tree search metadata.
 */
export type WithTreeSearchMetadata = {
	search: TreeSearchMetadata;
};

/**
 * Normalizes the search text by removing leading and trailing whitespace and converting it to lowercase.
 *
 * ```ts
 * const normalizedText = normalizeSearchText( '  Search Text  ' );
 *
 * expect( normalizedText ).to.equal( 'search text' );
 * ```
 *
 * @param text The search text to be normalized.
 * @returns The normalized search text.
 */
export const normalizeSearchText = ( text: string ): string => text.trim().toLowerCase();

/**
 * Creates text search metadata for a dropdown menu tree item.
 *
 * ```ts
 * const metadata = createTextSearchMetadata( '  Search Text  ' );
 *
 * expect( metadata ).to.deep.equal( {
 * 	raw: '  Search Text  ',
 * 	text: 'search text'
 * } );
 * ```
 *
 * @param label The label of the tree item.
 * @returns The created tree search metadata.
 */
export const createTextSearchMetadata = ( label: string | undefined ): TreeSearchMetadata => ( {
	raw: label || '',
	text: normalizeSearchText( label || '' )
} );
