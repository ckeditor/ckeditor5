/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Model from '../../../src/model/model.js';
import DocumentFragment from '../../../src/model/documentfragment.js';
import Element from '../../../src/model/element.js';
import RootAttributeOperation from '../../../src/model/operation/rootattributeoperation.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'RootAttributeOperation', () => {
	let model, doc, root;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
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
		model.applyOperation(
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

	it( 'should return rootElement on affectedSelectable', () => {
		const op = new RootAttributeOperation( root, 'isNew', false, true, doc.version );
		expect( op.affectedSelectable ).to.equal( root );
	} );

	it( 'should change attribute on the root element', () => {
		root._setAttribute( 'isNew', false );

		model.applyOperation(
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
		root._setAttribute( 'x', true );

		model.applyOperation(
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

	it( 'should set oldValue and newValue to null if undefined was passed', () => {
		const op = new RootAttributeOperation(
			root,
			'x',
			undefined,
			undefined,
			doc.version
		);

		expect( op.oldValue ).to.be.null;
		expect( op.newValue ).to.be.null;
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

		model.applyOperation( operation );
		model.applyOperation( reverse );

		expect( doc.version ).to.equal( 2 );
		expect( root.hasAttribute( 'x' ) ).to.be.false;
	} );

	it( 'should undo changing attribute by applying reverse operation', () => {
		root._setAttribute( 'isNew', false );

		const operation = new RootAttributeOperation(
			root,
			'isNew',
			false,
			true,
			doc.version
		);

		const reverse = operation.getReversed();

		model.applyOperation( operation );
		model.applyOperation( reverse );

		expect( doc.version ).to.equal( 2 );
		expect( root.getAttribute( 'isNew' ) ).to.be.false;
	} );

	it( 'should undo remove attribute by applying reverse operation', () => {
		root._setAttribute( 'foo', true );

		const operation = new RootAttributeOperation(
			root,
			'foo',
			true,
			null,
			doc.version
		);

		const reverse = operation.getReversed();

		model.applyOperation( operation );
		model.applyOperation( reverse );

		expect( doc.version ).to.equal( 2 );
		expect( root.getAttribute( 'foo' ) ).to.be.true;
	} );

	describe( '_validate()', () => {
		it( 'should throw an error when trying to change non-root element', () => {
			const child = new Element( 'p' );
			const parent = new Element( 'p' );
			parent._appendChild( child );

			expectToThrowCKEditorError( () => {
				const op = new RootAttributeOperation(
					child,
					'foo',
					null,
					'bar',
					null
				);

				op._validate();
			}, /rootattribute-operation-not-a-root/ );
		} );

		it( 'should throw an error when trying to change document fragment', () => {
			expectToThrowCKEditorError( () => {
				const op = new RootAttributeOperation(
					new DocumentFragment(),
					'foo',
					null,
					'bar',
					null
				);

				op._validate();
			}, /rootattribute-operation-not-a-root/ );
		} );

		it( 'should throw an error when trying to remove an attribute that does not exists', () => {
			expectToThrowCKEditorError( () => {
				const op = new RootAttributeOperation(
					root,
					'foo',
					true,
					null,
					doc.version
				);

				op._validate();
			}, /rootattribute-operation-wrong-old-value/, model );
		} );

		it( 'should throw an error when trying to add an attribute that already exists', () => {
			root._setAttribute( 'x', 1 );

			expectToThrowCKEditorError( () => {
				const op = new RootAttributeOperation(
					root,
					'x',
					null,
					2,
					doc.version
				);

				op._validate();
			}, /rootattribute-operation-attribute-exists/, model );
		} );
	} );

	it( 'should create a RootAttributeOperation with the same parameters when cloned', () => {
		const baseVersion = doc.version;

		const op = new RootAttributeOperation( root, 'foo', 'old', 'new', baseVersion );

		const clone = op.clone();

		// New instance rather than a pointer to the old instance.
		expect( clone ).not.to.equal( op );

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

			const serialized = op.toJSON();

			expect( serialized.__className ).to.equal( 'RootAttributeOperation' );
			expect( serialized ).to.deep.equal( {
				__className: 'RootAttributeOperation',
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

			const serialized = op.toJSON();
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

			const serialized = op.toJSON();

			serialized.root = 'no-root';

			expectToThrowCKEditorError( () => {
				RootAttributeOperation.fromJSON( serialized, doc );
			}, /rootattribute-operation-fromjson-no-root/ );
		} );
	} );
} );
