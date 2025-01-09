/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Model from '../../../src/model/model.js';
import RootOperation from '../../../src/model/operation/rootoperation.js';

describe( 'RootOperation', () => {
	let model, doc;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
	} );

	describe( 'type', () => {
		it( 'should be addRoot for adding a root', () => {
			const op = new RootOperation( 'new', '$root', true, doc, doc.version );

			expect( op.type ).to.equal( 'addRoot' );
		} );

		it( 'should be detachRoot for detaching a root', () => {
			const op = new RootOperation( 'new', '$root', false, doc, doc.version );

			expect( op.type ).to.equal( 'detachRoot' );
		} );
	} );

	it( 'should create a detached root in the model as the operation is created, if the model does not have such root', () => {
		expect( model.document.getRoot( 'new' ) ).to.be.null;

		// eslint-disable-next-line
		new RootOperation( 'new', '$root', true, doc, doc.version );

		const root = model.document.getRoot( 'new' );
		expect( root ).not.to.be.null;
		expect( root.isAttached() ).to.be.false;

		expect( () => {
			// Should not throw because the operation should not try to create the root again.
			// eslint-disable-next-line
			new RootOperation( 'new', '$root', true, doc, doc.version );
		} ).not.to.throw();
	} );

	it( 'should return the root element on affectedSelectable', () => {
		const op = new RootOperation( 'new', '$root', true, doc, doc.version );
		expect( op.affectedSelectable ).to.equal( doc.getRoot( 'new' ) );
	} );

	it( 'should attach a model in the root', () => {
		const op = new RootOperation( 'new', '$root', true, doc, doc.version );
		const root = model.document.getRoot( 'new' );

		expect( root.isAttached() ).to.be.false;

		model.applyOperation( op );

		expect( root.isAttached() ).to.be.true;
	} );

	it( 'should detach a model in the root', () => {
		const root = doc.createRoot( '$root', 'new' );

		expect( root.isAttached() ).to.be.true;

		const op = new RootOperation( 'new', '$root', false, doc, doc.version );

		model.applyOperation( op );

		expect( root.isAttached() ).to.be.false;
	} );

	it( 'should create a RootOperation as a reverse', () => {
		const operation = new RootOperation( 'new', '$root', true, doc, doc.version );
		const reverse = operation.getReversed();

		expect( reverse ).to.be.an.instanceof( RootOperation );
		expect( reverse.baseVersion ).to.equal( doc.version + 1 );
		expect( reverse.rootName ).to.equal( 'new' );
		expect( reverse.elementName ).to.equal( '$root' );
		expect( reverse.isAdd ).to.equal( false );
	} );

	it( 'should create a correct operation when cloned', () => {
		const operation = new RootOperation( 'new', '$root', true, doc, doc.version );
		const clone = operation.clone();

		expect( clone ).to.be.an.instanceof( RootOperation );
		expect( clone.baseVersion ).to.equal( doc.version );
		expect( clone.rootName ).to.equal( 'new' );
		expect( clone.elementName ).to.equal( '$root' );
		expect( clone.isAdd ).to.equal( true );
	} );

	describe( 'toJSON', () => {
		it( 'should create proper serialized object', () => {
			const op = new RootOperation( 'new', '$root', true, doc, doc.version );
			const serialized = op.toJSON();

			expect( serialized.__className ).to.equal( 'RootOperation' );
			expect( serialized ).to.deep.equal( {
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

			expect( deserialized ).to.deep.equal( op );
		} );
	} );
} );
