/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Model } from '../../../src/model/model.js';
import { RootOperation } from '../../../src/model/operation/rootoperation.js';

describe( 'RootOperation', () => {
	let model, doc;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
	} );

	describe( 'type', () => {
		it( 'should be addRoot for adding a root', () => {
			const op = new RootOperation( 'new', '$root', true, doc, doc.version );

			expect( op.type ).toBe( 'addRoot' );
		} );

		it( 'should be detachRoot for detaching a root', () => {
			const op = new RootOperation( 'new', '$root', false, doc, doc.version );

			expect( op.type ).toBe( 'detachRoot' );
		} );
	} );

	it( 'should create a detached root in the model as the operation is created, if the model does not have such root', () => {
		expect( model.document.getRoot( 'new' ) ).toBeNull();

		// eslint-disable-next-line
		new RootOperation( 'new', '$root', true, doc, doc.version );

		const root = model.document.getRoot( 'new' );
		expect( root ).not.toBeNull();
		expect( root.isAttached() ).toBe( false );

		expect( () => {
			// Should not throw because the operation should not try to create the root again.
			// eslint-disable-next-line
			new RootOperation( 'new', '$root', true, doc, doc.version );
		} ).not.toThrow();
	} );

	it( 'should return the root element on affectedSelectable', () => {
		const op = new RootOperation( 'new', '$root', true, doc, doc.version );
		expect( op.affectedSelectable ).toBe( doc.getRoot( 'new' ) );
	} );

	it( 'should attach a model in the root', () => {
		const op = new RootOperation( 'new', '$root', true, doc, doc.version );
		const root = model.document.getRoot( 'new' );

		expect( root.isAttached() ).toBe( false );

		model.applyOperation( op );

		expect( root.isAttached() ).toBe( true );
	} );

	it( 'should detach a model in the root', () => {
		const root = doc.createRoot( '$root', 'new' );

		expect( root.isAttached() ).toBe( true );

		const op = new RootOperation( 'new', '$root', false, doc, doc.version );

		model.applyOperation( op );

		expect( root.isAttached() ).toBe( false );
	} );

	it( 'should create a RootOperation as a reverse', () => {
		const operation = new RootOperation( 'new', '$root', true, doc, doc.version );
		const reverse = operation.getReversed();

		expect( reverse ).toBeInstanceOf( RootOperation );
		expect( reverse.baseVersion ).toBe( doc.version + 1 );
		expect( reverse.rootName ).toBe( 'new' );
		expect( reverse.elementName ).toBe( '$root' );
		expect( reverse.isAdd ).toBe( false );
	} );

	it( 'should create a correct operation when cloned', () => {
		const operation = new RootOperation( 'new', '$root', true, doc, doc.version );
		const clone = operation.clone();

		expect( clone ).toBeInstanceOf( RootOperation );
		expect( clone.baseVersion ).toBe( doc.version );
		expect( clone.rootName ).toBe( 'new' );
		expect( clone.elementName ).toBe( '$root' );
		expect( clone.isAdd ).toBe( true );
	} );

	describe( 'toJSON', () => {
		it( 'should create proper serialized object', () => {
			const op = new RootOperation( 'new', '$root', true, doc, doc.version );
			const serialized = op.toJSON();

			expect( serialized.__className ).toBe( 'RootOperation' );
			expect( serialized ).toEqual( {
				__className: 'RootOperation',
				baseVersion: 0,
				rootName: 'new',
				elementName: '$root',
				isAdd: true
			} );
		} );
	} );

	describe( 'fromJSON', () => {
		it( 'should create proper RootOperation from json object', () => {
			const op = new RootOperation( 'new', '$root', false, doc, doc.version );
			const serialized = op.toJSON();
			const deserialized = RootOperation.fromJSON( serialized, doc );

			expect( deserialized ).toEqual( op );
		} );
	} );
} );
