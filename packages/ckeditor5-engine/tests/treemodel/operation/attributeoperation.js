/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel, operation */

'use strict';

import Document from '/ckeditor5/core/treemodel/document.js';
import Element from '/ckeditor5/core/treemodel/element.js';
import AttributeOperation from '/ckeditor5/core/treemodel/operation/attributeoperation.js';
import Position from '/ckeditor5/core/treemodel/position.js';
import Range from '/ckeditor5/core/treemodel/range.js';
import Attribute from '/ckeditor5/core/treemodel/attribute.js';
import Text from '/ckeditor5/core/treemodel/text.js';
import CKEditorError from '/ckeditor5/core/ckeditorerror.js';

describe( 'AttributeOperation', () => {
	let doc, root;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );
	} );

	it( 'should have proper type', () => {
		const op = new AttributeOperation(
			new Range( new Position( root, [ 0 ] ), new Position( root, [ 2 ] ) ),
			null,
			new Attribute( 'isNew', true ),
			doc.version
		);

		expect( op.type ).to.equal( 'attr' );
	} );

	it( 'should insert attribute to the set of nodes', () => {
		let newAttr = new Attribute( 'isNew', true );

		root.insertChildren( 0, 'bar' );

		doc.applyOperation(
			new AttributeOperation(
				new Range( new Position( root, [ 0 ] ), new Position( root, [ 2 ] ) ),
				null,
				newAttr,
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 3 );
		expect( root.getChild( 0 ).attrs.has( newAttr ) ).to.be.true;
		expect( root.getChild( 1 ).attrs.has( newAttr ) ).to.be.true;
		expect( root.getChild( 2 ).attrs.size ).to.equal( 0 );
	} );

	it( 'should add attribute to the existing attributes', () => {
		let newAttr = new Attribute( 'isNew', true );
		let fooAttr = new Attribute( 'foo', true );
		let barAttr = new Attribute( 'bar', true );

		root.insertChildren( 0, new Text( 'x', [ fooAttr, barAttr ] ) );

		doc.applyOperation(
			new AttributeOperation(
				new Range( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) ),
				null,
				newAttr,
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 1 );
		expect( root.getChild( 0 ).attrs.size ).to.equal( 3 );
		expect( root.getChild( 0 ).attrs.has( newAttr ) ).to.be.true;
		expect( root.getChild( 0 ).attrs.has( fooAttr ) ).to.be.true;
		expect( root.getChild( 0 ).attrs.has( barAttr ) ).to.be.true;
	} );

	it( 'should change attribute to the set of nodes', () => {
		let oldAttr = new Attribute( 'isNew', false );
		let newAttr = new Attribute( 'isNew', true );

		root.insertChildren( 0, new Text( 'bar', [ oldAttr ] ) );

		doc.applyOperation(
			new AttributeOperation(
				new Range( new Position( root, [ 0 ] ), new Position( root, [ 2 ] ) ),
				oldAttr,
				newAttr,
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 3 );
		expect( root.getChild( 0 ).attrs.size ).to.equal( 1 );
		expect( root.getChild( 0 ).attrs.has( newAttr ) ).to.be.true;
		expect( root.getChild( 1 ).attrs.size ).to.equal( 1 );
		expect( root.getChild( 1 ).attrs.has( newAttr ) ).to.be.true;
		expect( root.getChild( 2 ).attrs.size ).to.equal( 1 );
		expect( root.getChild( 2 ).attrs.has( oldAttr ) ).to.be.true;
	} );

	it( 'should change attribute in the middle of existing attributes', () => {
		let fooAttr = new Attribute( 'foo', true );
		let x1Attr = new Attribute( 'x', 1 );
		let x2Attr = new Attribute( 'x', 2 );
		let barAttr = new Attribute( 'bar', true );

		root.insertChildren( 0, new Text( 'x', [ fooAttr, x1Attr, barAttr ] ) );

		doc.applyOperation(
			new AttributeOperation(
				new Range( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) ),
				x1Attr,
				x2Attr,
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 1 );
		expect( root.getChild( 0 ).attrs.size ).to.equal( 3 );
		expect( root.getChild( 0 ).attrs.has( fooAttr ) ).to.be.true;
		expect( root.getChild( 0 ).attrs.has( x2Attr ) ).to.be.true;
		expect( root.getChild( 0 ).attrs.has( barAttr ) ).to.be.true;
	} );

	it( 'should remove attribute', () => {
		let fooAttr = new Attribute( 'foo', true );
		let xAttr = new Attribute( 'x', true );
		let barAttr = new Attribute( 'bar', true );

		root.insertChildren( 0, new Text( 'x', [ fooAttr, xAttr, barAttr ] ) );

		doc.applyOperation(
			new AttributeOperation(
				new Range( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) ),
				xAttr,
				null,
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 1 );
		expect( root.getChild( 0 ).attrs.size ).to.equal( 2 );
		expect( root.getChild( 0 ).attrs.has( fooAttr ) ).to.be.true;
		expect( root.getChild( 0 ).attrs.has( barAttr ) ).to.be.true;
	} );

	it( 'should create an AttributeOperation as a reverse', () => {
		let oldAttr = new Attribute( 'x', 'old' );
		let newAttr = new Attribute( 'x', 'new' );
		let range = new Range( new Position( root, [ 0 ] ), new Position( root, [ 3 ] ) );
		let operation = new AttributeOperation( range, oldAttr, newAttr, doc.version );
		let reverse = operation.getReversed();

		expect( reverse ).to.be.an.instanceof( AttributeOperation );
		expect( reverse.baseVersion ).to.equal( 1 );
		expect( reverse.range.isEqual( range ) ).to.be.true;
		expect( reverse.oldAttr ).to.equal( newAttr );
		expect( reverse.newAttr ).to.equal( oldAttr );
	} );

	it( 'should undo adding attribute by applying reverse operation', () => {
		let newAttr = new Attribute( 'isNew', true );

		root.insertChildren( 0, 'bar' );

		let operation = new AttributeOperation(
			new Range( new Position( root, [ 0 ] ), new Position( root, [ 3 ] ) ),
			null,
			newAttr,
			doc.version
		);

		let reverse = operation.getReversed();

		doc.applyOperation( operation );
		doc.applyOperation( reverse );

		expect( doc.version ).to.equal( 2 );
		expect( root.getChildCount() ).to.equal( 3 );
		expect( root.getChild( 0 ).attrs.size ).to.equal( 0 );
		expect( root.getChild( 1 ).attrs.size ).to.equal( 0 );
		expect( root.getChild( 2 ).attrs.size ).to.equal( 0 );
	} );

	it( 'should not set attribute of element if change range starts in the middle of that element', () => {
		let fooAttr = new Attribute( 'foo', true );

		let eleA = new Element( 'a', [], 'abc' );
		let eleB = new Element( 'b', [], 'xyz' );

		root.insertChildren( 0, [ eleA, eleB ] );

		doc.applyOperation(
			new AttributeOperation(
				new Range( new Position( root, [ 0, 2 ] ), new Position( root, [ 1, 2 ] ) ),
				null,
				fooAttr,
				doc.version
			)
		);

		expect( root.getChild( 0 ).attrs.has( fooAttr ) ).to.be.false;
	} );

	it( 'should not remove attribute of element if change range starts in the middle of that element', () => {
		let fooAttr = new Attribute( 'foo', true );

		let eleA = new Element( 'a', [ fooAttr ], 'abc' );
		let eleB = new Element( 'b', [ fooAttr ], 'xyz' );

		root.insertChildren( 0, [ eleA, eleB ] );

		doc.applyOperation(
			new AttributeOperation(
				new Range( new Position( root, [ 0, 3 ] ), new Position( root, [ 1, 0 ] ) ),
				fooAttr,
				null,
				doc.version
			)
		);

		expect( root.getChild( 0 ).attrs.has( fooAttr ) ).to.be.true;
	} );

	it( 'should undo changing attribute by applying reverse operation', () => {
		let oldAttr = new Attribute( 'isNew', false );
		let newAttr = new Attribute( 'isNew', true );

		root.insertChildren( 0, new Text( 'bar', [ oldAttr ] ) );

		let operation = new AttributeOperation(
			new Range( new Position( root, [ 0 ] ), new Position( root, [ 3 ] ) ),
			oldAttr,
			newAttr,
			doc.version
		);

		let reverse = operation.getReversed();

		doc.applyOperation( operation );

		doc.applyOperation( reverse );

		expect( doc.version ).to.equal( 2 );
		expect( root.getChildCount() ).to.equal( 3 );
		expect( root.getChild( 0 ).attrs.size ).to.equal( 1 );
		expect( root.getChild( 0 ).attrs.has( oldAttr ) ).to.be.true;
		expect( root.getChild( 1 ).attrs.size ).to.equal( 1 );
		expect( root.getChild( 1 ).attrs.has( oldAttr ) ).to.be.true;
		expect( root.getChild( 2 ).attrs.size ).to.equal( 1 );
		expect( root.getChild( 2 ).attrs.has( oldAttr ) ).to.be.true;
	} );

	it( 'should undo remove attribute by applying reverse operation', () => {
		let fooAttr = new Attribute( 'foo', false );

		root.insertChildren( 0, new Text( 'bar', [ fooAttr ] ) );

		let operation = new AttributeOperation(
			new Range( new Position( root, [ 0 ] ), new Position( root, [ 3 ] ) ),
			fooAttr,
			null,
			doc.version
		);

		let reverse = operation.getReversed();

		doc.applyOperation( operation );

		doc.applyOperation( reverse );

		expect( doc.version ).to.equal( 2 );
		expect( root.getChildCount() ).to.equal( 3 );
		expect( root.getChild( 0 ).attrs.size ).to.equal( 1 );
		expect( root.getChild( 0 ).attrs.has( fooAttr ) ).to.be.true;
		expect( root.getChild( 1 ).attrs.size ).to.equal( 1 );
		expect( root.getChild( 1 ).attrs.has( fooAttr ) ).to.be.true;
		expect( root.getChild( 2 ).attrs.size ).to.equal( 1 );
		expect( root.getChild( 2 ).attrs.has( fooAttr ) ).to.be.true;
	} );

	it( 'should throw an error when one try to remove and the attribute does not exists', () => {
		let fooAttr = new Attribute( 'foo', true );

		root.insertChildren( 0, 'x' );

		expect( () => {
			doc.applyOperation(
				new AttributeOperation(
					new Range( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) ),
					fooAttr,
					null,
					doc.version
				)
			);
		} ).to.throw( CKEditorError, /operation-attribute-no-attr-to-remove/ );
	} );

	it( 'should throw an error when one try to insert and the attribute already exists', () => {
		let x1Attr = new Attribute( 'x', 1 );
		let x2Attr = new Attribute( 'x', 2 );

		root.insertChildren( 0, new Text( 'x', [ x1Attr ] ) );

		expect( () => {
			doc.applyOperation(
				new AttributeOperation(
					new Range( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) ),
					null,
					x2Attr,
					doc.version
				)
			);
		} ).to.throw( CKEditorError, /operation-attribute-attr-exists/ );
	} );

	it( 'should throw an error when one try to change and the new and old attributes have different keys', () => {
		let fooAttr = new Attribute( 'foo', true );
		let barAttr = new Attribute( 'bar', true );

		root.insertChildren( 0, 'x' );

		expect( () => {
			doc.applyOperation(
				new AttributeOperation(
					new Range( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) ),
					fooAttr,
					barAttr,
					doc.version
				)
			);
		} ).to.throw( CKEditorError, /operation-attribute-different-keys/ );
	} );

	it( 'should create an AttributeOperation with the same parameters when cloned', () => {
		let range = new Range( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) );
		let oldAttr = new Attribute( 'foo', 'old' );
		let newAttr = new Attribute( 'foo', 'bar' );
		let baseVersion = doc.version;

		let op = new AttributeOperation( range, oldAttr, newAttr, baseVersion );

		let clone = op.clone();

		// New instance rather than a pointer to the old instance.
		expect( clone ).not.to.be.equal( op );

		expect( clone ).to.be.instanceof( AttributeOperation );
		expect( clone.range.isEqual( range ) ).to.be.true;
		expect( clone.oldAttr.isEqual( oldAttr ) ).to.be.true;
		expect( clone.newAttr.isEqual( newAttr ) ).to.be.true;
		expect( clone.baseVersion ).to.equal( baseVersion );
	} );
} );
