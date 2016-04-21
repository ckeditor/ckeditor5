/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import { getData, setData } from '/tests/engine/_utils/view.js';
import DocumentFragment from '/ckeditor5/engine/treeview/documentfragment.js';
import Element from '/ckeditor5/engine/treeview/element.js';
import AttributeElement from '/ckeditor5/engine/treeview/attributeelement.js';
import ContainerElement from '/ckeditor5/engine/treeview/containerelement.js';
import Text from '/ckeditor5/engine/treeview/text.js';
import Selection from '/ckeditor5/engine/treeview/selection.js';
import Range from '/ckeditor5/engine/treeview/range.js';

describe( 'view test utils', () => {
	describe( 'getData', () => {
		it( 'should write elements and texts', () => {
			const text = new Text( 'foobar' );
			const b = new Element( 'b', null, text );
			const p = new Element( 'p', null, b );

			expect( getData( p ) ).to.equal( '<p><b>foobar</b></p>' );
		} );

		it( 'should write elements with attributes', () => {
			const text = new Text( 'foobar' );
			const b = new Element( 'b', {
				foo: 'bar'
			}, text );
			const p = new Element( 'p', {
				baz: 'qux',
				bar: 'taz',
				class: 'short wide'
			}, b );

			expect( getData( p ) ).to.equal( '<p class="short wide" baz="qux" bar="taz"><b foo="bar">foobar</b></p>' );
		} );

		it( 'should write selection ranges inside elements', () => {
			const text1 = new Text( 'foobar' );
			const text2 = new Text( 'bazqux' );
			const b1 = new Element( 'b', null, text1 );
			const b2 = new Element( 'b', null, text2 );
			const p = new Element( 'p', null, [ b1, b2 ] );
			const range = Range.createFromParentsAndOffsets( p, 1, p, 2 );
			const selection = new Selection();
			selection.addRange( range );
			expect( getData( p, selection ) ).to.equal( '<p><b>foobar</b>[<b>bazqux</b>]</p>' );
		} );

		it( 'should write collapsed selection ranges inside elements', () => {
			const text = new Text( 'foobar' );
			const p = new Element( 'p', null, text );
			const range = Range.createFromParentsAndOffsets( p, 0, p, 0 );
			const selection = new Selection();
			selection.addRange( range );
			expect( getData( p, selection ) ).to.equal( '<p>[]foobar</p>' );
		} );

		it( 'should write selection ranges inside text', () => {
			const text1 = new Text( 'foobar' );
			const text2 = new Text( 'bazqux' );
			const b1 = new Element( 'b', null, text1 );
			const b2 = new Element( 'b', null, text2 );
			const p = new Element( 'p', null, [ b1, b2 ] );
			const range = Range.createFromParentsAndOffsets( text1, 1, text1, 5 );
			const selection = new Selection();
			selection.addRange( range );
			expect( getData( p, selection ) ).to.equal( '<p><b>f{ooba}r</b><b>bazqux</b></p>' );
		} );

		it( 'should write collapsed selection ranges inside texts', () => {
			const text = new Text( 'foobar' );
			const p = new Element( 'p', null, text );
			const range = Range.createFromParentsAndOffsets( text, 0, text, 0 );
			const selection = new Selection();
			selection.addRange( range );
			expect( getData( p, selection ) ).to.equal( '<p>{}foobar</p>' );
		} );

		it( 'should write ranges that start inside text end ends between elements', () => {
			const text1 = new Text( 'foobar' );
			const text2 = new Text( 'bazqux' );
			const b1 = new Element( 'b', null, text1 );
			const b2 = new Element( 'b', null, text2 );
			const p = new Element( 'p', null, [ b1, b2 ] );
			const range = Range.createFromParentsAndOffsets( p, 0, text2, 5 );
			const selection = new Selection();
			selection.addRange( range );
			expect( getData( p, selection ) ).to.equal( '<p>[<b>foobar</b><b>bazqu}x</b></p>' );
		} );

		it( 'should write elements types as namespaces when needed', () => {
			const text = new Text( 'foobar' );
			const b = new AttributeElement( 'b', null, text );
			const p = new ContainerElement( 'p', null, b );

			expect( getData( p, null, { showType: true } ) )
				.to.equal( '<container:p><attribute:b>foobar</attribute:b></container:p>' );
		} );

		it( 'should write elements priorities when needed', () => {
			const text = new Text( 'foobar' );
			const b = new AttributeElement( 'b', null, text );
			const p = new ContainerElement( 'p', null, b );

			expect( getData( p, null, { showPriority: true } ) )
				.to.equal( '<p><b:10>foobar</b:10></p>' );
		} );

		it( 'should parse DocumentFragment as root', () => {
			const text1 = new Text( 'foobar' );
			const text2 = new Text( 'bazqux' );
			const b1 = new Element( 'b', null, text1 );
			const b2 = new Element( 'b', null, text2 );
			const fragment = new DocumentFragment( [ b1, b2 ] );
			expect( getData( fragment, null ) ).to.equal( '<b>foobar</b><b>bazqux</b>' );
		} );

		it( 'should not write ranges outside elements', () => {
			const text = new Text( 'foobar' );
			const b = new Element( 'b', null, text );
			const p = new Element( 'p', null, b );
			const range1 = Range.createFromParentsAndOffsets( p, 0, p, 5 );
			const range2 = Range.createFromParentsAndOffsets( p, -1, p, 1 );
			const range3 = Range.createFromParentsAndOffsets( text, 0, text, 7 );
			const range4 = Range.createFromParentsAndOffsets( text, -1, text, 2 );
			const range5 = Range.createFromParentsAndOffsets( text, 6, text, 8 );
			const selection = new Selection();
			selection.addRange( range1 );
			expect( getData( p, selection ) ).to.equal( '<p>[<b>foobar</b></p>' );
			selection.setRanges( [ range2 ] );
			expect( getData( p, selection ) ).to.equal( '<p><b>foobar</b>]</p>' );
			selection.setRanges( [ range3 ] );
			expect( getData( p, selection ) ).to.equal( '<p><b>{foobar</b></p>' );
			selection.setRanges( [ range4 ] );
			expect( getData( p, selection ) ).to.equal( '<p><b>fo}obar</b></p>' );
			selection.setRanges( [ range5 ] );
			expect( getData( p, selection ) ).to.equal( '<p><b>foobar{</b></p>' );
		} );

		it( 'should write multiple ranges from selection #1', () => {
			const text1 = new Text( 'foobar' );
			const text2 = new Text( 'bazqux' );
			const b1 = new Element( 'b', null, text1 );
			const b2 = new Element( 'b', null, text2 );
			const p = new Element( 'p', null, [ b1, b2 ] );
			const range1 = Range.createFromParentsAndOffsets( p, 0, p, 1 );
			const range2 = Range.createFromParentsAndOffsets( p, 1, p, 1 );
			const selection = new Selection();
			selection.setRanges( [ range2, range1 ] );

			expect( getData( p, selection ) ).to.equal( '<p>[<b>foobar</b>][]<b>bazqux</b></p>' );
		} );

		it( 'should write multiple ranges from selection #2', () => {
			const text1 = new Text( 'foobar' );
			const text2 = new Text( 'bazqux' );
			const b = new Element( 'b', null, text1 );
			const p = new Element( 'p', null, [ b, text2 ] );
			const range1 = Range.createFromParentsAndOffsets( p, 0, p, 1 );
			const range2 = Range.createFromParentsAndOffsets( text2, 0, text2, 3 );
			const range3 = Range.createFromParentsAndOffsets( text2, 3, text2, 4 );
			const range4 = Range.createFromParentsAndOffsets( p, 1, p, 1 );
			const selection = new Selection();
			selection.setRanges( [ range1, range2, range3, range4 ] );

			expect( getData( p, selection ) ).to.equal( '<p>[<b>foobar</b>][]{baz}{q}ux</p>' );
		} );
	} );

	describe( 'setData', () => {
		it( 'should parse elements and texts', () => {
			const view = setData( '<b>foobar</b>' );
			const element = new Element( 'b' );

			expect( view ).to.be.instanceof( Element );
			expect( view.isSimilar( element ) ).to.be.true;
			expect( view.getChildCount() ).to.equal( 1 );
			const text = view.getChild( 0 );
			expect( text ).to.be.instanceof( Text );
			expect( text.data ).to.equal( 'foobar' );
		} );

		it( 'should parse element attributes', () => {
			const view = setData( '<b name="foo" title="bar" class="foo bar" style="color:red;"></b>' );
			const element = new Element( 'b', { name: 'foo', title: 'bar', class: 'foo bar', style: 'color:red;' } );

			expect( view ).to.be.instanceof( Element );
			expect( view.isSimilar( element ) ).to.be.true;
			expect( view.getChildCount() ).to.equal( 0 );
		} );

		it( 'should parse element type', () => {
			const view1 = setData( '<attribute:b></attribute:b>' );
			const attribute = new AttributeElement( 'b' );
			const view2 = setData( '<container:p></container:p>' );
			const container = new ContainerElement( 'p' );

			expect( view1 ).to.be.instanceof( AttributeElement );
			expect( view1.isSimilar( attribute ) ).to.be.true;
			expect( view2 ).to.be.instanceof( ContainerElement );
			expect( view2.isSimilar( container ) ).to.be.true;
		} );

		it( 'should parse element priority', () => {
			const parsed1 = setData( '<b:12></b:12>' );
			const attribute1 = new AttributeElement( 'b' );
			attribute1.priority = 12;
			const parsed2 = setData( '<attribute:b:44></attribute:b:44>' );
			const attribute2 = new AttributeElement( 'b' );
			attribute2.priority = 44;

			parsed1.isSimilar( attribute1 );
			expect( parsed1.isSimilar( attribute1 ) ).to.be.true;
			expect( parsed2.isSimilar( attribute2 ) ).to.be.true;
		} );
	} );
} );