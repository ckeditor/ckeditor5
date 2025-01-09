/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Model from '../../../src/model/model.js';
import Text from '../../../src/model/text.js';
import Element from '../../../src/model/element.js';
import AttributeOperation from '../../../src/model/operation/attributeoperation.js';
import Position from '../../../src/model/position.js';
import Range from '../../../src/model/range.js';

import count from '@ckeditor/ckeditor5-utils/src/count.js';
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
				new Range( new Position( root, [ 0 ] ), new Position( root, [ 2 ] ) ),
				'key',
				null,
				'newValue',
				doc.version
			);

			expect( op.type ).to.equal( 'addAttribute' );
		} );

		it( 'should be removeAttribute for removing attribute', () => {
			const op = new AttributeOperation(
				new Range( new Position( root, [ 0 ] ), new Position( root, [ 2 ] ) ),
				'key',
				'oldValue',
				undefined, // `undefined` should also be accepted as a value, it is same as `null`.
				doc.version
			);

			expect( op.type ).to.equal( 'removeAttribute' );
		} );

		it( 'should be changeAttribute for removing attribute', () => {
			const op = new AttributeOperation(
				new Range( new Position( root, [ 0 ] ), new Position( root, [ 2 ] ) ),
				'key',
				'oldValue',
				'newValue',
				doc.version
			);

			expect( op.type ).to.equal( 'changeAttribute' );
		} );
	} );

	it( 'should insert attribute to the set of nodes', () => {
		root._insertChild( 0, new Text( 'bar' ) );

		model.applyOperation(
			new AttributeOperation(
				new Range( new Position( root, [ 0 ] ), new Position( root, [ 2 ] ) ),
				'isNew',
				undefined, // `undefined` should also be accepted as a value, it is same as `null`.
				true,
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 3 );
		expect( root.getChild( 0 ).hasAttribute( 'isNew' ) ).to.be.true;
		expect( root.getChild( 0 ).data ).to.equal( 'ba' );
		expect( root.getChild( 1 ).hasAttribute( 'isNew' ) ).to.be.false;
		expect( root.getChild( 1 ).data ).to.equal( 'r' );
	} );

	it( 'should add attribute to the existing attributes', () => {
		root._insertChild( 0, new Text( 'x', { foo: true, bar: true } ) );

		model.applyOperation(
			new AttributeOperation(
				new Range( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) ),
				'isNew',
				null,
				true,
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 1 );
		expect( count( root.getChild( 0 ).getAttributes() ) ).to.equal( 3 );
		expect( root.getChild( 0 ).hasAttribute( 'isNew' ) ).to.be.true;
		expect( root.getChild( 0 ).hasAttribute( 'foo' ) ).to.be.true;
		expect( root.getChild( 0 ).hasAttribute( 'bar' ) ).to.be.true;
	} );

	it( 'should change attribute to the set of nodes', () => {
		root._insertChild( 0, new Text( 'bar', { isNew: false } ) );

		model.applyOperation(
			new AttributeOperation(
				new Range( new Position( root, [ 0 ] ), new Position( root, [ 2 ] ) ),
				'isNew',
				false,
				true,
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 3 );
		expect( count( root.getChild( 0 ).getAttributes() ) ).to.equal( 1 );
		expect( root.getChild( 0 ).getAttribute( 'isNew' ) ).to.be.true;
		expect( count( root.getChild( 1 ).getAttributes() ) ).to.equal( 1 );
		expect( root.getChild( 1 ).getAttribute( 'isNew' ) ).to.be.false;
	} );

	it( 'should change attribute in the middle of existing attributes', () => {
		root._insertChild( 0, new Text( 'x', { foo: true, x: 1, bar: true } ) );

		model.applyOperation(
			new AttributeOperation(
				new Range( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) ),
				'x',
				1,
				2,
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 1 );
		expect( count( root.getChild( 0 ).getAttributes() ) ).to.equal( 3 );
		expect( root.getChild( 0 ).getAttribute( 'foo' ) ).to.be.true;
		expect( root.getChild( 0 ).getAttribute( 'x' ) ).to.equal( 2 );
		expect( root.getChild( 0 ).getAttribute( 'bar' ) ).to.be.true;
	} );

	it( 'should work correctly if old and new value are same', () => {
		root._insertChild( 0, new Text( 'bar', { foo: 'bar' } ) );

		model.applyOperation(
			new AttributeOperation(
				new Range( new Position( root, [ 0 ] ), new Position( root, [ 2 ] ) ),
				'foo',
				'bar',
				'bar',
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.childCount ).to.equal( 1 );
		expect( count( root.getChild( 0 ).getAttributes() ) ).to.equal( 1 );
		expect( root.getChild( 0 ).getAttribute( 'foo' ) ).to.equal( 'bar' );
	} );

	it( 'should remove attribute', () => {
		root._insertChild( 0, new Text( 'x', { foo: true, x: true, bar: true } ) );

		model.applyOperation(
			new AttributeOperation(
				new Range( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) ),
				'x',
				true,
				null,
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 1 );
		expect( count( root.getChild( 0 ).getAttributes() ) ).to.equal( 2 );
		expect( root.getChild( 0 ).hasAttribute( 'foo' ) ).to.be.true;
		expect( root.getChild( 0 ).hasAttribute( 'bar' ) ).to.be.true;
	} );

	describe( '_validate()', () => {
		it( 'should not throw for non-primitive attribute values', () => {
			root._insertChild( 0, new Text( 'x', { foo: [ 'bar', 'xyz' ] } ) );

			expect( () => {
				const operation = new AttributeOperation(
					new Range( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) ),
					'foo',
					[ 'bar', 'xyz' ],
					true,
					doc.version
				);

				operation._validate();
			} ).to.not.throw( Error );
		} );

		it( 'should throw an error when one try to remove and the attribute does not exists', () => {
			root._insertChild( 0, new Text( 'x' ) );

			expectToThrowCKEditorError( () => {
				const operation = new AttributeOperation(
					new Range( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) ),
					'foo',
					true,
					null,
					doc.version
				);

				operation._validate();
			}, /attribute-operation-wrong-old-value/, model );
		} );

		it( 'should throw an error when one try to insert and the attribute already exists', () => {
			root._insertChild( 0, new Text( 'x', { x: 1 } ) );

			expectToThrowCKEditorError( () => {
				const operation = new AttributeOperation(
					new Range( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) ),
					'x',
					null,
					2,
					doc.version
				);

				operation._validate();
			}, /attribute-operation-attribute-exists/, model );
		} );

		it( 'should not throw when attribute value is the same', () => {
			root._insertChild( 0, new Text( 'x', { foo: true } ) );

			expect( () => {
				const operation = new AttributeOperation(
					new Range( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) ),
					'foo',
					true,
					true,
					doc.version
				);

				operation._validate();
			} ).to.not.throw();
		} );

		it( 'should throw for a non-flat range', () => {
			root._insertChild( 0, [
				new Element( 'paragraph', null, new Text( 'Foo' ) ),
				new Element( 'paragraph', null, new Text( 'Bar' ) )
			] );

			expectToThrowCKEditorError( () => {
				const operation = new AttributeOperation(
					new Range( new Position( root, [ 0, 1 ] ), new Position( root, [ 1, 1 ] ) ),
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
		const range = new Range( new Position( root, [ 0 ] ), new Position( root, [ 3 ] ) );
		const operation = new AttributeOperation( range, 'x', 'old', 'new', doc.version );
		const reverse = operation.getReversed();

		expect( reverse ).to.be.an.instanceof( AttributeOperation );
		expect( reverse.baseVersion ).to.equal( 1 );
		expect( reverse.range.isEqual( range ) ).to.be.true;
		expect( reverse.key ).to.equal( 'x' );
		expect( reverse.oldValue ).to.equal( 'new' );
		expect( reverse.newValue ).to.equal( 'old' );
	} );

	it( 'should undo adding attribute by applying reverse operation', () => {
		root._insertChild( 0, new Text( 'bar' ) );

		const operation = new AttributeOperation(
			new Range( new Position( root, [ 0 ] ), new Position( root, [ 3 ] ) ),
			'isNew',
			null,
			true,
			doc.version
		);

		const reverse = operation.getReversed();

		model.applyOperation( operation );
		model.applyOperation( reverse );

		expect( doc.version ).to.equal( 2 );
		expect( root.maxOffset ).to.equal( 3 );
		expect( count( root.getChild( 0 ).getAttributes() ) ).to.equal( 0 );
	} );

	it( 'should undo changing attribute by applying reverse operation', () => {
		root._insertChild( 0, new Text( 'bar', { isNew: false } ) );

		const operation = new AttributeOperation(
			new Range( new Position( root, [ 0 ] ), new Position( root, [ 3 ] ) ),
			'isNew',
			false,
			true,
			doc.version
		);

		const reverse = operation.getReversed();

		model.applyOperation( operation );
		model.applyOperation( reverse );

		expect( doc.version ).to.equal( 2 );
		expect( root.maxOffset ).to.equal( 3 );
		expect( count( root.getChild( 0 ).getAttributes() ) ).to.equal( 1 );
		expect( root.getChild( 0 ).getAttribute( 'isNew' ) ).to.be.false;
	} );

	it( 'should undo remove attribute by applying reverse operation', () => {
		root._insertChild( 0, new Text( 'bar', { foo: true } ) );

		const operation = new AttributeOperation(
			new Range( new Position( root, [ 0 ] ), new Position( root, [ 3 ] ) ),
			'foo',
			true,
			null,
			doc.version
		);

		const reverse = operation.getReversed();

		model.applyOperation( operation );
		model.applyOperation( reverse );

		expect( doc.version ).to.equal( 2 );
		expect( root.maxOffset ).to.equal( 3 );
		expect( count( root.getChild( 0 ).getAttributes() ) ).to.equal( 1 );
		expect( root.getChild( 0 ).getAttribute( 'foo' ) ).to.be.true;
	} );

	it( 'should create an AttributeOperation with the same parameters when cloned', () => {
		const range = new Range( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) );
		const baseVersion = doc.version;

		const op = new AttributeOperation( range, 'foo', 'old', 'new', baseVersion );

		const clone = op.clone();

		// New instance rather than a pointer to the old instance.
		expect( clone ).not.to.equal( op );

		expect( clone ).to.be.instanceof( AttributeOperation );
		expect( clone.range.isEqual( range ) ).to.be.true;
		expect( clone.key ).to.equal( 'foo' );
		expect( clone.oldValue ).to.equal( 'old' );
		expect( clone.newValue ).to.equal( 'new' );
		expect( clone.baseVersion ).to.equal( baseVersion );
	} );

	it( 'should merge characters in node list', () => {
		const attrA = { foo: 'a' };
		const attrB = { foo: 'b' };

		root._insertChild( 0, new Text( 'abc', attrA ) );
		root._insertChild( 1, new Text( 'xyz', attrB ) );

		model.applyOperation(
			new AttributeOperation(
				new Range( new Position( root, [ 1 ] ), new Position( root, [ 3 ] ) ),
				'foo',
				'a',
				'b',
				doc.version
			)
		);

		expect( root.getChild( 0 ).data ).to.equal( 'a' );
		expect( root.getChild( 1 ).data ).to.equal( 'bcxyz' );
	} );

	describe( 'toJSON', () => {
		it( 'should create proper serialized object', () => {
			const range = new Range( new Position( root, [ 0 ] ), new Position( root, [ 2 ] ) );
			const op = new AttributeOperation(
				range,
				'key',
				null,
				'newValue',
				doc.version
			);

			const serialized = op.toJSON();

			expect( serialized.__className ).to.equal( 'AttributeOperation' );

			expect( serialized ).to.deep.equal( {
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
			const range = new Range( new Position( root, [ 0 ] ), new Position( root, [ 2 ] ) );
			const op = new AttributeOperation(
				range,
				'key',
				null,
				'newValue',
				doc.version
			);

			const serialized = op.toJSON();
			const deserialized = AttributeOperation.fromJSON( serialized, doc );

			expect( deserialized ).to.deep.equal( op );
		} );
	} );
} );
