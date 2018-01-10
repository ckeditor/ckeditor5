/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Model from '../../../src/model/model';
import Document from '../../../src/model/document';
import RootElement from '../../../src/model/rootelement';
import Batch from '../../../src/model/batch';
import Delta from '../../../src/model/delta/delta';
import Range from '../../../src/model/range';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import count from '@ckeditor/ckeditor5-utils/src/count';
import { jsonParseStringify } from '../../../tests/model/_utils/utils';
import { setData, getData } from '../../../src/dev-utils/model';

describe( 'Document', () => {
	let model, doc;

	beforeEach( () => {
		model = new Model();
		doc = new Document( model );

		// Normally Model is the one who creates Document instance and keeps it as reference.
		// We have to be sure that Model uses the right Document instance.
		model.document = doc;
	} );

	describe( 'constructor()', () => {
		it( 'should create Document with no data, empty graveyard and selection set to default range', () => {
			const doc = new Document( model );

			expect( doc ).to.have.property( 'model' ).to.equal( model );
			expect( doc ).to.have.property( 'roots' ).that.is.instanceof( Collection );
			expect( doc.roots.length ).to.equal( 1 );
			expect( doc.graveyard ).to.be.instanceof( RootElement );
			expect( doc.graveyard.maxOffset ).to.equal( 0 );
			expect( count( doc.selection.getRanges() ) ).to.equal( 1 );
		} );
	} );

	describe( 'model#applyOperation listener', () => {
		let operation, data, delta, batch;

		beforeEach( () => {
			data = { data: 'x' };

			operation = {
				type: 't',
				baseVersion: 0,
				isDocumentOperation: true,
				_execute: sinon.stub().returns( data ),
				_validate: () => {}
			};

			delta = new Delta();
			delta.addOperation( operation );
			delta.type = 'delta';

			batch = new Batch();
			batch.addDelta( delta );
		} );

		it( 'for document operation: should increase document version, execute operation and fire change event with proper data', () => {
			const changeCallback = sinon.spy();

			doc.on( 'change', changeCallback );
			model.applyOperation( operation );

			expect( doc.version ).to.equal( 1 );
			expect( doc.history._deltas.length ).to.equal( 1 );
			sinon.assert.calledOnce( operation._execute );

			sinon.assert.calledOnce( changeCallback );
			expect( changeCallback.args[ 0 ][ 1 ] ).to.equal( 't' );
			expect( changeCallback.args[ 0 ][ 2 ] ).to.equal( data );
			expect( changeCallback.args[ 0 ][ 3 ] ).to.equal( batch );
			expect( changeCallback.args[ 0 ][ 4 ] ).to.equal( delta.type );
		} );

		it( 'for non-document operation: should only execute operation', () => {
			const changeCallback = sinon.spy();
			operation.isDocumentOperation = false;

			doc.on( 'change', changeCallback );
			model.applyOperation( operation );

			expect( doc.version ).to.equal( 0 );
			expect( doc.history._deltas.length ).to.equal( 0 );
			sinon.assert.calledOnce( operation._execute );

			sinon.assert.notCalled( changeCallback );
		} );

		it( 'should do nothing if operation event was cancelled', () => {
			model.on( 'applyOperation', evt => evt.stop(), { priority: 'highest' } );

			model.applyOperation( operation );

			expect( doc.version ).to.equal( 0 );
			expect( operation._execute.called ).to.be.false;
		} );

		it( 'should throw an error on the operation base version and the document version is different', () => {
			const operation = {
				baseVersion: 1,
				isDocumentOperation: true,
				_execute: () => {}
			};

			expect(
				() => {
					model.applyOperation( operation );
				}
			).to.throw( CKEditorError, /^model-document-applyOperation-wrong-version/ );
		} );
	} );

	describe( 'getRootNames()', () => {
		it( 'should return empty iterator if no roots exist', () => {
			expect( count( doc.getRootNames() ) ).to.equal( 0 );
		} );

		it( 'should return an iterator of all roots without the graveyard', () => {
			doc.createRoot( '$root', 'a' );
			doc.createRoot( '$root', 'b' );

			expect( Array.from( doc.getRootNames() ) ).to.deep.equal( [ 'a', 'b' ] );
		} );
	} );

	describe( 'createRoot()', () => {
		it( 'should create a new RootElement with default element and root names, add it to roots map and return it', () => {
			const root = doc.createRoot();

			expect( doc.roots.length ).to.equal( 2 );
			expect( root ).to.be.instanceof( RootElement );
			expect( root.maxOffset ).to.equal( 0 );
			expect( root ).to.have.property( 'name', '$root' );
			expect( root ).to.have.property( 'rootName', 'main' );
		} );

		it( 'should create a new RootElement with custom element and root names, add it to roots map and return it', () => {
			const root = doc.createRoot( 'customElementName', 'customRootName' );

			expect( doc.roots.length ).to.equal( 2 );
			expect( root ).to.be.instanceof( RootElement );
			expect( root.maxOffset ).to.equal( 0 );
			expect( root ).to.have.property( 'name', 'customElementName' );
			expect( root ).to.have.property( 'rootName', 'customRootName' );
		} );

		it( 'should throw an error when trying to create a second root with the same name', () => {
			doc.createRoot( '$root', 'rootName' );

			expect(
				() => {
					doc.createRoot( '$root', 'rootName' );
				}
			).to.throw( CKEditorError, /model-document-createRoot-name-exists/ );
		} );
	} );

	describe( 'getRoot()', () => {
		it( 'should return a RootElement previously created with given name', () => {
			const newRoot = doc.createRoot();
			const getRoot = doc.getRoot();

			expect( getRoot ).to.equal( newRoot );
		} );

		it( 'should throw an error when trying to get non-existent root', () => {
			expect(
				() => {
					doc.getRoot( 'root' );
				}
			).to.throw( CKEditorError, /model-document-getRoot-root-not-exist/ );
		} );
	} );

	describe( 'selection', () => {
		it( 'should get updated attributes whenever attribute operation is applied', () => {
			sinon.spy( doc.selection, '_updateAttributes' );

			doc.fire( 'change', 'addAttribute' );

			expect( doc.selection._updateAttributes.called ).to.be.true;
		} );

		it( 'should throw if one of ranges starts or ends inside surrogate pair', () => {
			const root = doc.createRoot();
			root.appendChildren( '\uD83D\uDCA9' );

			expect( () => {
				doc.selection.setRanges( [ Range.createFromParentsAndOffsets( root, 0, root, 1 ) ] );
			} ).to.throw( CKEditorError, /document-selection-wrong-position/ );

			expect( () => {
				doc.selection.setRanges( [ Range.createFromParentsAndOffsets( root, 1, root, 2 ) ] );
			} ).to.throw( CKEditorError, /document-selection-wrong-position/ );
		} );

		it( 'should throw if one of ranges starts or ends between base character and combining mark', () => {
			const root = doc.createRoot();
			root.appendChildren( 'foo̻̐ͩbar' );

			expect( () => {
				doc.selection.setRanges( [ Range.createFromParentsAndOffsets( root, 3, root, 9 ) ] );
			} ).to.throw( CKEditorError, /document-selection-wrong-position/ );

			expect( () => {
				doc.selection.setRanges( [ Range.createFromParentsAndOffsets( root, 4, root, 9 ) ] );
			} ).to.throw( CKEditorError, /document-selection-wrong-position/ );

			expect( () => {
				doc.selection.setRanges( [ Range.createFromParentsAndOffsets( root, 5, root, 9 ) ] );
			} ).to.throw( CKEditorError, /document-selection-wrong-position/ );

			expect( () => {
				doc.selection.setRanges( [ Range.createFromParentsAndOffsets( root, 1, root, 3 ) ] );
			} ).to.throw( CKEditorError, /document-selection-wrong-position/ );

			expect( () => {
				doc.selection.setRanges( [ Range.createFromParentsAndOffsets( root, 1, root, 4 ) ] );
			} ).to.throw( CKEditorError, /document-selection-wrong-position/ );

			expect( () => {
				doc.selection.setRanges( [ Range.createFromParentsAndOffsets( root, 1, root, 5 ) ] );
			} ).to.throw( CKEditorError, /document-selection-wrong-position/ );
		} );
	} );

	describe( 'getNearestSelectionRange()', () => {
		let selection;

		beforeEach( () => {
			model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			model.schema.register( 'emptyBlock', { allowIn: '$root' } );

			model.schema.register( 'widget', {
				allowIn: '$root',
				isObject: true
			} );

			model.schema.register( 'blockWidget', {
				allowIn: '$root',
				allowContentOf: '$block',
				isObject: true
			} );

			doc.createRoot();
			selection = doc.selection;
		} );

		test(
			'should return collapsed range if text node can be placed at that position - both',
			'<paragraph>[]</paragraph>',
			'both',
			'<paragraph>[]</paragraph>'
		);

		test(
			'should return collapsed range if text node can be placed at that position - forward',
			'<paragraph>[]</paragraph>',
			'forward',
			'<paragraph>[]</paragraph>'
		);

		test(
			'should return collapsed range if text node can be placed at that position - backward',
			'<paragraph>[]</paragraph>',
			'backward',
			'<paragraph>[]</paragraph>'
		);

		test( 'should return null in empty document - both', '', 'both', null );

		test( 'should return null in empty document - backward', '', 'backward', null );

		test( 'should return null in empty document - forward', '', 'forward', null );

		test(
			'should find range before when searching both ways',
			'<paragraph></paragraph>[]<paragraph></paragraph>',
			'both',
			'<paragraph>[]</paragraph><paragraph></paragraph>'
		);

		test(
			'should find range before when searching backward',
			'<paragraph></paragraph>[]<paragraph></paragraph>',
			'backward',
			'<paragraph>[]</paragraph><paragraph></paragraph>'
		);

		test(
			'should find range after when searching forward',
			'<paragraph></paragraph>[]<paragraph></paragraph>',
			'forward',
			'<paragraph></paragraph><paragraph>[]</paragraph>'
		);

		test(
			'should find range after when searching both ways when it is closer',
			'<paragraph></paragraph><emptyBlock></emptyBlock>[]<paragraph></paragraph>',
			'both',
			'<paragraph></paragraph><emptyBlock></emptyBlock><paragraph>[]</paragraph>'
		);

		test(
			'should find range before when searching both ways when it is closer',
			'<paragraph></paragraph><emptyBlock></emptyBlock>[]<emptyBlock></emptyBlock><emptyBlock></emptyBlock><paragraph></paragraph>',
			'both',
			'<paragraph>[]</paragraph><emptyBlock></emptyBlock><emptyBlock></emptyBlock><emptyBlock></emptyBlock><paragraph></paragraph>'
		);

		test(
			'should return null if there is no valid range',
			'[]<emptyBlock></emptyBlock>',
			'both',
			null
		);

		test(
			'should return null if there is no valid range in given direction - backward',
			'[]<paragraph></paragraph>',
			'backward',
			null
		);

		test(
			'should return null if there is no valid range in given direction - forward',
			'<paragraph></paragraph>[]',
			'forward',
			null
		);

		test(
			'should move forward when placed at root start',
			'[]<paragraph></paragraph><paragraph></paragraph>',
			'both',
			'<paragraph>[]</paragraph><paragraph></paragraph>'
		);

		test(
			'should move backward when placed at root end',
			'<paragraph></paragraph><paragraph></paragraph>[]',
			'both',
			'<paragraph></paragraph><paragraph>[]</paragraph>'
		);

		describe( 'in case of objects which do not allow text inside', () => {
			test(
				'should select nearest object (o[]o) - both',
				'<widget></widget>[]<widget></widget>',
				'both',
				'[<widget></widget>]<widget></widget>'
			);

			test(
				'should select nearest object (o[]o) - forward',
				'<widget></widget>[]<widget></widget>',
				'forward',
				'<widget></widget>[<widget></widget>]'
			);

			test(
				'should select nearest object (o[]o) - backward',
				'<widget></widget>[]<widget></widget>',
				'both',
				'[<widget></widget>]<widget></widget>'
			);

			test(
				'should select nearest object (p[]o) - forward',
				'<paragraph></paragraph>[]<widget></widget>',
				'forward',
				'<paragraph></paragraph>[<widget></widget>]'
			);

			test(
				'should select nearest object (o[]p) - both',
				'<widget></widget>[]<paragraph></paragraph>',
				'both',
				'[<widget></widget>]<paragraph></paragraph>'
			);

			test(
				'should select nearest object (o[]p) - backward',
				'<widget></widget>[]<paragraph></paragraph>',
				'backward',
				'[<widget></widget>]<paragraph></paragraph>'
			);

			test(
				'should select nearest object ([]o) - both',
				'[]<widget></widget><paragraph></paragraph>',
				'both',
				'[<widget></widget>]<paragraph></paragraph>'
			);

			test(
				'should select nearest object ([]o) - forward',
				'[]<widget></widget><paragraph></paragraph>',
				'forward',
				'[<widget></widget>]<paragraph></paragraph>'
			);

			test(
				'should select nearest object (o[]) - both',
				'<paragraph></paragraph><widget></widget>[]',
				'both',
				'<paragraph></paragraph>[<widget></widget>]'
			);

			test(
				'should select nearest object (o[]) - backward',
				'<paragraph></paragraph><widget></widget>[]',
				'both',
				'<paragraph></paragraph>[<widget></widget>]'
			);
		} );

		describe( 'in case of objects which allow text inside', () => {
			test(
				'should select nearest object which allows text (o[]o) - both',
				'<blockWidget></blockWidget>[]<blockWidget></blockWidget>',
				'both',
				'[<blockWidget></blockWidget>]<blockWidget></blockWidget>'
			);

			test(
				'should select nearest object (o[]p) - both',
				'<blockWidget></blockWidget>[]<paragraph></paragraph>',
				'both',
				'[<blockWidget></blockWidget>]<paragraph></paragraph>'
			);

			test(
				'should select nearest object which allows text ([]o) - both',
				'[]<blockWidget></blockWidget><paragraph></paragraph>',
				'both',
				'[<blockWidget></blockWidget>]<paragraph></paragraph>'
			);
		} );

		function test( testName, data, direction, expected ) {
			it( testName, () => {
				setData( model, data );
				const range = doc.getNearestSelectionRange( selection.anchor, direction );

				if ( expected === null ) {
					expect( range ).to.be.null;
				} else {
					selection.setRanges( [ range ] );
					expect( getData( model ) ).to.equal( expected );
				}
			} );
		}
	} );

	describe( '_getDefaultRoot()', () => {
		it( 'should return graveyard root if there are no other roots in the document', () => {
			expect( doc._getDefaultRoot() ).to.equal( doc.graveyard );
		} );

		it( 'should return the first root added to the document', () => {
			const rootA = doc.createRoot( '$root', 'rootA' );
			doc.createRoot( '$root', 'rootB' );
			doc.createRoot( '$root', 'rootC' );

			expect( doc._getDefaultRoot() ).to.equal( rootA );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy selection instance', () => {
			const spy = sinon.spy( doc.selection, 'destroy' );

			doc.destroy();

			sinon.assert.calledOnce( spy );
		} );

		it( 'should stop listening to events', () => {
			const spy = sinon.spy();

			doc.listenTo( model, 'something', spy );

			model.fire( 'something' );

			sinon.assert.calledOnce( spy );

			doc.destroy();

			model.fire( 'something' );

			// Still once.
			sinon.assert.calledOnce( spy );
		} );
	} );

	it( 'should be correctly converted to json', () => {
		const serialized = jsonParseStringify( doc );

		expect( serialized.selection ).to.equal( '[engine.model.DocumentSelection]' );
		expect( serialized.model ).to.equal( '[engine.model.Model]' );
	} );
} );
