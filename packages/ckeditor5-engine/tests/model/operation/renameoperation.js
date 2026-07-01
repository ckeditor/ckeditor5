/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Model } from '../../../src/model/model.js';
import { ModelElement } from '../../../src/model/element.js';
import { RenameOperation } from '../../../src/model/operation/renameoperation.js';
import { ModelPosition } from '../../../src/model/position.js';

import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'RenameOperation', () => {
	const oldName = 'oldName';
	const newName = 'newName';

	let model, doc, root, element, position;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
		root = doc.createRoot();

		element = new ModelElement( oldName );
		root._appendChild( element );

		position = ModelPosition._createBefore( element );
	} );

	it( 'should have type equal to rename', () => {
		const op = new RenameOperation( position, oldName, newName, doc.version );

		expect( op.type ).toBe( 'rename' );
	} );

	it( 'should change name of given element', () => {
		const op = new RenameOperation( position, oldName, newName, doc.version );

		model.applyOperation( op );

		expect( element.name ).toBe( newName );
	} );

	it( 'should create a RenameOperation as a reverse', () => {
		const op = new RenameOperation( position, oldName, newName, doc.version );
		const reverse = op.getReversed();

		expect( reverse ).toBeInstanceOf( RenameOperation );
		expect( reverse.baseVersion ).toBe( 1 );
		expect( reverse.position.isEqual( position ) ).toBe( true );
		expect( reverse.oldName ).toBe( newName );
		expect( reverse.newName ).toBe( oldName );
	} );

	it( 'should undo renaming element by applying reverse operation', () => {
		const op = new RenameOperation( position, oldName, newName, doc.version );
		const reverse = op.getReversed();

		model.applyOperation( op );
		model.applyOperation( reverse );

		expect( doc.version ).toBe( 2 );
		expect( element.name ).toBe( oldName );
	} );

	describe( '_validate()', () => {
		it( 'should throw an error if position is not before an element', () => {
			const op = new RenameOperation( ModelPosition._createAt( root, 'end' ), oldName, newName, doc.version );

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
			} ).not.toThrow();
		} );
	} );

	it( 'should create a RenameOperation with the same parameters when cloned', () => {
		const op = new RenameOperation( ModelPosition._createAt( root, 'end' ), oldName, newName, doc.version );
		const clone = op.clone();

		// New instance rather than a pointer to the old instance.
		expect( clone ).not.toBe( op );

		expect( clone ).toBeInstanceOf( RenameOperation );
		expect( clone.baseVersion ).toBe( op.baseVersion );
		expect( clone.position.isEqual( op.position ) ).toBe( true );
		expect( clone.oldName ).toBe( oldName );
		expect( clone.newName ).toBe( newName );
	} );

	describe( 'toJSON', () => {
		it( 'should create proper serialized object', () => {
			const op = new RenameOperation( ModelPosition._createAt( root, 'end' ), oldName, newName, doc.version );
			const serialized = op.toJSON();

			expect( serialized ).toEqual( {
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
			const op = new RenameOperation( ModelPosition._createAt( root, 'end' ), oldName, newName, doc.version );

			const serialized = op.toJSON();
			const deserialized = RenameOperation.fromJSON( serialized, doc );

			expect( deserialized ).toEqual( op );
		} );
	} );
} );
