/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ViewDocumentSelection } from '../../src/view/documentselection.js';
import { ViewSelection } from '../../src/view/selection.js';
import { ViewRange } from '../../src/view/range.js';
import { ViewDocument } from '../../src/view/document.js';
import { ViewElement } from '../../src/view/element.js';
import { ViewText } from '../../src/view/text.js';
import { ViewPosition } from '../../src/view/position.js';
import { count } from '@ckeditor/ckeditor5-utils';
import { createViewRoot } from './_utils/createroot.js';
import { _parseView } from '../../src/dev-utils/view.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';

describe( 'ViewDocumentSelection', () => {
	let documentSelection, el, range1, range2, range3, document;

	beforeEach( () => {
		document = new ViewDocument( new StylesProcessor() );
		const text = new ViewText( document, 'xxxxxxxxxxxxxxxxxxxx' );
		el = new ViewElement( document, 'p', null, text );

		documentSelection = new ViewDocumentSelection();

		range1 = ViewRange._createFromParentsAndOffsets( text, 5, text, 10 );
		range2 = ViewRange._createFromParentsAndOffsets( text, 1, text, 2 );
		range3 = ViewRange._createFromParentsAndOffsets( text, 12, text, 14 );
	} );

	describe( 'constructor()', () => {
		it( 'should be able to create an empty selection', () => {
			const selection = new ViewDocumentSelection();

			expect( Array.from( selection.getRanges() ) ).toEqual( [] );
		} );

		it( 'should be able to create a selection from the given ranges', () => {
			const ranges = [ range1, range2, range3 ];
			const selection = new ViewDocumentSelection( ranges );

			expect( Array.from( selection.getRanges() ) ).toEqual( ranges );
		} );

		it( 'should be able to create a selection from the given ranges and isLastBackward flag', () => {
			const ranges = [ range1, range2, range3 ];
			const selection = new ViewDocumentSelection( ranges, { backward: true } );

			expect( selection.isBackward ).toBe( true );
		} );

		it( 'should be able to create a selection from the given range and isLastBackward flag', () => {
			const selection = new ViewDocumentSelection( range1, { backward: true } );

			expect( Array.from( selection.getRanges() ) ).toEqual( [ range1 ] );
			expect( selection.isBackward ).toBe( true );
		} );

		it( 'should be able to create a selection from the given iterable of ranges and isLastBackward flag', () => {
			const ranges = new Set( [ range1, range2, range3 ] );
			const selection = new ViewDocumentSelection( ranges, { backward: false } );

			expect( Array.from( selection.getRanges() ) ).toEqual( [ range1, range2, range3 ] );
			expect( selection.isBackward ).toBe( false );
		} );

		it( 'should be able to create a collapsed selection at the given position', () => {
			const position = range1.start;
			const selection = new ViewDocumentSelection( position );

			expect( Array.from( selection.getRanges() ).length ).toBe( 1 );
			expect( selection.getFirstRange().start ).toEqual( position );
			expect( selection.getFirstRange().end ).toEqual( position );
			expect( selection.isBackward ).toBe( false );
		} );

		it( 'should be able to create a selection from the other document selection', () => {
			const otherSelection = new ViewDocumentSelection( [ range2, range3 ], { backward: true } );
			const selection = new ViewDocumentSelection( otherSelection );

			expect( Array.from( selection.getRanges() ) ).toEqual( [ range2, range3 ] );
			expect( selection.isBackward ).toBe( true );
		} );

		it( 'should be able to create a selection from the other selection', () => {
			const otherSelection = new ViewSelection( [ range2, range3 ], { backward: true } );
			const selection = new ViewDocumentSelection( otherSelection );

			expect( Array.from( selection.getRanges() ) ).toEqual( [ range2, range3 ] );
			expect( selection.isBackward ).toBe( true );
		} );

		it( 'should be able to create a fake selection from the other fake selection', () => {
			const otherSelection = new ViewDocumentSelection( [ range2, range3 ], { fake: true, label: 'foo bar baz' } );
			const selection = new ViewDocumentSelection( otherSelection );

			expect( selection.isFake ).toBe( true );
			expect( selection.fakeSelectionLabel ).toBe( 'foo bar baz' );
		} );

		it( 'should throw an error when range is invalid', () => {
			expectToThrowCKEditorError( () => {
				// eslint-disable-next-line no-new
				new ViewDocumentSelection( [ { invalid: 'range' } ] );
			}, /view-selection-add-range-not-range/ );
		} );

		it( 'should throw an error when ranges intersects', () => {
			const text = el.getChild( 0 );
			const range2 = ViewRange._createFromParentsAndOffsets( text, 7, text, 15 );

			expectToThrowCKEditorError( () => {
				// eslint-disable-next-line no-new
				new ViewDocumentSelection( [ range1, range2 ] );
			}, 'view-selection-range-intersects' );
		} );

		it( 'should throw an error when trying to set to not selectable', () => {
			expectToThrowCKEditorError( () => {
				// eslint-disable-next-line no-new
				new ViewDocumentSelection( {} );
			}, 'view-selection-setto-not-selectable' );
		} );
	} );

	describe( 'anchor', () => {
		it( 'should return null if no ranges in selection', () => {
			expect( documentSelection.anchor ).toBeNull();
		} );

		it( 'should return start of single range in selection', () => {
			documentSelection._setTo( range1 );
			const anchor = documentSelection.anchor;

			expect( anchor.isEqual( range1.start ) ).toBe( true );
			expect( anchor ).not.toBe( range1.start );
		} );

		it( 'should return end of single range in selection when added as backward', () => {
			documentSelection._setTo( range1, { backward: true } );
			const anchor = documentSelection.anchor;

			expect( anchor.isEqual( range1.end ) ).toBe( true );
			expect( anchor ).not.toBe( range1.end );
		} );

		it( 'should get anchor from last inserted range', () => {
			documentSelection._setTo( [ range1, range2 ] );

			expect( documentSelection.anchor.isEqual( range2.start ) ).toBe( true );
		} );
	} );

	describe( 'focus', () => {
		it( 'should return null if no ranges in selection', () => {
			expect( documentSelection.focus ).toBeNull();
		} );

		it( 'should return end of single range in selection', () => {
			documentSelection._setTo( range1 );
			const focus = documentSelection.focus;

			expect( focus.isEqual( range1.end ) ).toBe( true );
		} );

		it( 'should return start of single range in selection when added as backward', () => {
			documentSelection._setTo( range1, { backward: true } );
			const focus = documentSelection.focus;

			expect( focus.isEqual( range1.start ) ).toBe( true );
			expect( focus ).not.toBe( range1.start );
		} );

		it( 'should get focus from last inserted range', () => {
			documentSelection._setTo( [ range1, range2 ] );

			expect( documentSelection.focus.isEqual( range2.end ) ).toBe( true );
		} );
	} );

	describe( '_setFocus()', () => {
		it( 'keeps all existing ranges when no modifications needed', () => {
			documentSelection._setTo( range1 );
			documentSelection._setFocus( documentSelection.focus );

			expect( count( documentSelection.getRanges() ) ).toBe( 1 );
		} );

		it( 'throws if there are no ranges in selection', () => {
			const endPos = ViewPosition._createAt( el, 'end' );

			expectToThrowCKEditorError( () => {
				documentSelection._setFocus( endPos );
			}, 'view-selection-setfocus-no-ranges', documentSelection );
		} );

		it( 'modifies existing collapsed selection', () => {
			const startPos = ViewPosition._createAt( el, 1 );
			const endPos = ViewPosition._createAt( el, 2 );

			documentSelection._setTo( startPos );

			documentSelection._setFocus( endPos );

			expect( documentSelection.anchor.compareWith( startPos ) ).toBe( 'same' );
			expect( documentSelection.focus.compareWith( endPos ) ).toBe( 'same' );
		} );

		it( 'makes existing collapsed selection a backward selection', () => {
			const startPos = ViewPosition._createAt( el, 1 );
			const endPos = ViewPosition._createAt( el, 0 );

			documentSelection._setTo( startPos );

			documentSelection._setFocus( endPos );

			expect( documentSelection.anchor.compareWith( startPos ) ).toBe( 'same' );
			expect( documentSelection.focus.compareWith( endPos ) ).toBe( 'same' );
			expect( documentSelection.isBackward ).toBe( true );
		} );

		it( 'modifies existing non-collapsed selection', () => {
			const startPos = ViewPosition._createAt( el, 1 );
			const endPos = ViewPosition._createAt( el, 2 );
			const newEndPos = ViewPosition._createAt( el, 3 );

			documentSelection._setTo( new ViewRange( startPos, endPos ) );

			documentSelection._setFocus( newEndPos );

			expect( documentSelection.anchor.compareWith( startPos ) ).toBe( 'same' );
			expect( documentSelection.focus.compareWith( newEndPos ) ).toBe( 'same' );
		} );

		it( 'makes existing non-collapsed selection a backward selection', () => {
			const startPos = ViewPosition._createAt( el, 1 );
			const endPos = ViewPosition._createAt( el, 2 );
			const newEndPos = ViewPosition._createAt( el, 0 );

			documentSelection._setTo( new ViewRange( startPos, endPos ) );

			documentSelection._setFocus( newEndPos );

			expect( documentSelection.anchor.compareWith( startPos ) ).toBe( 'same' );
			expect( documentSelection.focus.compareWith( newEndPos ) ).toBe( 'same' );
			expect( documentSelection.isBackward ).toBe( true );
		} );

		it( 'makes existing backward selection a forward selection', () => {
			const startPos = ViewPosition._createAt( el, 1 );
			const endPos = ViewPosition._createAt( el, 2 );
			const newEndPos = ViewPosition._createAt( el, 3 );

			documentSelection._setTo( new ViewRange( startPos, endPos ), { backward: true } );

			documentSelection._setFocus( newEndPos );

			expect( documentSelection.anchor.compareWith( endPos ) ).toBe( 'same' );
			expect( documentSelection.focus.compareWith( newEndPos ) ).toBe( 'same' );
			expect( documentSelection.isBackward ).toBe( false );
		} );

		it( 'modifies existing backward selection', () => {
			const startPos = ViewPosition._createAt( el, 1 );
			const endPos = ViewPosition._createAt( el, 2 );
			const newEndPos = ViewPosition._createAt( el, 0 );

			documentSelection._setTo( new ViewRange( startPos, endPos ), { backward: true } );

			documentSelection._setFocus( newEndPos );

			expect( documentSelection.anchor.compareWith( endPos ) ).toBe( 'same' );
			expect( documentSelection.focus.compareWith( newEndPos ) ).toBe( 'same' );
			expect( documentSelection.isBackward ).toBe( true );
		} );

		it( 'modifies only the last range', () => {
			// Offsets are chosen in this way that the order of adding ranges must count, not their document order.
			const startPos1 = ViewPosition._createAt( el, 4 );
			const endPos1 = ViewPosition._createAt( el, 5 );
			const startPos2 = ViewPosition._createAt( el, 1 );
			const endPos2 = ViewPosition._createAt( el, 2 );

			const newEndPos = ViewPosition._createAt( el, 0 );

			documentSelection._setTo( [
				new ViewRange( startPos1, endPos1 ),
				new ViewRange( startPos2, endPos2 )
			] );

			documentSelection._setFocus( newEndPos );

			const ranges = Array.from( documentSelection.getRanges() );

			expect( ranges ).to.have.lengthOf( 2 );
			expect( ranges[ 0 ].start.compareWith( startPos1 ) ).toBe( 'same' );
			expect( ranges[ 0 ].end.compareWith( endPos1 ) ).toBe( 'same' );

			expect( documentSelection.anchor.compareWith( startPos2 ) ).toBe( 'same' );
			expect( documentSelection.focus.compareWith( newEndPos ) ).toBe( 'same' );
			expect( documentSelection.isBackward ).toBe( true );
		} );

		it( 'collapses the selection when extending to the anchor', () => {
			const startPos = ViewPosition._createAt( el, 1 );
			const endPos = ViewPosition._createAt( el, 2 );

			documentSelection._setTo( new ViewRange( startPos, endPos ) );

			documentSelection._setFocus( startPos );

			expect( documentSelection.focus.compareWith( startPos ) ).toBe( 'same' );
			expect( documentSelection.isCollapsed ).toBe( true );
		} );
	} );

	describe( 'isCollapsed', () => {
		it( 'should return true when there is single collapsed range', () => {
			const range = ViewRange._createFromParentsAndOffsets( el, 5, el, 5 );
			documentSelection._setTo( range );

			expect( documentSelection.isCollapsed ).toBe( true );
		} );

		it( 'should return false when there are multiple ranges', () => {
			const range1 = ViewRange._createFromParentsAndOffsets( el, 5, el, 5 );
			const range2 = ViewRange._createFromParentsAndOffsets( el, 15, el, 15 );
			documentSelection._setTo( [ range1, range2 ] );

			expect( documentSelection.isCollapsed ).toBe( false );
		} );

		it( 'should return false when there is not collapsed range', () => {
			const range = ViewRange._createFromParentsAndOffsets( el, 15, el, 16 );
			documentSelection._setTo( range );

			expect( documentSelection.isCollapsed ).toBe( false );
		} );
	} );

	describe( 'rangeCount', () => {
		it( 'should return proper range count', () => {
			expect( documentSelection.rangeCount ).toBe( 0 );

			documentSelection._setTo( range1 );

			expect( documentSelection.rangeCount ).toBe( 1 );

			documentSelection._setTo( [ range1, range2 ] );

			expect( documentSelection.rangeCount ).toBe( 2 );
		} );
	} );

	describe( 'isBackward', () => {
		it( 'is defined by the last added range', () => {
			const range1 = ViewRange._createFromParentsAndOffsets( el, 5, el, 10 );
			const range2 = ViewRange._createFromParentsAndOffsets( el, 15, el, 16 );

			documentSelection._setTo( range1, { backward: true } );
			expect( documentSelection ).to.have.property( 'isBackward', true );

			documentSelection._setTo( [ range1, range2 ] );
			expect( documentSelection ).to.have.property( 'isBackward', false );
		} );

		it( 'is false when last range is collapsed', () => {
			const range = ViewRange._createFromParentsAndOffsets( el, 5, el, 5 );

			documentSelection._setTo( range, { backward: true } );

			expect( documentSelection.isBackward ).toBe( false );
		} );
	} );

	describe( 'getRanges', () => {
		it( 'should return iterator with copies of all ranges', () => {
			documentSelection._setTo( [ range1, range2 ] );

			const iterable = documentSelection.getRanges();
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
			documentSelection._setTo( [ range1, range2, range3 ] );

			const range = documentSelection.getFirstRange();

			expect( range.isEqual( range2 ) ).toBe( true );
			expect( range ).not.toBe( range2 );
		} );

		it( 'should return null if no ranges are present', () => {
			expect( documentSelection.getFirstRange() ).toBeNull();
		} );
	} );

	describe( 'getLastRange', () => {
		it( 'should return copy of range with last position', () => {
			documentSelection._setTo( [ range1, range2, range3 ] );

			const range = documentSelection.getLastRange();

			expect( range.isEqual( range3 ) ).toBe( true );
			expect( range ).not.toBe( range3 );
		} );

		it( 'should return null if no ranges are present', () => {
			expect( documentSelection.getLastRange() ).toBeNull();
		} );
	} );

	describe( 'getFirstPosition', () => {
		it( 'should return copy of first position', () => {
			documentSelection._setTo( [ range1, range2, range3 ] );

			const position = documentSelection.getFirstPosition();

			expect( position.isEqual( range2.start ) ).toBe( true );
			expect( position ).not.toBe( range2.start );
		} );

		it( 'should return null if no ranges are present', () => {
			expect( documentSelection.getFirstPosition() ).toBeNull();
		} );
	} );

	describe( 'getLastPosition', () => {
		it( 'should return copy of range with last position', () => {
			documentSelection._setTo( [ range1, range2, range3 ] );

			const position = documentSelection.getLastPosition();

			expect( position.isEqual( range3.end ) ).toBe( true );
			expect( position ).not.toBe( range3.end );
		} );

		it( 'should return null if no ranges are present', () => {
			expect( documentSelection.getLastPosition() ).toBeNull();
		} );
	} );

	describe( 'isEqual', () => {
		it( 'should return true if selections equal', () => {
			documentSelection._setTo( [ range1, range2 ] );

			const otherSelection = new ViewDocumentSelection();
			otherSelection._setTo( [ range1, range2 ] );

			expect( documentSelection.isEqual( otherSelection ) ).toBe( true );
		} );

		it( 'should return true if selections equal - ViewDocumentSelection and Selection', () => {
			documentSelection._setTo( [ range1, range2 ] );

			const otherSelection = new ViewSelection();
			otherSelection.setTo( [ range1, range2 ] );

			expect( documentSelection.isEqual( otherSelection ) ).toBe( true );
		} );

		it( 'should return true if backward selections equal', () => {
			documentSelection._setTo( range1, { backward: true } );

			const otherSelection = new ViewDocumentSelection( [ range1 ], { backward: true } );

			expect( documentSelection.isEqual( otherSelection ) ).toBe( true );
		} );

		it( 'should return true if backward selections equal - ViewDocumentSelection and Selection', () => {
			documentSelection._setTo( range1, { backward: true } );

			const otherSelection = new ViewSelection( [ range1 ], { backward: true } );

			expect( documentSelection.isEqual( otherSelection ) ).toBe( true );
		} );

		it( 'should return false if ranges count does not equal', () => {
			documentSelection._setTo( [ range1, range2 ] );

			const otherSelection = new ViewDocumentSelection( [ range1 ] );

			expect( documentSelection.isEqual( otherSelection ) ).toBe( false );
		} );

		it( 'should return false if ranges count does not equal - ViewDocumentSelection and Selection', () => {
			documentSelection._setTo( [ range1, range2 ] );

			const otherSelection = new ViewSelection( [ range1 ] );

			expect( documentSelection.isEqual( otherSelection ) ).toBe( false );
		} );

		it( 'should return false if ranges (other than the last added one) do not equal', () => {
			documentSelection._setTo( [ range1, range3 ] );

			const otherSelection = new ViewDocumentSelection( [ range2, range3 ] );

			expect( documentSelection.isEqual( otherSelection ) ).toBe( false );
		} );

		it( 'should return false if ranges (other than the last added one) do not equal - ViewDocumentSelection and Selection', () => {
			documentSelection._setTo( [ range1, range3 ] );

			const otherSelection = new ViewSelection( [ range2, range3 ] );

			expect( documentSelection.isEqual( otherSelection ) ).toBe( false );
		} );

		it( 'should return false if directions do not equal', () => {
			documentSelection._setTo( range1 );

			const otherSelection = new ViewDocumentSelection( [ range1 ], { backward: true } );

			expect( documentSelection.isEqual( otherSelection ) ).toBe( false );
		} );

		it( 'should return false if directions do not equal - ViewDocumentSelection and Selection', () => {
			documentSelection._setTo( range1 );

			const otherSelection = new ViewSelection( [ range1 ], { backward: true } );

			expect( documentSelection.isEqual( otherSelection ) ).toBe( false );
		} );

		it( 'should return false if one selection is fake', () => {
			const otherSelection = new ViewDocumentSelection( null, { fake: true } );

			expect( documentSelection.isEqual( otherSelection ) ).toBe( false );
		} );

		it( 'should return true if both selection are fake - ViewDocumentSelection and Selection', () => {
			const otherSelection = new ViewSelection( range1, { fake: true } );
			documentSelection._setTo( range1, { fake: true } );

			expect( documentSelection.isEqual( otherSelection ) ).toBe( true );
		} );

		it( 'should return false if both selection are fake but have different label', () => {
			const otherSelection = new ViewDocumentSelection( [ range1 ], { fake: true, label: 'foo bar baz' } );
			documentSelection._setTo( range1, { fake: true, label: 'foo' } );

			expect( documentSelection.isEqual( otherSelection ) ).toBe( false );
		} );

		it( 'should return false if both selection are fake but have different label - ViewDocumentSelection and Selection', () => {
			const otherSelection = new ViewSelection( [ range1 ], { fake: true, label: 'foo bar baz' } );
			documentSelection._setTo( range1, { fake: true, label: 'foo' } );

			expect( documentSelection.isEqual( otherSelection ) ).toBe( false );
		} );

		it( 'should return true if both selections are empty', () => {
			const otherSelection = new ViewDocumentSelection();

			expect( documentSelection.isEqual( otherSelection ) ).toBe( true );
		} );

		it( 'should return true if both selections are empty - ViewDocumentSelection and Selection', () => {
			const otherSelection = new ViewSelection();

			expect( documentSelection.isEqual( otherSelection ) ).toBe( true );
		} );
	} );

	describe( 'isSimilar', () => {
		it( 'should return true if selections equal', () => {
			documentSelection._setTo( [ range1, range2 ] );

			const otherSelection = new ViewDocumentSelection( [ range1, range2 ] );

			expect( documentSelection.isSimilar( otherSelection ) ).toBe( true );
		} );

		it( 'should return true if selections equal - ViewDocumentSelection and Selection', () => {
			documentSelection._setTo( [ range1, range2 ] );

			const otherSelection = new ViewSelection( [ range1, range2 ] );

			expect( documentSelection.isSimilar( otherSelection ) ).toBe( true );
		} );

		it( 'should return false if ranges count does not equal', () => {
			documentSelection._setTo( [ range1, range2 ] );

			const otherSelection = new ViewDocumentSelection( [ range1 ] );

			expect( documentSelection.isSimilar( otherSelection ) ).toBe( false );
		} );

		it( 'should return false if ranges count does not equal - ViewDocumentSelection and Selection', () => {
			documentSelection._setTo( [ range1, range2 ] );

			const otherSelection = new ViewSelection( [ range1 ] );

			expect( documentSelection.isSimilar( otherSelection ) ).toBe( false );
		} );

		it( 'should return false if trimmed ranges (other than the last added one) are not equal', () => {
			documentSelection._setTo( [ range1, range3 ] );

			const otherSelection = new ViewDocumentSelection( [ range2, range3 ] );

			expect( documentSelection.isSimilar( otherSelection ) ).toBe( false );
		} );

		it( 'should return false if trimmed ranges (other than the last added one) are not equal - with Selection', () => {
			documentSelection._setTo( [ range1, range3 ] );

			const otherSelection = new ViewSelection( [ range2, range3 ] );

			expect( documentSelection.isSimilar( otherSelection ) ).toBe( false );
		} );

		it( 'should return false if directions are not equal', () => {
			documentSelection._setTo( range1 );

			const otherSelection = new ViewDocumentSelection( [ range1 ], { backward: true } );

			expect( documentSelection.isSimilar( otherSelection ) ).toBe( false );
		} );

		it( 'should return false if directions are not equal - ViewDocumentSelection and Selection', () => {
			documentSelection._setTo( range1 );

			const otherSelection = new ViewSelection( [ range1 ], { backward: true } );

			expect( documentSelection.isSimilar( otherSelection ) ).toBe( false );
		} );

		it( 'should return true if both selections are empty', () => {
			const otherSelection = new ViewDocumentSelection();

			expect( documentSelection.isSimilar( otherSelection ) ).toBe( true );
		} );

		it( 'should return true if both selections are empty - ViewDocumentSelection and Selection', () => {
			const otherSelection = new ViewSelection();

			expect( documentSelection.isSimilar( otherSelection ) ).toBe( true );
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

			documentSelection._setTo( [ rangeA1, rangeA2 ] );

			const otherSelection = new ViewDocumentSelection( [ rangeB2, rangeB1 ] );

			expect( documentSelection.isSimilar( otherSelection ) ).toBe( true );
			expect( otherSelection.isSimilar( documentSelection ) ).toBe( true );

			expect( documentSelection.isEqual( otherSelection ) ).toBe( false );
			expect( otherSelection.isEqual( documentSelection ) ).toBe( false );
		} );

		it( 'should return true if all ranges trimmed from both selections are equal - ViewDocumentSelection and Selection', () => {
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

			documentSelection._setTo( [ rangeA1, rangeA2 ] );

			const otherSelection = new ViewSelection( [ rangeB2, rangeB1 ] );

			expect( documentSelection.isSimilar( otherSelection ) ).toBe( true );
			expect( otherSelection.isSimilar( documentSelection ) ).toBe( true );

			expect( documentSelection.isEqual( otherSelection ) ).toBe( false );
			expect( otherSelection.isEqual( documentSelection ) ).toBe( false );
		} );
	} );

	describe( 'is()', () => {
		it( 'should return true for selection', () => {
			expect( documentSelection.is( 'selection' ) ).toBe( true );
			expect( documentSelection.is( 'view:selection' ) ).toBe( true );
		} );

		it( 'should return true for documentSelection', () => {
			expect( documentSelection.is( 'documentSelection' ) ).toBe( true );
			expect( documentSelection.is( 'view:documentSelection' ) ).toBe( true );
		} );

		it( 'should return false for other values', () => {
			expect( documentSelection.is( 'node' ) ).toBe( false );
			expect( documentSelection.is( 'view:node' ) ).toBe( false );
			expect( documentSelection.is( '$text' ) ).toBe( false );
			expect( documentSelection.is( 'view:$text' ) ).toBe( false );
			expect( documentSelection.is( '$textProxy' ) ).toBe( false );
			expect( documentSelection.is( 'element' ) ).toBe( false );
			expect( documentSelection.is( 'rootElement' ) ).toBe( false );
			expect( documentSelection.is( 'model:selection' ) ).toBe( false );
			expect( documentSelection.is( 'model:documentSelection' ) ).toBe( false );
		} );
	} );

	describe( '_setTo()', () => {
		describe( 'simple scenarios', () => {
			it( 'should set selection ranges from the given selection', () => {
				documentSelection._setTo( range1 );

				const otherSelection = new ViewDocumentSelection( [ range2, range3 ], { backward: true } );

				documentSelection._setTo( otherSelection );

				expect( documentSelection.rangeCount ).toBe( 2 );
				expect( documentSelection._ranges[ 0 ].isEqual( range2 ) ).toBe( true );
				expect( documentSelection._ranges[ 0 ] ).is.not.equal( range2 );
				expect( documentSelection._ranges[ 1 ].isEqual( range3 ) ).toBe( true );
				expect( documentSelection._ranges[ 1 ] ).is.not.equal( range3 );

				expect( documentSelection.anchor.isEqual( range3.end ) ).toBe( true );
			} );

			it( 'should set selection on the given Range', () => {
				documentSelection._setTo( range1 );

				expect( Array.from( documentSelection.getRanges() ) ).toEqual( [ range1 ] );
				expect( documentSelection.isBackward ).toBe( false );
			} );

			it( 'should set selection on the given iterable of Ranges', () => {
				documentSelection._setTo( new Set( [ range1, range2 ] ) );

				expect( Array.from( documentSelection.getRanges() ) ).toEqual( [ range1, range2 ] );
				expect( documentSelection.isBackward ).toBe( false );
			} );

			it( 'should set collapsed selection on the given Position', () => {
				documentSelection._setTo( range1.start );

				expect( Array.from( documentSelection.getRanges() ).length ).toBe( 1 );
				expect( Array.from( documentSelection.getRanges() )[ 0 ].start ).toEqual( range1.start );
				expect( documentSelection.isBackward ).toBe( false );
				expect( documentSelection.isCollapsed ).toBe( true );
			} );

			it( 'should fire change event', () => {
				return new Promise( resolve => {
					documentSelection.on( 'change', () => {
						expect( documentSelection.rangeCount ).toBe( 1 );
						expect( documentSelection.getFirstRange().isEqual( range1 ) ).toBe( true );
						resolve();
					} );

					const otherSelection = new ViewDocumentSelection( [ range1 ] );

					documentSelection._setTo( otherSelection );
				} );
			} );

			it( 'should set fake state and label', () => {
				const label = 'foo bar baz';
				const otherSelection = new ViewDocumentSelection( null, { fake: true, label } );
				documentSelection._setTo( otherSelection );

				expect( documentSelection.isFake ).toBe( true );
				expect( documentSelection.fakeSelectionLabel ).toBe( label );
			} );

			it( 'should throw an error when trying to set to not selectable', () => {
				const otherSelection = new ViewDocumentSelection();

				expectToThrowCKEditorError( () => {
					otherSelection._setTo( {} );
				}, 'view-selection-setto-not-selectable' );
			} );

			it( 'should throw an error when trying to set to not selectable #2', () => {
				const otherSelection = new ViewDocumentSelection();

				expectToThrowCKEditorError( () => {
					otherSelection._setTo();
				}, 'view-selection-setto-not-selectable' );
			} );
		} );

		describe( 'setting collapsed selection', () => {
			beforeEach( () => {
				documentSelection._setTo( [ range1, range2 ] );
			} );

			it( 'should collapse selection at position', () => {
				const position = new ViewPosition( el, 4 );

				documentSelection._setTo( position );
				const range = documentSelection.getFirstRange();

				expect( range.start.parent ).toBe( el );
				expect( range.start.offset ).toBe( 4 );
				expect( range.start.isEqual( range.end ) ).toBe( true );
			} );

			it( 'should collapse selection at node and offset', () => {
				const foo = new ViewText( document, 'foo' );
				const p = new ViewElement( document, 'p', null, foo );

				documentSelection._setTo( foo, 0 );
				let range = documentSelection.getFirstRange();

				expect( range.start.parent ).toBe( foo );
				expect( range.start.offset ).toBe( 0 );
				expect( range.start.isEqual( range.end ) ).toBe( true );

				documentSelection._setTo( p, 1 );
				range = documentSelection.getFirstRange();

				expect( range.start.parent ).toBe( p );
				expect( range.start.offset ).toBe( 1 );
				expect( range.start.isEqual( range.end ) ).toBe( true );
			} );

			it( 'should throw an error when the second parameter is not passed and first is an item', () => {
				const foo = new ViewText( document, 'foo' );

				expectToThrowCKEditorError( () => {
					documentSelection._setTo( foo );
				}, 'view-selection-setto-required-second-parameter', documentSelection );
			} );

			it( 'should collapse selection at node and flag', () => {
				const foo = new ViewText( document, 'foo' );
				const p = new ViewElement( document, 'p', null, foo );

				documentSelection._setTo( foo, 'end' );
				let range = documentSelection.getFirstRange();

				expect( range.start.parent ).toBe( foo );
				expect( range.start.offset ).toBe( 3 );
				expect( range.start.isEqual( range.end ) ).toBe( true );

				documentSelection._setTo( foo, 'before' );
				range = documentSelection.getFirstRange();

				expect( range.start.parent ).toBe( p );
				expect( range.start.offset ).toBe( 0 );
				expect( range.start.isEqual( range.end ) ).toBe( true );

				documentSelection._setTo( foo, 'after' );
				range = documentSelection.getFirstRange();

				expect( range.start.parent ).toBe( p );
				expect( range.start.offset ).toBe( 1 );
				expect( range.start.isEqual( range.end ) ).toBe( true );
			} );
		} );

		describe( 'setting collapsed selection at start', () => {
			it( 'should collapse to start position and fire change event', () => {
				documentSelection._setTo( [ range1, range2, range3 ] );
				return new Promise( resolve => {
					documentSelection.once( 'change', () => {
						expect( documentSelection.rangeCount ).toBe( 1 );
						expect( documentSelection.isCollapsed ).toBe( true );
						expect( documentSelection._ranges[ 0 ].start.isEqual( range2.start ) ).toBe( true );
						resolve();
					} );

					documentSelection._setTo( documentSelection.getFirstPosition() );
				} );
			} );
		} );

		describe( 'setting collapsed selection to end', () => {
			it( 'should collapse to end position and fire change event', () => {
				documentSelection._setTo( [ range1, range2, range3 ] );
				return new Promise( resolve => {
					documentSelection.once( 'change', () => {
						expect( documentSelection.rangeCount ).toBe( 1 );
						expect( documentSelection.isCollapsed ).toBe( true );
						expect( documentSelection._ranges[ 0 ].end.isEqual( range3.end ) ).toBe( true );
						resolve();
					} );

					documentSelection._setTo( documentSelection.getLastPosition() );
				} );
			} );
		} );

		describe( 'removing all ranges', () => {
			it( 'should remove all ranges and fire change event', () => {
				documentSelection._setTo( [ range1, range2 ] );

				return new Promise( resolve => {
					documentSelection.once( 'change', () => {
						expect( documentSelection.rangeCount ).toBe( 0 );
						resolve();
					} );

					documentSelection._setTo( null );
				} );
			} );
		} );

		describe( 'setting fake selection', () => {
			it( 'should allow to set selection to fake', () => {
				documentSelection._setTo( range1, { fake: true } );

				expect( documentSelection.isFake ).toBe( true );
			} );

			it( 'should allow to set fake selection label', () => {
				const label = 'foo bar baz';
				documentSelection._setTo( range1, { fake: true, label } );

				expect( documentSelection.fakeSelectionLabel ).toBe( label );
			} );

			it( 'should not set label when set to false', () => {
				const label = 'foo bar baz';
				documentSelection._setTo( range1, { fake: false, label } );

				expect( documentSelection.fakeSelectionLabel ).toBe( '' );
			} );

			it( 'should reset label when set to false', () => {
				const label = 'foo bar baz';
				documentSelection._setTo( range1, { fake: true, label } );
				documentSelection._setTo( range1 );

				expect( documentSelection.fakeSelectionLabel ).toBe( '' );
			} );

			it( 'should fire change event', () => {
				return new Promise( resolve => {
					documentSelection.once( 'change', () => {
						expect( documentSelection.isFake ).toBe( true );
						expect( documentSelection.fakeSelectionLabel ).toBe( 'foo bar baz' );

						resolve();
					} );

					documentSelection._setTo( range1, { fake: true, label: 'foo bar baz' } );
				} );
			} );

			it( 'should be possible to create an empty fake selection', () => {
				documentSelection._setTo( null, { fake: true, label: 'foo bar baz' } );

				expect( documentSelection.fakeSelectionLabel ).toBe( 'foo bar baz' );
				expect( documentSelection.isFake ).toBe( true );
			} );
		} );

		describe( 'setting selection to itself', () => {
			it( 'should correctly set ranges when setting to the same selection', () => {
				documentSelection._setTo( [ range1, range2 ] );
				documentSelection._setTo( documentSelection );

				const ranges = Array.from( documentSelection.getRanges() );
				expect( ranges.length ).toBe( 2 );

				expect( ranges[ 0 ].isEqual( range1 ) ).toBe( true );
				expect( ranges[ 1 ].isEqual( range2 ) ).toBe( true );
			} );

			it( 'should correctly set ranges when setting to the same selection\'s ranges', () => {
				documentSelection._setTo( [ range1, range2 ] );
				documentSelection._setTo( documentSelection.getRanges() );

				const ranges = Array.from( documentSelection.getRanges() );
				expect( ranges.length ).toBe( 2 );

				expect( ranges[ 0 ].isEqual( range1 ) ).toBe( true );
				expect( ranges[ 1 ].isEqual( range2 ) ).toBe( true );
			} );
		} );

		describe( 'throwing errors', () => {
			it( 'should throw an error when range is invalid', () => {
				expectToThrowCKEditorError( () => {
					documentSelection._setTo( [ { invalid: 'range' } ] );
				}, /view-selection-add-range-not-range/, documentSelection );
			} );

			it( 'should throw when range is intersecting with already added range', () => {
				const text = el.getChild( 0 );
				const range2 = ViewRange._createFromParentsAndOffsets( text, 7, text, 15 );

				expectToThrowCKEditorError( () => {
					documentSelection._setTo( [ range1, range2 ] );
				}, 'view-selection-range-intersects', documentSelection );
			} );
		} );

		it( 'should allow setting selection on an item', () => {
			const textNode1 = new ViewText( document, 'foo' );
			const textNode2 = new ViewText( document, 'bar' );
			const textNode3 = new ViewText( document, 'baz' );
			const element = new ViewElement( document, 'p', null, [ textNode1, textNode2, textNode3 ] );

			documentSelection._setTo( textNode2, 'on' );

			const ranges = Array.from( documentSelection.getRanges() );
			expect( ranges.length ).toBe( 1 );
			expect( ranges[ 0 ].start.parent ).toBe( element );
			expect( ranges[ 0 ].start.offset ).toEqual( 1 );
			expect( ranges[ 0 ].end.parent ).toBe( element );
			expect( ranges[ 0 ].end.offset ).toEqual( 2 );
		} );

		it( 'should allow setting selection inside an element', () => {
			const element = new ViewElement( document, 'p', null, [ new ViewText( document, 'foo' ), new ViewText( document, 'bar' ) ] );

			documentSelection._setTo( element, 'in' );

			const ranges = Array.from( documentSelection.getRanges() );
			expect( ranges.length ).toBe( 1 );
			expect( ranges[ 0 ].start.parent ).toBe( element );
			expect( ranges[ 0 ].start.offset ).toEqual( 0 );
			expect( ranges[ 0 ].end.parent ).toBe( element );
			expect( ranges[ 0 ].end.offset ).toEqual( 2 );
		} );

		it( 'should allow setting backward selection inside an element', () => {
			const element = new ViewElement( document, 'p', null, [ new ViewText( document, 'foo' ), new ViewText( document, 'bar' ) ] );

			documentSelection._setTo( element, 'in', { backward: true } );

			const ranges = Array.from( documentSelection.getRanges() );
			expect( ranges.length ).toBe( 1 );
			expect( ranges[ 0 ].start.parent ).toBe( element );
			expect( ranges[ 0 ].start.offset ).toEqual( 0 );
			expect( ranges[ 0 ].end.parent ).toBe( element );
			expect( ranges[ 0 ].end.offset ).toEqual( 2 );
			expect( documentSelection.isBackward ).toBe( true );
		} );
	} );

	describe( 'getEditableElement()', () => {
		it( 'should return null if no ranges in selection', () => {
			expect( documentSelection.editableElement ).toBeNull();
		} );

		it( 'should return null if selection is placed in container that is not ViewEditableElement', () => {
			documentSelection._setTo( range1 );

			expect( documentSelection.editableElement ).toBeNull();
		} );

		it( 'should return ViewEditableElement when selection is placed inside', () => {
			const viewDocument = new ViewDocument( new StylesProcessor() );
			documentSelection._setTo( viewDocument.selection );
			const root = createViewRoot( viewDocument, 'div', 'main' );
			const element = new ViewElement( document, 'p' );
			root._appendChild( element );

			documentSelection._setTo( ViewRange._createFromParentsAndOffsets( element, 0, element, 0 ) );

			expect( documentSelection.editableElement ).toBe( root );
		} );
	} );

	describe( 'isFake', () => {
		it( 'should be false for newly created instance', () => {
			expect( documentSelection.isFake ).toBe( false );
		} );
	} );

	describe( 'getSelectedElement()', () => {
		it( 'should return selected element', () => {
			const { selection: documentSelection, view } = _parseView( 'foo [<b>bar</b>] baz' );
			const b = view.getChild( 1 );

			expect( documentSelection.getSelectedElement() ).toBe( b );
		} );

		it( 'should return null if there is more than one range', () => {
			const { selection: documentSelection } = _parseView( 'foo [<b>bar</b>] [<i>baz</i>]' );

			expect( documentSelection.getSelectedElement() ).toBeNull();
		} );

		it( 'should return null if there is no selection', () => {
			expect( documentSelection.getSelectedElement() ).toBeNull();
		} );

		it( 'should return null if selection is not over single element #1', () => {
			const { selection: documentSelection } = _parseView( 'foo [<b>bar</b> ba}z' );

			expect( documentSelection.getSelectedElement() ).toBeNull();
		} );

		it( 'should return null if selection is not over single element #2', () => {
			const { selection: documentSelection } = _parseView( 'foo <b>{bar}</b> baz' );

			expect( documentSelection.getSelectedElement() ).toBeNull();
		} );
	} );

	describe( 'toJSON()', () => {
		it( 'should provide ranges', () => {
			const { selection: documentSelection } = _parseView( 'f{oo <b>ba}r</b> baz' );

			const json = JSON.stringify( documentSelection );
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
			const { selection: documentSelection } = _parseView( 'f{oo <b>ba}r</b> baz' );

			documentSelection._selection._lastRangeBackward = true;

			const json = JSON.stringify( documentSelection );
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
			const { selection: documentSelection } = _parseView( 'f{oo <b>ba}r</b> baz' );

			documentSelection._selection._isFake = true;

			const json = JSON.stringify( documentSelection );
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
