/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Model } from '../../src/model/model.js';
import { ModelElement } from '../../src/model/element.js';
import { ModelText } from '../../src/model/text.js';
import { ModelRange } from '../../src/model/range.js';
import { ModelPosition } from '../../src/model/position.js';
import { ModelLiveRange } from '../../src/model/liverange.js';
import { ModelSelection } from '../../src/model/selection.js';
import { count } from '@ckeditor/ckeditor5-utils';
import { _parseModel, _setModelData } from '../../src/dev-utils/model.js';
import { ModelSchema } from '../../src/model/schema.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

import { stringifyBlocks } from './_utils/utils.js';

describe( 'Selection', () => {
	let model, doc, root, selection, liveRange, range, range1, range2, range3;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
		root = doc.createRoot();
		root._appendChild( [
			new ModelElement( 'p' ),
			new ModelElement( 'p' ),
			new ModelElement( 'p', [], new ModelText( 'foobar' ) ),
			new ModelElement( 'p' ),
			new ModelElement( 'p' ),
			new ModelElement( 'p' ),
			new ModelElement( 'p', [], new ModelText( 'foobar' ) )
		] );
		selection = new ModelSelection();

		liveRange = new ModelLiveRange( new ModelPosition( root, [ 0 ] ), new ModelPosition( root, [ 1 ] ) );
		range = new ModelRange( new ModelPosition( root, [ 2 ] ), new ModelPosition( root, [ 2, 2 ] ) );

		range1 = new ModelRange( new ModelPosition( root, [ 1 ] ), new ModelPosition( root, [ 4 ] ) );
		range2 = new ModelRange( new ModelPosition( root, [ 4 ] ), new ModelPosition( root, [ 5 ] ) );
		range3 = new ModelRange( new ModelPosition( root, [ 6 ] ), new ModelPosition( root, [ 7 ] ) );
	} );

	afterEach( () => {
		model.destroy();
		liveRange.detach();
	} );

	describe( 'constructor()', () => {
		it( 'should be able to create an empty selection', () => {
			const selection = new ModelSelection();

			expect( Array.from( selection.getRanges() ) ).toEqual( [] );
		} );

		it( 'should be able to create a selection from the given ranges', () => {
			const ranges = [ range1, range2, range3 ];
			const selection = new ModelSelection( ranges );

			expect( Array.from( selection.getRanges() ) ).toEqual( ranges );
		} );

		it( 'should be able to create a selection from the given range and isLastBackward flag', () => {
			const selection = new ModelSelection( range1, { backward: true } );

			expect( selection.isBackward ).toBe( true );
			expect( Array.from( selection.getRanges() ) ).toEqual( [ range1 ] );
		} );

		it( 'should be able to create a selection from the given ranges and isLastBackward flag', () => {
			const ranges = new Set( [ range1, range2, range3 ] );
			const selection = new ModelSelection( ranges, { backward: true } );

			expect( selection.isBackward ).toBe( true );
			expect( Array.from( selection.getRanges() ) ).toEqual( [ range1, range2, range3 ] );
		} );

		it( 'should be able to create a selection from the other selection', () => {
			const ranges = [ range1, range2, range3 ];
			const otherSelection = new ModelSelection( ranges, { backward: true } );
			const selection = new ModelSelection( otherSelection );

			expect( selection.isBackward ).toBe( true );
			expect( Array.from( selection.getRanges() ) ).toEqual( [ range1, range2, range3 ] );
		} );

		it( 'should be able to create a selection at the start position of an item', () => {
			const selection = new ModelSelection( root, 0 );
			const focus = selection.focus;

			expect( selection ).toHaveProperty( 'isCollapsed', true );
			expect( focus ).toHaveProperty( 'parent', root );
			expect( focus ).toHaveProperty( 'offset', 0 );
		} );

		it( 'should be able to create a selection before the specified element', () => {
			const selection = new ModelSelection( root.getChild( 1 ), 'before' );
			const focus = selection.focus;

			expect( selection ).toHaveProperty( 'isCollapsed', true );

			expect( focus ).toHaveProperty( 'parent', root );
			expect( focus ).toHaveProperty( 'offset', 1 );
		} );

		it( 'should throw an error if added ranges intersects', () => {
			expectToThrowCKEditorError( () => {
				// eslint-disable-next-line no-new
				new ModelSelection( [
					liveRange,
					new ModelRange(
						new ModelPosition( root, [ 0, 4 ] ),
						new ModelPosition( root, [ 1, 2 ] )
					)
				] );
			}, /model-selection-range-intersects/, model );
		} );

		it( 'should throw an error when trying to set selection to not selectable', () => {
			expectToThrowCKEditorError( () => {
				// eslint-disable-next-line no-new
				new ModelSelection( {} );
			}, 'model-selection-setto-not-selectable' );
		} );
	} );

	describe( 'is()', () => {
		let selection;

		beforeEach( () => {
			selection = new ModelSelection();
		} );

		it( 'should return true for "selection"', () => {
			expect( selection.is( 'selection' ) ).toBe( true );
			expect( selection.is( 'model:selection' ) ).toBe( true );
		} );

		it( 'should return false for incorrect values', () => {
			expect( selection.is( 'model' ) ).toBe( false );
			expect( selection.is( 'model:node' ) ).toBe( false );
			expect( selection.is( '$text' ) ).toBe( false );
			expect( selection.is( '$textProxy' ) ).toBe( false );
			expect( selection.is( 'element' ) ).toBe( false );
			expect( selection.is( 'element', 'paragraph' ) ).toBe( false );
			expect( selection.is( 'documentSelection' ) ).toBe( false );
			expect( selection.is( 'node' ) ).toBe( false );
			expect( selection.is( 'rootElement' ) ).toBe( false );
		} );
	} );

	describe( 'isCollapsed', () => {
		it( 'should return false for empty selection', () => {
			expect( selection.isCollapsed ).toBe( false );
		} );

		it( 'should return true when there is single collapsed ranges', () => {
			selection.setTo( new ModelRange( new ModelPosition( root, [ 0 ] ), new ModelPosition( root, [ 0 ] ) ) );

			expect( selection.isCollapsed ).toBe( true );
		} );

		it( 'should return false when there are multiple ranges', () => {
			selection.setTo( [
				new ModelRange( new ModelPosition( root, [ 0 ] ), new ModelPosition( root, [ 0 ] ) ),
				new ModelRange( new ModelPosition( root, [ 2 ] ), new ModelPosition( root, [ 2 ] ) )
			] );

			expect( selection.isCollapsed ).toBe( false );
		} );

		it( 'should return false when there is not collapsed range', () => {
			selection.setTo( range );

			expect( selection.isCollapsed ).toBe( false );
		} );
	} );

	describe( 'rangeCount', () => {
		it( 'should return proper range count', () => {
			expect( selection.rangeCount ).toBe( 0 );

			selection.setTo( new ModelRange( new ModelPosition( root, [ 0 ] ), new ModelPosition( root, [ 0 ] ) ) );

			expect( selection.rangeCount ).toBe( 1 );

			selection.setTo( [
				new ModelRange( new ModelPosition( root, [ 0 ] ), new ModelPosition( root, [ 0 ] ) ),
				new ModelRange( new ModelPosition( root, [ 2 ] ), new ModelPosition( root, [ 2 ] ) )
			] );

			expect( selection.rangeCount ).toBe( 2 );
		} );
	} );

	describe( 'isBackward', () => {
		it( 'is defined by the last added range', () => {
			selection.setTo( [ range ], { backward: true } );
			expect( selection ).toHaveProperty( 'isBackward', true );

			selection.setTo( liveRange );
			expect( selection ).toHaveProperty( 'isBackward', false );
		} );

		it( 'is false when last range is collapsed', () => {
			const pos = ModelPosition._createAt( root, 0 );

			selection.setTo( pos );

			expect( selection.isBackward ).toBe( false );
		} );
	} );

	describe( 'focus', () => {
		let r1, r2, r3;

		beforeEach( () => {
			r1 = new ModelRange( ModelPosition._createAt( root, 2 ), ModelPosition._createAt( root, 4 ) );
			r2 = new ModelRange( ModelPosition._createAt( root, 4 ), ModelPosition._createAt( root, 6 ) );
			r3 = new ModelRange( ModelPosition._createAt( root, 1 ), ModelPosition._createAt( root, 2 ) );
			selection.setTo( [ r1, r2 ] );
		} );

		it( 'should return correct focus when last added range is not backward one', () => {
			selection.setTo( [ r1, r2, r3 ] );

			expect( selection.focus.isEqual( r3.end ) ).toBe( true );
		} );

		it( 'should return correct focus when last added range is backward one', () => {
			selection.setTo( [ r1, r2, r3 ], { backward: true } );

			expect( selection.focus.isEqual( r3.start ) ).toBe( true );
		} );

		it( 'should return null if no ranges in selection', () => {
			selection.setTo( null );
			expect( selection.focus ).toBeNull();
		} );
	} );

	describe( 'setTo()', () => {
		it( 'should set selection to be same as given selection, using _setRanges method', () => {
			const spy = vi.spyOn( selection, '_setRanges' );

			const otherSelection = new ModelSelection( [ range1, range2 ], { backward: true } );

			selection.setTo( otherSelection );

			expect( Array.from( selection.getRanges() ) ).toEqual( [ range1, range2 ] );
			expect( selection.isBackward ).toBe( true );
			expect( spy ).toHaveBeenCalledOnce();
			spy.mockRestore();
		} );

		it( 'should set selection on the given Range using _setRanges method', () => {
			const spy = vi.spyOn( selection, '_setRanges' );

			selection.setTo( range1 );

			expect( Array.from( selection.getRanges() ) ).toEqual( [ range1 ] );
			expect( selection.isBackward ).toBe( false );
			expect( spy ).toHaveBeenCalledOnce();
			spy.mockRestore();
		} );

		it( 'should set selection on the given iterable of Ranges using _setRanges method', () => {
			const spy = vi.spyOn( selection, '_setRanges' );

			selection.setTo( new Set( [ range1, range2 ] ) );

			expect( Array.from( selection.getRanges() ) ).toEqual( [ range1, range2 ] );
			expect( selection.isBackward ).toBe( false );
			expect( spy ).toHaveBeenCalledOnce();
			spy.mockRestore();
		} );

		it( 'should set collapsed selection on the given Position using _setRanges method', () => {
			const spy = vi.spyOn( selection, '_setRanges' );
			const position = new ModelPosition( root, [ 4 ] );

			selection.setTo( position );

			expect( Array.from( selection.getRanges() ).length ).toBe( 1 );
			expect( Array.from( selection.getRanges() )[ 0 ].start ).toEqual( position );
			expect( selection.isBackward ).toBe( false );
			expect( selection.isCollapsed ).toBe( true );
			expect( spy ).toHaveBeenCalledOnce();
			spy.mockRestore();
		} );

		it( 'should throw an error if added ranges intersects', () => {
			expectToThrowCKEditorError( () => {
				selection.setTo( [
					liveRange,
					new ModelRange(
						new ModelPosition( root, [ 0, 4 ] ),
						new ModelPosition( root, [ 1, 2 ] )
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
			const element = new ModelElement( 'p', null, [ new ModelText( 'foo' ), new ModelText( 'bar' ) ] );

			selection.setTo( element, 'in' );

			const ranges = Array.from( selection.getRanges() );
			expect( ranges.length ).toBe( 1 );
			expect( ranges[ 0 ].start.parent ).toBe( element );
			expect( ranges[ 0 ].start.offset ).toEqual( 0 );
			expect( ranges[ 0 ].end.parent ).toBe( element );
			expect( ranges[ 0 ].end.offset ).toEqual( 6 );
		} );

		it( 'should allow setting selection on an item', () => {
			const textNode1 = new ModelText( 'foo' );
			const textNode2 = new ModelText( 'bar' );
			const textNode3 = new ModelText( 'baz' );
			const element = new ModelElement( 'p', null, [ textNode1, textNode2, textNode3 ] );

			selection.setTo( textNode2, 'on' );

			const ranges = Array.from( selection.getRanges() );
			expect( ranges.length ).toBe( 1 );
			expect( ranges[ 0 ].start.parent ).toBe( element );
			expect( ranges[ 0 ].start.offset ).toEqual( 3 );
			expect( ranges[ 0 ].end.parent ).toBe( element );
			expect( ranges[ 0 ].end.offset ).toEqual( 6 );
		} );

		it( 'should allow setting backward selection on an item', () => {
			const textNode1 = new ModelText( 'foo' );
			const textNode2 = new ModelText( 'bar' );
			const textNode3 = new ModelText( 'baz' );
			const element = new ModelElement( 'p', null, [ textNode1, textNode2, textNode3 ] );

			selection.setTo( textNode2, 'on', { backward: true } );

			const ranges = Array.from( selection.getRanges() );
			expect( ranges.length ).toBe( 1 );
			expect( ranges[ 0 ].start.parent ).toBe( element );
			expect( ranges[ 0 ].start.offset ).toEqual( 3 );
			expect( ranges[ 0 ].end.parent ).toBe( element );
			expect( ranges[ 0 ].end.offset ).toEqual( 6 );
			expect( selection.isBackward ).toBe( true );
		} );

		// TODO - backward
		// TODO - throwing

		describe( 'setting selection to position or item', () => {
			it( 'should fire change:range', () => {
				const spy = vi.fn();

				selection.on( 'change:range', spy );

				selection.setTo( root, 0 );

				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'should throw if second parameter is not passed', () => {
				expectToThrowCKEditorError( () => {
					selection.setTo( root );
				}, 'model-selection-setto-required-second-parameter', model );
			} );

			it( 'should set selection at given offset in given parent', () => {
				selection.setTo( root, 3 );

				expect( selection ).toHaveProperty( 'isCollapsed', true );

				const focus = selection.focus;
				expect( focus ).toHaveProperty( 'parent', root );
				expect( focus ).toHaveProperty( 'offset', 3 );
			} );

			it( 'should set selection at the end of the given parent', () => {
				selection.setTo( root, 'end' );

				expect( selection ).toHaveProperty( 'isCollapsed', true );

				const focus = selection.focus;
				expect( focus ).toHaveProperty( 'parent', root );
				expect( focus ).toHaveProperty( 'offset', root.maxOffset );
			} );

			it( 'should set selection before the specified element', () => {
				selection.setTo( root.getChild( 1 ), 'before' );

				expect( selection ).toHaveProperty( 'isCollapsed', true );

				const focus = selection.focus;
				expect( focus ).toHaveProperty( 'parent', root );
				expect( focus ).toHaveProperty( 'offset', 1 );
			} );

			it( 'should set selection after the specified element', () => {
				selection.setTo( root.getChild( 1 ), 'after' );

				expect( selection ).toHaveProperty( 'isCollapsed', true );

				const focus = selection.focus;
				expect( focus ).toHaveProperty( 'parent', root );
				expect( focus ).toHaveProperty( 'offset', 2 );
			} );

			it( 'should set selection at the specified position', () => {
				const pos = ModelPosition._createAt( root, 3 );

				selection.setTo( pos );

				expect( selection ).toHaveProperty( 'isCollapsed', true );

				const focus = selection.focus;
				expect( focus ).toHaveProperty( 'parent', root );
				expect( focus ).toHaveProperty( 'offset', 3 );
			} );
		} );
	} );

	describe( 'setFocus()', () => {
		it( 'keeps all existing ranges and fires no change:range when no modifications needed', () => {
			selection.setTo( [ range, liveRange ] );

			const spy = vi.fn();
			selection.on( 'change:range', spy );

			selection.setFocus( selection.focus );

			expect( count( selection.getRanges() ) ).toBe( 2 );
			expect( spy.mock.calls.length ).toBe( 0 );
		} );

		it( 'fires change:range', () => {
			selection.setTo( range );

			const spy = vi.fn();
			selection.on( 'change:range', spy );

			selection.setFocus( ModelPosition._createAt( root, 'end' ) );

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'throws if there are no ranges in selection', () => {
			const endPos = ModelPosition._createAt( root, 'end' );

			expectToThrowCKEditorError( () => {
				selection.setFocus( endPos );
			}, 'model-selection-setfocus-no-ranges', model );
		} );

		it( 'modifies existing collapsed selection', () => {
			const startPos = ModelPosition._createAt( root, 1 );
			const endPos = ModelPosition._createAt( root, 2 );

			selection.setTo( startPos );

			selection.setFocus( endPos );

			expect( selection.anchor.compareWith( startPos ) ).toBe( 'same' );
			expect( selection.focus.compareWith( endPos ) ).toBe( 'same' );
		} );

		it( 'makes existing collapsed selection a backward selection', () => {
			const startPos = ModelPosition._createAt( root, 1 );
			const endPos = ModelPosition._createAt( root, 0 );

			selection.setTo( startPos );

			selection.setFocus( endPos );

			expect( selection.anchor.compareWith( startPos ) ).toBe( 'same' );
			expect( selection.focus.compareWith( endPos ) ).toBe( 'same' );
			expect( selection.isBackward ).toBe( true );
		} );

		it( 'modifies existing non-collapsed selection', () => {
			const startPos = ModelPosition._createAt( root, 1 );
			const endPos = ModelPosition._createAt( root, 2 );
			const newEndPos = ModelPosition._createAt( root, 3 );

			selection.setTo( new ModelRange( startPos, endPos ) );

			selection.setFocus( newEndPos );

			expect( selection.anchor.compareWith( startPos ) ).toBe( 'same' );
			expect( selection.focus.compareWith( newEndPos ) ).toBe( 'same' );
		} );

		it( 'makes existing non-collapsed selection a backward selection', () => {
			const startPos = ModelPosition._createAt( root, 1 );
			const endPos = ModelPosition._createAt( root, 2 );
			const newEndPos = ModelPosition._createAt( root, 0 );

			selection.setTo( new ModelRange( startPos, endPos ) );

			selection.setFocus( newEndPos );

			expect( selection.anchor.compareWith( startPos ) ).toBe( 'same' );
			expect( selection.focus.compareWith( newEndPos ) ).toBe( 'same' );
			expect( selection.isBackward ).toBe( true );
		} );

		it( 'makes existing backward selection a forward selection', () => {
			const startPos = ModelPosition._createAt( root, 1 );
			const endPos = ModelPosition._createAt( root, 2 );
			const newEndPos = ModelPosition._createAt( root, 3 );

			selection.setTo( new ModelRange( startPos, endPos ), { backward: true } );

			selection.setFocus( newEndPos );

			expect( selection.anchor.compareWith( endPos ) ).toBe( 'same' );
			expect( selection.focus.compareWith( newEndPos ) ).toBe( 'same' );
			expect( selection.isBackward ).toBe( false );
		} );

		it( 'modifies existing backward selection', () => {
			const startPos = ModelPosition._createAt( root, 1 );
			const endPos = ModelPosition._createAt( root, 2 );
			const newEndPos = ModelPosition._createAt( root, 0 );

			selection.setTo( new ModelRange( startPos, endPos ), { backward: true } );

			selection.setFocus( newEndPos );

			expect( selection.anchor.compareWith( endPos ) ).toBe( 'same' );
			expect( selection.focus.compareWith( newEndPos ) ).toBe( 'same' );
			expect( selection.isBackward ).toBe( true );
		} );

		it( 'modifies only the last range', () => {
			// Offsets are chosen in this way that the order of adding ranges must count, not their document order.
			const startPos1 = ModelPosition._createAt( root, 4 );
			const endPos1 = ModelPosition._createAt( root, 5 );
			const startPos2 = ModelPosition._createAt( root, 1 );
			const endPos2 = ModelPosition._createAt( root, 2 );

			const newEndPos = ModelPosition._createAt( root, 0 );

			selection.setTo( [
				new ModelRange( startPos1, endPos1 ),
				new ModelRange( startPos2, endPos2 )
			] );

			const spy = vi.fn();

			selection.on( 'change:range', spy );

			selection.setFocus( newEndPos );

			const ranges = Array.from( selection.getRanges() );

			expect( ranges ).toHaveLength( 2 );
			expect( ranges[ 0 ].start.compareWith( startPos1 ) ).toBe( 'same' );
			expect( ranges[ 0 ].end.compareWith( endPos1 ) ).toBe( 'same' );

			expect( selection.anchor.compareWith( startPos2 ) ).toBe( 'same' );
			expect( selection.focus.compareWith( newEndPos ) ).toBe( 'same' );
			expect( selection.isBackward ).toBe( true );

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'collapses the selection when extending to the anchor', () => {
			const startPos = ModelPosition._createAt( root, 1 );
			const endPos = ModelPosition._createAt( root, 2 );

			selection.setTo( new ModelRange( startPos, endPos ) );

			selection.setFocus( startPos );

			expect( selection.focus.compareWith( startPos ) ).toBe( 'same' );
			expect( selection.isCollapsed ).toBe( true );
		} );
	} );

	describe( 'setTo - selection set to null', () => {
		let spy;

		it( 'should remove all stored ranges', () => {
			selection.setTo( [ liveRange, range ] );

			selection.setTo( null );

			expect( Array.from( selection.getRanges() ).length ).toBe( 0 );
		} );

		it( 'should fire exactly one change:range event', () => {
			selection.setTo( [ liveRange, range ] );

			spy = vi.fn();
			selection.on( 'change:range', spy );

			selection.setTo( null );

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should not fire change:range event if there were no ranges', () => {
			spy = vi.fn();
			selection.on( 'change:range', spy );

			selection.setTo( null );

			expect( spy ).not.toHaveBeenCalled();
		} );
	} );

	describe( '_setRanges()', () => {
		let newRanges, spy;

		beforeEach( () => {
			newRanges = [
				new ModelRange( new ModelPosition( root, [ 4 ] ), new ModelPosition( root, [ 5 ] ) ),
				new ModelRange( new ModelPosition( root, [ 5, 0 ] ), new ModelPosition( root, [ 6, 0 ] ) )
			];

			selection.setTo( [ liveRange, range ] );

			spy = vi.fn();
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
			expect( ranges ).toEqual( newRanges );
		} );

		it( 'should use last range from given array to get anchor and focus position', () => {
			selection._setRanges( newRanges );
			expect( selection.anchor.path ).toEqual( [ 5, 0 ] );
			expect( selection.focus.path ).toEqual( [ 6, 0 ] );
		} );

		it( 'should acknowledge backward flag when setting anchor and focus', () => {
			selection._setRanges( newRanges, { backward: true } );
			expect( selection.anchor.path ).toEqual( [ 6, 0 ] );
			expect( selection.focus.path ).toEqual( [ 5, 0 ] );
		} );

		it( 'should fire exactly one change:range event', () => {
			selection._setRanges( newRanges );
			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should fire change:range event with correct parameters', () => {
			selection.on( 'change:range', ( evt, data ) => {
				expect( data.directChange ).toBe( true );
			} );

			selection._setRanges( newRanges );
		} );

		it( 'should not fire change:range event if given ranges are the same', () => {
			selection._setRanges( [ liveRange, range ] );
			expect( spy ).not.toHaveBeenCalledOnce();
		} );

		it( 'should copy added ranges and store multiple ranges', () => {
			selection._setRanges( [ liveRange, range ] );

			const ranges = selection._ranges;

			expect( ranges.length ).toBe( 2 );
			expect( ranges[ 0 ].isEqual( liveRange ) ).toBe( true );
			expect( ranges[ 1 ].isEqual( range ) ).toBe( true );
			expect( ranges[ 0 ] ).not.toBe( liveRange );
			expect( ranges[ 1 ] ).not.toBe( range );
		} );

		it( 'should set anchor and focus to the start and end of the last added range', () => {
			selection._setRanges( [ liveRange, range ] );

			expect( selection.anchor.path ).toEqual( [ 2 ] );
			expect( selection.focus.path ).toEqual( [ 2, 2 ] );
		} );

		it( 'should set anchor and focus to the end and start of the most recently added range if backward flag was used', () => {
			selection._setRanges( [ liveRange, range ], { backward: true } );

			expect( selection.anchor.path ).toEqual( [ 2 ] );
			expect( selection.focus.path ).toEqual( [ 2, 2 ] );
		} );
	} );

	describe( 'getFirstRange()', () => {
		it( 'should return null if no ranges were added', () => {
			expect( selection.getFirstRange() ).toBeNull();
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

			expect( range.start.path ).toEqual( [ 1 ] );
			expect( range.end.path ).toEqual( [ 4 ] );
		} );
	} );

	describe( 'getFirstPosition()', () => {
		it( 'should return null if no ranges were added', () => {
			expect( selection.getFirstPosition() ).toBeNull();
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

			expect( position.path ).toEqual( [ 1 ] );
		} );
	} );

	describe( 'getLastRange()', () => {
		it( 'should return null if no ranges were added', () => {
			expect( selection.getLastRange() ).toBeNull();
		} );

		it( 'should return a range which start position is before all other ranges\' start positions', () => {
			selection.setTo( [ range3, range1, range2 ] );

			const range = selection.getLastRange();

			expect( range.start.path ).toEqual( [ 6 ] );
			expect( range.end.path ).toEqual( [ 7 ] );
		} );
	} );

	describe( 'getLastPosition()', () => {
		it( 'should return null if no ranges were added', () => {
			expect( selection.getLastPosition() ).toBeNull();
		} );

		it( 'should return a position that is in selection and is before any other position from the selection', () => {
			selection.setTo( [ range3, range1, range2 ] );

			const position = selection.getLastPosition();

			expect( position.path ).toEqual( [ 7 ] );
		} );
	} );

	describe( 'isEqual()', () => {
		it( 'should return true if selections equal', () => {
			selection.setTo( [ range1, range2 ] );

			const otherSelection = new ModelSelection( [ range1, range2 ] );

			expect( selection.isEqual( otherSelection ) ).toBe( true );
		} );

		it( 'should return true if backward selections equal', () => {
			selection.setTo( [ range1 ], { backward: true } );

			const otherSelection = new ModelSelection( [ range1 ], { backward: true } );

			expect( selection.isEqual( otherSelection ) ).toBe( true );
		} );

		it( 'should return true if both selections have no ranges', () => {
			const otherSelection = new ModelSelection();

			expect( selection.isEqual( otherSelection ) ).toBe( true );
		} );

		it( 'should return false if ranges count does not equal', () => {
			selection.setTo( [ range1, range2 ] );

			const otherSelection = new ModelSelection( [ range2 ] );

			expect( selection.isEqual( otherSelection ) ).toBe( false );
		} );

		it( 'should return false if ranges (other than the last added range) do not equal', () => {
			selection.setTo( [ range1, range3 ] );

			const otherSelection = new ModelSelection( [ range2, range3 ] );

			expect( selection.isEqual( otherSelection ) ).toBe( false );
		} );

		it( 'should return false if directions do not equal', () => {
			selection.setTo( range1 );

			const otherSelection = new ModelSelection( [ range1 ], { backward: true } );

			expect( selection.isEqual( otherSelection ) ).toBe( false );
		} );
	} );

	describe( 'setTo - used to collapse at start', () => {
		it( 'should collapse to start position and fire change event', () => {
			selection.setTo( [ range2, range1, range3 ] );

			const spy = vi.fn();
			selection.on( 'change:range', spy );

			selection.setTo( selection.getFirstPosition() );

			expect( selection.rangeCount ).toBe( 1 );
			expect( selection.isCollapsed ).toBe( true );
			expect( selection.getFirstPosition().isEqual( range1.start ) ).toBe( true );
			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should do nothing if selection was already collapsed', () => {
			selection.setTo( range1.start );

			const spy = vi.spyOn( selection, 'fire' );

			selection.setTo( selection.getFirstPosition() );

			expect( spy ).not.toHaveBeenCalled();
			spy.mockRestore();
		} );

		it( 'should do nothing if no ranges present', () => {
			const spy = vi.spyOn( selection, 'fire' );

			selection.setTo( selection.getFirstPosition() );

			spy.mockRestore();
			expect( spy ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'setTo - used to collapse at end', () => {
		it( 'should collapse to start position and fire change:range event', () => {
			selection.setTo( [ range2, range3, range1 ] );

			const spy = vi.fn();
			selection.on( 'change:range', spy );

			selection.setTo( selection.getLastPosition() );

			expect( selection.rangeCount ).toBe( 1 );
			expect( selection.isCollapsed ).toBe( true );
			expect( selection.getLastPosition().isEqual( range3.end ) ).toBe( true );
			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should do nothing if selection was already collapsed', () => {
			selection.setTo( range1.start );

			const spy = vi.spyOn( selection, 'fire' );

			selection.setTo( selection.getLastPosition() );

			expect( spy ).not.toHaveBeenCalled();
			spy.mockRestore();
		} );

		it( 'should do nothing if selection has no ranges', () => {
			const spy = vi.spyOn( selection, 'fire' );

			selection.setTo( selection.getLastPosition() );

			expect( spy ).not.toHaveBeenCalled();
			spy.mockRestore();
		} );
	} );

	describe( 'getSelectedElement()', () => {
		let schema;

		beforeEach( () => {
			schema = new ModelSchema();
			schema.register( '$root' );
			schema.register( 'p', { allowIn: '$root' } );
			schema.register( '$text', { allowIn: 'p' } );
		} );

		it( 'should return selected element', () => {
			const { selection, model } = _parseModel( '<p>foo</p>[<p>bar</p>]<p>baz</p>', schema );
			const p = model.getChild( 1 );

			expect( selection.getSelectedElement() ).toBe( p );
		} );

		it( 'should return null if there is more than one range', () => {
			const { selection } = _parseModel( '[<p>foo</p>][<p>bar</p>]<p>baz</p>', schema );

			expect( selection.getSelectedElement() ).toBeNull();
		} );

		it( 'should return null if there is no selection', () => {
			expect( selection.getSelectedElement() ).toBeNull();
		} );

		it( 'should return null if selection is not over single element #1', () => {
			const { selection } = _parseModel( '<p>foo</p>[<p>bar</p><p>baz}</p>', schema );

			expect( selection.getSelectedElement() ).toBeNull();
		} );

		it( 'should return null if selection is not over single element #2', () => {
			const { selection } = _parseModel( '<p>{bar}</p>', schema );

			expect( selection.getSelectedElement() ).toBeNull();
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
			_setModelData( model, '<p>a</p><p>[]b</p><p>c</p>' );

			expect( doc.selection.getSelectedBlocks().next ).toBeTypeOf( 'function' );
		} );

		it( 'returns block for a collapsed selection', () => {
			_setModelData( model, '<p>a</p><p>[]b</p><p>c</p>' );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).toEqual( [ 'p#b' ] );
		} );

		it( 'returns block for a collapsed selection (empty block)', () => {
			_setModelData( model, '<p>a</p><p>[]</p><p>c</p>' );

			const blocks = Array.from( doc.selection.getSelectedBlocks() );

			expect( blocks ).toHaveLength( 1 );
			expect( blocks[ 0 ].childCount ).toBe( 0 );
		} );

		it( 'returns block for a non collapsed selection', () => {
			_setModelData( model, '<p>a</p><p>[b]</p><p>c</p>' );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).toEqual( [ 'p#b' ] );
		} );

		it( 'returns two blocks for a non collapsed selection', () => {
			_setModelData( model, '<p>a</p><h>[b</h><p>c]</p><p>d</p>' );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).toEqual( [ 'h#b', 'p#c' ] );
		} );

		it( 'returns one block for a non collapsed selection (starts at block end)', () => {
			_setModelData( model, '<p>a</p><h>b[</h><p>c]</p><p>d</p>' );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).toEqual( [ 'p#c' ] );
		} );

		it( 'returns proper block for a multi-range selection', () => {
			_setModelData( model, '<p>a</p><h>[b</h><p>c]</p><p>d</p><p>[e]</p>' );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).toEqual( [ 'h#b', 'p#c', 'p#e' ] );
		} );

		it( 'does not return a block twice if two ranges are anchored in it', () => {
			_setModelData( model, '<p>[a]b[c]</p>' );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).toEqual( [ 'p#abc' ] );
		} );

		it( 'returns only blocks', () => {
			_setModelData( model, '<p>[a</p><imageBlock>b</imageBlock><p>c]</p>' );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).toEqual( [ 'p#a', 'p#c' ] );
		} );

		it( 'gets deeper into the tree', () => {
			_setModelData( model, '<p>[a</p><blockquote><p>b</p><p>c</p></blockquote><p>d]</p>' );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) )
				.toEqual( [ 'p#a', 'p#b', 'p#c', 'p#d' ] );
		} );

		it( 'gets deeper into the tree (end deeper)', () => {
			_setModelData( model, '<p>[a</p><blockquote><p>b]</p><p>c</p></blockquote><p>d</p>' );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) )
				.toEqual( [ 'p#a', 'p#b' ] );
		} );

		it( 'gets deeper into the tree (start deeper)', () => {
			_setModelData( model, '<p>a</p><blockquote><p>b</p><p>[c</p></blockquote><p>d]</p>' );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) )
				.toEqual( [ 'p#c', 'p#d' ] );
		} );

		it( 'returns an empty array if none of the selected elements is a block', () => {
			_setModelData( model, '<p>a</p><imageBlock>[a</imageBlock><imageBlock>b]</imageBlock><p>b</p>' );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).toEqual( [] );
		} );

		it( 'returns an empty array if the selected element is not a block', () => {
			_setModelData( model, '<p>a</p><imageBlock>[]a</imageBlock><p>b</p>' );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).toEqual( [] );
		} );

		// Super edge case – should not happen (blocks should never be nested),
		// but since the code handles it already it's worth testing.
		it( 'returns only the lowest block if blocks are nested (case #1)', () => {
			_setModelData( model, '<nestedBlock>a<nestedBlock>[]b</nestedBlock></nestedBlock>' );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).toEqual( [ 'nestedBlock#b' ] );
		} );

		// Like above but - with multiple ranges.
		it( 'returns only the lowest block if blocks are nested (case #2)', () => {
			_setModelData(
				model,
				'<nestedBlock>a<nestedBlock>[b</nestedBlock></nestedBlock>' +
				'<nestedBlock>c<nestedBlock>d]</nestedBlock></nestedBlock>'
			);

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) )
				.toEqual( [ 'nestedBlock#b', 'nestedBlock#d' ] );
		} );

		// Like above but - with multiple collapsed ranges.
		it( 'returns only the lowest block if blocks are nested (case #3)', () => {
			_setModelData(
				model,
				'<nestedBlock>a<nestedBlock>[]b</nestedBlock></nestedBlock>' +
				'<nestedBlock>c<nestedBlock>d[]</nestedBlock></nestedBlock>'
			);

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) )
				.toEqual( [ 'nestedBlock#b', 'nestedBlock#d' ] );
		} );

		it( 'returns nothing if directly in a root', () => {
			doc.createRoot( 'p', 'inlineOnlyRoot' );

			_setModelData( model, 'a[b]c', { rootName: 'inlineOnlyRoot' } );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).toEqual( [] );
		} );

		it( 'does not go cross limit elements', () => {
			model.schema.register( 'blk', { allowIn: [ '$root', 'tableCell' ], isObject: true, isBlock: true } );

			_setModelData( model, '<table><tableRow><tableCell><p>foo</p>[<blk></blk><p>bar]</p></tableCell></tableRow></table>' );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).toEqual( [ 'blk', 'p#bar' ] );
		} );

		it( 'returns only top most blocks (multiple selected)', () => {
			_setModelData( model, '<p>[foo</p><table><tableRow><tableCell><p>bar</p></tableCell></tableRow></table><p>baz]</p>' );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).toEqual( [ 'p#foo', 'table', 'p#baz' ] );
		} );

		it( 'returns only top most block (one selected)', () => {
			_setModelData( model, '[<table><tableRow><tableCell><p>bar</p></tableCell></tableRow></table>]' );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).toEqual( [ 'table' ] );
		} );

		it( 'returns only selected blocks even if nested in other blocks', () => {
			_setModelData( model, '<p>foo</p><table><tableRow><tableCell><p>[b]ar</p></tableCell></tableRow></table><p>baz</p>' );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).toEqual( [ 'p#bar' ] );
		} );

		it( 'returns only selected blocks even if nested in other blocks (selection on the block)', () => {
			model.schema.register( 'blk', { allowIn: [ '$root', 'tableCell' ], isObject: true, isBlock: true } );

			_setModelData( model, '<table><tableRow><tableCell><p>foo</p>[<blk></blk><p>bar]</p></tableCell></tableRow></table>' );

			expect( stringifyBlocks( doc.selection.getSelectedBlocks() ) ).toEqual( [ 'blk', 'p#bar' ] );
		} );
	} );

	describe( 'attributes interface', () => {
		let rangeInFullP;

		beforeEach( () => {
			root._insertChild( 0, [
				new ModelElement( 'p', [], new ModelText( 'foobar' ) ),
				new ModelElement( 'p', [], [] )
			] );

			rangeInFullP = new ModelRange( new ModelPosition( root, [ 0, 4 ] ), new ModelPosition( root, [ 0, 4 ] ) );
		} );

		describe( 'setAttribute()', () => {
			it( 'should set given attribute on the selection', () => {
				selection.setTo( [ rangeInFullP ] );
				selection.setAttribute( 'foo', 'bar' );

				expect( selection.getAttribute( 'foo' ) ).toBe( 'bar' );
			} );

			it( 'should fire change:attribute event with correct parameters', () => {
				selection.on( 'change:attribute', ( evt, data ) => {
					expect( data.directChange ).toBe( true );
					expect( data.attributeKeys ).toEqual( [ 'foo' ] );
				} );

				selection.setAttribute( 'foo', 'bar' );
			} );

			it( 'should not fire change:attribute event if attribute with same key and value was already set', () => {
				selection.setAttribute( 'foo', 'bar' );

				const spy = vi.fn();
				selection.on( 'change:attribute', spy );

				selection.setAttribute( 'foo', 'bar' );

				expect( spy ).not.toHaveBeenCalled();
			} );
		} );

		describe( 'getAttribute()', () => {
			it( 'should return undefined if element does not contain given attribute', () => {
				expect( selection.getAttribute( 'abc' ) ).toBeUndefined();
			} );
		} );

		describe( 'getAttributes()', () => {
			it( 'should return an iterator that iterates over all attributes set on selection', () => {
				selection.setTo( [ rangeInFullP ] );
				selection.setAttribute( 'foo', 'bar' );
				selection.setAttribute( 'abc', 'xyz' );

				const attrs = Array.from( selection.getAttributes() );

				expect( attrs ).toEqual( [ [ 'foo', 'bar' ], [ 'abc', 'xyz' ] ] );
			} );
		} );

		describe( 'getAttributeKeys()', () => {
			it( 'should return iterator that iterates over all attribute keys set on selection', () => {
				selection.setTo( [ rangeInFullP ] );
				selection.setAttribute( 'foo', 'bar' );
				selection.setAttribute( 'abc', 'xyz' );

				const attrs = Array.from( selection.getAttributeKeys() );

				expect( attrs ).toEqual( [ 'foo', 'abc' ] );
			} );
		} );

		describe( 'hasAttribute()', () => {
			it( 'should return true if element contains attribute with given key', () => {
				selection.setTo( [ rangeInFullP ] );
				selection.setAttribute( 'foo', 'bar' );

				expect( selection.hasAttribute( 'foo' ) ).toBe( true );
			} );

			it( 'should return false if element does not contain attribute with given key', () => {
				expect( selection.hasAttribute( 'abc' ) ).toBe( false );
			} );
		} );

		describe( 'removeAttribute()', () => {
			it( 'should remove attribute', () => {
				selection.setTo( [ rangeInFullP ] );
				selection.setAttribute( 'foo', 'bar' );
				selection.removeAttribute( 'foo' );

				expect( selection.getAttribute( 'foo' ) ).toBeUndefined();
			} );

			it( 'should fire change:attribute event with correct parameters', () => {
				selection.setAttribute( 'foo', 'bar' );

				selection.on( 'change:attribute', ( evt, data ) => {
					expect( data.directChange ).toBe( true );
					expect( data.attributeKeys ).toEqual( [ 'foo' ] );
				} );

				selection.removeAttribute( 'foo' );
			} );

			it( 'should not fire change:attribute event if such attribute did not exist', () => {
				const spy = vi.fn();
				selection.on( 'change:attribute', spy );

				selection.removeAttribute( 'foo' );

				expect( spy ).not.toHaveBeenCalled();
			} );
		} );
	} );

	describe( 'containsEntireContent()', () => {
		beforeEach( () => {
			model.schema.register( 'p', { inheritAllFrom: '$block' } );
			model.schema.extend( 'p', { allowIn: '$root' } );
		} );

		it( 'returns true if the entire content in $root is selected', () => {
			_setModelData( model, '<p>[Foo</p><p>Bom</p><p>Bar]</p>' );

			expect( doc.selection.containsEntireContent() ).toBe( true );
		} );

		it( 'returns false when only a fragment of the content in $root is selected', () => {
			_setModelData( model, '<p>Fo[o</p><p>Bom</p><p>Bar]</p>' );

			expect( doc.selection.containsEntireContent() ).toBe( false );
		} );

		it( 'returns true if the entire content in specified element is selected', () => {
			_setModelData( model, '<p>Foo</p><p>[Bom]</p><p>Bar</p>' );

			const root = doc.getRoot();
			const secondParagraph = root.getNodeByPath( [ 1 ] );

			expect( doc.selection.containsEntireContent( secondParagraph ) ).toBe( true );
		} );

		it( 'returns false if the entire content in specified element is not selected', () => {
			_setModelData( model, '<p>Foo</p><p>[Bom</p><p>B]ar</p>' );

			const root = doc.getRoot();
			const secondParagraph = root.getNodeByPath( [ 1 ] );

			expect( doc.selection.containsEntireContent( secondParagraph ) ).toBe( false );
		} );

		it( 'returns false when the entire content except an empty element is selected', () => {
			model.schema.register( 'img', {
				allowIn: 'p'
			} );

			_setModelData( model, '<p><img></img>[Foo]</p>' );

			expect( doc.selection.containsEntireContent() ).toBe( false );
		} );

		it( 'returns true if the content is empty', () => {
			_setModelData( model, '[]' );

			expect( doc.selection.containsEntireContent() ).toBe( true );
		} );

		it( 'returns false if empty selection is at the end of non-empty content', () => {
			_setModelData( model, '<p>Foo bar bom.</p>[]' );

			expect( doc.selection.containsEntireContent() ).toBe( false );
		} );
	} );

	describe( 'toJSON()', () => {
		it( 'should serialize ranges', () => {
			selection.setTo( [
				range1,
				range2
			] );

			const json = JSON.stringify( selection );
			const parsed = JSON.parse( json );

			expect( parsed ).toEqual( {
				ranges: [
					{
						start: {
							root: 'main',
							path: [ 1 ],
							stickiness: 'toNext'
						},
						end: {
							root: 'main',
							path: [ 4 ],
							stickiness: 'toPrevious'
						}
					}, {
						start: {
							root: 'main',
							path: [ 4 ],
							stickiness: 'toNext'
						},
						end: {
							root: 'main',
							path: [ 5 ],
							stickiness: 'toPrevious'
						}
					}
				]
			} );
		} );

		it( 'should serialize backward selection', () => {
			selection.setTo( [
				range1
			], {
				backward: true
			} );

			const json = JSON.stringify( selection );
			const parsed = JSON.parse( json );

			expect( parsed ).toEqual( {
				isBackward: true,
				ranges: [
					{
						start: {
							root: 'main',
							path: [ 1 ],
							stickiness: 'toNext'
						},
						end: {
							root: 'main',
							path: [ 4 ],
							stickiness: 'toPrevious'
						}
					}
				]
			} );
		} );

		it( 'should serialize selection attributes', () => {
			selection.setTo( [
				range1
			] );

			selection.setAttribute( 'foo', '3' );
			selection.setAttribute( 'bar', 7 );

			const json = JSON.stringify( selection );
			const parsed = JSON.parse( json );

			expect( parsed ).toEqual( {
				attributes: {
					foo: '3',
					bar: 7
				},
				ranges: [
					{
						start: {
							root: 'main',
							path: [ 1 ],
							stickiness: 'toNext'
						},
						end: {
							root: 'main',
							path: [ 4 ],
							stickiness: 'toPrevious'
						}
					}
				]
			} );
		} );
	} );
} );
