/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Model } from '../../../src/model/model.js';
import { ModelText } from '../../../src/model/text.js';
import { ModelElement } from '../../../src/model/element.js';
import { AttributeOperation } from '../../../src/model/operation/attributeoperation.js';
import { ModelPosition } from '../../../src/model/position.js';
import { ModelRange } from '../../../src/model/range.js';

import { count } from '@ckeditor/ckeditor5-utils';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'AttributeOperation', () => {
	let model, doc, root;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
		root = doc.createRoot();
	} );

	describe( 'type', () => {
		it( 'should be addAttribute for adding attribute', () => {
			const op = new AttributeOperation(
				new ModelRange( new ModelPosition( root, [ 0 ] ), new ModelPosition( root, [ 2 ] ) ),
				'key',
				null,
				'newValue',
				doc.version
			);

			expect( op.type ).toBe( 'addAttribute' );
		} );

		it( 'should be removeAttribute for removing attribute', () => {
			const op = new AttributeOperation(
				new ModelRange( new ModelPosition( root, [ 0 ] ), new ModelPosition( root, [ 2 ] ) ),
				'key',
				'oldValue',
				undefined, // `undefined` should also be accepted as a value, it is same as `null`.
				doc.version
			);

			expect( op.type ).toBe( 'removeAttribute' );
		} );

		it( 'should be changeAttribute for removing attribute', () => {
			const op = new AttributeOperation(
				new ModelRange( new ModelPosition( root, [ 0 ] ), new ModelPosition( root, [ 2 ] ) ),
				'key',
				'oldValue',
				'newValue',
				doc.version
			);

			expect( op.type ).toBe( 'changeAttribute' );
		} );
	} );

	it( 'should insert attribute to the set of nodes', () => {
		root._insertChild( 0, new ModelText( 'bar' ) );

		model.applyOperation(
			new AttributeOperation(
				new ModelRange( new ModelPosition( root, [ 0 ] ), new ModelPosition( root, [ 2 ] ) ),
				'isNew',
				undefined, // `undefined` should also be accepted as a value, it is same as `null`.
				true,
				doc.version
			)
		);

		expect( doc.version ).toBe( 1 );
		expect( root.maxOffset ).toBe( 3 );
		expect( root.getChild( 0 ).hasAttribute( 'isNew' ) ).toBe( true );
		expect( root.getChild( 0 ).data ).toBe( 'ba' );
		expect( root.getChild( 1 ).hasAttribute( 'isNew' ) ).toBe( false );
		expect( root.getChild( 1 ).data ).toBe( 'r' );
	} );

	it( 'should add attribute to the existing attributes', () => {
		root._insertChild( 0, new ModelText( 'x', { foo: true, bar: true } ) );

		model.applyOperation(
			new AttributeOperation(
				new ModelRange( new ModelPosition( root, [ 0 ] ), new ModelPosition( root, [ 1 ] ) ),
				'isNew',
				null,
				true,
				doc.version
			)
		);

		expect( doc.version ).toBe( 1 );
		expect( root.maxOffset ).toBe( 1 );
		expect( count( root.getChild( 0 ).getAttributes() ) ).toBe( 3 );
		expect( root.getChild( 0 ).hasAttribute( 'isNew' ) ).toBe( true );
		expect( root.getChild( 0 ).hasAttribute( 'foo' ) ).toBe( true );
		expect( root.getChild( 0 ).hasAttribute( 'bar' ) ).toBe( true );
	} );

	it( 'should change attribute to the set of nodes', () => {
		root._insertChild( 0, new ModelText( 'bar', { isNew: false } ) );

		model.applyOperation(
			new AttributeOperation(
				new ModelRange( new ModelPosition( root, [ 0 ] ), new ModelPosition( root, [ 2 ] ) ),
				'isNew',
				false,
				true,
				doc.version
			)
		);

		expect( doc.version ).toBe( 1 );
		expect( root.maxOffset ).toBe( 3 );
		expect( count( root.getChild( 0 ).getAttributes() ) ).toBe( 1 );
		expect( root.getChild( 0 ).getAttribute( 'isNew' ) ).toBe( true );
		expect( count( root.getChild( 1 ).getAttributes() ) ).toBe( 1 );
		expect( root.getChild( 1 ).getAttribute( 'isNew' ) ).toBe( false );
	} );

	it( 'should change attribute in the middle of existing attributes', () => {
		root._insertChild( 0, new ModelText( 'x', { foo: true, x: 1, bar: true } ) );

		model.applyOperation(
			new AttributeOperation(
				new ModelRange( new ModelPosition( root, [ 0 ] ), new ModelPosition( root, [ 1 ] ) ),
				'x',
				1,
				2,
				doc.version
			)
		);

		expect( doc.version ).toBe( 1 );
		expect( root.maxOffset ).toBe( 1 );
		expect( count( root.getChild( 0 ).getAttributes() ) ).toBe( 3 );
		expect( root.getChild( 0 ).getAttribute( 'foo' ) ).toBe( true );
		expect( root.getChild( 0 ).getAttribute( 'x' ) ).toBe( 2 );
		expect( root.getChild( 0 ).getAttribute( 'bar' ) ).toBe( true );
	} );

	it( 'should work correctly if old and new value are same', () => {
		root._insertChild( 0, new ModelText( 'bar', { foo: 'bar' } ) );

		model.applyOperation(
			new AttributeOperation(
				new ModelRange( new ModelPosition( root, [ 0 ] ), new ModelPosition( root, [ 2 ] ) ),
				'foo',
				'bar',
				'bar',
				doc.version
			)
		);

		expect( doc.version ).toBe( 1 );
		expect( root.childCount ).toBe( 1 );
		expect( count( root.getChild( 0 ).getAttributes() ) ).toBe( 1 );
		expect( root.getChild( 0 ).getAttribute( 'foo' ) ).toBe( 'bar' );
	} );

	it( 'should remove attribute', () => {
		root._insertChild( 0, new ModelText( 'x', { foo: true, x: true, bar: true } ) );

		model.applyOperation(
			new AttributeOperation(
				new ModelRange( new ModelPosition( root, [ 0 ] ), new ModelPosition( root, [ 1 ] ) ),
				'x',
				true,
				null,
				doc.version
			)
		);

		expect( doc.version ).toBe( 1 );
		expect( root.maxOffset ).toBe( 1 );
		expect( count( root.getChild( 0 ).getAttributes() ) ).toBe( 2 );
		expect( root.getChild( 0 ).hasAttribute( 'foo' ) ).toBe( true );
		expect( root.getChild( 0 ).hasAttribute( 'bar' ) ).toBe( true );
	} );

	describe( '_validate()', () => {
		it( 'should not throw for non-primitive attribute values', () => {
			root._insertChild( 0, new ModelText( 'x', { foo: [ 'bar', 'xyz' ] } ) );

			expect( () => {
				const operation = new AttributeOperation(
					new ModelRange( new ModelPosition( root, [ 0 ] ), new ModelPosition( root, [ 1 ] ) ),
					'foo',
					[ 'bar', 'xyz' ],
					true,
					doc.version
				);

				operation._validate();
			} ).not.toThrow( Error );
		} );

		it( 'should throw an error when one try to remove and the attribute does not exists', () => {
			root._insertChild( 0, new ModelText( 'x' ) );

			expectToThrowCKEditorError( () => {
				const operation = new AttributeOperation(
					new ModelRange( new ModelPosition( root, [ 0 ] ), new ModelPosition( root, [ 1 ] ) ),
					'foo',
					true,
					null,
					doc.version
				);

				operation._validate();
			}, /attribute-operation-wrong-old-value/, model );
		} );

		it( 'should throw an error when one try to insert and the attribute already exists', () => {
			root._insertChild( 0, new ModelText( 'x', { x: 1 } ) );

			expectToThrowCKEditorError( () => {
				const operation = new AttributeOperation(
					new ModelRange( new ModelPosition( root, [ 0 ] ), new ModelPosition( root, [ 1 ] ) ),
					'x',
					null,
					2,
					doc.version
				);

				operation._validate();
			}, /attribute-operation-attribute-exists/, model );
		} );

		it( 'should not throw when attribute value is the same', () => {
			root._insertChild( 0, new ModelText( 'x', { foo: true } ) );

			expect( () => {
				const operation = new AttributeOperation(
					new ModelRange( new ModelPosition( root, [ 0 ] ), new ModelPosition( root, [ 1 ] ) ),
					'foo',
					true,
					true,
					doc.version
				);

				operation._validate();
			} ).not.toThrow();
		} );

		it( 'should throw for a non-flat range', () => {
			root._insertChild( 0, [
				new ModelElement( 'paragraph', null, new ModelText( 'Foo' ) ),
				new ModelElement( 'paragraph', null, new ModelText( 'Bar' ) )
			] );

			expectToThrowCKEditorError( () => {
				const operation = new AttributeOperation(
					new ModelRange( new ModelPosition( root, [ 0, 1 ] ), new ModelPosition( root, [ 1, 1 ] ) ),
					'x',
					null,
					2,
					doc.version
				);

				operation._validate();
			}, /attribute-operation-range-not-flat/, model );
		} );
	} );

	it( 'should create an AttributeOperation as a reverse', () => {
		const range = new ModelRange( new ModelPosition( root, [ 0 ] ), new ModelPosition( root, [ 3 ] ) );
		const operation = new AttributeOperation( range, 'x', 'old', 'new', doc.version );
		const reverse = operation.getReversed();

		expect( reverse ).toBeInstanceOf( AttributeOperation );
		expect( reverse.baseVersion ).toBe( 1 );
		expect( reverse.range.isEqual( range ) ).toBe( true );
		expect( reverse.key ).toBe( 'x' );
		expect( reverse.oldValue ).toBe( 'new' );
		expect( reverse.newValue ).toBe( 'old' );
	} );

	it( 'should undo adding attribute by applying reverse operation', () => {
		root._insertChild( 0, new ModelText( 'bar' ) );

		const operation = new AttributeOperation(
			new ModelRange( new ModelPosition( root, [ 0 ] ), new ModelPosition( root, [ 3 ] ) ),
			'isNew',
			null,
			true,
			doc.version
		);

		const reverse = operation.getReversed();

		model.applyOperation( operation );
		model.applyOperation( reverse );

		expect( doc.version ).toBe( 2 );
		expect( root.maxOffset ).toBe( 3 );
		expect( count( root.getChild( 0 ).getAttributes() ) ).toBe( 0 );
	} );

	it( 'should undo changing attribute by applying reverse operation', () => {
		root._insertChild( 0, new ModelText( 'bar', { isNew: false } ) );

		const operation = new AttributeOperation(
			new ModelRange( new ModelPosition( root, [ 0 ] ), new ModelPosition( root, [ 3 ] ) ),
			'isNew',
			false,
			true,
			doc.version
		);

		const reverse = operation.getReversed();

		model.applyOperation( operation );
		model.applyOperation( reverse );

		expect( doc.version ).toBe( 2 );
		expect( root.maxOffset ).toBe( 3 );
		expect( count( root.getChild( 0 ).getAttributes() ) ).toBe( 1 );
		expect( root.getChild( 0 ).getAttribute( 'isNew' ) ).toBe( false );
	} );

	it( 'should undo remove attribute by applying reverse operation', () => {
		root._insertChild( 0, new ModelText( 'bar', { foo: true } ) );

		const operation = new AttributeOperation(
			new ModelRange( new ModelPosition( root, [ 0 ] ), new ModelPosition( root, [ 3 ] ) ),
			'foo',
			true,
			null,
			doc.version
		);

		const reverse = operation.getReversed();

		model.applyOperation( operation );
		model.applyOperation( reverse );

		expect( doc.version ).toBe( 2 );
		expect( root.maxOffset ).toBe( 3 );
		expect( count( root.getChild( 0 ).getAttributes() ) ).toBe( 1 );
		expect( root.getChild( 0 ).getAttribute( 'foo' ) ).toBe( true );
	} );

	it( 'should create an AttributeOperation with the same parameters when cloned', () => {
		const range = new ModelRange( new ModelPosition( root, [ 0 ] ), new ModelPosition( root, [ 1 ] ) );
		const baseVersion = doc.version;

		const op = new AttributeOperation( range, 'foo', 'old', 'new', baseVersion );

		const clone = op.clone();

		// New instance rather than a pointer to the old instance.
		expect( clone ).not.toBe( op );

		expect( clone ).toBeInstanceOf( AttributeOperation );
		expect( clone.range.isEqual( range ) ).toBe( true );
		expect( clone.key ).toBe( 'foo' );
		expect( clone.oldValue ).toBe( 'old' );
		expect( clone.newValue ).toBe( 'new' );
		expect( clone.baseVersion ).toBe( baseVersion );
	} );

	it( 'should merge characters in node list', () => {
		const attrA = { foo: 'a' };
		const attrB = { foo: 'b' };

		root._insertChild( 0, new ModelText( 'abc', attrA ) );
		root._insertChild( 1, new ModelText( 'xyz', attrB ) );

		model.applyOperation(
			new AttributeOperation(
				new ModelRange( new ModelPosition( root, [ 1 ] ), new ModelPosition( root, [ 3 ] ) ),
				'foo',
				'a',
				'b',
				doc.version
			)
		);

		expect( root.getChild( 0 ).data ).toBe( 'a' );
		expect( root.getChild( 1 ).data ).toBe( 'bcxyz' );
	} );

	describe( 'toJSON', () => {
		it( 'should create proper serialized object', () => {
			const range = new ModelRange( new ModelPosition( root, [ 0 ] ), new ModelPosition( root, [ 2 ] ) );
			const op = new AttributeOperation(
				range,
				'key',
				null,
				'newValue',
				doc.version
			);

			const serialized = op.toJSON();

			expect( serialized.__className ).toBe( 'AttributeOperation' );

			expect( serialized ).toEqual( {
				__className: 'AttributeOperation',
				baseVersion: 0,
				key: 'key',
				newValue: 'newValue',
				oldValue: null,
				range: range.toJSON()
			} );
		} );
	} );

	describe( 'fromJSON', () => {
		it( 'should create proper AttributeOperation from json object', () => {
			const range = new ModelRange( new ModelPosition( root, [ 0 ] ), new ModelPosition( root, [ 2 ] ) );
			const op = new AttributeOperation(
				range,
				'key',
				null,
				'newValue',
				doc.version
			);

			const serialized = op.toJSON();
			const deserialized = AttributeOperation.fromJSON( serialized, doc );

			expect( deserialized ).toEqual( op );
		} );
	} );
} );
