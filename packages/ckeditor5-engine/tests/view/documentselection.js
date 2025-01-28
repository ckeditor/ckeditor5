/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import DocumentSelection from '../../src/view/documentselection.js';
import Selection from '../../src/view/selection.js';
import Range from '../../src/view/range.js';
import Document from '../../src/view/document.js';
import Element from '../../src/view/element.js';
import Text from '../../src/view/text.js';
import Position from '../../src/view/position.js';
import count from '@ckeditor/ckeditor5-utils/src/count.js';
import createViewRoot from './_utils/createroot.js';
import { parse } from '../../src/dev-utils/view.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';

describe( 'DocumentSelection', () => {
	let documentSelection, el, range1, range2, range3, document;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		document = new Document( new StylesProcessor() );
		const text = new Text( document, 'xxxxxxxxxxxxxxxxxxxx' );
		el = new Element( document, 'p', null, text );

		documentSelection = new DocumentSelection();

		range1 = Range._createFromParentsAndOffsets( text, 5, text, 10 );
		range2 = Range._createFromParentsAndOffsets( text, 1, text, 2 );
		range3 = Range._createFromParentsAndOffsets( text, 12, text, 14 );
	} );

	describe( 'constructor()', () => {
		it( 'should be able to create an empty selection', () => {
			const selection = new DocumentSelection();

			expect( Array.from( selection.getRanges() ) ).to.deep.equal( [] );
		} );

		it( 'should be able to create a selection from the given ranges', () => {
			const ranges = [ range1, range2, range3 ];
			const selection = new DocumentSelection( ranges );

			expect( Array.from( selection.getRanges() ) ).to.deep.equal( ranges );
		} );

		it( 'should be able to create a selection from the given ranges and isLastBackward flag', () => {
			const ranges = [ range1, range2, range3 ];
			const selection = new DocumentSelection( ranges, { backward: true } );

			expect( selection.isBackward ).to.be.true;
		} );

		it( 'should be able to create a selection from the given range and isLastBackward flag', () => {
			const selection = new DocumentSelection( range1, { backward: true } );

			expect( Array.from( selection.getRanges() ) ).to.deep.equal( [ range1 ] );
			expect( selection.isBackward ).to.be.true;
		} );

		it( 'should be able to create a selection from the given iterable of ranges and isLastBackward flag', () => {
			const ranges = new Set( [ range1, range2, range3 ] );
			const selection = new DocumentSelection( ranges, { backward: false } );

			expect( Array.from( selection.getRanges() ) ).to.deep.equal( [ range1, range2, range3 ] );
			expect( selection.isBackward ).to.be.false;
		} );

		it( 'should be able to create a collapsed selection at the given position', () => {
			const position = range1.start;
			const selection = new DocumentSelection( position );

			expect( Array.from( selection.getRanges() ).length ).to.equal( 1 );
			expect( selection.getFirstRange().start ).to.deep.equal( position );
			expect( selection.getFirstRange().end ).to.deep.equal( position );
			expect( selection.isBackward ).to.be.false;
		} );

		it( 'should be able to create a selection from the other document selection', () => {
			const otherSelection = new DocumentSelection( [ range2, range3 ], { backward: true } );
			const selection = new DocumentSelection( otherSelection );

			expect( Array.from( selection.getRanges() ) ).to.deep.equal( [ range2, range3 ] );
			expect( selection.isBackward ).to.be.true;
		} );

		it( 'should be able to create a selection from the other selection', () => {
			const otherSelection = new Selection( [ range2, range3 ], { backward: true } );
			const selection = new DocumentSelection( otherSelection );

			expect( Array.from( selection.getRanges() ) ).to.deep.equal( [ range2, range3 ] );
			expect( selection.isBackward ).to.be.true;
		} );

		it( 'should be able to create a fake selection from the other fake selection', () => {
			const otherSelection = new DocumentSelection( [ range2, range3 ], { fake: true, label: 'foo bar baz' } );
			const selection = new DocumentSelection( otherSelection );

			expect( selection.isFake ).to.be.true;
			expect( selection.fakeSelectionLabel ).to.equal( 'foo bar baz' );
		} );

		it( 'should throw an error when range is invalid', () => {
			expectToThrowCKEditorError( () => {
				// eslint-disable-next-line no-new
				new DocumentSelection( [ { invalid: 'range' } ] );
			}, /view-selection-add-range-not-range/ );
		} );

		it( 'should throw an error when ranges intersects', () => {
			const text = el.getChild( 0 );
			const range2 = Range._createFromParentsAndOffsets( text, 7, text, 15 );

			expectToThrowCKEditorError( () => {
				// eslint-disable-next-line no-new
				new DocumentSelection( [ range1, range2 ] );
			}, 'view-selection-range-intersects' );
		} );

		it( 'should throw an error when trying to set to not selectable', () => {
			expectToThrowCKEditorError( () => {
				// eslint-disable-next-line no-new
				new DocumentSelection( {} );
			}, 'view-selection-setto-not-selectable' );
		} );
	} );

	describe( 'anchor', () => {
		it( 'should return null if no ranges in selection', () => {
			expect( documentSelection.anchor ).to.be.null;
		} );

		it( 'should return start of single range in selection', () => {
			documentSelection._setTo( range1 );
			const anchor = documentSelection.anchor;

			expect( anchor.isEqual( range1.start ) ).to.be.true;
			expect( anchor ).to.not.equal( range1.start );
		} );

		it( 'should return end of single range in selection when added as backward', () => {
			documentSelection._setTo( range1, { backward: true } );
			const anchor = documentSelection.anchor;

			expect( anchor.isEqual( range1.end ) ).to.be.true;
			expect( anchor ).to.not.equal( range1.end );
		} );

		it( 'should get anchor from last inserted range', () => {
			documentSelection._setTo( [ range1, range2 ] );

			expect( documentSelection.anchor.isEqual( range2.start ) ).to.be.true;
		} );
	} );

	describe( 'focus', () => {
		it( 'should return null if no ranges in selection', () => {
			expect( documentSelection.focus ).to.be.null;
		} );

		it( 'should return end of single range in selection', () => {
			documentSelection._setTo( range1 );
			const focus = documentSelection.focus;

			expect( focus.isEqual( range1.end ) ).to.be.true;
		} );

		it( 'should return start of single range in selection when added as backward', () => {
			documentSelection._setTo( range1, { backward: true } );
			const focus = documentSelection.focus;

			expect( focus.isEqual( range1.start ) ).to.be.true;
			expect( focus ).to.not.equal( range1.start );
		} );

		it( 'should get focus from last inserted range', () => {
			documentSelection._setTo( [ range1, range2 ] );

			expect( documentSelection.focus.isEqual( range2.end ) ).to.be.true;
		} );
	} );

	describe( '_setFocus()', () => {
		it( 'keeps all existing ranges when no modifications needed', () => {
			documentSelection._setTo( range1 );
			documentSelection._setFocus( documentSelection.focus );

			expect( count( documentSelection.getRanges() ) ).to.equal( 1 );
		} );

		it( 'throws if there are no ranges in selection', () => {
			const endPos = Position._createAt( el, 'end' );

			expectToThrowCKEditorError( () => {
				documentSelection._setFocus( endPos );
			}, 'view-selection-setfocus-no-ranges', documentSelection );
		} );

		it( 'modifies existing collapsed selection', () => {
			const startPos = Position._createAt( el, 1 );
			const endPos = Position._createAt( el, 2 );

			documentSelection._setTo( startPos );

			documentSelection._setFocus( endPos );

			expect( documentSelection.anchor.compareWith( startPos ) ).to.equal( 'same' );
			expect( documentSelection.focus.compareWith( endPos ) ).to.equal( 'same' );
		} );

		it( 'makes existing collapsed selection a backward selection', () => {
			const startPos = Position._createAt( el, 1 );
			const endPos = Position._createAt( el, 0 );

			documentSelection._setTo( startPos );

			documentSelection._setFocus( endPos );

			expect( documentSelection.anchor.compareWith( startPos ) ).to.equal( 'same' );
			expect( documentSelection.focus.compareWith( endPos ) ).to.equal( 'same' );
			expect( documentSelection.isBackward ).to.be.true;
		} );

		it( 'modifies existing non-collapsed selection', () => {
			const startPos = Position._createAt( el, 1 );
			const endPos = Position._createAt( el, 2 );
			const newEndPos = Position._createAt( el, 3 );

			documentSelection._setTo( new Range( startPos, endPos ) );

			documentSelection._setFocus( newEndPos );

			expect( documentSelection.anchor.compareWith( startPos ) ).to.equal( 'same' );
			expect( documentSelection.focus.compareWith( newEndPos ) ).to.equal( 'same' );
		} );

		it( 'makes existing non-collapsed selection a backward selection', () => {
			const startPos = Position._createAt( el, 1 );
			const endPos = Position._createAt( el, 2 );
			const newEndPos = Position._createAt( el, 0 );

			documentSelection._setTo( new Range( startPos, endPos ) );

			documentSelection._setFocus( newEndPos );

			expect( documentSelection.anchor.compareWith( startPos ) ).to.equal( 'same' );
			expect( documentSelection.focus.compareWith( newEndPos ) ).to.equal( 'same' );
			expect( documentSelection.isBackward ).to.be.true;
		} );

		it( 'makes existing backward selection a forward selection', () => {
			const startPos = Position._createAt( el, 1 );
			const endPos = Position._createAt( el, 2 );
			const newEndPos = Position._createAt( el, 3 );

			documentSelection._setTo( new Range( startPos, endPos ), { backward: true } );

			documentSelection._setFocus( newEndPos );

			expect( documentSelection.anchor.compareWith( endPos ) ).to.equal( 'same' );
			expect( documentSelection.focus.compareWith( newEndPos ) ).to.equal( 'same' );
			expect( documentSelection.isBackward ).to.be.false;
		} );

		it( 'modifies existing backward selection', () => {
			const startPos = Position._createAt( el, 1 );
			const endPos = Position._createAt( el, 2 );
			const newEndPos = Position._createAt( el, 0 );

			documentSelection._setTo( new Range( startPos, endPos ), { backward: true } );

			documentSelection._setFocus( newEndPos );

			expect( documentSelection.anchor.compareWith( endPos ) ).to.equal( 'same' );
			expect( documentSelection.focus.compareWith( newEndPos ) ).to.equal( 'same' );
			expect( documentSelection.isBackward ).to.be.true;
		} );

		it( 'modifies only the last range', () => {
			// Offsets are chosen in this way that the order of adding ranges must count, not their document order.
			const startPos1 = Position._createAt( el, 4 );
			const endPos1 = Position._createAt( el, 5 );
			const startPos2 = Position._createAt( el, 1 );
			const endPos2 = Position._createAt( el, 2 );

			const newEndPos = Position._createAt( el, 0 );

			documentSelection._setTo( [
				new Range( startPos1, endPos1 ),
				new Range( startPos2, endPos2 )
			] );

			documentSelection._setFocus( newEndPos );

			const ranges = Array.from( documentSelection.getRanges() );

			expect( ranges ).to.have.lengthOf( 2 );
			expect( ranges[ 0 ].start.compareWith( startPos1 ) ).to.equal( 'same' );
			expect( ranges[ 0 ].end.compareWith( endPos1 ) ).to.equal( 'same' );

			expect( documentSelection.anchor.compareWith( startPos2 ) ).to.equal( 'same' );
			expect( documentSelection.focus.compareWith( newEndPos ) ).to.equal( 'same' );
			expect( documentSelection.isBackward ).to.be.true;
		} );

		it( 'collapses the selection when extending to the anchor', () => {
			const startPos = Position._createAt( el, 1 );
			const endPos = Position._createAt( el, 2 );

			documentSelection._setTo( new Range( startPos, endPos ) );

			documentSelection._setFocus( startPos );

			expect( documentSelection.focus.compareWith( startPos ) ).to.equal( 'same' );
			expect( documentSelection.isCollapsed ).to.be.true;
		} );
	} );

	describe( 'isCollapsed', () => {
		it( 'should return true when there is single collapsed range', () => {
			const range = Range._createFromParentsAndOffsets( el, 5, el, 5 );
			documentSelection._setTo( range );

			expect( documentSelection.isCollapsed ).to.be.true;
		} );

		it( 'should return false when there are multiple ranges', () => {
			const range1 = Range._createFromParentsAndOffsets( el, 5, el, 5 );
			const range2 = Range._createFromParentsAndOffsets( el, 15, el, 15 );
			documentSelection._setTo( [ range1, range2 ] );

			expect( documentSelection.isCollapsed ).to.be.false;
		} );

		it( 'should return false when there is not collapsed range', () => {
			const range = Range._createFromParentsAndOffsets( el, 15, el, 16 );
			documentSelection._setTo( range );

			expect( documentSelection.isCollapsed ).to.be.false;
		} );
	} );

	describe( 'rangeCount', () => {
		it( 'should return proper range count', () => {
			expect( documentSelection.rangeCount ).to.equal( 0 );

			documentSelection._setTo( range1 );

			expect( documentSelection.rangeCount ).to.equal( 1 );

			documentSelection._setTo( [ range1, range2 ] );

			expect( documentSelection.rangeCount ).to.equal( 2 );
		} );
	} );

	describe( 'isBackward', () => {
		it( 'is defined by the last added range', () => {
			const range1 = Range._createFromParentsAndOffsets( el, 5, el, 10 );
			const range2 = Range._createFromParentsAndOffsets( el, 15, el, 16 );

			documentSelection._setTo( range1, { backward: true } );
			expect( documentSelection ).to.have.property( 'isBackward', true );

			documentSelection._setTo( [ range1, range2 ] );
			expect( documentSelection ).to.have.property( 'isBackward', false );
		} );

		it( 'is false when last range is collapsed', () => {
			const range = Range._createFromParentsAndOffsets( el, 5, el, 5 );

			documentSelection._setTo( range, { backward: true } );

			expect( documentSelection.isBackward ).to.be.false;
		} );
	} );

	describe( 'getRanges', () => {
		it( 'should return iterator with copies of all ranges', () => {
			documentSelection._setTo( [ range1, range2 ] );

			const iterable = documentSelection.getRanges();
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
			documentSelection._setTo( [ range1, range2, range3 ] );

			const range = documentSelection.getFirstRange();

			expect( range.isEqual( range2 ) ).to.be.true;
			expect( range ).to.not.equal( range2 );
		} );

		it( 'should return null if no ranges are present', () => {
			expect( documentSelection.getFirstRange() ).to.be.null;
		} );
	} );

	describe( 'getLastRange', () => {
		it( 'should return copy of range with last position', () => {
			documentSelection._setTo( [ range1, range2, range3 ] );

			const range = documentSelection.getLastRange();

			expect( range.isEqual( range3 ) ).to.be.true;
			expect( range ).to.not.equal( range3 );
		} );

		it( 'should return null if no ranges are present', () => {
			expect( documentSelection.getLastRange() ).to.be.null;
		} );
	} );

	describe( 'getFirstPosition', () => {
		it( 'should return copy of first position', () => {
			documentSelection._setTo( [ range1, range2, range3 ] );

			const position = documentSelection.getFirstPosition();

			expect( position.isEqual( range2.start ) ).to.be.true;
			expect( position ).to.not.equal( range2.start );
		} );

		it( 'should return null if no ranges are present', () => {
			expect( documentSelection.getFirstPosition() ).to.be.null;
		} );
	} );

	describe( 'getLastPosition', () => {
		it( 'should return copy of range with last position', () => {
			documentSelection._setTo( [ range1, range2, range3 ] );

			const position = documentSelection.getLastPosition();

			expect( position.isEqual( range3.end ) ).to.be.true;
			expect( position ).to.not.equal( range3.end );
		} );

		it( 'should return null if no ranges are present', () => {
			expect( documentSelection.getLastPosition() ).to.be.null;
		} );
	} );

	describe( 'isEqual', () => {
		it( 'should return true if selections equal', () => {
			documentSelection._setTo( [ range1, range2 ] );

			const otherSelection = new DocumentSelection();
			otherSelection._setTo( [ range1, range2 ] );

			expect( documentSelection.isEqual( otherSelection ) ).to.be.true;
		} );

		it( 'should return true if selections equal - DocumentSelection and Selection', () => {
			documentSelection._setTo( [ range1, range2 ] );

			const otherSelection = new Selection();
			otherSelection.setTo( [ range1, range2 ] );

			expect( documentSelection.isEqual( otherSelection ) ).to.be.true;
		} );

		it( 'should return true if backward selections equal', () => {
			documentSelection._setTo( range1, { backward: true } );

			const otherSelection = new DocumentSelection( [ range1 ], { backward: true } );

			expect( documentSelection.isEqual( otherSelection ) ).to.be.true;
		} );

		it( 'should return true if backward selections equal - DocumentSelection and Selection', () => {
			documentSelection._setTo( range1, { backward: true } );

			const otherSelection = new Selection( [ range1 ], { backward: true } );

			expect( documentSelection.isEqual( otherSelection ) ).to.be.true;
		} );

		it( 'should return false if ranges count does not equal', () => {
			documentSelection._setTo( [ range1, range2 ] );

			const otherSelection = new DocumentSelection( [ range1 ] );

			expect( documentSelection.isEqual( otherSelection ) ).to.be.false;
		} );

		it( 'should return false if ranges count does not equal - DocumentSelection and Selection', () => {
			documentSelection._setTo( [ range1, range2 ] );

			const otherSelection = new Selection( [ range1 ] );

			expect( documentSelection.isEqual( otherSelection ) ).to.be.false;
		} );

		it( 'should return false if ranges (other than the last added one) do not equal', () => {
			documentSelection._setTo( [ range1, range3 ] );

			const otherSelection = new DocumentSelection( [ range2, range3 ] );

			expect( documentSelection.isEqual( otherSelection ) ).to.be.false;
		} );

		it( 'should return false if ranges (other than the last added one) do not equal - DocumentSelection and Selection', () => {
			documentSelection._setTo( [ range1, range3 ] );

			const otherSelection = new Selection( [ range2, range3 ] );

			expect( documentSelection.isEqual( otherSelection ) ).to.be.false;
		} );

		it( 'should return false if directions do not equal', () => {
			documentSelection._setTo( range1 );

			const otherSelection = new DocumentSelection( [ range1 ], { backward: true } );

			expect( documentSelection.isEqual( otherSelection ) ).to.be.false;
		} );

		it( 'should return false if directions do not equal - DocumentSelection and Selection', () => {
			documentSelection._setTo( range1 );

			const otherSelection = new Selection( [ range1 ], { backward: true } );

			expect( documentSelection.isEqual( otherSelection ) ).to.be.false;
		} );

		it( 'should return false if one selection is fake', () => {
			const otherSelection = new DocumentSelection( null, { fake: true } );

			expect( documentSelection.isEqual( otherSelection ) ).to.be.false;
		} );

		it( 'should return true if both selection are fake - DocumentSelection and Selection', () => {
			const otherSelection = new Selection( range1, { fake: true } );
			documentSelection._setTo( range1, { fake: true } );

			expect( documentSelection.isEqual( otherSelection ) ).to.be.true;
		} );

		it( 'should return false if both selection are fake but have different label', () => {
			const otherSelection = new DocumentSelection( [ range1 ], { fake: true, label: 'foo bar baz' } );
			documentSelection._setTo( range1, { fake: true, label: 'foo' } );

			expect( documentSelection.isEqual( otherSelection ) ).to.be.false;
		} );

		it( 'should return false if both selection are fake but have different label - DocumentSelection and Selection', () => {
			const otherSelection = new Selection( [ range1 ], { fake: true, label: 'foo bar baz' } );
			documentSelection._setTo( range1, { fake: true, label: 'foo' } );

			expect( documentSelection.isEqual( otherSelection ) ).to.be.false;
		} );

		it( 'should return true if both selections are empty', () => {
			const otherSelection = new DocumentSelection();

			expect( documentSelection.isEqual( otherSelection ) ).to.be.true;
		} );

		it( 'should return true if both selections are empty - DocumentSelection and Selection', () => {
			const otherSelection = new Selection();

			expect( documentSelection.isEqual( otherSelection ) ).to.be.true;
		} );
	} );

	describe( 'isSimilar', () => {
		it( 'should return true if selections equal', () => {
			documentSelection._setTo( [ range1, range2 ] );

			const otherSelection = new DocumentSelection( [ range1, range2 ] );

			expect( documentSelection.isSimilar( otherSelection ) ).to.be.true;
		} );

		it( 'should return true if selections equal - DocumentSelection and Selection', () => {
			documentSelection._setTo( [ range1, range2 ] );

			const otherSelection = new Selection( [ range1, range2 ] );

			expect( documentSelection.isSimilar( otherSelection ) ).to.be.true;
		} );

		it( 'should return false if ranges count does not equal', () => {
			documentSelection._setTo( [ range1, range2 ] );

			const otherSelection = new DocumentSelection( [ range1 ] );

			expect( documentSelection.isSimilar( otherSelection ) ).to.be.false;
		} );

		it( 'should return false if ranges count does not equal - DocumentSelection and Selection', () => {
			documentSelection._setTo( [ range1, range2 ] );

			const otherSelection = new Selection( [ range1 ] );

			expect( documentSelection.isSimilar( otherSelection ) ).to.be.false;
		} );

		it( 'should return false if trimmed ranges (other than the last added one) are not equal', () => {
			documentSelection._setTo( [ range1, range3 ] );

			const otherSelection = new DocumentSelection( [ range2, range3 ] );

			expect( documentSelection.isSimilar( otherSelection ) ).to.be.false;
		} );

		it( 'should return false if trimmed ranges (other than the last added one) are not equal - with Selection', () => {
			documentSelection._setTo( [ range1, range3 ] );

			const otherSelection = new Selection( [ range2, range3 ] );

			expect( documentSelection.isSimilar( otherSelection ) ).to.be.false;
		} );

		it( 'should return false if directions are not equal', () => {
			documentSelection._setTo( range1 );

			const otherSelection = new DocumentSelection( [ range1 ], { backward: true } );

			expect( documentSelection.isSimilar( otherSelection ) ).to.be.false;
		} );

		it( 'should return false if directions are not equal - DocumentSelection and Selection', () => {
			documentSelection._setTo( range1 );

			const otherSelection = new Selection( [ range1 ], { backward: true } );

			expect( documentSelection.isSimilar( otherSelection ) ).to.be.false;
		} );

		it( 'should return true if both selections are empty', () => {
			const otherSelection = new DocumentSelection();

			expect( documentSelection.isSimilar( otherSelection ) ).to.be.true;
		} );

		it( 'should return true if both selections are empty - DocumentSelection and Selection', () => {
			const otherSelection = new Selection();

			expect( documentSelection.isSimilar( otherSelection ) ).to.be.true;
		} );

		it( 'should return true if all ranges trimmed from both selections are equal', () => {
			const view = parse(
				'<container:p><attribute:span></attribute:span></container:p>' +
				'<container:p><attribute:span>xx</attribute:span></container:p>'
			);

			const p1 = view.getChild( 0 );
			const p2 = view.getChild( 1 );
			const span1 = p1.getChild( 0 );
			const span2 = p2.getChild( 0 );

			// <p>[<span>{]</span>}</p><p>[<span>{xx}</span>]</p>
			const rangeA1 = Range._createFromParentsAndOffsets( p1, 0, span1, 0 );
			const rangeB1 = Range._createFromParentsAndOffsets( span1, 0, p1, 1 );
			const rangeA2 = Range._createFromParentsAndOffsets( p2, 0, p2, 1 );
			const rangeB2 = Range._createFromParentsAndOffsets( span2, 0, span2, 1 );

			documentSelection._setTo( [ rangeA1, rangeA2 ] );

			const otherSelection = new DocumentSelection( [ rangeB2, rangeB1 ] );

			expect( documentSelection.isSimilar( otherSelection ) ).to.be.true;
			expect( otherSelection.isSimilar( documentSelection ) ).to.be.true;

			expect( documentSelection.isEqual( otherSelection ) ).to.be.false;
			expect( otherSelection.isEqual( documentSelection ) ).to.be.false;
		} );

		it( 'should return true if all ranges trimmed from both selections are equal - DocumentSelection and Selection', () => {
			const view = parse(
				'<container:p><attribute:span></attribute:span></container:p>' +
				'<container:p><attribute:span>xx</attribute:span></container:p>'
			);

			const p1 = view.getChild( 0 );
			const p2 = view.getChild( 1 );
			const span1 = p1.getChild( 0 );
			const span2 = p2.getChild( 0 );

			// <p>[<span>{]</span>}</p><p>[<span>{xx}</span>]</p>
			const rangeA1 = Range._createFromParentsAndOffsets( p1, 0, span1, 0 );
			const rangeB1 = Range._createFromParentsAndOffsets( span1, 0, p1, 1 );
			const rangeA2 = Range._createFromParentsAndOffsets( p2, 0, p2, 1 );
			const rangeB2 = Range._createFromParentsAndOffsets( span2, 0, span2, 1 );

			documentSelection._setTo( [ rangeA1, rangeA2 ] );

			const otherSelection = new Selection( [ rangeB2, rangeB1 ] );

			expect( documentSelection.isSimilar( otherSelection ) ).to.be.true;
			expect( otherSelection.isSimilar( documentSelection ) ).to.be.true;

			expect( documentSelection.isEqual( otherSelection ) ).to.be.false;
			expect( otherSelection.isEqual( documentSelection ) ).to.be.false;
		} );
	} );

	describe( 'is()', () => {
		it( 'should return true for selection', () => {
			expect( documentSelection.is( 'selection' ) ).to.be.true;
			expect( documentSelection.is( 'view:selection' ) ).to.be.true;
		} );

		it( 'should return true for documentSelection', () => {
			expect( documentSelection.is( 'documentSelection' ) ).to.be.true;
			expect( documentSelection.is( 'view:documentSelection' ) ).to.be.true;
		} );

		it( 'should return false for other values', () => {
			expect( documentSelection.is( 'node' ) ).to.be.false;
			expect( documentSelection.is( 'view:node' ) ).to.be.false;
			expect( documentSelection.is( '$text' ) ).to.be.false;
			expect( documentSelection.is( 'view:$text' ) ).to.be.false;
			expect( documentSelection.is( '$textProxy' ) ).to.be.false;
			expect( documentSelection.is( 'element' ) ).to.be.false;
			expect( documentSelection.is( 'rootElement' ) ).to.be.false;
			expect( documentSelection.is( 'model:selection' ) ).to.be.false;
			expect( documentSelection.is( 'model:documentSelection' ) ).to.be.false;
		} );
	} );

	describe( '_setTo()', () => {
		describe( 'simple scenarios', () => {
			it( 'should set selection ranges from the given selection', () => {
				documentSelection._setTo( range1 );

				const otherSelection = new DocumentSelection( [ range2, range3 ], { backward: true } );

				documentSelection._setTo( otherSelection );

				expect( documentSelection.rangeCount ).to.equal( 2 );
				expect( documentSelection._ranges[ 0 ].isEqual( range2 ) ).to.be.true;
				expect( documentSelection._ranges[ 0 ] ).is.not.equal( range2 );
				expect( documentSelection._ranges[ 1 ].isEqual( range3 ) ).to.be.true;
				expect( documentSelection._ranges[ 1 ] ).is.not.equal( range3 );

				expect( documentSelection.anchor.isEqual( range3.end ) ).to.be.true;
			} );

			it( 'should set selection on the given Range', () => {
				documentSelection._setTo( range1 );

				expect( Array.from( documentSelection.getRanges() ) ).to.deep.equal( [ range1 ] );
				expect( documentSelection.isBackward ).to.be.false;
			} );

			it( 'should set selection on the given iterable of Ranges', () => {
				documentSelection._setTo( new Set( [ range1, range2 ] ) );

				expect( Array.from( documentSelection.getRanges() ) ).to.deep.equal( [ range1, range2 ] );
				expect( documentSelection.isBackward ).to.be.false;
			} );

			it( 'should set collapsed selection on the given Position', () => {
				documentSelection._setTo( range1.start );

				expect( Array.from( documentSelection.getRanges() ).length ).to.equal( 1 );
				expect( Array.from( documentSelection.getRanges() )[ 0 ].start ).to.deep.equal( range1.start );
				expect( documentSelection.isBackward ).to.be.false;
				expect( documentSelection.isCollapsed ).to.be.true;
			} );

			it( 'should fire change event', done => {
				documentSelection.on( 'change', () => {
					expect( documentSelection.rangeCount ).to.equal( 1 );
					expect( documentSelection.getFirstRange().isEqual( range1 ) ).to.be.true;
					done();
				} );

				const otherSelection = new DocumentSelection( [ range1 ] );

				documentSelection._setTo( otherSelection );
			} );

			it( 'should set fake state and label', () => {
				const label = 'foo bar baz';
				const otherSelection = new DocumentSelection( null, { fake: true, label } );
				documentSelection._setTo( otherSelection );

				expect( documentSelection.isFake ).to.be.true;
				expect( documentSelection.fakeSelectionLabel ).to.equal( label );
			} );

			it( 'should throw an error when trying to set to not selectable', () => {
				const otherSelection = new DocumentSelection();

				expectToThrowCKEditorError( () => {
					otherSelection._setTo( {} );
				}, 'view-selection-setto-not-selectable' );
			} );

			it( 'should throw an error when trying to set to not selectable #2', () => {
				const otherSelection = new DocumentSelection();

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
				const position = new Position( el, 4 );

				documentSelection._setTo( position );
				const range = documentSelection.getFirstRange();

				expect( range.start.parent ).to.equal( el );
				expect( range.start.offset ).to.equal( 4 );
				expect( range.start.isEqual( range.end ) ).to.be.true;
			} );

			it( 'should collapse selection at node and offset', () => {
				const foo = new Text( document, 'foo' );
				const p = new Element( document, 'p', null, foo );

				documentSelection._setTo( foo, 0 );
				let range = documentSelection.getFirstRange();

				expect( range.start.parent ).to.equal( foo );
				expect( range.start.offset ).to.equal( 0 );
				expect( range.start.isEqual( range.end ) ).to.be.true;

				documentSelection._setTo( p, 1 );
				range = documentSelection.getFirstRange();

				expect( range.start.parent ).to.equal( p );
				expect( range.start.offset ).to.equal( 1 );
				expect( range.start.isEqual( range.end ) ).to.be.true;
			} );

			it( 'should throw an error when the second parameter is not passed and first is an item', () => {
				const foo = new Text( document, 'foo' );

				expectToThrowCKEditorError( () => {
					documentSelection._setTo( foo );
				}, 'view-selection-setto-required-second-parameter', documentSelection );
			} );

			it( 'should collapse selection at node and flag', () => {
				const foo = new Text( document, 'foo' );
				const p = new Element( document, 'p', null, foo );

				documentSelection._setTo( foo, 'end' );
				let range = documentSelection.getFirstRange();

				expect( range.start.parent ).to.equal( foo );
				expect( range.start.offset ).to.equal( 3 );
				expect( range.start.isEqual( range.end ) ).to.be.true;

				documentSelection._setTo( foo, 'before' );
				range = documentSelection.getFirstRange();

				expect( range.start.parent ).to.equal( p );
				expect( range.start.offset ).to.equal( 0 );
				expect( range.start.isEqual( range.end ) ).to.be.true;

				documentSelection._setTo( foo, 'after' );
				range = documentSelection.getFirstRange();

				expect( range.start.parent ).to.equal( p );
				expect( range.start.offset ).to.equal( 1 );
				expect( range.start.isEqual( range.end ) ).to.be.true;
			} );
		} );

		describe( 'setting collapsed selection at start', () => {
			it( 'should collapse to start position and fire change event', done => {
				documentSelection._setTo( [ range1, range2, range3 ] );
				documentSelection.once( 'change', () => {
					expect( documentSelection.rangeCount ).to.equal( 1 );
					expect( documentSelection.isCollapsed ).to.be.true;
					expect( documentSelection._ranges[ 0 ].start.isEqual( range2.start ) ).to.be.true;
					done();
				} );

				documentSelection._setTo( documentSelection.getFirstPosition() );
			} );
		} );

		describe( 'setting collapsed selection to end', () => {
			it( 'should collapse to end position and fire change event', done => {
				documentSelection._setTo( [ range1, range2, range3 ] );
				documentSelection.once( 'change', () => {
					expect( documentSelection.rangeCount ).to.equal( 1 );
					expect( documentSelection.isCollapsed ).to.be.true;
					expect( documentSelection._ranges[ 0 ].end.isEqual( range3.end ) ).to.be.true;
					done();
				} );

				documentSelection._setTo( documentSelection.getLastPosition() );
			} );
		} );

		describe( 'removing all ranges', () => {
			it( 'should remove all ranges and fire change event', done => {
				documentSelection._setTo( [ range1, range2 ] );

				documentSelection.once( 'change', () => {
					expect( documentSelection.rangeCount ).to.equal( 0 );
					done();
				} );

				documentSelection._setTo( null );
			} );
		} );

		describe( 'setting fake selection', () => {
			it( 'should allow to set selection to fake', () => {
				documentSelection._setTo( range1, { fake: true } );

				expect( documentSelection.isFake ).to.be.true;
			} );

			it( 'should allow to set fake selection label', () => {
				const label = 'foo bar baz';
				documentSelection._setTo( range1, { fake: true, label } );

				expect( documentSelection.fakeSelectionLabel ).to.equal( label );
			} );

			it( 'should not set label when set to false', () => {
				const label = 'foo bar baz';
				documentSelection._setTo( range1, { fake: false, label } );

				expect( documentSelection.fakeSelectionLabel ).to.equal( '' );
			} );

			it( 'should reset label when set to false', () => {
				const label = 'foo bar baz';
				documentSelection._setTo( range1, { fake: true, label } );
				documentSelection._setTo( range1 );

				expect( documentSelection.fakeSelectionLabel ).to.equal( '' );
			} );

			it( 'should fire change event', done => {
				documentSelection.once( 'change', () => {
					expect( documentSelection.isFake ).to.be.true;
					expect( documentSelection.fakeSelectionLabel ).to.equal( 'foo bar baz' );

					done();
				} );

				documentSelection._setTo( range1, { fake: true, label: 'foo bar baz' } );
			} );

			it( 'should be possible to create an empty fake selection', () => {
				documentSelection._setTo( null, { fake: true, label: 'foo bar baz' } );

				expect( documentSelection.fakeSelectionLabel ).to.equal( 'foo bar baz' );
				expect( documentSelection.isFake ).to.be.true;
			} );
		} );

		describe( 'setting selection to itself', () => {
			it( 'should correctly set ranges when setting to the same selection', () => {
				documentSelection._setTo( [ range1, range2 ] );
				documentSelection._setTo( documentSelection );

				const ranges = Array.from( documentSelection.getRanges() );
				expect( ranges.length ).to.equal( 2 );

				expect( ranges[ 0 ].isEqual( range1 ) ).to.be.true;
				expect( ranges[ 1 ].isEqual( range2 ) ).to.be.true;
			} );

			it( 'should correctly set ranges when setting to the same selection\'s ranges', () => {
				documentSelection._setTo( [ range1, range2 ] );
				documentSelection._setTo( documentSelection.getRanges() );

				const ranges = Array.from( documentSelection.getRanges() );
				expect( ranges.length ).to.equal( 2 );

				expect( ranges[ 0 ].isEqual( range1 ) ).to.be.true;
				expect( ranges[ 1 ].isEqual( range2 ) ).to.be.true;
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
				const range2 = Range._createFromParentsAndOffsets( text, 7, text, 15 );

				expectToThrowCKEditorError( () => {
					documentSelection._setTo( [ range1, range2 ] );
				}, 'view-selection-range-intersects', documentSelection );
			} );
		} );

		it( 'should allow setting selection on an item', () => {
			const textNode1 = new Text( document, 'foo' );
			const textNode2 = new Text( document, 'bar' );
			const textNode3 = new Text( document, 'baz' );
			const element = new Element( document, 'p', null, [ textNode1, textNode2, textNode3 ] );

			documentSelection._setTo( textNode2, 'on' );

			const ranges = Array.from( documentSelection.getRanges() );
			expect( ranges.length ).to.equal( 1 );
			expect( ranges[ 0 ].start.parent ).to.equal( element );
			expect( ranges[ 0 ].start.offset ).to.deep.equal( 1 );
			expect( ranges[ 0 ].end.parent ).to.equal( element );
			expect( ranges[ 0 ].end.offset ).to.deep.equal( 2 );
		} );

		it( 'should allow setting selection inside an element', () => {
			const element = new Element( document, 'p', null, [ new Text( document, 'foo' ), new Text( document, 'bar' ) ] );

			documentSelection._setTo( element, 'in' );

			const ranges = Array.from( documentSelection.getRanges() );
			expect( ranges.length ).to.equal( 1 );
			expect( ranges[ 0 ].start.parent ).to.equal( element );
			expect( ranges[ 0 ].start.offset ).to.deep.equal( 0 );
			expect( ranges[ 0 ].end.parent ).to.equal( element );
			expect( ranges[ 0 ].end.offset ).to.deep.equal( 2 );
		} );

		it( 'should allow setting backward selection inside an element', () => {
			const element = new Element( document, 'p', null, [ new Text( document, 'foo' ), new Text( document, 'bar' ) ] );

			documentSelection._setTo( element, 'in', { backward: true } );

			const ranges = Array.from( documentSelection.getRanges() );
			expect( ranges.length ).to.equal( 1 );
			expect( ranges[ 0 ].start.parent ).to.equal( element );
			expect( ranges[ 0 ].start.offset ).to.deep.equal( 0 );
			expect( ranges[ 0 ].end.parent ).to.equal( element );
			expect( ranges[ 0 ].end.offset ).to.deep.equal( 2 );
			expect( documentSelection.isBackward ).to.be.true;
		} );
	} );

	describe( 'getEditableElement()', () => {
		it( 'should return null if no ranges in selection', () => {
			expect( documentSelection.editableElement ).to.be.null;
		} );

		it( 'should return null if selection is placed in container that is not EditableElement', () => {
			documentSelection._setTo( range1 );

			expect( documentSelection.editableElement ).to.be.null;
		} );

		it( 'should return EditableElement when selection is placed inside', () => {
			const viewDocument = new Document( new StylesProcessor() );
			documentSelection._setTo( viewDocument.selection );
			const root = createViewRoot( viewDocument, 'div', 'main' );
			const element = new Element( document, 'p' );
			root._appendChild( element );

			documentSelection._setTo( Range._createFromParentsAndOffsets( element, 0, element, 0 ) );

			expect( documentSelection.editableElement ).to.equal( root );
		} );
	} );

	describe( 'isFake', () => {
		it( 'should be false for newly created instance', () => {
			expect( documentSelection.isFake ).to.be.false;
		} );
	} );

	describe( 'getSelectedElement()', () => {
		it( 'should return selected element', () => {
			const { selection: documentSelection, view } = parse( 'foo [<b>bar</b>] baz' );
			const b = view.getChild( 1 );

			expect( documentSelection.getSelectedElement() ).to.equal( b );
		} );

		it( 'should return null if there is more than one range', () => {
			const { selection: documentSelection } = parse( 'foo [<b>bar</b>] [<i>baz</i>]' );

			expect( documentSelection.getSelectedElement() ).to.be.null;
		} );

		it( 'should return null if there is no selection', () => {
			expect( documentSelection.getSelectedElement() ).to.be.null;
		} );

		it( 'should return null if selection is not over single element #1', () => {
			const { selection: documentSelection } = parse( 'foo [<b>bar</b> ba}z' );

			expect( documentSelection.getSelectedElement() ).to.be.null;
		} );

		it( 'should return null if selection is not over single element #2', () => {
			const { selection: documentSelection } = parse( 'foo <b>{bar}</b> baz' );

			expect( documentSelection.getSelectedElement() ).to.be.null;
		} );
	} );
} );
