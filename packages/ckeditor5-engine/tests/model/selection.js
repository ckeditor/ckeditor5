/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Model from '../../src/model/model.js';
import Element from '../../src/model/element.js';
import Text from '../../src/model/text.js';
import Range from '../../src/model/range.js';
import Position from '../../src/model/position.js';
import LiveRange from '../../src/model/liverange.js';
import Selection from '../../src/model/selection.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import count from '@ckeditor/ckeditor5-utils/src/count.js';
import { parse, setData } from '../../src/dev-utils/model.js';
import Schema from '../../src/model/schema.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

import { stringifyBlocks } from './_utils/utils.js';

describe( 'Selection', () => {
	let model, doc, root, selection, liveRange, range, range1, range2, range3;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		model = new Model();
		doc = model.document;
		root = doc.createRoot();
		root._appendChild( [
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
		model.destroy();
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

		it( 'should be able to create a selection from the given range and isLastBackward flag', () => {
			const selection = new Selection( range1, { backward: true } );

			expect( selection.isBackward ).to.be.true;
			expect( Array.from( selection.getRanges() ) ).to.deep.equal( [ range1 ] );
		} );

		it( 'should be able to create a selection from the given ranges and isLastBackward flag', () => {
			const ranges = new Set( [ range1, range2, range3 ] );
			const selection = new Selection( ranges, { backward: true } );

			expect( selection.isBackward ).to.be.true;
			expect( Array.from( selection.getRanges() ) ).to.deep.equal( [ range1, range2, range3 ] );
		} );

		it( 'should be able to create a selection from the other selection', () => {
			const ranges = [ range1, range2, range3 ];
			const otherSelection = new Selection( ranges, { backward: true } );
			const selection = new Selection( otherSelection );

			expect( selection.isBackward ).to.be.true;
			expect( Array.from( selection.getRanges() ) ).to.deep.equal( [ range1, range2, range3 ] );
		} );

		it( 'should be able to create a selection at the start position of an item', () => {
			const selection = new Selection( root, 0 );
			const focus = selection.focus;

			expect( selection ).to.have.property( 'isCollapsed', true );
			expect( focus ).to.have.property( 'parent', root );
			expect( focus ).to.have.property( 'offset', 0 );
		} );

		it( 'should be able to create a selection before the specified element', () => {
			const selection = new Selection( root.getChild( 1 ), 'before' );
			const focus = selection.focus;

			expect( selection ).to.have.property( 'isCollapsed', true );

			expect( focus ).to.have.property( 'parent', root );
			expect( focus ).to.have.property( 'offset', 1 );
		} );

		it( 'should throw an error if added ranges intersects', () => {
			expectToThrowCKEditorError( () => {
				// eslint-disable-next-line no-new
				new Selection( [
					liveRange,
					new Range(
						new Position( root, [ 0, 4 ] ),
						new Position( root, [ 1, 2 ] )
					)
				] );
			}, /model-selection-range-intersects/, model );
		} );

		it( 'should throw an error when trying to set selection to not selectable', () => {
			expectToThrowCKEditorError( () => {
				// eslint-disable-next-line no-new
				new Selection( {} );
			}, 'model-selection-setto-not-selectable' );
		} );
	} );

	describe( 'is()', () => {
		let selection;

		beforeEach( () => {
			selection = new Selection();
		} );

		it( 'should return true for "selection"', () => {
			expect( selection.is( 'selection' ) ).to.be.true;
			expect( selection.is( 'model:selection' ) ).to.be.true;
		} );

		it( 'should return false for incorrect values', () => {
			expect( selection.is( 'model' ) ).to.be.false;
			expect( selection.is( 'model:node' ) ).to.be.false;
			expect( selection.is( '$text' ) ).to.be.false;
			expect( selection.is( '$textProxy' ) ).to.be.false;
			expect( selection.is( 'element' ) ).to.be.false;
			expect( selection.is( 'element', 'paragraph' ) ).to.be.false;
			expect( selection.is( 'documentSelection' ) ).to.be.false;
			expect( selection.is( 'node' ) ).to.be.false;
			expect( selection.is( 'rootElement' ) ).to.be.false;
		} );
	} );

	describe( 'isCollapsed', () => {
		it( 'should return false for empty selection', () => {
			expect( selection.isCollapsed ).to.be.false;
		} );

		it( 'should return true when there is single collapsed ranges', () => {
			selection.setTo( new Range( new Position( root, [ 0 ] ), new Position( root, [ 0 ] ) ) );

			expect( selection.isCollapsed ).to.be.true;
		} );

		it( 'should return false when there are multiple ranges', () => {
			selection.setTo( [
				new Range( new Position( root, [ 0 ] ), new Position( root, [ 0 ] ) ),
				new Range( new Position( root, [ 2 ] ), new Position( root, [ 2 ] ) )
			] );

			expect( selection.isCollapsed ).to.be.false;
		} );

		it( 'should return false when there is not collapsed range', () => {
			selection.setTo( range );

			expect( selection.isCollapsed ).to.be.false;
		} );
	} );

	describe( 'rangeCount', () => {
		it( 'should return proper range count', () => {
			expect( selection.rangeCount ).to.equal( 0 );

			selection.setTo( new Range( new Position( root, [ 0 ] ), new Position( root, [ 0 ] ) ) );

			expect( selection.rangeCount ).to.equal( 1 );

			selection.setTo( [
				new Range( new Position( root, [ 0 ] ), new Position( root, [ 0 ] ) ),
				new Range( new Position( root, [ 2 ] ), new Position( root, [ 2 ] ) )
			] );

			expect( selection.rangeCount ).to.equal( 2 );
		} );
	} );

	describe( 'isBackward', () => {
		it( 'is defined by the last added range', () => {
			selection.setTo( [ range ], { backward: true } );
			expect( selection ).to.have.property( 'isBackward', true );

			selection.setTo( liveRange );
			expect( selection ).to.have.property( 'isBackward', false );
		} );

		it( 'is false when last range is collapsed', () => {
			const pos = Position._createAt( root, 0 );

			selection.setTo( pos );

			expect( selection.isBackward ).to.be.false;
		} );
	} );

	describe( 'focus', () => {
		let r1, r2, r3;

		beforeEach( () => {
			r1 = new Range( Position._createAt( root, 2 ), Position._createAt( root, 4 ) );
			r2 = new Range( Position._createAt( root, 4 ), Position._createAt( root, 6 ) );
			r3 = new Range( Position._createAt( root, 1 ), Position._createAt( root, 2 ) );
			selection.setTo( [ r1, r2 ] );
		} );

		it( 'should return correct focus when last added range is not backward one', () => {
			selection.setTo( [ r1, r2, r3 ] );

			expect( selection.focus.isEqual( r3.end ) ).to.be.true;
		} );

		it( 'should return correct focus when last added range is backward one', () => {
			selection.setTo( [ r1, r2, r3 ], { backward: true } );

			expect( selection.focus.isEqual( r3.start ) ).to.be.true;
		} );

		it( 'should return null if no ranges in selection', () => {
			selection.setTo( null );
			expect( selection.focus ).to.be.null;
		} );
	} );

	describe( 'setTo()', () => {
		it( 'should set selection to be same as given selection, using _setRanges method', () => {
			const spy = sinon.spy( selection, '_setRanges' );

			const otherSelection = new Selection( [ range1, range2 ], { backward: true } );

			selection.setTo( otherSelection );

			expect( Array.from( selection.getRanges() ) ).to.deep.equal( [ range1, range2 ] );
			expect( selection.isBackward ).to.be.true;
			expect( selection._setRanges.calledOnce ).to.be.true;
			spy.restore();
		} );

		it( 'should set selection on the given Range using _setRanges method', () => {
			const spy = sinon.spy( selection, '_setRanges' );

			selection.setTo( range1 );

			expect( Array.from( selection.getRanges() ) ).to.deep.equal( [ range1 ] );
			expect( selection.isBackward ).to.be.false;
			expect( selection._setRanges.calledOnce ).to.be.true;
			spy.restore();
		} );

		it( 'should set selection on the given iterable of Ranges using _setRanges method', () => {
			const spy = sinon.spy( selection, '_setRanges' );

			selection.setTo( new Set( [ range1, range2 ] ) );

			expect( Array.from( selection.getRanges() ) ).to.deep.equal( [ range1, range2 ] );
			expect( selection.isBackward ).to.be.false;
			expect( selection._setRanges.calledOnce ).to.be.true;
			spy.restore();
		} );

		it( 'should set collapsed selection on the given Position using _setRanges method', () => {
			const spy = sinon.spy( selection, '_setRanges' );
			const position = new Position( root, [ 4 ] );

			selection.setTo( position );

			expect( Array.from( selection.getRanges() ).length ).to.equal( 1 );
			expect( Array.from( selection.getRanges() )[ 0 ].start ).to.deep.equal( position );
			expect( selection.isBackward ).to.be.false;
			expect( selection.isCollapsed ).to.be.true;
			expect( selection._setRanges.calledOnce ).to.be.true;
			spy.restore();
		} );

		it( 'should throw an error if added ranges intersects', () => {
			expectToThrowCKEditorError( () => {
				selection.setTo( [
					liveRange,
					new Range(
						new Position( root, [ 0, 4 ] ),
						new Position( root, [ 1, 2 ] )
					)
				] );
			}, /model-selection-range-intersects/, model );
		} );

		it( 'should throw an error when trying to set selection to not selectable', () => {
			expectToThrowCKEditorError( () => {
				selection.setTo( {} );
			}, 'model-selection-setto-not-selectable' );
		} );

		it( 'should throw an error when trying to set selection to not selectable #2', () => {
			expectToThrowCKEditorError( () => {
				selection.setTo();
			}, 'model-selection-setto-not-selectable' );
		} );

		it( 'should allow setting selection inside an element', () => {
			const element = new Element( 'p', null, [ new Text( 'foo' ), new Text( 'bar' ) ] );

			selection.setTo( element, 'in' );

			const ranges = Array.from( selection.getRanges() );
			expect( ranges.length ).to.equal( 1 );
			expect( ranges[ 0 ].start.parent ).to.equal( element );
			expect( ranges[ 0 ].start.offset ).to.deep.equal( 0 );
			expect( ranges[ 0 ].end.parent ).to.equal( element );
			expect( ranges[ 0 ].end.offset ).to.deep.equal( 6 );
		} );

		it( 'should allow setting selection on an item', () => {
			const textNode1 = new Text( 'foo' );
			const textNode2 = new Text( 'bar' );
			const textNode3 = new Text( 'baz' );
			const element = new Element( 'p', null, [ textNode1, textNode2, textNode3 ] );

			selection.setTo( textNode2, 'on' );

			const ranges = Array.from( selection.getRanges() );
			expect( ranges.length ).to.equal( 1 );
			expect( ranges[ 0 ].start.parent ).to.equal( element );
			expect( ranges[ 0 ].start.offset ).to.deep.equal( 3 );
			expect( ranges[ 0 ].end.parent ).to.equal( element );
			expect( ranges[ 0 ].end.offset ).to.deep.equal( 6 );
		} );

		it( 'should allow setting backward selection on an item', () => {
			const textNode1 = new Text( 'foo' );
			const textNode2 = new Text( 'bar' );
			const textNode3 = new Text( 'baz' );
			const element = new Element( 'p', null, [ textNode1, textNode2, textNode3 ] );

			selection.setTo( textNode2, 'on', { backward: true } );

			const ranges = Array.from( selection.getRanges() );
			expect( ranges.length ).to.equal( 1 );
			expect( ranges[ 0 ].start.parent ).to.equal( element );
			expect( ranges[ 0 ].start.offset ).to.deep.equal( 3 );
			expect( ranges[ 0 ].end.parent ).to.equal( element );
			expect( ranges[ 0 ].end.offset ).to.deep.equal( 6 );
			expect( selection.isBackward ).to.be.true;
		} );

		// TODO - backward
		// TODO - throwing

		describe( 'setting selection to position or item', () => {
			it( 'should fire change:range', () => {
				const spy = sinon.spy();

				selection.on( 'change:range', spy );

				selection.setTo( root, 0 );

				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'should throw if second parameter is not passed', () => {
				expectToThrowCKEditorError( () => {
					selection.setTo( root );
				}, 'model-selection-setto-required-second-parameter', model );
			} );

			it( 'should set selection at given offset in given parent', () => {
				selection.setTo( root, 3 );

				expect( selection ).to.have.property( 'isCollapsed', true );

				const focus = selection.focus;
				expect( focus ).to.have.property( 'parent', root );
				expect( focus ).to.have.property( 'offset', 3 );
			} );

			it( 'should set selection at the end of the given parent', () => {
				selection.setTo( root, 'end' );

				expect( selection ).to.have.property( 'isCollapsed', true );

				const focus = selection.focus;
				expect( focus ).to.have.property( 'parent', root );
				expect( focus ).to.have.property( 'offset', root.maxOffset );
			} );

			it( 'should set selection before the specified element', () => {
				selection.setTo( root.getChild( 1 ), 'before' );

				expect( selection ).to.have.property( 'isCollapsed', true );

				const focus = selection.focus;
				expect( focus ).to.have.property( 'parent', root );
				expect( focus ).to.have.property( 'offset', 1 );
			} );

			it( 'should set selection after the specified element', () => {
				selection.setTo( root.getChild( 1 ), 'after' );

				expect( selection ).to.have.property( 'isCollapsed', true );

				const focus = selection.focus;
				expect( focus ).to.have.property( 'parent', root );
				expect( focus ).to.have.property( 'offset', 2 );
			} );

			it( 'should set selection at the specified position', () => {
				const pos = Position._createAt( root, 3 );

				selection.setTo( pos );

				expect( selection ).to.have.property( 'isCollapsed', true );

				const focus = selection.focus;
				expect( focus ).to.have.property( 'parent', root );
				expect( focus ).to.have.property( 'offset', 3 );
			} );
		} );
	} );

	describe( 'setFocus()', () => {
		it( 'keeps all existing ranges and fires no change:range when no modifications needed', () => {
			selection.setTo( [ range, liveRange ] );

			const spy = sinon.spy();
			selection.on( 'change:range', spy );

			selection.setFocus( selection.focus );

			expect( count( selection.getRanges() ) ).to.equal( 2 );
			expect( spy.callCount ).to.equal( 0 );
		} );

		it( 'fires change:range', () => {
			selection.setTo( range );

			const spy = sinon.spy();
			selection.on( 'change:range', spy );

			selection.setFocus( Position._createAt( root, 'end' ) );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'throws if there are no ranges in selection', () => {
			const endPos = Position._createAt( root, 'end' );

			expectToThrowCKEditorError( () => {
				selection.setFocus( endPos );
			}, 'model-selection-setfocus-no-ranges', model );
		} );

		it( 'modifies existing collapsed selection', () => {
			const startPos = Position._createAt( root, 1 );
			const endPos = Position._createAt( root, 2 );

			selection.setTo( startPos );

			selection.setFocus( endPos );

			expect( selection.anchor.compareWith( startPos ) ).to.equal( 'same' );
			expect( selection.focus.compareWith( endPos ) ).to.equal( 'same' );
		} );

		it( 'makes existing collapsed selection a backward selection', () => {
			const startPos = Position._createAt( root, 1 );
			const endPos = Position._createAt( root, 0 );

			selection.setTo( startPos );

			selection.setFocus( endPos );

			expect( selection.anchor.compareWith( startPos ) ).to.equal( 'same' );
			expect( selection.focus.compareWith( endPos ) ).to.equal( 'same' );
			expect( selection.isBackward ).to.be.true;
		} );

		it( 'modifies existing non-collapsed selection', () => {
			const startPos = Position._createAt( root, 1 );
			const endPos = Position._createAt( root, 2 );
			const newEndPos = Position._createAt( root, 3 );

			selection.setTo( new Range( startPos, endPos ) );

			selection.setFocus( newEndPos );

			expect( selection.anchor.compareWith( startPos ) ).to.equal( 'same' );
			expect( selection.focus.compareWith( newEndPos ) ).to.equal( 'same' );
		} );

		it( 'makes existing non-collapsed selection a backward selection', () => {
			const startPos = Position._createAt( root, 1 );
			const endPos = Position._createAt( root, 2 );
			const newEndPos = Position._createAt( root, 0 );

			selection.setTo( new Range( startPos, endPos ) );

			selection.setFocus( newEndPos );

			expect( selection.anchor.compareWith( startPos ) ).to.equal( 'same' );
			expect( selection.focus.compareWith( newEndPos ) ).to.equal( 'same' );
			expect( selection.isBackward ).to.be.true;
		} );

		it( 'makes existing backward selection a forward selection', () => {
			const startPos = Position._createAt( root, 1 );
			const endPos = Position._createAt( root, 2 );
			const newEndPos = Position._createAt( root, 3 );

			selection.setTo( new Range( startPos, endPos ), { backward: true } );

			selection.setFocus( newEndPos );

			expect( selection.anchor.compareWith( endPos ) ).to.equal( 'same' );
			expect( selection.focus.compareWith( newEndPos ) ).to.equal( 'same' );
			expect( selection.isBackward ).to.be.false;
		} );

		it( 'modifies existing backward selection', () => {
			const startPos = Position._createAt( root, 1 );
			const endPos = Position._createAt( root, 2 );
			const newEndPos = Position._createAt( root, 0 );

			selection.setTo( new Range( startPos, endPos ), { backward: true } );

			selection.setFocus( newEndPos );

			expect( selection.anchor.compareWith( endPos ) ).to.equal( 'same' );
			expect( selection.focus.compareWith( newEndPos ) ).to.equal( 'same' );
			expect( selection.isBackward ).to.be.true;
		} );

		it( 'modifies only the last range', () => {
			// Offsets are chosen in this way that the order of adding ranges must count, not their document order.
			const startPos1 = Position._createAt( root, 4 );
			const endPos1 = Position._createAt( root, 5 );
			const startPos2 = Position._createAt( root, 1 );
			const endPos2 = Position._createAt( root, 2 );

			const newEndPos = Position._createAt( root, 0 );

			selection.setTo( [
				new Range( startPos1, endPos1 ),
				new Range( startPos2, endPos2 )
			] );

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
			const startPos = Position._createAt( root, 1 );
			const endPos = Position._createAt( root, 2 );

			selection.setTo( new Range( startPos, endPos ) );

			selection.setFocus( startPos );

			expect( selection.focus.compareWith( startPos ) ).to.equal( 'same' );
			expect( selection.isCollapsed ).to.be.true;
		} );
	} );

	describe( 'setTo - selection set to null', () => {
		let spy;

		it( 'should remove all stored ranges', () => {
			selection.setTo( [ liveRange, range ] );

			selection.setTo( null );

			expect( Array.from( selection.getRanges() ).length ).to.equal( 0 );
		} );

		it( 'should fire exactly one change:range event', () => {
			selection.setTo( [ liveRange, range ] );

			spy = sinon.spy();
			selection.on( 'change:range', spy );

			selection.setTo( null );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should not fire change:range event if there were no ranges', () => {
			spy = sinon.spy();
			selection.on( 'change:range', spy );

			selection.setTo( null );

			expect( spy.called ).to.be.false;
		} );
	} );

	describe( '_setRanges()', () => {
		let newRanges, spy;

		beforeEach( () => {
			newRanges = [
				new Range( new Position( root, [ 4 ] ), new Position( root, [ 5 ] ) ),
				new Range( new Position( root, [ 5, 0 ] ), new Position( root, [ 6, 0 ] ) )
			];

			selection.setTo( [ liveRange, range ] );

			spy = sinon.spy();
			selection.on( 'change:range', spy );
		} );

		it( 'should throw an error when range is invalid', () => {
			expectToThrowCKEditorError( () => {
				selection._setRanges( [ { invalid: 'range' } ] );
			}, /model-selection-set-ranges-not-range/, model );
		} );

		it( 'should remove all ranges and add given ranges', () => {
			selection._setRanges( newRanges );

			const ranges = Array.from( selection.getRanges() );
			expect( ranges ).to.deep.equal( newRanges );
		} );

		it( 'should use last range from given array to get anchor and focus position', () => {
			selection._setRanges( newRanges );
			expect( selection.anchor.path ).to.deep.equal( [ 5, 0 ] );
			expect( selection.focus.path ).to.deep.equal( [ 6, 0 ] );
		} );

		it( 'should acknowledge backward flag when setting anchor and focus', () => {
			selection._setRanges( newRanges, { backward: true } );
			expect( selection.anchor.path ).to.deep.equal( [ 6, 0 ] );
			expect( selection.focus.path ).to.deep.equal( [ 5, 0 ] );
		} );

		it( 'should fire exactly one change:range event', () => {
			selection._setRanges( newRanges );
			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should fire change:range event with correct parameters', () => {
			selection.on( 'change:range', ( evt, data ) => {
				expect( data.directChange ).to.be.true;
			} );

			selection._setRanges( newRanges );
		} );

		it( 'should not fire change:range event if given ranges are the same', () => {
			selection._setRanges( [ liveRange, range ] );
			expect( spy.calledOnce ).to.be.false;
		} );

		it( 'should copy added ranges and store multiple ranges', () => {
			selection._setRanges( [ liveRange, range ] );

			const ranges = selection._ranges;

			expect( ranges.length ).to.equal( 2 );
			expect( ranges[ 0 ].isEqual( liveRange ) ).to.be.true;
			expect( ranges[ 1 ].isEqual( range ) ).to.be.true;
			expect( ranges[ 0 ] ).not.to.equal( liveRange );
			expect( ranges[ 1 ] ).not.to.equal( range );
		} );

		it( 'should set anchor and focus to the start and end of the last added range', () => {
			selection._setRanges( [ liveRange, range ] );

			expect( selection.anchor.path ).to.deep.equal( [ 2 ] );
			expect( selection.focus.path ).to.deep.equal( [ 2, 2 ] );
		} );

		it( 'should set anchor and focus to the end and start of the most recently added range if backward flag was used', () => {
			selection._setRanges( [ liveRange, range ], { backward: true } );

			expect( selection.anchor.path ).to.deep.equal( [ 2 ] );
			expect( selection.focus.path ).to.deep.equal( [ 2, 2 ] );
		} );
	} );

	describe( 'getFirstRange()', () => {
		it( 'should return null if no ranges were added', () => {
			expect( selection.getFirstRange() ).to.be.null;
		} );

		it( 'should return a range which start position is before all other ranges\' start positions', () => {
			selection.setTo( [
				// This will not be the first range despite being added as first
				range2,
				// This should be the first range.
				range1,
				// A random range that is not first.
				range3
			] );

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
			selection.setTo( [
				// This will not be the first range despite being added as first
				range2,
				// This should be the first range.
				range1,
				// A random range that is not first.
				range3
			] );

			const position = selection.getFirstPosition();

			expect( position.path ).to.deep.equal( [ 1 ] );
		} );
	} );

	describe( 'getLastRange()', () => {
		it( 'should return null if no ranges were added', () => {
			expect( selection.getLastRange() ).to.be.null;
		} );

		it( 'should return a range which start position is before all other ranges\' start positions', () => {
			selection.setTo( [ range3, range1, range2 ] );

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
			selection.setTo( [ range3, range1, range2 ] );

			const position = selection.getLastPosition();

			expect( position.path ).to.deep.equal( [ 7 ] );
		} );
	} );

	describe( 'isEqual()', () => {
		it( 'should return true if selections equal', () => {
			selection.setTo( [ range1, range2 ] );

			const otherSelection = new Selection( [ range1, range2 ] );

			expect( selection.isEqual( otherSelection ) ).to.be.true;
		} );

		it( 'should return true if backward selections equal', () => {
			selection.setTo( [ range1 ], { backward: true } );

			const otherSelection = new Selection( [ range1 ], { backward: true } );

			expect( selection.isEqual( otherSelection ) ).to.be.true;
		} );

		it( 'should return true if both selections have no ranges', () => {
			const otherSelection = new Selection();

			expect( selection.isEqual( otherSelection ) ).to.be.true;
		} );

		it( 'should return false if ranges count does not equal', () => {
			selection.setTo( [ range1, range2 ] );

			const otherSelection = new Selection( [ range2 ] );

			expect( selection.isEqual( otherSelection ) ).to.be.false;
		} );

		it( 'should return false if ranges (other than the last added range) do not equal', () => {
			selection.setTo( [ range1, range3 ] );

			const otherSelection = new Selection( [ range2, range3 ] );

			expect( selection.isEqual( otherSelection ) ).to.be.false;
		} );

		it( 'should return false if directions do not equal', () => {
			selection.setTo( range1 );

			const otherSelection = new Selection( [ range1 ], { backward: true } );

			expect( selection.isEqual( otherSelection ) ).to.be.false;
		} );
	} );

	describe( 'setTo - used to collapse at start', () => {
		it( 'should collapse to start position and fire change event', () => {
			selection.setTo( [ range2, range1, range3 ] );

			const spy = sinon.spy();
			selection.on( 'change:range', spy );

			selection.setTo( selection.getFirstPosition() );

			expect( selection.rangeCount ).to.equal( 1 );
			expect( selection.isCollapsed ).to.be.true;
			expect( selection.getFirstPosition().isEqual( range1.start ) ).to.be.true;
			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should do nothing if selection was already collapsed', () => {
			selection.setTo( range1.start );

			const spy = sinon.spy( selection, 'fire' );

			selection.setTo( selection.getFirstPosition() );

			expect( spy.notCalled ).to.be.true;
			spy.restore();
		} );

		it( 'should do nothing if no ranges present', () => {
			const spy = sinon.spy( selection, 'fire' );

			selection.setTo( selection.getFirstPosition() );

			spy.restore();
			expect( spy.notCalled ).to.be.true;
		} );
	} );

	describe( 'setTo - used to collapse at end', () => {
		it( 'should collapse to start position and fire change:range event', () => {
			selection.setTo( [ range2, range3, range1 ] );

			const spy = sinon.spy();
			selection.on( 'change:range', spy );

			selection.setTo( selection.getLastPosition() );

			expect( selection.rangeCount ).to.equal( 1 );
			expect( selection.isCollapsed ).to.be.true;
			expect( selection.getLastPosition().isEqual( range3.end ) ).to.be.true;
			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should do nothing if selection was already collapsed', () => {
			selection.setTo( range1.start );

			const spy = sinon.spy( selection, 'fire' );

			selection.setTo( selection.getLastPosition() );

			expect( spy.notCalled ).to.be.true;
			spy.restore();
		} );

		it( 'should do nothing if selection has no ranges', () => {
			const spy = sinon.spy( selection, 'fire' );

			selection.setTo( selection.getLastPosition() );

			expect( spy.notCalled ).to.be.true;
			spy.restore();
		} );
	} );

	describe( 'getSelectedElement()', () => {
		let schema;

		beforeEach( () => {
			schema = new Schema();
			schema.register( '$root' );
			schema.register( 'p', { allowIn: '$root' } );
			schema.register( '$text', { allowIn: 'p' } );
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
			model.schema.register( 'p', { inheritAllFrom: '$block' } );
			model.schema.register( 'h', { inheritAllFrom: '$block' } );

			model.schema.register( 'blockquote' );
			model.schema.extend( 'blockquote', { allowIn: '$root' } );
			model.schema.extend( '$block', { allowIn: 'blockquote' } );

			model.schema.register( 'imageBlock', {
				allowIn: [ '$root', '$block' ],
				allowChildren: '$text'
			} );

			// Special block which can contain another blocks.
			model.schema.register( 'nestedBlock', { inheritAllFrom: '$block' } );
			model.schema.extend( 'nestedBlock', { allowIn: '$block' } );

			model.schema.register( 'table', { isBlock: true, isLimit: true, isObject: true, allowIn: '$root' } );
			model.schema.register( 'tableRow', { allowIn: 'table', isLimit: true } );
			model.schema.register( 'tableCell', { allowIn: 'tableRow', isLimit: true, isSelectable: true } );

			model.schema.extend( 'p', { allowIn: 'tableCell' } );
		} );

		it( 'returns an iterator', () => {
			setData( model, '<p>a</p><p>[]b</p><p>c</p>' );

			expect( doc.selection.getSelectedBlocks().next ).to.be.a( 'function' );
		} );

		it( 'returns block for a collapsed selection', () => {
			setData( model, '<p>a</p><p>[]b</p><p>c</p>' );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'p#b' ] );
		} );

		it( 'returns block for a collapsed selection (empty block)', () => {
			setData( model, '<p>a</p><p>[]</p><p>c</p>' );

			const blocks = Array.from( doc.selection.getSelectedBlocks() );

			expect( blocks ).to.have.length( 1 );
			expect( blocks[ 0 ].childCount ).to.equal( 0 );
		} );

		it( 'returns block for a non collapsed selection', () => {
			setData( model, '<p>a</p><p>[b]</p><p>c</p>' );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'p#b' ] );
		} );

		it( 'returns two blocks for a non collapsed selection', () => {
			setData( model, '<p>a</p><h>[b</h><p>c]</p><p>d</p>' );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'h#b', 'p#c' ] );
		} );

		it( 'returns one block for a non collapsed selection (starts at block end)', () => {
			setData( model, '<p>a</p><h>b[</h><p>c]</p><p>d</p>' );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'p#c' ] );
		} );

		it( 'returns proper block for a multi-range selection', () => {
			setData( model, '<p>a</p><h>[b</h><p>c]</p><p>d</p><p>[e]</p>' );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'h#b', 'p#c', 'p#e' ] );
		} );

		it( 'does not return a block twice if two ranges are anchored in it', () => {
			setData( model, '<p>[a]b[c]</p>' );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'p#abc' ] );
		} );

		it( 'returns only blocks', () => {
			setData( model, '<p>[a</p><imageBlock>b</imageBlock><p>c]</p>' );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'p#a', 'p#c' ] );
		} );

		it( 'gets deeper into the tree', () => {
			setData( model, '<p>[a</p><blockquote><p>b</p><p>c</p></blockquote><p>d]</p>' );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) )
				.to.deep.equal( [ 'p#a', 'p#b', 'p#c', 'p#d' ] );
		} );

		it( 'gets deeper into the tree (end deeper)', () => {
			setData( model, '<p>[a</p><blockquote><p>b]</p><p>c</p></blockquote><p>d</p>' );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) )
				.to.deep.equal( [ 'p#a', 'p#b' ] );
		} );

		it( 'gets deeper into the tree (start deeper)', () => {
			setData( model, '<p>a</p><blockquote><p>b</p><p>[c</p></blockquote><p>d]</p>' );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) )
				.to.deep.equal( [ 'p#c', 'p#d' ] );
		} );

		it( 'returns an empty array if none of the selected elements is a block', () => {
			setData( model, '<p>a</p><imageBlock>[a</imageBlock><imageBlock>b]</imageBlock><p>b</p>' );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).to.be.empty;
		} );

		it( 'returns an empty array if the selected element is not a block', () => {
			setData( model, '<p>a</p><imageBlock>[]a</imageBlock><p>b</p>' );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).to.be.empty;
		} );

		// Super edge case – should not happen (blocks should never be nested),
		// but since the code handles it already it's worth testing.
		it( 'returns only the lowest block if blocks are nested (case #1)', () => {
			setData( model, '<nestedBlock>a<nestedBlock>[]b</nestedBlock></nestedBlock>' );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'nestedBlock#b' ] );
		} );

		// Like above but - with multiple ranges.
		it( 'returns only the lowest block if blocks are nested (case #2)', () => {
			setData(
				model,
				'<nestedBlock>a<nestedBlock>[b</nestedBlock></nestedBlock>' +
				'<nestedBlock>c<nestedBlock>d]</nestedBlock></nestedBlock>'
			);

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) )
				.to.deep.equal( [ 'nestedBlock#b', 'nestedBlock#d' ] );
		} );

		// Like above but - with multiple collapsed ranges.
		it( 'returns only the lowest block if blocks are nested (case #3)', () => {
			setData(
				model,
				'<nestedBlock>a<nestedBlock>[]b</nestedBlock></nestedBlock>' +
				'<nestedBlock>c<nestedBlock>d[]</nestedBlock></nestedBlock>'
			);

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) )
				.to.deep.equal( [ 'nestedBlock#b', 'nestedBlock#d' ] );
		} );

		it( 'returns nothing if directly in a root', () => {
			doc.createRoot( 'p', 'inlineOnlyRoot' );

			setData( model, 'a[b]c', { rootName: 'inlineOnlyRoot' } );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).to.be.empty;
		} );

		it( 'does not go cross limit elements', () => {
			model.schema.register( 'blk', { allowIn: [ '$root', 'tableCell' ], isObject: true, isBlock: true } );

			setData( model, '<table><tableRow><tableCell><p>foo</p>[<blk></blk><p>bar]</p></tableCell></tableRow></table>' );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'blk', 'p#bar' ] );
		} );

		it( 'returns only top most blocks (multiple selected)', () => {
			setData( model, '<p>[foo</p><table><tableRow><tableCell><p>bar</p></tableCell></tableRow></table><p>baz]</p>' );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'p#foo', 'table', 'p#baz' ] );
		} );

		it( 'returns only top most block (one selected)', () => {
			setData( model, '[<table><tableRow><tableCell><p>bar</p></tableCell></tableRow></table>]' );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'table' ] );
		} );

		it( 'returns only selected blocks even if nested in other blocks', () => {
			setData( model, '<p>foo</p><table><tableRow><tableCell><p>[b]ar</p></tableCell></tableRow></table><p>baz</p>' );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'p#bar' ] );
		} );

		it( 'returns only selected blocks even if nested in other blocks (selection on the block)', () => {
			model.schema.register( 'blk', { allowIn: [ '$root', 'tableCell' ], isObject: true, isBlock: true } );

			setData( model, '<table><tableRow><tableCell><p>foo</p>[<blk></blk><p>bar]</p></tableCell></tableRow></table>' );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).to.deep.equal( [ 'blk', 'p#bar' ] );
		} );
	} );

	describe( 'attributes interface', () => {
		let rangeInFullP;

		beforeEach( () => {
			root._insertChild( 0, [
				new Element( 'p', [], new Text( 'foobar' ) ),
				new Element( 'p', [], [] )
			] );

			rangeInFullP = new Range( new Position( root, [ 0, 4 ] ), new Position( root, [ 0, 4 ] ) );
		} );

		describe( 'setAttribute()', () => {
			it( 'should set given attribute on the selection', () => {
				selection.setTo( [ rangeInFullP ] );
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
				selection.setTo( [ rangeInFullP ] );
				selection.setAttribute( 'foo', 'bar' );
				selection.setAttribute( 'abc', 'xyz' );

				const attrs = Array.from( selection.getAttributes() );

				expect( attrs ).to.deep.equal( [ [ 'foo', 'bar' ], [ 'abc', 'xyz' ] ] );
			} );
		} );

		describe( 'getAttributeKeys()', () => {
			it( 'should return iterator that iterates over all attribute keys set on selection', () => {
				selection.setTo( [ rangeInFullP ] );
				selection.setAttribute( 'foo', 'bar' );
				selection.setAttribute( 'abc', 'xyz' );

				const attrs = Array.from( selection.getAttributeKeys() );

				expect( attrs ).to.deep.equal( [ 'foo', 'abc' ] );
			} );
		} );

		describe( 'hasAttribute()', () => {
			it( 'should return true if element contains attribute with given key', () => {
				selection.setTo( [ rangeInFullP ] );
				selection.setAttribute( 'foo', 'bar' );

				expect( selection.hasAttribute( 'foo' ) ).to.be.true;
			} );

			it( 'should return false if element does not contain attribute with given key', () => {
				expect( selection.hasAttribute( 'abc' ) ).to.be.false;
			} );
		} );

		describe( 'removeAttribute()', () => {
			it( 'should remove attribute', () => {
				selection.setTo( [ rangeInFullP ] );
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
	} );

	describe( 'containsEntireContent()', () => {
		beforeEach( () => {
			model.schema.register( 'p', { inheritAllFrom: '$block' } );
			model.schema.extend( 'p', { allowIn: '$root' } );
		} );

		it( 'returns true if the entire content in $root is selected', () => {
			setData( model, '<p>[Foo</p><p>Bom</p><p>Bar]</p>' );

			expect( doc.selection.containsEntireContent() ).to.equal( true );
		} );

		it( 'returns false when only a fragment of the content in $root is selected', () => {
			setData( model, '<p>Fo[o</p><p>Bom</p><p>Bar]</p>' );

			expect( doc.selection.containsEntireContent() ).to.equal( false );
		} );

		it( 'returns true if the entire content in specified element is selected', () => {
			setData( model, '<p>Foo</p><p>[Bom]</p><p>Bar</p>' );

			const root = doc.getRoot();
			const secondParagraph = root.getNodeByPath( [ 1 ] );

			expect( doc.selection.containsEntireContent( secondParagraph ) ).to.equal( true );
		} );

		it( 'returns false if the entire content in specified element is not selected', () => {
			setData( model, '<p>Foo</p><p>[Bom</p><p>B]ar</p>' );

			const root = doc.getRoot();
			const secondParagraph = root.getNodeByPath( [ 1 ] );

			expect( doc.selection.containsEntireContent( secondParagraph ) ).to.equal( false );
		} );

		it( 'returns false when the entire content except an empty element is selected', () => {
			model.schema.register( 'img', {
				allowIn: 'p'
			} );

			setData( model, '<p><img></img>[Foo]</p>' );

			expect( doc.selection.containsEntireContent() ).to.equal( false );
		} );

		it( 'returns true if the content is empty', () => {
			setData( model, '[]' );

			expect( doc.selection.containsEntireContent() ).to.equal( true );
		} );

		it( 'returns false if empty selection is at the end of non-empty content', () => {
			setData( model, '<p>Foo bar bom.</p>[]' );

			expect( doc.selection.containsEntireContent() ).to.equal( false );
		} );
	} );
} );
