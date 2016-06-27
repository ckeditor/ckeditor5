/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: model */

'use strict';

import Document from '/ckeditor5/engine/model/document.js';
import Element from '/ckeditor5/engine/model/element.js';
import Range from '/ckeditor5/engine/model/range.js';
import Position from '/ckeditor5/engine/model/position.js';
import LiveRange from '/ckeditor5/engine/model/liverange.js';
import Selection from '/ckeditor5/engine/model/selection.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';
import testUtils from '/tests/ckeditor5/_utils/utils.js';
import count from '/ckeditor5/utils/count.js';

testUtils.createSinonSandbox();

describe( 'Selection', () => {
	let doc, root, selection, liveRange, range;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot();
		root.appendChildren( [
			new Element( 'p' ),
			new Element( 'p' ),
			new Element( 'p', [], 'foobar' ),
			new Element( 'p' ),
			new Element( 'p' ),
			new Element( 'p' ),
			new Element( 'p', [], 'foobar' )
		] );
		selection = new Selection( doc );
		doc.schema.registerItem( 'p', '$block' );

		liveRange = new LiveRange( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) );
		range = new Range( new Position( root, [ 2 ] ), new Position( root, [ 2, 2 ] ) );
	} );

	afterEach( () => {
		doc.destroy();
		liveRange.detach();
	} );

	describe( 'default range', () => {
		it( 'should go to the first editable element', () => {
			const ranges = Array.from( selection.getRanges() );

			expect( ranges.length ).to.equal( 1 );
			expect( selection.anchor.isEqual( new Position( root, [ 0, 0 ] ) ) ).to.be.true;
			expect( selection.focus.isEqual( new Position( root, [ 0, 0 ] ) ) ).to.be.true;
			expect( selection ).to.have.property( 'isBackward', false );
		} );

		it( 'should be set to the beginning of the doc if there is no editable element', () => {
			doc = new Document();
			root = doc.createRoot();
			root.insertChildren( 0, 'foobar' );
			selection = doc.selection;

			const ranges = Array.from( selection.getRanges() );

			expect( ranges.length ).to.equal( 1 );
			expect( selection.anchor.isEqual( new Position( root, [ 0 ] ) ) ).to.be.true;
			expect( selection.focus.isEqual( new Position( root, [ 0 ] ) ) ).to.be.true;
			expect( selection ).to.have.property( 'isBackward', false );
			expect( selection._attrs ).to.be.instanceof( Map );
			expect( selection._attrs.size ).to.equal( 0 );
		} );

		it( 'should skip element when you can not put selection', () => {
			doc = new Document();
			root = doc.createRoot();
			root.insertChildren( 0, [
				new Element( 'img' ),
				new Element( 'p', [], 'foobar' )
			] );
			doc.schema.registerItem( 'img' );
			doc.schema.registerItem( 'p', '$block' );
			selection = doc.selection;

			const ranges = Array.from( selection.getRanges() );

			expect( ranges.length ).to.equal( 1 );
			expect( selection.anchor.isEqual( new Position( root, [ 1, 0 ] ) ) ).to.be.true;
			expect( selection.focus.isEqual( new Position( root, [ 1, 0 ] ) ) ).to.be.true;
			expect( selection ).to.have.property( 'isBackward', false );
			expect( selection._attrs ).to.be.instanceof( Map );
			expect( selection._attrs.size ).to.equal( 0 );
		} );
	} );

	describe( 'isCollapsed', () => {
		it( 'should return true for default range', () => {
			expect( selection.isCollapsed ).to.be.true;
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
			expect( selection.rangeCount ).to.equal( 1 );

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
			selection.collapse( root, 'END' );

			expect( selection ).to.have.property( 'isCollapsed', true );

			const focus = selection.focus;
			expect( focus ).to.have.property( 'parent', root );
			expect( focus ).to.have.property( 'offset', root.getChildCount() );
		} );

		it( 'sets selection before the specified element', () => {
			selection.collapse( root.getChild( 1 ), 'BEFORE' );

			expect( selection ).to.have.property( 'isCollapsed', true );

			const focus = selection.focus;
			expect( focus ).to.have.property( 'parent', root );
			expect( focus ).to.have.property( 'offset', 1 );
		} );

		it( 'sets selection after the specified element', () => {
			selection.collapse( root.getChild( 1 ), 'AFTER' );

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

			selection.setFocus( Position.createAt( root, 'END' ) );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'modifies default range', () => {
			const startPos = selection.getFirstPosition();
			const endPos = Position.createAt( root, 'END' );

			selection.setFocus( endPos );

			expect( selection.anchor.compareWith( startPos ) ).to.equal( 'SAME' );
			expect( selection.focus.compareWith( endPos ) ).to.equal( 'SAME' );
		} );

		it( 'modifies existing collapsed selection', () => {
			const startPos = Position.createAt( root, 1 );
			const endPos = Position.createAt( root, 2 );

			selection.collapse( startPos );

			selection.setFocus( endPos );

			expect( selection.anchor.compareWith( startPos ) ).to.equal( 'SAME' );
			expect( selection.focus.compareWith( endPos ) ).to.equal( 'SAME' );
		} );

		it( 'makes existing collapsed selection a backward selection', () => {
			const startPos = Position.createAt( root, 1 );
			const endPos = Position.createAt( root, 0 );

			selection.collapse( startPos );

			selection.setFocus( endPos );

			expect( selection.anchor.compareWith( startPos ) ).to.equal( 'SAME' );
			expect( selection.focus.compareWith( endPos ) ).to.equal( 'SAME' );
			expect( selection.isBackward ).to.be.true;
		} );

		it( 'modifies existing non-collapsed selection', () => {
			const startPos = Position.createAt( root, 1 );
			const endPos = Position.createAt( root, 2 );
			const newEndPos = Position.createAt( root, 3 );

			selection.addRange( new Range( startPos, endPos ) );

			selection.setFocus( newEndPos );

			expect( selection.anchor.compareWith( startPos ) ).to.equal( 'SAME' );
			expect( selection.focus.compareWith( newEndPos ) ).to.equal( 'SAME' );
		} );

		it( 'makes existing non-collapsed selection a backward selection', () => {
			const startPos = Position.createAt( root, 1 );
			const endPos = Position.createAt( root, 2 );
			const newEndPos = Position.createAt( root, 0 );

			selection.addRange( new Range( startPos, endPos ) );

			selection.setFocus( newEndPos );

			expect( selection.anchor.compareWith( startPos ) ).to.equal( 'SAME' );
			expect( selection.focus.compareWith( newEndPos ) ).to.equal( 'SAME' );
			expect( selection.isBackward ).to.be.true;
		} );

		it( 'makes existing backward selection a forward selection', () => {
			const startPos = Position.createAt( root, 1 );
			const endPos = Position.createAt( root, 2 );
			const newEndPos = Position.createAt( root, 3 );

			selection.addRange( new Range( startPos, endPos ), true );

			selection.setFocus( newEndPos );

			expect( selection.anchor.compareWith( endPos ) ).to.equal( 'SAME' );
			expect( selection.focus.compareWith( newEndPos ) ).to.equal( 'SAME' );
			expect( selection.isBackward ).to.be.false;
		} );

		it( 'modifies existing backward selection', () => {
			const startPos = Position.createAt( root, 1 );
			const endPos = Position.createAt( root, 2 );
			const newEndPos = Position.createAt( root, 0 );

			selection.addRange( new Range( startPos, endPos ), true );

			selection.setFocus( newEndPos );

			expect( selection.anchor.compareWith( endPos ) ).to.equal( 'SAME' );
			expect( selection.focus.compareWith( newEndPos ) ).to.equal( 'SAME' );
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
			expect( ranges[ 0 ].start.compareWith( startPos1 ) ).to.equal( 'SAME' );
			expect( ranges[ 0 ].end.compareWith( endPos1 ) ).to.equal( 'SAME' );

			expect( selection.anchor.compareWith( startPos2 ) ).to.equal( 'SAME' );
			expect( selection.focus.compareWith( newEndPos ) ).to.equal( 'SAME' );
			expect( selection.isBackward ).to.be.true;

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'collapses the selection when extending to the anchor', () => {
			const startPos = Position.createAt( root, 1 );
			const endPos = Position.createAt( root, 2 );

			selection.addRange( new Range( startPos, endPos ) );

			selection.setFocus( startPos );

			expect( selection.focus.compareWith( startPos ) ).to.equal( 'SAME' );
			expect( selection.isCollapsed ).to.be.true;
		} );

		it( 'uses Position.createAt', () => {
			const startPos = Position.createAt( root, 1 );
			const endPos = Position.createAt( root, 2 );
			const newEndPos = Position.createAt( root, 4 );
			const spy = testUtils.sinon.stub( Position, 'createAt', () => newEndPos );

			selection.addRange( new Range( startPos, endPos ) );

			selection.setFocus( root, 'END' );

			expect( spy.calledOnce ).to.be.true;
			expect( selection.focus.compareWith( newEndPos ) ).to.equal( 'SAME' );
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

		it( 'should remove all stored ranges (and reset to default range)', () => {
			expect( Array.from( selection.getRanges() ).length ).to.equal( 1 );
			expect( selection.anchor.isEqual( new Position( root, [ 0, 0 ] ) ) ).to.be.true;
			expect( selection.focus.isEqual( new Position( root, [ 0, 0 ] ) ) ).to.be.true;
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

	describe( 'getFirstRange', () => {
		it( 'should return a range which start position is before all other ranges\' start positions', () => {
			// This will not be the first range despite being added as first
			selection.addRange( new Range( new Position( root, [ 4 ] ), new Position( root, [ 5 ] ) ) );

			// This should be the first range.
			selection.addRange( new Range( new Position( root, [ 1 ] ), new Position( root, [ 4 ] ) ) );

			// A random range that is not first.
			selection.addRange( new Range( new Position( root, [ 6 ] ), new Position( root, [ 7 ] ) ) );

			let range = selection.getFirstRange();

			expect( range.start.path ).to.deep.equal( [ 1 ] );
			expect( range.end.path ).to.deep.equal( [ 4 ] );
		} );
	} );

	describe( 'getFirstPosition', () => {
		it( 'should return a position that is in selection and is before any other position from the selection', () => {
			// This will not be a range containing the first position despite being added as first
			selection.addRange( new Range( new Position( root, [ 4 ] ), new Position( root, [ 5 ] ) ) );

			// This should be the first range.
			selection.addRange( new Range( new Position( root, [ 1 ] ), new Position( root, [ 4 ] ) ) );

			// A random range that is not first.
			selection.addRange( new Range( new Position( root, [ 6 ] ), new Position( root, [ 7 ] ) ) );

			let position = selection.getFirstPosition();

			expect( position.path ).to.deep.equal( [ 1 ] );
		} );
	} );
} );
