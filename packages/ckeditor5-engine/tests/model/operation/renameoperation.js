/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Model from '../../../src/model/model.js';
import Element from '../../../src/model/element.js';
import RenameOperation from '../../../src/model/operation/renameoperation.js';
import Position from '../../../src/model/position.js';

import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'RenameOperation', () => {
	const oldName = 'oldName';
	const newName = 'newName';

	let model, doc, root, element, position;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
		root = doc.createRoot();

		element = new Element( oldName );
		root._appendChild( element );

		position = Position._createBefore( element );
	} );

	it( 'should have type equal to rename', () => {
		const op = new RenameOperation( position, oldName, newName, doc.version );

		expect( op.type ).to.equal( 'rename' );
	} );

	it( 'should change name of given element', () => {
		const op = new RenameOperation( position, oldName, newName, doc.version );

		model.applyOperation( op );

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

		model.applyOperation( op );
		model.applyOperation( reverse );

		expect( doc.version ).to.equal( 2 );
		expect( element.name ).to.equal( oldName );
	} );

	describe( '_validate()', () => {
		it( 'should throw an error if position is not before an element', () => {
			const op = new RenameOperation( Position._createAt( root, 'end' ), oldName, newName, doc.version );

			expectToThrowCKEditorError( () => {
				op._validate();
			}, /rename-operation-wrong-position/, model );
		} );

		it( 'should throw an error if oldName is different than renamed element name', () => {
			const op = new RenameOperation( position, 'foo', newName, doc.version );

			expectToThrowCKEditorError( () => {
				op._validate();
			}, /rename-operation-wrong-name/, model );
		} );

		it( 'should not throw when new name is the same as previous', () => {
			const op = new RenameOperation( position, oldName, oldName, doc.version );

			expect( () => {
				op._validate();
			} ).to.not.throw();
		} );
	} );

	it( 'should create a RenameOperation with the same parameters when cloned', () => {
		const op = new RenameOperation( Position._createAt( root, 'end' ), oldName, newName, doc.version );
		const clone = op.clone();

		// New instance rather than a pointer to the old instance.
		expect( clone ).not.to.equal( op );

		expect( clone ).to.be.instanceof( RenameOperation );
		expect( clone.baseVersion ).to.equal( op.baseVersion );
		expect( clone.position.isEqual( op.position ) ).to.be.true;
		expect( clone.oldName ).to.equal( oldName );
		expect( clone.newName ).to.equal( newName );
	} );

	describe( 'toJSON', () => {
		it( 'should create proper serialized object', () => {
			const op = new RenameOperation( Position._createAt( root, 'end' ), oldName, newName, doc.version );
			const serialized = op.toJSON();

			expect( serialized ).to.deep.equal( {
				__className: 'RenameOperation',
				baseVersion: 0,
				position: op.position.toJSON(),
				newName: 'newName',
				oldName: 'oldName'
			} );
		} );
	} );

	describe( 'fromJSON', () => {
		it( 'should create proper AttributeOperation from json object', () => {
			const op = new RenameOperation( Position._createAt( root, 'end' ), oldName, newName, doc.version );

			const serialized = op.toJSON();
			const deserialized = RenameOperation.fromJSON( serialized, doc );

			expect( deserialized ).to.deep.equal( op );
		} );
	} );
} );
