/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module paste-from-office/filters/footnote
 */

import type { ViewElement, ViewUpcastWriter } from 'ckeditor5/src/engine.js';

/**
 * Creates a footnotes list view element.
 *
 * @param writer The view writer instance.
 * @returns The footnotes list view element.
 */
export function createFootnotesListViewElement( writer: ViewUpcastWriter ): ViewElement {
	return writer.createElement( 'ol', { class: 'footnotes' } );
}

/**
 * Creates a footnote reference view element.
 *
 * @param writer The view writer instance.
 * @param footnoteId The footnote ID.
 * @returns The footnote reference view element.
 */
export function createFootnoteRefViewElement( writer: ViewUpcastWriter, footnoteId: string ): ViewElement {
	const sup = writer.createElement( 'sup', { class: 'footnote' } );
	const link = writer.createElement( 'a', {
		id: `ref-${ footnoteId }`,
		href: `#${ footnoteId }`
	} );

	writer.appendChild( link, sup );

	return sup;
}

/**
 * Creates a footnote definition view element with a backlink and a content container.
 *
 * @param writer The view writer instance.
 * @param footnoteId The footnote ID.
 * @returns An object containing the list item element, backlink and content container.
 */
export function createFootnoteDefViewElement( writer: ViewUpcastWriter, footnoteId: string ): {
	listItem: ViewElement;
	content: ViewElement;
} {
	const listItem = writer.createElement( 'li', {
		id: footnoteId,
		class: 'footnote-definition'
	} );

	const backLink = writer.createElement( 'a', {
		href: `#ref-${ footnoteId }`,
		class: 'footnote-backlink'
	} );

	const content = writer.createElement( 'div', {
		class: 'footnote-content'
	} );

	writer.appendChild( writer.createText( '^' ), backLink );
	writer.appendChild( backLink, listItem );
	writer.appendChild( content, listItem );

	return {
		listItem,
		content
	};
}
