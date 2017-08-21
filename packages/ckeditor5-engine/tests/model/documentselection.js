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
import DocumentSelection from '../../src/model/documentselection';
import InsertOperation from '../../src/model/operation/insertoperation';
import MoveOperation from '../../src/model/operation/moveoperation';
import RemoveOperation from '../../src/model/operation/removeoperation';
import AttributeOperation from '../../src/model/operation/attributeoperation';
import SplitDelta from '../../src/model/delta/splitdelta';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import count from '@ckeditor/ckeditor5-utils/src/count';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { wrapInDelta } from '../../tests/model/_utils/utils';
import { setData, getData } from '../../src/dev-utils/model';

import log from '@ckeditor/ckeditor5-utils/src/log';

testUtils.createSinonSandbox();

describe( 'DocumentSelection', () => {
	let doc, root, selection, liveRange, range;

	const fooStoreAttrKey = DocumentSelection._getStoreAttributeKey( 'foo' );
	const abcStoreAttrKey = DocumentSelection._getStoreAttributeKey( 'abc' );

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
		selection = doc.selection;
		doc.schema.registerItem( 'p', '$block' );

		doc.schema.registerItem( 'widget' );
		doc.schema.objects.add( 'widget' );

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
			root.insertChildren( 0, new Text( 'foobar' ) );
			selection = doc.selection;

			const ranges = Array.from( selection.getRanges() );

			expect( ranges.length ).to.equal( 1 );
			expect( selection.anchor.isEqual( new Position( root, [ 0 ] ) ) ).to.be.true;
			expect( selection.focus.isEqual( new Position( root, [ 0 ] ) ) ).to.be.true;
			expect( selection ).to.have.property( 'isBackward', false );
			expect( count( selection.getAttributes() ) ).to.equal( 0 );
		} );

		it( 'should skip element when you can not put selection', () => {
			doc = new Document();
			root = doc.createRoot();
			root.insertChildren( 0, [
				new Element( 'img' ),
				new Element( 'p', [], new Text( 'foobar' ) )
			] );
			doc.schema.registerItem( 'img' );
			doc.schema.registerItem( 'p', '$block' );
			selection = doc.selection;

			const ranges = Array.from( selection.getRanges() );

			expect( ranges.length ).to.equal( 1 );
			expect( selection.anchor.isEqual( new Position( root, [ 1, 0 ] ) ) ).to.be.true;
			expect( selection.focus.isEqual( new Position( root, [ 1, 0 ] ) ) ).to.be.true;
			expect( selection ).to.have.property( 'isBackward', false );
			expect( count( selection.getAttributes() ) ).to.equal( 0 );
		} );
	} );

	describe( 'isCollapsed', () => {
		it( 'should be true for the default range (in text position)', () => {
			expect( selection.isCollapsed ).to.be.true;
		} );

		it( 'should be false for the default range (object selection) ', () => {
			root.insertChildren( 0, new Element( 'widget' ) );

			expect( selection.isCollapsed ).to.be.false;
		} );

		it( 'should back off to the default algorithm if selection has ranges', () => {
			selection.addRange( range );

			expect( selection.isCollapsed ).to.be.false;
		} );
	} );

	describe( 'anchor', () => {
		it( 'should equal the default range\'s start (in text position)', () => {
			const expectedPos = new Position( root, [ 0, 0 ] );

			expect( selection.anchor.isEqual( expectedPos ) ).to.be.true;
		} );

		it( 'should equal the default range\'s start (object selection)', () => {
			root.insertChildren( 0, new Element( 'widget' ) );

			const expectedPos = new Position( root, [ 0 ] );

			expect( selection.anchor.isEqual( expectedPos ) ).to.be.true;
		} );

		it( 'should back off to the default algorithm if selection has ranges', () => {
			selection.addRange( range );

			expect( selection.anchor.isEqual( range.start ) ).to.be.true;
		} );
	} );

	describe( 'focus', () => {
		it( 'should equal the default range\'s end (in text position)', () => {
			const expectedPos = new Position( root, [ 0, 0 ] );

			expect( selection.focus.isEqual( expectedPos ) ).to.be.true;
		} );

		it( 'should equal the default range\'s end (object selection)', () => {
			root.insertChildren( 0, new Element( 'widget' ) );

			const expectedPos = new Position( root, [ 1 ] );

			expect( selection.focus.isEqual( expectedPos ) ).to.be.true;
			expect( selection.focus.isEqual( selection.getFirstRange().end ) ).to.be.true;
		} );

		it( 'should back off to the default algorithm if selection has ranges', () => {
			selection.addRange( range );

			expect( selection.focus.isEqual( range.end ) ).to.be.true;
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

	describe( 'addRange()', () => {
		it( 'should convert added Range to LiveRange', () => {
			selection.addRange( range );

			expect( selection._ranges[ 0 ] ).to.be.instanceof( LiveRange );
		} );

		it( 'should throw an error when range is invalid', () => {
			expect( () => {
				selection.addRange( { invalid: 'range' } );
			} ).to.throw( CKEditorError, /model-selection-added-not-range/ );
		} );

		it( 'should not add a range that is in graveyard', () => {
			const spy = testUtils.sinon.stub( log, 'warn' );

			selection.addRange( Range.createIn( doc.graveyard ) );

			expect( selection._ranges.length ).to.equal( 0 );
			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should refresh attributes', () => {
			const spy = testUtils.sinon.spy( selection, '_updateAttributes' );

			selection.addRange( range );

			expect( spy.called ).to.be.true;
		} );
	} );

	describe( 'setCollapsedAt()', () => {
		it( 'detaches all existing ranges', () => {
			selection.addRange( range );
			selection.addRange( liveRange );

			const spy = testUtils.sinon.spy( LiveRange.prototype, 'detach' );
			selection.setCollapsedAt( root );

			expect( spy.calledTwice ).to.be.true;
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should unbind all events', () => {
			selection.addRange( liveRange );
			selection.addRange( range );

			const ranges = selection._ranges;

			sinon.spy( ranges[ 0 ], 'detach' );
			sinon.spy( ranges[ 1 ], 'detach' );

			selection.destroy();

			expect( ranges[ 0 ].detach.called ).to.be.true;
			expect( ranges[ 1 ].detach.called ).to.be.true;

			ranges[ 0 ].detach.restore();
			ranges[ 1 ].detach.restore();
		} );
	} );

	describe( 'moveFocusTo()', () => {
		it( 'modifies default range', () => {
			const startPos = selection.getFirstPosition();
			const endPos = Position.createAt( root, 'end' );

			selection.moveFocusTo( endPos );

			expect( selection.anchor.compareWith( startPos ) ).to.equal( 'same' );
			expect( selection.focus.compareWith( endPos ) ).to.equal( 'same' );
		} );

		it( 'detaches the range it replaces', () => {
			const startPos = Position.createAt( root, 1 );
			const endPos = Position.createAt( root, 2 );
			const newEndPos = Position.createAt( root, 4 );
			const spy = testUtils.sinon.spy( LiveRange.prototype, 'detach' );

			selection.addRange( new Range( startPos, endPos ) );

			selection.moveFocusTo( newEndPos );

			expect( spy.calledOnce ).to.be.true;
		} );
	} );

	describe( 'removeAllRanges()', () => {
		let spy, ranges;

		beforeEach( () => {
			selection.addRange( liveRange );
			selection.addRange( range );

			spy = sinon.spy();
			selection.on( 'change:range', spy );

			ranges = Array.from( selection._ranges );

			sinon.spy( ranges[ 0 ], 'detach' );
			sinon.spy( ranges[ 1 ], 'detach' );

			selection.removeAllRanges();
		} );

		afterEach( () => {
			ranges[ 0 ].detach.restore();
			ranges[ 1 ].detach.restore();
		} );

		it( 'should remove all stored ranges (and reset to default range)', () => {
			expect( Array.from( selection.getRanges() ).length ).to.equal( 1 );
			expect( selection.anchor.isEqual( new Position( root, [ 0, 0 ] ) ) ).to.be.true;
			expect( selection.focus.isEqual( new Position( root, [ 0, 0 ] ) ) ).to.be.true;
		} );

		it( 'should detach ranges', () => {
			expect( ranges[ 0 ].detach.called ).to.be.true;
			expect( ranges[ 1 ].detach.called ).to.be.true;
		} );

		it( 'should refresh attributes', () => {
			const spy = sinon.spy( selection, '_updateAttributes' );

			selection.removeAllRanges();

			expect( spy.called ).to.be.true;
		} );
	} );

	describe( 'setRanges()', () => {
		it( 'should throw an error when range is invalid', () => {
			expect( () => {
				selection.setRanges( [ { invalid: 'range' } ] );
			} ).to.throw( CKEditorError, /model-selection-added-not-range/ );
		} );

		it( 'should detach removed ranges', () => {
			selection.addRange( liveRange );
			selection.addRange( range );

			const oldRanges = Array.from( selection._ranges );

			sinon.spy( oldRanges[ 0 ], 'detach' );
			sinon.spy( oldRanges[ 1 ], 'detach' );

			selection.setRanges( [] );

			expect( oldRanges[ 0 ].detach.called ).to.be.true;
			expect( oldRanges[ 1 ].detach.called ).to.be.true;
		} );

		it( 'should refresh attributes', () => {
			const spy = sinon.spy( selection, '_updateAttributes' );

			selection.setRanges( [ range ] );

			expect( spy.called ).to.be.true;
		} );

		// See #630.
		it( 'should refresh attributes – integration test for #630', () => {
			doc.schema.allow( { name: '$text', inside: '$root' } );

			setData( doc, 'f<$text italic="true">[o</$text><$text bold="true">ob]a</$text>r' );

			selection.setRanges( [ Range.createFromPositionAndShift( selection.getLastRange().end, 0 ) ] );

			expect( selection.getAttribute( 'bold' ) ).to.equal( true );
			expect( selection.hasAttribute( 'italic' ) ).to.equal( false );

			expect( getData( doc ) )
				.to.equal( 'f<$text italic="true">o</$text><$text bold="true">ob[]a</$text>r' );
		} );
	} );

	describe( 'getFirstRange()', () => {
		it( 'should return default range if no ranges were added', () => {
			const firstRange = selection.getFirstRange();

			expect( firstRange.start.isEqual( new Position( root, [ 0, 0 ] ) ) );
			expect( firstRange.end.isEqual( new Position( root, [ 0, 0 ] ) ) );
		} );
	} );

	describe( 'getLastRange()', () => {
		it( 'should return default range if no ranges were added', () => {
			const lastRange = selection.getLastRange();

			expect( lastRange.start.isEqual( new Position( root, [ 0, 0 ] ) ) );
			expect( lastRange.end.isEqual( new Position( root, [ 0, 0 ] ) ) );
		} );
	} );

	describe( 'createFromSelection()', () => {
		it( 'should throw', () => {
			selection.addRange( range, true );

			expect( () => {
				DocumentSelection.createFromSelection( selection );
			} ).to.throw( CKEditorError, /^documentselection-cannot-create:/ );
		} );
	} );

	// DocumentSelection uses LiveRanges so here are only simple test to see if integration is
	// working well, without getting into complicated corner cases.
	describe( 'after applying an operation should get updated and fire events', () => {
		let spyRange;

		beforeEach( () => {
			root.removeChildren( 0, root.childCount );
			root.insertChildren( 0, [
				new Element( 'p', [], new Text( 'abcdef' ) ),
				new Element( 'p', [], new Text( 'foobar' ) ),
				new Text( 'xyz' )
			] );

			selection.addRange( new Range( new Position( root, [ 0, 2 ] ), new Position( root, [ 1, 4 ] ) ) );

			spyRange = sinon.spy();
			selection.on( 'change:range', spyRange );
		} );

		describe( 'InsertOperation', () => {
			it( 'before selection', () => {
				selection.on( 'change:range', ( evt, data ) => {
					expect( data.directChange ).to.be.false;
				} );

				doc.applyOperation( wrapInDelta(
					new InsertOperation(
						new Position( root, [ 0, 1 ] ),
						'xyz',
						doc.version
					)
				) );

				const range = selection.getFirstRange();

				expect( range.start.path ).to.deep.equal( [ 0, 5 ] );
				expect( range.end.path ).to.deep.equal( [ 1, 4 ] );
				expect( spyRange.calledOnce ).to.be.true;
			} );

			it( 'inside selection', () => {
				selection.on( 'change:range', ( evt, data ) => {
					expect( data.directChange ).to.be.false;
				} );

				doc.applyOperation( wrapInDelta(
					new InsertOperation(
						new Position( root, [ 1, 0 ] ),
						'xyz',
						doc.version
					)
				) );

				const range = selection.getFirstRange();

				expect( range.start.path ).to.deep.equal( [ 0, 2 ] );
				expect( range.end.path ).to.deep.equal( [ 1, 7 ] );
				expect( spyRange.calledOnce ).to.be.true;
			} );
		} );

		describe( 'MoveOperation', () => {
			it( 'move range from before a selection', () => {
				selection.on( 'change:range', ( evt, data ) => {
					expect( data.directChange ).to.be.false;
				} );

				doc.applyOperation( wrapInDelta(
					new MoveOperation(
						new Position( root, [ 0, 0 ] ),
						2,
						new Position( root, [ 2 ] ),
						doc.version
					)
				) );

				const range = selection.getFirstRange();

				expect( range.start.path ).to.deep.equal( [ 0, 0 ] );
				expect( range.end.path ).to.deep.equal( [ 1, 4 ] );
				expect( spyRange.calledOnce ).to.be.true;
			} );

			it( 'moved into before a selection', () => {
				selection.on( 'change:range', ( evt, data ) => {
					expect( data.directChange ).to.be.false;
				} );

				doc.applyOperation( wrapInDelta(
					new MoveOperation(
						new Position( root, [ 2 ] ),
						2,
						new Position( root, [ 0, 0 ] ),
						doc.version
					)
				) );

				const range = selection.getFirstRange();

				expect( range.start.path ).to.deep.equal( [ 0, 4 ] );
				expect( range.end.path ).to.deep.equal( [ 1, 4 ] );
				expect( spyRange.calledOnce ).to.be.true;
			} );

			it( 'move range from inside of selection', () => {
				selection.on( 'change:range', ( evt, data ) => {
					expect( data.directChange ).to.be.false;
				} );

				doc.applyOperation( wrapInDelta(
					new MoveOperation(
						new Position( root, [ 1, 0 ] ),
						2,
						new Position( root, [ 2 ] ),
						doc.version
					)
				) );

				const range = selection.getFirstRange();

				expect( range.start.path ).to.deep.equal( [ 0, 2 ] );
				expect( range.end.path ).to.deep.equal( [ 1, 2 ] );
				expect( spyRange.calledOnce ).to.be.true;
			} );

			it( 'moved range intersects with selection', () => {
				selection.on( 'change:range', ( evt, data ) => {
					expect( data.directChange ).to.be.false;
				} );

				doc.applyOperation( wrapInDelta(
					new MoveOperation(
						new Position( root, [ 1, 3 ] ),
						2,
						new Position( root, [ 4 ] ),
						doc.version
					)
				) );

				const range = selection.getFirstRange();

				expect( range.start.path ).to.deep.equal( [ 0, 2 ] );
				expect( range.end.path ).to.deep.equal( [ 5 ] );
				expect( spyRange.calledOnce ).to.be.true;
			} );

			it( 'split inside selection (do not break selection)', () => {
				selection.on( 'change:range', ( evt, data ) => {
					expect( data.directChange ).to.be.false;
				} );

				const batch = doc.batch();
				const splitDelta = new SplitDelta();

				const insertOperation = new InsertOperation(
					new Position( root, [ 2 ] ),
					new Element( 'p' ),
					0
				);

				const moveOperation = new MoveOperation(
					new Position( root, [ 1, 2 ] ),
					4,
					new Position( root, [ 2, 0 ] ),
					1
				);

				batch.addDelta( splitDelta );

				splitDelta.addOperation( insertOperation );
				splitDelta.addOperation( moveOperation );

				doc.applyOperation( insertOperation );
				doc.applyOperation( moveOperation );

				const range = selection.getFirstRange();

				expect( range.start.path ).to.deep.equal( [ 0, 2 ] );
				expect( range.end.path ).to.deep.equal( [ 2, 2 ] );
				expect( spyRange.calledOnce ).to.be.true;
			} );
		} );

		describe( 'AttributeOperation', () => {
			it( 'changed range includes selection anchor', () => {
				const spyAttribute = sinon.spy();
				selection.on( 'change:attribute', spyAttribute );

				selection.on( 'change:attribute', ( evt, data ) => {
					expect( data.directChange ).to.be.false;
					expect( data.attributeKeys ).to.deep.equal( [ 'foo' ] );
				} );

				doc.applyOperation( wrapInDelta(
					new AttributeOperation(
						new Range( new Position( root, [ 0, 1 ] ), new Position( root, [ 0, 5 ] ) ),
						'foo',
						null,
						'bar',
						doc.version
					)
				) );

				expect( selection.getAttribute( 'foo' ) ).to.equal( 'bar' );
				expect( spyAttribute.calledOnce ).to.be.true;
			} );

			it( 'should not overwrite previously set attributes', () => {
				selection.setAttribute( 'foo', 'xyz' );

				const spyAttribute = sinon.spy();
				selection.on( 'change:attribute', spyAttribute );

				doc.applyOperation( wrapInDelta(
					new AttributeOperation(
						new Range( new Position( root, [ 0, 1 ] ), new Position( root, [ 0, 5 ] ) ),
						'foo',
						null,
						'bar',
						doc.version
					)
				) );

				expect( selection.getAttribute( 'foo' ) ).to.equal( 'xyz' );
				expect( spyAttribute.called ).to.be.false;
			} );

			it( 'should not overwrite previously removed attributes', () => {
				selection.setAttribute( 'foo', 'xyz' );
				selection.removeAttribute( 'foo' );

				const spyAttribute = sinon.spy();
				selection.on( 'change:attribute', spyAttribute );

				doc.applyOperation( wrapInDelta(
					new AttributeOperation(
						new Range( new Position( root, [ 0, 1 ] ), new Position( root, [ 0, 5 ] ) ),
						'foo',
						null,
						'bar',
						doc.version
					)
				) );

				expect( selection.hasAttribute( 'foo' ) ).to.be.false;
				expect( spyAttribute.called ).to.be.false;
			} );
		} );

		describe( 'RemoveOperation', () => {
			it( 'fix selection range if it ends up in graveyard #1', () => {
				selection.setCollapsedAt( new Position( root, [ 1, 3 ] ) );

				doc.applyOperation( wrapInDelta(
					new RemoveOperation(
						new Position( root, [ 1, 2 ] ),
						2,
						new Position( doc.graveyard, [ 0 ] ),
						doc.version
					)
				) );

				expect( selection.getFirstPosition().path ).to.deep.equal( [ 1, 2 ] );
			} );

			it( 'fix selection range if it ends up in graveyard #2', () => {
				selection.setRanges( [ new Range( new Position( root, [ 1, 2 ] ), new Position( root, [ 1, 4 ] ) ) ] );

				doc.applyOperation( wrapInDelta(
					new RemoveOperation(
						new Position( root, [ 1, 2 ] ),
						2,
						new Position( doc.graveyard, [ 0 ] ),
						doc.version
					)
				) );

				expect( selection.getFirstPosition().path ).to.deep.equal( [ 1, 2 ] );
			} );

			it( 'fix selection range if it ends up in graveyard #3', () => {
				selection.setRanges( [ new Range( new Position( root, [ 1, 1 ] ), new Position( root, [ 1, 2 ] ) ) ] );

				doc.applyOperation( wrapInDelta(
					new RemoveOperation(
						new Position( root, [ 1 ] ),
						2,
						new Position( doc.graveyard, [ 0 ] ),
						doc.version
					)
				) );

				expect( selection.getFirstPosition().path ).to.deep.equal( [ 0, 6 ] );
			} );

			it( 'fix selection range if it ends up in graveyard #4 - whole content removed', () => {
				doc.applyOperation( wrapInDelta(
					new RemoveOperation(
						new Position( root, [ 0 ] ),
						3,
						new Position( doc.graveyard, [ 0 ] ),
						doc.version
					)
				) );

				expect( selection.getFirstPosition().path ).to.deep.equal( [ 0 ] );

				doc.applyOperation( wrapInDelta(
					new InsertOperation(
						new Position( root, [ 0 ] ),
						new Element( 'p' ),
						doc.version
					)
				) );

				// Now it's clear that it's the default range.
				expect( selection.getFirstPosition().path ).to.deep.equal( [ 0, 0 ] );
			} );
		} );
	} );

	describe( 'attributes', () => {
		let fullP, emptyP, rangeInFullP, rangeInEmptyP;

		beforeEach( () => {
			root.removeChildren( 0, root.childCount );
			root.appendChildren( [
				new Element( 'p', [], new Text( 'foobar' ) ),
				new Element( 'p', [], [] )
			] );

			fullP = root.getChild( 0 );
			emptyP = root.getChild( 1 );

			rangeInFullP = new Range( new Position( root, [ 0, 4 ] ), new Position( root, [ 0, 4 ] ) );
			rangeInEmptyP = new Range( new Position( root, [ 1, 0 ] ), new Position( root, [ 1, 0 ] ) );

			// I've lost 30 mins debugging why my tests fail and that was due to the above code reusing
			// a root which wasn't empty (so the ranges didn't actualy make much sense).
			expect( root.childCount ).to.equal( 2 );
		} );

		describe( 'setAttribute()', () => {
			it( 'should store attribute if the selection is in empty node', () => {
				selection.setRanges( [ rangeInEmptyP ] );
				selection.setAttribute( 'foo', 'bar' );

				expect( selection.getAttribute( 'foo' ) ).to.equal( 'bar' );

				expect( emptyP.getAttribute( fooStoreAttrKey ) ).to.equal( 'bar' );
			} );
		} );

		describe( 'setAttributesTo()', () => {
			it( 'should fire change:attribute event with correct parameters', done => {
				selection.setAttributesTo( { foo: 'bar', abc: 'def' } );

				selection.on( 'change:attribute', ( evt, data ) => {
					expect( data.directChange ).to.be.true;
					expect( data.attributeKeys ).to.deep.equal( [ 'abc', 'xxx' ] );

					done();
				} );

				selection.setAttributesTo( { foo: 'bar', xxx: 'yyy' } );
			} );

			it( 'should not fire change:attribute event if same attributes are set', () => {
				selection.setAttributesTo( { foo: 'bar', abc: 'def' } );

				const spy = sinon.spy();
				selection.on( 'change:attribute', spy );

				selection.setAttributesTo( { foo: 'bar', abc: 'def' } );

				expect( spy.called ).to.be.false;
			} );

			it( 'should remove all stored attributes and store the given ones if the selection is in empty node', () => {
				selection.setRanges( [ rangeInEmptyP ] );
				selection.setAttribute( 'abc', 'xyz' );
				selection.setAttributesTo( { foo: 'bar' } );

				expect( selection.getAttribute( 'foo' ) ).to.equal( 'bar' );
				expect( selection.getAttribute( 'abc' ) ).to.be.undefined;

				expect( emptyP.getAttribute( fooStoreAttrKey ) ).to.equal( 'bar' );
				expect( emptyP.hasAttribute( abcStoreAttrKey ) ).to.be.false;
			} );
		} );

		describe( 'removeAttribute()', () => {
			it( 'should remove attribute set on the text fragment', () => {
				selection.setRanges( [ rangeInFullP ] );
				selection.setAttribute( 'foo', 'bar' );
				selection.removeAttribute( 'foo' );

				expect( selection.getAttribute( 'foo' ) ).to.be.undefined;

				expect( fullP.hasAttribute( fooStoreAttrKey ) ).to.be.false;
			} );

			it( 'should remove stored attribute if the selection is in empty node', () => {
				selection.setRanges( [ rangeInEmptyP ] );
				selection.setAttribute( 'foo', 'bar' );
				selection.removeAttribute( 'foo' );

				expect( selection.getAttribute( 'foo' ) ).to.be.undefined;

				expect( emptyP.hasAttribute( fooStoreAttrKey ) ).to.be.false;
			} );
		} );

		describe( 'clearAttributes()', () => {
			it( 'should remove all stored attributes if the selection is in empty node', () => {
				selection.setRanges( [ rangeInEmptyP ] );
				selection.setAttribute( 'foo', 'bar' );
				selection.setAttribute( 'abc', 'xyz' );

				selection.clearAttributes();

				expect( selection.getAttribute( 'foo' ) ).to.be.undefined;
				expect( selection.getAttribute( 'abc' ) ).to.be.undefined;

				expect( emptyP.hasAttribute( fooStoreAttrKey ) ).to.be.false;
				expect( emptyP.hasAttribute( abcStoreAttrKey ) ).to.be.false;
			} );
		} );

		describe( '_getStoredAttributes()', () => {
			it( 'should return no values if there are no ranges in selection', () => {
				const values = Array.from( selection._getStoredAttributes() );

				expect( values ).to.deep.equal( [] );
			} );
		} );

		describe( 'are updated on a direct range change', () => {
			beforeEach( () => {
				root.insertChildren( 0, [
					new Element( 'p', { p: true } ),
					new Text( 'a', { a: true } ),
					new Element( 'p', { p: true } ),
					new Text( 'b', { b: true } ),
					new Text( 'c', { c: true } ),
					new Element( 'p', [], [
						new Text( 'd', { d: true } )
					] ),
					new Element( 'p', { p: true } ),
					new Text( 'e', { e: true } )
				] );
			} );

			it( 'if selection is a range, should find first character in it and copy it\'s attributes', () => {
				selection.setRanges( [ new Range( new Position( root, [ 2 ] ), new Position( root, [ 5 ] ) ) ] );

				expect( Array.from( selection.getAttributes() ) ).to.deep.equal( [ [ 'b', true ] ] );

				// Step into elements when looking for first character:
				selection.setRanges( [ new Range( new Position( root, [ 5 ] ), new Position( root, [ 7 ] ) ) ] );

				expect( Array.from( selection.getAttributes() ) ).to.deep.equal( [ [ 'd', true ] ] );
			} );

			it( 'if selection is collapsed it should seek a character to copy that character\'s attributes', () => {
				// Take styles from character before selection.
				selection.setRanges( [ new Range( new Position( root, [ 2 ] ), new Position( root, [ 2 ] ) ) ] );
				expect( Array.from( selection.getAttributes() ) ).to.deep.equal( [ [ 'a', true ] ] );

				// If there are none,
				// Take styles from character after selection.
				selection.setRanges( [ new Range( new Position( root, [ 3 ] ), new Position( root, [ 3 ] ) ) ] );
				expect( Array.from( selection.getAttributes() ) ).to.deep.equal( [ [ 'b', true ] ] );

				// If there are none,
				// Look from the selection position to the beginning of node looking for character to take attributes from.
				selection.setRanges( [ new Range( new Position( root, [ 6 ] ), new Position( root, [ 6 ] ) ) ] );
				expect( Array.from( selection.getAttributes() ) ).to.deep.equal( [ [ 'c', true ] ] );

				// If there are none,
				// Look from the selection position to the end of node looking for character to take attributes from.
				selection.setRanges( [ new Range( new Position( root, [ 0 ] ), new Position( root, [ 0 ] ) ) ] );
				expect( Array.from( selection.getAttributes() ) ).to.deep.equal( [ [ 'a', true ] ] );

				// If there are no characters to copy attributes from, use stored attributes.
				selection.setRanges( [ new Range( new Position( root, [ 0, 0 ] ), new Position( root, [ 0, 0 ] ) ) ] );
				expect( Array.from( selection.getAttributes() ) ).to.deep.equal( [] );
			} );

			it( 'should overwrite any previously set attributes', () => {
				selection.setCollapsedAt( new Position( root, [ 5, 0 ] ) );

				selection.setAttribute( 'x', true );
				selection.setAttribute( 'y', true );

				expect( Array.from( selection.getAttributes() ) ).to.deep.equal( [ [ 'd', true ], [ 'x', true ], [ 'y', true ] ] );

				selection.setCollapsedAt( new Position( root, [ 1 ] ) );

				expect( Array.from( selection.getAttributes() ) ).to.deep.equal( [ [ 'a', true ] ] );
			} );

			it( 'should fire change:attribute event', () => {
				const spy = sinon.spy();
				selection.on( 'change:attribute', spy );

				selection.setRanges( [ new Range( new Position( root, [ 2 ] ), new Position( root, [ 5 ] ) ) ] );

				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'should not fire change:attribute event if attributes did not change', () => {
				selection.setCollapsedAt( new Position( root, [ 5, 0 ] ) );

				expect( Array.from( selection.getAttributes() ) ).to.deep.equal( [ [ 'd', true ] ] );

				const spy = sinon.spy();
				selection.on( 'change:attribute', spy );

				selection.setCollapsedAt( new Position( root, [ 5, 1 ] ) );

				expect( Array.from( selection.getAttributes() ) ).to.deep.equal( [ [ 'd', true ] ] );
				expect( spy.called ).to.be.false;
			} );
		} );

		// #986
		describe( 'are not inherited from the inside of object elements', () => {
			beforeEach( () => {
				doc.schema.registerItem( 'image' );
				doc.schema.allow( { name: 'image', inside: '$root' } );
				doc.schema.allow( { name: 'image', inside: '$block' } );
				doc.schema.allow( { name: '$inline', inside: 'image' } );
				doc.schema.objects.add( 'image' );

				doc.schema.registerItem( 'caption' );
				doc.schema.allow( { name: '$inline', inside: 'caption' } );
				doc.schema.allow( { name: 'caption', inside: 'image' } );
				doc.schema.allow( { name: '$text', attributes: 'bold', inside: 'caption' } );
			} );

			it( 'ignores attributes inside an object if selection contains that object', () => {
				setData( doc, '<p>[<image><$text bold="true">Caption for the image.</$text></image>]</p>' );

				expect( selection.hasAttribute( 'bold' ) ).to.equal( false );
			} );

			it( 'ignores attributes inside an object if selection contains that object (deeper structure)', () => {
				setData( doc, '<p>[<image><caption><$text bold="true">Caption for the image.</$text></caption></image>]</p>' );

				expect( selection.hasAttribute( 'bold' ) ).to.equal( false );
			} );

			it( 'ignores attributes inside an object if selection contains that object (block level)', () => {
				setData( doc, '<p>foo</p>[<image><$text bold="true">Caption for the image.</$text></image>]<p>foo</p>' );

				expect( selection.hasAttribute( 'bold' ) ).to.equal( false );
			} );

			it( 'reads attributes from text even if the selection contains an object', () => {
				setData( doc, '<p>x<$text bold="true">[bar</$text><image></image>foo]</p>' );

				expect( selection.getAttribute( 'bold' ) ).to.equal( true );
			} );

			it( 'reads attributes when the entire selection inside an object', () => {
				setData( doc, '<p><image><caption><$text bold="true">[bar]</$text></caption></image></p>' );

				expect( selection.getAttribute( 'bold' ) ).to.equal( true );
			} );

			it( 'stops reading attributes if selection starts with an object', () => {
				setData( doc, '<p>[<image></image><$text bold="true">bar]</$text></p>' );

				expect( selection.hasAttribute( 'bold' ) ).to.equal( false );
			} );
		} );

		describe( 'parent element\'s attributes', () => {
			it( 'are set using a normal batch', () => {
				const batchTypes = [];
				doc.on( 'change', ( event, type, changes, batch ) => {
					batchTypes.push( batch.type );
				} );

				selection.setRanges( [ rangeInEmptyP ] );
				selection.setAttribute( 'foo', 'bar' );

				expect( batchTypes ).to.deep.equal( [ 'default' ] );
				expect( emptyP.getAttribute( fooStoreAttrKey ) ).to.equal( 'bar' );
			} );

			it( 'are removed when any content is inserted (reuses the same batch)', () => {
				// Dedupe batches by using a map (multiple change events will be fired).
				const batchTypes = new Map();

				selection.setRanges( [ rangeInEmptyP ] );
				selection.setAttribute( 'foo', 'bar' );
				selection.setAttribute( 'abc', 'bar' );

				doc.on( 'change', ( event, type, changes, batch ) => {
					batchTypes.set( batch, batch.type );
				} );

				doc.batch().insert( rangeInEmptyP.start, 'x' );

				expect( emptyP.hasAttribute( fooStoreAttrKey ) ).to.be.false;
				expect( emptyP.hasAttribute( abcStoreAttrKey ) ).to.be.false;

				expect( Array.from( batchTypes.values() ) ).to.deep.equal( [ 'default' ] );
			} );

			it( 'are removed when any content is moved into', () => {
				selection.setRanges( [ rangeInEmptyP ] );
				selection.setAttribute( 'foo', 'bar' );

				doc.batch().move( fullP.getChild( 0 ), rangeInEmptyP.start );

				expect( emptyP.hasAttribute( fooStoreAttrKey ) ).to.be.false;
			} );

			it( 'are removed when containing element is merged with a non-empty element', () => {
				const emptyP2 = new Element( 'p', null, 'x' );
				root.appendChildren( emptyP2 );

				emptyP.setAttribute( fooStoreAttrKey, 'bar' );
				emptyP2.setAttribute( fooStoreAttrKey, 'bar' );

				// <emptyP>{}<emptyP2>
				doc.batch().merge( Position.createAfter( emptyP ) );

				expect( emptyP.hasAttribute( fooStoreAttrKey ) ).to.be.false;
				expect( emptyP.parent ).to.equal( root ); // Just to be sure we're checking the right element.
			} );

			it( 'are removed even when there is no selection in it', () => {
				emptyP.setAttribute( fooStoreAttrKey, 'bar' );

				selection.setRanges( [ rangeInFullP ] );

				doc.batch().insert( rangeInEmptyP.start, 'x' );

				expect( emptyP.hasAttribute( fooStoreAttrKey ) ).to.be.false;
			} );

			it( 'are removed only once in case of multi-op deltas', () => {
				const emptyP2 = new Element( 'p', null, 'x' );
				root.appendChildren( emptyP2 );

				emptyP.setAttribute( fooStoreAttrKey, 'bar' );
				emptyP2.setAttribute( fooStoreAttrKey, 'bar' );

				const batch = doc.batch();
				const spy = sinon.spy( batch, 'removeAttribute' );

				// <emptyP>{}<emptyP2>
				batch.merge( Position.createAfter( emptyP ) );

				expect( emptyP.hasAttribute( fooStoreAttrKey ) ).to.be.false;

				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'uses document enqueue changes to clear attributes', () => {
				selection.setRanges( [ rangeInEmptyP ] );
				selection.setAttribute( 'foo', 'bar' );

				doc.enqueueChanges( () => {
					doc.batch().insert( rangeInEmptyP.start, 'x' );

					// `emptyP` still has the attribute, because attribute clearing is in enqueued block.
					expect( emptyP.hasAttribute( fooStoreAttrKey ) ).to.be.true;
				} );

				// When the dust settles, `emptyP` should not have the attribute.
				expect( emptyP.hasAttribute( fooStoreAttrKey ) ).to.be.false;
			} );

			it( 'are not removed or merged when containing element is merged with another empty element', () => {
				const emptyP2 = new Element( 'p', null );
				root.appendChildren( emptyP2 );

				emptyP.setAttribute( fooStoreAttrKey, 'bar' );
				emptyP2.setAttribute( abcStoreAttrKey, 'bar' );

				expect( emptyP.hasAttribute( fooStoreAttrKey ) ).to.be.true;
				expect( emptyP.hasAttribute( abcStoreAttrKey ) ).to.be.false;

				// <emptyP>{}<emptyP2>
				doc.batch().merge( Position.createAfter( emptyP ) );

				expect( emptyP.getAttribute( fooStoreAttrKey ) ).to.equal( 'bar' );
				expect( emptyP.parent ).to.equal( root ); // Just to be sure we're checking the right element.
			} );

			it( 'are not removed on transparent batches', () => {
				selection.setRanges( [ rangeInEmptyP ] );
				selection.setAttribute( 'foo', 'bar' );

				sinon.spy( doc, 'enqueueChanges' );

				doc.batch( 'transparent' ).insert( rangeInEmptyP.start, 'x' );

				expect( doc.enqueueChanges.called ).to.be.false;
				expect( emptyP.getAttribute( fooStoreAttrKey ) ).to.equal( 'bar' );
			} );

			// Rename and some other deltas don't specify range in doc#change event.
			// So let's see if there's no crash or something.
			it( 'are not removed on rename', () => {
				selection.setRanges( [ rangeInEmptyP ] );
				selection.setAttribute( 'foo', 'bar' );

				sinon.spy( doc, 'enqueueChanges' );

				doc.batch().rename( emptyP, 'pnew' );

				expect( doc.enqueueChanges.called ).to.be.false;
				expect( emptyP.getAttribute( fooStoreAttrKey ) ).to.equal( 'bar' );
			} );
		} );
	} );
} );
