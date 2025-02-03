/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

// Creates multiple, nested lists, for a total of 3000 list items. Text in lists is simple, short, non-formatted text.
// This tests editor performance when huge lists are in the content.
// Below data creates 100 pages when copy-pasted to Google Docs (default page settings).
export default function makeData() {
	let initialData = '';

	// Create 25 top-level lists, each with ~90 nested items total, on multiple levels.
	for ( let i = 0; i < 25; i++ ) {
		const tagName = i % 2 ? 'ul' : 'ol';

		initialData += makeList( 40, tagName, 3 );
	}

	return initialData;
}

export function makeList( itemsCount, tagName, levels ) {
	let initialData = `<${ tagName }>`;

	for ( let i = 0; i < itemsCount / 2; i++ ) {
		initialData += '<li>Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.</li>';
	}

	if ( levels > 1 ) {
		initialData += '<li>Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.';
		initialData += makeList( itemsCount, levels % 2 ? 'ul' : 'ol', levels - 1 );
	}

	for ( let i = 0; i < itemsCount / 2; i++ ) {
		initialData += '<li>Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.</li>';
	}

	initialData += `</${ tagName }>`;

	return initialData;
}
