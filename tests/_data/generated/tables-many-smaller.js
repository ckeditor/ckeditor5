/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// Creates 40 smaller tables with 50 rows and 10 columns each, total 20000 cells.
// This is a counterpart data set for `table-huge` to see if it is just about cells quantity, or maybe longer tables have other problems.
export default function makeData() {
	let initialData = '';

	for ( let t = 0; t < 40; t++ ) {
		initialData += '<table>';

		for ( let i = 0; i < 50; i++ ) {
			initialData += '<tr>';

			for ( let j = 0; j < 10; j++ ) {
				initialData += '<td>Lorem foo bar</td>';
			}

			initialData += '</tr>';
		}

		initialData += '</table>';
	}

	return initialData;
}
