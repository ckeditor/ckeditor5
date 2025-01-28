/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

// Creates 40 paragraphs, each with a 1000 of text nodes, each text node is wrapped in an HTML tag that will be converted to text attribute.
// This is a counterpart data set to `formatting-short-paragraphs` where both tests have same total number of text nodes, but
// we observed that longer paragraphs have significant negative impact on editor performance.
// Note, that long, non-formatted paragraphs are not problematic as these texts are treated as one text node.
// We had instances where long non-formatted paragraphs were problematic, but these had always some formatting and `<br>`s which also
// spread text into multiple text nodes.
export default function makeData() {
	let initialData = '';

	for ( let i = 0; i < 40; i++ ) {
		initialData += '<p>';

		for ( let j = 0; j < 1000; j++ ) {
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
