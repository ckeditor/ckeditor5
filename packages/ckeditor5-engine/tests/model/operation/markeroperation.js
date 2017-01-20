/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Document from '../../../src/model/document';
import Text from '../../../src/model/text';
import DocumentFragment from '../../../src/model/documentfragment';
import Range from '../../../src/model/range';
import MarkerOperation from '../../../src/model/operation/markeroperation';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import { jsonParseStringify, wrapInDelta } from '../../model/_utils/utils';

function matchRange( range ) {
	return sinon.match( ( rangeToMatch ) => rangeToMatch.isEqual( range ) );
}

describe( 'MarkerOperation', () => {
	let doc, root, range;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot();
		root.appendChildren( new Text( 'foo' ) );
		range = Range.createFromParentsAndOffsets( root, 0, root, 0 );
	} );

	it( 'should have property type equal to "marker"', () => {
		const op = new MarkerOperation( 'name', null, range, 0 );
		expect( op.type ).to.equal( 'marker' );
	} );

	it( 'should add marker to document marker collection', () => {
		sinon.spy( doc.markers, 'set' );
		sinon.spy( doc, 'fire' );

		doc.on( 'change', ( evt, type, changes ) => {
			expect( type ).to.equal( 'marker' );
			expect( changes.name ).to.equal( 'name' );
			expect( changes.type ).to.equal( 'set' );
		} );

		doc.applyOperation( wrapInDelta(
			new MarkerOperation( 'name', null, range, doc.version )
		) );

		expect( doc.version ).to.equal( 1 );
		expect( doc.markers.set.calledWith( 'name', matchRange( range ) ) );
		expect( doc.markers.get( 'name' ).getRange().isEqual( range ) ).to.be.true;
		expect( doc.fire.called ).to.be.true;
	} );

	it( 'should update marker in document marker collection', () => {
		doc.applyOperation( wrapInDelta(
			new MarkerOperation( 'name', null, range, doc.version )
		) );

		const range2 = Range.createFromParentsAndOffsets( root, 0, root, 3 );

		sinon.spy( doc.markers, 'set' );
		sinon.spy( doc, 'fire' );

		doc.applyOperation( wrapInDelta(
			new MarkerOperation( 'name', range, range2, doc.version )
		) );

		expect( doc.version ).to.equal( 2 );
		expect( doc.markers.set.calledWith( 'name', matchRange( range2 ) ) );
		expect( doc.markers.get( 'name' ).getRange().isEqual( range2 ) ).to.be.true;
		expect( doc.fire.called ).to.be.true;
	} );

	it( 'should remove marker from document marker collection', () => {
		doc.applyOperation( wrapInDelta(
			new MarkerOperation( 'name', null, range, doc.version )
		) );

		sinon.spy( doc.markers, 'remove' );
		sinon.spy( doc, 'fire' );

		doc.on( 'change', ( evt, type, changes ) => {
			expect( type ).to.equal( 'marker' );
			expect( changes.name ).to.equal( 'name' );
			expect( changes.type ).to.equal( 'remove' );
		} );

		doc.applyOperation( wrapInDelta(
			new MarkerOperation( 'name', range, null, doc.version )
		) );

		expect( doc.version ).to.equal( 2 );
		expect( doc.markers.remove.calledWith( 'name' ) );
		expect( doc.markers.get( 'name' ) ).to.be.null;
		expect( doc.fire.called ).to.be.true;
	} );

	it( 'should not cause change event if operation does not change marker', () => {
		const range = Range.createFromParentsAndOffsets( root, 0, root, 3 );
		doc.markers.set( 'name', range );

		sinon.spy( doc, 'fire' );

		doc.applyOperation( wrapInDelta(
			new MarkerOperation( 'name', range, range, doc.version )
		) );

		doc.applyOperation( wrapInDelta(
			new MarkerOperation( 'otherName', null, null, doc.version )
		) );

		expect( doc.fire.notCalled ).to.be.true;
	} );

	it( 'should return MarkerOperation with swapped ranges as reverse operation', () => {
		const range2 = Range.createFromParentsAndOffsets( root, 0, root, 3 );

		const op1 = new MarkerOperation( 'name', null, range, doc.version );
		const reversed1 = op1.getReversed();

		const op2 = new MarkerOperation( 'name', range, range2, doc.version );
		const reversed2 = op2.getReversed();

		expect( reversed1 ).to.be.an.instanceof( MarkerOperation );
		expect( reversed2 ).to.be.an.instanceof( MarkerOperation );

		expect( reversed1.name ).to.equal( 'name' );
		expect( reversed1.oldRange.isEqual( range ) ).to.be.true;
		expect( reversed1.newRange ).to.be.null;
		expect( reversed1.baseVersion ).to.equal( 1 );

		expect( reversed2.name ).to.equal( 'name' );
		expect( reversed2.oldRange.isEqual( range2 ) ).to.be.true;
		expect( reversed2.newRange.isEqual( range ) ).to.be.true;
		expect( reversed2.baseVersion ).to.equal( 1 );
	} );

	it( 'should create a MarkerOperation with the same parameters when cloned', () => {
		const op = new MarkerOperation( 'name', null, range, 0 );
		const clone = op.clone();

		expect( clone ).to.be.an.instanceof( MarkerOperation );
		expect( clone ).to.deep.equal( op );
	} );

	it( 'should throw if oldRange is not in a document', () => {
		const docFrag = new DocumentFragment();
		const rangeInDocFrag = Range.createIn( docFrag );

		expect( () => {
			new MarkerOperation( 'name', rangeInDocFrag, null, 0 );
		} ).to.throw( CKEditorError, /^marker-operation-range-not-in-document/ );
	} );

	it( 'should throw if newRange is not in a document', () => {
		const docFrag = new DocumentFragment();
		const rangeInDocFrag = Range.createIn( docFrag );

		expect( () => {
			new MarkerOperation( 'name', null, rangeInDocFrag, 0 );
		} ).to.throw( CKEditorError, /^marker-operation-range-not-in-document/ );
	} );

	it( 'should throw if ranges are in different documents', () => {
		const document2 = new Document();
		const root2 = document2.createRoot();
		const rangeInRoot2 = Range.createIn( root2 );

		expect( () => {
			new MarkerOperation( 'name', range, rangeInRoot2, 0 );
		} ).to.throw( CKEditorError, /^marker-operation-ranges-in-different-documents/ );
	} );

	describe( 'toJSON', () => {
		it( 'should create proper serialized object', () => {
			const op = new MarkerOperation( 'name', null, range, doc.version );
			const serialized = jsonParseStringify( op );

			expect( serialized ).to.deep.equal( {
				__className: 'engine.model.operation.MarkerOperation',
				baseVersion: 0,
				name: 'name',
				oldRange: null,
				newRange: jsonParseStringify( range )
			} );
		} );
	} );

	describe( 'fromJSON', () => {
		it( 'should create proper MarkerOperation from json object #1', () => {
			const op = new MarkerOperation( 'name', null, range, doc.version );

			const serialized = jsonParseStringify( op );
			const deserialized = MarkerOperation.fromJSON( serialized, doc );

			expect( deserialized ).to.deep.equal( op );
		} );

		it( 'should create proper MarkerOperation from json object #2', () => {
			// Gotta love 100% CC.
			const op = new MarkerOperation( 'name', range, null, doc.version );

			const serialized = jsonParseStringify( op );
			const deserialized = MarkerOperation.fromJSON( serialized, doc );

			expect( deserialized ).to.deep.equal( op );
		} );
	} );
} );
