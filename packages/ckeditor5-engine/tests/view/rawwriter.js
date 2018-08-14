/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Element from '../../src/view/element';
import RawWriter from '../../src/view/rawwriter';
import HtmlDataProcessor from '../../src/dataprocessor/htmldataprocessor';

describe( 'RawWriter', () => {
	let writer, view, dataprocessor;

	before( () => {
		writer = new RawWriter();
		dataprocessor = new HtmlDataProcessor();
	} );

	beforeEach( () => {
		const html = '' +
			'<h1>Heading <strong>1</strong></h1>' +
			'<p class="foo1 bar2" style="text-align:left;" data-attr="abc">Foo <i>Bar</i> <strong>Bold</strong></p>' +
			'<p><u>Some underlined</u> text</p>' +
			'<ul>' +
			'<li>Item 1</li>' +
			'<li><span>Item <s>1</s></span></li>' +
			'<li><h2>Item 1</h2></li>' +
			'</ul>';

		view = dataprocessor.toView( html );
	} );

	describe( 'clone', () => {
		it( 'should clone simple element', () => {
			const el = view.getChild( 0 );
			const clone = writer.clone( el );

			expect( clone ).to.not.equal( el );
			expect( clone.isSimilar( el ) ).to.true;
			expect( clone.childCount ).to.equal( 0 );
		} );

		it( 'should clone element with all attributes', () => {
			const el = view.getChild( 1 );
			const clone = writer.clone( el );

			expect( clone ).to.not.equal( el );
			expect( clone.isSimilar( el ) ).to.true;
			expect( clone.childCount ).to.equal( 0 );
		} );

		it( 'should deep clone element', () => {
			const el = view.getChild( 0 );
			const clone = writer.clone( el, true );

			expect( clone ).to.not.equal( el );
			expect( clone.isSimilar( el ) ).to.true;
			expect( clone.childCount ).to.equal( el.childCount );
		} );
	} );

	describe( 'appendChild', () => {
		it( 'should append inline child to paragraph', () => {
			const el = view.getChild( 2 );
			const newChild = new Element( 'span' );

			const appended = writer.appendChild( el, newChild );

			expect( appended ).to.equal( 1 );
			expect( newChild.parent ).to.equal( el );
			expect( el.childCount ).to.equal( 3 );
		} );

		it( 'should append block children to paragraph', () => {
			const el = view.getChild( 2 );
			const newChild1 = new Element( 'p' );
			const newChild2 = new Element( 'h2' );

			const appended = writer.appendChild( el, [ newChild1, newChild2 ] );

			expect( appended ).to.equal( 2 );
			expect( newChild1.parent ).to.equal( el );
			expect( newChild2.parent ).to.equal( el );
			expect( el.childCount ).to.equal( 4 );
		} );

		it( 'should append list item to the list', () => {
			const el = view.getChild( 3 );
			const newChild = new Element( 'li' );

			const appended = writer.appendChild( el, newChild );

			expect( appended ).to.equal( 1 );
			expect( newChild.parent ).to.equal( el );
			expect( el.childCount ).to.equal( 4 );
		} );
	} );
} );
