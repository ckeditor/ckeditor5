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

	describe( 'lists', () => {
		describe( 'toView', () => {
			it( 'should process tight asterisks', () => {
				const viewFragment = dataProcessor.toView(
					'*	item 1\n' +
					'*	item 2\n' +
					'*	item 3'
				);

				expect( stringify( viewFragment ) ).to.equal(
					'<ul>' +
						'<li>item 1</li>' +
						'<li>item 2</li>' +
						'<li>item 3</li>' +
					'</ul>'
				);
			} );

			// it( 'should process loose asterisks', () => {
			// 	const viewFragment = dataProcessor.toView(
			// 		'*	item 1\n\n' +
			// 		'*	item 2\n\n' +
			// 		'*	item 3'
			// 	);
			//
			// 	expect( stringify( viewFragment ) ).to.equal(
			// 		'<ul>' +
			// 			'<li>item 1</li>' +
			// 			'<li>item 2</li>' +
			// 			'<li>item 3</li>' +
			// 		'</ul>'
			// 	);
			// } );

			it( 'should process tight pluses', () => {
				const viewFragment = dataProcessor.toView(
					'+	item 1\n' +
					'+	item 2\n' +
					'+	item 3'
				);

				expect( stringify( viewFragment ) ).to.equal(
					'<ul>' +
						'<li>item 1</li>' +
						'<li>item 2</li>' +
						'<li>item 3</li>' +
					'</ul>'
				);
			} );

			// it( 'should process loose pluses', () => {
			// 	const viewFragment = dataProcessor.toView(
			// 		'+	item 1\n\n' +
			// 		'+	item 2\n\n' +
			// 		'+	item 3'
			// 	);
			//
			// 	expect( stringify( viewFragment ) ).to.equal(
			// 		'<ul>' +
			// 			'<li>item 1</li>' +
			// 			'<li>item 2</li>' +
			// 			'<li>item 3</li>' +
			// 		'</ul>' );
			// } );

			it( 'should process tight minuses', () => {
				const viewFragment = dataProcessor.toView(
					'-	item 1\n' +
					'-	item 2\n' +
					'-	item 3'
				);

				expect( stringify( viewFragment ) ).to.equal(
					'<ul>' +
						'<li>item 1</li>' +
						'<li>item 2</li>' +
						'<li>item 3</li>' +
					'</ul>'
				);
			} );

			// it( 'should process loose minuses', () => {
			// 	const viewFragment = dataProcessor.toView(
			// 		'-	item 1\n\n' +
			// 		'-	item 2\n\n' +
			// 		'-	item 3' );
			//
			// 	expect( stringify( viewFragment ) ).to.equal(
			// 		'<ul>' +
			// 			'<li>item 1</li>' +
			// 			'<li>item 2</li>' +
			// 			'<li>item 3</li>' +
			// 		'</ul>' );
			// } );

			it( 'should process ordered list with tabs', () => {
				const viewFragment = dataProcessor.toView(
					'1.	item 1\n' +
					'2.	item 2\n' +
					'3.	item 3' );

				expect( stringify( viewFragment ) ).to.equal(
					'<ol>' +
						'<li>item 1</li>' +
						'<li>item 2</li>' +
						'<li>item 3</li>' +
					'</ol>'
				);
			} );

			it( 'should process ordered list with spaces', () => {
				const viewFragment = dataProcessor.toView(
					'1. item 1\n' +
					'2. item 2\n' +
					'3. item 3'
				);

				expect( stringify( viewFragment ) ).to.equal(
					'<ol>' +
						'<li>item 1</li>' +
						'<li>item 2</li>' +
						'<li>item 3</li>' +
					'</ol>' );
			} );

			// it( 'should process loose ordered list with tabs', () => {
			// 	const viewFragment = dataProcessor.toView(
			// 		'1.	item 1\n\n' +
			// 		'2.	item 2\n\n' +
			// 		'3.	item 3'
			// 	);
			//
			// 	expect( stringify( viewFragment ) ).to.equal(
			// 		'<ol>' +
			// 			'<li>item 1</li>' +
			// 			'<li>item 2</li>' +
			// 			'<li>item 3</li>' +
			// 		'</ol>'
			// 	);
			// } );

			// it( 'should process loose ordered list with spaces', () => {
			// 	const viewFragment = dataProcessor.toView(
			// 		'1. item 1\n\n' +
			// 		'2. item 2\n\n' +
			// 		'3. item 3'
			// 	);
			//
			// 	expect( stringify( viewFragment ) ).to.equal(
			// 		'<ol>' +
			// 			'<li>item 1</li>' +
			// 			'<li>item 2</li>' +
			// 			'<li>item 3</li>' +
			// 		'</ol>'
			// 	);
			// } );

			it( 'should process nested lists', () => {
				const viewFragment = dataProcessor.toView( '*	Tab\n	*	Tab\n		*	Tab' );

				expect( stringify( viewFragment ) ).to.equal( '<ul><li>Tab<ul><li>Tab<ul><li>Tab</li></ul></li></ul></li></ul>' );
			} );

			it( 'should process nested and mixed lists', () => {
				const viewFragment = dataProcessor.toView( '1. First\n2. Second:\n	* Fee\n	* Fie\n	* Foe\n3. Third' );

				expect( stringify( viewFragment ) ).to.equal(
					'<ol>' +
						'<li>First</li>' +
						'<li>Second:' +
							'<ul>' +
								'<li>Fee</li>' +
								'<li>Fie</li>' +
								'<li>Foe</li>' +
							'</ul>' +
						'</li>' +
						'<li>Third</li>' +
					'</ol>'
				);
			} );

			it( 'should process nested and mixed loose lists', () => {
				const viewFragment = dataProcessor.toView( '1. First\n\n2. Second:\n	* Fee\n	* Fie\n	* Foe\n\n3. Third' );

				expect( stringify( viewFragment ) ).to.equal(
					'<ol>' +
						'<li>' +
							'<p>First</p>' +
						'</li>' +
						'<li>' +
							'<p>Second:</p>' +
							'<ul>' +
								'<li>Fee</li>' +
								'<li>Fie</li>' +
								'<li>Foe</li>' +
							'</ul>' +
						'</li>' +
						'<li>' +
							'<p>Third</p>' +
						'</li>' +
					'</ol>'
				);
			} );

			it( 'should create same bullet from different list indicators', () => {
				const viewFragment = dataProcessor.toView( '* test\n+ test\n- test' );

				expect( stringify( viewFragment ) ).to.equal( '<ul><li>test</li><li>test</li><li>test</li></ul>' );
			} );
		} );

		describe( 'toData', () => {
			let viewFragment;

			beforeEach( () => {
				viewFragment = new DocumentFragment();
			} );

			it( 'should process unordered lists', () => {
				viewFragment.appendChildren( parse(
					'<ul>' +
						'<li>item 1</li>' +
						'<li>item 2</li>' +
						'<li>item 3</li>' +
					'</ul>'
				) );

				expect( dataProcessor.toData( viewFragment ) ).to.equal(
					'*   item 1\n' +
					'*   item 2\n' +
					'*   item 3'
				);
			} );

			it( 'should process ordered lists', () => {
				viewFragment.appendChildren( parse(
					'<ol>' +
						'<li>item 1</li>' +
						'<li>item 2</li>' +
						'<li>item 3</li>' +
					'</ol>'
				) );

				expect( dataProcessor.toData( viewFragment ) ).to.equal(
					'1.  item 1\n' +
					'2.  item 2\n' +
					'3.  item 3'
				);
			} );
		} );
	} );
} );
