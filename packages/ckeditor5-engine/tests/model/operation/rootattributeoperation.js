/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Model } from '../../../src/model/model.js';
import { ModelDocumentFragment } from '../../../src/model/documentfragment.js';
import { ModelElement } from '../../../src/model/element.js';
import { RootAttributeOperation } from '../../../src/model/operation/rootattributeoperation.js';
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

			expect( op.type ).toBe( 'addRootAttribute' );
		} );

		it( 'should be removeRootAttribute for removing attribute', () => {
			const op = new RootAttributeOperation(
				root,
				'key',
				'oldValue',
				null,
				doc.version
			);

			expect( op.type ).toBe( 'removeRootAttribute' );
		} );

		it( 'should be changeRootAttribute for removing attribute', () => {
			const op = new RootAttributeOperation(
				root,
				'key',
				'oldValue',
				'newValue',
				doc.version
			);

			expect( op.type ).toBe( 'changeRootAttribute' );
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

		expect( doc.version ).toBe( 1 );
		expect( root.hasAttribute( 'isNew' ) ).toBe( true );
	} );

	it( 'should return rootElement on affectedSelectable', () => {
		const op = new RootAttributeOperation( root, 'isNew', false, true, doc.version );
		expect( op.affectedSelectable ).toBe( root );
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

		expect( doc.version ).toBe( 1 );
		expect( root.getAttribute( 'isNew' ) ).toBe( true );
	} );

	it( 'should change attribute when old value is a deep-equal object (different reference)', () => {
		root._setAttribute( 'data', { foo: [ 1, 2 ] } );

		model.applyOperation(
			new RootAttributeOperation(
				root,
				'data',
				{ foo: [ 1, 2 ] },
				{ foo: [ 3, 4 ] },
				doc.version
			)
		);

		expect( doc.version ).toBe( 1 );
		expect( root.getAttribute( 'data' ) ).toEqual( { foo: [ 3, 4 ] } );
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

		expect( doc.version ).toBe( 1 );
		expect( root.hasAttribute( 'x' ) ).toBe( false );
	} );

	it( 'should set oldValue and newValue to null if undefined was passed', () => {
		const op = new RootAttributeOperation(
			root,
			'x',
			undefined,
			undefined,
			doc.version
		);

		expect( op.oldValue ).toBeNull();
		expect( op.newValue ).toBeNull();
	} );

	it( 'should create a RootAttributeOperation as a reverse', () => {
		const operation = new RootAttributeOperation( root, 'x', 'old', 'new', doc.version );
		const reverse = operation.getReversed();

		expect( reverse ).toBeInstanceOf( RootAttributeOperation );
		expect( reverse.baseVersion ).toBe( 1 );
		expect( reverse.root ).toBe( root );
		expect( reverse.key ).toBe( 'x' );
		expect( reverse.oldValue ).toBe( 'new' );
		expect( reverse.newValue ).toBe( 'old' );
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

		expect( doc.version ).toBe( 2 );
		expect( root.hasAttribute( 'x' ) ).toBe( false );
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

		expect( doc.version ).toBe( 2 );
		expect( root.getAttribute( 'isNew' ) ).toBe( false );
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

		expect( doc.version ).toBe( 2 );
		expect( root.getAttribute( 'foo' ) ).toBe( true );
	} );

	describe( '_validate()', () => {
		it( 'should throw an error when trying to change non-root element', () => {
			const child = new ModelElement( 'p' );
			const parent = new ModelElement( 'p' );
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
					new ModelDocumentFragment(),
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

		it( 'should not throw when old value is a deep-equal object (different reference)', () => {
			root._setAttribute( 'foo', { bar: 'baz', nested: { x: 1 } } );

			const op = new RootAttributeOperation(
				root,
				'foo',
				{ bar: 'baz', nested: { x: 1 } },
				'newValue',
				doc.version
			);

			expect( () => op._validate() ).not.toThrow();
		} );

		it( 'should not throw when old value is a deep-equal array (different reference)', () => {
			root._setAttribute( 'foo', [ 1, { a: 2 }, [ 3 ] ] );

			const op = new RootAttributeOperation(
				root,
				'foo',
				[ 1, { a: 2 }, [ 3 ] ],
				null,
				doc.version
			);

			expect( () => op._validate() ).not.toThrow();
		} );

		it( 'should throw when old value is an object that is not deep-equal to current value', () => {
			root._setAttribute( 'foo', { bar: 'baz' } );

			expectToThrowCKEditorError( () => {
				const op = new RootAttributeOperation(
					root,
					'foo',
					{ bar: 'different' },
					'newValue',
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
		expect( clone ).not.toBe( op );

		expect( clone ).toBeInstanceOf( RootAttributeOperation );
		expect( clone.root ).toBe( root );
		expect( clone.key ).toBe( 'foo' );
		expect( clone.oldValue ).toBe( 'old' );
		expect( clone.newValue ).toBe( 'new' );
		expect( clone.baseVersion ).toBe( baseVersion );
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

			expect( serialized.__className ).toBe( 'RootAttributeOperation' );
			expect( serialized ).toEqual( {
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

			expect( deserialized ).toEqual( op );
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
