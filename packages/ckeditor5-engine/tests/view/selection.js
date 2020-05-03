/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Selection from '../../src/view/selection';
import DocumentSelection from '../../src/view/documentselection';
import Range from '../../src/view/range';
import Document from '../../src/view/document';
import Element from '../../src/view/element';
import Text from '../../src/view/text';
import Position from '../../src/view/position';

import count from '@ckeditor/ckeditor5-utils/src/count';
import createViewRoot from './_utils/createroot';
import { parse } from '../../src/dev-utils/view';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import { StylesProcessor } from '../../src/view/stylesmap';

describe( 'Selection', () => {
	let selection, el, range1, range2, range3, viewDocument;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		viewDocument = new Document( new StylesProcessor() );

		const text = new Text( viewDocument, 'xxxxxxxxxxxxxxxxxxxx' );
		el = new Element( viewDocument, 'p', null, text );

		selection = new Selection();

		range1 = Range._createFromParentsAndOffsets( text, 5, text, 10 );
		range2 = Range._createFromParentsAndOffsets( text, 1, text, 2 );
		range3 = Range._createFromParentsAndOffsets( text, 12, text, 14 );
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
			const selection = new Selection( ranges, { backward: true } );

			expect( selection.isBackward ).to.be.true;
		} );

		it( 'should be able to create a selection from the given range and isLastBackward flag', () => {
			const selection = new Selection( range1, { backward: true } );

			expect( Array.from( selection.getRanges() ) ).to.deep.equal( [ range1 ] );
			expect( selection.isBackward ).to.be.true;
		} );

		it( 'should be able to create a selection from the given iterable of ranges and isLastBackward flag', () => {
			const ranges = new Set( [ range1, range2, range3 ] );
			const selection = new Selection( ranges, { backward: false } );

			expect( Array.from( selection.getRanges() ) ).to.deep.equal( [ range1, range2, range3 ] );
			expect( selection.isBackward ).to.be.false;
		} );

		it( 'should be able to create a collapsed selection at the given position', () => {
			const position = range1.start;
			const selection = new Selection( position );

			expect( Array.from( selection.getRanges() ).length ).to.equal( 1 );
			expect( selection.getFirstRange().start ).to.deep.equal( position );
			expect( selection.getFirstRange().end ).to.deep.equal( position );
			expect( selection.isBackward ).to.be.false;
		} );

		it( 'should be able to create a collapsed selection at the given position', () => {
			const position = range1.start;
			const selection = new Selection( position );

			expect( Array.from( selection.getRanges() ).length ).to.equal( 1 );
			expect( selection.getFirstRange().start ).to.deep.equal( position );
			expect( selection.getFirstRange().end ).to.deep.equal( position );
			expect( selection.isBackward ).to.be.false;
		} );

		it( 'should be able to create a selection from the other selection', () => {
			const otherSelection = new Selection( [ range2, range3 ], { backward: true } );
			const selection = new Selection( otherSelection );

			expect( Array.from( selection.getRanges() ) ).to.deep.equal( [ range2, range3 ] );
			expect( selection.isBackward ).to.be.true;
		} );

		it( 'should be able to create a selection from the other document selection', () => {
			const otherSelection = new DocumentSelection( [ range2, range3 ], { backward: true } );
			const selection = new Selection( otherSelection );

			expect( Array.from( selection.getRanges() ) ).to.deep.equal( [ range2, range3 ] );
			expect( selection.isBackward ).to.be.true;
		} );

		it( 'should be able to create a fake selection from the other fake selection', () => {
			const otherSelection = new Selection( [ range2, range3 ], { fake: true, label: 'foo bar baz' } );
			const selection = new Selection( otherSelection );

			expect( selection.isFake ).to.be.true;
			expect( selection.fakeSelectionLabel ).to.equal( 'foo bar baz' );
		} );

		it( 'should throw an error when range is invalid', () => {
			expectToThrowCKEditorError( () => {
				// eslint-disable-next-line no-new
				new Selection( [ { invalid: 'range' } ] );
			}, /view-selection-add-range-not-range/ );
		} );

		it( 'should throw an error when ranges intersects', () => {
			const text = el.getChild( 0 );
			const range2 = Range._createFromParentsAndOffsets( text, 7, text, 15 );

			expectToThrowCKEditorError( () => {
				// eslint-disable-next-line no-new
				new Selection( [ range1, range2 ] );
			}, 'view-selection-range-intersects' );
		} );

		it( 'should throw an error when trying to set to not selectable', () => {
			expectToThrowCKEditorError( () => {
				// eslint-disable-next-line no-new
				new Selection( {} );
			}, /view-selection-setTo-not-selectable/ );
		} );
	} );

	describe( 'anchor', () => {
		it( 'should return null if no ranges in selection', () => {
			expect( selection.anchor ).to.be.null;
		} );

		it( 'should return start of single range in selection', () => {
			selection.setTo( range1 );
			const anchor = selection.anchor;

			expect( anchor.isEqual( range1.start ) ).to.be.true;
			expect( anchor ).to.not.equal( range1.start );
		} );

		it( 'should return end of single range in selection when added as backward', () => {
			selection.setTo( range1, { backward: true } );
			const anchor = selection.anchor;

			expect( anchor.isEqual( range1.end ) ).to.be.true;
			expect( anchor ).to.not.equal( range1.end );
		} );

		it( 'should get anchor from last inserted range', () => {
			selection.setTo( [ range1, range2 ] );

			expect( selection.anchor.isEqual( range2.start ) ).to.be.true;
		} );
	} );

	describe( 'focus', () => {
		it( 'should return null if no ranges in selection', () => {
			expect( selection.focus ).to.be.null;
		} );

		it( 'should return end of single range in selection', () => {
			selection.setTo( range1 );
			const focus = selection.focus;

			expect( focus.isEqual( range1.end ) ).to.be.true;
		} );

		it( 'should return start of single range in selection when added as backward', () => {
			selection.setTo( range1, { backward: true } );
			const focus = selection.focus;

			expect( focus.isEqual( range1.start ) ).to.be.true;
			expect( focus ).to.not.equal( range1.start );
		} );

		it( 'should get focus from last inserted range', () => {
			selection.setTo( [ range1, range2 ] );

			expect( selection.focus.isEqual( range2.end ) ).to.be.true;
		} );
	} );

	describe( 'setFocus()', () => {
		it( 'keeps all existing ranges when no modifications needed', () => {
			selection.setTo( range1 );
			selection.setFocus( selection.focus );

			expect( count( selection.getRanges() ) ).to.equal( 1 );
		} );

		it( 'throws if there are no ranges in selection', () => {
			const endPos = Position._createAt( el, 'end' );

			expectToThrowCKEditorError( () => {
				selection.setFocus( endPos );
			}, /view-selection-setFocus-no-ranges/ );
		} );

		it( 'modifies existing collapsed selection', () => {
			const startPos = Position._createAt( el, 1 );
			const endPos = Position._createAt( el, 2 );

			selection.setTo( startPos );

			selection.setFocus( endPos );

			expect( selection.anchor.compareWith( startPos ) ).to.equal( 'same' );
			expect( selection.focus.compareWith( endPos ) ).to.equal( 'same' );
		} );

		it( 'makes existing collapsed selection a backward selection', () => {
			const startPos = Position._createAt( el, 1 );
			const endPos = Position._createAt( el, 0 );

			selection.setTo( startPos );

			selection.setFocus( endPos );

			expect( selection.anchor.compareWith( startPos ) ).to.equal( 'same' );
			expect( selection.focus.compareWith( endPos ) ).to.equal( 'same' );
			expect( selection.isBackward ).to.be.true;
		} );

		it( 'modifies existing non-collapsed selection', () => {
			const startPos = Position._createAt( el, 1 );
			const endPos = Position._createAt( el, 2 );
			const newEndPos = Position._createAt( el, 3 );

			selection.setTo( new Range( startPos, endPos ) );

			selection.setFocus( newEndPos );

			expect( selection.anchor.compareWith( startPos ) ).to.equal( 'same' );
			expect( selection.focus.compareWith( newEndPos ) ).to.equal( 'same' );
		} );

		it( 'makes existing non-collapsed selection a backward selection', () => {
			const startPos = Position._createAt( el, 1 );
			const endPos = Position._createAt( el, 2 );
			const newEndPos = Position._createAt( el, 0 );

			selection.setTo( new Range( startPos, endPos ) );

			selection.setFocus( newEndPos );

			expect( selection.anchor.compareWith( startPos ) ).to.equal( 'same' );
			expect( selection.focus.compareWith( newEndPos ) ).to.equal( 'same' );
			expect( selection.isBackward ).to.be.true;
		} );

		it( 'makes existing backward selection a forward selection', () => {
			const startPos = Position._createAt( el, 1 );
			const endPos = Position._createAt( el, 2 );
			const newEndPos = Position._createAt( el, 3 );

			selection.setTo( new Range( startPos, endPos ), { backward: true } );

			selection.setFocus( newEndPos );

			expect( selection.anchor.compareWith( endPos ) ).to.equal( 'same' );
			expect( selection.focus.compareWith( newEndPos ) ).to.equal( 'same' );
			expect( selection.isBackward ).to.be.false;
		} );

		it( 'modifies existing backward selection', () => {
			const startPos = Position._createAt( el, 1 );
			const endPos = Position._createAt( el, 2 );
			const newEndPos = Position._createAt( el, 0 );

			selection.setTo( new Range( startPos, endPos ), { backward: true } );

			selection.setFocus( newEndPos );

			expect( selection.anchor.compareWith( endPos ) ).to.equal( 'same' );
			expect( selection.focus.compareWith( newEndPos ) ).to.equal( 'same' );
			expect( selection.isBackward ).to.be.true;
		} );

		it( 'modifies only the last range', () => {
			// Offsets are chosen in this way that the order of adding ranges must count, not their document order.
			const startPos1 = Position._createAt( el, 4 );
			const endPos1 = Position._createAt( el, 5 );
			const startPos2 = Position._createAt( el, 1 );
			const endPos2 = Position._createAt( el, 2 );

			const newEndPos = Position._createAt( el, 0 );

			selection.setTo( [
				new Range( startPos1, endPos1 ),
				new Range( startPos2, endPos2 )
			] );

			selection.setFocus( newEndPos );

			const ranges = Array.from( selection.getRanges() );

			expect( ranges ).to.have.lengthOf( 2 );
			expect( ranges[ 0 ].start.compareWith( startPos1 ) ).to.equal( 'same' );
			expect( ranges[ 0 ].end.compareWith( endPos1 ) ).to.equal( 'same' );

			expect( selection.anchor.compareWith( startPos2 ) ).to.equal( 'same' );
			expect( selection.focus.compareWith( newEndPos ) ).to.equal( 'same' );
			expect( selection.isBackward ).to.be.true;
		} );

		it( 'collapses the selection when extending to the anchor', () => {
			const startPos = Position._createAt( el, 1 );
			const endPos = Position._createAt( el, 2 );

			selection.setTo( new Range( startPos, endPos ) );

			selection.setFocus( startPos );

			expect( selection.focus.compareWith( startPos ) ).to.equal( 'same' );
			expect( selection.isCollapsed ).to.be.true;
		} );
	} );

	describe( 'isCollapsed', () => {
		it( 'should return true when there is single collapsed range', () => {
			const range = Range._createFromParentsAndOffsets( el, 5, el, 5 );
			selection.setTo( range );

			expect( selection.isCollapsed ).to.be.true;
		} );

		it( 'should return false when there are multiple ranges', () => {
			const range1 = Range._createFromParentsAndOffsets( el, 5, el, 5 );
			const range2 = Range._createFromParentsAndOffsets( el, 15, el, 15 );
			selection.setTo( [ range1, range2 ] );

			expect( selection.isCollapsed ).to.be.false;
		} );

		it( 'should return false when there is not collapsed range', () => {
			const range = Range._createFromParentsAndOffsets( el, 15, el, 16 );
			selection.setTo( range );

			expect( selection.isCollapsed ).to.be.false;
		} );
	} );

	describe( 'rangeCount', () => {
		it( 'should return proper range count', () => {
			expect( selection.rangeCount ).to.equal( 0 );

			selection.setTo( range1 );

			expect( selection.rangeCount ).to.equal( 1 );

			selection.setTo( [ range1, range2 ] );

			expect( selection.rangeCount ).to.equal( 2 );
		} );
	} );

	describe( 'isBackward', () => {
		it( 'is defined by the last added range', () => {
			const range1 = Range._createFromParentsAndOffsets( el, 5, el, 10 );
			const range2 = Range._createFromParentsAndOffsets( el, 15, el, 16 );

			selection.setTo( range1, { backward: true } );
			expect( selection ).to.have.property( 'isBackward', true );

			selection.setTo( [ range1, range2 ] );
			expect( selection ).to.have.property( 'isBackward', false );
		} );

		it( 'is false when last range is collapsed', () => {
			const range = Range._createFromParentsAndOffsets( el, 5, el, 5 );

			selection.setTo( range, { backward: true } );

			expect( selection.isBackward ).to.be.false;
		} );
	} );

	describe( 'getRanges', () => {
		it( 'should return iterator with copies of all ranges', () => {
			selection.setTo( [ range1, range2 ] );

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
			selection.setTo( [ range1, range2, range3 ] );

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
			selection.setTo( [ range1, range2, range3 ] );

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
			selection.setTo( [ range1, range2, range3 ] );

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
			selection.setTo( [ range1, range2, range3 ] );

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
			selection.setTo( [ range1, range2 ] );

			const otherSelection = new Selection();
			otherSelection.setTo( [ range1, range2 ] );

			expect( selection.isEqual( otherSelection ) ).to.be.true;
		} );

		it( 'should return true if backward selections equal', () => {
			selection.setTo( range1, { backward: true } );

			const otherSelection = new Selection( [ range1 ], { backward: true } );

			expect( selection.isEqual( otherSelection ) ).to.be.true;
		} );

		it( 'should return false if ranges count does not equal', () => {
			selection.setTo( [ range1, range2 ] );

			const otherSelection = new Selection( [ range1 ] );

			expect( selection.isEqual( otherSelection ) ).to.be.false;
		} );

		it( 'should return false if ranges (other than the last added one) do not equal', () => {
			selection.setTo( [ range1, range3 ] );

			const otherSelection = new Selection( [ range2, range3 ] );

			expect( selection.isEqual( otherSelection ) ).to.be.false;
		} );

		it( 'should return false if directions do not equal', () => {
			selection.setTo( range1 );

			const otherSelection = new Selection( [ range1 ], { backward: true } );

			expect( selection.isEqual( otherSelection ) ).to.be.false;
		} );

		it( 'should return false if one selection is fake', () => {
			const otherSelection = new Selection( null, { fake: true } );

			expect( selection.isEqual( otherSelection ) ).to.be.false;
		} );

		it( 'should return true if both selection are fake', () => {
			const otherSelection = new Selection( range1, { fake: true } );
			selection.setTo( range1, { fake: true } );

			expect( selection.isEqual( otherSelection ) ).to.be.true;
		} );

		it( 'should return false if both selection are fake but have different label', () => {
			const otherSelection = new Selection( [ range1 ], { fake: true, label: 'foo bar baz' } );
			selection.setTo( range1, { fake: true, label: 'foo' } );

			expect( selection.isEqual( otherSelection ) ).to.be.false;
		} );

		it( 'should return true if both selections are empty', () => {
			const otherSelection = new Selection();

			expect( selection.isEqual( otherSelection ) ).to.be.true;
		} );
	} );

	describe( 'isSimilar', () => {
		it( 'should return true if selections equal', () => {
			selection.setTo( [ range1, range2 ] );

			const otherSelection = new Selection( [ range1, range2 ] );

			expect( selection.isSimilar( otherSelection ) ).to.be.true;
		} );

		it( 'should return false if ranges count does not equal', () => {
			selection.setTo( [ range1, range2 ] );

			const otherSelection = new Selection( [ range1 ] );

			expect( selection.isSimilar( otherSelection ) ).to.be.false;
		} );

		it( 'should return false if trimmed ranges (other than the last added one) are not equal', () => {
			selection.setTo( [ range1, range3 ] );

			const otherSelection = new Selection( [ range2, range3 ] );

			expect( selection.isSimilar( otherSelection ) ).to.be.false;
		} );

		it( 'should return false if directions are not equal', () => {
			selection.setTo( range1 );

			const otherSelection = new Selection( [ range1 ], { backward: true } );

			expect( selection.isSimilar( otherSelection ) ).to.be.false;
		} );

		it( 'should return true if both selections are empty', () => {
			const otherSelection = new Selection();

			expect( selection.isSimilar( otherSelection ) ).to.be.true;
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

			selection.setTo( [ rangeA1, rangeA2 ] );

			const otherSelection = new Selection( [ rangeB2, rangeB1 ] );

			expect( selection.isSimilar( otherSelection ) ).to.be.true;
			expect( otherSelection.isSimilar( selection ) ).to.be.true;

			expect( selection.isEqual( otherSelection ) ).to.be.false;
			expect( otherSelection.isEqual( selection ) ).to.be.false;
		} );
	} );

	describe( 'is()', () => {
		it( 'should return true for selection', () => {
			expect( selection.is( 'selection' ) ).to.be.true;
			expect( selection.is( 'view:selection' ) ).to.be.true;
		} );

		it( 'should return false for other values', () => {
			expect( selection.is( 'documentSelection' ) ).to.be.false;
			expect( selection.is( 'view:documentSelection' ) ).to.be.false;
			expect( selection.is( 'node' ) ).to.be.false;
			expect( selection.is( 'text' ) ).to.be.false;
			expect( selection.is( 'textProxy' ) ).to.be.false;
			expect( selection.is( 'element' ) ).to.be.false;
			expect( selection.is( 'rootElement' ) ).to.be.false;
			expect( selection.is( 'model:selection' ) ).to.be.false;
		} );
	} );

	describe( 'setTo()', () => {
		describe( 'simple scenarios', () => {
			it( 'should set selection ranges from the given selection', () => {
				selection.setTo( range1 );

				const otherSelection = new Selection( [ range2, range3 ], { backward: true } );

				selection.setTo( otherSelection );

				expect( selection.rangeCount ).to.equal( 2 );
				expect( selection._ranges[ 0 ].isEqual( range2 ) ).to.be.true;
				expect( selection._ranges[ 0 ] ).is.not.equal( range2 );
				expect( selection._ranges[ 1 ].isEqual( range3 ) ).to.be.true;
				expect( selection._ranges[ 1 ] ).is.not.equal( range3 );

				expect( selection.anchor.isEqual( range3.end ) ).to.be.true;
			} );

			it( 'should set selection on the given Range', () => {
				selection.setTo( range1 );

				expect( Array.from( selection.getRanges() ) ).to.deep.equal( [ range1 ] );
				expect( selection.isBackward ).to.be.false;
			} );

			it( 'should set selection on the given iterable of Ranges', () => {
				selection.setTo( new Set( [ range1, range2 ] ) );

				expect( Array.from( selection.getRanges() ) ).to.deep.equal( [ range1, range2 ] );
				expect( selection.isBackward ).to.be.false;
			} );

			it( 'should set collapsed selection on the given Position', () => {
				selection.setTo( range1.start );

				expect( Array.from( selection.getRanges() ).length ).to.equal( 1 );
				expect( Array.from( selection.getRanges() )[ 0 ].start ).to.deep.equal( range1.start );
				expect( selection.isBackward ).to.be.false;
				expect( selection.isCollapsed ).to.be.true;
			} );

			it( 'should fire change event', done => {
				selection.on( 'change', () => {
					expect( selection.rangeCount ).to.equal( 1 );
					expect( selection.getFirstRange().isEqual( range1 ) ).to.be.true;
					done();
				} );

				const otherSelection = new Selection( [ range1 ] );

				selection.setTo( otherSelection );
			} );

			it( 'should set fake state and label', () => {
				const label = 'foo bar baz';
				const otherSelection = new Selection( null, { fake: true, label } );
				selection.setTo( otherSelection );

				expect( selection.isFake ).to.be.true;
				expect( selection.fakeSelectionLabel ).to.equal( label );
			} );

			it( 'should throw an error when trying to set to not selectable', () => {
				const otherSelection = new Selection();

				expectToThrowCKEditorError( () => {
					otherSelection.setTo( {} );
				}, /view-selection-setTo-not-selectable/ );
			} );

			it( 'should throw an error when trying to set to not selectable #2', () => {
				const otherSelection = new Selection();

				expectToThrowCKEditorError( () => {
					otherSelection.setTo();
				}, /view-selection-setTo-not-selectable/ );
			} );
		} );

		describe( 'setting collapsed selection', () => {
			beforeEach( () => {
				selection.setTo( [ range1, range2 ] );
			} );

			it( 'should collapse selection at position', () => {
				const position = new Position( el, 4 );

				selection.setTo( position );
				const range = selection.getFirstRange();

				expect( range.start.parent ).to.equal( el );
				expect( range.start.offset ).to.equal( 4 );
				expect( range.start.isEqual( range.end ) ).to.be.true;
			} );

			it( 'should collapse selection at node and offset', () => {
				const foo = new Text( viewDocument, 'foo' );
				const p = new Element( viewDocument, 'p', null, foo );

				selection.setTo( foo, 0 );
				let range = selection.getFirstRange();

				expect( range.start.parent ).to.equal( foo );
				expect( range.start.offset ).to.equal( 0 );
				expect( range.start.isEqual( range.end ) ).to.be.true;

				selection.setTo( p, 1 );
				range = selection.getFirstRange();

				expect( range.start.parent ).to.equal( p );
				expect( range.start.offset ).to.equal( 1 );
				expect( range.start.isEqual( range.end ) ).to.be.true;
			} );

			it( 'should throw an error when the second parameter is not passed and first is an item', () => {
				const foo = new Text( viewDocument, 'foo' );

				expectToThrowCKEditorError( () => {
					selection.setTo( foo );
				}, /view-selection-setTo-required-second-parameter/ );
			} );

			it( 'should collapse selection at node and flag', () => {
				const foo = new Text( viewDocument, 'foo' );
				const p = new Element( viewDocument, 'p', null, foo );

				selection.setTo( foo, 'end' );
				let range = selection.getFirstRange();

				expect( range.start.parent ).to.equal( foo );
				expect( range.start.offset ).to.equal( 3 );
				expect( range.start.isEqual( range.end ) ).to.be.true;

				selection.setTo( foo, 'before' );
				range = selection.getFirstRange();

				expect( range.start.parent ).to.equal( p );
				expect( range.start.offset ).to.equal( 0 );
				expect( range.start.isEqual( range.end ) ).to.be.true;

				selection.setTo( foo, 'after' );
				range = selection.getFirstRange();

				expect( range.start.parent ).to.equal( p );
				expect( range.start.offset ).to.equal( 1 );
				expect( range.start.isEqual( range.end ) ).to.be.true;
			} );
		} );

		describe( 'setting collapsed selection at start', () => {
			it( 'should collapse to start position and fire change event', done => {
				selection.setTo( [ range1, range2, range3 ] );
				selection.once( 'change', () => {
					expect( selection.rangeCount ).to.equal( 1 );
					expect( selection.isCollapsed ).to.be.true;
					expect( selection._ranges[ 0 ].start.isEqual( range2.start ) ).to.be.true;
					done();
				} );

				selection.setTo( selection.getFirstPosition() );
			} );
		} );

		describe( 'setting collapsed selection to end', () => {
			it( 'should collapse to end position and fire change event', done => {
				selection.setTo( [ range1, range2, range3 ] );
				selection.once( 'change', () => {
					expect( selection.rangeCount ).to.equal( 1 );
					expect( selection.isCollapsed ).to.be.true;
					expect( selection._ranges[ 0 ].end.isEqual( range3.end ) ).to.be.true;
					done();
				} );

				selection.setTo( selection.getLastPosition() );
			} );
		} );

		describe( 'removing all ranges', () => {
			it( 'should remove all ranges and fire change event', done => {
				selection.setTo( [ range1, range2 ] );

				selection.once( 'change', () => {
					expect( selection.rangeCount ).to.equal( 0 );
					done();
				} );

				selection.setTo( null );
			} );
		} );

		describe( 'setting fake selection', () => {
			it( 'should allow to set selection to fake', () => {
				selection.setTo( range1, { fake: true } );

				expect( selection.isFake ).to.be.true;
			} );

			it( 'should allow to set fake selection label', () => {
				const label = 'foo bar baz';
				selection.setTo( range1, { fake: true, label } );

				expect( selection.fakeSelectionLabel ).to.equal( label );
			} );

			it( 'should not set label when set to false', () => {
				const label = 'foo bar baz';
				selection.setTo( range1, { fake: false, label } );

				expect( selection.fakeSelectionLabel ).to.equal( '' );
			} );

			it( 'should reset label when set to false', () => {
				const label = 'foo bar baz';
				selection.setTo( range1, { fake: true, label } );
				selection.setTo( range1 );

				expect( selection.fakeSelectionLabel ).to.equal( '' );
			} );

			it( 'should fire change event', done => {
				selection.once( 'change', () => {
					expect( selection.isFake ).to.be.true;
					expect( selection.fakeSelectionLabel ).to.equal( 'foo bar baz' );

					done();
				} );

				selection.setTo( range1, { fake: true, label: 'foo bar baz' } );
			} );

			it( 'should be possible to create an empty fake selection', () => {
				selection.setTo( null, { fake: true, label: 'foo bar baz' } );

				expect( selection.fakeSelectionLabel ).to.equal( 'foo bar baz' );
				expect( selection.isFake ).to.be.true;
			} );
		} );

		describe( 'setting selection to itself', () => {
			it( 'should correctly set ranges when setting to the same selection', () => {
				selection.setTo( [ range1, range2 ] );
				selection.setTo( selection );

				const ranges = Array.from( selection.getRanges() );
				expect( ranges.length ).to.equal( 2 );

				expect( ranges[ 0 ].isEqual( range1 ) ).to.be.true;
				expect( ranges[ 1 ].isEqual( range2 ) ).to.be.true;
			} );

			it( 'should correctly set ranges when setting to the same selection\'s ranges', () => {
				selection.setTo( [ range1, range2 ] );
				selection.setTo( selection.getRanges() );

				const ranges = Array.from( selection.getRanges() );
				expect( ranges.length ).to.equal( 2 );

				expect( ranges[ 0 ].isEqual( range1 ) ).to.be.true;
				expect( ranges[ 1 ].isEqual( range2 ) ).to.be.true;
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
				const range2 = Range._createFromParentsAndOffsets( text, 7, text, 15 );

				expectToThrowCKEditorError( () => {
					selection.setTo( [ range1, range2 ] );
				}, 'view-selection-range-intersects' );
			} );
		} );

		it( 'should allow setting selection on an item', () => {
			const textNode1 = new Text( viewDocument, 'foo' );
			const textNode2 = new Text( viewDocument, 'bar' );
			const textNode3 = new Text( viewDocument, 'baz' );
			const element = new Element( viewDocument, 'p', null, [ textNode1, textNode2, textNode3 ] );

			selection.setTo( textNode2, 'on' );

			const ranges = Array.from( selection.getRanges() );
			expect( ranges.length ).to.equal( 1 );
			expect( ranges[ 0 ].start.parent ).to.equal( element );
			expect( ranges[ 0 ].start.offset ).to.deep.equal( 1 );
			expect( ranges[ 0 ].end.parent ).to.equal( element );
			expect( ranges[ 0 ].end.offset ).to.deep.equal( 2 );
		} );

		it( 'should allow setting selection inside an element', () => {
			const element = new Element( viewDocument, 'p', null, [ new Text( viewDocument, 'foo' ), new Text( viewDocument, 'bar' ) ] );

			selection.setTo( element, 'in' );

			const ranges = Array.from( selection.getRanges() );
			expect( ranges.length ).to.equal( 1 );
			expect( ranges[ 0 ].start.parent ).to.equal( element );
			expect( ranges[ 0 ].start.offset ).to.deep.equal( 0 );
			expect( ranges[ 0 ].end.parent ).to.equal( element );
			expect( ranges[ 0 ].end.offset ).to.deep.equal( 2 );
		} );

		it( 'should allow setting backward selection inside an element', () => {
			const element = new Element( viewDocument, 'p', null, [ new Text( viewDocument, 'foo' ), new Text( viewDocument, 'bar' ) ] );

			selection.setTo( element, 'in', { backward: true } );

			const ranges = Array.from( selection.getRanges() );
			expect( ranges.length ).to.equal( 1 );
			expect( ranges[ 0 ].start.parent ).to.equal( element );
			expect( ranges[ 0 ].start.offset ).to.deep.equal( 0 );
			expect( ranges[ 0 ].end.parent ).to.equal( element );
			expect( ranges[ 0 ].end.offset ).to.deep.equal( 2 );
			expect( selection.isBackward ).to.be.true;
		} );
	} );

	describe( 'getEditableElement()', () => {
		it( 'should return null if no ranges in selection', () => {
			expect( selection.editableElement ).to.be.null;
		} );

		it( 'should return null if selection is placed in container that is not EditableElement', () => {
			selection.setTo( range1 );

			expect( selection.editableElement ).to.be.null;
		} );

		it( 'should return EditableElement when selection is placed inside', () => {
			selection.setTo( viewDocument.selection );
			const root = createViewRoot( viewDocument, 'div', 'main' );
			const element = new Element( viewDocument, 'p' );
			root._appendChild( element );

			selection.setTo( Range._createFromParentsAndOffsets( element, 0, element, 0 ) );

			expect( selection.editableElement ).to.equal( root );
		} );
	} );

	describe( 'isFake', () => {
		it( 'should be false for newly created instance', () => {
			expect( selection.isFake ).to.be.false;
		} );
	} );

	describe( 'getSelectedElement()', () => {
		it( 'should return selected element', () => {
			const { selection: docSelection, view } = parse( 'foo [<b>bar</b>] baz' );
			const b = view.getChild( 1 );
			const selection = new Selection( docSelection );

			expect( selection.getSelectedElement() ).to.equal( b );
		} );

		it( 'should return selected element if the selection is anchored at the end/at the beginning of a text node', () => {
			const { selection: docSelection, view } = parse( 'foo {<b>bar</b>} baz' );
			const b = view.getChild( 1 );
			const selection = new Selection( docSelection );

			expect( selection.getSelectedElement() ).to.equal( b );
		} );

		it( 'should return null if there is more than one range', () => {
			const { selection: docSelection } = parse( 'foo [<b>bar</b>] [<i>baz</i>]' );
			const selection = new Selection( docSelection );

			expect( selection.getSelectedElement() ).to.be.null;
		} );

		it( 'should return null if there is no selection', () => {
			expect( selection.getSelectedElement() ).to.be.null;
		} );

		it( 'should return null if selection is not over single element #1', () => {
			const { selection: docSelection } = parse( 'foo [<b>bar</b> ba}z' );
			const selection = new Selection( docSelection );

			expect( selection.getSelectedElement() ).to.be.null;
		} );

		it( 'should return null if selection is not over single element #2', () => {
			const { selection: docSelection } = parse( 'foo <b>{bar}</b> baz' );
			const selection = new Selection( docSelection );

			expect( selection.getSelectedElement() ).to.be.null;
		} );
	} );
} );
