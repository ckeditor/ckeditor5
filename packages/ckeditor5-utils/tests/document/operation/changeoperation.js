/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: document */
/* global describe, before, beforeEach, it, expect */

/* bender-include: ../../_tools/tools.js */

'use strict';

const getIteratorCount = bender.tools.core.getIteratorCount;

const modules = bender.amd.require(
	'document/document',
	'document/operation/changeoperation',
	'document/position',
	'document/range',
	'document/character',
	'document/attribute',
	'document/text',
	'ckeditorerror'
);

describe( 'ChangeOperation', () => {
	let Document, ChangeOperation, Position, Range, Character, Attribute, Text, CKEditorError;

	before( () => {
		Document = modules[ 'document/document' ];
		ChangeOperation = modules[ 'document/operation/changeoperation' ];
		Position = modules[ 'document/position' ];
		Range = modules[ 'document/range' ];
		Character = modules[ 'document/character' ];
		Attribute = modules[ 'document/attribute' ];
		Text = modules[ 'document/text' ];
		CKEditorError = modules.ckeditorerror;
	} );

	let doc, root;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );
	} );

	it( 'should insert attribute to the set of nodes', () => {
		let newAttr = new Attribute( 'isNew', true );

		root.insertChildren( 0, 'bar' );

		doc.applyOperation(
			new ChangeOperation(
				new Range( new Position( [ 0 ], root ), new Position( [ 2 ], root ) ),
				null,
				newAttr,
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 3 );
		expect( root.getChild( 0 ).hasAttr( newAttr ) ).to.be.true;
		expect( root.getChild( 1 ).hasAttr( newAttr ) ).to.be.true;
		expect( getIteratorCount( root.getChild( 2 ).getAttrs() ) ).to.equal( 0 );
	} );

	it( 'should add attribute to the existing attributes', () => {
		let newAttr = new Attribute( 'isNew', true );
		let fooAttr = new Attribute( 'foo', true );
		let barAttr = new Attribute( 'bar', true );

		root.insertChildren( 0, new Character( 'x', [ fooAttr, barAttr ] ) );

		doc.applyOperation(
			new ChangeOperation(
				new Range( new Position( [ 0 ], root ), new Position( [ 1 ], root ) ),
				null,
				newAttr,
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 1 );
		expect( getIteratorCount( root.getChild( 0 ).getAttrs() ) ).to.equal( 3 );
		expect( root.getChild( 0 ).hasAttr( newAttr ) ).to.be.true;
		expect( root.getChild( 0 ).hasAttr( fooAttr ) ).to.be.true;
		expect( root.getChild( 0 ).hasAttr( barAttr ) ).to.be.true;
	} );

	it( 'should change attribute to the set of nodes', () => {
		let oldAttr = new Attribute( 'isNew', false );
		let newAttr = new Attribute( 'isNew', true );

		root.insertChildren( 0, new Text( 'bar', [ oldAttr ] ) );

		doc.applyOperation(
			new ChangeOperation(
				new Range( new Position( [ 0 ], root ), new Position( [ 2 ], root ) ),
				oldAttr,
				newAttr,
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 3 );
		expect( getIteratorCount( root.getChild( 0 ).getAttrs() ) ).to.equal( 1 );
		expect( root.getChild( 0 ).hasAttr( newAttr ) ).to.be.true;
		expect( getIteratorCount( root.getChild( 1 ).getAttrs() ) ).to.equal( 1 );
		expect( root.getChild( 1 ).hasAttr( newAttr ) ).to.be.true;
		expect( getIteratorCount( root.getChild( 2 ).getAttrs() ) ).to.equal( 1 );
		expect( root.getChild( 2 ).hasAttr( oldAttr ) ).to.be.true;
	} );

	it( 'should change attribute in the middle of existing attributes', () => {
		let fooAttr = new Attribute( 'foo', true );
		let x1Attr = new Attribute( 'x', 1 );
		let x2Attr = new Attribute( 'x', 2 );
		let barAttr = new Attribute( 'bar', true );

		root.insertChildren( 0, new Character( 'x', [ fooAttr, x1Attr, barAttr ] ) );

		doc.applyOperation(
			new ChangeOperation(
				new Range( new Position( [ 0 ], root ), new Position( [ 1 ], root ) ),
				x1Attr,
				x2Attr,
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 1 );
		expect( getIteratorCount( root.getChild( 0 ).getAttrs() ) ).to.equal( 3 );
		expect( root.getChild( 0 ).hasAttr( fooAttr ) ).to.be.true;
		expect( root.getChild( 0 ).hasAttr( x2Attr ) ).to.be.true;
		expect( root.getChild( 0 ).hasAttr( barAttr ) ).to.be.true;
	} );

	it( 'should remove attribute', () => {
		let fooAttr = new Attribute( 'foo', true );
		let xAttr = new Attribute( 'x', true );
		let barAttr = new Attribute( 'bar', true );

		root.insertChildren( 0, new Character( 'x', [ fooAttr, xAttr, barAttr ] ) );

		doc.applyOperation(
			new ChangeOperation(
				new Range( new Position( [ 0 ], root ), new Position( [ 1 ], root ) ),
				xAttr,
				null,
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 1 );
		expect( getIteratorCount( root.getChild( 0 ).getAttrs() ) ).to.equal( 2 );
		expect( root.getChild( 0 ).hasAttr( fooAttr ) ).to.be.true;
		expect( root.getChild( 0 ).hasAttr( barAttr ) ).to.be.true;
	} );

	it( 'should create a change operation as a reverse', () => {
		let oldAttr = new Attribute( 'x', 'old' );
		let newAttr = new Attribute( 'x', 'new' );
		let range = new Range( new Position( [ 0 ], root ), new Position( [ 3 ], root ) );
		let operation = new ChangeOperation( range, oldAttr, newAttr, doc.version );
		let reverse = operation.getReversed();

		expect( reverse ).to.be.an.instanceof( ChangeOperation );
		expect( reverse.baseVersion ).to.equal( 1 );
		expect( reverse.range ).to.equal( range );
		expect( reverse.oldAttr ).to.equal( newAttr );
		expect( reverse.newAttr ).to.equal( oldAttr );
	} );

	it( 'should undo adding attribute by applying reverse operation', () => {
		let newAttr = new Attribute( 'isNew', true );

		root.insertChildren( 0, 'bar' );

		let operation = new ChangeOperation(
			new Range( new Position( [ 0 ], root ), new Position( [ 3 ], root ) ),
			null,
			newAttr,
			doc.version
		);

		let reverse = operation.getReversed();

		doc.applyOperation( operation );
		doc.applyOperation( reverse );

		expect( doc.version ).to.equal( 2 );
		expect( root.getChildCount() ).to.equal( 3 );
		expect( getIteratorCount( root.getChild( 0 ).getAttrs() ) ).to.equal( 0 );
		expect( getIteratorCount( root.getChild( 1 ).getAttrs() ) ).to.equal( 0 );
		expect( getIteratorCount( root.getChild( 2 ).getAttrs() ) ).to.equal( 0 );
	} );

	it( 'should undo changing attribute by applying reverse operation', () => {
		let oldAttr = new Attribute( 'isNew', false );
		let newAttr = new Attribute( 'isNew', true );

		root.insertChildren( 0, new Text( 'bar', [ oldAttr ] ) );

		let operation = new ChangeOperation(
			new Range( new Position( [ 0 ], root ), new Position( [ 3 ], root ) ),
			oldAttr,
			newAttr,
			doc.version
		);

		let reverse = operation.getReversed();

		doc.applyOperation( operation );

		doc.applyOperation( reverse );

		expect( doc.version ).to.equal( 2 );
		expect( root.getChildCount() ).to.equal( 3 );
		expect( getIteratorCount( root.getChild( 0 ).getAttrs() ) ).to.equal( 1 );
		expect( root.getChild( 0 ).hasAttr( oldAttr ) ).to.be.true;
		expect( getIteratorCount( root.getChild( 1 ).getAttrs() ) ).to.equal( 1 );
		expect( root.getChild( 1 ).hasAttr( oldAttr ) ).to.be.true;
		expect( getIteratorCount( root.getChild( 2 ).getAttrs() ) ).to.equal( 1 );
		expect( root.getChild( 2 ).hasAttr( oldAttr ) ).to.be.true;
	} );

	it( 'should undo remove attribute by applying reverse operation', () => {
		let fooAttr = new Attribute( 'foo', false );

		root.insertChildren( 0, new Text( 'bar', [ fooAttr ] ) );

		let operation = new ChangeOperation(
			new Range( new Position( [ 0 ], root ), new Position( [ 3 ], root ) ),
			fooAttr,
			null,
			doc.version
		);

		let reverse = operation.getReversed();

		doc.applyOperation( operation );

		doc.applyOperation( reverse );

		expect( doc.version ).to.equal( 2 );
		expect( root.getChildCount() ).to.equal( 3 );
		expect( getIteratorCount( root.getChild( 0 ).getAttrs() ) ).to.equal( 1 );
		expect( root.getChild( 0 ).hasAttr( fooAttr ) ).to.be.true;
		expect( getIteratorCount( root.getChild( 1 ).getAttrs() ) ).to.equal( 1 );
		expect( root.getChild( 1 ).hasAttr( fooAttr ) ).to.be.true;
		expect( getIteratorCount( root.getChild( 2 ).getAttrs() ) ).to.equal( 1 );
		expect( root.getChild( 2 ).hasAttr( fooAttr ) ).to.be.true;
	} );

	it( 'should throw an error when one try to remove and the attribute does not exists', () => {
		let fooAttr = new Attribute( 'foo', true );

		root.insertChildren( 0, 'x' );

		expect( () => {
			doc.applyOperation(
				new ChangeOperation(
					new Range( new Position( [ 0 ], root ), new Position( [ 1 ], root ) ),
					fooAttr,
					null,
					doc.version
				)
			);
		} ).to.throw( CKEditorError, /operation-change-no-attr-to-remove/ );
	} );

	it( 'should throw an error when one try to insert and the attribute already exists', () => {
		let x1Attr = new Attribute( 'x', 1 );
		let x2Attr = new Attribute( 'x', 2 );

		root.insertChildren( 0, new Character( 'x', [ x1Attr ] ) );

		expect( () => {
			doc.applyOperation(
				new ChangeOperation(
					new Range( new Position( [ 0 ], root ), new Position( [ 1 ], root ) ),
					null,
					x2Attr,
					doc.version
				)
			);
		} ).to.throw( CKEditorError, /operation-change-attr-exists/ );
	} );

	it( 'should throw an error when one try to change and the new and old attributes have different keys', () => {
		let fooAttr = new Attribute( 'foo', true );
		let barAttr = new Attribute( 'bar', true );

		root.insertChildren( 0, 'x' );

		expect( () => {
			doc.applyOperation(
				new ChangeOperation(
					new Range( new Position( [ 0 ], root ), new Position( [ 1 ], root ) ),
					fooAttr,
					barAttr,
					doc.version
				)
			);
		} ).to.throw( CKEditorError, /operation-change-different-keys/ );
	} );

	it( 'should create operation with the same parameters when cloned', () => {
		let range = new Range( new Position( [ 0 ], root ), new Position( [ 1 ], root ) );
		let oldAttr = new Attribute( 'foo', 'old' );
		let newAttr = new Attribute( 'foo', 'bar' );
		let baseVersion = doc.version;

		let op = new ChangeOperation( range, oldAttr, newAttr, baseVersion );

		let clone = op.clone();

		// New instance rather than a pointer to the old instance.
		expect( clone ).not.to.be.equal( op );

		expect( clone ).to.be.instanceof( ChangeOperation );
		expect( clone.range.isEqual( range ) ).to.be.true;
		expect( clone.oldAttr.isEqual( oldAttr ) ).to.be.true;
		expect( clone.newAttr.isEqual( newAttr ) ).to.be.true;
		expect( clone.baseVersion ).to.equal( baseVersion );
	} );
} );
