/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { makeList } from './lists.js';

// Creates long mixed content, including all kinds of features: paragraphs, list items, formatted content, tables and images.
// This is a sum of all other data sets, where each data set has smaller volume.
export default function makeData() {
	let initialData = '';

	// Each chunk of data will include: a few formatted and unformatted pararaphs, small list with sub-items, 40 cell table and two images.
	for ( let i = 0; i < 100; i++ ) {
		initialData +=
			'<p>' +
				'Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. ' +
				'Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. ' +
				'Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. ' +
			'</p>';

		initialData += '<figure class="image"><img src="../sample.jpg" alt="Sample" width="" /><figcaption>Caption</figcaption></figure>';

		initialData += '<p>';

		for ( let j = 0; j < 50; j++ ) {
			if ( j % 3 === 0 ) {
				initialData += '<strong>Lorem ipsum</strong>';
			} else if ( j % 3 === 1 ) {
				initialData += '<em> dolor sit </em>';
			} else {
				initialData += '<s>amet. </s>';
			}
		}

		initialData += '</p>';

		initialData += makeList( 5, 'ul', 2 );

		initialData += '<figure class="image"><img src="../sample.jpg" alt="Sample" width="" /><figcaption>Caption</figcaption></figure>';

		for ( let j = 0; j < 5; j++ ) {
			initialData +=
				'<p>' +
					'Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. ' +
					'Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. ' +
					'Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. ' +
				'</p>';
		}

		initialData += '<table>';

		for ( let i = 0; i < 10; i++ ) {
			initialData += '<tr>';

			for ( let j = 0; j < 4; j++ ) {
				initialData += '<td>Lorem foo bar</td>';
			}

			initialData += '</tr>';
		}

		initialData += '</table>';

		initialData += '<p>';

		for ( let j = 0; j < 50; j++ ) {
			if ( j % 3 === 0 ) {
				initialData += '<strong>Lorem ipsum</strong>';
			} else if ( j % 3 === 1 ) {
				initialData += '<em> dolor sit </em>';
			} else {
				initialData += '<s>amet. </s>';
			}
		}

		initialData += '</p>';
	}

	return initialData;
}
