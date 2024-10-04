/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// Creates content that makes a big use of images, including 1000 of images with captions and 1000 of paragraphs.
export default function makeData() {
	let initialData = '';

	for ( let i = 0; i < 1666; i++ ) {
		initialData +=
			'<p>' +
				'Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. ' +
				'Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. ' +
				'Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. ' +
			'</p>';

		initialData += '<figure class="image"><img src="../sample.jpg" alt="Sample" width="" /><figcaption>Caption</figcaption></figure>';
	}

	return initialData;
}
