/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import Model from '../../src/model/model';
import ModelText from '../../src/model/text';
import ModelRange from '../../src/model/range';
import ModelPosition from '../../src/model/position';
import ModelSelection from '../../src/model/selection';
import ModelDocumentFragment from '../../src/model/documentfragment';
import Batch from '../../src/model/batch';
import NoOperation from '../../src/model/operation/nooperation';
import { getData, setData, stringify } from '../../src/dev-utils/model';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

describe( 'Model', () => {
	let model, schema, changes;

	beforeEach( () => {
		model = new Model();
		model.document.createRoot();
		model.document.createRoot( '$root', 'title' );

		schema = model.schema;

		changes = '';
	} );

	describe( 'constructor()', () => {
		it( 'registers $root to the schema', () => {
			expect( schema.isRegistered( '$root' ) ).to.be.true;
			expect( schema.isLimit( '$root' ) ).to.be.true;
		} );

		it( 'registers $block to the schema', () => {
			expect( schema.isRegistered( '$block' ) ).to.be.true;
			expect( schema.isBlock( '$block' ) ).to.be.true;
			expect( schema.checkChild( [ '$root' ], '$block' ) ).to.be.true;
		} );

		it( 'registers $text to the schema', () => {
			expect( schema.isRegistered( '$text' ) ).to.be.true;
			expect( schema.isContent( '$text' ) ).to.be.true;
			expect( schema.checkChild( [ '$block' ], '$text' ) ).to.be.true;
		} );

		it( 'registers $clipboardHolder to the schema', () => {
			expect( schema.isRegistered( '$clipboardHolder' ) ).to.be.true;
			expect( schema.isLimit( '$clipboardHolder' ) ).to.be.true;
			expect( schema.checkChild( [ '$clipboardHolder' ], '$text' ) ).to.be.true;
			expect( schema.checkChild( [ '$clipboardHolder' ], '$block' ) ).to.be.true;
		} );

		it( 'registers $marker to the schema', () => {
			model.document.createRoot( '$anywhere', 'anywhere' );
			schema.register( 'anything' );

			expect( schema.isRegistered( '$marker' ) ).to.be.true;
			expect( schema.checkChild( [ '$root' ], '$marker' ) ).to.be.true;
			expect( schema.checkChild( [ '$block' ], '$marker' ) ).to.be.true;
			expect( schema.checkChild( [ '$anywhere' ], '$marker' ) ).to.be.true;
			expect( schema.checkChild( [ 'anything' ], '$marker' ) ).to.be.true;
		} );
	} );

	describe( 'change() & enqueueChange()', () => {
		it( 'should execute changes immediately', () => {
			model.change( () => {
				changes += 'A';
			} );

			expect( changes ).to.equal( 'A' );
		} );

		it( 'should pass returned value', () => {
			const ret = model.change( () => {
				changes += 'A';

				return 'B';
			} );

			changes += ret;

			expect( changes ).to.equal( 'AB' );
		} );

		it( 'should not mixed the order when nested change is called', () => {
			const ret = model.change( () => {
				changes += 'A';

				nested();

				return 'D';
			} );

			changes += ret;

			expect( changes ).to.equal( 'ABCD' );

			function nested() {
				const ret = model.change( () => {
					changes += 'B';

					return 'C';
				} );

				changes += ret;
			}
		} );

		it( 'should execute enqueueChange immediately if its the first block', () => {
			model.enqueueChange( () => {
				changes += 'A';

				nested();
			} );

			expect( changes ).to.equal( 'ABC' );

			function nested() {
				const ret = model.change( () => {
					changes += 'B';

					return 'C';
				} );

				changes += ret;
			}
		} );

		it( 'should be possible to enqueueChange immediately if its the first block', () => {
			model.enqueueChange( () => {
				changes += 'A';

				nested();
			} );

			expect( changes ).to.equal( 'AB' );

			function nested() {
				model.change( () => {
					changes += 'B';
				} );
			}
		} );

		it( 'should be possible to nest change in enqueueChange', () => {
			model.enqueueChange( () => {
				changes += 'A';

				nested();

				changes += 'D';
			} );

			expect( changes ).to.equal( 'ABCD' );

			function nested() {
				const ret = model.change( () => {
					changes += 'B';

					return 'C';
				} );

				changes += ret;
			}
		} );

		it( 'should be possible to nest enqueueChange in enqueueChange', () => {
			model.enqueueChange( () => {
				changes += 'A';

				nestedEnqueue();

				changes += 'B';
			} );

			expect( changes ).to.equal( 'ABC' );

			function nestedEnqueue() {
				model.enqueueChange( () => {
					changes += 'C';
				} );
			}
		} );

		it( 'should be possible to nest enqueueChange in changes', () => {
			const ret = model.change( () => {
				changes += 'A';

				nestedEnqueue();

				changes += 'B';

				return 'D';
			} );

			changes += ret;

			expect( changes ).to.equal( 'ABCD' );

			function nestedEnqueue() {
				model.enqueueChange( () => {
					changes += 'C';
				} );
			}
		} );

		it( 'should be possible to nest enqueueChange in enqueueChange event', () => {
			model.enqueueChange( () => {
				changes += 'A';

				model.enqueueChange( () => {
					changes += 'C';
				} );

				changes += 'B';
			} );

			expect( changes ).to.equal( 'ABC' );
		} );

		it( 'should be possible to nest enqueueChange in changes event', () => {
			model.change( () => {
				changes += 'A';

				model.enqueueChange( () => {
					changes += 'C';
				} );

				changes += 'B';
			} );

			expect( changes ).to.equal( 'ABC' );
		} );

		it( 'should be possible to nest changes in enqueueChange event', () => {
			model.enqueueChange( () => {
				changes += 'A';

				model.change( () => {
					changes += 'B';
				} );

				changes += 'C';
			} );

			expect( changes ).to.equal( 'ABC' );
		} );

		it( 'should be possible to nest changes in changes event', () => {
			model.change( () => {
				changes += 'A';

				model.change( () => {
					changes += 'B';
				} );

				changes += 'C';
			} );

			expect( changes ).to.equal( 'ABC' );
		} );

		it( 'should let mix blocks', () => {
			model.change( () => {
				changes += 'A';

				model.enqueueChange( () => {
					changes += 'C';

					model.change( () => {
						changes += 'D';

						model.enqueueChange( () => {
							changes += 'F';
						} );
					} );

					model.change( () => {
						changes += 'E';
					} );
				} );

				changes += 'B';
			} );

			expect( changes ).to.equal( 'ABCDEF' );
		} );

		it( 'should use the same writer in all change blocks (change & change)', () => {
			model.change( outerWriter => {
				model.change( innerWriter => {
					expect( innerWriter ).to.equal( outerWriter );
				} );
			} );
		} );

		it( 'should create new writer in enqueue block', () => {
			model.change( outerWriter => {
				model.enqueueChange( innerWriter => {
					expect( innerWriter ).to.not.equal( outerWriter );
					expect( innerWriter.batch ).to.not.equal( outerWriter.batch );
				} );
			} );
		} );

		it( 'should let you pass batch', () => {
			let outerBatch;

			model.change( outerWriter => {
				outerBatch = outerWriter.batch;

				model.enqueueChange( outerBatch, innerWriter => {
					expect( innerWriter.batch ).to.equal( outerBatch );
				} );
			} );
		} );

		it( 'should let you create transparent batch', () => {
			model.enqueueChange( 'transparent', writer => {
				expect( writer.batch.type ).to.equal( 'transparent' );
			} );
		} );

		it( 'should rethrow native errors as they are in the dubug=true mode in the model.change() block', () => {
			const error = new TypeError( 'foo' );

			expect( () => {
				model.change( () => {
					throw error;
				} );
			} ).to.throw( TypeError, /foo/ );
		} );

		it( 'should throw the original CKEditorError error if it was thrown inside the `change()` block', () => {
			expectToThrowCKEditorError( () => {
				model.change( () => {
					throw new CKEditorError( 'foo', null, { foo: 1 } );
				} );
			}, /foo/, null, { foo: 1 } );
		} );

		it( 'should rethrow native errors as they are in the dubug=true mode in the enqueueChange() block', () => {
			const error = new TypeError( 'foo' );

			expect( () => {
				model.enqueueChange( () => {
					throw error;
				} );
			} ).to.throw( TypeError, /foo/ );
		} );

		it( 'should throw the original CKEditorError error if it was thrown inside the `enqueueChange()` block', () => {
			const err = new CKEditorError( 'foo', null, { foo: 1 } );

			expectToThrowCKEditorError( () => {
				model.enqueueChange( () => {
					throw err;
				} );
			}, /foo/, null, { foo: 1 } );
		} );
	} );

	describe( 'applyOperation()', () => {
		it( 'should execute provided operation', () => {
			const operation = {
				_execute: sinon.spy(),
				_validate: () => true
			};

			model.applyOperation( operation );

			sinon.assert.calledOnce( operation._execute );
		} );
	} );

	describe( 'insertContent()', () => {
		it( 'should be decorated', () => {
			schema.extend( '$text', { allowIn: '$root' } ); // To surpress warnings.

			const spy = sinon.spy();

			model.on( 'insertContent', spy );

			model.insertContent( new ModelText( 'a' ) );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should insert content (item)', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			setData( model, '<paragraph>fo[]ar</paragraph>' );

			model.insertContent( new ModelText( 'ob' ) );

			expect( getData( model ) ).to.equal( '<paragraph>foob[]ar</paragraph>' );
		} );

		it( 'should insert content (document fragment)', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			setData( model, '<paragraph>fo[]ar</paragraph>' );

			model.insertContent( new ModelDocumentFragment( [ new ModelText( 'ob' ) ] ) );

			expect( getData( model ) ).to.equal( '<paragraph>foob[]ar</paragraph>' );
		} );

		it( 'should use current model selection if no selectable passed', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			setData( model, '<paragraph>fo[]ar</paragraph>' );

			model.insertContent( new ModelText( 'ob' ) );

			expect( getData( model ) ).to.equal( '<paragraph>foob[]ar</paragraph>' );
		} );

		it( 'should use parent batch', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			setData( model, '<paragraph>[]</paragraph>' );

			model.change( writer => {
				model.insertContent( new ModelText( 'abc' ) );
				expect( writer.batch.operations ).to.length( 1 );
			} );
		} );
	} );

	describe( 'deleteContent()', () => {
		it( 'should be decorated', () => {
			const spy = sinon.spy();

			model.on( 'deleteContent', spy );

			model.deleteContent( model.document.selection );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should delete selected content', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			setData( model, '<paragraph>fo[ob]ar</paragraph>' );

			model.deleteContent( model.document.selection );

			expect( getData( model ) ).to.equal( '<paragraph>fo[]ar</paragraph>' );
		} );

		it( 'should use parent batch', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			setData( model, '<paragraph>fo[ob]ar</paragraph>' );

			model.change( writer => {
				model.deleteContent( model.document.selection );
				expect( writer.batch.operations ).to.length( 1 );
			} );
		} );
	} );

	describe( 'modifySelection()', () => {
		it( 'should be decorated', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			setData( model, '<paragraph>fo[ob]ar</paragraph>' );

			const spy = sinon.spy();

			model.on( 'modifySelection', spy );

			model.modifySelection( model.document.selection );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should modify a selection', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			setData( model, '<paragraph>fo[ob]ar</paragraph>' );

			expect( getData( model ) ).to.equal( '<paragraph>fo[ob]ar</paragraph>' );

			model.modifySelection( model.document.selection, { direction: 'backward' } );

			expect( getData( model ) ).to.equal( '<paragraph>fo[o]bar</paragraph>' );
		} );
	} );

	describe( 'getSelectedContent()', () => {
		it( 'should be decorated', () => {
			const spy = sinon.spy();
			const sel = new ModelSelection();

			model.on( 'getSelectedContent', spy );

			model.getSelectedContent( sel );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should return selected content', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			setData( model, '<paragraph>fo[ob]ar</paragraph>' );

			const content = model.getSelectedContent( model.document.selection );

			expect( stringify( content ) ).to.equal( 'ob' );
		} );

		it( 'should use parent batch', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			setData( model, '<paragraph>fo[ob]ar</paragraph>' );

			model.change( writer => {
				model.getSelectedContent( model.document.selection );
				expect( writer.batch.operations ).to.length( 1 );
			} );
		} );
	} );

	describe( 'hasContent()', () => {
		let root;

		beforeEach( () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			schema.register( 'div', { inheritAllFrom: '$block' } );
			schema.extend( '$block', { allowIn: 'div' } );
			schema.register( 'image', {
				isObject: true
			} );
			schema.extend( 'image', { allowIn: 'div' } );
			schema.register( 'listItem', {
				inheritAllFrom: '$block'
			} );

			setData(
				model,

				'<div>' +
				'<paragraph></paragraph>' +
				'</div>' +
				'<paragraph>foo</paragraph>' +
				'<div>' +
				'<image></image>' +
				'</div>' +
				'<listItem></listItem>' +
				'<listItem></listItem>' +
				'<listItem></listItem>'
			);

			root = model.document.getRoot();
		} );

		it( 'should return true if given element has text node', () => {
			const pFoo = root.getChild( 1 );

			expect( model.hasContent( pFoo ) ).to.be.true;
		} );

		it( 'should return true if given element has text node (ignoreWhitespaces)', () => {
			const pFoo = root.getChild( 1 );

			expect( model.hasContent( pFoo, { ignoreWhitespaces: true } ) ).to.be.true;
		} );

		it( 'should return true if given element has text node containing spaces only', () => {
			const pEmpty = root.getChild( 0 ).getChild( 0 );

			model.enqueueChange( 'transparent', writer => {
				// Model `setData()` method trims whitespaces so use writer here to insert whitespace only text.
				writer.insertText( '    ', pEmpty, 'end' );
			} );

			expect( model.hasContent( pEmpty ) ).to.be.true;
		} );

		it( 'should false true if given element has text node containing spaces only (ignoreWhitespaces)', () => {
			const pEmpty = root.getChild( 0 ).getChild( 0 );

			model.enqueueChange( 'transparent', writer => {
				// Model `setData()` method trims whitespaces so use writer here to insert whitespace only text.
				writer.insertText( '    ', pEmpty, 'end' );
			} );

			expect( model.hasContent( pEmpty, { ignoreWhitespaces: true } ) ).to.be.false;
		} );

		it( 'should return true if given element has element that is an object', () => {
			const divImg = root.getChild( 2 );

			expect( model.hasContent( divImg ) ).to.be.true;
		} );

		it( 'should return false if given element has no elements', () => {
			const pEmpty = root.getChild( 0 ).getChild( 0 );

			expect( model.hasContent( pEmpty ) ).to.be.false;
		} );

		it( 'should return false if given element has only elements that are not objects', () => {
			const divP = root.getChild( 0 );

			expect( model.hasContent( divP ) ).to.be.false;
		} );

		it( 'should return true if there is a text node in given range', () => {
			const range = new ModelRange( ModelPosition._createAt( root, 1 ), ModelPosition._createAt( root, 2 ) );

			expect( model.hasContent( range ) ).to.be.true;
		} );

		it( 'should return true if there is a part of text node in given range', () => {
			const pFoo = root.getChild( 1 );
			const range = new ModelRange( ModelPosition._createAt( pFoo, 1 ), ModelPosition._createAt( pFoo, 2 ) );

			expect( model.hasContent( range ) ).to.be.true;
		} );

		it( 'should return true if there is element that is an object in given range', () => {
			const divImg = root.getChild( 2 );
			const range = new ModelRange( ModelPosition._createAt( divImg, 0 ), ModelPosition._createAt( divImg, 1 ) );

			expect( model.hasContent( range ) ).to.be.true;
		} );

		it( 'should return false if range is collapsed', () => {
			const range = new ModelRange( ModelPosition._createAt( root, 1 ), ModelPosition._createAt( root, 1 ) );

			expect( model.hasContent( range ) ).to.be.false;
		} );

		it( 'should return false if range has only elements that are not objects', () => {
			const range = new ModelRange( ModelPosition._createAt( root, 0 ), ModelPosition._createAt( root, 1 ) );

			expect( model.hasContent( range ) ).to.be.false;
		} );

		it( 'should return false for empty list items', () => {
			const range = new ModelRange( ModelPosition._createAt( root, 3 ), ModelPosition._createAt( root, 6 ) );

			expect( model.hasContent( range ) ).to.be.false;
		} );

		it( 'should return false for empty element with marker (usingOperation=false, affectsData=false)', () => {
			const pEmpty = root.getChild( 0 ).getChild( 0 );

			model.enqueueChange( 'transparent', writer => {
				// Insert marker.
				const range = ModelRange._createIn( pEmpty );
				writer.addMarker( 'comment1', { range, usingOperation: false, affectsData: false } );
			} );

			expect( model.hasContent( pEmpty ) ).to.be.false;
			expect( model.hasContent( pEmpty, { ignoreWhitespaces: true } ) ).to.be.false;
			expect( model.hasContent( pEmpty, { ignoreMarkers: true } ) ).to.be.false;
			expect( model.hasContent( pEmpty, { ignoreMarkers: true, ignoreWhitespaces: true } ) ).to.be.false;
		} );

		it( 'should return false for empty element with marker (usingOperation=true, affectsData=false)', () => {
			const pEmpty = root.getChild( 0 ).getChild( 0 );

			model.enqueueChange( 'transparent', writer => {
				// Insert marker.
				const range = ModelRange._createIn( pEmpty );
				writer.addMarker( 'comment1', { range, usingOperation: true, affectsData: false } );
			} );

			expect( model.hasContent( pEmpty ) ).to.be.false;
			expect( model.hasContent( pEmpty, { ignoreWhitespaces: true } ) ).to.be.false;
			expect( model.hasContent( pEmpty, { ignoreMarkers: true } ) ).to.be.false;
			expect( model.hasContent( pEmpty, { ignoreMarkers: true, ignoreWhitespaces: true } ) ).to.be.false;
		} );

		it( 'should return false (ignoreWhitespaces) for empty text with marker (usingOperation=false, affectsData=false)', () => {
			const pEmpty = root.getChild( 0 ).getChild( 0 );

			model.enqueueChange( 'transparent', writer => {
				// Insert empty text.
				const text = writer.createText( '    ', { bold: true } );
				writer.append( text, pEmpty );

				// Insert marker.
				const range = ModelRange._createIn( pEmpty );
				writer.addMarker( 'comment1', { range, usingOperation: false, affectsData: false } );
			} );

			expect( model.hasContent( pEmpty, { ignoreWhitespaces: true } ) ).to.be.false;
			expect( model.hasContent( pEmpty, { ignoreWhitespaces: true, ignoreMarkers: true } ) ).to.be.false;
		} );

		it( 'should return true for empty text with marker (usingOperation=false, affectsData=false)', () => {
			const pEmpty = root.getChild( 0 ).getChild( 0 );

			model.enqueueChange( 'transparent', writer => {
				// Insert empty text.
				const text = writer.createText( '    ', { bold: true } );
				writer.append( text, pEmpty );

				// Insert marker.
				const range = ModelRange._createIn( pEmpty );
				writer.addMarker( 'comment1', { range, usingOperation: false, affectsData: false } );
			} );

			expect( model.hasContent( pEmpty ) ).to.be.true;
			expect( model.hasContent( pEmpty, { ignoreMarkers: true } ) ).to.be.true;
			expect( model.hasContent( pEmpty, { ignoreMarkers: true, ignoreWhitespaces: true } ) ).to.be.false;
		} );

		it( 'should return false for empty element with marker (usingOperation=false, affectsData=true)', () => {
			const pEmpty = root.getChild( 0 ).getChild( 0 );

			model.enqueueChange( 'transparent', writer => {
				// Insert marker.
				const range = ModelRange._createIn( pEmpty );
				writer.addMarker( 'comment1', { range, usingOperation: false, affectsData: true } );
			} );

			expect( model.hasContent( pEmpty ) ).to.be.false;
			expect( model.hasContent( pEmpty, { ignoreWhitespaces: true } ) ).to.be.false;
			expect( model.hasContent( pEmpty, { ignoreMarkers: true } ) ).to.be.false;
			expect( model.hasContent( pEmpty, { ignoreMarkers: true, ignoreWhitespaces: true } ) ).to.be.false;
		} );

		it( 'should return false for empty element with marker (usingOperation=true, affectsData=true)', () => {
			const pEmpty = root.getChild( 0 ).getChild( 0 );

			model.enqueueChange( 'transparent', writer => {
				// Insert marker.
				const range = ModelRange._createIn( pEmpty );
				writer.addMarker( 'comment1', { range, usingOperation: true, affectsData: true } );
			} );

			expect( model.hasContent( pEmpty ) ).to.be.false;
			expect( model.hasContent( pEmpty, { ignoreWhitespaces: true } ) ).to.be.false;
			expect( model.hasContent( pEmpty, { ignoreMarkers: true } ) ).to.be.false;
			expect( model.hasContent( pEmpty, { ignoreMarkers: true, ignoreWhitespaces: true } ) ).to.be.false;
		} );

		it( 'should return true (ignoreWhitespaces) for empty text with marker (usingOperation=false, affectsData=true)', () => {
			const pEmpty = root.getChild( 0 ).getChild( 0 );

			model.enqueueChange( 'transparent', writer => {
				// Insert empty text.
				const text = writer.createText( '    ', { bold: true } );
				writer.append( text, pEmpty );

				// Insert marker.
				const range = ModelRange._createIn( pEmpty );
				writer.addMarker( 'comment1', { range, usingOperation: false, affectsData: true } );
			} );

			expect( model.hasContent( pEmpty ) ).to.be.true;
			expect( model.hasContent( pEmpty, { ignoreWhitespaces: true } ) ).to.be.true;
			expect( model.hasContent( pEmpty, { ignoreMarkers: true } ) ).to.be.true;
			expect( model.hasContent( pEmpty, { ignoreMarkers: true, ignoreWhitespaces: true } ) ).to.be.false;
		} );
	} );

	describe( 'createPositionFromPath()', () => {
		it( 'should return instance of Position', () => {
			expect( model.createPositionFromPath( model.document.getRoot(), [ 0 ] ) ).to.be.instanceof( ModelPosition );
		} );
	} );

	describe( 'createPositionAt()', () => {
		it( 'should return instance of Position', () => {
			expect( model.createPositionAt( model.document.getRoot(), 0 ) ).to.be.instanceof( ModelPosition );
		} );
	} );

	describe( 'createPositionAfter()', () => {
		it( 'should return instance of Position', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			setData( model, '<paragraph>fo[]ar</paragraph>' );

			expect( model.createPositionAfter( model.document.getRoot().getChild( 0 ) ) ).to.be.instanceof( ModelPosition );
		} );
	} );

	describe( 'createPositionBefore()', () => {
		it( 'should return instance of Position', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			setData( model, '<paragraph>fo[]ar</paragraph>' );

			expect( model.createPositionBefore( model.document.getRoot().getChild( 0 ) ) ).to.be.instanceof( ModelPosition );
		} );
	} );

	describe( 'createRange()', () => {
		it( 'should return instance of Range', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			setData( model, '<paragraph>fo[]ar</paragraph>' );

			expect( model.createRange( model.createPositionAt( model.document.getRoot(), 0 ) ) ).to.be.instanceof( ModelRange );
		} );
	} );

	describe( 'createRangeIn()', () => {
		it( 'should return instance of Range', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			setData( model, '<paragraph>fo[]ar</paragraph>' );

			expect( model.createRangeIn( model.document.getRoot().getChild( 0 ) ) ).to.be.instanceof( ModelRange );
		} );
	} );

	describe( 'createRangeOn()', () => {
		it( 'should return instance of Range', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			setData( model, '<paragraph>fo[]ar</paragraph>' );

			expect( model.createRangeOn( model.document.getRoot().getChild( 0 ) ) ).to.be.instanceof( ModelRange );
		} );
	} );

	describe( 'createSelection()', () => {
		it( 'should return instance of Selection', () => {
			expect( model.createSelection() ).to.be.instanceof( ModelSelection );
		} );
	} );

	describe( 'createBatch()', () => {
		it( 'should return instance of Batch', () => {
			const batch = model.createBatch();
			expect( batch ).to.be.instanceof( Batch );
			expect( batch.type ).to.equal( 'default' );
		} );

		it( 'should allow to define type of Batch', () => {
			const batch = model.createBatch( 'transparent' );
			expect( batch ).to.be.instanceof( Batch );
			expect( batch.type ).to.equal( 'transparent' );
		} );
	} );

	describe( 'createOperationFromJson()', () => {
		it( 'should create operation from JSON', () => {
			const operation = model.createOperationFromJSON( {
				__className: 'NoOperation',
				baseVersion: 0
			} );

			expect( operation ).to.instanceof( NoOperation );
			expect( operation.baseVersion ).to.equal( 0 );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy document', () => {
			sinon.spy( model.document, 'destroy' );

			model.destroy();

			sinon.assert.calledOnce( model.document.destroy );
		} );

		it( 'should stop listening', () => {
			const emitter = Object.create( EmitterMixin );
			const spy = sinon.spy();

			model.listenTo( emitter, 'event', spy );

			model.destroy();

			emitter.fire( 'event' );

			sinon.assert.notCalled( spy );
		} );
	} );
} );
