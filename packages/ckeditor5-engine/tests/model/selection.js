/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: model */

import Document from '/ckeditor5/engine/model/document.js';
import Element from '/ckeditor5/engine/model/element.js';
import Text from '/ckeditor5/engine/model/text.js';
import Range from '/ckeditor5/engine/model/range.js';
import Position from '/ckeditor5/engine/model/position.js';
import LiveRange from '/ckeditor5/engine/model/liverange.js';
import Selection from '/ckeditor5/engine/model/selection.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';
import testUtils from '/tests/core/_utils/utils.js';
import count from '/ckeditor5/utils/count.js';

testUtils.createSinonSandbox();

describe( 'Selection', () => {
	let doc, root, selection, liveRange, range, range1, range2, range3;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot();
		root.appendChildren( [
			new Element( 'p' ),
			new Element( 'p' ),
			new Element( 'p', [], new Text( 'foobar' ) ),
			new Element( 'p' ),
			new Element( 'p' ),
			new Element( 'p' ),
			new Element( 'p', [], new Text( 'foobar' ) )
		] );
		selection = new Selection();

		liveRange = new LiveRange( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) );
		range = new Range( new Position( root, [ 2 ] ), new Position( root, [ 2, 2 ] ) );

		range1 = new Range( new Position( root, [ 1 ] ), new Position( root, [ 4 ] ) );
		range2 = new Range( new Position( root, [ 4 ] ), new Position( root, [ 5 ] ) );
		range3 = new Range( new Position( root, [ 6 ] ), new Position( root, [ 7 ] ) );
	} );

	afterEach( () => {
		doc.destroy();
		liveRange.detach();
	} );

	describe( 'isCollapsed', () => {
		it( 'should return false for empty selection', () => {
			expect( selection.isCollapsed ).to.be.false;
		} );

		it( 'should return true when there is single collapsed ranges', () => {
			selection.addRange( new Range( new Position( root, [ 0 ] ), new Position( root, [ 0 ] ) ) );

			expect( selection.isCollapsed ).to.be.true;
		} );

		it( 'should return false when there are multiple ranges', () => {
			selection.addRange( new Range( new Position( root, [ 0 ] ), new Position( root, [ 0 ] ) ) );
			selection.addRange( new Range( new Position( root, [ 2 ] ), new Position( root, [ 2 ] ) ) );

			expect( selection.isCollapsed ).to.be.false;
		} );

		it( 'should return false when there is not collapsed range', () => {
			selection.addRange( range );

			expect( selection.isCollapsed ).to.be.false;
		} );
	} );

	describe( 'rangeCount', () => {
		it( 'should return proper range count', () => {
			expect( selection.rangeCount ).to.equal( 0 );

			selection.addRange( new Range( new Position( root, [ 0 ] ), new Position( root, [ 0 ] ) ) );

			expect( selection.rangeCount ).to.equal( 1 );

			selection.addRange( new Range( new Position( root, [ 2 ] ), new Position( root, [ 2 ] ) ) );

			expect( selection.rangeCount ).to.equal( 2 );
		} );
	} );

	describe( 'isBackward', () => {
		it( 'is defined by the last added range', () => {
			selection.addRange( range, true );
			expect( selection ).to.have.property( 'isBackward', true );

			selection.addRange( liveRange );
			expect( selection ).to.have.property( 'isBackward', false );
		} );

		it( 'is false when last range is collapsed', () => {
			const pos = Position.createAt( root, 0 );

			selection.addRange( new Range( pos, pos ), true );

			expect( selection.isBackward ).to.be.false;
		} );
	} );

	describe( 'addRange', () => {
		it( 'should throw an error when range is invalid', () => {
			expect( () => {
				selection.addRange( { invalid: 'Range' } );
			} ).to.throw( CKEditorError, /selection-added-not-range/ );
		} );

		it( 'should copy added ranges and store multiple ranges', () => {
			selection.addRange( liveRange );
			selection.addRange( range );

			const ranges = selection._ranges;

			expect( ranges.length ).to.equal( 2 );
			expect( ranges[ 0 ].isEqual( liveRange ) ).to.be.true;
			expect( ranges[ 1 ].isEqual( range ) ).to.be.true;
			expect( ranges[ 0 ] ).not.to.be.equal( liveRange );
			expect( ranges[ 1 ] ).not.to.be.equal( range );
		} );

		it( 'should set anchor and focus to the start and end of the most recently added range', () => {
			selection.addRange( liveRange );

			expect( selection.anchor.path ).to.deep.equal( [ 0 ] );
			expect( selection.focus.path ).to.deep.equal( [ 1 ] );

			selection.addRange( range );

			expect( selection.anchor.path ).to.deep.equal( [ 2 ] );
			expect( selection.focus.path ).to.deep.equal( [ 2, 2 ] );
		} );

		it( 'should set anchor and focus to the end and start of the most recently added range if backward flag was used', () => {
			selection.addRange( liveRange, true );

			expect( selection.anchor.path ).to.deep.equal( [ 1 ] );
			expect( selection.focus.path ).to.deep.equal( [ 0 ] );

			selection.addRange( range, true );

			expect( selection.anchor.path ).to.deep.equal( [ 2, 2 ] );
			expect( selection.focus.path ).to.deep.equal( [ 2 ] );
		} );

		it( 'should return a copy of (not a reference to) array of stored ranges', () => {
			selection.addRange( liveRange );

			const ranges = Array.from( selection.getRanges() );

			selection.addRange( range );

			expect( ranges.length ).to.equal( 1 );
			expect( ranges[ 0 ].isEqual( liveRange ) ).to.be.true;
		} );

		it( 'should fire change:range event when adding a range', () => {
			let spy = sinon.spy();
			selection.on( 'change:range', spy );

			selection.addRange( range );

			expect( spy.called ).to.be.true;
		} );

		it( 'should throw an error if added range intersects with already stored range', () => {
			selection.addRange( liveRange );

			expect( () => {
				selection.addRange(
					new Range(
						new Position( root, [ 0, 4 ] ),
						new Position( root, [ 1, 2 ] )
					)
				);
			} ).to.throw( CKEditorError, /selection-range-intersects/ );
		} );
	} );

	describe( 'collapse', () => {
		it( 'fires change:range', () => {
			const spy = sinon.spy();

			selection.on( 'change:range', spy );

			selection.collapse( root );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'sets selection at the 0 offset if second parameter not passed', () => {
			selection.collapse( root );

			expect( selection ).to.have.property( 'isCollapsed', true );

			const focus = selection.focus;
			expect( focus ).to.have.property( 'parent', root );
			expect( focus ).to.have.property( 'offset', 0 );
		} );

		it( 'sets selection at given offset in given parent', () => {
			selection.collapse( root, 3 );

			expect( selection ).to.have.property( 'isCollapsed', true );

			const focus = selection.focus;
			expect( focus ).to.have.property( 'parent', root );
			expect( focus ).to.have.property( 'offset', 3 );
		} );

		it( 'sets selection at the end of the given parent', () => {
			selection.collapse( root, 'end' );

			expect( selection ).to.have.property( 'isCollapsed', true );

			const focus = selection.focus;
			expect( focus ).to.have.property( 'parent', root );
			expect( focus ).to.have.property( 'offset', root.maxOffset );
		} );

		it( 'sets selection before the specified element', () => {
			selection.collapse( root.getChild( 1 ), 'before' );

			expect( selection ).to.have.property( 'isCollapsed', true );

			const focus = selection.focus;
			expect( focus ).to.have.property( 'parent', root );
			expect( focus ).to.have.property( 'offset', 1 );
		} );

		it( 'sets selection after the specified element', () => {
			selection.collapse( root.getChild( 1 ), 'after' );

			expect( selection ).to.have.property( 'isCollapsed', true );

			const focus = selection.focus;
			expect( focus ).to.have.property( 'parent', root );
			expect( focus ).to.have.property( 'offset', 2 );
		} );

		it( 'sets selection at the specified position', () => {
			const pos = Position.createFromParentAndOffset( root, 3 );

			selection.collapse( pos );

			expect( selection ).to.have.property( 'isCollapsed', true );

			const focus = selection.focus;
			expect( focus ).to.have.property( 'parent', root );
			expect( focus ).to.have.property( 'offset', 3 );
		} );
	} );

	describe( 'focus', () => {
		let r3;
		beforeEach( () => {
			const r1 = Range.createFromParentsAndOffsets( root, 2, root, 4 );
			const r2 = Range.createFromParentsAndOffsets( root, 4, root, 6 );
			r3 = Range.createFromParentsAndOffsets( root, 1, root, 2 );
			selection.addRange( r1 );
			selection.addRange( r2 );
		} );

		it( 'should return correct focus when last added range is not backward one', () => {
			selection.addRange( r3 );

			expect( selection.focus.isEqual( r3.end ) ).to.be.true;
		} );

		it( 'should return correct focus when last added range is backward one', () => {
			selection.addRange( r3, true );

			expect( selection.focus.isEqual( r3.start ) ).to.be.true;
		} );

		it( 'should return null if no ranges in selection', () => {
			selection.removeAllRanges();
			expect( selection.focus ).to.be.null;
		} );
	} );

	describe( 'setFocus', () => {
		it( 'keeps all existing ranges and fires no change:range when no modifications needed', () => {
			selection.addRange( range );
			selection.addRange( liveRange );

			const spy = sinon.spy();
			selection.on( 'change:range', spy );

			selection.setFocus( selection.focus );

			expect( count( selection.getRanges() ) ).to.equal( 2 );
			expect( spy.callCount ).to.equal( 0 );
		} );

		it( 'fires change:range', () => {
			selection.addRange( range );

			const spy = sinon.spy();
			selection.on( 'change:range', spy );

			selection.setFocus( Position.createAt( root, 'end' ) );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'throws if there are no ranges in selection', () => {
			const endPos = Position.createAt( root, 'end' );

			expect( () => {
				selection.setFocus( endPos );
			} ).to.throw( CKEditorError, /selection-setFocus-no-ranges/ );
		} );

		it( 'modifies existing collapsed selection', () => {
			const startPos = Position.createAt( root, 1 );
			const endPos = Position.createAt( root, 2 );

			selection.collapse( startPos );

			selection.setFocus( endPos );

			expect( selection.anchor.compareWith( startPos ) ).to.equal( 'same' );
			expect( selection.focus.compareWith( endPos ) ).to.equal( 'same' );
		} );

		it( 'makes existing collapsed selection a backward selection', () => {
			const startPos = Position.createAt( root, 1 );
			const endPos = Position.createAt( root, 0 );

			selection.collapse( startPos );

			selection.setFocus( endPos );

			expect( selection.anchor.compareWith( startPos ) ).to.equal( 'same' );
			expect( selection.focus.compareWith( endPos ) ).to.equal( 'same' );
			expect( selection.isBackward ).to.be.true;
		} );

		it( 'modifies existing non-collapsed selection', () => {
			const startPos = Position.createAt( root, 1 );
			const endPos = Position.createAt( root, 2 );
			const newEndPos = Position.createAt( root, 3 );

			selection.addRange( new Range( startPos, endPos ) );

			selection.setFocus( newEndPos );

			expect( selection.anchor.compareWith( startPos ) ).to.equal( 'same' );
			expect( selection.focus.compareWith( newEndPos ) ).to.equal( 'same' );
		} );

		it( 'makes existing non-collapsed selection a backward selection', () => {
			const startPos = Position.createAt( root, 1 );
			const endPos = Position.createAt( root, 2 );
			const newEndPos = Position.createAt( root, 0 );

			selection.addRange( new Range( startPos, endPos ) );

			selection.setFocus( newEndPos );

			expect( selection.anchor.compareWith( startPos ) ).to.equal( 'same' );
			expect( selection.focus.compareWith( newEndPos ) ).to.equal( 'same' );
			expect( selection.isBackward ).to.be.true;
		} );

		it( 'makes existing backward selection a forward selection', () => {
			const startPos = Position.createAt( root, 1 );
			const endPos = Position.createAt( root, 2 );
			const newEndPos = Position.createAt( root, 3 );

			selection.addRange( new Range( startPos, endPos ), true );

			selection.setFocus( newEndPos );

			expect( selection.anchor.compareWith( endPos ) ).to.equal( 'same' );
			expect( selection.focus.compareWith( newEndPos ) ).to.equal( 'same' );
			expect( selection.isBackward ).to.be.false;
		} );

		it( 'modifies existing backward selection', () => {
			const startPos = Position.createAt( root, 1 );
			const endPos = Position.createAt( root, 2 );
			const newEndPos = Position.createAt( root, 0 );

			selection.addRange( new Range( startPos, endPos ), true );

			selection.setFocus( newEndPos );

			expect( selection.anchor.compareWith( endPos ) ).to.equal( 'same' );
			expect( selection.focus.compareWith( newEndPos ) ).to.equal( 'same' );
			expect( selection.isBackward ).to.be.true;
		} );

		it( 'modifies only the last range', () => {
			// Offsets are chosen in this way that the order of adding ranges must count, not their document order.
			const startPos1 = Position.createAt( root, 4 );
			const endPos1 = Position.createAt( root, 5 );
			const startPos2 = Position.createAt( root, 1 );
			const endPos2 = Position.createAt( root, 2 );

			const newEndPos = Position.createAt( root, 0 );

			selection.addRange( new Range( startPos1, endPos1 ) );
			selection.addRange( new Range( startPos2, endPos2 ) );

			const spy = sinon.spy();

			selection.on( 'change:range', spy );

			selection.setFocus( newEndPos );

			const ranges = Array.from( selection.getRanges() );

			expect( ranges ).to.have.lengthOf( 2 );
			expect( ranges[ 0 ].start.compareWith( startPos1 ) ).to.equal( 'same' );
			expect( ranges[ 0 ].end.compareWith( endPos1 ) ).to.equal( 'same' );

			expect( selection.anchor.compareWith( startPos2 ) ).to.equal( 'same' );
			expect( selection.focus.compareWith( newEndPos ) ).to.equal( 'same' );
			expect( selection.isBackward ).to.be.true;

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'collapses the selection when extending to the anchor', () => {
			const startPos = Position.createAt( root, 1 );
			const endPos = Position.createAt( root, 2 );

			selection.addRange( new Range( startPos, endPos ) );

			selection.setFocus( startPos );

			expect( selection.focus.compareWith( startPos ) ).to.equal( 'same' );
			expect( selection.isCollapsed ).to.be.true;
		} );

		it( 'uses Position.createAt', () => {
			const startPos = Position.createAt( root, 1 );
			const endPos = Position.createAt( root, 2 );
			const newEndPos = Position.createAt( root, 4 );
			const spy = testUtils.sinon.stub( Position, 'createAt', () => newEndPos );

			selection.addRange( new Range( startPos, endPos ) );

			selection.setFocus( root, 'end' );

			expect( spy.calledOnce ).to.be.true;
			expect( selection.focus.compareWith( newEndPos ) ).to.equal( 'same' );
		} );
	} );

	describe( 'removeAllRanges', () => {
		let spy, ranges;

		beforeEach( () => {
			selection.addRange( liveRange );
			selection.addRange( range );

			spy = sinon.spy();
			selection.on( 'change:range', spy );

			ranges = selection._ranges;

			selection.removeAllRanges();
		} );

		it( 'should remove all stored ranges', () => {
			expect( Array.from( selection.getRanges() ).length ).to.equal( 0 );
		} );

		it( 'should fire exactly one update event', () => {
			expect( spy.calledOnce ).to.be.true;
		} );
	} );

	describe( 'setRanges', () => {
		let newRanges, spy, oldRanges;

		before( () => {
			newRanges = [
				new Range( new Position( root, [ 4 ] ), new Position( root, [ 5 ] ) ),
				new Range( new Position( root, [ 5, 0 ] ), new Position( root, [ 6, 0 ] ) )
			];
		} );

		beforeEach( () => {
			selection.addRange( liveRange );
			selection.addRange( range );

			spy = sinon.spy();
			selection.on( 'change:range', spy );

			oldRanges = selection._ranges;
		} );

		it( 'should throw an error when range is invalid', () => {
			expect( () => {
				selection.setRanges( [ { invalid: 'range' } ] );
			} ).to.throw( CKEditorError, /selection-added-not-range/ );
		} );

		it( 'should remove all ranges and add given ranges', () => {
			selection.setRanges( newRanges );

			let ranges = selection._ranges;

			expect( ranges.length ).to.equal( 2 );
			expect( ranges[ 0 ].isEqual( newRanges[ 0 ] ) ).to.be.true;
			expect( ranges[ 1 ].isEqual( newRanges[ 1 ] ) ).to.be.true;
		} );

		it( 'should use last range from given array to get anchor and focus position', () => {
			selection.setRanges( newRanges );
			expect( selection.anchor.path ).to.deep.equal( [ 5, 0 ] );
			expect( selection.focus.path ).to.deep.equal( [ 6, 0 ] );
		} );

		it( 'should acknowledge backward flag when setting anchor and focus', () => {
			selection.setRanges( newRanges, true );
			expect( selection.anchor.path ).to.deep.equal( [ 6, 0 ] );
			expect( selection.focus.path ).to.deep.equal( [ 5, 0 ] );
		} );

		it( 'should fire exactly one update event', () => {
			selection.setRanges( newRanges );
			expect( spy.calledOnce ).to.be.true;
		} );
	} );

	describe( 'setTo', () => {
		it( 'should set selection to be same as given selection, using setRanges method', () => {
			sinon.spy( selection, 'setRanges' );

			const otherSelection = new Selection();
			otherSelection.addRange( range1 );
			otherSelection.addRange( range2, true );

			selection.setTo( otherSelection );

			expect( Array.from( selection.getRanges() ) ).to.deep.equal( [ range1, range2 ] );
			expect( selection.isBackward ).to.be.true;
			expect( selection.setRanges.calledOnce ).to.be.true;
		} );
	} );

	describe( 'getFirstRange', () => {
		it( 'should return null if no ranges were added', () => {
			expect( selection.getFirstRange() ).to.be.null;
		} );

		it( 'should return a range which start position is before all other ranges\' start positions', () => {
			// This will not be the first range despite being added as first
			selection.addRange( range2 );

			// This should be the first range.
			selection.addRange( range1 );

			// A random range that is not first.
			selection.addRange( range3 );

			let range = selection.getFirstRange();

			expect( range.start.path ).to.deep.equal( [ 1 ] );
			expect( range.end.path ).to.deep.equal( [ 4 ] );
		} );
	} );

	describe( 'getFirstPosition', () => {
		it( 'should return null if no ranges were added', () => {
			expect( selection.getFirstPosition() ).to.be.null;
		} );

		it( 'should return a position that is in selection and is before any other position from the selection', () => {
			// This will not be the first range despite being added as first
			selection.addRange( range2 );

			// This should be the first range.
			selection.addRange( range1 );

			// A random range that is not first.
			selection.addRange( range3 );

			let position = selection.getFirstPosition();

			expect( position.path ).to.deep.equal( [ 1 ] );
		} );
	} );

	describe( 'getLastRange', () => {
		it( 'should return null if no ranges were added', () => {
			expect( selection.getLastRange() ).to.be.null;
		} );

		it( 'should return a range which start position is before all other ranges\' start positions', () => {
			selection.addRange( range3 );
			selection.addRange( range1 );
			selection.addRange( range2 );

			let range = selection.getLastRange();

			expect( range.start.path ).to.deep.equal( [ 6 ] );
			expect( range.end.path ).to.deep.equal( [ 7 ] );
		} );
	} );

	describe( 'getLastPosition', () => {
		it( 'should return null if no ranges were added', () => {
			expect( selection.getLastPosition() ).to.be.null;
		} );

		it( 'should return a position that is in selection and is before any other position from the selection', () => {
			selection.addRange( range3 );
			selection.addRange( range1 );
			selection.addRange( range2 );

			let position = selection.getLastPosition();

			expect( position.path ).to.deep.equal( [ 7 ] );
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

	describe( 'collapseToStart', () => {
		it( 'should collapse to start position and fire change event', () => {
			selection.setRanges( [ range2, range1, range3 ] );
			selection.collapseToStart();

			expect( selection.rangeCount ).to.equal( 1 );
			expect( selection.isCollapsed ).to.be.true;
			expect( selection.getFirstPosition().isEqual( range1.start ) ).to.be.true;
		} );

		it( 'should do nothing if no ranges present', () => {
			const spy = sinon.spy( selection, 'fire' );

			selection.collapseToStart();

			spy.restore();
			expect( spy.notCalled ).to.be.true;
		} );
	} );

	describe( 'collapseToEnd', () => {
		it( 'should collapse to start position and fire change event', () => {
			selection.setRanges( [ range2, range3, range1 ] );
			selection.collapseToEnd();

			expect( selection.rangeCount ).to.equal( 1 );
			expect( selection.isCollapsed ).to.be.true;
			expect( selection.getLastPosition().isEqual( range3.end ) ).to.be.true;
		} );

		it( 'should do nothing if no ranges present', () => {
			const spy = sinon.spy( selection, 'fire' );

			selection.collapseToEnd();

			spy.restore();
			expect( spy.notCalled ).to.be.true;
		} );
	} );

	describe( 'createFromSelection', () => {
		it( 'should return a Selection instance with same ranges and direction as given selection', () => {
			selection.addRange( liveRange );
			selection.addRange( range, true );

			const snapshot = Selection.createFromSelection( selection );

			expect( selection.isBackward ).to.equal( snapshot.isBackward );

			const selectionRanges = Array.from( selection.getRanges() );
			const snapshotRanges = Array.from( snapshot.getRanges() );

			expect( selectionRanges.length ).to.equal( snapshotRanges.length );

			for ( let i = 0; i < selectionRanges.length; i++ ) {
				expect( selectionRanges[ i ].isEqual( snapshotRanges[ i ] ) ).to.be.true;
			}
		} );
	} );

	describe( 'attributes interface', () => {
		let rangeInFullP;

		beforeEach( () => {
			root.insertChildren( 0, [
				new Element( 'p', [], new Text( 'foobar' ) ),
				new Element( 'p', [], [] )
			] );

			rangeInFullP = new Range( new Position( root, [ 0, 4 ] ), new Position( root, [ 0, 4 ] ) );
		} );

		describe( 'setAttribute', () => {
			it( 'should set given attribute on the selection', () => {
				selection.setRanges( [ rangeInFullP ] );
				selection.setAttribute( 'foo', 'bar' );

				expect( selection.getAttribute( 'foo' ) ).to.equal( 'bar' );
			} );

			it( 'should fire change:attribute event', () => {
				let spy = sinon.spy();
				selection.on( 'change:attribute', spy );

				selection.setAttribute( 'foo', 'bar' );

				expect( spy.called ).to.be.true;
			} );
		} );

		describe( 'getAttribute', () => {
			it( 'should return undefined if element does not contain given attribute', () => {
				expect( selection.getAttribute( 'abc' ) ).to.be.undefined;
			} );
		} );

		describe( 'getAttributes', () => {
			it( 'should return an iterator that iterates over all attributes set on selection', () => {
				selection.setRanges( [ rangeInFullP ] );
				selection.setAttribute( 'foo', 'bar' );
				selection.setAttribute( 'abc', 'xyz' );

				let attrs = Array.from( selection.getAttributes() );

				expect( attrs ).to.deep.equal( [ [ 'foo', 'bar' ], [ 'abc', 'xyz' ] ] );
			} );
		} );

		describe( 'getAttributeKeys', () => {
			it( 'should return iterator that iterates over all attribute keys set on selection', () => {
				selection.setRanges( [ rangeInFullP ] );
				selection.setAttribute( 'foo', 'bar' );
				selection.setAttribute( 'abc', 'xyz' );

				let attrs = Array.from( selection.getAttributeKeys() );

				expect( attrs ).to.deep.equal( [ 'foo', 'abc' ] );
			} );
		} );

		describe( 'hasAttribute', () => {
			it( 'should return true if element contains attribute with given key', () => {
				selection.setRanges( [ rangeInFullP ] );
				selection.setAttribute( 'foo', 'bar' );

				expect( selection.hasAttribute( 'foo' ) ).to.be.true;
			} );

			it( 'should return false if element does not contain attribute with given key', () => {
				expect( selection.hasAttribute( 'abc' ) ).to.be.false;
			} );
		} );

		describe( 'clearAttributes', () => {
			it( 'should remove all attributes from the element', () => {
				selection.setRanges( [ rangeInFullP ] );
				selection.setAttribute( 'foo', 'bar' );
				selection.setAttribute( 'abc', 'xyz' );

				selection.clearAttributes();

				expect( selection.getAttribute( 'foo' ) ).to.be.undefined;
				expect( selection.getAttribute( 'abc' ) ).to.be.undefined;
			} );

			it( 'should fire change:attribute event', () => {
				let spy = sinon.spy();
				selection.on( 'change:attribute', spy );

				selection.clearAttributes();

				expect( spy.called ).to.be.true;
			} );
		} );

		describe( 'removeAttribute', () => {
			it( 'should remove attribute', () => {
				selection.setRanges( [ rangeInFullP ] );
				selection.setAttribute( 'foo', 'bar' );
				selection.removeAttribute( 'foo' );

				expect( selection.getAttribute( 'foo' ) ).to.be.undefined;
			} );

			it( 'should fire change:attribute event', () => {
				let spy = sinon.spy();
				selection.on( 'change:attribute', spy );

				selection.removeAttribute( 'foo' );

				expect( spy.called ).to.be.true;
			} );
		} );

		describe( 'setAttributesTo', () => {
			it( 'should remove all attributes set on element and set the given ones', () => {
				selection.setRanges( [ rangeInFullP ] );
				selection.setAttribute( 'abc', 'xyz' );
				selection.setAttributesTo( { foo: 'bar' } );

				expect( selection.getAttribute( 'foo' ) ).to.equal( 'bar' );
				expect( selection.getAttribute( 'abc' ) ).to.be.undefined;
			} );
		} );
	} );
} );
