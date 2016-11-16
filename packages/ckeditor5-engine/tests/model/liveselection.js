/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: model */

import Document from 'ckeditor5/engine/model/document.js';
import Element from 'ckeditor5/engine/model/element.js';
import Text from 'ckeditor5/engine/model/text.js';
import Range from 'ckeditor5/engine/model/range.js';
import Position from 'ckeditor5/engine/model/position.js';
import LiveRange from 'ckeditor5/engine/model/liverange.js';
import LiveSelection from 'ckeditor5/engine/model/liveselection.js';
import InsertOperation from 'ckeditor5/engine/model/operation/insertoperation.js';
import MoveOperation from 'ckeditor5/engine/model/operation/moveoperation.js';
import RemoveOperation from 'ckeditor5/engine/model/operation/removeoperation.js';
import AttributeOperation from 'ckeditor5/engine/model/operation/attributeoperation.js';
import CKEditorError from 'ckeditor5/utils/ckeditorerror.js';
import count from 'ckeditor5/utils/count.js';
import testUtils from 'tests/core/_utils/utils.js';
import { wrapInDelta } from 'tests/engine/model/_utils/utils.js';

import log from 'ckeditor5/utils/log.js';

testUtils.createSinonSandbox();

describe( 'LiveSelection', () => {
	let attrFooBar;

	before( () => {
		attrFooBar = { foo: 'bar' };
	} );

	let doc, root, selection, liveRange, range;

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
		it( 'should return true for default range', () => {
			expect( selection.isCollapsed ).to.be.true;
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

	describe( 'addRange', () => {
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

	describe( 'collapse', () => {
		it( 'detaches all existing ranges', () => {
			selection.addRange( range );
			selection.addRange( liveRange );

			const spy = testUtils.sinon.spy( LiveRange.prototype, 'detach' );
			selection.collapse( root );

			expect( spy.calledTwice ).to.be.true;
		} );
	} );

	describe( 'destroy', () => {
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

	describe( 'setFocus', () => {
		it( 'modifies default range', () => {
			const startPos = selection.getFirstPosition();
			const endPos = Position.createAt( root, 'end' );

			selection.setFocus( endPos );

			expect( selection.anchor.compareWith( startPos ) ).to.equal( 'same' );
			expect( selection.focus.compareWith( endPos ) ).to.equal( 'same' );
		} );

		it( 'detaches the range it replaces', () => {
			const startPos = Position.createAt( root, 1 );
			const endPos = Position.createAt( root, 2 );
			const newEndPos = Position.createAt( root, 4 );
			const spy = testUtils.sinon.spy( LiveRange.prototype, 'detach' );

			selection.addRange( new Range( startPos, endPos ) );

			selection.setFocus( newEndPos );

			expect( spy.calledOnce ).to.be.true;
		} );
	} );

	describe( 'removeAllRanges', () => {
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

	describe( 'setRanges', () => {
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
	} );

	describe( 'getFirstRange', () => {
		it( 'should return default range if no ranges were added', () => {
			const firstRange = selection.getFirstRange();

			expect( firstRange.start.isEqual( new Position( root, [ 0, 0 ] ) ) );
			expect( firstRange.end.isEqual( new Position( root, [ 0, 0 ] ) ) );
		} );
	} );

	describe( 'getLastRange', () => {
		it( 'should return default range if no ranges were added', () => {
			const lastRange = selection.getLastRange();

			expect( lastRange.start.isEqual( new Position( root, [ 0, 0 ] ) ) );
			expect( lastRange.end.isEqual( new Position( root, [ 0, 0 ] ) ) );
		} );
	} );

	describe( 'createFromSelection', () => {
		it( 'should return a LiveSelection instance', () => {
			selection.addRange( range, true );

			expect( LiveSelection.createFromSelection( selection ) ).to.be.instanceof( LiveSelection );
		} );
	} );

	// LiveSelection uses LiveRanges so here are only simple test to see if integration is
	// working well, without getting into complicated corner cases.
	describe( 'after applying an operation should get updated and fire events', () => {
		let spyRange;

		beforeEach( () => {
			root.removeChildren( 0, root.childCount );
			root.insertChildren( 0, [
				new Element( 'ul', [], new Text( 'abcdef' ) ),
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

				let range = selection.getFirstRange();

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

				let range = selection.getFirstRange();

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

				let range = selection.getFirstRange();

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

				let range = selection.getFirstRange();

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

				let range = selection.getFirstRange();

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

				let range = selection.getFirstRange();

				expect( range.start.path ).to.deep.equal( [ 0, 2 ] );
				expect( range.end.path ).to.deep.equal( [ 1, 3 ] );
				expect( spyRange.calledOnce ).to.be.true;
			} );

			it( 'split inside selection (do not break selection)', () => {
				selection.on( 'change:range', ( evt, data ) => {
					expect( data.directChange ).to.be.false;
				} );

				doc.applyOperation( wrapInDelta(
					new InsertOperation(
						new Position( root, [ 2 ] ),
						new Element( 'p' ),
						doc.version
					)
				) );

				doc.applyOperation( wrapInDelta(
					new MoveOperation(
						new Position( root, [ 1, 2 ] ),
						4,
						new Position( root, [ 2, 0 ] ),
						doc.version
					)
				) );

				let range = selection.getFirstRange();

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
				selection.collapse( new Position( root, [ 1, 3 ] ) );

				doc.applyOperation( wrapInDelta(
					new RemoveOperation(
						new Position( root, [ 1, 2 ] ),
						2,
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
						doc.version
					)
				) );

				expect( selection.getFirstPosition().path ).to.deep.equal( [ 1, 2 ] );
			} );

			it( 'fix selection range if it ends up in graveyard #3', () => {
				selection.setRanges( [ new Range( new Position( root, [ 1, 2 ] ), new Position( root, [ 1, 4 ] ) ) ] );

				doc.applyOperation( wrapInDelta(
					new RemoveOperation(
						new Position( root, [ 0 ] ),
						3,
						doc.version
					)
				) );

				expect( selection.getFirstPosition().path ).to.deep.equal( [ 0 ] );
			} );
		} );
	} );

	describe( 'attributes interface', () => {
		let fullP, emptyP, rangeInFullP, rangeInEmptyP;

		beforeEach( () => {
			root.insertChildren( 0, [
				new Element( 'p', [], new Text( 'foobar' ) ),
				new Element( 'p', [], [] )
			] );

			fullP = root.getChild( 0 );
			emptyP = root.getChild( 1 );

			rangeInFullP = new Range( new Position( root, [ 0, 4 ] ), new Position( root, [ 0, 4 ] ) );
			rangeInEmptyP = new Range( new Position( root, [ 1, 0 ] ), new Position( root, [ 1, 0 ] ) );
		} );

		describe( 'setAttribute', () => {
			it( 'should store attribute if the selection is in empty node', () => {
				selection.setRanges( [ rangeInEmptyP ] );
				selection.setAttribute( 'foo', 'bar' );

				expect( selection.getAttribute( 'foo' ) ).to.equal( 'bar' );

				expect( emptyP.getAttribute( LiveSelection._getStoreAttributeKey( 'foo' ) ) ).to.equal( 'bar' );
			} );
		} );

		describe( 'setAttributesTo', () => {
			it( 'should fire change:attribute event with correct parameters', ( done ) => {
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

				expect( emptyP.getAttribute( LiveSelection._getStoreAttributeKey( 'foo' ) ) ).to.equal( 'bar' );
				expect( emptyP.hasAttribute( LiveSelection._getStoreAttributeKey( 'abc' ) ) ).to.be.false;
			} );
		} );

		describe( 'removeAttribute', () => {
			it( 'should remove attribute set on the text fragment', () => {
				selection.setRanges( [ rangeInFullP ] );
				selection.setAttribute( 'foo', 'bar' );
				selection.removeAttribute( 'foo' );

				expect( selection.getAttribute( 'foo' ) ).to.be.undefined;

				expect( fullP.hasAttribute( LiveSelection._getStoreAttributeKey( 'foo' ) ) ).to.be.false;
			} );

			it( 'should remove stored attribute if the selection is in empty node', () => {
				selection.setRanges( [ rangeInEmptyP ] );
				selection.setAttribute( 'foo', 'bar' );
				selection.removeAttribute( 'foo' );

				expect( selection.getAttribute( 'foo' ) ).to.be.undefined;

				expect( emptyP.hasAttribute( LiveSelection._getStoreAttributeKey( 'foo' ) ) ).to.be.false;
			} );
		} );

		describe( 'clearAttributes', () => {
			it( 'should remove all stored attributes if the selection is in empty node', () => {
				selection.setRanges( [ rangeInEmptyP ] );
				selection.setAttribute( 'foo', 'bar' );
				selection.setAttribute( 'abc', 'xyz' );

				selection.clearAttributes();

				expect( selection.getAttribute( 'foo' ) ).to.be.undefined;
				expect( selection.getAttribute( 'abc' ) ).to.be.undefined;

				expect( emptyP.hasAttribute( LiveSelection._getStoreAttributeKey( 'foo' ) ) ).to.be.false;
				expect( emptyP.hasAttribute( LiveSelection._getStoreAttributeKey( 'abc' ) ) ).to.be.false;
			} );
		} );
	} );

	describe( 'update attributes on direct range change', () => {
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
			selection.collapse( new Position( root, [ 5, 0 ] ) );

			selection.setAttribute( 'x', true );
			selection.setAttribute( 'y', true );

			expect( Array.from( selection.getAttributes() ) ).to.deep.equal( [ [ 'd', true ], [ 'x', true ], [ 'y', true ] ] );

			selection.collapse( new Position( root, [ 1 ] ) );

			expect( Array.from( selection.getAttributes() ) ).to.deep.equal( [ [ 'a', true ] ] );
		} );

		it( 'should fire change:attribute event', () => {
			let spy = sinon.spy();
			selection.on( 'change:attribute', spy );

			selection.setRanges( [ new Range( new Position( root, [ 2 ] ), new Position( root, [ 5 ] ) ) ] );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should not fire change:attribute event if attributes did not change', () => {
			selection.collapse( new Position( root, [ 5, 0 ] ) );

			expect( Array.from( selection.getAttributes() ) ).to.deep.equal( [ [ 'd', true ] ] );

			let spy = sinon.spy();
			selection.on( 'change:attribute', spy );

			selection.collapse( new Position( root, [ 5, 1 ] ) );

			expect( Array.from( selection.getAttributes() ) ).to.deep.equal( [ [ 'd', true ] ] );
			expect( spy.called ).to.be.false;
		} );
	} );

	describe( '_getStoredAttributes', () => {
		it( 'should return no values if there are no ranges in selection', () => {
			let values = Array.from( selection._getStoredAttributes() );

			expect( values ).to.deep.equal( [] );
		} );
	} );
} );
