/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Document from '../../../src/model/document';
import Element from '../../../src/model/element';
import Text from '../../../src/model/text';
import AttributeOperation from '../../../src/model/operation/attributeoperation';
import Position from '../../../src/model/position';
import Range from '../../../src/model/range';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import count from '@ckeditor/ckeditor5-utils/src/count';
import { jsonParseStringify, wrapInDelta } from '../../../tests/model/_utils/utils';

describe( 'AttributeOperation', () => {
	let doc, root;

	beforeEach( () => {
		doc = new Document();
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
		root.insertChildren( 0, new Text( 'bar' ) );

		doc.applyOperation( wrapInDelta(
			new AttributeOperation(
				new Range( new Position( root, [ 0 ] ), new Position( root, [ 2 ] ) ),
				'isNew',
				undefined, // `undefined` should also be accepted as a value, it is same as `null`.
				true,
				doc.version
			)
		) );

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 3 );
		expect( root.getChild( 0 ).hasAttribute( 'isNew' ) ).to.be.true;
		expect( root.getChild( 0 ).data ).to.equal( 'ba' );
		expect( root.getChild( 1 ).hasAttribute( 'isNew' ) ).to.be.false;
		expect( root.getChild( 1 ).data ).to.equal( 'r' );
	} );

	it( 'should add attribute to the existing attributes', () => {
		root.insertChildren( 0, new Text( 'x', { foo: true, bar: true } ) );

		doc.applyOperation( wrapInDelta(
			new AttributeOperation(
				new Range( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) ),
				'isNew',
				null,
				true,
				doc.version
			)
		) );

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 1 );
		expect( count( root.getChild( 0 ).getAttributes() ) ).to.equal( 3 );
		expect( root.getChild( 0 ).hasAttribute( 'isNew' ) ).to.be.true;
		expect( root.getChild( 0 ).hasAttribute( 'foo' ) ).to.be.true;
		expect( root.getChild( 0 ).hasAttribute( 'bar' ) ).to.be.true;
	} );

	it( 'should change attribute to the set of nodes', () => {
		root.insertChildren( 0, new Text( 'bar', { isNew: false } ) );

		doc.applyOperation( wrapInDelta(
			new AttributeOperation(
				new Range( new Position( root, [ 0 ] ), new Position( root, [ 2 ] ) ),
				'isNew',
				false,
				true,
				doc.version
			)
		) );

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 3 );
		expect( count( root.getChild( 0 ).getAttributes() ) ).to.equal( 1 );
		expect( root.getChild( 0 ).getAttribute( 'isNew' ) ).to.be.true;
		expect( count( root.getChild( 1 ).getAttributes() ) ).to.equal( 1 );
		expect( root.getChild( 1 ).getAttribute( 'isNew' ) ).to.be.false;
	} );

	it( 'should change attribute in the middle of existing attributes', () => {
		root.insertChildren( 0, new Text( 'x', { foo: true, x: 1, bar: true } ) );

		doc.applyOperation( wrapInDelta(
			new AttributeOperation(
				new Range( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) ),
				'x',
				1,
				2,
				doc.version
			)
		) );

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 1 );
		expect( count( root.getChild( 0 ).getAttributes() ) ).to.equal( 3 );
		expect( root.getChild( 0 ).getAttribute( 'foo' ) ).to.be.true;
		expect( root.getChild( 0 ).getAttribute( 'x' ) ).to.equal( 2 );
		expect( root.getChild( 0 ).getAttribute( 'bar' ) ).to.be.true;
	} );

	it( 'should remove attribute', () => {
		root.insertChildren( 0, new Text( 'x', { foo: true, x: true, bar: true } ) );

		doc.applyOperation( wrapInDelta(
			new AttributeOperation(
				new Range( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) ),
				'x',
				true,
				null,
				doc.version
			)
		) );

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 1 );
		expect( count( root.getChild( 0 ).getAttributes() ) ).to.equal( 2 );
		expect( root.getChild( 0 ).hasAttribute( 'foo' ) ).to.be.true;
		expect( root.getChild( 0 ).hasAttribute( 'bar' ) ).to.be.true;
	} );

	it( 'should not throw for non-primitive attribute values', () => {
		root.insertChildren( 0, new Text( 'x', { foo: [ 'bar', 'xyz' ] } ) );

		expect( () => {
			doc.applyOperation( wrapInDelta(
				new AttributeOperation(
					new Range( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) ),
					'foo',
					[ 'bar', 'xyz' ],
					true,
					doc.version
				)
			) );
		} ).to.not.throw( Error );
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
		root.insertChildren( 0, new Text( 'bar' ) );

		const operation = new AttributeOperation(
			new Range( new Position( root, [ 0 ] ), new Position( root, [ 3 ] ) ),
			'isNew',
			null,
			true,
			doc.version
		);

		const reverse = operation.getReversed();

		doc.applyOperation( wrapInDelta( operation ) );
		doc.applyOperation( wrapInDelta( reverse ) );

		expect( doc.version ).to.equal( 2 );
		expect( root.maxOffset ).to.equal( 3 );
		expect( count( root.getChild( 0 ).getAttributes() ) ).to.equal( 0 );
	} );

	it( 'should not set attribute of element if change range starts in the middle of that element', () => {
		const eleA = new Element( 'a', [], new Text( 'abc' ) );
		const eleB = new Element( 'b', [], new Text( 'xyz' ) );

		root.insertChildren( 0, [ eleA, eleB ] );

		doc.applyOperation( wrapInDelta(
			new AttributeOperation(
				new Range( new Position( root, [ 0, 2 ] ), new Position( root, [ 1, 2 ] ) ),
				'foo',
				null,
				true,
				doc.version
			)
		) );

		expect( root.getChild( 0 ).hasAttribute( 'foo' ) ).to.be.false;
	} );

	it( 'should not remove attribute of element if change range starts in the middle of that element', () => {
		const fooAttr = { foo: true };

		const eleA = new Element( 'a', fooAttr, new Text( 'abc' ) );
		const eleB = new Element( 'b', fooAttr, new Text( 'xyz' ) );

		root.insertChildren( 0, [ eleA, eleB ] );

		doc.applyOperation( wrapInDelta(
			new AttributeOperation(
				new Range( new Position( root, [ 0, 3 ] ), new Position( root, [ 1, 0 ] ) ),
				'foo',
				true,
				null,
				doc.version
			)
		) );

		expect( root.getChild( 0 ).hasAttribute( 'foo' ) ).to.be.true;
	} );

	it( 'should undo changing attribute by applying reverse operation', () => {
		root.insertChildren( 0, new Text( 'bar', { isNew: false } ) );

		const operation = new AttributeOperation(
			new Range( new Position( root, [ 0 ] ), new Position( root, [ 3 ] ) ),
			'isNew',
			false,
			true,
			doc.version
		);

		const reverse = operation.getReversed();

		doc.applyOperation( wrapInDelta( operation ) );
		doc.applyOperation( wrapInDelta( reverse ) );

		expect( doc.version ).to.equal( 2 );
		expect( root.maxOffset ).to.equal( 3 );
		expect( count( root.getChild( 0 ).getAttributes() ) ).to.equal( 1 );
		expect( root.getChild( 0 ).getAttribute( 'isNew' ) ).to.be.false;
	} );

	it( 'should undo remove attribute by applying reverse operation', () => {
		root.insertChildren( 0, new Text( 'bar', { foo: true } ) );

		const operation = new AttributeOperation(
			new Range( new Position( root, [ 0 ] ), new Position( root, [ 3 ] ) ),
			'foo',
			true,
			null,
			doc.version
		);

		const reverse = operation.getReversed();

		doc.applyOperation( wrapInDelta( operation ) );
		doc.applyOperation( wrapInDelta( reverse ) );

		expect( doc.version ).to.equal( 2 );
		expect( root.maxOffset ).to.equal( 3 );
		expect( count( root.getChild( 0 ).getAttributes() ) ).to.equal( 1 );
		expect( root.getChild( 0 ).getAttribute( 'foo' ) ).to.be.true;
	} );

	it( 'should throw an error when one try to remove and the attribute does not exists', () => {
		root.insertChildren( 0, new Text( 'x' ) );

		expect( () => {
			doc.applyOperation( wrapInDelta(
				new AttributeOperation(
					new Range( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) ),
					'foo',
					true,
					null,
					doc.version
				)
			) );
		} ).to.throw( CKEditorError, /attribute-operation-wrong-old-value/ );
	} );

	it( 'should throw an error when one try to insert and the attribute already exists', () => {
		root.insertChildren( 0, new Text( 'x', { x: 1 } ) );

		expect( () => {
			doc.applyOperation( wrapInDelta(
				new AttributeOperation(
					new Range( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) ),
					'x',
					null,
					2,
					doc.version
				)
			) );
		} ).to.throw( CKEditorError, /attribute-operation-attribute-exists/ );
	} );

	it( 'should create an AttributeOperation with the same parameters when cloned', () => {
		const range = new Range( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) );
		const baseVersion = doc.version;

		const op = new AttributeOperation( range, 'foo', 'old', 'new', baseVersion );

		const clone = op.clone();

		// New instance rather than a pointer to the old instance.
		expect( clone ).not.to.be.equal( op );

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

		root.insertChildren( 0, new Text( 'abc', attrA ) );
		root.insertChildren( 1, new Text( 'xyz', attrB ) );

		doc.applyOperation( wrapInDelta(
			new AttributeOperation(
				new Range( new Position( root, [ 1 ] ), new Position( root, [ 3 ] ) ),
				'foo',
				'a',
				'b',
				doc.version
			) )
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

			const serialized = jsonParseStringify( op );

			expect( serialized.__className ).to.equal( 'engine.model.operation.AttributeOperation' );
			expect( serialized ).to.deep.equal( {
				__className: 'engine.model.operation.AttributeOperation',
				baseVersion: 0,
				key: 'key',
				newValue: 'newValue',
				oldValue: null,
				range: jsonParseStringify( range )
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

			const serialized = jsonParseStringify( op );
			const deserialized = AttributeOperation.fromJSON( serialized, doc );

			expect( deserialized ).to.deep.equal( op );
		} );
	} );
} );
