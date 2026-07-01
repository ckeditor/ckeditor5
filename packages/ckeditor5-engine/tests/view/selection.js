/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ViewSelection } from '../../src/view/selection.js';
import { ViewDocumentSelection } from '../../src/view/documentselection.js';
import { ViewRange } from '../../src/view/range.js';
import { ViewDocument } from '../../src/view/document.js';
import { ViewElement } from '../../src/view/element.js';
import { ViewText } from '../../src/view/text.js';
import { ViewPosition } from '../../src/view/position.js';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { count } from '@ckeditor/ckeditor5-utils';
import { createViewRoot } from './_utils/createroot.js';
import { _parseView } from '../../src/dev-utils/view.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';

describe( 'Selection', () => {
	let selection, el, range1, range2, range3, viewDocument;

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	beforeEach( () => {
		viewDocument = new ViewDocument( new StylesProcessor() );

		const text = new ViewText( viewDocument, 'xxxxxxxxxxxxxxxxxxxx' );
		el = new ViewElement( viewDocument, 'p', null, text );

		selection = new ViewSelection();

		range1 = ViewRange._createFromParentsAndOffsets( text, 5, text, 10 );
		range2 = ViewRange._createFromParentsAndOffsets( text, 1, text, 2 );
		range3 = ViewRange._createFromParentsAndOffsets( text, 12, text, 14 );
	} );

	describe( 'constructor()', () => {
		it( 'should be able to create an empty selection', () => {
			const selection = new ViewSelection();

			expect( Array.from( selection.getRanges() ) ).toEqual( [] );
		} );

		it( 'should be able to create a selection from the given ranges', () => {
			const ranges = [ range1, range2, range3 ];
			const selection = new ViewSelection( ranges );

			expect( Array.from( selection.getRanges() ) ).toEqual( ranges );
		} );

		it( 'should be able to create a selection from the given ranges and isLastBackward flag', () => {
			const ranges = [ range1, range2, range3 ];
			const selection = new ViewSelection( ranges, { backward: true } );

			expect( selection.isBackward ).toBe( true );
		} );

		it( 'should be able to create a selection from the given range and isLastBackward flag', () => {
			const selection = new ViewSelection( range1, { backward: true } );

			expect( Array.from( selection.getRanges() ) ).toEqual( [ range1 ] );
			expect( selection.isBackward ).toBe( true );
		} );

		it( 'should be able to create a selection from the given iterable of ranges and isLastBackward flag', () => {
			const ranges = new Set( [ range1, range2, range3 ] );
			const selection = new ViewSelection( ranges, { backward: false } );

			expect( Array.from( selection.getRanges() ) ).toEqual( [ range1, range2, range3 ] );
			expect( selection.isBackward ).toBe( false );
		} );

		it( 'should be able to create a collapsed selection at the given position', () => {
			const position = range1.start;
			const selection = new ViewSelection( position );

			expect( Array.from( selection.getRanges() ).length ).toBe( 1 );
			expect( selection.getFirstRange().start ).toEqual( position );
			expect( selection.getFirstRange().end ).toEqual( position );
			expect( selection.isBackward ).toBe( false );
		} );

		it( 'should be able to create a selection from the other selection', () => {
			const otherSelection = new ViewSelection( [ range2, range3 ], { backward: true } );
			const selection = new ViewSelection( otherSelection );

			expect( Array.from( selection.getRanges() ) ).toEqual( [ range2, range3 ] );
			expect( selection.isBackward ).toBe( true );
		} );

		it( 'should be able to create a selection from the other document selection', () => {
			const otherSelection = new ViewDocumentSelection( [ range2, range3 ], { backward: true } );
			const selection = new ViewSelection( otherSelection );

			expect( Array.from( selection.getRanges() ) ).toEqual( [ range2, range3 ] );
			expect( selection.isBackward ).toBe( true );
		} );

		it( 'should be able to create a fake selection from the other fake selection', () => {
			const otherSelection = new ViewSelection( [ range2, range3 ], { fake: true, label: 'foo bar baz' } );
			const selection = new ViewSelection( otherSelection );

			expect( selection.isFake ).toBe( true );
			expect( selection.fakeSelectionLabel ).toBe( 'foo bar baz' );
		} );

		it( 'should throw an error when range is invalid', () => {
			expectToThrowCKEditorError( () => {
				// eslint-disable-next-line no-new
				new ViewSelection( [ { invalid: 'range' } ] );
			}, /view-selection-add-range-not-range/ );
		} );

		it( 'should throw an error when ranges intersects', () => {
			const text = el.getChild( 0 );
			const range2 = ViewRange._createFromParentsAndOffsets( text, 7, text, 15 );

			expectToThrowCKEditorError( () => {
				// eslint-disable-next-line no-new
				new ViewSelection( [ range1, range2 ] );
			}, 'view-selection-range-intersects' );
		} );

		it( 'should throw an error when trying to set to not selectable', () => {
			expectToThrowCKEditorError( () => {
				// eslint-disable-next-line no-new
				new ViewSelection( {} );
			}, 'view-selection-setto-not-selectable' );
		} );
	} );

	describe( 'anchor', () => {
		it( 'should return null if no ranges in selection', () => {
			expect( selection.anchor ).toBeNull();
		} );

		it( 'should return start of single range in selection', () => {
			selection.setTo( range1 );
			const anchor = selection.anchor;

			expect( anchor.isEqual( range1.start ) ).toBe( true );
			expect( anchor ).not.toBe( range1.start );
		} );

		it( 'should return end of single range in selection when added as backward', () => {
			selection.setTo( range1, { backward: true } );
			const anchor = selection.anchor;

			expect( anchor.isEqual( range1.end ) ).toBe( true );
			expect( anchor ).not.toBe( range1.end );
		} );

		it( 'should get anchor from last inserted range', () => {
			selection.setTo( [ range1, range2 ] );

			expect( selection.anchor.isEqual( range2.start ) ).toBe( true );
		} );
	} );

	describe( 'focus', () => {
		it( 'should return null if no ranges in selection', () => {
			expect( selection.focus ).toBeNull();
		} );

		it( 'should return end of single range in selection', () => {
			selection.setTo( range1 );
			const focus = selection.focus;

			expect( focus.isEqual( range1.end ) ).toBe( true );
		} );

		it( 'should return start of single range in selection when added as backward', () => {
			selection.setTo( range1, { backward: true } );
			const focus = selection.focus;

			expect( focus.isEqual( range1.start ) ).toBe( true );
			expect( focus ).not.toBe( range1.start );
		} );

		it( 'should get focus from last inserted range', () => {
			selection.setTo( [ range1, range2 ] );

			expect( selection.focus.isEqual( range2.end ) ).toBe( true );
		} );
	} );

	describe( 'setFocus()', () => {
		it( 'keeps all existing ranges when no modifications needed', () => {
			selection.setTo( range1 );
			selection.setFocus( selection.focus );

			expect( count( selection.getRanges() ) ).toBe( 1 );
		} );

		it( 'throws if there are no ranges in selection', () => {
			const endPos = ViewPosition._createAt( el, 'end' );

			expectToThrowCKEditorError( () => {
				selection.setFocus( endPos );
			}, 'view-selection-setfocus-no-ranges' );
		} );

		it( 'modifies existing collapsed selection', () => {
			const startPos = ViewPosition._createAt( el, 1 );
			const endPos = ViewPosition._createAt( el, 2 );

			selection.setTo( startPos );

			selection.setFocus( endPos );

			expect( selection.anchor.compareWith( startPos ) ).toBe( 'same' );
			expect( selection.focus.compareWith( endPos ) ).toBe( 'same' );
		} );

		it( 'makes existing collapsed selection a backward selection', () => {
			const startPos = ViewPosition._createAt( el, 1 );
			const endPos = ViewPosition._createAt( el, 0 );

			selection.setTo( startPos );

			selection.setFocus( endPos );

			expect( selection.anchor.compareWith( startPos ) ).toBe( 'same' );
			expect( selection.focus.compareWith( endPos ) ).toBe( 'same' );
			expect( selection.isBackward ).toBe( true );
		} );

		it( 'modifies existing non-collapsed selection', () => {
			const startPos = ViewPosition._createAt( el, 1 );
			const endPos = ViewPosition._createAt( el, 2 );
			const newEndPos = ViewPosition._createAt( el, 3 );

			selection.setTo( new ViewRange( startPos, endPos ) );

			selection.setFocus( newEndPos );

			expect( selection.anchor.compareWith( startPos ) ).toBe( 'same' );
			expect( selection.focus.compareWith( newEndPos ) ).toBe( 'same' );
		} );

		it( 'makes existing non-collapsed selection a backward selection', () => {
			const startPos = ViewPosition._createAt( el, 1 );
			const endPos = ViewPosition._createAt( el, 2 );
			const newEndPos = ViewPosition._createAt( el, 0 );

			selection.setTo( new ViewRange( startPos, endPos ) );

			selection.setFocus( newEndPos );

			expect( selection.anchor.compareWith( startPos ) ).toBe( 'same' );
			expect( selection.focus.compareWith( newEndPos ) ).toBe( 'same' );
			expect( selection.isBackward ).toBe( true );
		} );

		it( 'makes existing backward selection a forward selection', () => {
			const startPos = ViewPosition._createAt( el, 1 );
			const endPos = ViewPosition._createAt( el, 2 );
			const newEndPos = ViewPosition._createAt( el, 3 );

			selection.setTo( new ViewRange( startPos, endPos ), { backward: true } );

			selection.setFocus( newEndPos );

			expect( selection.anchor.compareWith( endPos ) ).toBe( 'same' );
			expect( selection.focus.compareWith( newEndPos ) ).toBe( 'same' );
			expect( selection.isBackward ).toBe( false );
		} );

		it( 'modifies existing backward selection', () => {
			const startPos = ViewPosition._createAt( el, 1 );
			const endPos = ViewPosition._createAt( el, 2 );
			const newEndPos = ViewPosition._createAt( el, 0 );

			selection.setTo( new ViewRange( startPos, endPos ), { backward: true } );

			selection.setFocus( newEndPos );

			expect( selection.anchor.compareWith( endPos ) ).toBe( 'same' );
			expect( selection.focus.compareWith( newEndPos ) ).toBe( 'same' );
			expect( selection.isBackward ).toBe( true );
		} );

		it( 'modifies only the last range', () => {
			// Offsets are chosen in this way that the order of adding ranges must count, not their document order.
			const startPos1 = ViewPosition._createAt( el, 4 );
			const endPos1 = ViewPosition._createAt( el, 5 );
			const startPos2 = ViewPosition._createAt( el, 1 );
			const endPos2 = ViewPosition._createAt( el, 2 );

			const newEndPos = ViewPosition._createAt( el, 0 );

			selection.setTo( [
				new ViewRange( startPos1, endPos1 ),
				new ViewRange( startPos2, endPos2 )
			] );

			selection.setFocus( newEndPos );

			const ranges = Array.from( selection.getRanges() );

			expect( ranges ).toHaveLength( 2 );
			expect( ranges[ 0 ].start.compareWith( startPos1 ) ).toBe( 'same' );
			expect( ranges[ 0 ].end.compareWith( endPos1 ) ).toBe( 'same' );

			expect( selection.anchor.compareWith( startPos2 ) ).toBe( 'same' );
			expect( selection.focus.compareWith( newEndPos ) ).toBe( 'same' );
			expect( selection.isBackward ).toBe( true );
		} );

		it( 'collapses the selection when extending to the anchor', () => {
			const startPos = ViewPosition._createAt( el, 1 );
			const endPos = ViewPosition._createAt( el, 2 );

			selection.setTo( new ViewRange( startPos, endPos ) );

			selection.setFocus( startPos );

			expect( selection.focus.compareWith( startPos ) ).toBe( 'same' );
			expect( selection.isCollapsed ).toBe( true );
		} );
	} );

	describe( 'isCollapsed', () => {
		it( 'should return true when there is single collapsed range', () => {
			const range = ViewRange._createFromParentsAndOffsets( el, 5, el, 5 );
			selection.setTo( range );

			expect( selection.isCollapsed ).toBe( true );
		} );

		it( 'should return false when there are multiple ranges', () => {
			const range1 = ViewRange._createFromParentsAndOffsets( el, 5, el, 5 );
			const range2 = ViewRange._createFromParentsAndOffsets( el, 15, el, 15 );
			selection.setTo( [ range1, range2 ] );

			expect( selection.isCollapsed ).toBe( false );
		} );

		it( 'should return false when there is not collapsed range', () => {
			const range = ViewRange._createFromParentsAndOffsets( el, 15, el, 16 );
			selection.setTo( range );

			expect( selection.isCollapsed ).toBe( false );
		} );
	} );

	describe( 'rangeCount', () => {
		it( 'should return proper range count', () => {
			expect( selection.rangeCount ).toBe( 0 );

			selection.setTo( range1 );

			expect( selection.rangeCount ).toBe( 1 );

			selection.setTo( [ range1, range2 ] );

			expect( selection.rangeCount ).toBe( 2 );
		} );
	} );

	describe( 'isBackward', () => {
		it( 'is defined by the last added range', () => {
			const range1 = ViewRange._createFromParentsAndOffsets( el, 5, el, 10 );
			const range2 = ViewRange._createFromParentsAndOffsets( el, 15, el, 16 );

			selection.setTo( range1, { backward: true } );
			expect( selection.isBackward ).toBe( true );

			selection.setTo( [ range1, range2 ] );
			expect( selection.isBackward ).toBe( false );
		} );

		it( 'is false when last range is collapsed', () => {
			const range = ViewRange._createFromParentsAndOffsets( el, 5, el, 5 );

			selection.setTo( range, { backward: true } );

			expect( selection.isBackward ).toBe( false );
		} );
	} );

	describe( 'getRanges', () => {
		it( 'should return iterator with copies of all ranges', () => {
			selection.setTo( [ range1, range2 ] );

			const iterable = selection.getRanges();
			const ranges = Array.from( iterable );

			expect( ranges.length ).toBe( 2 );
			expect( ranges[ 0 ].isEqual( range1 ) ).toBe( true );
			expect( ranges[ 0 ] ).not.toBe( range1 );
			expect( ranges[ 1 ].isEqual( range2 ) ).toBe( true );
			expect( ranges[ 1 ] ).not.toBe( range2 );
		} );
	} );

	describe( 'getFirstRange', () => {
		it( 'should return copy of range with first position', () => {
			selection.setTo( [ range1, range2, range3 ] );

			const range = selection.getFirstRange();

			expect( range.isEqual( range2 ) ).toBe( true );
			expect( range ).not.toBe( range2 );
		} );

		it( 'should return null if no ranges are present', () => {
			expect( selection.getFirstRange() ).toBeNull();
		} );
	} );

	describe( 'getLastRange', () => {
		it( 'should return copy of range with last position', () => {
			selection.setTo( [ range1, range2, range3 ] );

			const range = selection.getLastRange();

			expect( range.isEqual( range3 ) ).toBe( true );
			expect( range ).not.toBe( range3 );
		} );

		it( 'should return null if no ranges are present', () => {
			expect( selection.getLastRange() ).toBeNull();
		} );
	} );

	describe( 'getFirstPosition', () => {
		it( 'should return copy of first position', () => {
			selection.setTo( [ range1, range2, range3 ] );

			const position = selection.getFirstPosition();

			expect( position.isEqual( range2.start ) ).toBe( true );
			expect( position ).not.toBe( range2.start );
		} );

		it( 'should return null if no ranges are present', () => {
			expect( selection.getFirstPosition() ).toBeNull();
		} );
	} );

	describe( 'getLastPosition', () => {
		it( 'should return copy of range with last position', () => {
			selection.setTo( [ range1, range2, range3 ] );

			const position = selection.getLastPosition();

			expect( position.isEqual( range3.end ) ).toBe( true );
			expect( position ).not.toBe( range3.end );
		} );

		it( 'should return null if no ranges are present', () => {
			expect( selection.getLastPosition() ).toBeNull();
		} );
	} );

	describe( 'isEqual', () => {
		it( 'should return true if selections equal', () => {
			selection.setTo( [ range1, range2 ] );

			const otherSelection = new ViewSelection();
			otherSelection.setTo( [ range1, range2 ] );

			expect( selection.isEqual( otherSelection ) ).toBe( true );
		} );

		it( 'should return true if backward selections equal', () => {
			selection.setTo( range1, { backward: true } );

			const otherSelection = new ViewSelection( [ range1 ], { backward: true } );

			expect( selection.isEqual( otherSelection ) ).toBe( true );
		} );

		it( 'should return false if ranges count does not equal', () => {
			selection.setTo( [ range1, range2 ] );

			const otherSelection = new ViewSelection( [ range1 ] );

			expect( selection.isEqual( otherSelection ) ).toBe( false );
		} );

		it( 'should return false if ranges (other than the last added one) do not equal', () => {
			selection.setTo( [ range1, range3 ] );

			const otherSelection = new ViewSelection( [ range2, range3 ] );

			expect( selection.isEqual( otherSelection ) ).toBe( false );
		} );

		it( 'should return false if directions do not equal', () => {
			selection.setTo( range1 );

			const otherSelection = new ViewSelection( [ range1 ], { backward: true } );

			expect( selection.isEqual( otherSelection ) ).toBe( false );
		} );

		it( 'should return false if one selection is fake', () => {
			const otherSelection = new ViewSelection( null, { fake: true } );

			expect( selection.isEqual( otherSelection ) ).toBe( false );
		} );

		it( 'should return true if both selection are fake', () => {
			const otherSelection = new ViewSelection( range1, { fake: true } );
			selection.setTo( range1, { fake: true } );

			expect( selection.isEqual( otherSelection ) ).toBe( true );
		} );

		it( 'should return false if both selection are fake but have different label', () => {
			const otherSelection = new ViewSelection( [ range1 ], { fake: true, label: 'foo bar baz' } );
			selection.setTo( range1, { fake: true, label: 'foo' } );

			expect( selection.isEqual( otherSelection ) ).toBe( false );
		} );

		it( 'should return true if both selections are empty', () => {
			const otherSelection = new ViewSelection();

			expect( selection.isEqual( otherSelection ) ).toBe( true );
		} );
	} );

	describe( 'isSimilar', () => {
		it( 'should return true if selections equal', () => {
			selection.setTo( [ range1, range2 ] );

			const otherSelection = new ViewSelection( [ range1, range2 ] );

			expect( selection.isSimilar( otherSelection ) ).toBe( true );
		} );

		it( 'should return false if ranges count does not equal', () => {
			selection.setTo( [ range1, range2 ] );

			const otherSelection = new ViewSelection( [ range1 ] );

			expect( selection.isSimilar( otherSelection ) ).toBe( false );
		} );

		it( 'should return false if trimmed ranges (other than the last added one) are not equal', () => {
			selection.setTo( [ range1, range3 ] );

			const otherSelection = new ViewSelection( [ range2, range3 ] );

			expect( selection.isSimilar( otherSelection ) ).toBe( false );
		} );

		it( 'should return false if directions are not equal', () => {
			selection.setTo( range1 );

			const otherSelection = new ViewSelection( [ range1 ], { backward: true } );

			expect( selection.isSimilar( otherSelection ) ).toBe( false );
		} );

		it( 'should return true if both selections are empty', () => {
			const otherSelection = new ViewSelection();

			expect( selection.isSimilar( otherSelection ) ).toBe( true );
		} );

		it( 'should return true if all ranges trimmed from both selections are equal', () => {
			const view = _parseView(
				'<container:p><attribute:span></attribute:span></container:p>' +
				'<container:p><attribute:span>xx</attribute:span></container:p>'
			);

			const p1 = view.getChild( 0 );
			const p2 = view.getChild( 1 );
			const span1 = p1.getChild( 0 );
			const span2 = p2.getChild( 0 );

			// <p>[<span>{]</span>}</p><p>[<span>{xx}</span>]</p>
			const rangeA1 = ViewRange._createFromParentsAndOffsets( p1, 0, span1, 0 );
			const rangeB1 = ViewRange._createFromParentsAndOffsets( span1, 0, p1, 1 );
			const rangeA2 = ViewRange._createFromParentsAndOffsets( p2, 0, p2, 1 );
			const rangeB2 = ViewRange._createFromParentsAndOffsets( span2, 0, span2, 1 );

			selection.setTo( [ rangeA1, rangeA2 ] );

			const otherSelection = new ViewSelection( [ rangeB2, rangeB1 ] );

			expect( selection.isSimilar( otherSelection ) ).toBe( true );
			expect( otherSelection.isSimilar( selection ) ).toBe( true );

			expect( selection.isEqual( otherSelection ) ).toBe( false );
			expect( otherSelection.isEqual( selection ) ).toBe( false );
		} );
	} );

	describe( 'is()', () => {
		it( 'should return true for selection', () => {
			expect( selection.is( 'selection' ) ).toBe( true );
			expect( selection.is( 'view:selection' ) ).toBe( true );
		} );

		it( 'should return false for other values', () => {
			expect( selection.is( 'documentSelection' ) ).toBe( false );
			expect( selection.is( 'view:documentSelection' ) ).toBe( false );
			expect( selection.is( 'node' ) ).toBe( false );
			expect( selection.is( '$text' ) ).toBe( false );
			expect( selection.is( '$textProxy' ) ).toBe( false );
			expect( selection.is( 'element' ) ).toBe( false );
			expect( selection.is( 'rootElement' ) ).toBe( false );
			expect( selection.is( 'model:selection' ) ).toBe( false );
		} );
	} );

	describe( 'setTo()', () => {
		describe( 'simple scenarios', () => {
			it( 'should set selection ranges from the given selection', () => {
				selection.setTo( range1 );

				const otherSelection = new ViewSelection( [ range2, range3 ], { backward: true } );

				selection.setTo( otherSelection );

				expect( selection.rangeCount ).toBe( 2 );
				expect( selection._ranges[ 0 ].isEqual( range2 ) ).toBe( true );
				expect( selection._ranges[ 0 ] ).not.toBe( range2 );
				expect( selection._ranges[ 1 ].isEqual( range3 ) ).toBe( true );
				expect( selection._ranges[ 1 ] ).not.toBe( range3 );

				expect( selection.anchor.isEqual( range3.end ) ).toBe( true );
			} );

			it( 'should set selection on the given Range', () => {
				selection.setTo( range1 );

				expect( Array.from( selection.getRanges() ) ).toEqual( [ range1 ] );
				expect( selection.isBackward ).toBe( false );
			} );

			it( 'should set selection on the given iterable of Ranges', () => {
				selection.setTo( new Set( [ range1, range2 ] ) );

				expect( Array.from( selection.getRanges() ) ).toEqual( [ range1, range2 ] );
				expect( selection.isBackward ).toBe( false );
			} );

			it( 'should set collapsed selection on the given Position', () => {
				selection.setTo( range1.start );

				expect( Array.from( selection.getRanges() ).length ).toBe( 1 );
				expect( Array.from( selection.getRanges() )[ 0 ].start ).toEqual( range1.start );
				expect( selection.isBackward ).toBe( false );
				expect( selection.isCollapsed ).toBe( true );
			} );

			it( 'should fire change event', () => {
				return new Promise( resolve => {
					selection.on( 'change', () => {
						expect( selection.rangeCount ).toBe( 1 );
						expect( selection.getFirstRange().isEqual( range1 ) ).toBe( true );
						resolve();
					} );

					const otherSelection = new ViewSelection( [ range1 ] );

					selection.setTo( otherSelection );
				} );
			} );

			it( 'should set fake state and label', () => {
				const label = 'foo bar baz';
				const otherSelection = new ViewSelection( null, { fake: true, label } );
				selection.setTo( otherSelection );

				expect( selection.isFake ).toBe( true );
				expect( selection.fakeSelectionLabel ).toBe( label );
			} );

			it( 'should throw an error when trying to set to not selectable', () => {
				const otherSelection = new ViewSelection();

				expectToThrowCKEditorError( () => {
					otherSelection.setTo( {} );
				}, 'view-selection-setto-not-selectable' );
			} );

			it( 'should throw an error when trying to set to not selectable #2', () => {
				const otherSelection = new ViewSelection();

				expectToThrowCKEditorError( () => {
					otherSelection.setTo();
				}, 'view-selection-setto-not-selectable' );
			} );
		} );

		describe( 'setting collapsed selection', () => {
			beforeEach( () => {
				selection.setTo( [ range1, range2 ] );
			} );

			it( 'should collapse selection at position', () => {
				const position = new ViewPosition( el, 4 );

				selection.setTo( position );
				const range = selection.getFirstRange();

				expect( range.start.parent ).toBe( el );
				expect( range.start.offset ).toBe( 4 );
				expect( range.start.isEqual( range.end ) ).toBe( true );
			} );

			it( 'should collapse selection at node and offset', () => {
				const foo = new ViewText( viewDocument, 'foo' );
				const p = new ViewElement( viewDocument, 'p', null, foo );

				selection.setTo( foo, 0 );
				let range = selection.getFirstRange();

				expect( range.start.parent ).toBe( foo );
				expect( range.start.offset ).toBe( 0 );
				expect( range.start.isEqual( range.end ) ).toBe( true );

				selection.setTo( p, 1 );
				range = selection.getFirstRange();

				expect( range.start.parent ).toBe( p );
				expect( range.start.offset ).toBe( 1 );
				expect( range.start.isEqual( range.end ) ).toBe( true );
			} );

			it( 'should throw an error when the second parameter is not passed and first is an item', () => {
				const foo = new ViewText( viewDocument, 'foo' );

				expectToThrowCKEditorError( () => {
					selection.setTo( foo );
				}, 'view-selection-setto-required-second-parameter' );
			} );

			it( 'should collapse selection at node and flag', () => {
				const foo = new ViewText( viewDocument, 'foo' );
				const p = new ViewElement( viewDocument, 'p', null, foo );

				selection.setTo( foo, 'end' );
				let range = selection.getFirstRange();

				expect( range.start.parent ).toBe( foo );
				expect( range.start.offset ).toBe( 3 );
				expect( range.start.isEqual( range.end ) ).toBe( true );

				selection.setTo( foo, 'before' );
				range = selection.getFirstRange();

				expect( range.start.parent ).toBe( p );
				expect( range.start.offset ).toBe( 0 );
				expect( range.start.isEqual( range.end ) ).toBe( true );

				selection.setTo( foo, 'after' );
				range = selection.getFirstRange();

				expect( range.start.parent ).toBe( p );
				expect( range.start.offset ).toBe( 1 );
				expect( range.start.isEqual( range.end ) ).toBe( true );
			} );
		} );

		describe( 'setting collapsed selection at start', () => {
			it( 'should collapse to start position and fire change event', () => {
				return new Promise( resolve => {
					selection.setTo( [ range1, range2, range3 ] );
					selection.once( 'change', () => {
						expect( selection.rangeCount ).toBe( 1 );
						expect( selection.isCollapsed ).toBe( true );
						expect( selection._ranges[ 0 ].start.isEqual( range2.start ) ).toBe( true );
						resolve();
					} );

					selection.setTo( selection.getFirstPosition() );
				} );
			} );
		} );

		describe( 'setting collapsed selection to end', () => {
			it( 'should collapse to end position and fire change event', () => {
				return new Promise( resolve => {
					selection.setTo( [ range1, range2, range3 ] );
					selection.once( 'change', () => {
						expect( selection.rangeCount ).toBe( 1 );
						expect( selection.isCollapsed ).toBe( true );
						expect( selection._ranges[ 0 ].end.isEqual( range3.end ) ).toBe( true );
						resolve();
					} );

					selection.setTo( selection.getLastPosition() );
				} );
			} );
		} );

		describe( 'removing all ranges', () => {
			it( 'should remove all ranges and fire change event', () => {
				return new Promise( resolve => {
					selection.setTo( [ range1, range2 ] );

					selection.once( 'change', () => {
						expect( selection.rangeCount ).toBe( 0 );
						resolve();
					} );

					selection.setTo( null );
				} );
			} );
		} );

		describe( 'setting fake selection', () => {
			it( 'should allow to set selection to fake', () => {
				selection.setTo( range1, { fake: true } );

				expect( selection.isFake ).toBe( true );
			} );

			it( 'should allow to set fake selection label', () => {
				const label = 'foo bar baz';
				selection.setTo( range1, { fake: true, label } );

				expect( selection.fakeSelectionLabel ).toBe( label );
			} );

			it( 'should not set label when set to false', () => {
				const label = 'foo bar baz';
				selection.setTo( range1, { fake: false, label } );

				expect( selection.fakeSelectionLabel ).toBe( '' );
			} );

			it( 'should reset label when set to false', () => {
				const label = 'foo bar baz';
				selection.setTo( range1, { fake: true, label } );
				selection.setTo( range1 );

				expect( selection.fakeSelectionLabel ).toBe( '' );
			} );

			it( 'should fire change event', () => {
				return new Promise( resolve => {
					selection.once( 'change', () => {
						expect( selection.isFake ).toBe( true );
						expect( selection.fakeSelectionLabel ).toBe( 'foo bar baz' );

						resolve();
					} );

					selection.setTo( range1, { fake: true, label: 'foo bar baz' } );
				} );
			} );

			it( 'should be possible to create an empty fake selection', () => {
				selection.setTo( null, { fake: true, label: 'foo bar baz' } );

				expect( selection.fakeSelectionLabel ).toBe( 'foo bar baz' );
				expect( selection.isFake ).toBe( true );
			} );
		} );

		describe( 'setting selection to itself', () => {
			it( 'should correctly set ranges when setting to the same selection', () => {
				selection.setTo( [ range1, range2 ] );
				selection.setTo( selection );

				const ranges = Array.from( selection.getRanges() );
				expect( ranges.length ).toBe( 2 );

				expect( ranges[ 0 ].isEqual( range1 ) ).toBe( true );
				expect( ranges[ 1 ].isEqual( range2 ) ).toBe( true );
			} );

			it( 'should correctly set ranges when setting to the same selection\'s ranges', () => {
				selection.setTo( [ range1, range2 ] );
				selection.setTo( selection.getRanges() );

				const ranges = Array.from( selection.getRanges() );
				expect( ranges.length ).toBe( 2 );

				expect( ranges[ 0 ].isEqual( range1 ) ).toBe( true );
				expect( ranges[ 1 ].isEqual( range2 ) ).toBe( true );
			} );
		} );

		describe( 'throwing errors', () => {
			it( 'should throw an error when range is invalid', () => {
				expectToThrowCKEditorError( () => {
					selection.setTo( [ { invalid: 'range' } ] );
				}, /view-selection-add-range-not-range/ );
			} );

			it( 'should throw when range is intersecting with already added range', () => {
				const text = el.getChild( 0 );
				const range2 = ViewRange._createFromParentsAndOffsets( text, 7, text, 15 );

				expectToThrowCKEditorError( () => {
					selection.setTo( [ range1, range2 ] );
				}, 'view-selection-range-intersects' );
			} );
		} );

		it( 'should allow setting selection on an item', () => {
			const textNode1 = new ViewText( viewDocument, 'foo' );
			const textNode2 = new ViewText( viewDocument, 'bar' );
			const textNode3 = new ViewText( viewDocument, 'baz' );
			const element = new ViewElement( viewDocument, 'p', null, [ textNode1, textNode2, textNode3 ] );

			selection.setTo( textNode2, 'on' );

			const ranges = Array.from( selection.getRanges() );
			expect( ranges.length ).toBe( 1 );
			expect( ranges[ 0 ].start.parent ).toBe( element );
			expect( ranges[ 0 ].start.offset ).toEqual( 1 );
			expect( ranges[ 0 ].end.parent ).toBe( element );
			expect( ranges[ 0 ].end.offset ).toEqual( 2 );
		} );

		it( 'should allow setting selection inside an element', () => {
			const element = new ViewElement(
				viewDocument, 'p', null, [ new ViewText( viewDocument, 'foo' ), new ViewText( viewDocument, 'bar' ) ]
			);

			selection.setTo( element, 'in' );

			const ranges = Array.from( selection.getRanges() );
			expect( ranges.length ).toBe( 1 );
			expect( ranges[ 0 ].start.parent ).toBe( element );
			expect( ranges[ 0 ].start.offset ).toEqual( 0 );
			expect( ranges[ 0 ].end.parent ).toBe( element );
			expect( ranges[ 0 ].end.offset ).toEqual( 2 );
		} );

		it( 'should allow setting backward selection inside an element', () => {
			const element = new ViewElement(
				viewDocument, 'p', null, [ new ViewText( viewDocument, 'foo' ), new ViewText( viewDocument, 'bar' ) ]
			);

			selection.setTo( element, 'in', { backward: true } );

			const ranges = Array.from( selection.getRanges() );
			expect( ranges.length ).toBe( 1 );
			expect( ranges[ 0 ].start.parent ).toBe( element );
			expect( ranges[ 0 ].start.offset ).toEqual( 0 );
			expect( ranges[ 0 ].end.parent ).toBe( element );
			expect( ranges[ 0 ].end.offset ).toEqual( 2 );
			expect( selection.isBackward ).toBe( true );
		} );
	} );

	describe( 'getEditableElement()', () => {
		it( 'should return null if no ranges in selection', () => {
			expect( selection.editableElement ).toBeNull();
		} );

		it( 'should return null if selection is placed in container that is not ViewEditableElement', () => {
			selection.setTo( range1 );

			expect( selection.editableElement ).toBeNull();
		} );

		it( 'should return ViewEditableElement when selection is placed inside', () => {
			selection.setTo( viewDocument.selection );
			const root = createViewRoot( viewDocument, 'div', 'main' );
			const element = new ViewElement( viewDocument, 'p' );
			root._appendChild( element );

			selection.setTo( ViewRange._createFromParentsAndOffsets( element, 0, element, 0 ) );

			expect( selection.editableElement ).toBe( root );
		} );
	} );

	describe( 'isFake', () => {
		it( 'should be false for newly created instance', () => {
			expect( selection.isFake ).toBe( false );
		} );
	} );

	describe( 'getSelectedElement()', () => {
		it( 'should return selected element', () => {
			const { selection: docSelection, view } = _parseView( 'foo [<b>bar</b>] baz' );
			const b = view.getChild( 1 );
			const selection = new ViewSelection( docSelection );

			expect( selection.getSelectedElement() ).toBe( b );
		} );

		it( 'should return selected element if the selection is anchored at the end/at the beginning of a text node', () => {
			const { selection: docSelection, view } = _parseView( 'foo {<b>bar</b>} baz' );
			const b = view.getChild( 1 );
			const selection = new ViewSelection( docSelection );

			expect( selection.getSelectedElement() ).toBe( b );
		} );

		it( 'should return null if there is more than one range', () => {
			const { selection: docSelection } = _parseView( 'foo [<b>bar</b>] [<i>baz</i>]' );
			const selection = new ViewSelection( docSelection );

			expect( selection.getSelectedElement() ).toBeNull();
		} );

		it( 'should return null if there is no selection', () => {
			expect( selection.getSelectedElement() ).toBeNull();
		} );

		it( 'should return null if selection is not over single element #1', () => {
			const { selection: docSelection } = _parseView( 'foo [<b>bar</b> ba}z' );
			const selection = new ViewSelection( docSelection );

			expect( selection.getSelectedElement() ).toBeNull();
		} );

		it( 'should return null if selection is not over single element #2', () => {
			const { selection: docSelection } = _parseView( 'foo <b>{bar}</b> baz' );
			const selection = new ViewSelection( docSelection );

			expect( selection.getSelectedElement() ).toBeNull();
		} );
	} );

	describe( 'toJSON()', () => {
		it( 'should provide ranges', () => {
			const { selection: docSelection } = _parseView( 'f{oo <b>ba}r</b> baz' );
			const selection = new ViewSelection( docSelection );

			const json = JSON.stringify( selection );
			const parsed = JSON.parse( json );

			expect( parsed ).toEqual( {
				ranges: [
					{
						start: {
							offset: 1,
							parent: {
								data: 'foo ',
								path: [ 0 ],
								type: 'Text'
							}
						},
						end: {
							offset: 2,
							parent: {
								data: 'bar',
								path: [ 1, 0 ],
								type: 'Text'
							}
						}
					}
				]
			} );
		} );

		it( 'should provide isBackward flag', () => {
			const { selection: docSelection } = _parseView( 'f{oo <b>ba}r</b> baz' );
			const selection = new ViewSelection( docSelection.getRanges(), { backward: true } );

			const json = JSON.stringify( selection );
			const parsed = JSON.parse( json );

			expect( parsed ).toEqual( {
				isBackward: true,
				ranges: [
					{
						start: {
							offset: 1,
							parent: {
								data: 'foo ',
								path: [ 0 ],
								type: 'Text'
							}
						},
						end: {
							offset: 2,
							parent: {
								data: 'bar',
								path: [ 1, 0 ],
								type: 'Text'
							}
						}
					}
				]
			} );
		} );

		it( 'should provide isFake flag', () => {
			const { selection: docSelection } = _parseView( 'f{oo <b>ba}r</b> baz' );
			const selection = new ViewSelection( docSelection.getRanges(), { fake: true } );

			const json = JSON.stringify( selection );
			const parsed = JSON.parse( json );

			expect( parsed ).toEqual( {
				isFake: true,
				ranges: [
					{
						start: {
							offset: 1,
							parent: {
								data: 'foo ',
								path: [ 0 ],
								type: 'Text'
							}
						},
						end: {
							offset: 2,
							parent: {
								data: 'bar',
								path: [ 1, 0 ],
								type: 'Text'
							}
						}
					}
				]
			} );
		} );
	} );
} );
