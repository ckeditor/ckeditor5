/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { testDataProcessor } from '../_utils/utils';

describe( 'GFMDataProcessor', () => {
	describe( 'tables', () => {
		it( 'should process tables', () => {
			testDataProcessor(
				'| Heading 1 | Heading 2\n' +
				'| --- | ---\n' +
				'| Cell 1    | Cell 2\n' +
				'| Cell 3    | Cell 4\n',

				'<table>' +
					'<thead>' +
						'<tr>' +
							'<th>Heading 1</th>' +
							'<th>Heading 2</th>' +
						'</tr>' +
					'</thead>' +
					'<tbody>' +
						'<tr>' +
							'<td>Cell 1</td>' +
							'<td>Cell 2</td>' +
						'</tr>' +
						'<tr>' +
							'<td>Cell 3</td>' +
							'<td>Cell 4</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>',

				// After converting back it will be normalized.
				'| Heading 1 | Heading 2 |\n' +
				'| --- | --- |\n' +
				'| Cell 1 | Cell 2 |\n' +
				'| Cell 3 | Cell 4 |'
			);
		} );

		it( 'should process tables with aligned columns', () => {
			testDataProcessor(
				'| Header 1 | Header 2 | Header 3 | Header 4 |\n' +
				'| :------: | -------: | :------- | -------- |\n' +
				'| Cell 1   | Cell 2   | Cell 3   | Cell 4   |\n' +
				'| Cell 5   | Cell 6   | Cell 7   | Cell 8   |',

				'<table>' +
					'<thead>' +
						'<tr>' +
							'<th align="center">Header 1</th>' +
							'<th align="right">Header 2</th>' +
							'<th align="left">Header 3</th>' +
							'<th>Header 4</th>' +
						'</tr>' +
					'</thead>' +
					'<tbody>' +
						'<tr>' +
							'<td align="center">Cell 1</td>' +
							'<td align="right">Cell 2</td>' +
							'<td align="left">Cell 3</td>' +
							'<td>Cell 4</td>' +
						'</tr>' +
						'<tr>' +
							'<td align="center">Cell 5</td>' +
							'<td align="right">Cell 6</td>' +
							'<td align="left">Cell 7</td>' +
							'<td>Cell 8</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>',

				// After converting back it will be normalized.
				'| Header 1 | Header 2 | Header 3 | Header 4 |\n' +
				'| :-: | --: | :-- | --- |\n' +
				'| Cell 1 | Cell 2 | Cell 3 | Cell 4 |\n' +
				'| Cell 5 | Cell 6 | Cell 7 | Cell 8 |'
			);
		} );

		it( 'should process not table without borders', () => {
			testDataProcessor(
				'Header 1 | Header 2\n' +
				'-------- | --------\n' +
				'Cell 1   | Cell 2\n' +
				'Cell 3   | Cell 4',

				'<table>' +
					'<thead>' +
						'<tr>' +
							'<th>Header 1</th>' +
							'<th>Header 2</th>' +
						'</tr>' +
					'</thead>' +
					'<tbody>' +
						'<tr>' +
							'<td>Cell 1</td>' +
							'<td>Cell 2</td>' +
						'</tr>' +
						'<tr>' +
							'<td>Cell 3</td>' +
							'<td>Cell 4</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>',

				// After converting back it will be normalized.
				'| Header 1 | Header 2 |\n' +
				'| --- | --- |\n' +
				'| Cell 1 | Cell 2 |\n' +
				'| Cell 3 | Cell 4 |'
			);
		} );

		it( 'should process formatting inside cells', () => {
			testDataProcessor(
				'Header 1|Header 2|Header 3|Header 4\n' +
				':-------|:------:|-------:|--------\n' +
				'*Cell 1*  |**Cell 2**  |~Cell 3~  |Cell 4',

				'<table>' +
					'<thead>' +
						'<tr>' +
							'<th align="left">Header 1</th>' +
							'<th align="center">Header 2</th>' +
							'<th align="right">Header 3</th>' +
							'<th>Header 4</th>' +
						'</tr>' +
					'</thead>' +
					'<tbody>' +
						'<tr>' +
							'<td align="left">' +
								'<em>Cell 1</em>' +
							'</td>' +
							'<td align="center">' +
								'<strong>Cell 2</strong>' +
							'</td>' +
							'<td align="right">' +
								'<del>Cell 3</del>' +
							'</td>' +
							'<td>' +
								'Cell 4' +
							'</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>',

				// After converting back it will be normalized.
				'| Header 1 | Header 2 | Header 3 | Header 4 |\n' +
				'| :-- | :-: | --: | --- |\n' +
				'| _Cell 1_ | **Cell 2** | ~Cell 3~ | Cell 4 |'
			);
		} );
	} );
} );
