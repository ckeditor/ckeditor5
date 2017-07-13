/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Document from '../../../src/model/document';
import Schema from '../../../src/model/schema';
import RootElement from '../../../src/model/rootelement';
import Batch from '../../../src/model/batch';
import Delta from '../../../src/model/delta/delta';
import NoOperation from '../../../src/model/operation/nooperation';
import deltaTransform from '../../../src/model/delta/transform';
import Range from '../../../src/model/range';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import count from '@ckeditor/ckeditor5-utils/src/count';
import { jsonParseStringify } from '../../../tests/model/_utils/utils';
import { setData, getData } from '../../../src/dev-utils/model';

describe( 'Document', () => {
	let doc;

	beforeEach( () => {
		doc = new Document();
	} );

	describe( 'constructor()', () => {
		it( 'should create Document with no data, empty graveyard and selection set to default range', () => {
			expect( doc ).to.have.property( 'roots' ).that.is.instanceof( Map );
			expect( doc.roots.size ).to.equal( 1 );
			expect( doc.graveyard ).to.be.instanceof( RootElement );
			expect( doc.graveyard.maxOffset ).to.equal( 0 );
			expect( count( doc.selection.getRanges() ) ).to.equal( 1 );

			expect( doc.schema ).to.be.instanceof( Schema );
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

			expect( doc.roots.size ).to.equal( 2 );
			expect( root ).to.be.instanceof( RootElement );
			expect( root.maxOffset ).to.equal( 0 );
			expect( root ).to.have.property( 'name', '$root' );
			expect( root ).to.have.property( 'rootName', 'main' );
		} );

		it( 'should create a new RootElement with custom element and root names, add it to roots map and return it', () => {
			const root = doc.createRoot( 'customElementName', 'customRootName' );

			expect( doc.roots.size ).to.equal( 2 );
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

	describe( 'hasRoot()', () => {
		it( 'should return true when Document has RootElement with given name', () => {
			doc.createRoot();

			expect( doc.hasRoot( 'main' ) ).to.be.true;
		} );

		it( 'should return false when Document does not have RootElement with given name', () => {
			expect( doc.hasRoot( 'noroot' ) ).to.be.false;
		} );
	} );

	describe( 'applyOperation()', () => {
		it( 'should increase document version, execute operation and fire event with proper data', () => {
			const changeCallback = sinon.spy();
			const type = 't';
			const data = { data: 'x' };
			const batch = new Batch();
			const delta = new Delta();
			delta.type = 'type';

			const operation = {
				type,
				baseVersion: 0,
				_execute: sinon.stub().returns( data )
			};

			delta.addOperation( operation );
			batch.addDelta( delta );

			doc.on( 'change', changeCallback );
			doc.applyOperation( operation );

			expect( doc.version ).to.equal( 1 );
			sinon.assert.calledOnce( operation._execute );

			sinon.assert.calledOnce( changeCallback );
			expect( changeCallback.args[ 0 ][ 1 ] ).to.equal( type );
			expect( changeCallback.args[ 0 ][ 2 ] ).to.equal( data );
			expect( changeCallback.args[ 0 ][ 3 ] ).to.deep.equal( batch );
			expect( changeCallback.args[ 0 ][ 4 ] ).to.equal( delta.type );
		} );

		it( 'should throw an error on the operation base version and the document version is different', () => {
			const operation = {
				baseVersion: 1
			};

			expect(
				() => {
					doc.applyOperation( operation );
				}
			).to.throw( CKEditorError, /model-document-applyOperation-wrong-version/ );
		} );
	} );

	describe( 'batch()', () => {
		it( 'should create a new batch with the document property', () => {
			const batch = doc.batch();

			expect( batch ).to.be.instanceof( Batch );
			expect( batch ).to.have.property( 'document' ).that.equals( doc );
		} );

		it( 'should set given batch type', () => {
			const batch = doc.batch( 'ignore' );

			expect( batch ).to.have.property( 'type' ).that.equals( 'ignore' );
		} );
	} );

	describe( 'enqueue()', () => {
		it( 'should be executed immediately and fire changesDone event', () => {
			const order = [];

			doc.on( 'changesDone', () => order.push( 'done' ) );

			doc.enqueueChanges( () => order.push( 'enqueue1' ) );

			expect( order ).to.have.length( 2 );
			expect( order[ 0 ] ).to.equal( 'enqueue1' );
			expect( order[ 1 ] ).to.equal( 'done' );
		} );

		it( 'should fire done every time queue is empty', () => {
			const order = [];

			doc.on( 'changesDone', () => order.push( 'done' ) );

			doc.enqueueChanges( () => order.push( 'enqueue1' ) );
			doc.enqueueChanges( () => order.push( 'enqueue2' ) );

			expect( order ).to.have.length( 4 );
			expect( order[ 0 ] ).to.equal( 'enqueue1' );
			expect( order[ 1 ] ).to.equal( 'done' );
			expect( order[ 2 ] ).to.equal( 'enqueue2' );
			expect( order[ 3 ] ).to.equal( 'done' );
		} );

		it( 'should put callbacks in the proper order', () => {
			const order = [];

			doc.on( 'changesDone', () => order.push( 'done' ) );

			doc.enqueueChanges( () => {
				order.push( 'enqueue1 start' );
				doc.enqueueChanges( () => {
					order.push( 'enqueue2 start' );
					doc.enqueueChanges( () => order.push( 'enqueue4' ) );
					order.push( 'enqueue2 end' );
				} );

				doc.enqueueChanges( () => order.push( 'enqueue3' ) );

				order.push( 'enqueue1 end' );
			} );

			expect( order ).to.have.length( 7 );
			expect( order[ 0 ] ).to.equal( 'enqueue1 start' );
			expect( order[ 1 ] ).to.equal( 'enqueue1 end' );
			expect( order[ 2 ] ).to.equal( 'enqueue2 start' );
			expect( order[ 3 ] ).to.equal( 'enqueue2 end' );
			expect( order[ 4 ] ).to.equal( 'enqueue3' );
			expect( order[ 5 ] ).to.equal( 'enqueue4' );
			expect( order[ 6 ] ).to.equal( 'done' );
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
			doc.schema.registerItem( 'paragraph', '$block' );

			doc.schema.registerItem( 'emptyBlock' );
			doc.schema.allow( { name: 'emptyBlock', inside: '$root' } );

			doc.schema.registerItem( 'widget' );
			doc.schema.allow( { name: 'widget', inside: '$root' } );
			doc.schema.objects.add( 'widget' );

			doc.schema.registerItem( 'blockWidget', '$block' );
			doc.schema.allow( { name: 'blockWidget', inside: '$root' } );
			doc.schema.objects.add( 'blockWidget' );

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
				setData( doc, data );
				const range = doc.getNearestSelectionRange( selection.anchor, direction );

				if ( expected === null ) {
					expect( range ).to.be.null;
				} else {
					selection.setRanges( [ range ] );
					expect( getData( doc ) ).to.equal( expected );
				}
			} );
		}
	} );

	describe( 'transformDeltas', () => {
		it( 'should use deltaTransform.transformDeltaSets', () => {
			sinon.spy( deltaTransform, 'transformDeltaSets' );

			// Prepare some empty-ish deltas so the transformation won't throw an error.
			const deltasA = [ new Delta() ];
			deltasA[ 0 ].addOperation( new NoOperation( 0 ) );

			const deltasB = [ new Delta() ];
			deltasB[ 0 ].addOperation( new NoOperation( 0 ) );

			doc.transformDeltas( deltasA, deltasB );

			expect( deltaTransform.transformDeltaSets.calledOnce ).to.be.true;
			expect( deltaTransform.transformDeltaSets.calledWith( deltasA, deltasB, null ) ).to.be.true;

			deltaTransform.transformDeltaSets.restore();
		} );

		it( 'should pass itself to transformDeltaSets if useContext was set to true', () => {
			sinon.spy( deltaTransform, 'transformDeltaSets' );

			// Prepare some empty-ish deltas so the transformation won't throw an error.
			const deltasA = [ new Delta() ];
			deltasA[ 0 ].addOperation( new NoOperation( 0 ) );

			const deltasB = [ new Delta() ];
			deltasB[ 0 ].addOperation( new NoOperation( 0 ) );

			doc.transformDeltas( deltasA, deltasB, true );

			expect( deltaTransform.transformDeltaSets.calledOnce ).to.be.true;
			expect( deltaTransform.transformDeltaSets.calledWith( deltasA, deltasB, doc ) ).to.be.true;

			deltaTransform.transformDeltaSets.restore();
		} );
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

	it( 'should be correctly converted to json', () => {
		expect( jsonParseStringify( doc ).selection ).to.equal( '[engine.model.DocumentSelection]' );
	} );
} );
