/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmitterMixin, CKEditorError, Config } from '@ckeditor/ckeditor5-utils';
import { Model } from '../../src/model/model.js';
import { ModelText } from '../../src/model/text.js';
import { ModelElement } from '../../src/model/element.js';
import { ModelRange } from '../../src/model/range.js';
import { ModelPosition } from '../../src/model/position.js';
import { ModelSelection } from '../../src/model/selection.js';
import { ModelDocumentFragment } from '../../src/model/documentfragment.js';
import { Batch } from '../../src/model/batch.js';
import { NoOperation } from '../../src/model/operation/nooperation.js';
import { _getModelData, _setModelData, _stringifyModel } from '../../src/dev-utils/model.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

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
			expect( schema.isRegistered( '$root' ) ).toBe( true );
			expect( schema.isLimit( '$root' ) ).toBe( true );
		} );

		it( 'registers $inlineRoot to the schema', () => {
			expect( schema.isRegistered( '$inlineRoot' ) ).toBe( true );
			expect( schema.isLimit( '$inlineRoot' ) ).toBe( true );
			expect( schema.checkChild( [ '$inlineRoot' ], '$text' ) ).toBe( true );
			expect( schema.checkChild( [ '$inlineRoot' ], '$inlineObject' ) ).toBe( true );
			expect( schema.checkChild( [ '$inlineRoot' ], '$block' ) ).toBe( false );
			expect( schema.checkChild( [ '$inlineRoot' ], '$container' ) ).toBe( false );
			expect( schema.checkChild( [ '$inlineRoot' ], '$blockObject' ) ).toBe( false );

			schema.extend( '$root', { allowAttributes: 'foo' } );

			expect( schema.checkAttribute( [ '$inlineRoot' ], 'foo' ) ).toBe( true );
		} );

		it( 'registers $container to the schema', () => {
			expect( schema.isRegistered( '$container' ) ).toBe( true );
			expect( schema.checkChild( [ '$root' ], '$container' ) ).toBe( true );
			expect( schema.checkChild( [ '$container' ], '$container' ) ).toBe( true );
			expect( schema.checkChild( [ '$container' ], '$block' ) ).toBe( true );
		} );

		it( 'registers $block to the schema', () => {
			expect( schema.isRegistered( '$block' ) ).toBe( true );
			expect( schema.isBlock( '$block' ) ).toBe( true );
			expect( schema.checkChild( [ '$root' ], '$block' ) ).toBe( true );
			expect( schema.checkChild( [ '$container' ], '$block' ) ).toBe( true );
		} );

		it( 'registers $blockObject to the schema', () => {
			expect( schema.isRegistered( '$blockObject' ) ).toBe( true );
			expect( schema.isBlock( '$blockObject' ) ).toBe( true );
			expect( schema.isObject( '$blockObject' ) ).toBe( true );
			expect( schema.checkChild( [ '$root' ], '$blockObject' ) ).toBe( true );
			expect( schema.checkChild( [ '$container' ], '$blockObject' ) ).toBe( true );
			expect( schema.checkChild( [ '$block' ], '$blockObject' ) ).toBe( false );
		} );

		it( 'registers $inlineObject to the schema', () => {
			expect( schema.isRegistered( '$inlineObject' ) ).toBe( true );
			expect( schema.isInline( '$inlineObject' ) ).toBe( true );
			expect( schema.isObject( '$inlineObject' ) ).toBe( true );
			expect( schema.checkChild( [ '$root' ], '$inlineObject' ) ).toBe( false );
			expect( schema.checkChild( [ '$container' ], '$inlineObject' ) ).toBe( false );
			expect( schema.checkChild( [ '$block' ], '$inlineObject' ) ).toBe( true );

			schema.extend( '$text', {
				allowAttributes: [ 'foo', 'bar' ]
			} );

			expect( schema.checkAttribute( '$inlineObject', 'foo' ) ).toBe( true );
			expect( schema.checkAttribute( '$inlineObject', 'bar' ) ).toBe( true );
		} );

		it( 'registers $text to the schema', () => {
			expect( schema.isRegistered( '$text' ) ).toBe( true );
			expect( schema.isContent( '$text' ) ).toBe( true );
			expect( schema.checkChild( [ '$block' ], '$text' ) ).toBe( true );
			expect( schema.checkChild( [ '$container' ], '$text' ) ).toBe( false );
		} );

		it( 'registers $clipboardHolder to the schema', () => {
			expect( schema.isRegistered( '$clipboardHolder' ) ).toBe( true );
			expect( schema.isLimit( '$clipboardHolder' ) ).toBe( true );
			expect( schema.checkChild( [ '$clipboardHolder' ], '$text' ) ).toBe( true );
			expect( schema.checkChild( [ '$clipboardHolder' ], '$block' ) ).toBe( true );
			expect( schema.checkChild( [ '$clipboardHolder' ], '$inlineObject' ) ).toBe( true );
		} );

		it( 'registers $documentFragment to the schema', () => {
			expect( schema.isRegistered( '$documentFragment' ) ).toBe( true );
			expect( schema.isLimit( '$documentFragment' ) ).toBe( true );
			expect( schema.checkChild( [ '$documentFragment' ], '$text' ) ).toBe( true );
			expect( schema.checkChild( [ '$documentFragment' ], '$block' ) ).toBe( true );
			expect( schema.checkChild( [ '$documentFragment' ], '$inlineObject' ) ).toBe( true );
		} );

		it( 'registers $marker to the schema and allows it in all registered elements', () => {
			schema.register( '$otherRoot' );

			expect( schema.isRegistered( '$marker' ) ).toBe( true );
			expect( schema.checkChild( [ '$root' ], '$marker' ) ).toBe( true );
			expect( schema.checkChild( [ '$block' ], '$marker' ) ).toBe( true );
			expect( schema.checkChild( [ '$otherRoot' ], '$marker' ) ).toBe( true );
			expect( schema.checkChild( [ 'foo' ], '$marker' ) ).toBe( false );
		} );

		it( 'sets the _config property', () => {
			const config = new Config();
			const model = new Model( config );

			expect( model._config ).toBe( config );

			model.destroy();
		} );
	} );

	describe( 'change() & enqueueChange()', () => {
		it( 'should execute changes immediately', () => {
			model.change( () => {
				changes += 'A';
			} );

			expect( changes ).toBe( 'A' );
		} );

		it( 'should pass returned value', () => {
			const ret = model.change( () => {
				changes += 'A';

				return 'B';
			} );

			changes += ret;

			expect( changes ).toBe( 'AB' );
		} );

		it( 'should not mixed the order when nested change is called', () => {
			const ret = model.change( () => {
				changes += 'A';

				nested();

				return 'D';
			} );

			changes += ret;

			expect( changes ).toBe( 'ABCD' );

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

			expect( changes ).toBe( 'ABC' );

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

			expect( changes ).toBe( 'AB' );

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

			expect( changes ).toBe( 'ABCD' );

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

			expect( changes ).toBe( 'ABC' );

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

			expect( changes ).toBe( 'ABCD' );

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

			expect( changes ).toBe( 'ABC' );
		} );

		it( 'should be possible to nest enqueueChange in changes event', () => {
			model.change( () => {
				changes += 'A';

				model.enqueueChange( () => {
					changes += 'C';
				} );

				changes += 'B';
			} );

			expect( changes ).toBe( 'ABC' );
		} );

		it( 'should be possible to nest changes in enqueueChange event', () => {
			model.enqueueChange( () => {
				changes += 'A';

				model.change( () => {
					changes += 'B';
				} );

				changes += 'C';
			} );

			expect( changes ).toBe( 'ABC' );
		} );

		it( 'should be possible to nest changes in changes event', () => {
			model.change( () => {
				changes += 'A';

				model.change( () => {
					changes += 'B';
				} );

				changes += 'C';
			} );

			expect( changes ).toBe( 'ABC' );
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

			expect( changes ).toBe( 'ABCDEF' );
		} );

		it( 'should use the same writer in all change blocks (change & change)', () => {
			model.change( outerWriter => {
				model.change( innerWriter => {
					expect( innerWriter ).toBe( outerWriter );
				} );
			} );
		} );

		it( 'should create new writer in enqueue block', () => {
			model.change( outerWriter => {
				model.enqueueChange( innerWriter => {
					expect( innerWriter ).not.toBe( outerWriter );
					expect( innerWriter.batch ).not.toBe( outerWriter.batch );
				} );
			} );
		} );

		it( 'should let you pass batch', () => {
			let outerBatch;

			model.change( outerWriter => {
				outerBatch = outerWriter.batch;

				model.enqueueChange( outerBatch, innerWriter => {
					expect( innerWriter.batch ).toBe( outerBatch );
				} );
			} );
		} );

		it( 'should let you create batch of given type', () => {
			model.enqueueChange( { isUndoable: false, isLocal: false }, writer => {
				expect( writer.batch.isUndoable ).toBe( false );
				expect( writer.batch.isLocal ).toBe( false );
			} );
		} );

		it( 'should create a batch with the default type if empty value is passed', () => {
			model.enqueueChange( null, writer => {
				expect( writer.batch.isUndoable ).toBe( true );
				expect( writer.batch.isLocal ).toBe( true );
				expect( writer.batch.isTyping ).toBe( false );
				expect( writer.batch.isUndo ).toBe( false );
			} );

			model.enqueueChange( undefined, writer => {
				expect( writer.batch.isUndoable ).toBe( true );
				expect( writer.batch.isLocal ).toBe( true );
				expect( writer.batch.isTyping ).toBe( false );
				expect( writer.batch.isUndo ).toBe( false );
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

			expect( changes ).toBe( 'ABCD' );
		} );

		it.skip( 'should rethrow native errors as they are in the dubug=true mode in the model.change() block', () => {
			const error = new TypeError( 'foo' );

			expect( () => {
				model.change( () => {
					throw error;
				} );
			} ).toThrow( TypeError, /foo/ );
		} );

		it( 'should throw the original CKEditorError error if it was thrown inside the `change()` block', () => {
			expectToThrowCKEditorError( () => {
				model.change( () => {
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
			} ).toThrow( TypeError, /foo/ );
		} );

		it( 'should throw the original CKEditorError error if it was thrown inside the `enqueueChange()` block', () => {
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
			} ).toThrow();

			expect( () => {
				model.enqueueChange( () => {
					changes += 'B';
				} );
			} ).not.toThrow();

			expect( changes ).toBe( 'AB' );
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
			} ).toThrow();

			expect( changes ).toBe( 'AB' );
		} );

		it( 'should rethrow unexpected errors thrown in change() callback', () => {
			expect( () => {
				model.change( () => {
					throw new Error( 'Test error' );
				} );
			} ).toThrow( 'Test error' );
		} );

		it( 'should rethrow unexpected errors thrown in enqueueChange() callback', () => {
			expect( () => {
				model.enqueueChange( () => {
					throw new Error( 'Test error' );
				} );
			} ).toThrow( 'Test error' );
		} );
	} );

	describe( 'applyOperation()', () => {
		it( 'should execute provided operation', () => {
			const operation = {
				_execute: vi.fn(),
				_validate: () => true
			};

			model.applyOperation( operation );

			expect( operation._execute ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'insertContent()', () => {
		it( 'should be decorated', () => {
			schema.extend( '$text', { allowIn: '$root' } ); // To surpress warnings.

			const spy = vi.fn();

			model.on( 'insertContent', spy );

			model.insertContent( new ModelText( 'a' ) );

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should be decorated and pass all parameters in the event data', () => {
			schema.extend( '$text', { allowIn: '$root' } ); // To surpress warnings.

			const spy = vi.fn();
			const obj1 = { foo: 'bar' };
			const obj2 = { baz: 7 };
			const obj3 = { abc: true };

			model.on( 'insertContent', spy );

			model.insertContent( new ModelText( 'a' ), model.document.selection, obj1, obj2, obj3 );

			expect( spy ).toHaveBeenCalledTimes( 1 );
			expect( spy.mock.calls[ 0 ][ 1 ][ 2 ] ).toBe( obj1 );
			expect( spy.mock.calls[ 0 ][ 1 ][ 3 ] ).toBe( obj2 );
			expect( spy.mock.calls[ 0 ][ 1 ][ 4 ] ).toBe( obj3 );
		} );

		it( 'should insert content (item)', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			_setModelData( model, '<paragraph>fo[]ar</paragraph>' );

			model.insertContent( new ModelText( 'ob' ) );

			expect( _getModelData( model ) ).toBe( '<paragraph>foob[]ar</paragraph>' );
		} );

		it( 'should insert content (document fragment)', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			_setModelData( model, '<paragraph>fo[]ar</paragraph>' );

			model.insertContent( new ModelDocumentFragment( [ new ModelText( 'ob' ) ] ) );

			expect( _getModelData( model ) ).toBe( '<paragraph>foob[]ar</paragraph>' );
		} );

		it( 'should use current model selection if no selectable passed', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			_setModelData( model, '<paragraph>fo[]ar</paragraph>' );

			model.insertContent( new ModelText( 'ob' ) );

			expect( _getModelData( model ) ).toBe( '<paragraph>foob[]ar</paragraph>' );
		} );

		it( 'should use parent batch', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			_setModelData( model, '<paragraph>[]</paragraph>' );

			model.change( writer => {
				model.insertContent( new ModelText( 'abc' ) );
				expect( writer.batch.operations.filter( operation => operation.isDocumentOperation ) ).toHaveLength( 1 );
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
				_setModelData( model, 'a[]bc' );

				const selection = model.createSelection( model.createPositionFromPath( doc.getRoot(), [ 2 ] ) );

				model.change( writer => {
					const affectedRange = model.insertContent( writer.createText( 'x' ), selection );

					expect( _getModelData( model ) ).toBe( 'a[]bxc' );
					expect( _stringifyModel( root, affectedRange ) ).toBe( 'ab[x]c' );
				} );
			} );

			it( 'should modify passed selection instance', () => {
				model.schema.extend( '$text', { allowIn: '$root' } );
				_setModelData( model, 'a[]bc' );

				const selection = model.createSelection( model.createPositionFromPath( doc.getRoot(), [ 2 ] ) );
				const selectionCopy = model.createSelection( model.createPositionFromPath( doc.getRoot(), [ 2 ] ) );

				expect( selection.isEqual( selectionCopy ) ).toBe( true );

				model.change( writer => {
					model.insertContent( writer.createText( 'x' ), selection );
				} );

				expect( selection.isEqual( selectionCopy ) ).toBe( false );

				const insertionSelection = model.createSelection( model.createPositionFromPath( doc.getRoot(), [ 3 ] ) );
				expect( selection.isEqual( insertionSelection ) ).toBe( true );
			} );

			it( 'should be able to insert content at custom position', () => {
				model.schema.extend( '$text', { allowIn: '$root' } );
				_setModelData( model, 'a[]bc' );

				const position = model.createPositionFromPath( doc.getRoot(), [ 2 ] );

				model.change( writer => {
					const affectedRange = model.insertContent( writer.createText( 'x' ), position );

					expect( _getModelData( model ) ).toBe( 'a[]bxc' );
					expect( _stringifyModel( root, affectedRange ) ).toBe( 'ab[x]c' );
				} );
			} );

			it( 'should be able to insert content at custom range', () => {
				model.schema.extend( '$text', { allowIn: '$root' } );
				_setModelData( model, 'a[]bc' );

				const range = model.createRange(
					model.createPositionFromPath( doc.getRoot(), [ 2 ] ),
					model.createPositionFromPath( doc.getRoot(), [ 3 ] )
				);

				model.change( writer => {
					const affectedRange = model.insertContent( writer.createText( 'x' ), range );

					expect( _getModelData( model ) ).toBe( 'a[]bx' );
					expect( _stringifyModel( root, affectedRange ) ).toBe( 'ab[x]' );
				} );
			} );

			it( 'should be able to insert content at model selection if document selection is passed', () => {
				model.schema.extend( '$text', { allowIn: '$root' } );
				_setModelData( model, 'a[]bc' );

				model.change( writer => {
					const affectedRange = model.insertContent( writer.createText( 'x' ), model.document.selection );

					expect( _getModelData( model ) ).toBe( 'ax[]bc' );
					expect( _stringifyModel( root, affectedRange ) ).toBe( 'a[x]bc' );
				} );
			} );

			it( 'should be able to insert content at model selection if none passed', () => {
				model.schema.extend( '$text', { allowIn: '$root' } );
				_setModelData( model, 'a[]bc' );

				model.change( writer => {
					const affectedRange = model.insertContent( writer.createText( 'x' ) );

					expect( _getModelData( model ) ).toBe( 'ax[]bc' );
					expect( _stringifyModel( root, affectedRange ) ).toBe( 'a[x]bc' );
				} );
			} );

			it( 'should be able to insert content at model element (numeric offset)', () => {
				model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );

				_setModelData( model, '<paragraph>foo[]</paragraph><paragraph>bar</paragraph>' );

				const element = doc.getRoot().getNodeByPath( [ 1 ] );

				model.change( writer => {
					const text = writer.createText( 'x' );

					const affectedRange = model.insertContent( text, element, 2 );

					expect( _getModelData( model ) ).toBe( '<paragraph>foo[]</paragraph><paragraph>baxr</paragraph>' );
					expect( _stringifyModel( root, affectedRange ) ).toBe( '<paragraph>foo</paragraph><paragraph>ba[x]r</paragraph>' );
				} );
			} );

			it( 'should be able to insert content at model element (offset="in")', () => {
				model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );

				_setModelData( model, '<paragraph>foo[]</paragraph><paragraph>bar</paragraph>' );

				const element = doc.getRoot().getNodeByPath( [ 1 ] );

				model.change( writer => {
					const text = writer.createText( 'x' );

					const affectedRange = model.insertContent( text, element, 'in' );

					expect( _getModelData( model ) ).toBe( '<paragraph>foo[]</paragraph><paragraph>x</paragraph>' );
					expect( _stringifyModel( root, affectedRange ) ).toBe( '<paragraph>foo</paragraph><paragraph>[x]</paragraph>' );
				} );
			} );

			it( 'should be able to insert content at model element (offset="on")', () => {
				model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
				model.schema.register( 'foo', { inheritAllFrom: '$block' } );

				_setModelData( model, '<paragraph>foo[]</paragraph><paragraph>bar</paragraph>' );

				const element = doc.getRoot().getNodeByPath( [ 1 ] );

				model.change( writer => {
					const insertElement = writer.createElement( 'foo' );

					const affectedRange = model.insertContent( insertElement, element, 'on' );

					expect( _getModelData( model ) ).toBe( '<paragraph>foo[]</paragraph><foo></foo>' );
					expect( _stringifyModel( root, affectedRange ) ).toBe( '<paragraph>foo</paragraph>[<foo></foo>]' );
				} );
			} );

			it( 'should be able to insert content at model element (offset="end")', () => {
				model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );

				_setModelData( model, '<paragraph>foo[]</paragraph><paragraph>bar</paragraph>' );

				const element = doc.getRoot().getNodeByPath( [ 1 ] );

				model.change( writer => {
					const text = writer.createText( 'x' );

					const affectedRange = model.insertContent( text, element, 'end' );

					expect( _getModelData( model ) ).toBe( '<paragraph>foo[]</paragraph><paragraph>barx</paragraph>' );
					expect( _stringifyModel( root, affectedRange ) ).toBe( '<paragraph>foo</paragraph><paragraph>bar[x]</paragraph>' );
				} );
			} );

			it( 'should be able to insert content at given root', () => {
				model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );

				_setModelData( model, '<paragraph>foo[]</paragraph><paragraph>bar</paragraph>' );

				model.change( writer => {
					const paragraph = writer.createElement( 'paragraph' );
					writer.insertText( 'abc', paragraph, 0 );

					const affectedRange = model.insertContent( paragraph, doc.getRoot() );

					expect( _getModelData( model ) ).toBe( '<paragraph>[]abc</paragraph>' );
					expect( _stringifyModel( root, affectedRange ) ).toBe( '[<paragraph>abc</paragraph>]' );
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
			const spy = vi.fn();
			const element = new ModelElement( 'blockWidget' );
			const options = {
				findOptimalPosition: 'after',
				setSelection: 'on'
			};

			model.on( 'insertObject', spy );

			model.insertObject( element, model.document.selection, null, options );

			const args = spy.mock.calls[ 0 ][ 1 ];

			expect( spy ).toHaveBeenCalledTimes( 1 );
			expect( args[ 0 ] ).toBe( element );
			expect( args[ 1 ] ).toBe( model.document.selection );
			expect( args[ 2 ] ).toBe( options );
		} );

		it( 'should be decorated and pass all parameters in the event data', () => {
			const spy = vi.fn();
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

			const args = spy.mock.calls[ 0 ][ 1 ];

			expect( spy ).toHaveBeenCalledTimes( 1 );
			expect( args[ 0 ] ).toBe( element );
			expect( args[ 1 ] ).toBe( model.document.selection );
			expect( args[ 2 ] ).toBe( options );
			expect( args[ 3 ] ).toBe( options );
			expect( args[ 4 ] ).toBe( obj1 );
			expect( args[ 5 ] ).toBe( obj2 );
			expect( args[ 6 ] ).toBe( obj3 );
		} );

		it( 'should insert inline object at the document selection position', () => {
			_setModelData( model, '<paragraph>fo[]ar</paragraph>' );

			model.insertObject( new ModelElement( 'inlineWidget' ) );

			expect( _getModelData( model ) ).toBe( '<paragraph>fo<inlineWidget></inlineWidget>[]ar</paragraph>' );
		} );

		it( 'should insert block object at the document selection position', () => {
			_setModelData( model, '<paragraph>fo[]ar</paragraph>' );

			model.insertObject( new ModelElement( 'blockWidget' ) );

			expect( _getModelData( model ) ).toBe(
				'<paragraph>fo</paragraph>' +
				'[<blockWidget></blockWidget>]' +
				'<paragraph>ar</paragraph>'
			);
		} );

		it( 'should use parent batch', () => {
			_setModelData( model, '<paragraph>[]</paragraph>' );

			model.change( writer => {
				model.insertObject( new ModelElement( 'inlineWidget' ) );
				expect( writer.batch.operations.filter( operation => operation.isDocumentOperation ) ).toHaveLength( 1 );
			} );
		} );

		describe( 'selectable normalization', () => {
			let doc, root;

			beforeEach( () => {
				doc = model.document;
				root = doc.getRoot();
			} );

			it( 'should be able to insert object at custom selection', () => {
				_setModelData( model, '<paragraph>a[]bc</paragraph>' );

				const selection = model.createSelection( model.createPositionFromPath( doc.getRoot(), [ 0, 2 ] ) );

				model.change( writer => {
					const affectedRange = model.insertObject( writer.createElement( 'inlineWidget' ), selection );

					expect( _getModelData( model ) ).toBe( '<paragraph>a[]b<inlineWidget></inlineWidget>c</paragraph>' );
					expect( _stringifyModel( root, affectedRange ) ).toBe(
						'<paragraph>ab[<inlineWidget></inlineWidget>]c</paragraph>'
					);
				} );
			} );

			it( 'should modify passed selection instance', () => {
				_setModelData( model, '<paragraph>a[]bc</paragraph>' );

				const selection = model.createSelection( model.createPositionFromPath( doc.getRoot(), [ 0, 2 ] ) );
				const selectionCopy = model.createSelection( model.createPositionFromPath( doc.getRoot(), [ 0, 2 ] ) );

				expect( selection.isEqual( selectionCopy ) ).toBe( true );

				model.change( writer => {
					model.insertObject( writer.createElement( 'inlineWidget' ), selection );
				} );

				expect( selection.isEqual( selectionCopy ) ).toBe( false );

				const insertionSelection = model.createSelection( model.createPositionFromPath( doc.getRoot(), [ 0, 3 ] ) );
				expect( selection.isEqual( insertionSelection ) ).toBe( true );
			} );

			it( 'should be able to insert content at custom position', () => {
				_setModelData( model, '<paragraph>a[]bc</paragraph>' );

				const position = model.createPositionFromPath( doc.getRoot(), [ 0, 2 ] );

				model.change( writer => {
					const affectedRange = model.insertObject( writer.createElement( 'inlineWidget' ), position );

					expect( _getModelData( model ) ).toBe( '<paragraph>a[]b<inlineWidget></inlineWidget>c</paragraph>' );
					expect( _stringifyModel( root, affectedRange ) ).toBe(
						'<paragraph>ab[<inlineWidget></inlineWidget>]c</paragraph>'
					);
				} );
			} );

			it( 'should be able to insert content at custom range', () => {
				_setModelData( model, '<paragraph>a[]bc</paragraph>' );

				const range = model.createRange(
					model.createPositionFromPath( doc.getRoot(), [ 0, 2 ] ),
					model.createPositionFromPath( doc.getRoot(), [ 0, 3 ] )
				);

				model.change( writer => {
					const affectedRange = model.insertObject( writer.createElement( 'inlineWidget' ), range );

					expect( _getModelData( model ) ).toBe( '<paragraph>a[]b<inlineWidget></inlineWidget></paragraph>' );
					expect( _stringifyModel( root, affectedRange ) ).toBe( '<paragraph>ab[<inlineWidget></inlineWidget>]</paragraph>' );
				} );
			} );

			it( 'should be able to insert content at model selection if document selection is passed', () => {
				_setModelData( model, '<paragraph>a[]bc</paragraph>' );

				model.change( writer => {
					const affectedRange = model.insertObject( writer.createElement( 'inlineWidget' ), model.document.selection );

					expect( _getModelData( model ) ).toBe( '<paragraph>a<inlineWidget></inlineWidget>[]bc</paragraph>' );
					expect( _stringifyModel( root, affectedRange ) ).toBe(
						'<paragraph>a[<inlineWidget></inlineWidget>]bc</paragraph>'
					);
				} );
			} );

			it( 'should be able to insert content at model selection if none passed', () => {
				_setModelData( model, '<paragraph>a[]bc</paragraph>' );

				model.change( writer => {
					const affectedRange = model.insertObject( writer.createElement( 'inlineWidget' ) );

					expect( _getModelData( model ) ).toBe( '<paragraph>a<inlineWidget></inlineWidget>[]bc</paragraph>' );
					expect( _stringifyModel( root, affectedRange ) ).toBe(
						'<paragraph>a[<inlineWidget></inlineWidget>]bc</paragraph>'
					);
				} );
			} );

			it( 'should be able to insert content at model element (numeric offset)', () => {
				_setModelData( model, '<paragraph>foo[]</paragraph><paragraph>bar</paragraph>' );

				const element = doc.getRoot().getNodeByPath( [ 1 ] );

				model.change( writer => {
					const text = writer.createElement( 'inlineWidget' );

					const affectedRange = model.insertObject( text, element, 2 );

					expect( _getModelData( model ) ).toBe(
						'<paragraph>foo[]</paragraph><paragraph>ba<inlineWidget></inlineWidget>r</paragraph>'
					);
					expect( _stringifyModel( root, affectedRange ) ).toBe(
						'<paragraph>foo</paragraph><paragraph>ba[<inlineWidget></inlineWidget>]r</paragraph>'
					);
				} );
			} );

			it( 'should be able to insert content at model element (offset="in")', () => {
				_setModelData( model, '<paragraph>foo[]</paragraph><paragraph>bar</paragraph>' );

				const element = doc.getRoot().getNodeByPath( [ 1 ] );

				model.change( writer => {
					const text = writer.createElement( 'inlineWidget' );

					const affectedRange = model.insertObject( text, element, 'in' );

					expect( _getModelData( model ) ).toBe(
						'<paragraph>foo[]</paragraph><paragraph><inlineWidget></inlineWidget></paragraph>'
					);
					expect( _stringifyModel( root, affectedRange ) ).toBe(
						'<paragraph>foo</paragraph><paragraph>[<inlineWidget></inlineWidget>]</paragraph>'
					);
				} );
			} );

			it( 'should be able to insert content at model element (offset="on")', () => {
				_setModelData( model, '<paragraph>foo[]</paragraph><paragraph>bar</paragraph>' );

				const element = doc.getRoot().getNodeByPath( [ 1 ] );

				model.change( writer => {
					const insertElement = writer.createElement( 'blockWidget' );

					const affectedRange = model.insertObject( insertElement, element, 'on' );

					expect( _getModelData( model ) ).toBe( '<paragraph>foo[]</paragraph><blockWidget></blockWidget>' );
					expect( _stringifyModel( root, affectedRange ) ).toBe( '<paragraph>foo</paragraph>[<blockWidget></blockWidget>]' );
				} );
			} );

			it( 'should be able to insert content at model element (offset="end")', () => {
				_setModelData( model, '<paragraph>foo[]</paragraph><paragraph>bar</paragraph>' );

				const element = doc.getRoot().getNodeByPath( [ 1 ] );

				model.change( writer => {
					const text = writer.createElement( 'inlineWidget' );

					const affectedRange = model.insertObject( text, element, 'end' );

					expect( _getModelData( model ) ).toBe(
						'<paragraph>foo[]</paragraph><paragraph>bar<inlineWidget></inlineWidget></paragraph>'
					);
					expect( _stringifyModel( root, affectedRange ) ).toBe(
						'<paragraph>foo</paragraph><paragraph>bar[<inlineWidget></inlineWidget>]</paragraph>'
					);
				} );
			} );
		} );
	} );

	describe( 'deleteContent()', () => {
		it( 'should be decorated', () => {
			const spy = vi.fn();

			model.on( 'deleteContent', spy );

			model.deleteContent( model.document.selection );

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should delete selected content', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			_setModelData( model, '<paragraph>fo[ob]ar</paragraph>' );

			model.deleteContent( model.document.selection );

			expect( _getModelData( model ) ).toBe( '<paragraph>fo[]ar</paragraph>' );
		} );

		it( 'should use parent batch', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			_setModelData( model, '<paragraph>fo[ob]ar</paragraph>' );

			model.change( writer => {
				model.deleteContent( model.document.selection );
				expect( writer.batch.operations ).toHaveLength( 1 );
			} );
		} );
	} );

	describe( 'modifySelection()', () => {
		it( 'should be decorated', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			_setModelData( model, '<paragraph>fo[ob]ar</paragraph>' );

			const spy = vi.fn();

			model.on( 'modifySelection', spy );

			model.modifySelection( model.document.selection );

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should modify a selection', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			_setModelData( model, '<paragraph>fo[ob]ar</paragraph>' );

			expect( _getModelData( model ) ).toBe( '<paragraph>fo[ob]ar</paragraph>' );

			model.modifySelection( model.document.selection, { direction: 'backward' } );

			expect( _getModelData( model ) ).toBe( '<paragraph>fo[o]bar</paragraph>' );
		} );
	} );

	describe( 'getSelectedContent()', () => {
		it( 'should be decorated', () => {
			const spy = vi.fn();
			const sel = new ModelSelection();

			model.on( 'getSelectedContent', spy );

			model.getSelectedContent( sel );

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should return selected content', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			_setModelData( model, '<paragraph>fo[ob]ar</paragraph>' );

			const content = model.getSelectedContent( model.document.selection );

			expect( _stringifyModel( content ) ).toBe( 'ob' );
		} );

		it( 'should use parent batch', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			_setModelData( model, '<paragraph>fo[ob]ar</paragraph>' );

			const version = model.document.version;
			model.getSelectedContent( model.document.selection );

			expect( model.document.version ).toBe( version );
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

			_setModelData(
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

			expect( model.hasContent( pFoo ) ).toBe( true );
		} );

		it( 'should return true if given element has text node (ignoreWhitespaces)', () => {
			const pFoo = root.getChild( 1 );

			expect( model.hasContent( pFoo, { ignoreWhitespaces: true } ) ).toBe( true );
		} );

		it( 'should return true if given element has text node containing spaces only', () => {
			const pEmpty = root.getChild( 0 ).getChild( 0 );

			model.enqueueChange( { isUndoable: false }, writer => {
				// Model `setData()` method trims whitespaces so use writer here to insert whitespace only text.
				writer.insertText( '    ', pEmpty, 'end' );
			} );

			expect( model.hasContent( pEmpty ) ).toBe( true );
		} );

		it( 'should false true if given element has text node containing spaces only (ignoreWhitespaces)', () => {
			const pEmpty = root.getChild( 0 ).getChild( 0 );

			model.enqueueChange( { isUndoable: false }, writer => {
				// Model `setData()` method trims whitespaces so use writer here to insert whitespace only text.
				writer.insertText( '    ', pEmpty, 'end' );
			} );

			expect( model.hasContent( pEmpty, { ignoreWhitespaces: true } ) ).toBe( false );
		} );

		it( 'should return true if given element has element that is an object', () => {
			const divImg = root.getChild( 2 );

			expect( model.hasContent( divImg ) ).toBe( true );
		} );

		it( 'should return false if given element has no elements', () => {
			const pEmpty = root.getChild( 0 ).getChild( 0 );

			expect( model.hasContent( pEmpty ) ).toBe( false );
		} );

		it( 'should return false if given element has only elements that are not objects', () => {
			const divP = root.getChild( 0 );

			expect( model.hasContent( divP ) ).toBe( false );
		} );

		it( 'should return true if there is a text node in given range', () => {
			const range = new ModelRange( ModelPosition._createAt( root, 1 ), ModelPosition._createAt( root, 2 ) );

			expect( model.hasContent( range ) ).toBe( true );
		} );

		it( 'should return true if there is a part of text node in given range', () => {
			const pFoo = root.getChild( 1 );
			const range = new ModelRange( ModelPosition._createAt( pFoo, 1 ), ModelPosition._createAt( pFoo, 2 ) );

			expect( model.hasContent( range ) ).toBe( true );
		} );

		it( 'should return true if there is element that is an object in given range', () => {
			const divImg = root.getChild( 2 );
			const range = new ModelRange( ModelPosition._createAt( divImg, 0 ), ModelPosition._createAt( divImg, 1 ) );

			expect( model.hasContent( range ) ).toBe( true );
		} );

		it( 'should return false if range is collapsed', () => {
			const range = new ModelRange( ModelPosition._createAt( root, 1 ), ModelPosition._createAt( root, 1 ) );

			expect( model.hasContent( range ) ).toBe( false );
		} );

		it( 'should return false if range has only elements that are not objects', () => {
			const range = new ModelRange( ModelPosition._createAt( root, 0 ), ModelPosition._createAt( root, 1 ) );

			expect( model.hasContent( range ) ).toBe( false );
		} );

		it( 'should return false for empty list items', () => {
			const range = new ModelRange( ModelPosition._createAt( root, 3 ), ModelPosition._createAt( root, 6 ) );

			expect( model.hasContent( range ) ).toBe( false );
		} );

		it( 'should return false for empty element with marker (usingOperation=false, affectsData=false)', () => {
			const pEmpty = root.getChild( 0 ).getChild( 0 );

			model.enqueueChange( { isUndoable: false }, writer => {
				// Insert marker.
				const range = ModelRange._createIn( pEmpty );
				writer.addMarker( 'comment1', { range, usingOperation: false, affectsData: false } );
			} );

			expect( model.hasContent( pEmpty ) ).toBe( false );
			expect( model.hasContent( pEmpty, { ignoreWhitespaces: true } ) ).toBe( false );
			expect( model.hasContent( pEmpty, { ignoreMarkers: true } ) ).toBe( false );
			expect( model.hasContent( pEmpty, { ignoreMarkers: true, ignoreWhitespaces: true } ) ).toBe( false );
		} );

		it( 'should return false for empty element with marker (usingOperation=true, affectsData=false)', () => {
			const pEmpty = root.getChild( 0 ).getChild( 0 );

			model.enqueueChange( { isUndoable: false }, writer => {
				// Insert marker.
				const range = ModelRange._createIn( pEmpty );
				writer.addMarker( 'comment1', { range, usingOperation: true, affectsData: false } );
			} );

			expect( model.hasContent( pEmpty ) ).toBe( false );
			expect( model.hasContent( pEmpty, { ignoreWhitespaces: true } ) ).toBe( false );
			expect( model.hasContent( pEmpty, { ignoreMarkers: true } ) ).toBe( false );
			expect( model.hasContent( pEmpty, { ignoreMarkers: true, ignoreWhitespaces: true } ) ).toBe( false );
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

			expect( model.hasContent( pEmpty, { ignoreWhitespaces: true } ) ).toBe( false );
			expect( model.hasContent( pEmpty, { ignoreWhitespaces: true, ignoreMarkers: true } ) ).toBe( false );
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

			expect( model.hasContent( pEmpty ) ).toBe( true );
			expect( model.hasContent( pEmpty, { ignoreMarkers: true } ) ).toBe( true );
			expect( model.hasContent( pEmpty, { ignoreMarkers: true, ignoreWhitespaces: true } ) ).toBe( false );
		} );

		it( 'should return false for empty element with marker (usingOperation=false, affectsData=true)', () => {
			const pEmpty = root.getChild( 0 ).getChild( 0 );

			model.enqueueChange( { isUndoable: false }, writer => {
				// Insert marker.
				const range = ModelRange._createIn( pEmpty );
				writer.addMarker( 'comment1', { range, usingOperation: false, affectsData: true } );
			} );

			expect( model.hasContent( pEmpty ) ).toBe( false );
			expect( model.hasContent( pEmpty, { ignoreWhitespaces: true } ) ).toBe( false );
			expect( model.hasContent( pEmpty, { ignoreMarkers: true } ) ).toBe( false );
			expect( model.hasContent( pEmpty, { ignoreMarkers: true, ignoreWhitespaces: true } ) ).toBe( false );
		} );

		it( 'should return false for empty element with marker (usingOperation=true, affectsData=true)', () => {
			const pEmpty = root.getChild( 0 ).getChild( 0 );

			model.enqueueChange( { isUndoable: false }, writer => {
				// Insert marker.
				const range = ModelRange._createIn( pEmpty );
				writer.addMarker( 'comment1', { range, usingOperation: true, affectsData: true } );
			} );

			expect( model.hasContent( pEmpty ) ).toBe( false );
			expect( model.hasContent( pEmpty, { ignoreWhitespaces: true } ) ).toBe( false );
			expect( model.hasContent( pEmpty, { ignoreMarkers: true } ) ).toBe( false );
			expect( model.hasContent( pEmpty, { ignoreMarkers: true, ignoreWhitespaces: true } ) ).toBe( false );
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

			expect( model.hasContent( pEmpty ) ).toBe( true );
			expect( model.hasContent( pEmpty, { ignoreWhitespaces: true } ) ).toBe( true );
			expect( model.hasContent( pEmpty, { ignoreMarkers: true } ) ).toBe( true );
			expect( model.hasContent( pEmpty, { ignoreMarkers: true, ignoreWhitespaces: true } ) ).toBe( false );
		} );

		it( 'should return true for an item registered as a content (isContent=true, isObject=false) in the schema', () => {
			const contentElement = root.getChild( 6 );

			expect( model.hasContent( contentElement ) ).toBe( true );
		} );

		it( 'should return true if a range contains an item registered as a content (isContent=true, isObject=false) in the schema', () => {
			// [<div><content></content></div>]
			const range = new ModelRange( ModelPosition._createAt( root, 6 ), ModelPosition._createAt( root, 7 ) );

			expect( model.hasContent( range ) ).toBe( true );
		} );

		it( 'should return true if passed selection has any meaningful content (text node in range)', () => {
			const range = new ModelRange( ModelPosition._createAt( root, 1 ), ModelPosition._createAt( root, 2 ) );
			const selection = new ModelSelection( range );

			expect( model.hasContent( selection ) ).toBe( true );
		} );

		it( 'should return true if passed selection has any meaningful content (content element)', () => {
			// [<div><content></content></div>]
			const range = new ModelRange( ModelPosition._createAt( root, 6 ), ModelPosition._createAt( root, 7 ) );
			const selection = new ModelSelection( range );

			expect( model.hasContent( selection ) ).toBe( true );
		} );

		it( 'should return true if at least one range in selection has any meaningful content', () => {
			const range = new ModelRange( ModelPosition._createAt( root, 1 ), ModelPosition._createAt( root, 2 ) );
			const collapsedRange = new ModelRange( ModelPosition._createAt( root, 2 ), ModelPosition._createAt( root, 2 ) );
			const selection = new ModelSelection( [
				collapsedRange,
				range
			] );

			expect( model.hasContent( selection ) ).toBe( true );
		} );

		it( 'should return false if selection has only collapsed ranges', () => {
			const selection = new ModelSelection( [
				new ModelRange( ModelPosition._createAt( root, 1 ), ModelPosition._createAt( root, 1 ) ),
				new ModelRange( ModelPosition._createAt( root, 2 ), ModelPosition._createAt( root, 2 ) )
			] );

			expect( model.hasContent( selection ) ).toBe( false );
		} );

		it( 'should return false if selection has only elements that are not objects', () => {
			const selection = new ModelSelection( [
				new ModelRange( ModelPosition._createAt( root, 0 ), ModelPosition._createAt( root, 1 ) ),
				new ModelRange( ModelPosition._createAt( root, 3 ), ModelPosition._createAt( root, 4 ) )
			] );

			expect( model.hasContent( selection ) ).toBe( false );
		} );

		it( 'should return false if selection has no ranges', () => {
			const selection = new ModelSelection( [] );

			expect( model.hasContent( selection ) ).toBe( false );
		} );
	} );

	describe( 'canEditAt()', () => {
		it( 'should return true if model document is not in read-only mode', () => {
			model.document.isReadOnly = false;

			expect( model.canEditAt( model.document.selection ) ).toBe( true );
		} );

		it( 'should return fasle if model document is not in read-only mode', () => {
			model.document.isReadOnly = true;

			expect( model.canEditAt( model.document.selection ) ).toBe( false );
		} );
	} );

	describe( 'createPositionFromPath()', () => {
		it( 'should return instance of Position', () => {
			expect( model.createPositionFromPath( model.document.getRoot(), [ 0 ] ) ).toBeInstanceOf( ModelPosition );
		} );
	} );

	describe( 'createPositionAt()', () => {
		it( 'should return instance of Position', () => {
			expect( model.createPositionAt( model.document.getRoot(), 0 ) ).toBeInstanceOf( ModelPosition );
		} );
	} );

	describe( 'createPositionAfter()', () => {
		it( 'should return instance of Position', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			_setModelData( model, '<paragraph>fo[]ar</paragraph>' );

			expect( model.createPositionAfter( model.document.getRoot().getChild( 0 ) ) ).toBeInstanceOf( ModelPosition );
		} );
	} );

	describe( 'createPositionBefore()', () => {
		it( 'should return instance of Position', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			_setModelData( model, '<paragraph>fo[]ar</paragraph>' );

			expect( model.createPositionBefore( model.document.getRoot().getChild( 0 ) ) ).toBeInstanceOf( ModelPosition );
		} );
	} );

	describe( 'createRange()', () => {
		it( 'should return instance of Range', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			_setModelData( model, '<paragraph>fo[]ar</paragraph>' );

			expect( model.createRange( model.createPositionAt( model.document.getRoot(), 0 ) ) ).toBeInstanceOf( ModelRange );
		} );
	} );

	describe( 'createRangeIn()', () => {
		it( 'should return instance of Range', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			_setModelData( model, '<paragraph>fo[]ar</paragraph>' );

			expect( model.createRangeIn( model.document.getRoot().getChild( 0 ) ) ).toBeInstanceOf( ModelRange );
		} );
	} );

	describe( 'createRangeOn()', () => {
		it( 'should return instance of Range', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			_setModelData( model, '<paragraph>fo[]ar</paragraph>' );

			expect( model.createRangeOn( model.document.getRoot().getChild( 0 ) ) ).toBeInstanceOf( ModelRange );
		} );
	} );

	describe( 'createSelection()', () => {
		it( 'should return instance of Selection', () => {
			expect( model.createSelection() ).toBeInstanceOf( ModelSelection );
		} );
	} );

	describe( 'createBatch()', () => {
		it( 'should return instance of Batch', () => {
			const batch = model.createBatch();
			expect( batch ).toBeInstanceOf( Batch );
		} );

		it( 'should allow to define type of Batch', () => {
			const batch = model.createBatch( { isUndo: true, isUndoable: true } );
			expect( batch ).toBeInstanceOf( Batch );
			expect( batch.isUndo ).toBe( true );
			expect( batch.isUndoable ).toBe( true );
		} );
	} );

	describe( 'createOperationFromJson()', () => {
		it( 'should create operation from JSON', () => {
			const operation = model.createOperationFromJSON( {
				__className: 'NoOperation',
				baseVersion: 0
			} );

			expect( operation ).toBeInstanceOf( NoOperation );
			expect( operation.baseVersion ).toBe( 0 );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy document', () => {
			vi.spyOn( model.document, 'destroy' );

			model.destroy();

			expect( model.document.destroy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should destroy markers', () => {
			vi.spyOn( model.markers, 'destroy' );

			model.destroy();

			expect( model.markers.destroy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should stop listening', () => {
			const emitter = new ( EmitterMixin() )();
			const spy = vi.fn();

			model.listenTo( emitter, 'event', spy );

			model.destroy();

			emitter.fire( 'event' );

			expect( spy ).not.toHaveBeenCalled();
		} );
	} );
} );
