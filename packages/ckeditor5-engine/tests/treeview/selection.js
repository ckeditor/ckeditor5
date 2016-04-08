/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import Selection from '/ckeditor5/engine/treeview/selection.js';
import Range from '/ckeditor5/engine/treeview/range.js';
import Element from '/ckeditor5/engine/treeview/element.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';

describe( 'Selection', () => {
	let selection;

	beforeEach( () => {
		selection = new Selection();
	} );

	describe( 'anchor', () => {
		it( 'should return null if no ranges in selection', () => {
			expect( selection.anchor ).to.be.null;
		} );

		it( 'should return start of single range in selection', () => {
			const el = new Element( 'p' );
			const range = Range.createFromParentsAndOffsets( el, 5, el, 10 );
			selection.addRange( range );
			const anchor = selection.anchor;

			expect( anchor.isEqual( range.start ) ).to.be.true;
			expect( anchor ).to.not.equal( range.start );
		} );

		it( 'should return end of single range in selection when added as backward', () => {
			const el = new Element( 'p' );
			const range = Range.createFromParentsAndOffsets( el, 5, el, 10 );
			selection.addRange( range, true );
			const anchor = selection.anchor;

			expect( anchor.isEqual( range.end ) ).to.be.true;
			expect( anchor ).to.not.equal( range.end );
		} );

		it( 'should get anchor from last inserted range', () => {
			const el = new Element( 'p' );
			const range1 = Range.createFromParentsAndOffsets( el, 5, el, 10 );
			const range2 = Range.createFromParentsAndOffsets( el, 15, el, 20 );
			selection.addRange( range1 );
			selection.addRange( range2 );

			expect( selection.anchor.isEqual( range2.start ) ).to.be.true;
		} );
	} );

	describe( 'focus', () => {
		it( 'should return null if no ranges in selection', () => {
			expect( selection.focus ).to.be.null;
		} );

		it( 'should return end of single range in selection', () => {
			const el = new Element( 'p' );
			const range = Range.createFromParentsAndOffsets( el, 5, el, 10 );
			selection.addRange( range );
			const focus = selection.focus;

			expect( focus.isEqual( range.end ) ).to.be.true;
		} );

		it( 'should return start of single range in selection when added as backward', () => {
			const el = new Element( 'p' );
			const range = Range.createFromParentsAndOffsets( el, 5, el, 10 );
			selection.addRange( range, true );
			const focus = selection.focus;

			expect( focus.isEqual( range.start ) ).to.be.true;
			expect( focus ).to.not.equal( range.start );
		} );

		it( 'should get focus from last inserted range', () => {
			const el = new Element( 'p' );
			const range1 = Range.createFromParentsAndOffsets( el, 5, el, 10 );
			const range2 = Range.createFromParentsAndOffsets( el, 15, el, 20 );
			selection.addRange( range1 );
			selection.addRange( range2 );

			expect( selection.focus.isEqual( range2.end ) ).to.be.true;
		} );
	} );

	describe( 'isCollapsed', () => {
		it( 'should return true when all ranges are collapsed', () => {
			const el = new Element( 'p' );
			const range1 = Range.createFromParentsAndOffsets( el, 5, el, 5 );
			const range2 = Range.createFromParentsAndOffsets( el, 15, el, 15 );
			selection.addRange( range1 );
			selection.addRange( range2 );

			expect( selection.isCollapsed ).to.be.true;
		} );

		it( 'should return false when not all ranges are collapsed', () => {
			const el = new Element( 'p' );
			const range1 = Range.createFromParentsAndOffsets( el, 5, el, 5 );
			const range2 = Range.createFromParentsAndOffsets( el, 15, el, 16 );
			selection.addRange( range1 );
			selection.addRange( range2 );

			expect( selection.isCollapsed ).to.be.false;
		} );
	} );

	describe( 'rangeCount', () => {
		it( 'should return proper range count', () => {
			const el = new Element( 'p' );
			const range1 = Range.createFromParentsAndOffsets( el, 5, el, 5 );
			const range2 = Range.createFromParentsAndOffsets( el, 15, el, 16 );
			expect( selection.rangeCount ).to.equal( 0 );
			selection.addRange( range1 );
			expect( selection.rangeCount ).to.equal( 1 );
			selection.addRange( range2 );
			expect( selection.rangeCount ).to.equal( 2 );
		} );
	} );

	describe( 'addRange', () => {
		it( 'should add range to selection ranges', () => {
			const el = new Element( 'p' );
			const range = Range.createFromParentsAndOffsets( el, 0, el, 1 );

			selection.addRange( range );
			expect( selection.getRangeAt( 0 ).isEqual( range ) ).to.be.true;
		} );

		it( 'should fire change event', ( done ) => {
			const el = new Element( 'p' );
			const range = Range.createFromParentsAndOffsets( el, 0, el, 1 );

			selection.once( 'change:range', () => {
				expect( selection.getRangeAt( 0 ).isEqual( range ) ).to.be.true;
				done();
			} );

			selection.addRange( range );
		} );

		it( 'should throw when range is intersecting with already added range', () => {
			const el = new Element( 'p' );
			const range1 = Range.createFromParentsAndOffsets( el, 5, el, 10 );
			const range2 = Range.createFromParentsAndOffsets( el, 7, el, 15 );
			selection.addRange( range1 );
			expect( () => {
				selection.addRange( range2 );
			} ).to.throw( CKEditorError, 'view-selection-range-intersects' );

			expect( () => {
				selection.addRange( range1 );
			} ).to.throw( CKEditorError, 'view-selection-range-intersects' );
		} );
	} );
} );