/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

// Creates one table with 2000 rows and 10 columns, total 20000 cells.
// This tests editor performance when huge tables are in content.
export default function makeData() {
	let initialData = '';

	initialData += '<table>';

	for ( let i = 0; i < 2000; i++ ) {
		initialData += '<tr>';

		for ( let j = 0; j < 10; j++ ) {
			initialData += '<td>Lorem foo bar</td>';
		}

		initialData += '</tr>';
	}

	initialData += '</table>';

	return initialData;
}
