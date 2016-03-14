/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel, operation */

'use strict';

import Document from '/ckeditor5/core/treemodel/document.js';
import RootAttributeOperation from '/ckeditor5/core/treemodel/operation/rootattributeoperation.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';

describe( 'RootAttributeOperation', () => {
	let doc, root;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );
	} );

	it( 'should have proper type', () => {
		const op = new RootAttributeOperation(
			root,
			'isNew',
			null,
			true,
			doc.version
		);

		expect( op.type ).to.equal( 'rootattribute' );
	} );

	it( 'should add attribute on the root element', () => {
		doc.applyOperation(
			new RootAttributeOperation(
				root,
				'isNew',
				null,
				true,
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.hasAttribute( 'isNew' ) ).to.be.true;
	} );

	it( 'should change attribute on the root element', () => {
		root.setAttribute( 'isNew', false );

		doc.applyOperation(
			new RootAttributeOperation(
				root,
				'isNew',
				false,
				true,
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.getAttribute( 'isNew' ) ).to.be.true;
	} );

	it( 'should remove attribute from the root element', () => {
		root.setAttribute( 'x', true );

		doc.applyOperation(
			new RootAttributeOperation(
				root,
				'x',
				true,
				null,
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.hasAttribute( 'x' ) ).to.be.false;
	} );

	it( 'should create a RootAttributeOperation as a reverse', () => {
		let operation = new RootAttributeOperation( root, 'x', 'old', 'new', doc.version );
		let reverse = operation.getReversed();

		expect( reverse ).to.be.an.instanceof( RootAttributeOperation );
		expect( reverse.baseVersion ).to.equal( 1 );
		expect( reverse.root ).to.equal( root );
		expect( reverse.key ).to.equal( 'x' );
		expect( reverse.oldValue ).to.equal( 'new' );
		expect( reverse.newValue ).to.equal( 'old' );
	} );

	it( 'should undo adding attribute by applying reverse operation', () => {
		let operation = new RootAttributeOperation(
			root,
			'isNew',
			null,
			true,
			doc.version
		);

		let reverse = operation.getReversed();

		doc.applyOperation( operation );
		doc.applyOperation( reverse );

		expect( doc.version ).to.equal( 2 );
		expect( root.hasAttribute( 'x' ) ).to.be.false;
	} );

	it( 'should undo changing attribute by applying reverse operation', () => {
		root.setAttribute( 'isNew', false );

		let operation = new RootAttributeOperation(
			root,
			'isNew',
			false,
			true,
			doc.version
		);

		let reverse = operation.getReversed();

		doc.applyOperation( operation );
		doc.applyOperation( reverse );

		expect( doc.version ).to.equal( 2 );
		expect( root.getAttribute( 'isNew' ) ).to.be.false;
	} );

	it( 'should undo remove attribute by applying reverse operation', () => {
		root.setAttribute( 'foo', true );

		let operation = new RootAttributeOperation(
			root,
			'foo',
			true,
			null,
			doc.version
		);

		let reverse = operation.getReversed();

		doc.applyOperation( operation );
		doc.applyOperation( reverse );

		expect( doc.version ).to.equal( 2 );
		expect( root.getAttribute( 'foo' ) ).to.be.true;
	} );

	it( 'should throw an error when one try to remove and the attribute does not exists', () => {
		expect( () => {
			doc.applyOperation(
				new RootAttributeOperation(
					root,
					'foo',
					true,
					null,
					doc.version
				)
			);
		} ).to.throw( CKEditorError, /operation-rootattribute-no-attr-to-remove/ );
	} );

	it( 'should throw an error when one try to insert and the attribute already exists', () => {
		root.setAttribute( 'x', 1 );

		expect( () => {
			doc.applyOperation(
				new RootAttributeOperation(
					root,
					'x',
					null,
					2,
					doc.version
				)
			);
		} ).to.throw( CKEditorError, /operation-rootattribute-attr-exists/ );
	} );

	it( 'should create a RootAttributeOperation with the same parameters when cloned', () => {
		let baseVersion = doc.version;

		let op = new RootAttributeOperation( root, 'foo', 'old', 'new', baseVersion );

		let clone = op.clone();

		// New instance rather than a pointer to the old instance.
		expect( clone ).not.to.be.equal( op );

		expect( clone ).to.be.instanceof( RootAttributeOperation );
		expect( clone.root ).to.equal( root );
		expect( clone.key ).to.equal( 'foo' );
		expect( clone.oldValue ).to.equal( 'old' );
		expect( clone.newValue ).to.equal( 'new' );
		expect( clone.baseVersion ).to.equal( baseVersion );
	} );
} );
