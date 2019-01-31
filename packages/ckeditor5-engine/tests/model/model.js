/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import Model from '../../src/model/model';
import ModelText from '../../src/model/text';
import ModelRange from '../../src/model/range';
import ModelPosition from '../../src/model/position';
import ModelSelection from '../../src/model/selection';
import ModelDocumentFragment from '../../src/model/documentfragment';
import Batch from '../../src/model/batch';
import Writer from '../../src/model/writer';
import { getData, setData, stringify } from '../../src/dev-utils/model';

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
			expect( schema.checkChild( [ '$block' ], '$text' ) ).to.be.true;
		} );

		it( 'registers $clipboardHolder to the schema', () => {
			expect( schema.isRegistered( '$clipboardHolder' ) ).to.be.true;
			expect( schema.isLimit( '$clipboardHolder' ) ).to.be.true;
			expect( schema.checkChild( [ '$clipboardHolder' ], '$text' ) ).to.be.true;
			expect( schema.checkChild( [ '$clipboardHolder' ], '$block' ) ).to.be.true;
		} );

		it( 'registers $marker to the schema', () => {
			expect( schema.isRegistered( '$marker' ) ).to.be.true;
			expect( schema.checkChild( [ '$root' ], '$marker' ), 1 ).to.be.true;
			expect( schema.checkChild( [ '$block' ], '$marker' ), 1 ).to.be.true;
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
			model.once( '_change', () => {
				changes += 'B';
			} );

			model.enqueueChange( () => {
				model.enqueueChange( () => {
					changes += 'C';
				} );

				changes += 'A';
			} );

			expect( changes ).to.equal( 'ABC' );
		} );

		it( 'should be possible to nest enqueueChange in changes event', () => {
			model.once( '_change', () => {
				changes += 'B';
			} );

			model.change( () => {
				model.enqueueChange( () => {
					changes += 'C';
				} );

				changes += 'A';
			} );

			expect( changes ).to.equal( 'ABC' );
		} );

		it( 'should be possible to nest changes in enqueueChange event', () => {
			model.once( '_change', () => {
				changes += 'C';
			} );

			model.enqueueChange( () => {
				model.change( () => {
					changes += 'A';
				} );

				changes += 'B';
			} );

			expect( changes ).to.equal( 'ABC' );
		} );

		it( 'should be possible to nest changes in changes event', () => {
			model.once( '_change', () => {
				changes += 'C';
			} );

			model.change( () => {
				model.change( () => {
					changes += 'A';
				} );

				changes += 'B';
			} );

			expect( changes ).to.equal( 'ABC' );
		} );

		it( 'should let mix blocks', () => {
			model.once( '_change', () => {
				model.change( () => {
					changes += 'B';

					nestedEnqueue();
				} );

				model.change( () => {
					changes += 'C';
				} );

				changes += 'D';
			} );

			model.change( () => {
				changes += 'A';
			} );

			expect( changes ).to.equal( 'ABCDE' );

			function nestedEnqueue() {
				model.enqueueChange( () => {
					changes += 'E';
				} );
			}
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

			setData(
				model,

				'<div>' +
				'<paragraph></paragraph>' +
				'</div>' +
				'<paragraph>foo</paragraph>' +
				'<div>' +
				'<image></image>' +
				'</div>'
			);

			root = model.document.getRoot();
		} );

		it( 'should return true if given element has text node', () => {
			const pFoo = root.getChild( 1 );

			expect( model.hasContent( pFoo ) ).to.be.true;
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
	} );

	describe( 'isEmpty()', () => {
		beforeEach( () => {
			// Register paragraphs and divs.
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			schema.register( 'div', { inheritAllFrom: '$block' } );
			schema.extend( '$block', { allowIn: 'div' } );

			// Allow bold attribute on text nodes.
			schema.extend( '$text', { allowAttributes: 'bold' } );

			// Allow sub attribute on text nodes.
			schema.extend( '$text', { allowAttributes: 'subscript' } );

			// Register blockquotes.
			schema.register( 'blockQuote', {
				allowWhere: '$block',
				allowContentOf: '$root'
			} );

			// Register headings.
			schema.register( 'heading1', {
				inheritAllFrom: '$block'
			} );

			// Register images.
			schema.register( 'image', {
				isObject: true,
				isBlock: true,
				allowWhere: '$block',
				allowAttributes: [ 'alt', 'src', 'srcset' ]
			} );
			schema.extend( 'image', { allowIn: 'div' } );

			// Register lists.
			schema.register( 'listItem', {
				inheritAllFrom: '$block',
				allowAttributes: [ 'listType', 'listIndent' ]
			} );

			// Register media.
			schema.register( 'media', {
				isObject: true,
				isBlock: true,
				allowWhere: '$block',
				allowAttributes: [ 'url' ]
			} );

			// Register tables.
			schema.register( 'table', {
				allowWhere: '$block',
				allowAttributes: [ 'headingRows', 'headingColumns' ],
				isLimit: true,
				isObject: true,
				isBlock: true
			} );

			schema.register( 'tableRow', {
				allowIn: 'table',
				isLimit: true
			} );

			schema.register( 'tableCell', {
				allowIn: 'tableRow',
				allowAttributes: [ 'colspan', 'rowspan' ],
				isLimit: true
			} );

			// Allow all $block content inside table cell.
			schema.extend( '$block', { allowIn: 'tableCell' } );
		} );

		it( 'should return true for empty paragraph', () => {
			expectIsEmpty( true, '<paragraph></paragraph>' );
		} );

		it( 'should return true for multiple empty paragraphs', () => {
			expectIsEmpty( true, '<paragraph></paragraph><paragraph></paragraph><paragraph></paragraph>' );
		} );

		it( 'should return true for paragraph with spaces only', () => {
			expectIsEmpty( true, '<paragraph></paragraph>', root => {
				model.enqueueChange( 'transparent', writer => {
					// Model `setData()` method trims whitespaces so use writer here to insert whitespace only text.
					writer.insertText( '    ', root.getChild( 0 ), 'end' );
				} );

				return '<paragraph>    </paragraph>';
			} );
		} );

		it( 'should return true for paragraph with whitespaces only', () => {
			expectIsEmpty( true, '<paragraph></paragraph>', root => {
				model.enqueueChange( 'transparent', writer => {
					// Model `setData()` method trims whitespaces so use writer here to insert whitespace only text.
					writer.insertText( ' \r\n\t\f\v ', root.getChild( 0 ), 'end' );
				} );

				return '<paragraph> \r\n\t\f\v </paragraph>';
			} );
		} );

		it( 'should return true for text with attribute containing spaces only', () => {
			expectIsEmpty( true, '<paragraph></paragraph>', root => {
				model.enqueueChange( 'transparent', writer => {
					// Model `setData()` method trims whitespaces so use writer here to insert whitespace only text.
					const text = writer.createText( '   ', { bold: true } );
					writer.append( text, root.getChild( 0 ) );
				} );

				return '<paragraph><$text bold="true">   </$text></paragraph>';
			} );
		} );

		it( 'should return true for text with attribute containing whitespaces only', () => {
			expectIsEmpty( true, '<paragraph></paragraph><paragraph></paragraph>', root => {
				model.enqueueChange( 'transparent', writer => {
					// Model `setData()` method trims whitespaces so use writer here to insert whitespace only text.
					const text1 = writer.createText( '          ', { bold: true } );
					const text2 = writer.createText( ' \r\n\t\f\v ', { bold: true, subscript: true } );

					writer.append( text1, root.getChild( 0 ) );
					writer.append( text2, root.getChild( 1 ) );
				} );

				return '<paragraph><$text bold="true">          </$text></paragraph>' +
					'<paragraph><$text bold="true" subscript="true"> \r\n\t\f\v </$text></paragraph>';
			} );
		} );

		it( 'should return false for paragraph with text', () => {
			expectIsEmpty( false, '<paragraph>Foo Bar</paragraph>' );
		} );

		it( 'should return false for empty paragraph and paragraph with text', () => {
			expectIsEmpty( false, '<paragraph></paragraph><paragraph>Foo Bar</paragraph>' );
		} );

		it( 'should return true for nested empty blocks', () => {
			expectIsEmpty( true, '<div><paragraph></paragraph></div>' );
		} );

		it( 'should return true for multiple nested empty blocks', () => {
			expectIsEmpty( true, '<div><paragraph></paragraph><blockQuote></blockQuote></div>' );
		} );

		it( 'should return true for empty heading', () => {
			expectIsEmpty( true, '<heading1></heading1>' );
		} );

		it( 'should return true for empty list (single list item)', () => {
			expectIsEmpty( true, '<listItem></listItem>' );
		} );

		it( 'should return true for empty list (multiple list item)', () => {
			expectIsEmpty( true, '<listItem></listItem><listItem></listItem><listItem></listItem>' );
		} );

		it( 'should return true for empty list with whitespaces only', () => {
			expectIsEmpty( true, '<listItem></listItem><listItem></listItem>', root => {
				model.enqueueChange( 'transparent', writer => {
					// Model `setData()` method trims whitespaces so use writer here to insert whitespace only text.
					writer.insertText( ' \r\n\t\f\v ', root.getChild( 0 ), 'end' );
					writer.insertText( '  ', root.getChild( 1 ), 'end' );
				} );

				return '<listItem> \r\n\t\f\v </listItem><listItem>  </listItem>';
			} );
		} );

		it( 'should return false for list with text', () => {
			expectIsEmpty( false, '<listItem>foo</listItem><listItem>bar</listItem>' );
		} );

		it( 'should return false for empty table', () => {
			expectIsEmpty( false, '<table><tableRow><tableCell></tableCell></tableRow></table>' );
		} );

		it( 'should return false for single image', () => {
			expectIsEmpty( false, '<image></image>' );
		} );

		it( 'should return false for empty element and single image', () => {
			expectIsEmpty( false, '<listItem></listItem><image></image>' );
		} );

		function expectIsEmpty( isEmpty, modelData, modifyModel ) {
			setData( model, modelData );

			const root = model.document.getRoot();

			let expectedModel = modelData;
			if ( modifyModel ) {
				expectedModel = modifyModel( root );
			}

			expect( stringify( root ) ).to.equal( expectedModel );

			expect( model.isEmpty( ModelRange._createIn( root ) ) ).to.equal( !!isEmpty );
		}
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
			expect( model.createBatch() ).to.be.instanceof( Batch );
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
