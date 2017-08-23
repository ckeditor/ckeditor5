/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Document from '../../../src/model/document';
import Element from '../../../src/model/element';
import RenameOperation from '../../../src/model/operation/renameoperation';
import Position from '../../../src/model/position';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import { jsonParseStringify, wrapInDelta } from '../../../tests/model/_utils/utils';

describe( 'RenameOperation', () => {
	const oldName = 'oldName';
	const newName = 'newName';

	let doc, root, element, position;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot();

		element = new Element( oldName );
		root.appendChildren( element );

		position = Position.createBefore( element );
	} );

	it( 'should have type equal to rename', () => {
		const op = new RenameOperation( position, oldName, newName, doc.version );

		expect( op.type ).to.equal( 'rename' );
	} );

	it( 'should change name of given element', () => {
		const op = new RenameOperation( position, oldName, newName, doc.version );

		doc.applyOperation( wrapInDelta( op ) );

		expect( element.name ).to.equal( newName );
	} );

	it( 'should create a RenameOperation as a reverse', () => {
		const op = new RenameOperation( position, oldName, newName, doc.version );
		const reverse = op.getReversed();

		expect( reverse ).to.be.an.instanceof( RenameOperation );
		expect( reverse.baseVersion ).to.equal( 1 );
		expect( reverse.position.isEqual( position ) ).to.be.true;
		expect( reverse.oldName ).to.equal( newName );
		expect( reverse.newName ).to.equal( oldName );
	} );

	it( 'should undo renaming element by applying reverse operation', () => {
		const op = new RenameOperation( position, oldName, newName, doc.version );
		const reverse = op.getReversed();

		doc.applyOperation( wrapInDelta( op ) );
		doc.applyOperation( wrapInDelta( reverse ) );

		expect( doc.version ).to.equal( 2 );
		expect( element.name ).to.equal( oldName );
	} );

	it( 'should throw an error if position is not before an element', () => {
		const op = new RenameOperation( Position.createAt( root, 'end' ), oldName, newName, doc.version );

		expect( () => {
			doc.applyOperation( wrapInDelta( op ) );
		} ).to.throw( CKEditorError, /rename-operation-wrong-position/ );
	} );

	it( 'should throw an error if oldName is different than renamed element name', () => {
		const op = new RenameOperation( position, 'foo', newName, doc.version );

		expect( () => {
			doc.applyOperation( wrapInDelta( op ) );
		} ).to.throw( CKEditorError, /rename-operation-wrong-name/ );
	} );

	it( 'should create a RenameOperation with the same parameters when cloned', () => {
		const op = new RenameOperation( Position.createAt( root, 'end' ), oldName, newName, doc.version );
		const clone = op.clone();

		// New instance rather than a pointer to the old instance.
		expect( clone ).not.to.be.equal( op );

		expect( clone ).to.be.instanceof( RenameOperation );
		expect( clone.baseVersion ).to.equal( op.baseVersion );
		expect( clone.position.isEqual( op.position ) ).to.be.true;
		expect( clone.oldName ).to.equal( oldName );
		expect( clone.newName ).to.equal( newName );
	} );

	describe( 'toJSON', () => {
		it( 'should create proper serialized object', () => {
			const op = new RenameOperation( Position.createAt( root, 'end' ), oldName, newName, doc.version );
			const serialized = jsonParseStringify( op );

			expect( serialized ).to.deep.equal( {
				__className: 'engine.model.operation.RenameOperation',
				baseVersion: 0,
				position: jsonParseStringify( op.position ),
				newName: 'newName',
				oldName: 'oldName'
			} );
		} );
	} );

	describe( 'fromJSON', () => {
		it( 'should create proper AttributeOperation from json object', () => {
			const op = new RenameOperation( Position.createAt( root, 'end' ), oldName, newName, doc.version );

			const serialized = jsonParseStringify( op );
			const deserialized = RenameOperation.fromJSON( serialized, doc );

			expect( deserialized ).to.deep.equal( op );
		} );
	} );
} );
