/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

// Creates 30 paragraphs, each with a 1000 of text nodes, half of the text nodes is wrapped in a span with inline styles.
export default function makeData() {
	let initialData = '';

	for ( let i = 0; i < 30; i++ ) {
		initialData += '<p>';

		for ( let j = 0; j < 1000; j++ ) {
			if ( j % 2 === 0 ) {
				initialData += '<span style="font-weight:bold;font-style:italic;text-decoration:underline;color:#808080;' +
					'font-family: Arial;background:#EEEEEE;">Lorem ipsum dolor</span>';
			} else {
				initialData += ' sit amet. ';
			}
		}

		initialData += '</p>';
	}

	return initialData;
}
