/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Batch from '../../src/model/batch';
import Delta from '../../src/model/delta/delta';

import Operation from '../../src/model/operation/operation';
import InsertOperation from '../../src/model/operation/insertoperation';
import MarkerOperation from '../../src/model/operation/markeroperation';

import Document from '../../src/model/document';
import DocumentFragment from '../../src/model/documentfragment';
import Element from '../../src/model/element';
import Text from '../../src/model/text';
import Position from '../../src/model/position';
import Range from '../../src/model/range';

import count from '@ckeditor/ckeditor5-utils/src/count';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

import { stringify } from '../../src/dev-utils/model';
import { getNodesAndText } from '../../tests/model/_utils/utils';

describe( 'Batch', () => {
	describe( 'type', () => {
		it( 'should default to "default"', () => {
			const batch = new Batch( new Document() );

			expect( batch.type ).to.equal( 'default' );
		} );

		it( 'should be set to the value set in constructor', () => {
			const batch = new Batch( new Document(), 'ignore' );

			expect( batch.type ).to.equal( 'ignore' );
		} );
	} );

	describe( 'baseVersion', () => {
		it( 'should return base version of first delta from the batch', () => {
			const batch = new Batch( new Document() );
			const delta = new Delta();
			const operation = new Operation( 2 );
			delta.addOperation( operation );
			batch.addDelta( delta );

			expect( batch.baseVersion ).to.equal( 2 );
		} );

		it( 'should return null if there are no deltas in batch', () => {
			const batch = new Batch( new Document() );

			expect( batch.baseVersion ).to.be.null;
		} );
	} );

	describe( 'addDelta()', () => {
		it( 'should add delta to the batch', () => {
			const batch = new Batch( new Document() );
			const deltaA = new Delta();
			const deltaB = new Delta();
			batch.addDelta( deltaA );
			batch.addDelta( deltaB );

			expect( batch.deltas.length ).to.equal( 2 );
			expect( batch.deltas[ 0 ] ).to.equal( deltaA );
			expect( batch.deltas[ 1 ] ).to.equal( deltaB );
		} );
	} );

	describe( 'getOperations()', () => {
		it( 'should return collection of operations from all deltas', () => {
			const doc = new Document();
			const batch = new Batch( doc );
			const deltaA = new Delta();
			const deltaB = new Delta();
			const ops = [
				new Operation( doc.version ),
				new Operation( doc.version + 1 ),
				new Operation( doc.version + 2 )
			];

			batch.addDelta( deltaA );
			deltaA.addOperation( ops[ 0 ] );
			batch.addDelta( deltaB );
			deltaA.addOperation( ops[ 1 ] );
			deltaA.addOperation( ops[ 2 ] );

			expect( Array.from( batch.getOperations() ) ).to.deep.equal( ops );
			expect( batch.getOperations() ).to.have.property( 'next' );
		} );
	} );

	describe( 'insert', () => {
		let doc, root, batch, p, ul, chain;

		beforeEach( () => {
			doc = new Document();
			root = doc.createRoot();
			root.insertChildren( 0, new Text( 'abc' ) );

			batch = doc.batch();

			p = new Element( 'p' );
			ul = new Element( 'ul' );

			chain = batch.insert( new Position( root, [ 2 ] ), [ p, ul ] );
		} );

		it( 'should insert given nodes at given position', () => {
			expect( root.childCount ).to.equal( 4 );
			expect( root.maxOffset ).to.equal( 5 );
			expect( root.getChild( 1 ) ).to.equal( p );
			expect( root.getChild( 2 ) ).to.equal( ul );
		} );

		it( 'should be chainable', () => {
			expect( chain ).to.equal( batch );
		} );

		it( 'should add delta to batch and operation to delta before applying operation', () => {
			sinon.spy( doc, 'applyOperation' );
			batch.insert( new Position( root, [ 2 ] ), [ p, ul ] );

			const correctDeltaMatcher = sinon.match( operation => {
				return operation.delta && operation.delta.batch && operation.delta.batch == batch;
			} );

			expect( doc.applyOperation.calledWith( correctDeltaMatcher ) ).to.be.true;
		} );

		it( 'should transfer markers from given DocumentFragment', () => {
			const documentFragment = new DocumentFragment( [ new Element( 'li', null, [ new Text( 'foo bar' ) ] ) ] );
			const marker = new Range( new Position( documentFragment, [ 0, 1 ] ), new Position( documentFragment, [ 0, 5 ] ) );

			documentFragment.markers.set( 'marker', marker );

			batch.insert( new Position( root, [ 3, 0 ] ), documentFragment );

			expect( Array.from( doc.markers ).length ).to.equal( 1 );
			expect( stringify( root, doc.markers.get( 'marker' ).getRange() ) ).to.equal( 'ab<p></p><ul><li>f[oo b]ar</li></ul>c' );
		} );

		it( 'should set each marker as separate operation', () => {
			sinon.spy( doc, 'applyOperation' );

			const documentFragment = new DocumentFragment( [ new Element( 'li', null, [ new Text( 'foo bar' ) ] ) ] );
			const marker1 = new Range( new Position( documentFragment, [ 0, 1 ] ), new Position( documentFragment, [ 0, 2 ] ) );
			const marker2 = new Range( new Position( documentFragment, [ 0, 5 ] ), new Position( documentFragment, [ 0, 6 ] ) );

			documentFragment.markers.set( 'marker1', marker1 );
			documentFragment.markers.set( 'marker2', marker2 );

			batch.insert( new Position( root, [ 3, 0 ] ), documentFragment );

			expect( doc.applyOperation.calledThrice );
			expect( doc.applyOperation.firstCall.calledWith( sinon.match( operation => operation instanceof InsertOperation ) ) );
			expect( doc.applyOperation.secondCall.calledWith( sinon.match( operation => operation instanceof MarkerOperation ) ) );
			expect( doc.applyOperation.thirdCall.calledWith( sinon.match( operation => operation instanceof MarkerOperation ) ) );
		} );

		it( 'should not create a delta and an operation if no nodes were inserted', () => {
			sinon.spy( doc, 'applyOperation' );

			batch = doc.batch();

			batch.insert( new Position( root, [ 0 ] ), [] );

			expect( batch.deltas.length ).to.equal( 0 );
			expect( doc.applyOperation.called ).to.be.false;
		} );
	} );

	describe( 'weakInsert()', () => {
		let doc, root, batch, chain, attrs;

		beforeEach( () => {
			doc = new Document();
			root = doc.createRoot();

			root.insertChildren( 0, new Text( 'abc' ) );

			batch = doc.batch();

			attrs = [ [ 'bold', true ], [ 'foo', 'bar' ] ];

			doc.selection.setAttributesTo( attrs );

			chain = batch.weakInsert( new Position( root, [ 2 ] ), 'xyz' );
		} );

		it( 'should insert given nodes at given position', () => {
			expect( root.maxOffset ).to.equal( 6 );
			expect( root.getChild( 0 ).data ).to.equal( 'ab' );
			expect( root.getChild( 1 ).data ).to.equal( 'xyz' );
			expect( root.getChild( 2 ).data ).to.equal( 'c' );
		} );

		it( 'should set inserted nodes attributes to same as current selection attributes', () => {
			expect( Array.from( root.getChild( 1 ).getAttributes() ) ).to.deep.equal( attrs );
		} );

		it( 'should be chainable', () => {
			expect( chain ).to.equal( batch );
		} );

		it( 'should add delta to batch and operation to delta before applying operation', () => {
			sinon.spy( doc, 'applyOperation' );
			batch.weakInsert( new Position( root, [ 2 ] ), 'xyz' );

			const correctDeltaMatcher = sinon.match( operation => {
				return operation.delta && operation.delta.batch && operation.delta.batch == batch;
			} );

			expect( doc.applyOperation.calledWith( correctDeltaMatcher ) ).to.be.true;
		} );
	} );

	describe( 'setAttribute() / removeAttribute()', () => {
		let batch, doc, root;

		const correctDeltaMatcher = sinon.match( operation => {
			return operation.delta && operation.delta.batch && operation.delta.batch == batch;
		} );

		beforeEach( () => {
			doc = new Document();
			root = doc.createRoot();
			batch = doc.batch();
		} );

		function getOperationsCount() {
			let totalNumber = 0;

			for ( const delta of batch.deltas ) {
				totalNumber += count( delta.operations );
			}

			return totalNumber;
		}

		describe( 'change attribute on node', () => {
			let node, text;

			beforeEach( () => {
				node = new Element( 'p', { a: 1 } );
				text = new Text( 'c', { a: 1 } );

				root.insertChildren( 0, [ node, text ] );
			} );

			describe( 'setAttribute', () => {
				it( 'should create the attribute on element', () => {
					batch.setAttribute( node, 'b', 2 );
					expect( getOperationsCount() ).to.equal( 1 );
					expect( node.getAttribute( 'b' ) ).to.equal( 2 );
				} );

				it( 'should change the attribute of element', () => {
					batch.setAttribute( node, 'a', 2 );
					expect( getOperationsCount() ).to.equal( 1 );
					expect( node.getAttribute( 'a' ) ).to.equal( 2 );
				} );

				it( 'should create the attribute on text node', () => {
					batch.setAttribute( text, 'b', 2 );
					expect( getOperationsCount() ).to.equal( 1 );
					expect( root.getChild( 1 ).getAttribute( 'b' ) ).to.equal( 2 );
				} );

				it( 'should change the attribute of text node', () => {
					batch.setAttribute( text, 'a', 2 );
					expect( getOperationsCount() ).to.equal( 1 );
					expect( root.getChild( 1 ).getAttribute( 'a' ) ).to.equal( 2 );
				} );

				it( 'should do nothing if the attribute value is the same', () => {
					batch.setAttribute( node, 'a', 1 );
					expect( getOperationsCount() ).to.equal( 0 );
					expect( node.getAttribute( 'a' ) ).to.equal( 1 );
				} );

				it( 'should be chainable', () => {
					const chain = batch.setAttribute( node, 'b', 2 );
					expect( chain ).to.equal( batch );
				} );

				it( 'should add delta to batch and operation to delta before applying operation', () => {
					sinon.spy( doc, 'applyOperation' );
					batch.setAttribute( node, 'b', 2 );

					expect( doc.applyOperation.calledWith( correctDeltaMatcher ) ).to.be.true;
				} );
			} );

			describe( 'removeAttribute', () => {
				it( 'should remove the attribute from element', () => {
					batch.removeAttribute( node, 'a' );
					expect( getOperationsCount() ).to.equal( 1 );
					expect( node.getAttribute( 'a' ) ).to.be.undefined;
				} );

				it( 'should remove the attribute from character', () => {
					batch.removeAttribute( text, 'a' );
					expect( getOperationsCount() ).to.equal( 1 );
					expect( root.getChild( 1 ).getAttribute( 'a' ) ).to.be.undefined;
				} );

				it( 'should do nothing if the attribute is not set', () => {
					batch.removeAttribute( node, 'b' );
					expect( getOperationsCount() ).to.equal( 0 );
				} );

				it( 'should be chainable', () => {
					const chain = batch.removeAttribute( node, 'a' );
					expect( chain ).to.equal( batch );
				} );

				it( 'should add delta to batch and operation to delta before applying operation', () => {
					sinon.spy( doc, 'applyOperation' );
					batch.removeAttribute( node, 'a' );

					expect( doc.applyOperation.calledWith( correctDeltaMatcher ) ).to.be.true;
				} );
			} );
		} );

		describe( 'change attribute on range', () => {
			beforeEach( () => {
				root.insertChildren( 0, [
					new Text( 'xxx', { a: 1 } ),
					new Text( 'xxx' ),
					new Text( 'xxx', { a: 1 } ),
					new Text( 'xxx', { a: 2 } ),
					new Text( 'xxx' ),
					new Text( 'xxx', { a: 1 } ),
					new Element( 'e', { a: 2 }, new Text( 'xxx' ) ),
					new Text( 'xxx' )
				] );
			} );

			function getRange( startIndex, endIndex ) {
				return new Range(
					Position.createFromParentAndOffset( root, startIndex ),
					Position.createFromParentAndOffset( root, endIndex )
				);
			}

			function getChangesAttrsCount() {
				let totalNumber = 0;

				for ( const delta of batch.deltas ) {
					for ( const operation of delta.operations ) {
						totalNumber += count( operation.range.getItems( { singleCharacters: true } ) );
					}
				}

				return totalNumber;
			}

			function getCompressedAttrs() {
				// default: 111---111222---1112------
				const range = Range.createIn( root );

				return Array.from( range.getItems( { singleCharacters: true } ) )
					.map( item => item.getAttribute( 'a' ) || '-' )
					.join( '' );
			}

			describe( 'setAttribute', () => {
				it( 'should set the attribute on the range', () => {
					batch.setAttribute( getRange( 3, 6 ), 'a', 3 );
					expect( getOperationsCount() ).to.equal( 1 );
					expect( getChangesAttrsCount() ).to.equal( 3 );
					expect( getCompressedAttrs() ).to.equal( '111333111222---1112------' );
				} );

				it( 'should split the operations if parts of the range have different attributes', () => {
					batch.setAttribute( getRange( 4, 14 ), 'a', 3 );
					expect( getOperationsCount() ).to.equal( 4 );
					expect( getChangesAttrsCount() ).to.equal( 10 );
					expect( getCompressedAttrs() ).to.equal( '111-3333333333-1112------' );
				} );

				it( 'should split the operations if parts of the part of the range have the attribute', () => {
					batch.setAttribute( getRange( 4, 14 ), 'a', 2 );
					expect( getOperationsCount() ).to.equal( 3 );
					expect( getChangesAttrsCount() ).to.equal( 7 );
					expect( getCompressedAttrs() ).to.equal( '111-2222222222-1112------' );
				} );

				it( 'should strip the range if the beginning have the attribute', () => {
					batch.setAttribute( getRange( 1, 5 ), 'a', 1 );
					expect( getOperationsCount() ).to.equal( 1 );
					expect( getChangesAttrsCount() ).to.equal( 2 );
					expect( getCompressedAttrs() ).to.equal( '11111-111222---1112------' );
				} );

				it( 'should strip the range if the ending have the attribute', () => {
					batch.setAttribute( getRange( 13, 17 ), 'a', 1 );
					expect( getOperationsCount() ).to.equal( 1 );
					expect( getChangesAttrsCount() ).to.equal( 2 );
					expect( getCompressedAttrs() ).to.equal( '111---111222-111112------' );
				} );

				it( 'should do nothing if the range has attribute', () => {
					batch.setAttribute( getRange( 0, 3 ), 'a', 1 );
					expect( getOperationsCount() ).to.equal( 0 );
					expect( getCompressedAttrs() ).to.equal( '111---111222---1112------' );
				} );

				it( 'should not check range\'s start position node when creating operations', () => {
					const range = new Range(
						new Position( root, [ 18, 1 ] ),
						new Position( root, [ 19 ] )
					);

					batch.setAttribute( range, 'a', 1 );
					expect( getOperationsCount() ).to.equal( 1 );
					expect( getChangesAttrsCount() ).to.equal( 2 );
					expect( getCompressedAttrs() ).to.equal( '111---111222---1112-11---' );
				} );

				it( 'should not change elements attribute if range contains closing tag', () => {
					const range = new Range(
						new Position( root, [ 18, 1 ] ),
						new Position( root, [ 21 ] )
					);

					batch.setAttribute( range, 'a', 1 );
					expect( getOperationsCount() ).to.equal( 1 );
					expect( getChangesAttrsCount() ).to.equal( 4 );
					expect( getCompressedAttrs() ).to.equal( '111---111222---1112-1111-' );
				} );

				it( 'should not create an operation if the range contains only closing tag', () => {
					const range = new Range(
						new Position( root, [ 18, 3 ] ),
						new Position( root, [ 19 ] )
					);

					batch.setAttribute( range, 'a', 3 );
					expect( getOperationsCount() ).to.equal( 0 );
					expect( getCompressedAttrs() ).to.equal( '111---111222---1112------' );
				} );

				it( 'should not create an operation if is collapsed', () => {
					batch.setAttribute( getRange( 3, 3 ), 'a', 1 );
					expect( getOperationsCount() ).to.equal( 0 );
					expect( getCompressedAttrs() ).to.equal( '111---111222---1112------' );
				} );

				it( 'should create a proper operations for the mixed range', () => {
					batch.setAttribute( getRange( 0, 20 ), 'a', 1 );
					expect( getOperationsCount() ).to.equal( 5 );
					expect( getChangesAttrsCount() ).to.equal( 14 );
					expect( getCompressedAttrs() ).to.equal( '11111111111111111111111--' );
				} );

				it( 'should be chainable', () => {
					const chain = batch.setAttribute( getRange( 3, 6 ), 'a', 3 );
					expect( chain ).to.equal( batch );
				} );

				it( 'should add delta to batch and operation to delta before applying operation', () => {
					sinon.spy( doc, 'applyOperation' );
					batch.setAttribute( getRange( 3, 6 ), 'a', 3 );

					expect( doc.applyOperation.calledWith( correctDeltaMatcher ) ).to.be.true;
				} );
			} );

			describe( 'removeAttribute', () => {
				it( 'should remove the attribute on the range', () => {
					batch.removeAttribute( getRange( 0, 2 ), 'a' );
					expect( getOperationsCount() ).to.equal( 1 );
					expect( getChangesAttrsCount() ).to.equal( 2 );
					expect( getCompressedAttrs() ).to.equal( '--1---111222---1112------' );
				} );

				it( 'should split the operations if parts of the range have different attributes', () => {
					batch.removeAttribute( getRange( 7, 11 ), 'a' );
					expect( getOperationsCount() ).to.equal( 2 );
					expect( getChangesAttrsCount() ).to.equal( 4 );
					expect( getCompressedAttrs() ).to.equal( '111---1----2---1112------' );
				} );

				it( 'should split the operations if parts of the part of the range have no attribute', () => {
					batch.removeAttribute( getRange( 1, 7 ), 'a' );
					expect( getOperationsCount() ).to.equal( 2 );
					expect( getChangesAttrsCount() ).to.equal( 3 );
					expect( getCompressedAttrs() ).to.equal( '1------11222---1112------' );
				} );

				it( 'should strip the range if the beginning have no attribute', () => {
					batch.removeAttribute( getRange( 4, 12 ), 'a' );
					expect( getOperationsCount() ).to.equal( 2 );
					expect( getChangesAttrsCount() ).to.equal( 6 );
					expect( getCompressedAttrs() ).to.equal( '111------------1112------' );
				} );

				it( 'should strip the range if the ending have no attribute', () => {
					batch.removeAttribute( getRange( 7, 15 ), 'a' );
					expect( getOperationsCount() ).to.equal( 2 );
					expect( getChangesAttrsCount() ).to.equal( 5 );
					expect( getCompressedAttrs() ).to.equal( '111---1--------1112------' );
				} );

				it( 'should do nothing if the range has no attribute', () => {
					batch.removeAttribute( getRange( 4, 5 ), 'a' );
					expect( getOperationsCount() ).to.equal( 0 );
					expect( getCompressedAttrs() ).to.equal( '111---111222---1112------' );
				} );

				it( 'should not check range\'s start position node when creating operations', () => {
					const range = new Range(
						new Position( root, [ 18, 3 ] ),
						new Position( root, [ 19 ] )
					);

					batch.removeAttribute( range, 'a' );
					expect( getOperationsCount() ).to.equal( 0 );
					expect( getChangesAttrsCount() ).to.equal( 0 );
					expect( getCompressedAttrs() ).to.equal( '111---111222---1112------' );
				} );

				it( 'should not apply operation twice in the range contains opening and closing tags', () => {
					batch.removeAttribute( getRange( 18, 22 ), 'a' );
					expect( getOperationsCount() ).to.equal( 1 );
					expect( getChangesAttrsCount() ).to.equal( 1 );
					expect( getCompressedAttrs() ).to.equal( '111---111222---111-------' );
				} );

				it( 'should not create an operation if range is collapsed', () => {
					batch.removeAttribute( getRange( 3, 3 ), 'a' );
					expect( getOperationsCount() ).to.equal( 0 );
					expect( getCompressedAttrs() ).to.equal( '111---111222---1112------' );
				} );

				it( 'should create a proper operations for the mixed range', () => {
					batch.removeAttribute( getRange( 3, 15 ), 'a' );
					expect( getOperationsCount() ).to.equal( 2 );
					expect( getChangesAttrsCount() ).to.equal( 6 );
					expect( getCompressedAttrs() ).to.equal( '111------------1112------' );
				} );

				it( 'should be chainable', () => {
					const chain = batch.removeAttribute( getRange( 0, 2 ), 'a' );
					expect( chain ).to.equal( batch );
				} );

				it( 'should add delta to batch and operation to delta before applying operation', () => {
					sinon.spy( doc, 'applyOperation' );
					batch.removeAttribute( getRange( 0, 2 ), 'a' );

					expect( doc.applyOperation.calledWith( correctDeltaMatcher ) ).to.be.true;
				} );
			} );
		} );

		describe( 'change attribute on root element', () => {
			describe( 'setAttribute', () => {
				it( 'should create the attribute on root', () => {
					batch.setAttribute( root, 'b', 2 );
					expect( getOperationsCount() ).to.equal( 1 );
					expect( root.getAttribute( 'b' ) ).to.equal( 2 );
				} );

				it( 'should change the attribute of root', () => {
					batch.setAttribute( root, 'a', 2 );
					expect( getOperationsCount() ).to.equal( 1 );
					expect( root.getAttribute( 'a' ) ).to.equal( 2 );
				} );

				it( 'should do nothing if the attribute value is the same', () => {
					batch.setAttribute( root, 'a', 1 );
					expect( getOperationsCount() ).to.equal( 1 );
					batch.setAttribute( root, 'a', 1 );
					expect( getOperationsCount() ).to.equal( 1 );
					expect( root.getAttribute( 'a' ) ).to.equal( 1 );
				} );
			} );

			describe( 'removeAttribute', () => {
				it( 'should remove the attribute from root', () => {
					batch.setAttribute( root, 'a', 1 );
					batch.removeAttribute( root, 'a' );
					expect( getOperationsCount() ).to.equal( 2 );
					expect( root.getAttribute( 'a' ) ).to.be.undefined;
				} );

				it( 'should do nothing if the attribute is not set', () => {
					batch.removeAttribute( root, 'b' );
					expect( getOperationsCount() ).to.equal( 0 );
				} );
			} );
		} );

		it( 'should not add empty delta to the batch', () => {
			const nodeA = new Element( 'p', { a: 1 } );
			const nodeB = new Element( 'p', { b: 2 } );
			root.insertChildren( 0, [ nodeA, nodeB ] );

			batch.setAttribute( nodeA, 'a', 1 );

			expect( batch.deltas.length ).to.equal( 0 );

			batch.removeAttribute( Range.createIn( root ), 'x' );

			expect( batch.deltas.length ).to.equal( 0 );
		} );
	} );

	describe( 'merge()', () => {
		let doc, root, p1, p2, batch;

		beforeEach( () => {
			doc = new Document();
			root = doc.createRoot();

			p1 = new Element( 'p', { key1: 'value1' }, new Text( 'foo' ) );
			p2 = new Element( 'p', { key2: 'value2' }, new Text( 'bar' ) );

			root.insertChildren( 0, [ p1, p2 ] );
		} );

		it( 'should merge foo and bar into foobar', () => {
			doc.batch().merge( new Position( root, [ 1 ] ) );

			expect( root.maxOffset ).to.equal( 1 );
			expect( root.getChild( 0 ).name ).to.equal( 'p' );
			expect( root.getChild( 0 ).maxOffset ).to.equal( 6 );
			expect( count( root.getChild( 0 ).getAttributes() ) ).to.equal( 1 );
			expect( root.getChild( 0 ).getAttribute( 'key1' ) ).to.equal( 'value1' );
			expect( root.getChild( 0 ).getChild( 0 ).data ).to.equal( 'foobar' );
		} );

		it( 'should throw if there is no element after', () => {
			expect( () => {
				doc.batch().merge( new Position( root, [ 2 ] ) );
			} ).to.throw( CKEditorError, /^batch-merge-no-element-after/ );
		} );

		it( 'should throw if there is no element before', () => {
			expect( () => {
				doc.batch().merge( new Position( root, [ 0, 2 ] ) );
			} ).to.throw( CKEditorError, /^batch-merge-no-element-before/ );
		} );

		it( 'should be chainable', () => {
			batch = doc.batch();

			const chain = batch.merge( new Position( root, [ 1 ] ) );
			expect( chain ).to.equal( batch );
		} );

		it( 'should add delta to batch and operation to delta before applying operation', () => {
			sinon.spy( doc, 'applyOperation' );
			batch = doc.batch().merge( new Position( root, [ 1 ] ) );

			const correctDeltaMatcher = sinon.match( operation => {
				return operation.delta && operation.delta.batch && operation.delta.batch == batch;
			} );

			expect( doc.applyOperation.calledWith( correctDeltaMatcher ) ).to.be.true;
		} );
	} );

	describe( 'move()', () => {
		let doc, root, div, p, batch, chain;

		beforeEach( () => {
			doc = new Document();
			root = doc.createRoot();

			div = new Element( 'div', [], new Text( 'foobar' ) );
			p = new Element( 'p', [], new Text( 'abcxyz' ) );

			div.insertChildren( 0, [ new Element( 'p', [], new Text( 'gggg' ) ) ] );
			div.insertChildren( 2, [ new Element( 'p', [], new Text( 'hhhh' ) ) ] );

			root.insertChildren( 0, [ div, p ] );

			batch = doc.batch();
		} );

		it( 'should move specified node', () => {
			batch.move( div, new Position( root, [ 2 ] ) );

			expect( root.maxOffset ).to.equal( 2 );
			expect( getNodesAndText( Range.createIn( root.getChild( 0 ) ) ) ).to.equal( 'abcxyz' );
			expect( getNodesAndText( Range.createIn( root.getChild( 1 ) ) ) ).to.equal( 'PggggPfoobarPhhhhP' );
		} );

		it( 'should move flat range of nodes', () => {
			const range = new Range( new Position( root, [ 0, 3 ] ), new Position( root, [ 0, 7 ] ) );
			batch.move( range, new Position( root, [ 1, 3 ] ) );

			expect( getNodesAndText( Range.createIn( root.getChild( 0 ) ) ) ).to.equal( 'PggggPfoPhhhhP' );
			expect( getNodesAndText( Range.createIn( root.getChild( 1 ) ) ) ).to.equal( 'abcobarxyz' );
		} );

		it( 'should throw if given range is not flat', () => {
			const notFlatRange = new Range( new Position( root, [ 0, 2, 2 ] ), new Position( root, [ 0, 6 ] ) );

			expect( () => {
				doc.batch().move( notFlatRange, new Position( root, [ 1, 3 ] ) );
			} ).to.throw( CKEditorError, /^batch-move-range-not-flat/ );
		} );

		it( 'should be chainable', () => {
			chain = batch.move( div, new Position( root, [ 1, 3 ] ) );

			expect( chain ).to.equal( batch );
		} );

		it( 'should add delta to batch and operation to delta before applying operation', () => {
			sinon.spy( doc, 'applyOperation' );
			batch.move( div, new Position( root, [ 2 ] ) );

			const correctDeltaMatcher = sinon.match( operation => {
				return operation.delta && operation.delta.batch && operation.delta.batch == batch;
			} );

			expect( doc.applyOperation.calledWith( correctDeltaMatcher ) ).to.be.true;
		} );
	} );

	describe( 'remove()', () => {
		let doc, root, div, p, batch, chain, range;

		beforeEach( () => {
			doc = new Document();
			root = doc.createRoot();

			div = new Element( 'div', [], new Text( 'foobar' ) );
			p = new Element( 'p', [], new Text( 'abcxyz' ) );

			div.insertChildren( 0, [ new Element( 'p', [], new Text( 'gggg' ) ) ] );
			div.insertChildren( 2, [ new Element( 'p', [], new Text( 'hhhh' ) ) ] );

			root.insertChildren( 0, [ div, p ] );

			batch = doc.batch();

			// Range starts in ROOT > DIV > P > gg|gg.
			// Range ends in ROOT > DIV > ...|ar.
			range = new Range( new Position( root, [ 0, 0, 2 ] ), new Position( root, [ 0, 5 ] ) );
		} );

		it( 'should remove specified node', () => {
			batch.remove( div );

			expect( root.maxOffset ).to.equal( 1 );
			expect( root.childCount ).to.equal( 1 );
			expect( getNodesAndText( Range.createIn( root.getChild( 0 ) ) ) ).to.equal( 'abcxyz' );
		} );

		it( 'should remove any range of nodes', () => {
			batch.remove( range );

			expect( getNodesAndText( Range.createIn( root.getChild( 0 ) ) ) ).to.equal( 'PggParPhhhhP' );
			expect( getNodesAndText( Range.createIn( root.getChild( 1 ) ) ) ).to.equal( 'abcxyz' );
		} );

		it( 'should create minimal number of remove deltas, each with only one operation', () => {
			batch.remove( range );

			expect( batch.deltas.length ).to.equal( 2 );
			expect( batch.deltas[ 0 ].operations.length ).to.equal( 1 );
			expect( batch.deltas[ 1 ].operations.length ).to.equal( 1 );
		} );

		it( 'should be chainable', () => {
			chain = batch.remove( range );

			expect( chain ).to.equal( batch );
		} );

		it( 'should add delta to batch and operation to delta before applying operation', () => {
			sinon.spy( doc, 'applyOperation' );
			batch.remove( div );

			const correctDeltaMatcher = sinon.match( operation => {
				return operation.delta && operation.delta.batch && operation.delta.batch == batch;
			} );

			expect( doc.applyOperation.calledWith( correctDeltaMatcher ) ).to.be.true;
		} );
	} );

	describe( 'rename()', () => {
		let doc, root, batch, chain;

		beforeEach( () => {
			doc = new Document();
			root = doc.createRoot();

			const p = new Element( 'p', null, new Text( 'abc' ) );
			root.appendChildren( p );

			batch = doc.batch();

			chain = batch.rename( p, 'h' );
		} );

		it( 'should rename given element', () => {
			expect( root.maxOffset ).to.equal( 1 );
			expect( root.getChild( 0 ) ).to.have.property( 'name', 'h' );
			expect( root.getChild( 0 ) ).to.have.property( 'name', 'h' );
		} );

		it( 'should throw if not an Element instance is passed', () => {
			expect( () => {
				batch.rename( new Text( 'abc' ), 'h' );
			} ).to.throw( CKEditorError, /^batch-rename-not-element-instance/ );
		} );

		it( 'should be chainable', () => {
			expect( chain ).to.equal( batch );
		} );

		it( 'should add delta to batch and operation to delta before applying operation', () => {
			sinon.spy( doc, 'applyOperation' );
			batch.rename( root.getChild( 0 ), 'p' );

			const correctDeltaMatcher = sinon.match( operation => {
				return operation.delta && operation.delta.batch && operation.delta.batch == batch;
			} );

			expect( doc.applyOperation.alwaysCalledWith( correctDeltaMatcher ) ).to.be.true;
		} );
	} );

	describe( 'split()', () => {
		let doc, root, p;

		beforeEach( () => {
			doc = new Document();
			root = doc.createRoot();

			p = new Element( 'p', { key: 'value' }, new Text( 'foobar' ) );

			root.insertChildren( 0, p );
		} );

		it( 'should split foobar to foo and bar', () => {
			doc.batch().split( new Position( root, [ 0, 3 ] ) );

			expect( root.maxOffset ).to.equal( 2 );

			expect( root.getChild( 0 ).name ).to.equal( 'p' );
			expect( root.getChild( 0 ).maxOffset ).to.equal( 3 );
			expect( count( root.getChild( 0 ).getAttributes() ) ).to.equal( 1 );
			expect( root.getChild( 0 ).getAttribute( 'key' ) ).to.equal( 'value' );
			expect( root.getChild( 0 ).getChild( 0 ).data ).to.equal( 'foo' );

			expect( root.getChild( 1 ).name ).to.equal( 'p' );
			expect( root.getChild( 1 ).maxOffset ).to.equal( 3 );
			expect( count( root.getChild( 1 ).getAttributes() ) ).to.equal( 1 );
			expect( root.getChild( 1 ).getAttribute( 'key' ) ).to.equal( 'value' );
			expect( root.getChild( 1 ).getChild( 0 ).data ).to.equal( 'bar' );
		} );

		it( 'should create an empty paragraph if we split at the end', () => {
			doc.batch().split( new Position( root, [ 0, 6 ] ) );

			expect( root.maxOffset ).to.equal( 2 );

			expect( root.getChild( 0 ).name ).to.equal( 'p' );
			expect( root.getChild( 0 ).maxOffset ).to.equal( 6 );
			expect( count( root.getChild( 0 ).getAttributes() ) ).to.equal( 1 );
			expect( root.getChild( 0 ).getAttribute( 'key' ) ).to.equal( 'value' );
			expect( root.getChild( 0 ).getChild( 0 ).data ).to.equal( 'foobar' );

			expect( root.getChild( 1 ).name ).to.equal( 'p' );
			expect( root.getChild( 1 ).maxOffset ).to.equal( 0 );
			expect( count( root.getChild( 1 ).getAttributes() ) ).to.equal( 1 );
			expect( root.getChild( 1 ).getAttribute( 'key' ) ).to.equal( 'value' );
		} );

		it( 'should throw if we try to split a root', () => {
			expect( () => {
				doc.batch().split( new Position( root, [ 0 ] ) );
			} ).to.throw( CKEditorError, /^batch-split-root/ );
		} );

		it( 'should be chainable', () => {
			const batch = doc.batch();

			const chain = batch.split( new Position( root, [ 0, 3 ] ) );
			expect( chain ).to.equal( batch );
		} );

		it( 'should add delta to batch and operation to delta before applying operation', () => {
			sinon.spy( doc, 'applyOperation' );
			const batch = doc.batch().split( new Position( root, [ 0, 3 ] ) );

			const correctDeltaMatcher = sinon.match( operation => {
				return operation.delta && operation.delta.batch && operation.delta.batch == batch;
			} );

			expect( doc.applyOperation.calledWith( correctDeltaMatcher ) ).to.be.true;
		} );
	} );

	describe( 'wrap()', () => {
		let doc, root, range;

		beforeEach( () => {
			doc = new Document();
			root = doc.createRoot();

			root.insertChildren( 0, new Text( 'foobar' ) );

			range = new Range( new Position( root, [ 2 ] ), new Position( root, [ 4 ] ) );
		} );

		it( 'should wrap flat range with given element', () => {
			const p = new Element( 'p' );
			doc.batch().wrap( range, p );

			expect( root.maxOffset ).to.equal( 5 );
			expect( root.getChild( 0 ).data ).to.equal( 'fo' );
			expect( root.getChild( 1 ) ).to.equal( p );
			expect( p.getChild( 0 ).data ).to.equal( 'ob' );
			expect( root.getChild( 2 ).data ).to.equal( 'ar' );
		} );

		it( 'should wrap flat range with an element of given name', () => {
			doc.batch().wrap( range, 'p' );

			expect( root.maxOffset ).to.equal( 5 );
			expect( root.getChild( 0 ).data ).to.equal( 'fo' );
			expect( root.getChild( 1 ).name ).to.equal( 'p' );
			expect( root.getChild( 1 ).getChild( 0 ).data ).to.equal( 'ob' );
			expect( root.getChild( 2 ).data ).to.equal( 'ar' );
		} );

		it( 'should throw if range to wrap is not flat', () => {
			root.insertChildren( 1, [ new Element( 'p', [], new Text( 'xyz' ) ) ] );
			const notFlatRange = new Range( new Position( root, [ 3 ] ), new Position( root, [ 6, 2 ] ) );

			expect( () => {
				doc.batch().wrap( notFlatRange, 'p' );
			} ).to.throw( CKEditorError, /^batch-wrap-range-not-flat/ );
		} );

		it( 'should throw if element to wrap with has children', () => {
			const p = new Element( 'p', [], new Text( 'a' ) );

			expect( () => {
				doc.batch().wrap( range, p );
			} ).to.throw( CKEditorError, /^batch-wrap-element-not-empty/ );
		} );

		it( 'should throw if element to wrap with has children', () => {
			const p = new Element( 'p' );
			root.insertChildren( 0, p );

			expect( () => {
				doc.batch().wrap( range, p );
			} ).to.throw( CKEditorError, /^batch-wrap-element-attached/ );
		} );

		it( 'should be chainable', () => {
			const batch = doc.batch();

			const chain = batch.wrap( range, 'p' );
			expect( chain ).to.equal( batch );
		} );

		it( 'should add delta to batch and operation to delta before applying operation', () => {
			sinon.spy( doc, 'applyOperation' );
			const batch = doc.batch().wrap( range, 'p' );

			const correctDeltaMatcher = sinon.match( operation => {
				return operation.delta && operation.delta.batch && operation.delta.batch == batch;
			} );

			expect( doc.applyOperation.calledWith( correctDeltaMatcher ) ).to.be.true;
		} );
	} );

	describe( 'unwrap()', () => {
		let doc, root, p;

		beforeEach( () => {
			doc = new Document();
			root = doc.createRoot();

			p = new Element( 'p', [], new Text( 'xyz' ) );
			root.insertChildren( 0, [ new Text( 'a' ), p, new Text( 'b' ) ] );
		} );

		it( 'should unwrap given element', () => {
			doc.batch().unwrap( p );

			expect( root.maxOffset ).to.equal( 5 );
			expect( root.getChild( 0 ).data ).to.equal( 'axyzb' );
		} );

		it( 'should throw if element to unwrap has no parent', () => {
			const element = new Element( 'p' );

			expect( () => {
				doc.batch().unwrap( element );
			} ).to.throw( CKEditorError, /^batch-unwrap-element-no-parent/ );
		} );

		it( 'should be chainable', () => {
			const batch = doc.batch();

			const chain = batch.unwrap( p );
			expect( chain ).to.equal( batch );
		} );

		it( 'should add delta to batch and operation to delta before applying operation', () => {
			sinon.spy( doc, 'applyOperation' );
			const batch = doc.batch().unwrap( p );

			const correctDeltaMatcher = sinon.match( operation => {
				return operation.delta && operation.delta.batch && operation.delta.batch == batch;
			} );

			expect( doc.applyOperation.calledWith( correctDeltaMatcher ) ).to.be.true;
		} );
	} );

	describe( 'setMarker()', () => {
		let doc, root, range;

		beforeEach( () => {
			doc = new Document();
			root = doc.createRoot();
			root.appendChildren( new Text( 'foo' ) );
			range = Range.createIn( root );
		} );

		it( 'should add marker to the document marker collection', () => {
			doc.batch().setMarker( 'name', range );

			expect( doc.markers.get( 'name' ).getRange().isEqual( range ) ).to.be.true;
		} );

		it( 'should update marker in the document marker collection', () => {
			doc.batch().setMarker( 'name', range );

			const range2 = Range.createFromParentsAndOffsets( root, 0, root, 0 );
			doc.batch().setMarker( 'name', range2 );

			expect( doc.markers.get( 'name' ).getRange().isEqual( range2 ) ).to.be.true;
		} );

		it( 'should accept marker instance', () => {
			doc.batch().setMarker( 'name', range );
			const marker = doc.markers.get( 'name' );
			const range2 = Range.createFromParentsAndOffsets( root, 0, root, 0 );

			const batch = doc.batch().setMarker( marker, range2 );
			const op = batch.deltas[ 0 ].operations[ 0 ];

			expect( doc.markers.get( 'name' ).getRange().isEqual( range2 ) ).to.be.true;
			expect( op.oldRange.isEqual( range ) ).to.be.true;
			expect( op.newRange.isEqual( range2 ) ).to.be.true;
		} );

		it( 'should accept empty range parameter if marker instance is passed', () => {
			const marker = doc.markers.set( 'name', range );

			sinon.spy( doc, 'fire' );

			doc.on( 'change', ( evt, type, changes ) => {
				if ( type == 'marker' ) {
					expect( changes.type ).to.equal( 'set' );
					expect( changes.name ).to.equal( 'name' );
				}
			} );

			const batch = doc.batch().setMarker( marker );
			const op = batch.deltas[ 0 ].operations[ 0 ];

			expect( doc.fire.calledWith( 'change', 'marker' ) ).to.be.true;
			expect( op.oldRange ).to.be.null;
			expect( op.newRange.isEqual( range ) ).to.be.true;
		} );

		it( 'should throw if marker with given name does not exist and range is not passed', () => {
			expect( () => {
				doc.batch().setMarker( 'name' );
			} ).to.throw( CKEditorError, /^batch-setMarker-no-range/ );
		} );

		it( 'should be chainable', () => {
			const batch = doc.batch();
			const chain = batch.setMarker( 'name', range );

			expect( chain ).to.equal( batch );
		} );
	} );

	describe( 'removeMarker()', () => {
		let doc, root, range;

		beforeEach( () => {
			doc = new Document();
			root = doc.createRoot();
			root.appendChildren( new Text( 'foo' ) );
			range = Range.createIn( root );
		} );

		it( 'should remove marker from the document marker collection', () => {
			doc.batch().setMarker( 'name', range );
			doc.batch().removeMarker( 'name' );

			expect( doc.markers.get( 'name' ) ).to.be.null;
		} );

		it( 'should throw when trying to remove non existing marker', () => {
			expect( () => {
				doc.batch().removeMarker( 'name' );
			} ).to.throw( CKEditorError, /^batch-removeMarker-no-marker/ );
		} );

		it( 'should accept marker instance', () => {
			doc.batch().setMarker( 'name', range );
			const marker = doc.markers.get( 'name' );

			doc.batch().removeMarker( marker );

			expect( doc.markers.get( 'name' ) ).to.be.null;
		} );

		it( 'should add delta to batch and operation to delta before applying operation', () => {
			sinon.spy( doc, 'applyOperation' );
			const batch = doc.batch().setMarker( 'name', range );

			const correctDeltaMatcher = sinon.match( operation => {
				return operation.delta && operation.delta.batch && operation.delta.batch == batch;
			} );

			expect( doc.applyOperation.calledWith( correctDeltaMatcher ) ).to.be.true;
		} );
	} );
} );
