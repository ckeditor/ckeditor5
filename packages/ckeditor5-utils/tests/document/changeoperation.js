/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: document */

'use strict';

var modules = bender.amd.require(
	'document/document',
	'document/changeoperation',
	'document/position',
	'document/range',
	'document/character',
	'document/attribute',
	'document/nodelist',
	'document/text',
	'ckeditorerror' );

describe( 'ChangeOperation', function() {
	var Document, ChangeOperation, Position, Range, Character, Attribute, NodeList, Text, CKEditorError;

	before( function() {
		Document = modules[ 'document/document' ];
		ChangeOperation = modules[ 'document/changeoperation' ];
		Position = modules[ 'document/position' ];
		Range = modules[ 'document/range' ];
		Character = modules[ 'document/character' ];
		Attribute = modules[ 'document/attribute' ];
		NodeList = modules[ 'document/nodelist' ];
		Text = modules[ 'document/text' ];
		CKEditorError = modules.ckeditorerror;
	} );

	var doc, root;

	beforeEach( function() {
		doc = new Document();
		root = doc.createRoot( 'root' );
	} );

	it( 'should insert attribute to the set of nodes', function() {
		var newAttr = new Attribute( 'isNew', true );

		root.insertChildren( 0, 'bar' );

		doc.applyOperation( new ChangeOperation(
			new Range( new Position( [ 0 ], root ), new Position( [ 2 ], root ) ),
			null,
			newAttr,
			doc.version ) );

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 3 );
		expect( root.getChild( 0 ).hasAttr( newAttr ) ).to.be.true;
		expect( root.getChild( 1 ).hasAttr( newAttr ) ).to.be.true;
		expect( root.getChild( 2 )._getAttrCount() ).to.equal( 0 );
	} );

	it( 'should add attribute to the existing attributes', function() {
		var newAttr = new Attribute( 'isNew', true );
		var fooAttr = new Attribute( 'foo', true );
		var barAttr = new Attribute( 'bar', true );

		root.insertChildren( 0, new Character( 'x', [ fooAttr, barAttr ] ) );

		doc.applyOperation( new ChangeOperation(
			new Range( new Position( [ 0 ], root ), new Position( [ 1 ], root ) ),
			null,
			newAttr,
			doc.version ) );

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 1 );
		expect( root.getChild( 0 )._getAttrCount() ).to.equal( 3 );
		expect( root.getChild( 0 ).hasAttr( newAttr ) ).to.be.true;
		expect( root.getChild( 0 ).hasAttr( fooAttr ) ).to.be.true;
		expect( root.getChild( 0 ).hasAttr( barAttr ) ).to.be.true;
	} );

	it( 'should change attribute to the set of nodes', function() {
		var oldAttr = new Attribute( 'isNew', false );
		var newAttr = new Attribute( 'isNew', true );

		root.insertChildren( 0, new Text( 'bar', [ oldAttr ] ) );

		doc.applyOperation( new ChangeOperation(
			new Range( new Position( [ 0 ], root ), new Position( [ 2 ], root ) ),
			oldAttr,
			newAttr,
			doc.version ) );

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 3 );
		expect( root.getChild( 0 )._getAttrCount() ).to.equal( 1 );
		expect( root.getChild( 0 ).hasAttr( newAttr ) ).to.be.true;
		expect( root.getChild( 1 )._getAttrCount() ).to.equal( 1 );
		expect( root.getChild( 1 ).hasAttr( newAttr ) ).to.be.true;
		expect( root.getChild( 2 )._getAttrCount() ).to.equal( 1 );
		expect( root.getChild( 2 ).hasAttr( oldAttr ) ).to.be.true;
	} );

	it( 'should change attribute in the middle of existing attributes', function() {
		var fooAttr = new Attribute( 'foo', true );
		var x1Attr = new Attribute( 'x', 1 );
		var x2Attr = new Attribute( 'x', 2 );
		var barAttr = new Attribute( 'bar', true );

		root.insertChildren( 0, new Character( 'x', [ fooAttr, x1Attr, barAttr ] ) );

		doc.applyOperation( new ChangeOperation(
			new Range( new Position( [ 0 ], root ), new Position( [ 1 ], root ) ),
			x1Attr,
			x2Attr,
			doc.version ) );

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 1 );
		expect( root.getChild( 0 )._getAttrCount() ).to.equal( 3 );
		expect( root.getChild( 0 ).hasAttr( fooAttr ) ).to.be.true;
		expect( root.getChild( 0 ).hasAttr( x2Attr ) ).to.be.true;
		expect( root.getChild( 0 ).hasAttr( barAttr ) ).to.be.true;
	} );

	it( 'should remove attribute', function() {
		var fooAttr = new Attribute( 'foo', true );
		var xAttr = new Attribute( 'x', true );
		var barAttr = new Attribute( 'bar', true );

		root.insertChildren( 0, new Character( 'x', [ fooAttr, xAttr, barAttr ] ) );

		doc.applyOperation( new ChangeOperation(
			new Range( new Position( [ 0 ], root ), new Position( [ 1 ], root ) ),
			xAttr,
			null,
			doc.version ) );

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 1 );
		expect( root.getChild( 0 )._getAttrCount() ).to.equal( 2 );
		expect( root.getChild( 0 ).hasAttr( fooAttr ) ).to.be.true;
		expect( root.getChild( 0 ).hasAttr( barAttr ) ).to.be.true;
	} );

	it( 'should create a change operation as a reverse', function() {
		var oldAttr = new Attribute( 'x', 'old' );
		var newAttr = new Attribute( 'x', 'new' );

		var range = new Range( new Position( [ 0 ], root ), new Position( [ 3 ], root ) );

		var operation = new ChangeOperation( range, oldAttr, newAttr, doc.version );

		var reverse = operation.reverseOperation();

		expect( reverse ).to.be.an.instanceof( ChangeOperation );
		expect( reverse.baseVersion ).to.equal( 1 );
		expect( reverse.range ).to.equal( range );
		expect( reverse.oldAttr ).to.equal( newAttr );
		expect( reverse.newAttr ).to.equal( oldAttr );
	} );

	it( 'should undo adding attribute by applying reverse operation', function() {
		var newAttr = new Attribute( 'isNew', true );

		root.insertChildren( 0, 'bar' );

		var operation = new ChangeOperation(
			new Range( new Position( [ 0 ], root ), new Position( [ 3 ], root ) ),
			null,
			newAttr,
			doc.version );

		var reverse = operation.reverseOperation();

		doc.applyOperation( operation );
		doc.applyOperation( reverse );

		expect( doc.version ).to.equal( 2 );
		expect( root.getChildCount() ).to.equal( 3 );
		expect( root.getChild( 0 )._getAttrCount() ).to.equal( 0 );
		expect( root.getChild( 1 )._getAttrCount() ).to.equal( 0 );
		expect( root.getChild( 2 )._getAttrCount() ).to.equal( 0 );
	} );

	it( 'should undo changing attribute by applying reverse operation', function() {
		var oldAttr = new Attribute( 'isNew', false );
		var newAttr = new Attribute( 'isNew', true );

		root.insertChildren( 0, new Text( 'bar', [ oldAttr ] ) );

		var operation = new ChangeOperation(
			new Range( new Position( [ 0 ], root ), new Position( [ 3 ], root ) ),
			oldAttr,
			newAttr,
			doc.version );

		var reverse = operation.reverseOperation();

		doc.applyOperation( operation );

		doc.applyOperation( reverse );

		expect( doc.version ).to.equal( 2 );
		expect( root.getChildCount() ).to.equal( 3 );
		expect( root.getChild( 0 )._getAttrCount() ).to.equal( 1 );
		expect( root.getChild( 0 ).hasAttr( oldAttr ) ).to.be.true;
		expect( root.getChild( 1 )._getAttrCount() ).to.equal( 1 );
		expect( root.getChild( 1 ).hasAttr( oldAttr ) ).to.be.true;
		expect( root.getChild( 2 )._getAttrCount() ).to.equal( 1 );
		expect( root.getChild( 2 ).hasAttr( oldAttr ) ).to.be.true;
	} );

	it( 'should undo remove attribute by applying reverse operation', function() {
		var fooAttr = new Attribute( 'foo', false );

		root.insertChildren( 0, new Text( 'bar', [ fooAttr ] ) );

		var operation = new ChangeOperation(
			new Range( new Position( [ 0 ], root ), new Position( [ 3 ], root ) ),
			fooAttr,
			null,
			doc.version );

		var reverse = operation.reverseOperation();

		doc.applyOperation( operation );

		doc.applyOperation( reverse );

		expect( doc.version ).to.equal( 2 );
		expect( root.getChildCount() ).to.equal( 3 );
		expect( root.getChild( 0 )._getAttrCount() ).to.equal( 1 );
		expect( root.getChild( 0 ).hasAttr( fooAttr ) ).to.be.true;
		expect( root.getChild( 1 )._getAttrCount() ).to.equal( 1 );
		expect( root.getChild( 1 ).hasAttr( fooAttr ) ).to.be.true;
		expect( root.getChild( 2 )._getAttrCount() ).to.equal( 1 );
		expect( root.getChild( 2 ).hasAttr( fooAttr ) ).to.be.true;
	} );

	it( 'should throw an error when one try to remove and the attribute does not exists', function() {
		var fooAttr = new Attribute( 'foo', true );

		root.insertChildren( 0, 'x' );

		expect( function() {
			doc.applyOperation( new ChangeOperation(
				new Range( new Position( [ 0 ], root ), new Position( [ 1 ], root ) ),
				fooAttr,
				null,
				doc.version ) );
		} ).to.throw( CKEditorError, /operation-change-no-attr-to-remove/ );
	} );

	it( 'should throw an error when one try to insert and the attribute already exists', function() {
		var x1Attr = new Attribute( 'x', 1 );
		var x2Attr = new Attribute( 'x', 2 );

		root.insertChildren( 0, new Character( 'x', [ x1Attr ] ) );

		expect( function() {
			doc.applyOperation( new ChangeOperation(
				new Range( new Position( [ 0 ], root ), new Position( [ 1 ], root ) ),
				null,
				x2Attr,
				doc.version ) );
		} ).to.throw( CKEditorError, /operation-change-attr-exists/ );
	} );

	it( 'should throw an error when one try to change and the new and old attributes have different keys', function() {
		var fooAttr = new Attribute( 'foo', true );
		var barAttr = new Attribute( 'bar', true );

		root.insertChildren( 0, 'x' );

		expect( function() {
			doc.applyOperation( new ChangeOperation(
				new Range( new Position( [ 0 ], root ), new Position( [ 1 ], root ) ),
				fooAttr,
				barAttr,
				doc.version ) );
		} ).to.throw( CKEditorError, /operation-change-different-keys/ );
	} );
} );
