/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

// This is the most basic performance test, where we load many paragraphs (5000) and fill them with reasonable text volume, no formatting.
// Below data creates 400 pages when copy-pasted to Google Docs (default page settings).
export default function makeData() {
	let initialData = '';

	for ( let i = 0; i < 5000; i++ ) {
		initialData +=
			'<p>' +
				'Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. ' +
				'Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. ' +
				'Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. ' +
			'</p>';
	}

	return initialData;
}
