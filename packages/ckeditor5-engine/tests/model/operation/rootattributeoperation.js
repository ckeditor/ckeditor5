/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Document from '../../../src/model/document';
import RootAttributeOperation from '../../../src/model/operation/rootattributeoperation';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import { jsonParseStringify, wrapInDelta } from '../../../tests/model/_utils/utils';

describe( 'RootAttributeOperation', () => {
	let doc, root;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot();
	} );

	describe( 'type', () => {
		it( 'should be addRootAttribute for adding attribute', () => {
			const op = new RootAttributeOperation(
				root,
				'key',
				null,
				'newValue',
				doc.version
			);

			expect( op.type ).to.equal( 'addRootAttribute' );
		} );

		it( 'should be removeRootAttribute for removing attribute', () => {
			const op = new RootAttributeOperation(
				root,
				'key',
				'oldValue',
				null,
				doc.version
			);

			expect( op.type ).to.equal( 'removeRootAttribute' );
		} );

		it( 'should be changeRootAttribute for removing attribute', () => {
			const op = new RootAttributeOperation(
				root,
				'key',
				'oldValue',
				'newValue',
				doc.version
			);

			expect( op.type ).to.equal( 'changeRootAttribute' );
		} );
	} );

	it( 'should add attribute on the root element', () => {
		doc.applyOperation( wrapInDelta(
			new RootAttributeOperation(
				root,
				'isNew',
				null,
				true,
				doc.version
			)
		) );

		expect( doc.version ).to.equal( 1 );
		expect( root.hasAttribute( 'isNew' ) ).to.be.true;
	} );

	it( 'should change attribute on the root element', () => {
		root.setAttribute( 'isNew', false );

		doc.applyOperation( wrapInDelta(
			new RootAttributeOperation(
				root,
				'isNew',
				false,
				true,
				doc.version
			)
		) );

		expect( doc.version ).to.equal( 1 );
		expect( root.getAttribute( 'isNew' ) ).to.be.true;
	} );

	it( 'should remove attribute from the root element', () => {
		root.setAttribute( 'x', true );

		doc.applyOperation( wrapInDelta(
			new RootAttributeOperation(
				root,
				'x',
				true,
				null,
				doc.version
			)
		) );

		expect( doc.version ).to.equal( 1 );
		expect( root.hasAttribute( 'x' ) ).to.be.false;
	} );

	it( 'should create a RootAttributeOperation as a reverse', () => {
		const operation = new RootAttributeOperation( root, 'x', 'old', 'new', doc.version );
		const reverse = operation.getReversed();

		expect( reverse ).to.be.an.instanceof( RootAttributeOperation );
		expect( reverse.baseVersion ).to.equal( 1 );
		expect( reverse.root ).to.equal( root );
		expect( reverse.key ).to.equal( 'x' );
		expect( reverse.oldValue ).to.equal( 'new' );
		expect( reverse.newValue ).to.equal( 'old' );
	} );

	it( 'should undo adding attribute by applying reverse operation', () => {
		const operation = new RootAttributeOperation(
			root,
			'isNew',
			null,
			true,
			doc.version
		);

		const reverse = operation.getReversed();

		doc.applyOperation( wrapInDelta( operation ) );
		doc.applyOperation( wrapInDelta( reverse ) );

		expect( doc.version ).to.equal( 2 );
		expect( root.hasAttribute( 'x' ) ).to.be.false;
	} );

	it( 'should undo changing attribute by applying reverse operation', () => {
		root.setAttribute( 'isNew', false );

		const operation = new RootAttributeOperation(
			root,
			'isNew',
			false,
			true,
			doc.version
		);

		const reverse = operation.getReversed();

		doc.applyOperation( wrapInDelta( operation ) );
		doc.applyOperation( wrapInDelta( reverse ) );

		expect( doc.version ).to.equal( 2 );
		expect( root.getAttribute( 'isNew' ) ).to.be.false;
	} );

	it( 'should undo remove attribute by applying reverse operation', () => {
		root.setAttribute( 'foo', true );

		const operation = new RootAttributeOperation(
			root,
			'foo',
			true,
			null,
			doc.version
		);

		const reverse = operation.getReversed();

		doc.applyOperation( wrapInDelta( operation ) );
		doc.applyOperation( wrapInDelta( reverse ) );

		expect( doc.version ).to.equal( 2 );
		expect( root.getAttribute( 'foo' ) ).to.be.true;
	} );

	it( 'should throw an error when one try to remove and the attribute does not exists', () => {
		expect( () => {
			doc.applyOperation( wrapInDelta(
				new RootAttributeOperation(
					root,
					'foo',
					true,
					null,
					doc.version
				)
			) );
		} ).to.throw( CKEditorError, /rootattribute-operation-wrong-old-value/ );
	} );

	it( 'should throw an error when one try to insert and the attribute already exists', () => {
		root.setAttribute( 'x', 1 );

		expect( () => {
			doc.applyOperation( wrapInDelta(
				new RootAttributeOperation(
					root,
					'x',
					null,
					2,
					doc.version
				)
			) );
		} ).to.throw( CKEditorError, /rootattribute-operation-attribute-exists/ );
	} );

	it( 'should create a RootAttributeOperation with the same parameters when cloned', () => {
		const baseVersion = doc.version;

		const op = new RootAttributeOperation( root, 'foo', 'old', 'new', baseVersion );

		const clone = op.clone();

		// New instance rather than a pointer to the old instance.
		expect( clone ).not.to.be.equal( op );

		expect( clone ).to.be.instanceof( RootAttributeOperation );
		expect( clone.root ).to.equal( root );
		expect( clone.key ).to.equal( 'foo' );
		expect( clone.oldValue ).to.equal( 'old' );
		expect( clone.newValue ).to.equal( 'new' );
		expect( clone.baseVersion ).to.equal( baseVersion );
	} );

	describe( 'toJSON', () => {
		it( 'should create proper serialized object', () => {
			const op = new RootAttributeOperation(
				root,
				'key',
				null,
				'newValue',
				doc.version
			);

			const serialized = jsonParseStringify( op );

			expect( serialized.__className ).to.equal( 'engine.model.operation.RootAttributeOperation' );
			expect( serialized ).to.deep.equal( {
				__className: 'engine.model.operation.RootAttributeOperation',
				baseVersion: 0,
				key: 'key',
				newValue: 'newValue',
				oldValue: null,
				root: 'main'
			} );
		} );
	} );

	describe( 'fromJSON', () => {
		it( 'should create proper RootAttributeOperation from json object', () => {
			const op = new RootAttributeOperation( root, 'key', null, 'newValue', doc.version );

			const serialized = jsonParseStringify( op );
			const deserialized = RootAttributeOperation.fromJSON( serialized, doc );

			expect( deserialized ).to.deep.equal( op );
		} );

		it( 'should throw an error when root does not exists', () => {
			const op = new RootAttributeOperation(
				root,
				'key',
				null,
				'newValue',
				doc.version
			);

			const serialized = jsonParseStringify( op );
			serialized.root = 'no-root';

			expect( () => {
				RootAttributeOperation.fromJSON( serialized, doc );
			} ).to.throw( CKEditorError, /rootattribute-operation-fromjson-no-roo/ );
		} );
	} );
} );
