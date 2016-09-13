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

	describe( 'images', () => {
		describe( 'toView', () => {
			it( 'should process images', () => {
				const viewFragment = dataProcessor.toView( '![alt text](http://example.com/image.png "title text")' );

				expect( stringify( viewFragment ) ).to.equal(
					'<p>' +
						'<img alt="alt text" src="http://example.com/image.png" title="title text"></img>' +
					'</p>'
				);
			} );

			it( 'should process images without title', () => {
				const viewFragment = dataProcessor.toView( '![alt text](http://example.com/image.png)' );

				expect( stringify( viewFragment ) ).to.equal(
					'<p>' +
					'<img alt="alt text" src="http://example.com/image.png"></img>' +
					'</p>'
				);
			} );

			it( 'should process images without alt text', () => {
				const viewFragment = dataProcessor.toView( '![](http://example.com/image.png "title text")' );

				expect( stringify( viewFragment ) ).to.equal(
					'<p>' +
					'<img alt="" src="http://example.com/image.png" title="title text"></img>' +
					'</p>'
				);
			} );

			it( 'should process referenced images', () => {
				const viewFragment = dataProcessor.toView(
					'![alt text][logo]\n' +
					'[logo]: http://example.com/image.png "title text"'
				);

				expect( stringify( viewFragment ) ).to.equal(
					'<p>' +
					'<img alt="alt text" src="http://example.com/image.png" title="title text"></img>' +
					'</p>'
				);
			} );

			it( 'should process referenced images without title', () => {
				const viewFragment = dataProcessor.toView(
					'![alt text][logo]\n' +
					'[logo]: http://example.com/image.png'
				);

				expect( stringify( viewFragment ) ).to.equal(
					'<p>' +
					'<img alt="alt text" src="http://example.com/image.png"></img>' +
					'</p>'
				);
			} );

			it( 'should process referenced images without alt text', () => {
				const viewFragment = dataProcessor.toView(
					'![][logo]\n' +
					'[logo]: http://example.com/image.png "title text"'
				);

				expect( stringify( viewFragment ) ).to.equal(
					'<p>' +
					'<img alt="" src="http://example.com/image.png" title="title text"></img>' +
					'</p>'
				);
			} );

			it( 'should process referenced images without alt text and title', () => {
				const viewFragment = dataProcessor.toView(
					'![][logo]\n' +
					'[logo]: http://example.com/image.png'
				);

				expect( stringify( viewFragment ) ).to.equal(
					'<p>' +
					'<img alt="" src="http://example.com/image.png"></img>' +
					'</p>'
				);
			} );
		} );

		describe( 'toData', () => {
			let viewFragment;

			beforeEach( () => {
				viewFragment = new DocumentFragment();
			} );

			it( 'should process image element', () => {
				viewFragment.appendChildren( parse(
					'<p>' +
						'<img alt="alt text" src="http://example.com/image.png" title="title text"></img>' +
					'</p>'
				) );

				expect( dataProcessor.toData( viewFragment ) ).to.equal( '![alt text](http://example.com/image.png "title text")' );
			} );

			it( 'should process image element without alt text', () => {
				viewFragment.appendChildren( parse(
					'<p>' +
						'<img src="http://example.com/image.png" title="title text"></img>' +
					'</p>'
				) );

				expect( dataProcessor.toData( viewFragment ) ).to.equal( '![](http://example.com/image.png "title text")' );
			} );

			it( 'should process image element without title', () => {
				viewFragment.appendChildren( parse(
					'<p>' +
					'<img alt="alt text" src="http://example.com/image.png"></img>' +
					'</p>'
				) );

				expect( dataProcessor.toData( viewFragment ) ).to.equal( '![alt text](http://example.com/image.png)' );
			} );

			it( 'should process image element without title and alt text', () => {
				viewFragment.appendChildren( parse(
					'<p>' +
					'<img src="http://example.com/image.png"></img>' +
					'</p>'
				) );

				expect( dataProcessor.toData( viewFragment ) ).to.equal( '![](http://example.com/image.png)' );
			} );
		} );
	} );
} );
