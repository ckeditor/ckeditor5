/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Document from '../../src/model/document';
import Element from '../../src/model/element';
import Text from '../../src/model/text';
import Range from '../../src/model/range';
import Position from '../../src/model/position';
import LiveRange from '../../src/model/liverange';
import Selection from '../../src/model/selection';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import count from '@ckeditor/ckeditor5-utils/src/count';
import { parse, setData } from '../../src/dev-utils/model';
import Schema from '../../src/model/schema';

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

	describe( 'constructor()', () => {
		it( 'should be able to create an empty selection', () => {
			const selection = new Selection();

			expect( Array.from( selection.getRanges() ) ).to.deep.equal( [] );
		} );

		it( 'should be able to create a selection from the given ranges', () => {
			const ranges = [ range1, range2, range3 ];
			const selection = new Selection( ranges );

			expect( Array.from( selection.getRanges() ) ).to.deep.equal( ranges );
		} );

		it( 'should be able to create a selection from the given ranges and isLastBackward flag', () => {
			const ranges = [ range1, range2, range3 ];
			const selection = new Selection( ranges, true );

			expect( selection.isBackward ).to.be.true;
		} );
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

	describe( 'addRange()', () => {
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
			const spy = sinon.spy();
			selection.on( 'change:range', spy );

			selection.addRange( range );

			expect( spy.called ).to.be.true;
		} );

		it( 'should throw an error when range is invalid', () => {
			expect( () => {
				selection.addRange( { invalid: 'range' } );
			} ).to.throw( CKEditorError, /model-selection-added-not-range/ );
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
			} ).to.throw( CKEditorError, /model-selection-range-intersects/ );
		} );
	} );

	describe( 'setIn()', () => {
		it( 'should set selection inside an element', () => {
			const element = new Element( 'p', null, [ new Text( 'foo' ), new Text( 'bar' ) ] );

			selection.setIn( element );

			const ranges = Array.from( selection.getRanges() );
			expect( ranges.length ).to.equal( 1 );
			expect( ranges[ 0 ].start.parent ).to.equal( element );
			expect( ranges[ 0 ].start.offset ).to.deep.equal( 0 );
			expect( ranges[ 0 ].end.parent ).to.equal( element );
			expect( ranges[ 0 ].end.offset ).to.deep.equal( 6 );
		} );
	} );

	describe( 'setOn()', () => {
		it( 'should set selection on an item', () => {
			const textNode1 = new Text( 'foo' );
			const textNode2 = new Text( 'bar' );
			const textNode3 = new Text( 'baz' );
			const element = new Element( 'p', null, [ textNode1, textNode2, textNode3 ] );

			selection.setOn( textNode2 );

			const ranges = Array.from( selection.getRanges() );
			expect( ranges.length ).to.equal( 1 );
			expect( ranges[ 0 ].start.parent ).to.equal( element );
			expect( ranges[ 0 ].start.offset ).to.deep.equal( 3 );
			expect( ranges[ 0 ].end.parent ).to.equal( element );
			expect( ranges[ 0 ].end.offset ).to.deep.equal( 6 );
		} );
	} );

	describe( 'setCollapsedAt()', () => {
		it( 'fires change:range', () => {
			const spy = sinon.spy();

			selection.on( 'change:range', spy );

			selection.setCollapsedAt( root );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'sets selection at the 0 offset if second parameter not passed', () => {
			selection.setCollapsedAt( root );

			expect( selection ).to.have.property( 'isCollapsed', true );

			const focus = selection.focus;
			expect( focus ).to.have.property( 'parent', root );
			expect( focus ).to.have.property( 'offset', 0 );
		} );

		it( 'sets selection at given offset in given parent', () => {
			selection.setCollapsedAt( root, 3 );

			expect( selection ).to.have.property( 'isCollapsed', true );

			const focus = selection.focus;
			expect( focus ).to.have.property( 'parent', root );
			expect( focus ).to.have.property( 'offset', 3 );
		} );

		it( 'sets selection at the end of the given parent', () => {
			selection.setCollapsedAt( root, 'end' );

			expect( selection ).to.have.property( 'isCollapsed', true );

			const focus = selection.focus;
			expect( focus ).to.have.property( 'parent', root );
			expect( focus ).to.have.property( 'offset', root.maxOffset );
		} );

		it( 'sets selection before the specified element', () => {
			selection.setCollapsedAt( root.getChild( 1 ), 'before' );

			expect( selection ).to.have.property( 'isCollapsed', true );

			const focus = selection.focus;
			expect( focus ).to.have.property( 'parent', root );
			expect( focus ).to.have.property( 'offset', 1 );
		} );

		it( 'sets selection after the specified element', () => {
			selection.setCollapsedAt( root.getChild( 1 ), 'after' );

			expect( selection ).to.have.property( 'isCollapsed', true );

			const focus = selection.focus;
			expect( focus ).to.have.property( 'parent', root );
			expect( focus ).to.have.property( 'offset', 2 );
		} );

		it( 'sets selection at the specified position', () => {
			const pos = Position.createFromParentAndOffset( root, 3 );

			selection.setCollapsedAt( pos );

			expect( selection ).to.have.property( 'isCollapsed', true );

			const focus = selection.focus;
			expect( focus ).to.have.property( 'parent', root );
			expect( focus ).to.have.property( 'offset', 3 );
		} );
	} );

	describe( 'moveFocusTo()', () => {
		it( 'keeps all existing ranges and fires no change:range when no modifications needed', () => {
			selection.addRange( range );
			selection.addRange( liveRange );

			const spy = sinon.spy();
			selection.on( 'change:range', spy );

			selection.moveFocusTo( selection.focus );

			expect( count( selection.getRanges() ) ).to.equal( 2 );
			expect( spy.callCount ).to.equal( 0 );
		} );

		it( 'fires change:range', () => {
			selection.addRange( range );

			const spy = sinon.spy();
			selection.on( 'change:range', spy );

			selection.moveFocusTo( Position.createAt( root, 'end' ) );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'throws if there are no ranges in selection', () => {
			const endPos = Position.createAt( root, 'end' );

			expect( () => {
				selection.moveFocusTo( endPos );
			} ).to.throw( CKEditorError, /model-selection-moveFocusTo-no-ranges/ );
		} );

		it( 'modifies existing collapsed selection', () => {
			const startPos = Position.createAt( root, 1 );
			const endPos = Position.createAt( root, 2 );

			selection.setCollapsedAt( startPos );

			selection.moveFocusTo( endPos );

			expect( selection.anchor.compareWith( startPos ) ).to.equal( 'same' );
			expect( selection.focus.compareWith( endPos ) ).to.equal( 'same' );
		} );

		it( 'makes existing collapsed selection a backward selection', () => {
			const startPos = Position.createAt( root, 1 );
			const endPos = Position.createAt( root, 0 );

			selection.setCollapsedAt( startPos );

			selection.moveFocusTo( endPos );

			expect( selection.anchor.compareWith( startPos ) ).to.equal( 'same' );
			expect( selection.focus.compareWith( endPos ) ).to.equal( 'same' );
			expect( selection.isBackward ).to.be.true;
		} );

		it( 'modifies existing non-collapsed selection', () => {
			const startPos = Position.createAt( root, 1 );
			const endPos = Position.createAt( root, 2 );
			const newEndPos = Position.createAt( root, 3 );

			selection.addRange( new Range( startPos, endPos ) );

			selection.moveFocusTo( newEndPos );

			expect( selection.anchor.compareWith( startPos ) ).to.equal( 'same' );
			expect( selection.focus.compareWith( newEndPos ) ).to.equal( 'same' );
		} );

		it( 'makes existing non-collapsed selection a backward selection', () => {
			const startPos = Position.createAt( root, 1 );
			const endPos = Position.createAt( root, 2 );
			const newEndPos = Position.createAt( root, 0 );

			selection.addRange( new Range( startPos, endPos ) );

			selection.moveFocusTo( newEndPos );

			expect( selection.anchor.compareWith( startPos ) ).to.equal( 'same' );
			expect( selection.focus.compareWith( newEndPos ) ).to.equal( 'same' );
			expect( selection.isBackward ).to.be.true;
		} );

		it( 'makes existing backward selection a forward selection', () => {
			const startPos = Position.createAt( root, 1 );
			const endPos = Position.createAt( root, 2 );
			const newEndPos = Position.createAt( root, 3 );

			selection.addRange( new Range( startPos, endPos ), true );

			selection.moveFocusTo( newEndPos );

			expect( selection.anchor.compareWith( endPos ) ).to.equal( 'same' );
			expect( selection.focus.compareWith( newEndPos ) ).to.equal( 'same' );
			expect( selection.isBackward ).to.be.false;
		} );

		it( 'modifies existing backward selection', () => {
			const startPos = Position.createAt( root, 1 );
			const endPos = Position.createAt( root, 2 );
			const newEndPos = Position.createAt( root, 0 );

			selection.addRange( new Range( startPos, endPos ), true );

			selection.moveFocusTo( newEndPos );

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

			selection.moveFocusTo( newEndPos );

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

			selection.moveFocusTo( startPos );

			expect( selection.focus.compareWith( startPos ) ).to.equal( 'same' );
			expect( selection.isCollapsed ).to.be.true;
		} );

		it( 'uses Position.createAt', () => {
			const startPos = Position.createAt( root, 1 );
			const endPos = Position.createAt( root, 2 );
			const newEndPos = Position.createAt( root, 4 );
			const spy = testUtils.sinon.stub( Position, 'createAt' ).returns( newEndPos );

			selection.addRange( new Range( startPos, endPos ) );

			selection.moveFocusTo( root, 'end' );

			expect( spy.calledOnce ).to.be.true;
			expect( selection.focus.compareWith( newEndPos ) ).to.equal( 'same' );
		} );
	} );

	describe( 'removeAllRanges()', () => {
		let spy;

		it( 'should remove all stored ranges', () => {
			selection.addRange( liveRange );
			selection.addRange( range );

			selection.removeAllRanges();

			expect( Array.from( selection.getRanges() ).length ).to.equal( 0 );
		} );

		it( 'should fire exactly one change:range event', () => {
			selection.addRange( liveRange );
			selection.addRange( range );

			spy = sinon.spy();
			selection.on( 'change:range', spy );

			selection.removeAllRanges();

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should not fire change:range event if there were no ranges', () => {
			spy = sinon.spy();
			selection.on( 'change:range', spy );

			selection.removeAllRanges();

			expect( spy.called ).to.be.false;
		} );
	} );

	describe( 'setRanges()', () => {
		let newRanges, spy;

		beforeEach( () => {
			newRanges = [
				new Range( new Position( root, [ 4 ] ), new Position( root, [ 5 ] ) ),
				new Range( new Position( root, [ 5, 0 ] ), new Position( root, [ 6, 0 ] ) )
			];

			selection.addRange( liveRange );
			selection.addRange( range );

			spy = sinon.spy();
			selection.on( 'change:range', spy );
		} );

		it( 'should throw an error when range is invalid', () => {
			expect( () => {
				selection.setRanges( [ { invalid: 'range' } ] );
			} ).to.throw( CKEditorError, /model-selection-added-not-range/ );
		} );

		it( 'should remove all ranges and add given ranges', () => {
			selection.setRanges( newRanges );

			const ranges = Array.from( selection.getRanges() );
			expect( ranges ).to.deep.equal( newRanges );
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

		it( 'should fire exactly one change:range event', () => {
			selection.setRanges( newRanges );
			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should fire change:range event with correct parameters', () => {
			selection.on( 'change:range', ( evt, data ) => {
				expect( data.directChange ).to.be.true;
			} );

			selection.setRanges( newRanges );
		} );

		it( 'should not fire change:range event if given ranges are the same', () => {
			selection.setRanges( [ liveRange, range ] );
			expect( spy.calledOnce ).to.be.false;
		} );
	} );

	describe( 'setTo()', () => {
		it( 'should set selection to be same as given selection, using setRanges method', () => {
			const spy = sinon.spy( selection, 'setRanges' );

			const otherSelection = new Selection();
			otherSelection.addRange( range1 );
			otherSelection.addRange( range2, true );

			selection.setTo( otherSelection );

			expect( Array.from( selection.getRanges() ) ).to.deep.equal( [ range1, range2 ] );
			expect( selection.isBackward ).to.be.true;
			expect( selection.setRanges.calledOnce ).to.be.true;
			spy.restore();
		} );

		it( 'should set selection on the given Range using setRanges method', () => {
			const spy = sinon.spy( selection, 'setRanges' );

			selection.setTo( range1 );

			expect( Array.from( selection.getRanges() ) ).to.deep.equal( [ range1 ] );
			expect( selection.isBackward ).to.be.false;
			expect( selection.setRanges.calledOnce ).to.be.true;
			spy.restore();
		} );

		it( 'should set selection on the given iterable of Ranges using setRanges method', () => {
			const spy = sinon.spy( selection, 'setRanges' );

			selection.setTo( new Set( [ range1, range2 ] ) );

			expect( Array.from( selection.getRanges() ) ).to.deep.equal( [ range1, range2 ] );
			expect( selection.isBackward ).to.be.false;
			expect( selection.setRanges.calledOnce ).to.be.true;
			spy.restore();
		} );

		it( 'should set collapsed selection on the given Position using setRanges method', () => {
			const spy = sinon.spy( selection, 'setRanges' );
			const position = new Position( root, [ 4 ] );

			selection.setTo( position );

			expect( Array.from( selection.getRanges() ).length ).to.equal( 1 );
			expect( Array.from( selection.getRanges() )[ 0 ].start ).to.deep.equal( position );
			expect( selection.isBackward ).to.be.false;
			expect( selection.isCollapsed ).to.be.true;
			expect( selection.setRanges.calledOnce ).to.be.true;
			spy.restore();
		} );
	} );

	describe( 'getFirstRange()', () => {
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

			const range = selection.getFirstRange();

			expect( range.start.path ).to.deep.equal( [ 1 ] );
			expect( range.end.path ).to.deep.equal( [ 4 ] );
		} );
	} );

	describe( 'getFirstPosition()', () => {
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

			const position = selection.getFirstPosition();

			expect( position.path ).to.deep.equal( [ 1 ] );
		} );
	} );

	describe( 'getLastRange()', () => {
		it( 'should return null if no ranges were added', () => {
			expect( selection.getLastRange() ).to.be.null;
		} );

		it( 'should return a range which start position is before all other ranges\' start positions', () => {
			selection.addRange( range3 );
			selection.addRange( range1 );
			selection.addRange( range2 );

			const range = selection.getLastRange();

			expect( range.start.path ).to.deep.equal( [ 6 ] );
			expect( range.end.path ).to.deep.equal( [ 7 ] );
		} );
	} );

	describe( 'getLastPosition()', () => {
		it( 'should return null if no ranges were added', () => {
			expect( selection.getLastPosition() ).to.be.null;
		} );

		it( 'should return a position that is in selection and is before any other position from the selection', () => {
			selection.addRange( range3 );
			selection.addRange( range1 );
			selection.addRange( range2 );

			const position = selection.getLastPosition();

			expect( position.path ).to.deep.equal( [ 7 ] );
		} );
	} );

	describe( 'isEqual()', () => {
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

		it( 'should return true if both selections have no ranges', () => {
			const otherSelection = new Selection();

			expect( selection.isEqual( otherSelection ) ).to.be.true;
		} );

		it( 'should return false if ranges count does not equal', () => {
			selection.addRange( range1 );
			selection.addRange( range2 );

			const otherSelection = new Selection();
			otherSelection.addRange( range2 );

			expect( selection.isEqual( otherSelection ) ).to.be.false;
		} );

		it( 'should return false if ranges (other than the last added range) do not equal', () => {
			selection.addRange( range1 );
			selection.addRange( range3 );

			const otherSelection = new Selection();
			otherSelection.addRange( range2 );
			otherSelection.addRange( range3 );

			expect( selection.isEqual( otherSelection ) ).to.be.false;
		} );

		it( 'should return false if directions do not equal', () => {
			selection.addRange( range1 );

			const otherSelection = new Selection();
			otherSelection.addRange( range1, true );

			expect( selection.isEqual( otherSelection ) ).to.be.false;
		} );
	} );

	describe( 'collapseToStart()', () => {
		it( 'should collapse to start position and fire change event', () => {
			selection.setRanges( [ range2, range1, range3 ] );

			const spy = sinon.spy();
			selection.on( 'change:range', spy );

			selection.collapseToStart();

			expect( selection.rangeCount ).to.equal( 1 );
			expect( selection.isCollapsed ).to.be.true;
			expect( selection.getFirstPosition().isEqual( range1.start ) ).to.be.true;
			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should do nothing if selection was already collapsed', () => {
			selection.setCollapsedAt( range1.start );

			const spy = sinon.spy( selection, 'fire' );

			selection.collapseToStart();

			expect( spy.notCalled ).to.be.true;
			spy.restore();
		} );

		it( 'should do nothing if no ranges present', () => {
			const spy = sinon.spy( selection, 'fire' );

			selection.collapseToStart();

			spy.restore();
			expect( spy.notCalled ).to.be.true;
		} );
	} );

	describe( 'collapseToEnd()', () => {
		it( 'should collapse to start position and fire change:range event', () => {
			selection.setRanges( [ range2, range3, range1 ] );

			const spy = sinon.spy();
			selection.on( 'change:range', spy );

			selection.collapseToEnd();

			expect( selection.rangeCount ).to.equal( 1 );
			expect( selection.isCollapsed ).to.be.true;
			expect( selection.getLastPosition().isEqual( range3.end ) ).to.be.true;
			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should do nothing if selection was already collapsed', () => {
			selection.setCollapsedAt( range1.start );

			const spy = sinon.spy( selection, 'fire' );

			selection.collapseToEnd();

			expect( spy.notCalled ).to.be.true;
			spy.restore();
		} );

		it( 'should do nothing if selection has no ranges', () => {
			const spy = sinon.spy( selection, 'fire' );

			selection.collapseToEnd();

			expect( spy.notCalled ).to.be.true;
			spy.restore();
		} );
	} );

	describe( 'createFromSelection()', () => {
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

	describe( 'getSelectedElement()', () => {
		let schema;

		beforeEach( () => {
			schema = new Schema();
			schema.registerItem( 'p', '$block' );
		} );

		it( 'should return selected element', () => {
			const { selection, model } = parse( '<p>foo</p>[<p>bar</p>]<p>baz</p>', schema );
			const p = model.getChild( 1 );

			expect( selection.getSelectedElement() ).to.equal( p );
		} );

		it( 'should return null if there is more than one range', () => {
			const { selection } = parse( '[<p>foo</p>][<p>bar</p>]<p>baz</p>', schema );

			expect( selection.getSelectedElement() ).to.be.null;
		} );

		it( 'should return null if there is no selection', () => {
			expect( selection.getSelectedElement() ).to.be.null;
		} );

		it( 'should return null if selection is not over single element #1', () => {
			const { selection } = parse( '<p>foo</p>[<p>bar</p><p>baz}</p>', schema );

			expect( selection.getSelectedElement() ).to.be.null;
		} );

		it( 'should return null if selection is not over single element #2', () => {
			const { selection } = parse( '<p>{bar}</p>', schema );

			expect( selection.getSelectedElement() ).to.be.null;
		} );
	} );

	describe( 'getSelectedBlocks()', () => {
		beforeEach( () => {
			doc.schema.registerItem( 'p', '$block' );
			doc.schema.registerItem( 'h', '$block' );

			doc.schema.registerItem( 'blockquote' );
			doc.schema.allow( { name: 'blockquote', inside: '$root' } );
			doc.schema.allow( { name: '$block', inside: 'blockquote' } );

			doc.schema.registerItem( 'image' );
			doc.schema.allow( { name: 'image', inside: '$root' } );
			doc.schema.allow( { name: 'image', inside: '$block' } );
			doc.schema.allow( { name: '$text', inside: 'image' } );

			// Special block which can contain another blocks.
			doc.schema.registerItem( 'nestedBlock', '$block' );
			doc.schema.allow( { name: 'nestedBlock', inside: '$block' } );
		} );

		it( 'returns an iterator', () => {
			setData( doc, '<p>a</p><p>[]b</p><p>c</p>' );

			expect( doc.selection.getSelectedBlocks().next ).to.be.a( 'function' );
		} );

		it( 'returns block for a collapsed selection', () => {
			setData( doc, '<p>a</p><p>[]b</p><p>c</p>' );

			expect( toText( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'b' ] );
		} );

		it( 'returns block for a collapsed selection (empty block)', () => {
			setData( doc, '<p>a</p><p>[]</p><p>c</p>' );

			const blocks = Array.from( doc.selection.getSelectedBlocks() );

			expect( blocks ).to.have.length( 1 );
			expect( blocks[ 0 ].childCount ).to.equal( 0 );
		} );

		it( 'returns block for a non collapsed selection', () => {
			setData( doc, '<p>a</p><p>[b]</p><p>c</p>' );

			expect( toText( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'b' ] );
		} );

		it( 'returns two blocks for a non collapsed selection', () => {
			setData( doc, '<p>a</p><h>[b</h><p>c]</p><p>d</p>' );

			expect( toText( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'b', 'c' ] );
		} );

		it( 'returns two blocks for a non collapsed selection (starts at block end)', () => {
			setData( doc, '<p>a</p><h>b[</h><p>c]</p><p>d</p>' );

			expect( toText( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'b', 'c' ] );
		} );

		it( 'returns proper block for a multi-range selection', () => {
			setData( doc, '<p>a</p><h>[b</h><p>c]</p><p>d</p><p>[e]</p>' );

			expect( toText( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'b', 'c', 'e' ] );
		} );

		it( 'does not return a block twice if two ranges are anchored in it', () => {
			setData( doc, '<p>[a]b[c]</p>' );

			expect( toText( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'abc' ] );
		} );

		it( 'returns only blocks', () => {
			setData( doc, '<p>[a</p><image>b</image><p>c]</p>' );

			expect( toText( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'a', 'c' ] );
		} );

		it( 'gets deeper into the tree', () => {
			setData( doc, '<p>[a</p><blockquote><p>b</p><p>c</p></blockquote><p>d]</p>' );

			expect( toText( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'a', 'b', 'c', 'd' ] );
		} );

		it( 'gets deeper into the tree (end deeper)', () => {
			setData( doc, '<p>[a</p><blockquote><p>b]</p><p>c</p></blockquote><p>d</p>' );

			expect( toText( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'a', 'b' ] );
		} );

		it( 'gets deeper into the tree (start deeper)', () => {
			setData( doc, '<p>a</p><blockquote><p>b</p><p>[c</p></blockquote><p>d]</p>' );

			expect( toText( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'c', 'd' ] );
		} );

		it( 'returns an empty array if none of the selected elements is a block', () => {
			setData( doc, '<p>a</p><image>[a</image><image>b]</image><p>b</p>' );

			expect( toText( doc.selection.getSelectedBlocks() ) ).to.be.empty;
		} );

		it( 'returns an empty array if the selected element is not a block', () => {
			setData( doc, '<p>a</p><image>[]a</image><p>b</p>' );

			expect( toText( doc.selection.getSelectedBlocks() ) ).to.be.empty;
		} );

		// Super edge case – should not happen (blocks should never be nested),
		// but since the code handles it already it's worth testing.
		it( 'returns only the lowest block if blocks are nested', () => {
			setData( doc, '<nestedBlock>a<nestedBlock>[]b</nestedBlock></nestedBlock>' );

			expect( toText( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'b' ] );
		} );

		// Like above but trickier.
		it( 'returns only the lowest block if blocks are nested', () => {
			setData(
				doc,
				'<nestedBlock>a<nestedBlock>[b</nestedBlock></nestedBlock>' +
				'<nestedBlock>c<nestedBlock>d]</nestedBlock></nestedBlock>'
			);

			expect( toText( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'b', 'd' ] );
		} );

		it( 'returns nothing if directly in a root', () => {
			doc.createRoot( 'p', 'inlineOnlyRoot' );

			setData( doc, 'a[b]c', { rootName: 'inlineOnlyRoot' } );

			expect( toText( doc.selection.getSelectedBlocks() ) ).to.be.empty;
		} );

		describe( '#984', () => {
			it( 'does not return the last block if none of its content is selected', () => {
				setData( doc, '<p>[a</p><p>b</p><p>]c</p>' );

				expect( toText( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'a', 'b' ] );
			} );

			it( 'returns only the first block for a non collapsed selection if only end of selection is touching a block', () => {
				setData( doc, '<p>a</p><h>b[</h><p>]c</p><p>d</p>' );

				expect( toText( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'b' ] );
			} );

			it( 'does not return the last block if none of its content is selected (nested case)', () => {
				setData( doc, '<p>[a</p><nestedBlock><nestedBlock>]b</nestedBlock></nestedBlock>' );

				expect( toText( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'a' ] );
			} );

			// Like a super edge case, we can live with this behavior as I don't even know what we could expect here
			// since only the innermost block is considerd a block to return (so the <nB>b...</nB> needs to be ignored).
			it( 'does not return the last block if none of its content is selected (nested case, wrapper with a content)', () => {
				setData( doc, '<p>[a</p><nestedBlock>b<nestedBlock>]c</nestedBlock></nestedBlock>' );

				expect( toText( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'a' ] );
			} );

			it( 'returns the last block if at least one of its child nodes is selected', () => {
				setData( doc, '<p>[a</p><p>b</p><p><image></image>]c</p>' );

				expect( toText( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'a', 'b', 'c' ] );
			} );

			// I needed these last 2 cases to justify the use of isTouching() instead of simple `offset == 0` check.
			it( 'returns the last block if at least one of its child nodes is selected (end in an inline element)', () => {
				setData( doc, '<p>[a</p><p>b</p><p><image>x]</image>c</p>' );

				expect( toText( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'a', 'b', 'c' ] );
			} );

			it(
				'does not return the last block if at least one of its child nodes is selected ' +
				'(end in an inline element, no content selected)',
				() => {
					setData( doc, '<p>[a</p><p>b</p><p><image>]x</image>c</p>' );

					expect( toText( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'a', 'b' ] );
				}
			);
		} );

		// Map all elements to data of its first child text node.
		function toText( elements ) {
			return Array.from( elements ).map( el => {
				return Array.from( el.getChildren() ).find( child => child.data ).data;
			} );
		}
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

		describe( 'setAttribute()', () => {
			it( 'should set given attribute on the selection', () => {
				selection.setRanges( [ rangeInFullP ] );
				selection.setAttribute( 'foo', 'bar' );

				expect( selection.getAttribute( 'foo' ) ).to.equal( 'bar' );
			} );

			it( 'should fire change:attribute event with correct parameters', () => {
				selection.on( 'change:attribute', ( evt, data ) => {
					expect( data.directChange ).to.be.true;
					expect( data.attributeKeys ).to.deep.equal( [ 'foo' ] );
				} );

				selection.setAttribute( 'foo', 'bar' );
			} );

			it( 'should not fire change:attribute event if attribute with same key and value was already set', () => {
				selection.setAttribute( 'foo', 'bar' );

				const spy = sinon.spy();
				selection.on( 'change:attribute', spy );

				selection.setAttribute( 'foo', 'bar' );

				expect( spy.called ).to.be.false;
			} );
		} );

		describe( 'getAttribute()', () => {
			it( 'should return undefined if element does not contain given attribute', () => {
				expect( selection.getAttribute( 'abc' ) ).to.be.undefined;
			} );
		} );

		describe( 'getAttributes()', () => {
			it( 'should return an iterator that iterates over all attributes set on selection', () => {
				selection.setRanges( [ rangeInFullP ] );
				selection.setAttribute( 'foo', 'bar' );
				selection.setAttribute( 'abc', 'xyz' );

				const attrs = Array.from( selection.getAttributes() );

				expect( attrs ).to.deep.equal( [ [ 'foo', 'bar' ], [ 'abc', 'xyz' ] ] );
			} );
		} );

		describe( 'getAttributeKeys()', () => {
			it( 'should return iterator that iterates over all attribute keys set on selection', () => {
				selection.setRanges( [ rangeInFullP ] );
				selection.setAttribute( 'foo', 'bar' );
				selection.setAttribute( 'abc', 'xyz' );

				const attrs = Array.from( selection.getAttributeKeys() );

				expect( attrs ).to.deep.equal( [ 'foo', 'abc' ] );
			} );
		} );

		describe( 'hasAttribute()', () => {
			it( 'should return true if element contains attribute with given key', () => {
				selection.setRanges( [ rangeInFullP ] );
				selection.setAttribute( 'foo', 'bar' );

				expect( selection.hasAttribute( 'foo' ) ).to.be.true;
			} );

			it( 'should return false if element does not contain attribute with given key', () => {
				expect( selection.hasAttribute( 'abc' ) ).to.be.false;
			} );
		} );

		describe( 'clearAttributes()', () => {
			it( 'should remove all attributes from the element', () => {
				selection.setRanges( [ rangeInFullP ] );
				selection.setAttribute( 'foo', 'bar' );
				selection.setAttribute( 'abc', 'xyz' );

				selection.clearAttributes();

				expect( selection.getAttribute( 'foo' ) ).to.be.undefined;
				expect( selection.getAttribute( 'abc' ) ).to.be.undefined;
			} );

			it( 'should fire change:attribute event with correct parameters', () => {
				selection.setAttribute( 'foo', 'bar' );

				selection.on( 'change:attribute', ( evt, data ) => {
					expect( data.directChange ).to.be.true;
					expect( data.attributeKeys ).to.deep.equal( [ 'foo' ] );
				} );

				selection.clearAttributes();
			} );

			it( 'should not fire change:attribute event if there were no attributes', () => {
				const spy = sinon.spy();
				selection.on( 'change:attribute', spy );

				selection.clearAttributes();

				expect( spy.called ).to.be.false;
			} );
		} );

		describe( 'removeAttribute()', () => {
			it( 'should remove attribute', () => {
				selection.setRanges( [ rangeInFullP ] );
				selection.setAttribute( 'foo', 'bar' );
				selection.removeAttribute( 'foo' );

				expect( selection.getAttribute( 'foo' ) ).to.be.undefined;
			} );

			it( 'should fire change:attribute event with correct parameters', () => {
				selection.setAttribute( 'foo', 'bar' );

				selection.on( 'change:attribute', ( evt, data ) => {
					expect( data.directChange ).to.be.true;
					expect( data.attributeKeys ).to.deep.equal( [ 'foo' ] );
				} );

				selection.removeAttribute( 'foo' );
			} );

			it( 'should not fire change:attribute event if such attribute did not exist', () => {
				const spy = sinon.spy();
				selection.on( 'change:attribute', spy );

				selection.removeAttribute( 'foo' );

				expect( spy.called ).to.be.false;
			} );
		} );

		describe( 'setAttributesTo()', () => {
			it( 'should remove all attributes set on element and set the given ones', () => {
				selection.setAttribute( 'abc', 'xyz' );
				selection.setAttributesTo( { foo: 'bar' } );

				expect( selection.getAttribute( 'foo' ) ).to.equal( 'bar' );
				expect( selection.getAttribute( 'abc' ) ).to.be.undefined;
			} );

			it( 'should fire only one change:attribute event', () => {
				selection.setAttributesTo( { foo: 'bar', xxx: 'yyy' } );

				const spy = sinon.spy();
				selection.on( 'change:attribute', spy );

				selection.setAttributesTo( { foo: 'bar', abc: 'def' } );

				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'should fire change:attribute event with correct parameters', () => {
				selection.setAttributesTo( { foo: 'bar', xxx: 'yyy' } );

				selection.on( 'change:attribute', ( evt, data ) => {
					expect( data.directChange ).to.be.true;
					expect( data.attributeKeys ).to.deep.equal( [ 'abc', 'xxx' ] );
				} );

				selection.setAttributesTo( { foo: 'bar', abc: 'def' } );
			} );

			it( 'should not fire change:attribute event if attributes had not changed', () => {
				selection.setRanges( [ rangeInFullP ] );
				selection.setAttributesTo( { foo: 'bar', xxx: 'yyy' } );

				const spy = sinon.spy();
				selection.on( 'change:attribute', spy );

				selection.setAttributesTo( { xxx: 'yyy', foo: 'bar' } );

				expect( spy.called ).to.be.false;
			} );
		} );
	} );

	describe( 'containsEntireContent()', () => {
		beforeEach( () => {
			doc.schema.registerItem( 'p', '$block' );
			doc.schema.allow( { name: 'p', inside: '$root' } );
		} );

		it( 'returns true if the entire content in $root is selected', () => {
			setData( doc, '<p>[Foo</p><p>Bom</p><p>Bar]</p>' );

			expect( doc.selection.containsEntireContent() ).to.equal( true );
		} );

		it( 'returns false when only a fragment of the content in $root is selected', () => {
			setData( doc, '<p>Fo[o</p><p>Bom</p><p>Bar]</p>' );

			expect( doc.selection.containsEntireContent() ).to.equal( false );
		} );

		it( 'returns true if the entire content in specified element is selected', () => {
			setData( doc, '<p>Foo</p><p>[Bom]</p><p>Bar</p>' );

			const root = doc.getRoot();
			const secondParagraph = root.getNodeByPath( [ 1 ] );

			expect( doc.selection.containsEntireContent( secondParagraph ) ).to.equal( true );
		} );

		it( 'returns false if the entire content in specified element is not selected', () => {
			setData( doc, '<p>Foo</p><p>[Bom</p><p>B]ar</p>' );

			const root = doc.getRoot();
			const secondParagraph = root.getNodeByPath( [ 1 ] );

			expect( doc.selection.containsEntireContent( secondParagraph ) ).to.equal( false );
		} );

		it( 'returns false when the entire content except an empty element is selected', () => {
			doc.schema.registerItem( 'img', '$inline' );
			doc.schema.allow( { name: 'img', inside: 'p' } );

			setData( doc, '<p><img></img>[Foo]</p>' );

			expect( doc.selection.containsEntireContent() ).to.equal( false );
		} );

		it( 'returns true if the content is empty', () => {
			setData( doc, '[]' );

			expect( doc.selection.containsEntireContent() ).to.equal( true );
		} );

		it( 'returns false if empty selection is at the end of non-empty content', () => {
			setData( doc, '<p>Foo bar bom.</p>[]' );

			expect( doc.selection.containsEntireContent() ).to.equal( false );
		} );
	} );
} );
