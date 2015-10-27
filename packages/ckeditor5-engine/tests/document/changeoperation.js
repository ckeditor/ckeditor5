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
	it( 'should insert attribute to the set of nodes', function() {
		var Document = modules[ 'document/document' ];
		var ChangeOperation = modules[ 'document/changeoperation' ];
		var Position = modules[ 'document/position' ];
		var Range = modules[ 'document/range' ];
		var Attribute = modules[ 'document/attribute' ];

		var doc = new Document();

		var newAttr = new Attribute( 'isNew', true );

		doc.root.insertChildren( 0, 'bar' );

		doc.applyOperation( new ChangeOperation(
			new Range( new Position( [ 0 ], doc.root ), new Position( [ 2 ], doc.root ) ),
			null,
			newAttr,
			doc.version ) );

		expect( doc.version ).to.be.equal( 1 );
		expect( doc.root.getChildCount() ).to.be.equal( 3 );
		expect( doc.root.getChild( 0 ).hasAttr( newAttr ) ).to.be.true;
		expect( doc.root.getChild( 1 ).hasAttr( newAttr ) ).to.be.true;
		expect( doc.root.getChild( 2 )._getAttrCount() ).to.be.equal( 0 );
	} );

	it( 'should insert attribute to multiple ranges', function() {
		var Document = modules[ 'document/document' ];
		var ChangeOperation = modules[ 'document/changeoperation' ];
		var Position = modules[ 'document/position' ];
		var Range = modules[ 'document/range' ];
		var Attribute = modules[ 'document/attribute' ];

		var doc = new Document();

		var newAttr = new Attribute( 'isNew', true );

		doc.root.insertChildren( 0, 'bar' );

		doc.applyOperation( new ChangeOperation(
			[
				new Range( new Position( [ 0 ], doc.root ), new Position( [ 1 ], doc.root ) ),
				new Range( new Position( [ 2 ], doc.root ), new Position( [ 3 ], doc.root ) )
			],
			null,
			newAttr,
			doc.version ) );

		expect( doc.version ).to.be.equal( 1 );
		expect( doc.root.getChildCount() ).to.be.equal( 3 );
		expect( doc.root.getChild( 0 ).hasAttr( newAttr ) ).to.be.true;
		expect( doc.root.getChild( 1 )._getAttrCount() ).to.be.equal( 0 );
		expect( doc.root.getChild( 2 ).hasAttr( newAttr ) ).to.be.true;
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

		doc.root.insertChildren( 0, new Character( 'x', [ fooAttr, barAttr ] ) );

		doc.applyOperation( new ChangeOperation(
			new Range( new Position( [ 0 ], doc.root ), new Position( [ 1 ], doc.root ) ),
			null,
			newAttr,
			doc.version ) );

		expect( doc.version ).to.be.equal( 1 );
		expect( doc.root.getChildCount() ).to.be.equal( 1 );
		expect( doc.root.getChild( 0 )._getAttrCount() ).to.be.equal( 3 );
		expect( doc.root.getChild( 0 ).hasAttr( newAttr ) ).to.be.true;
		expect( doc.root.getChild( 0 ).hasAttr( fooAttr ) ).to.be.true;
		expect( doc.root.getChild( 0 ).hasAttr( barAttr ) ).to.be.true;
	} );

	it( 'should change attributes on multiple ranges', function() {
		var Document = modules[ 'document/document' ];
		var ChangeOperation = modules[ 'document/changeoperation' ];
		var Position = modules[ 'document/position' ];
		var Range = modules[ 'document/range' ];
		var Text = modules[ 'document/text' ];
		var Attribute = modules[ 'document/attribute' ];

		var doc = new Document();

		var oldAttr = new Attribute( 'isNew', false );
		var newAttr = new Attribute( 'isNew', true );

		doc.root.insertChildren( 0, new Text( 'bar', [ oldAttr ] ) );

		doc.applyOperation( new ChangeOperation(
			[
				new Range( new Position( [ 0 ], doc.root ), new Position( [ 1 ], doc.root ) ),
				new Range( new Position( [ 2 ], doc.root ), new Position( [ 3 ], doc.root ) )
			],
			oldAttr,
			newAttr,
			doc.version ) );

		expect( doc.version ).to.be.equal( 1 );
		expect( doc.root.getChildCount() ).to.be.equal( 3 );
		expect( doc.root.getChild( 0 )._getAttrCount() ).to.be.equal( 1 );
		expect( doc.root.getChild( 0 ).hasAttr( newAttr ) ).to.be.true;
		expect( doc.root.getChild( 1 )._getAttrCount() ).to.be.equal( 1 );
		expect( doc.root.getChild( 1 ).hasAttr( oldAttr ) ).to.be.true;
		expect( doc.root.getChild( 2 )._getAttrCount() ).to.be.equal( 1 );
		expect( doc.root.getChild( 2 ).hasAttr( newAttr ) ).to.be.true;
	} );

	it( 'should change attribute to the set of nodes', function() {
		var Document = modules[ 'document/document' ];
		var ChangeOperation = modules[ 'document/changeoperation' ];
		var Position = modules[ 'document/position' ];
		var Range = modules[ 'document/range' ];
		var Text = modules[ 'document/text' ];
		var Attribute = modules[ 'document/attribute' ];

		var doc = new Document();

		var oldAttr = new Attribute( 'isNew', false );
		var newAttr = new Attribute( 'isNew', true );

		doc.root.insertChildren( 0, new Text( 'bar', [ oldAttr ] ) );

		doc.applyOperation( new ChangeOperation(
			new Range( new Position( [ 0 ], doc.root ), new Position( [ 2 ], doc.root ) ),
			oldAttr,
			newAttr,
			doc.version ) );

		expect( doc.version ).to.be.equal( 1 );
		expect( doc.root.getChildCount() ).to.be.equal( 3 );
		expect( doc.root.getChild( 0 )._getAttrCount() ).to.be.equal( 1 );
		expect( doc.root.getChild( 0 ).hasAttr( newAttr ) ).to.be.true;
		expect( doc.root.getChild( 1 )._getAttrCount() ).to.be.equal( 1 );
		expect( doc.root.getChild( 1 ).hasAttr( newAttr ) ).to.be.true;
		expect( doc.root.getChild( 2 )._getAttrCount() ).to.be.equal( 1 );
		expect( doc.root.getChild( 2 ).hasAttr( oldAttr ) ).to.be.true;
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

		doc.root.insertChildren( 0, new Character( 'x', [ fooAttr, x1Attr, barAttr ] ) );

		doc.applyOperation( new ChangeOperation(
			new Range( new Position( [ 0 ], doc.root ), new Position( [ 1 ], doc.root ) ),
			x1Attr,
			x2Attr,
			doc.version ) );

		expect( doc.version ).to.be.equal( 1 );
		expect( doc.root.getChildCount() ).to.be.equal( 1 );
		expect( doc.root.getChild( 0 )._getAttrCount() ).to.be.equal( 3 );
		expect( doc.root.getChild( 0 ).hasAttr( fooAttr ) ).to.be.true;
		expect( doc.root.getChild( 0 ).hasAttr( x2Attr ) ).to.be.true;
		expect( doc.root.getChild( 0 ).hasAttr( barAttr ) ).to.be.true;
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

		doc.root.insertChildren( 0, new Character( 'x', [ fooAttr, xAttr, barAttr ] ) );

		doc.applyOperation( new ChangeOperation(
			new Range( new Position( [ 0 ], doc.root ), new Position( [ 1 ], doc.root ) ),
			xAttr,
			null,
			doc.version ) );

		expect( doc.version ).to.be.equal( 1 );
		expect( doc.root.getChildCount() ).to.be.equal( 1 );
		expect( doc.root.getChild( 0 )._getAttrCount() ).to.be.equal( 2 );
		expect( doc.root.getChild( 0 ).hasAttr( fooAttr ) ).to.be.true;
		expect( doc.root.getChild( 0 ).hasAttr( barAttr ) ).to.be.true;
	} );

	it( 'should remove attributes on multiple ranges', function() {
		var Document = modules[ 'document/document' ];
		var ChangeOperation = modules[ 'document/changeoperation' ];
		var Position = modules[ 'document/position' ];
		var Range = modules[ 'document/range' ];
		var Text = modules[ 'document/text' ];
		var Attribute = modules[ 'document/attribute' ];

		var doc = new Document();

		var fooAttr = new Attribute( 'foo', true );

		doc.root.insertChildren( 0, new Text( 'bar', [ fooAttr ] ) );

		doc.applyOperation( new ChangeOperation(
			[
				new Range( new Position( [ 0 ], doc.root ), new Position( [ 1 ], doc.root ) ),
				new Range( new Position( [ 2 ], doc.root ), new Position( [ 3 ], doc.root ) )
			],
			fooAttr,
			null,
			doc.version ) );

		expect( doc.version ).to.be.equal( 1 );
		expect( doc.root.getChildCount() ).to.be.equal( 3 );
		expect( doc.root.getChild( 0 )._getAttrCount() ).to.be.equal( 0 );
		expect( doc.root.getChild( 1 ).hasAttr( fooAttr ) ).to.be.true;
		expect( doc.root.getChild( 2 )._getAttrCount() ).to.be.equal( 0 );
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

		var ranges = [ new Range( new Position( [ 0 ], doc.root ), new Position( [ 3 ], doc.root ) ) ];

		var oppertaion = new ChangeOperation( ranges, oldAttr, newAttr, doc.version );

		var reverse = oppertaion.reverseOperation();

		expect( reverse ).to.be.an.instanceof( ChangeOperation );
		expect( reverse.baseVersion ).to.be.equals( 1 );
		expect( reverse.ranges ).to.be.equals( ranges );
		expect( reverse.oldAttr ).to.be.equals( newAttr );
		expect( reverse.newAttr ).to.be.equals( oldAttr );
	} );

	it( 'should undo insert attribute by applying reverse operation', function() {
		var Document = modules[ 'document/document' ];
		var ChangeOperation = modules[ 'document/changeoperation' ];
		var Position = modules[ 'document/position' ];
		var Range = modules[ 'document/range' ];
		var Attribute = modules[ 'document/attribute' ];

		var doc = new Document();

		var newAttr = new Attribute( 'isNew', true );

		doc.root.insertChildren( 0, 'bar' );

		var oppertaion = new ChangeOperation(
			new Range( new Position( [ 0 ], doc.root ), new Position( [ 3 ], doc.root ) ),
			null,
			newAttr,
			doc.version );

		var reverse = oppertaion.reverseOperation();

		doc.applyOperation( oppertaion );

		doc.applyOperation( reverse );

		expect( doc.version ).to.be.equal( 2 );
		expect( doc.root.getChildCount() ).to.be.equal( 3 );
		expect( doc.root.getChild( 0 )._getAttrCount() ).to.be.equal( 0 );
		expect( doc.root.getChild( 1 )._getAttrCount() ).to.be.equal( 0 );
		expect( doc.root.getChild( 2 )._getAttrCount() ).to.be.equal( 0 );
	} );

	it( 'should undo change attribute by applying reverse operation', function() {
		var Document = modules[ 'document/document' ];
		var ChangeOperation = modules[ 'document/changeoperation' ];
		var Position = modules[ 'document/position' ];
		var Range = modules[ 'document/range' ];
		var Text = modules[ 'document/text' ];
		var Attribute = modules[ 'document/attribute' ];

		var doc = new Document();

		var oldAttr = new Attribute( 'isNew', false );
		var newAttr = new Attribute( 'isNew', true );

		doc.root.insertChildren( 0, new Text( 'bar', [ oldAttr ] ) );

		var oppertaion = new ChangeOperation(
			new Range( new Position( [ 0 ], doc.root ), new Position( [ 3 ], doc.root ) ),
			oldAttr,
			newAttr,
			doc.version );

		var reverse = oppertaion.reverseOperation();

		doc.applyOperation( oppertaion );

		doc.applyOperation( reverse );

		expect( doc.version ).to.be.equal( 2 );
		expect( doc.root.getChildCount() ).to.be.equal( 3 );
		expect( doc.root.getChild( 0 )._getAttrCount() ).to.be.equal( 1 );
		expect( doc.root.getChild( 0 ).hasAttr( oldAttr ) ).to.be.true;
		expect( doc.root.getChild( 1 )._getAttrCount() ).to.be.equal( 1 );
		expect( doc.root.getChild( 1 ).hasAttr( oldAttr ) ).to.be.true;
		expect( doc.root.getChild( 2 )._getAttrCount() ).to.be.equal( 1 );
		expect( doc.root.getChild( 2 ).hasAttr( oldAttr ) ).to.be.true;
	} );

	it( 'should undo remove attribute by applying reverse operation', function() {
		var Document = modules[ 'document/document' ];
		var ChangeOperation = modules[ 'document/changeoperation' ];
		var Position = modules[ 'document/position' ];
		var Range = modules[ 'document/range' ];
		var Text = modules[ 'document/text' ];
		var Attribute = modules[ 'document/attribute' ];

		var doc = new Document();

		var fooAttr = new Attribute( 'foo', false );

		doc.root.insertChildren( 0, new Text( 'bar', [ fooAttr ] ) );

		var oppertaion = new ChangeOperation(
			new Range( new Position( [ 0 ], doc.root ), new Position( [ 3 ], doc.root ) ),
			fooAttr,
			null,
			doc.version );

		var reverse = oppertaion.reverseOperation();

		doc.applyOperation( oppertaion );

		doc.applyOperation( reverse );

		expect( doc.version ).to.be.equal( 2 );
		expect( doc.root.getChildCount() ).to.be.equal( 3 );
		expect( doc.root.getChild( 0 )._getAttrCount() ).to.be.equal( 1 );
		expect( doc.root.getChild( 0 ).hasAttr( fooAttr ) ).to.be.true;
		expect( doc.root.getChild( 1 )._getAttrCount() ).to.be.equal( 1 );
		expect( doc.root.getChild( 1 ).hasAttr( fooAttr ) ).to.be.true;
		expect( doc.root.getChild( 2 )._getAttrCount() ).to.be.equal( 1 );
		expect( doc.root.getChild( 2 ).hasAttr( fooAttr ) ).to.be.true;
	} );

	it( 'should throw an error when one try to remove and the attribute does not exists', function() {
		var Document = modules[ 'document/document' ];
		var ChangeOperation = modules[ 'document/changeoperation' ];
		var Position = modules[ 'document/position' ];
		var Range = modules[ 'document/range' ];
		var Attribute = modules[ 'document/attribute' ];
		var CKEditorError = modules.ckeditorerror;

		var doc = new Document();

		var fooAttr = new Attribute( 'foo', true );

		doc.root.insertChildren( 0, 'x' );

		expect( function() {
			doc.applyOperation( new ChangeOperation(
				new Range( new Position( [ 0 ], doc.root ), new Position( [ 1 ], doc.root ) ),
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

		doc.root.insertChildren( 0, new Character( 'x', [ x1Attr ] ) );

		expect( function() {
			doc.applyOperation( new ChangeOperation(
				new Range( new Position( [ 0 ], doc.root ), new Position( [ 1 ], doc.root ) ),
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
		var Attribute = modules[ 'document/attribute' ];
		var CKEditorError = modules.ckeditorerror;

		var doc = new Document();

		var fooAttr = new Attribute( 'foo', true );
		var barAttr = new Attribute( 'bar', true );

		doc.root.insertChildren( 0, 'x' );

		expect( function() {
			doc.applyOperation( new ChangeOperation(
				new Range( new Position( [ 0 ], doc.root ), new Position( [ 1 ], doc.root ) ),
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
		var Attribute = modules[ 'document/attribute' ];
		var CKEditorError = modules.ckeditorerror;

		var doc = new Document();

		var x1Attr = new Attribute( 'x', 1 );
		var x2Attr = new Attribute( 'x', 2 );

		doc.root.insertChildren( 0, 'x' );

		expect( function() {
			doc.applyOperation( new ChangeOperation(
				new Range( new Position( [ 0 ], doc.root ), new Position( [ 1 ], doc.root ) ),
				x1Attr,
				x2Attr,
				doc.version ) );
		} ).to.throw( CKEditorError, /operation-change-no-attr-to-change/ );
	} );
} );