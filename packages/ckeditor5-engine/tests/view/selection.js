/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: view */

import Selection from '/ckeditor5/engine/view/selection.js';
import Range from '/ckeditor5/engine/view/range.js';
import Document from '/ckeditor5/engine/view/document.js';
import Element from '/ckeditor5/engine/view/element.js';
import Text from '/ckeditor5/engine/view/text.js';
import Position from '/ckeditor5/engine/view/position.js';

describe( 'Selection', () => {
	let selection;
	let el;
	let range1, range2, range3;

	beforeEach( () => {
		selection = new Selection();
		el = new Element( 'p' );
		range1 = Range.createFromParentsAndOffsets( el, 5, el, 10 );
		range2 = Range.createFromParentsAndOffsets( el, 1, el, 2 );
		range3 = Range.createFromParentsAndOffsets( el, 12, el, 14 );
	} );

	describe( 'anchor', () => {
		it( 'should return null if no ranges in selection', () => {
			expect( selection.anchor ).to.be.null;
		} );

		it( 'should return start of single range in selection', () => {
			selection.addRange( range1 );
			const anchor = selection.anchor;

			expect( anchor.isEqual( range1.start ) ).to.be.true;
			expect( anchor ).to.not.equal( range1.start );
		} );

		it( 'should return end of single range in selection when added as backward', () => {
			selection.addRange( range1, true );
			const anchor = selection.anchor;

			expect( anchor.isEqual( range1.end ) ).to.be.true;
			expect( anchor ).to.not.equal( range1.end );
		} );

		it( 'should get anchor from last inserted range', () => {
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
			selection.addRange( range1 );
			const focus = selection.focus;

			expect( focus.isEqual( range1.end ) ).to.be.true;
		} );

		it( 'should return start of single range in selection when added as backward', () => {
			selection.addRange( range1, true );
			const focus = selection.focus;

			expect( focus.isEqual( range1.start ) ).to.be.true;
			expect( focus ).to.not.equal( range1.start );
		} );

		it( 'should get focus from last inserted range', () => {
			selection.addRange( range1 );
			selection.addRange( range2 );

			expect( selection.focus.isEqual( range2.end ) ).to.be.true;
		} );
	} );

	describe( 'isCollapsed', () => {
		it( 'should return true when there is single collapsed range', () => {
			const range = Range.createFromParentsAndOffsets( el, 5, el, 5 );
			selection.addRange( range );

			expect( selection.isCollapsed ).to.be.true;
		} );

		it( 'should return false when there are multiple ranges', () => {
			const range1 = Range.createFromParentsAndOffsets( el, 5, el, 5 );
			const range2 = Range.createFromParentsAndOffsets( el, 15, el, 15 );
			selection.addRange( range1 );
			selection.addRange( range2 );

			expect( selection.isCollapsed ).to.be.false;
		} );

		it( 'should return false when there is not collapsed range', () => {
			const range = Range.createFromParentsAndOffsets( el, 15, el, 16 );
			selection.addRange( range );

			expect( selection.isCollapsed ).to.be.false;
		} );
	} );

	describe( 'rangeCount', () => {
		it( 'should return proper range count', () => {
			expect( selection.rangeCount ).to.equal( 0 );

			selection.addRange( range1 );

			expect( selection.rangeCount ).to.equal( 1 );

			selection.addRange( range2 );

			expect( selection.rangeCount ).to.equal( 2 );
		} );
	} );

	describe( 'isBackward', () => {
		it( 'is defined by the last added range', () => {
			const range1 = Range.createFromParentsAndOffsets( el, 5, el, 10 );
			const range2 = Range.createFromParentsAndOffsets( el, 15, el, 16 );

			selection.addRange( range1, true );
			expect( selection ).to.have.property( 'isBackward', true );

			selection.addRange( range2 );
			expect( selection ).to.have.property( 'isBackward', false );
		} );

		it( 'is false when last range is collapsed', () => {
			const range = Range.createFromParentsAndOffsets( el, 5, el, 5 );

			selection.addRange( range, true );

			expect( selection.isBackward ).to.be.false;
		} );
	} );

	describe( 'addRange', () => {
		it( 'should throw an error when range is invalid', () => {
			expect( () => {
				selection.addRange( { invalid: 'range' } );
			} ).to.throwCKEditorError( 'view-selection-invalid-range: Invalid Range.' );
		} );

		it( 'should add range to selection ranges', () => {
			selection.addRange( range1 );
			expect( selection._ranges[ 0 ].isEqual( range1 ) ).to.be.true;
		} );

		it( 'should fire change event', ( done ) => {
			selection.once( 'change', () => {
				expect( selection._ranges[ 0 ].isEqual( range1 ) ).to.be.true;
				done();
			} );

			selection.addRange( range1 );
		} );

		it( 'should throw when range is intersecting with already added range', () => {
			const range2 = Range.createFromParentsAndOffsets( el, 7, el, 15 );
			selection.addRange( range1 );
			expect( () => {
				selection.addRange( range2 );
			} ).to.throwCKEditorError( 'view-selection-range-intersects' );

			expect( () => {
				selection.addRange( range1 );
			} ).to.throwCKEditorError( 'view-selection-range-intersects' );
		} );
	} );

	describe( 'getRanges', () => {
		it( 'should return iterator with copies of all ranges', () => {
			selection.addRange( range1 );
			selection.addRange( range2 );

			const iterable = selection.getRanges();
			const ranges = Array.from( iterable );

			expect( ranges.length ).to.equal( 2 );
			expect( ranges[ 0 ].isEqual( range1 ) ).to.be.true;
			expect( ranges[ 0 ] ).to.not.equal( range1 );
			expect( ranges[ 1 ].isEqual( range2 ) ).to.be.true;
			expect( ranges[ 1 ] ).to.not.equal( range2 );
		} );
	} );

	describe( 'getFirstRange', () => {
		it( 'should return copy of range with first position', () => {
			selection.addRange( range1 );
			selection.addRange( range2 );
			selection.addRange( range3 );

			const range = selection.getFirstRange();

			expect( range.isEqual( range2 ) ).to.be.true;
			expect( range ).to.not.equal( range2 );
		} );

		it( 'should return null if no ranges are present', () => {
			expect( selection.getFirstRange() ).to.be.null;
		} );
	} );

	describe( 'getLastRange', () => {
		it( 'should return copy of range with last position', () => {
			selection.addRange( range1 );
			selection.addRange( range2 );
			selection.addRange( range3 );

			const range = selection.getLastRange();

			expect( range.isEqual( range3 ) ).to.be.true;
			expect( range ).to.not.equal( range3 );
		} );

		it( 'should return null if no ranges are present', () => {
			expect( selection.getLastRange() ).to.be.null;
		} );
	} );

	describe( 'getFirstPosition', () => {
		it( 'should return copy of first position', () => {
			selection.addRange( range1 );
			selection.addRange( range2 );
			selection.addRange( range3 );

			const position = selection.getFirstPosition();

			expect( position.isEqual( range2.start ) ).to.be.true;
			expect( position ).to.not.equal( range2.start );
		} );

		it( 'should return null if no ranges are present', () => {
			expect( selection.getFirstPosition() ).to.be.null;
		} );
	} );

	describe( 'getLastPosition', () => {
		it( 'should return copy of range with last position', () => {
			selection.addRange( range1 );
			selection.addRange( range2 );
			selection.addRange( range3 );

			const position = selection.getLastPosition();

			expect( position.isEqual( range3.end ) ).to.be.true;
			expect( position ).to.not.equal( range3.end );
		} );

		it( 'should return null if no ranges are present', () => {
			expect( selection.getLastPosition() ).to.be.null;
		} );
	} );

	describe( 'isEqual', () => {
		it( 'should return true if selections equal', () => {
			selection.addRange( range1 );
			selection.addRange( range2 );

			const otherSelection = new Selection();
			otherSelection.addRange( range1 );
			otherSelection.addRange( range2 );

			expect( selection.isEqual( otherSelection ) ).to.be.true;
		} );

		it( 'should return true if backward selections equal', () => {
			selection.addRange( range1, true );

			const otherSelection = new Selection();
			otherSelection.addRange( range1, true );

			expect( selection.isEqual( otherSelection ) ).to.be.true;
		} );

		it( 'should return false if ranges count does not equal', () => {
			selection.addRange( range1 );
			selection.addRange( range2 );

			const otherSelection = new Selection();
			otherSelection.addRange( range1 );

			expect( selection.isEqual( otherSelection ) ).to.be.false;
		} );

		it( 'should return false if ranges do not equal', () => {
			selection.addRange( range1 );

			const otherSelection = new Selection();
			otherSelection.addRange( range2 );

			expect( selection.isEqual( otherSelection ) ).to.be.false;
		} );

		it( 'should return false if directions do not equal', () => {
			selection.addRange( range1 );

			const otherSelection = new Selection();
			otherSelection.addRange( range1, true );

			expect( selection.isEqual( otherSelection ) ).to.be.false;
		} );
	} );

	describe( 'removeAllRanges', () => {
		it( 'should remove all ranges and fire change event', ( done ) => {
			selection.addRange( range1 );
			selection.addRange( range2 );

			selection.once( 'change', () => {
				expect( selection.rangeCount ).to.equal( 0 );
				done();
			} );

			selection.removeAllRanges();
		} );

		it( 'should do nothing when no ranges are present', () => {
			const fireSpy = sinon.spy( selection, 'fire' );
			selection.removeAllRanges();

			fireSpy.restore();
			expect( fireSpy.notCalled ).to.be.true;
		} );
	} );

	describe( 'setRanges', () => {
		it( 'should throw an error when range is invalid', () => {
			expect( () => {
				selection.setRanges( [ { invalid: 'range' } ] );
			} ).to.throwCKEditorError( 'view-selection-invalid-range: Invalid Range.' );
		} );

		it( 'should add ranges and fire change event', ( done ) => {
			selection.addRange( range1 );

			selection.once( 'change', () => {
				expect( selection.rangeCount ).to.equal( 2 );
				expect( selection._ranges[ 0 ].isEqual( range2 ) ).to.be.true;
				expect( selection._ranges[ 0 ] ).is.not.equal( range2 );
				expect( selection._ranges[ 1 ].isEqual( range3 ) ).to.be.true;
				expect( selection._ranges[ 1 ] ).is.not.equal( range3 );
				done();
			} );

			selection.setRanges( [ range2, range3 ] );
		} );
	} );

	describe( 'setTo', () => {
		it( 'should return true if selections equal', () => {
			selection.addRange( range1 );

			const otherSelection = new Selection();
			otherSelection.addRange( range2 );
			otherSelection.addRange( range3, true );

			selection.setTo( otherSelection );

			expect( selection.rangeCount ).to.equal( 2 );
			expect( selection._ranges[ 0 ].isEqual( range2 ) ).to.be.true;
			expect( selection._ranges[ 0 ] ).is.not.equal( range2 );
			expect( selection._ranges[ 1 ].isEqual( range3 ) ).to.be.true;
			expect( selection._ranges[ 1 ] ).is.not.equal( range3 );

			expect( selection.anchor.isEqual( range3.end ) ).to.be.true;
		} );

		it( 'should fire change event', ( done ) => {
			selection.on( 'change', () => {
				expect( selection.rangeCount ).to.equal( 1 );
				expect( selection.getFirstRange().isEqual( range1 ) ).to.be.true;
				done();
			} );

			const otherSelection = new Selection();
			otherSelection.addRange( range1 );

			selection.setTo( otherSelection );
		} );
	} );

	describe( 'collapse', () => {
		beforeEach( () => {
			selection.setRanges( [ range1, range2 ] );
		} );

		it( 'should collapse selection at position', () => {
			const position = new Position( el, 4 );

			selection.collapse( position );
			const range = selection.getFirstRange();

			expect( range.start.parent ).to.equal( el );
			expect( range.start.offset ).to.equal( 4 );
			expect( range.start.isEqual( range.end ) ).to.be.true;
		} );

		it( 'should collapse selection at node and offset', () => {
			const foo = new Text( 'foo' );
			const p = new Element( 'p', null, foo );

			selection.collapse( foo );
			let range = selection.getFirstRange();

			expect( range.start.parent ).to.equal( foo );
			expect( range.start.offset ).to.equal( 0 );
			expect( range.start.isEqual( range.end ) ).to.be.true;

			selection.collapse( p, 1 );
			range = selection.getFirstRange();

			expect( range.start.parent ).to.equal( p );
			expect( range.start.offset ).to.equal( 1 );
			expect( range.start.isEqual( range.end ) ).to.be.true;
		} );

		it( 'should collapse selection at node and flag', () => {
			const foo = new Text( 'foo' );
			const p = new Element( 'p', null, foo );

			selection.collapse( foo, 'end' );
			let range = selection.getFirstRange();

			expect( range.start.parent ).to.equal( foo );
			expect( range.start.offset ).to.equal( 3 );
			expect( range.start.isEqual( range.end ) ).to.be.true;

			selection.collapse( foo, 'before' );
			range = selection.getFirstRange();

			expect( range.start.parent ).to.equal( p );
			expect( range.start.offset ).to.equal( 0 );
			expect( range.start.isEqual( range.end ) ).to.be.true;

			selection.collapse( foo, 'after' );
			range = selection.getFirstRange();

			expect( range.start.parent ).to.equal( p );
			expect( range.start.offset ).to.equal( 1 );
			expect( range.start.isEqual( range.end ) ).to.be.true;
		} );
	} );

	describe( 'collapseToStart', () => {
		it( 'should collapse to start position and fire change event', ( done ) => {
			selection.setRanges( [ range1, range2, range3 ] );
			selection.once( 'change', () => {
				expect( selection.rangeCount ).to.equal( 1 );
				expect( selection.isCollapsed ).to.be.true;
				expect( selection._ranges[ 0 ].start.isEqual( range2.start ) ).to.be.true;
				done();
			} );

			selection.collapseToStart();
		} );

		it( 'should do nothing if no ranges present', () => {
			const fireSpy = sinon.spy( selection, 'fire' );

			selection.collapseToStart();

			fireSpy.restore();
			expect( fireSpy.notCalled ).to.be.true;
		} );
	} );

	describe( 'collapseToEnd', () => {
		it( 'should collapse to end position and fire change event', ( done ) => {
			selection.setRanges( [ range1, range2, range3 ] );
			selection.once( 'change', () => {
				expect( selection.rangeCount ).to.equal( 1 );
				expect( selection.isCollapsed ).to.be.true;
				expect( selection._ranges[ 0 ].end.isEqual( range3.end ) ).to.be.true;
				done();
			} );

			selection.collapseToEnd();
		} );

		it( 'should do nothing if no ranges present', () => {
			const fireSpy = sinon.spy( selection, 'fire' );

			selection.collapseToEnd();

			fireSpy.restore();
			expect( fireSpy.notCalled ).to.be.true;
		} );
	} );

	describe( 'getEditableElement', () => {
		it( 'should return null if no ranges in selection', () => {
			expect( selection.editableElement ).to.be.null;
		} );

		it( 'should return null if selection is placed in container that is not EditableElement', () => {
			selection.addRange( range1 );

			expect( selection.editableElement ).to.be.null;
		} );

		it( 'should return EditableElement when selection is placed inside', () => {
			const viewDocument = new Document();
			const selection = viewDocument.selection;
			const root = viewDocument.createRoot( 'div' );
			const element = new Element( 'p' );
			root.appendChildren( element );

			selection.addRange( Range.createFromParentsAndOffsets( element, 0, element, 0 ) );

			expect( selection.editableElement ).to.equal( root );
		} );
	} );

	describe( 'createFromSelection', () => {
		it( 'should return a Selection instance with same ranges and direction as given selection', () => {
			selection.setRanges( [ range1, range2 ], true );

			const snapshot = Selection.createFromSelection( selection );

			expect( snapshot.isBackward ).to.equal( selection.isBackward );

			const selectionRanges = Array.from( selection.getRanges() );
			const snapshotRanges = Array.from( snapshot.getRanges() );

			expect( selectionRanges.length ).to.equal( snapshotRanges.length );

			for ( let i = 0; i < selectionRanges.length; i++ ) {
				expect( selectionRanges[ i ].isEqual( snapshotRanges[ i ] ) ).to.be.true;
			}
		} );
	} );
} );
