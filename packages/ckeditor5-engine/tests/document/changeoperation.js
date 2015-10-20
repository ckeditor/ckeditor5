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
	'ckeditorerror' );

describe( 'ChangeOperation', function() {
	it( 'should insert attribute to the set of nodes', function() {
		var Document = modules[ 'document/document' ];
		var ChangeOperation = modules[ 'document/changeoperation' ];
		var Position = modules[ 'document/position' ];
		var Range = modules[ 'document/range' ];
		var Character = modules[ 'document/character' ];
		var Attribute = modules[ 'document/attribute' ];

		var doc = new Document();

		var newAttr = new Attribute( 'isNew', true );

		doc.root.children.push( new Character( doc.root, 'b' ) );
		doc.root.children.push( new Character( doc.root, 'a' ) );
		doc.root.children.push( new Character( doc.root, 'r' ) );

		doc.applyOperation( new ChangeOperation(
			new Range( new Position( [ 0 ], doc ), new Position( [ 2 ], doc ) ),
			null,
			newAttr,
			doc.version ) );

		expect( doc.version ).to.be.equal( 1 );
		expect( doc.root.children.length ).to.be.equal( 3 );
		expect( doc.root.children[ 0 ].hasAttr( newAttr ) ).to.be.true;
		expect( doc.root.children[ 1 ].hasAttr( newAttr ) ).to.be.true;
		expect( doc.root.children[ 2 ].attrs.length ).to.be.equal( 0 );
	} );

	it( 'should add attribute to the existing attributes', function() {
		var Document = modules[ 'document/document' ];
		var ChangeOperation = modules[ 'document/changeoperation' ];
		var Position = modules[ 'document/position' ];
		var Range = modules[ 'document/range' ];
		var Character = modules[ 'document/character' ];
		var Attribute = modules[ 'document/attribute' ];

		var doc = new Document();

		var newAttr = new Attribute( 'isNew', true );
		var fooAttr = new Attribute( 'foo', true );
		var barAttr = new Attribute( 'bar', true );

		doc.root.children.push( new Character( doc.root, 'x', [ fooAttr, barAttr ] ) );

		doc.applyOperation( new ChangeOperation(
			new Range( new Position( [ 0 ], doc ), new Position( [ 1 ], doc ) ),
			null,
			newAttr,
			doc.version ) );

		expect( doc.version ).to.be.equal( 1 );
		expect( doc.root.children.length ).to.be.equal( 1 );
		expect( doc.root.children[ 0 ].attrs.length ).to.be.equal( 3 );
		expect( doc.root.children[ 0 ].hasAttr( newAttr ) ).to.be.true;
		expect( doc.root.children[ 0 ].hasAttr( fooAttr ) ).to.be.true;
		expect( doc.root.children[ 0 ].hasAttr( barAttr ) ).to.be.true;
	} );

	it( 'should change attribute to the set of nodes', function() {
		var Document = modules[ 'document/document' ];
		var ChangeOperation = modules[ 'document/changeoperation' ];
		var Position = modules[ 'document/position' ];
		var Range = modules[ 'document/range' ];
		var Character = modules[ 'document/character' ];
		var Attribute = modules[ 'document/attribute' ];

		var doc = new Document();

		var oldAttr = new Attribute( 'isNew', false );
		var newAttr = new Attribute( 'isNew', true );

		doc.root.children.push( new Character( doc.root, 'b', [ oldAttr ] ) );
		doc.root.children.push( new Character( doc.root, 'a', [ oldAttr ] ) );
		doc.root.children.push( new Character( doc.root, 'r', [ oldAttr ] ) );

		doc.applyOperation( new ChangeOperation(
			new Range( new Position( [ 0 ], doc ), new Position( [ 2 ], doc ) ),
			oldAttr,
			newAttr,
			doc.version ) );

		expect( doc.version ).to.be.equal( 1 );
		expect( doc.root.children.length ).to.be.equal( 3 );
		expect( doc.root.children[ 0 ].attrs.length ).to.be.equal( 1 );
		expect( doc.root.children[ 0 ].hasAttr( newAttr ) ).to.be.true;
		expect( doc.root.children[ 1 ].attrs.length ).to.be.equal( 1 );
		expect( doc.root.children[ 1 ].hasAttr( newAttr ) ).to.be.true;
		expect( doc.root.children[ 2 ].attrs.length ).to.be.equal( 1 );
		expect( doc.root.children[ 2 ].hasAttr( oldAttr ) ).to.be.true;
	} );

	it( 'should change attribute in the middle of existing attributes', function() {
		var Document = modules[ 'document/document' ];
		var ChangeOperation = modules[ 'document/changeoperation' ];
		var Position = modules[ 'document/position' ];
		var Range = modules[ 'document/range' ];
		var Character = modules[ 'document/character' ];
		var Attribute = modules[ 'document/attribute' ];

		var doc = new Document();

		var fooAttr = new Attribute( 'foo', true );
		var x1Attr = new Attribute( 'x', 1 );
		var x2Attr = new Attribute( 'x', 2 );
		var barAttr = new Attribute( 'bar', true );

		doc.root.children.push( new Character( doc.root, 'x', [ fooAttr, x1Attr, barAttr ] ) );

		doc.applyOperation( new ChangeOperation(
			new Range( new Position( [ 0 ], doc ), new Position( [ 1 ], doc ) ),
			x1Attr,
			x2Attr,
			doc.version ) );

		expect( doc.version ).to.be.equal( 1 );
		expect( doc.root.children.length ).to.be.equal( 1 );
		expect( doc.root.children[ 0 ].attrs.length ).to.be.equal( 3 );
		expect( doc.root.children[ 0 ].hasAttr( fooAttr ) ).to.be.true;
		expect( doc.root.children[ 0 ].hasAttr( x2Attr ) ).to.be.true;
		expect( doc.root.children[ 0 ].hasAttr( barAttr ) ).to.be.true;
	} );

	it( 'should remove attribute', function() {
		var Document = modules[ 'document/document' ];
		var ChangeOperation = modules[ 'document/changeoperation' ];
		var Position = modules[ 'document/position' ];
		var Range = modules[ 'document/range' ];
		var Character = modules[ 'document/character' ];
		var Attribute = modules[ 'document/attribute' ];

		var doc = new Document();

		var fooAttr = new Attribute( 'foo', true );
		var xAttr = new Attribute( 'x', true );
		var barAttr = new Attribute( 'bar', true );

		doc.root.children.push( new Character( doc.root, 'x', [ fooAttr, xAttr, barAttr ] ) );

		doc.applyOperation( new ChangeOperation(
			new Range( new Position( [ 0 ], doc ), new Position( [ 1 ], doc ) ),
			xAttr,
			null,
			doc.version ) );

		expect( doc.version ).to.be.equal( 1 );
		expect( doc.root.children.length ).to.be.equal( 1 );
		expect( doc.root.children[ 0 ].attrs.length ).to.be.equal( 2 );
		expect( doc.root.children[ 0 ].hasAttr( fooAttr ) ).to.be.true;
		expect( doc.root.children[ 0 ].hasAttr( barAttr ) ).to.be.true;
	} );

	it( 'should create a change operation as a reverse', function() {
		var Document = modules[ 'document/document' ];
		var ChangeOperation = modules[ 'document/changeoperation' ];
		var Position = modules[ 'document/position' ];
		var Range = modules[ 'document/range' ];
		var Attribute = modules[ 'document/attribute' ];

		var doc = new Document();

		var oldAttr = new Attribute( 'x', 'old' );
		var newAttr = new Attribute( 'x', 'new' );

		var range = new Range( new Position( [ 0 ], doc ), new Position( [ 3 ], doc ) );

		var oppertaion = new ChangeOperation( range, oldAttr, newAttr, doc.version );

		var reverse = oppertaion.reverseOperation();

		expect( reverse ).to.be.an.instanceof( ChangeOperation );
		expect( reverse.baseVersion ).to.be.equals( 1 );
		expect( reverse.range ).to.be.equals( range );
		expect( reverse.oldAttr ).to.be.equals( newAttr );
		expect( reverse.newAttr ).to.be.equals( oldAttr );
	} );

	it( 'should undo insert attribute by applying reverse operation', function() {
		var Document = modules[ 'document/document' ];
		var ChangeOperation = modules[ 'document/changeoperation' ];
		var Position = modules[ 'document/position' ];
		var Range = modules[ 'document/range' ];
		var Character = modules[ 'document/character' ];
		var Attribute = modules[ 'document/attribute' ];

		var doc = new Document();

		var newAttr = new Attribute( 'isNew', true );

		doc.root.children.push( new Character( doc.root, 'b' ) );
		doc.root.children.push( new Character( doc.root, 'a' ) );
		doc.root.children.push( new Character( doc.root, 'r' ) );

		var oppertaion = new ChangeOperation(
			new Range( new Position( [ 0 ], doc ), new Position( [ 3 ], doc ) ),
			null,
			newAttr,
			doc.version );

		var reverse = oppertaion.reverseOperation();

		doc.applyOperation( oppertaion );

		doc.applyOperation( reverse );

		expect( doc.version ).to.be.equal( 2 );
		expect( doc.root.children.length ).to.be.equal( 3 );
		expect( doc.root.children[ 0 ].attrs.length ).to.be.equal( 0 );
		expect( doc.root.children[ 1 ].attrs.length ).to.be.equal( 0 );
		expect( doc.root.children[ 2 ].attrs.length ).to.be.equal( 0 );
	} );

	it( 'should undo change attribute by applying reverse operation', function() {
		var Document = modules[ 'document/document' ];
		var ChangeOperation = modules[ 'document/changeoperation' ];
		var Position = modules[ 'document/position' ];
		var Range = modules[ 'document/range' ];
		var Character = modules[ 'document/character' ];
		var Attribute = modules[ 'document/attribute' ];

		var doc = new Document();

		var oldAttr = new Attribute( 'isNew', false );
		var newAttr = new Attribute( 'isNew', true );

		doc.root.children.push( new Character( doc.root, 'b', [ oldAttr ] ) );
		doc.root.children.push( new Character( doc.root, 'a', [ oldAttr ] ) );
		doc.root.children.push( new Character( doc.root, 'r', [ oldAttr ] ) );

		var oppertaion = new ChangeOperation(
			new Range( new Position( [ 0 ], doc ), new Position( [ 3 ], doc ) ),
			oldAttr,
			newAttr,
			doc.version );

		var reverse = oppertaion.reverseOperation();

		doc.applyOperation( oppertaion );

		doc.applyOperation( reverse );

		expect( doc.version ).to.be.equal( 2 );
		expect( doc.root.children.length ).to.be.equal( 3 );
		expect( doc.root.children[ 0 ].attrs.length ).to.be.equal( 1 );
		expect( doc.root.children[ 0 ].hasAttr( oldAttr ) ).to.be.true;
		expect( doc.root.children[ 1 ].attrs.length ).to.be.equal( 1 );
		expect( doc.root.children[ 1 ].hasAttr( oldAttr ) ).to.be.true;
		expect( doc.root.children[ 2 ].attrs.length ).to.be.equal( 1 );
		expect( doc.root.children[ 2 ].hasAttr( oldAttr ) ).to.be.true;
	} );

	it( 'should undo remove attribute by applying reverse operation', function() {
		var Document = modules[ 'document/document' ];
		var ChangeOperation = modules[ 'document/changeoperation' ];
		var Position = modules[ 'document/position' ];
		var Range = modules[ 'document/range' ];
		var Character = modules[ 'document/character' ];
		var Attribute = modules[ 'document/attribute' ];

		var doc = new Document();

		var fooAttr = new Attribute( 'foo', false );

		doc.root.children.push( new Character( doc.root, 'b', [ fooAttr ] ) );
		doc.root.children.push( new Character( doc.root, 'a', [ fooAttr ] ) );
		doc.root.children.push( new Character( doc.root, 'r', [ fooAttr ] ) );

		var oppertaion = new ChangeOperation(
			new Range( new Position( [ 0 ], doc ), new Position( [ 3 ], doc ) ),
			fooAttr,
			null,
			doc.version );

		var reverse = oppertaion.reverseOperation();

		doc.applyOperation( oppertaion );

		doc.applyOperation( reverse );

		expect( doc.version ).to.be.equal( 2 );
		expect( doc.root.children.length ).to.be.equal( 3 );
		expect( doc.root.children[ 0 ].attrs.length ).to.be.equal( 1 );
		expect( doc.root.children[ 0 ].hasAttr( fooAttr ) ).to.be.true;
		expect( doc.root.children[ 1 ].attrs.length ).to.be.equal( 1 );
		expect( doc.root.children[ 1 ].hasAttr( fooAttr ) ).to.be.true;
		expect( doc.root.children[ 2 ].attrs.length ).to.be.equal( 1 );
		expect( doc.root.children[ 2 ].hasAttr( fooAttr ) ).to.be.true;
	} );

	it( 'should throw an error when one try to remove and the attribute does not exists', function() {
		var Document = modules[ 'document/document' ];
		var ChangeOperation = modules[ 'document/changeoperation' ];
		var Position = modules[ 'document/position' ];
		var Range = modules[ 'document/range' ];
		var Character = modules[ 'document/character' ];
		var Attribute = modules[ 'document/attribute' ];
		var CKEditorError = modules.ckeditorerror;

		var doc = new Document();

		var fooAttr = new Attribute( 'foo', true );

		doc.root.children.push( new Character( doc.root, 'x' ) );

		expect( function() {
			doc.applyOperation( new ChangeOperation(
				new Range( new Position( [ 0 ], doc ), new Position( [ 1 ], doc ) ),
				fooAttr,
				null,
				doc.version ) );
		} ).to.throw( CKEditorError, /operation-change-no-attr-to-remove/ );
	} );

	it( 'should throw an error when one try to insert and the attribute already exists', function() {
		var Document = modules[ 'document/document' ];
		var ChangeOperation = modules[ 'document/changeoperation' ];
		var Position = modules[ 'document/position' ];
		var Range = modules[ 'document/range' ];
		var Character = modules[ 'document/character' ];
		var Attribute = modules[ 'document/attribute' ];
		var CKEditorError = modules.ckeditorerror;

		var doc = new Document();

		var x1Attr = new Attribute( 'x', 1 );
		var x2Attr = new Attribute( 'x', 2 );

		doc.root.children.push( new Character( doc.root, 'x', [ x1Attr ] ) );

		expect( function() {
			doc.applyOperation( new ChangeOperation(
				new Range( new Position( [ 0 ], doc ), new Position( [ 1 ], doc ) ),
				null,
				x2Attr,
				doc.version ) );
		} ).to.throw( CKEditorError, /operation-change-attr-exists/ );
	} );

	it( 'should throw an error when one try to change and the new and old attributes have different keys', function() {
		var Document = modules[ 'document/document' ];
		var ChangeOperation = modules[ 'document/changeoperation' ];
		var Position = modules[ 'document/position' ];
		var Range = modules[ 'document/range' ];
		var Character = modules[ 'document/character' ];
		var Attribute = modules[ 'document/attribute' ];
		var CKEditorError = modules.ckeditorerror;

		var doc = new Document();

		var fooAttr = new Attribute( 'foo', true );
		var barAttr = new Attribute( 'bar', true );

		doc.root.children.push( new Character( doc.root, 'x' ) );

		expect( function() {
			doc.applyOperation( new ChangeOperation(
				new Range( new Position( [ 0 ], doc ), new Position( [ 1 ], doc ) ),
				fooAttr,
				barAttr,
				doc.version ) );
		} ).to.throw( CKEditorError, /operation-change-different-keys/ );
	} );

	it( 'should throw an error when one try to change and the old attribute does not exists', function() {
		var Document = modules[ 'document/document' ];
		var ChangeOperation = modules[ 'document/changeoperation' ];
		var Position = modules[ 'document/position' ];
		var Range = modules[ 'document/range' ];
		var Character = modules[ 'document/character' ];
		var Attribute = modules[ 'document/attribute' ];
		var CKEditorError = modules.ckeditorerror;

		var doc = new Document();

		var x1Attr = new Attribute( 'x', 1 );
		var x2Attr = new Attribute( 'x', 2 );

		doc.root.children.push( new Character( doc.root, 'x' ) );

		expect( function() {
			doc.applyOperation( new ChangeOperation(
				new Range( new Position( [ 0 ], doc ), new Position( [ 1 ], doc ) ),
				x1Attr,
				x2Attr,
				doc.version ) );
		} ).to.throw( CKEditorError, /operation-change-no-attr-to-change/ );
	} );
} );