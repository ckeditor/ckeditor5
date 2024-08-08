/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin.js';
import Model from '../../src/model/model.js';
import ModelText from '../../src/model/text.js';
import ModelElement from '../../src/model/element.js';
import ModelRange from '../../src/model/range.js';
import ModelPosition from '../../src/model/position.js';
import ModelSelection from '../../src/model/selection.js';
import ModelDocumentFragment from '../../src/model/documentfragment.js';
import Batch from '../../src/model/batch.js';
import NoOperation from '../../src/model/operation/nooperation.js';
import { getData, setData, stringify } from '../../src/dev-utils/model.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror.js';

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

		it( 'registers $container to the schema', () => {
			expect( schema.isRegistered( '$container' ) ).to.be.true;
			expect( schema.checkChild( [ '$root' ], '$container' ) ).to.be.true;
			expect( schema.checkChild( [ '$container' ], '$container' ) ).to.be.true;
			expect( schema.checkChild( [ '$container' ], '$block' ) ).to.be.true;
		} );

		it( 'registers $block to the schema', () => {
			expect( schema.isRegistered( '$block' ) ).to.be.true;
			expect( schema.isBlock( '$block' ) ).to.be.true;
			expect( schema.checkChild( [ '$root' ], '$block' ) ).to.be.true;
			expect( schema.checkChild( [ '$container' ], '$block' ) ).to.be.true;
		} );

		it( 'registers $blockObject to the schema', () => {
			expect( schema.isRegistered( '$blockObject' ) ).to.be.true;
			expect( schema.isBlock( '$blockObject' ) ).to.be.true;
			expect( schema.isObject( '$blockObject' ) ).to.be.true;
			expect( schema.checkChild( [ '$root' ], '$blockObject' ) ).to.be.true;
			expect( schema.checkChild( [ '$container' ], '$blockObject' ) ).to.be.true;
			expect( schema.checkChild( [ '$block' ], '$blockObject' ) ).to.be.false;
		} );

		it( 'registers $inlineObject to the schema', () => {
			expect( schema.isRegistered( '$inlineObject' ) ).to.be.true;
			expect( schema.isInline( '$inlineObject' ) ).to.be.true;
			expect( schema.isObject( '$inlineObject' ) ).to.be.true;
			expect( schema.checkChild( [ '$root' ], '$inlineObject' ) ).to.be.false;
			expect( schema.checkChild( [ '$container' ], '$inlineObject' ) ).to.be.false;
			expect( schema.checkChild( [ '$block' ], '$inlineObject' ) ).to.be.true;

			schema.extend( '$text', {
				allowAttributes: [ 'foo', 'bar' ]
			} );

			expect( schema.checkAttribute( '$inlineObject', 'foo' ) ).to.be.true;
			expect( schema.checkAttribute( '$inlineObject', 'bar' ) ).to.be.true;
		} );

		it( 'registers $text to the schema', () => {
			expect( schema.isRegistered( '$text' ) ).to.be.true;
			expect( schema.isContent( '$text' ) ).to.be.true;
			expect( schema.checkChild( [ '$block' ], '$text' ) ).to.be.true;
			expect( schema.checkChild( [ '$container' ], '$text' ) ).to.be.false;
		} );

		it( 'registers $clipboardHolder to the schema', () => {
			expect( schema.isRegistered( '$clipboardHolder' ) ).to.be.true;
			expect( schema.isLimit( '$clipboardHolder' ) ).to.be.true;
			expect( schema.checkChild( [ '$clipboardHolder' ], '$text' ) ).to.be.true;
			expect( schema.checkChild( [ '$clipboardHolder' ], '$block' ) ).to.be.true;
		} );

		it( 'registers $documentFragment to the schema', () => {
			expect( schema.isRegistered( '$documentFragment' ) ).to.be.true;
			expect( schema.isLimit( '$documentFragment' ) ).to.be.true;
			expect( schema.checkChild( [ '$documentFragment' ], '$text' ) ).to.be.true;
			expect( schema.checkChild( [ '$documentFragment' ], '$block' ) ).to.be.true;
		} );

		it( 'registers $marker to the schema and allows it in all registered elements', () => {
			schema.register( '$otherRoot' );

			expect( schema.isRegistered( '$marker' ) ).to.be.true;
			expect( schema.checkChild( [ '$root' ], '$marker' ) ).to.be.true;
			expect( schema.checkChild( [ '$block' ], '$marker' ) ).to.be.true;
			expect( schema.checkChild( [ '$otherRoot' ], '$marker' ) ).to.be.true;
			expect( schema.checkChild( [ 'foo' ], '$marker' ) ).to.be.false;
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

		it( 'should let you create batch of given type', () => {
			model.enqueueChange( { isUndoable: false, isLocal: false }, writer => {
				expect( writer.batch.isUndoable ).to.be.false;
				expect( writer.batch.isLocal ).to.be.false;
			} );
		} );

		it( 'should create a batch with the default type if empty value is passed', () => {
			model.enqueueChange( null, writer => {
				expect( writer.batch.isUndoable ).to.be.true;
				expect( writer.batch.isLocal ).to.be.true;
				expect( writer.batch.isTyping ).to.be.false;
				expect( writer.batch.isUndo ).to.be.false;
			} );

			model.enqueueChange( undefined, writer => {
				expect( writer.batch.isUndoable ).to.be.true;
				expect( writer.batch.isLocal ).to.be.true;
				expect( writer.batch.isTyping ).to.be.false;
				expect( writer.batch.isUndo ).to.be.false;
			} );
		} );

		it( 'should fire `_beforeChanges` and `_afterChanges` events', () => {
			model.on( '_beforeChanges', () => {
				changes += 'A';
			} );

			model.on( '_afterChanges', () => {
				changes += 'D';
			} );

			model.change( () => {
				changes += 'B';

				model.enqueueChange( () => {
					changes += 'C';
				} );
			} );

			expect( changes ).to.equal( 'ABCD' );
		} );

		it.skip( 'should rethrow native errors as they are in the dubug=true mode in the model.change() block', () => {
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
					// eslint-disable-next-line ckeditor5-rules/ckeditor-error-message
					throw new CKEditorError( 'foo', null, { foo: 1 } );
				} );
			}, /foo/, null, { foo: 1 } );
		} );

		it.skip( 'should rethrow native errors as they are in the dubug=true mode in the enqueueChange() block', () => {
			const error = new TypeError( 'foo' );

			expect( () => {
				model.enqueueChange( () => {
					throw error;
				} );
			} ).to.throw( TypeError, /foo/ );
		} );

		it( 'should throw the original CKEditorError error if it was thrown inside the `enqueueChange()` block', () => {
			// eslint-disable-next-line ckeditor5-rules/ckeditor-error-message
			const err = new CKEditorError( 'foo', null, { foo: 1 } );

			expectToThrowCKEditorError( () => {
				model.enqueueChange( () => {
					throw err;
				} );
			}, /foo/, null, { foo: 1 } );
		} );

		it( 'should not keep failed change pending', () => {
			expect( () => {
				model.change( () => {
					changes += 'A';

					throw new Error();
				} );
			} ).to.throw();

			expect( () => {
				model.enqueueChange( () => {
					changes += 'B';
				} );
			} ).to.not.throw();

			expect( changes ).to.equal( 'AB' );
		} );

		it( 'should fire `_afterChanges` after failed change', () => {
			model.on( '_afterChanges', () => {
				changes += 'B';
			} );

			expect( () => {
				model.change( () => {
					changes += 'A';

					throw new Error();
				} );
			} ).to.throw();

			expect( changes ).to.equal( 'AB' );
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

		it( 'should be decorated and pass all parameters in the event data', () => {
			schema.extend( '$text', { allowIn: '$root' } ); // To surpress warnings.

			const spy = sinon.spy();
			const obj1 = { foo: 'bar' };
			const obj2 = { baz: 7 };
			const obj3 = { abc: true };

			model.on( 'insertContent', spy );

			model.insertContent( new ModelText( 'a' ), model.document.selection, obj1, obj2, obj3 );

			expect( spy.calledOnce ).to.be.true;
			expect( spy.firstCall.args[ 1 ][ 2 ] ).to.equal( obj1 );
			expect( spy.firstCall.args[ 1 ][ 3 ] ).to.equal( obj2 );
			expect( spy.firstCall.args[ 1 ][ 4 ] ).to.equal( obj3 );
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
				expect( writer.batch.operations.filter( operation => operation.isDocumentOperation ) ).to.length( 1 );
			} );
		} );

		describe( 'selectable normalization', () => {
			let doc, root;

			beforeEach( () => {
				doc = model.document;
				root = doc.getRoot();
			} );

			it( 'should be able to insert content at custom selection', () => {
				model.schema.extend( '$text', { allowIn: '$root' } );
				setData( model, 'a[]bc' );

				const selection = model.createSelection( model.createPositionFromPath( doc.getRoot(), [ 2 ] ) );

				model.change( writer => {
					const affectedRange = model.insertContent( writer.createText( 'x' ), selection );

					expect( getData( model ) ).to.equal( 'a[]bxc' );
					expect( stringify( root, affectedRange ) ).to.equal( 'ab[x]c' );
				} );
			} );

			it( 'should modify passed selection instance', () => {
				model.schema.extend( '$text', { allowIn: '$root' } );
				setData( model, 'a[]bc' );

				const selection = model.createSelection( model.createPositionFromPath( doc.getRoot(), [ 2 ] ) );
				const selectionCopy = model.createSelection( model.createPositionFromPath( doc.getRoot(), [ 2 ] ) );

				expect( selection.isEqual( selectionCopy ) ).to.be.true;

				model.change( writer => {
					model.insertContent( writer.createText( 'x' ), selection );
				} );

				expect( selection.isEqual( selectionCopy ) ).to.be.false;

				const insertionSelection = model.createSelection( model.createPositionFromPath( doc.getRoot(), [ 3 ] ) );
				expect( selection.isEqual( insertionSelection ) ).to.be.true;
			} );

			it( 'should be able to insert content at custom position', () => {
				model.schema.extend( '$text', { allowIn: '$root' } );
				setData( model, 'a[]bc' );

				const position = model.createPositionFromPath( doc.getRoot(), [ 2 ] );

				model.change( writer => {
					const affectedRange = model.insertContent( writer.createText( 'x' ), position );

					expect( getData( model ) ).to.equal( 'a[]bxc' );
					expect( stringify( root, affectedRange ) ).to.equal( 'ab[x]c' );
				} );
			} );

			it( 'should be able to insert content at custom range', () => {
				model.schema.extend( '$text', { allowIn: '$root' } );
				setData( model, 'a[]bc' );

				const range = model.createRange(
					model.createPositionFromPath( doc.getRoot(), [ 2 ] ),
					model.createPositionFromPath( doc.getRoot(), [ 3 ] )
				);

				model.change( writer => {
					const affectedRange = model.insertContent( writer.createText( 'x' ), range );

					expect( getData( model ) ).to.equal( 'a[]bx' );
					expect( stringify( root, affectedRange ) ).to.equal( 'ab[x]' );
				} );
			} );

			it( 'should be able to insert content at model selection if document selection is passed', () => {
				model.schema.extend( '$text', { allowIn: '$root' } );
				setData( model, 'a[]bc' );

				model.change( writer => {
					const affectedRange = model.insertContent( writer.createText( 'x' ), model.document.selection );

					expect( getData( model ) ).to.equal( 'ax[]bc' );
					expect( stringify( root, affectedRange ) ).to.equal( 'a[x]bc' );
				} );
			} );

			it( 'should be able to insert content at model selection if none passed', () => {
				model.schema.extend( '$text', { allowIn: '$root' } );
				setData( model, 'a[]bc' );

				model.change( writer => {
					const affectedRange = model.insertContent( writer.createText( 'x' ) );

					expect( getData( model ) ).to.equal( 'ax[]bc' );
					expect( stringify( root, affectedRange ) ).to.equal( 'a[x]bc' );
				} );
			} );

			it( 'should be able to insert content at model element (numeric offset)', () => {
				model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );

				setData( model, '<paragraph>foo[]</paragraph><paragraph>bar</paragraph>' );

				const element = doc.getRoot().getNodeByPath( [ 1 ] );

				model.change( writer => {
					const text = writer.createText( 'x' );

					const affectedRange = model.insertContent( text, element, 2 );

					expect( getData( model ) ).to.equal( '<paragraph>foo[]</paragraph><paragraph>baxr</paragraph>' );
					expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>foo</paragraph><paragraph>ba[x]r</paragraph>' );
				} );
			} );

			it( 'should be able to insert content at model element (offset="in")', () => {
				model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );

				setData( model, '<paragraph>foo[]</paragraph><paragraph>bar</paragraph>' );

				const element = doc.getRoot().getNodeByPath( [ 1 ] );

				model.change( writer => {
					const text = writer.createText( 'x' );

					const affectedRange = model.insertContent( text, element, 'in' );

					expect( getData( model ) ).to.equal( '<paragraph>foo[]</paragraph><paragraph>x</paragraph>' );
					expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>foo</paragraph><paragraph>[x]</paragraph>' );
				} );
			} );

			it( 'should be able to insert content at model element (offset="on")', () => {
				model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
				model.schema.register( 'foo', { inheritAllFrom: '$block' } );

				setData( model, '<paragraph>foo[]</paragraph><paragraph>bar</paragraph>' );

				const element = doc.getRoot().getNodeByPath( [ 1 ] );

				model.change( writer => {
					const insertElement = writer.createElement( 'foo' );

					const affectedRange = model.insertContent( insertElement, element, 'on' );

					expect( getData( model ) ).to.equal( '<paragraph>foo[]</paragraph><foo></foo>' );
					expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>foo</paragraph>[<foo></foo>]' );
				} );
			} );

			it( 'should be able to insert content at model element (offset="end")', () => {
				model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );

				setData( model, '<paragraph>foo[]</paragraph><paragraph>bar</paragraph>' );

				const element = doc.getRoot().getNodeByPath( [ 1 ] );

				model.change( writer => {
					const text = writer.createText( 'x' );

					const affectedRange = model.insertContent( text, element, 'end' );

					expect( getData( model ) ).to.equal( '<paragraph>foo[]</paragraph><paragraph>barx</paragraph>' );
					expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>foo</paragraph><paragraph>bar[x]</paragraph>' );
				} );
			} );

			it( 'should be able to insert content at given root', () => {
				model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );

				setData( model, '<paragraph>foo[]</paragraph><paragraph>bar</paragraph>' );

				model.change( writer => {
					const paragraph = writer.createElement( 'paragraph' );
					writer.insertText( 'abc', paragraph, 0 );

					const affectedRange = model.insertContent( paragraph, doc.getRoot() );

					expect( getData( model ) ).to.equal( '<paragraph>[]abc</paragraph>' );
					expect( stringify( root, affectedRange ) ).to.equal( '[<paragraph>abc</paragraph>]' );
				} );
			} );
		} );
	} );

	describe( 'insertObject()', () => {
		beforeEach( () => {
			schema.register( 'blockWidget', {
				isObject: true,
				inheritAllFrom: '$block',
				allowIn: '$root'
			} );
			schema.register( 'inlineWidget', {
				isObject: true,
				allowIn: [ '$block' ]
			} );
			schema.register( 'paragraph', {
				inheritAllFrom: '$block'
			} );
		} );

		it( 'should be decorated', () => {
			const spy = sinon.spy();
			const element = new ModelElement( 'blockWidget' );
			const options = {
				findOptimalPosition: 'after',
				setSelection: 'on'
			};

			model.on( 'insertObject', spy );

			model.insertObject( element, model.document.selection, null, options );

			const args = spy.args[ 0 ][ 1 ];

			expect( spy.calledOnce ).to.be.true;
			expect( args[ 0 ] ).to.equal( element );
			expect( args[ 1 ] ).to.equal( model.document.selection );
			expect( args[ 2 ] ).to.equal( options );
		} );

		it( 'should be decorated and pass all parameters in the event data', () => {
			const spy = sinon.spy();
			const element = new ModelElement( 'blockWidget' );
			const options = {
				findOptimalPosition: 'after',
				setSelection: 'on'
			};
			const obj1 = { foo: 'bar' };
			const obj2 = { baz: 7 };
			const obj3 = { abc: true };

			model.on( 'insertObject', spy );

			model.insertObject( element, model.document.selection, null, options, obj1, obj2, obj3 );

			const args = spy.firstCall.args[ 1 ];

			expect( spy.calledOnce ).to.be.true;
			expect( args[ 0 ] ).to.equal( element );
			expect( args[ 1 ] ).to.equal( model.document.selection );
			expect( args[ 2 ] ).to.equal( options );
			expect( args[ 3 ] ).to.equal( options );
			expect( args[ 4 ] ).to.equal( obj1 );
			expect( args[ 5 ] ).to.equal( obj2 );
			expect( args[ 6 ] ).to.equal( obj3 );
		} );

		it( 'should insert inline object at the document selection position', () => {
			setData( model, '<paragraph>fo[]ar</paragraph>' );

			model.insertObject( new ModelElement( 'inlineWidget' ) );

			expect( getData( model ) ).to.equal( '<paragraph>fo<inlineWidget></inlineWidget>[]ar</paragraph>' );
		} );

		it( 'should insert block object at the document selection position', () => {
			setData( model, '<paragraph>fo[]ar</paragraph>' );

			model.insertObject( new ModelElement( 'blockWidget' ) );

			expect( getData( model ) ).to.equal(
				'<paragraph>fo</paragraph>' +
				'[<blockWidget></blockWidget>]' +
				'<paragraph>ar</paragraph>'
			);
		} );

		it( 'should use parent batch', () => {
			setData( model, '<paragraph>[]</paragraph>' );

			model.change( writer => {
				model.insertObject( new ModelElement( 'inlineWidget' ) );
				expect( writer.batch.operations.filter( operation => operation.isDocumentOperation ) ).to.length( 1 );
			} );
		} );

		describe( 'selectable normalization', () => {
			let doc, root;

			beforeEach( () => {
				doc = model.document;
				root = doc.getRoot();
			} );

			it( 'should be able to insert object at custom selection', () => {
				setData( model, '<paragraph>a[]bc</paragraph>' );

				const selection = model.createSelection( model.createPositionFromPath( doc.getRoot(), [ 0, 2 ] ) );

				model.change( writer => {
					const affectedRange = model.insertObject( writer.createElement( 'inlineWidget' ), selection );

					expect( getData( model ) ).to.equal( '<paragraph>a[]b<inlineWidget></inlineWidget>c</paragraph>' );
					expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>ab[<inlineWidget></inlineWidget>]c</paragraph>' );
				} );
			} );

			it( 'should modify passed selection instance', () => {
				setData( model, '<paragraph>a[]bc</paragraph>' );

				const selection = model.createSelection( model.createPositionFromPath( doc.getRoot(), [ 0, 2 ] ) );
				const selectionCopy = model.createSelection( model.createPositionFromPath( doc.getRoot(), [ 0, 2 ] ) );

				expect( selection.isEqual( selectionCopy ) ).to.be.true;

				model.change( writer => {
					model.insertObject( writer.createElement( 'inlineWidget' ), selection );
				} );

				expect( selection.isEqual( selectionCopy ) ).to.be.false;

				const insertionSelection = model.createSelection( model.createPositionFromPath( doc.getRoot(), [ 0, 3 ] ) );
				expect( selection.isEqual( insertionSelection ) ).to.be.true;
			} );

			it( 'should be able to insert content at custom position', () => {
				setData( model, '<paragraph>a[]bc</paragraph>' );

				const position = model.createPositionFromPath( doc.getRoot(), [ 0, 2 ] );

				model.change( writer => {
					const affectedRange = model.insertObject( writer.createElement( 'inlineWidget' ), position );

					expect( getData( model ) ).to.equal( '<paragraph>a[]b<inlineWidget></inlineWidget>c</paragraph>' );
					expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>ab[<inlineWidget></inlineWidget>]c</paragraph>' );
				} );
			} );

			it( 'should be able to insert content at custom range', () => {
				setData( model, '<paragraph>a[]bc</paragraph>' );

				const range = model.createRange(
					model.createPositionFromPath( doc.getRoot(), [ 0, 2 ] ),
					model.createPositionFromPath( doc.getRoot(), [ 0, 3 ] )
				);

				model.change( writer => {
					const affectedRange = model.insertObject( writer.createElement( 'inlineWidget' ), range );

					expect( getData( model ) ).to.equal( '<paragraph>a[]b<inlineWidget></inlineWidget></paragraph>' );
					expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>ab[<inlineWidget></inlineWidget>]</paragraph>' );
				} );
			} );

			it( 'should be able to insert content at model selection if document selection is passed', () => {
				setData( model, '<paragraph>a[]bc</paragraph>' );

				model.change( writer => {
					const affectedRange = model.insertObject( writer.createElement( 'inlineWidget' ), model.document.selection );

					expect( getData( model ) ).to.equal( '<paragraph>a<inlineWidget></inlineWidget>[]bc</paragraph>' );
					expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>a[<inlineWidget></inlineWidget>]bc</paragraph>' );
				} );
			} );

			it( 'should be able to insert content at model selection if none passed', () => {
				setData( model, '<paragraph>a[]bc</paragraph>' );

				model.change( writer => {
					const affectedRange = model.insertObject( writer.createElement( 'inlineWidget' ) );

					expect( getData( model ) ).to.equal( '<paragraph>a<inlineWidget></inlineWidget>[]bc</paragraph>' );
					expect( stringify( root, affectedRange ) ).to.equal(
						'<paragraph>a[<inlineWidget></inlineWidget>]bc</paragraph>'
					);
				} );
			} );

			it( 'should be able to insert content at model element (numeric offset)', () => {
				setData( model, '<paragraph>foo[]</paragraph><paragraph>bar</paragraph>' );

				const element = doc.getRoot().getNodeByPath( [ 1 ] );

				model.change( writer => {
					const text = writer.createElement( 'inlineWidget' );

					const affectedRange = model.insertObject( text, element, 2 );

					expect( getData( model ) ).to.equal(
						'<paragraph>foo[]</paragraph><paragraph>ba<inlineWidget></inlineWidget>r</paragraph>'
					);
					expect( stringify( root, affectedRange ) ).to.equal(
						'<paragraph>foo</paragraph><paragraph>ba[<inlineWidget></inlineWidget>]r</paragraph>'
					);
				} );
			} );

			it( 'should be able to insert content at model element (offset="in")', () => {
				setData( model, '<paragraph>foo[]</paragraph><paragraph>bar</paragraph>' );

				const element = doc.getRoot().getNodeByPath( [ 1 ] );

				model.change( writer => {
					const text = writer.createElement( 'inlineWidget' );

					const affectedRange = model.insertObject( text, element, 'in' );

					expect( getData( model ) ).to.equal(
						'<paragraph>foo[]</paragraph><paragraph><inlineWidget></inlineWidget></paragraph>'
					);
					expect( stringify( root, affectedRange ) ).to.equal(
						'<paragraph>foo</paragraph><paragraph>[<inlineWidget></inlineWidget>]</paragraph>'
					);
				} );
			} );

			it( 'should be able to insert content at model element (offset="on")', () => {
				setData( model, '<paragraph>foo[]</paragraph><paragraph>bar</paragraph>' );

				const element = doc.getRoot().getNodeByPath( [ 1 ] );

				model.change( writer => {
					const insertElement = writer.createElement( 'blockWidget' );

					const affectedRange = model.insertObject( insertElement, element, 'on' );

					expect( getData( model ) ).to.equal( '<paragraph>foo[]</paragraph><blockWidget></blockWidget>' );
					expect( stringify( root, affectedRange ) ).to.equal( '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]' );
				} );
			} );

			it( 'should be able to insert content at model element (offset="end")', () => {
				setData( model, '<paragraph>foo[]</paragraph><paragraph>bar</paragraph>' );

				const element = doc.getRoot().getNodeByPath( [ 1 ] );

				model.change( writer => {
					const text = writer.createElement( 'inlineWidget' );

					const affectedRange = model.insertObject( text, element, 'end' );

					expect( getData( model ) ).to.equal(
						'<paragraph>foo[]</paragraph><paragraph>bar<inlineWidget></inlineWidget></paragraph>'
					);
					expect( stringify( root, affectedRange ) ).to.equal(
						'<paragraph>foo</paragraph><paragraph>bar[<inlineWidget></inlineWidget>]</paragraph>'
					);
				} );
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
			schema.register( 'imageBlock', {
				isObject: true
			} );
			schema.register( 'content', {
				inheritAllFrom: '$block',
				isContent: true
			} );
			schema.extend( 'imageBlock', { allowIn: 'div' } );
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
					'<imageBlock></imageBlock>' +
				'</div>' +
				'<listItem></listItem>' +
				'<listItem></listItem>' +
				'<listItem></listItem>' +
				'<content>foo</content>' +
				'<div>' +
					'<content></content>' +
				'</div>'
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

			model.enqueueChange( { isUndoable: false }, writer => {
				// Model `setData()` method trims whitespaces so use writer here to insert whitespace only text.
				writer.insertText( '    ', pEmpty, 'end' );
			} );

			expect( model.hasContent( pEmpty ) ).to.be.true;
		} );

		it( 'should false true if given element has text node containing spaces only (ignoreWhitespaces)', () => {
			const pEmpty = root.getChild( 0 ).getChild( 0 );

			model.enqueueChange( { isUndoable: false }, writer => {
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

			model.enqueueChange( { isUndoable: false }, writer => {
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

			model.enqueueChange( { isUndoable: false }, writer => {
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

			model.enqueueChange( { isUndoable: false }, writer => {
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

			model.enqueueChange( { isUndoable: false }, writer => {
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

			model.enqueueChange( { isUndoable: false }, writer => {
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

			model.enqueueChange( { isUndoable: false }, writer => {
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

			model.enqueueChange( { isUndoable: false }, writer => {
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

		it( 'should return true for an item registered as a content (isContent=true, isObject=false) in the schema', () => {
			const contentElement = root.getChild( 6 );

			expect( model.hasContent( contentElement ) ).to.be.true;
		} );

		it( 'should return true if a range contains an item registered as a content (isContent=true, isObject=false) in the schema', () => {
			// [<div><content></content></div>]
			const range = new ModelRange( ModelPosition._createAt( root, 6 ), ModelPosition._createAt( root, 7 ) );

			expect( model.hasContent( range ) ).to.be.true;
		} );
	} );

	describe( 'canEditAt()', () => {
		it( 'should return true if model document is not in read-only mode', () => {
			model.document.isReadOnly = false;

			expect( model.canEditAt( model.document.selection ) ).to.be.true;
		} );

		it( 'should return fasle if model document is not in read-only mode', () => {
			model.document.isReadOnly = true;

			expect( model.canEditAt( model.document.selection ) ).to.be.false;
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
		} );

		it( 'should allow to define type of Batch', () => {
			const batch = model.createBatch( { isUndo: true, isUndoable: true } );
			expect( batch ).to.be.instanceof( Batch );
			expect( batch.isUndo ).to.be.true;
			expect( batch.isUndoable ).to.be.true;
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
