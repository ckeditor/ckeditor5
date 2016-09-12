/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import MarkdownDataProcessor from '/ckeditor5/markdown-gfm/gfmdataprocessor.js';
import DocumentFragment from '/ckeditor5/engine/view/documentfragment.js';
import { stringify, parse } from '/tests/engine/_utils/view.js';

describe( 'GFMDataProcessor', () => {
	let dataProcessor;

	beforeEach( () => {
		dataProcessor = new MarkdownDataProcessor();
	} );

	describe( 'tables', () => {
		describe( 'toView', () => {
			it( 'should process tables', () => {
				const viewFragment = dataProcessor.toView(
					'| Heading 1 | Heading 2\n' +
					'| --- | ---\n' +
					'| Cell 1    | Cell 2\n' +
					'| Cell 3    | Cell 4\n'
				);

				expect( stringify( viewFragment ) ).to.equal(
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
					'</table>'
				);
			} );

			it( 'should process tables with aligned columns', () => {
				const viewFragment = dataProcessor.toView(
					'| Header 1 | Header 2 | Header 3 | Header 4 |\n' +
					'| :------: | -------: | :------- | -------- |\n' +
					'| Cell 1   | Cell 2   | Cell 3   | Cell 4   |\n' +
					'| Cell 5   | Cell 6   | Cell 7   | Cell 8   |'
				);

				expect( stringify( viewFragment ) ).to.equal(
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
					'</table>'
				);
			} );

			it( 'should process not table without borders', () => {
				const viewFragment = dataProcessor.toView(
					'Header 1 | Header 2\n' +
					'-------- | --------\n' +
					'Cell 1   | Cell 2\n' +
					'Cell 3   | Cell 4'
				);

				expect( stringify( viewFragment ) ).to.equal(
					'<table>' +
						'<thead>' +
							'<tr><th>Header 1</th><th>Header 2</th></tr>' +
						'</thead>' +
						'<tbody>' +
							'<tr><td>Cell 1</td><td>Cell 2</td></tr>' +
							'<tr><td>Cell 3</td><td>Cell 4</td></tr>' +
						'</tbody>' +
					'</table>'
				);
			} );

			it( 'should process formatting inside cells', () => {
				const viewFragment = dataProcessor.toView(
					'Header 1|Header 2|Header 3|Header 4\n' +
					':-------|:------:|-------:|--------\n' +
					'*Cell 1*  |**Cell 2**  |~~Cell 3~~  |Cell 4'
				);

				expect( stringify( viewFragment ) ).to.equal(
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
								'<td align="left"><em>Cell 1</em></td>' +
								'<td align="center"><strong>Cell 2</strong></td>' +
								'<td align="right"><del>Cell 3</del></td>' +
								'<td>Cell 4</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>'
				);
			} );
		} );

		describe( 'toData', () => {
			let viewFragment;

			beforeEach( () => {
				viewFragment = new DocumentFragment();
			} );

			it( 'should process tables', () => {
				viewFragment.appendChildren( parse(
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
					'</table>'
				) );

				expect( dataProcessor.toData( viewFragment ) ).to.equal(
					'| Heading 1 | Heading 2 |\n' +
					'| --- | --- |\n' +
					'| Cell 1 | Cell 2 |\n' +
					'| Cell 3 | Cell 4 |'
				);
			} );

			it( 'should process tables with aligned columns', () => {
				viewFragment.appendChildren( parse(
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
					'</table>'
				) );

				expect( dataProcessor.toData( viewFragment ) ).to.equal(
					'| Header 1 | Header 2 | Header 3 | Header 4 |\n' +
					'| :-: | --: | :-- | --- |\n' +
					'| Cell 1 | Cell 2 | Cell 3 | Cell 4 |\n' +
					'| Cell 5 | Cell 6 | Cell 7 | Cell 8 |'
				);
			} );

			it( 'should process formatting inside cells', () => {
				viewFragment.appendChildren( parse(
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
								'<td align="left"><em>Cell 1</em></td>' +
								'<td align="center"><strong>Cell 2</strong></td>' +
								'<td align="right"><del>Cell 3</del></td>' +
								'<td>Cell 4</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>'
				) );

				expect( dataProcessor.toData( viewFragment ) ).to.equal(
					'| Header 1 | Header 2 | Header 3 | Header 4 |\n' +
					'| :-- | :-: | --: | --- |\n' +
					'| _Cell 1_ | **Cell 2** | ~~Cell 3~~ | Cell 4 |'
				);
			} );
		} );
	} );
} );
