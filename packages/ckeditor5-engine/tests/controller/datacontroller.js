/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelDocument from '../../src/model/document';
import DataController from '../../src/controller/datacontroller';
import HtmlDataProcessor from '../../src/dataprocessor/htmldataprocessor';

import buildViewConverter from '../../src/conversion/buildviewconverter';
import buildModelConverter from '../../src/conversion/buildmodelconverter';

import ModelDocumentFragment from '../../src/model/documentfragment';
import ModelText from '../../src/model/text';
import ModelRange from '../../src/model/range';
import ModelSelection from '../../src/model/selection';

import ViewDocumentFragment from '../../src/view/documentfragment';

import { getData, setData, stringify, parse as parseModel } from '../../src/dev-utils/model';
import { parse as parseView } from '../../src/dev-utils/view';

import count from '@ckeditor/ckeditor5-utils/src/count';

describe( 'DataController', () => {
	let modelDocument, htmlDataProcessor, data, schema;

	beforeEach( () => {
		modelDocument = new ModelDocument();
		modelDocument.createRoot();
		modelDocument.createRoot( '$root', 'title' );

		htmlDataProcessor = new HtmlDataProcessor();

		data = new DataController( modelDocument, htmlDataProcessor );

		schema = modelDocument.schema;
	} );

	describe( 'constructor()', () => {
		it( 'works without data processor', () => {
			const data = new DataController( modelDocument );

			expect( data.processor ).to.be.undefined;
		} );
	} );

	describe( 'parse', () => {
		it( 'should set text', () => {
			schema.allow( { name: '$text', inside: '$root' } );
			const model = data.parse( '<p>foo<b>bar</b></p>' );

			expect( model ).to.instanceof( ModelDocumentFragment );
			expect( stringify( model ) ).to.equal( 'foobar' );
		} );

		it( 'should set paragraph', () => {
			schema.registerItem( 'paragraph', '$block' );

			buildViewConverter().for( data.viewToModel ).fromElement( 'p' ).toElement( 'paragraph' );

			const model = data.parse( '<p>foo<b>bar</b></p>' );

			expect( model ).to.instanceof( ModelDocumentFragment );
			expect( stringify( model ) ).to.equal( '<paragraph>foobar</paragraph>' );
		} );

		it( 'should set two paragraphs', () => {
			schema.registerItem( 'paragraph', '$block' );

			buildViewConverter().for( data.viewToModel ).fromElement( 'p' ).toElement( 'paragraph' );

			const model = data.parse( '<p>foo</p><p>bar</p>' );

			expect( model ).to.instanceof( ModelDocumentFragment );
			expect( stringify( model ) ).to.equal( '<paragraph>foo</paragraph><paragraph>bar</paragraph>' );
		} );

		it( 'should set paragraphs with bold', () => {
			schema.registerItem( 'paragraph', '$block' );
			schema.allow( { name: '$text', attributes: [ 'bold' ], inside: '$block' } );

			buildViewConverter().for( data.viewToModel ).fromElement( 'p' ).toElement( 'paragraph' );
			buildViewConverter().for( data.viewToModel ).fromElement( 'b' ).toAttribute( 'bold', true );

			const model = data.parse( '<p>foo<b>bar</b></p>' );

			expect( model ).to.instanceof( ModelDocumentFragment );
			expect( stringify( model ) ).to.equal( '<paragraph>foo<$text bold="true">bar</$text></paragraph>' );
		} );

		it( 'should parse in the root context by default', () => {
			const model = data.parse( 'foo' );

			expect( stringify( model ) ).to.equal( '' );
		} );

		it( 'should accept parsing context', () => {
			const model = data.parse( 'foo', '$block' );

			expect( stringify( model ) ).to.equal( 'foo' );
		} );
	} );

	describe( 'toModel', () => {
		beforeEach( () => {
			schema.registerItem( 'paragraph', '$block' );

			buildViewConverter().for( data.viewToModel ).fromElement( 'p' ).toElement( 'paragraph' );
		} );

		it( 'should convert content of an element #1', () => {
			const viewElement = parseView( '<p>foo</p>' );
			const model = data.toModel( viewElement );

			expect( model ).to.instanceof( ModelDocumentFragment );
			expect( stringify( model ) ).to.equal( '<paragraph>foo</paragraph>' );
		} );

		it( 'should convert content of an element #2', () => {
			const viewFragment = parseView( '<p>foo</p><p>bar</p>' );
			const model = data.toModel( viewFragment );

			expect( model ).to.be.instanceOf( ModelDocumentFragment );
			expect( stringify( model ) ).to.equal( '<paragraph>foo</paragraph><paragraph>bar</paragraph>' );
		} );

		it( 'should accept parsing context', () => {
			modelDocument.createRoot( 'inlineRoot', 'inlineRoot' );

			schema.registerItem( 'inlineRoot' );
			schema.allow( { name: '$text', inside: 'inlineRoot' } );

			const viewFragment = new ViewDocumentFragment( [ parseView( 'foo' ) ] );

			// Model fragment in root.
			expect( stringify( data.toModel( viewFragment ) ) ).to.equal( '' );

			// Model fragment in inline root.
			expect( stringify( data.toModel( viewFragment, 'inlineRoot' ) ) ).to.equal( 'foo' );
		} );
	} );

	describe( 'set', () => {
		it( 'should set data to root', () => {
			schema.allow( { name: '$text', inside: '$root' } );
			data.set( 'foo' );

			expect( getData( modelDocument, { withoutSelection: true } ) ).to.equal( 'foo' );
		} );

		it( 'should create a batch', () => {
			schema.allow( { name: '$text', inside: '$root' } );
			data.set( 'foo' );

			expect( count( modelDocument.history.getDeltas() ) ).to.equal( 1 );
		} );

		it( 'should fire #changesDone', () => {
			const spy = sinon.spy();

			schema.allow( { name: '$text', inside: '$root' } );
			modelDocument.on( 'changesDone', spy );

			data.set( 'foo' );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should get root name as a parameter', () => {
			schema.allow( { name: '$text', inside: '$root' } );
			data.set( 'foo', 'main' );
			data.set( 'Bar', 'title' );

			expect( getData( modelDocument, { withoutSelection: true, rootName: 'main' } ) ).to.equal( 'foo' );
			expect( getData( modelDocument, { withoutSelection: true, rootName: 'title' } ) ).to.equal( 'Bar' );

			expect( count( modelDocument.history.getDeltas() ) ).to.equal( 2 );
		} );

		// This case was added when order of params was different and it really didn't work. Let's keep it
		// if anyone will ever try to change this.
		it( 'should allow setting empty data', () => {
			schema.allow( { name: '$text', inside: '$root' } );

			data.set( 'foo', 'title' );

			expect( getData( modelDocument, { withoutSelection: true, rootName: 'title' } ) ).to.equal( 'foo' );

			data.set( '', 'title' );

			expect( getData( modelDocument, { withoutSelection: true, rootName: 'title' } ) ).to.equal( '' );
		} );
	} );

	describe( 'get', () => {
		it( 'should get paragraph with text', () => {
			modelDocument.schema.registerItem( 'paragraph', '$block' );
			setData( modelDocument, '<paragraph>foo</paragraph>' );

			buildModelConverter().for( data.modelToView ).fromElement( 'paragraph' ).toElement( 'p' );

			expect( data.get() ).to.equal( '<p>foo</p>' );
		} );

		it( 'should get empty paragraph', () => {
			modelDocument.schema.registerItem( 'paragraph', '$block' );
			setData( modelDocument, '<paragraph></paragraph>' );

			buildModelConverter().for( data.modelToView ).fromElement( 'paragraph' ).toElement( 'p' );

			expect( data.get() ).to.equal( '<p>&nbsp;</p>' );
		} );

		it( 'should get two paragraphs', () => {
			modelDocument.schema.registerItem( 'paragraph', '$block' );
			setData( modelDocument, '<paragraph>foo</paragraph><paragraph>bar</paragraph>' );

			buildModelConverter().for( data.modelToView ).fromElement( 'paragraph' ).toElement( 'p' );

			expect( data.get() ).to.equal( '<p>foo</p><p>bar</p>' );
		} );

		it( 'should get text directly in root', () => {
			modelDocument.schema.allow( { name: '$text', inside: '$root' } );
			setData( modelDocument, 'foo' );

			expect( data.get() ).to.equal( 'foo' );
		} );

		it( 'should get paragraphs without bold', () => {
			modelDocument.schema.registerItem( 'paragraph', '$block' );
			setData( modelDocument, '<paragraph>foo<$text bold="true">bar</$text></paragraph>' );

			buildModelConverter().for( data.modelToView ).fromElement( 'paragraph' ).toElement( 'p' );

			expect( data.get() ).to.equal( '<p>foobar</p>' );
		} );

		it( 'should get paragraphs with bold', () => {
			modelDocument.schema.registerItem( 'paragraph', '$block' );
			setData( modelDocument, '<paragraph>foo<$text bold="true">bar</$text></paragraph>' );

			buildModelConverter().for( data.modelToView ).fromElement( 'paragraph' ).toElement( 'p' );
			buildModelConverter().for( data.modelToView ).fromAttribute( 'bold' ).toElement( 'b' );

			expect( data.get() ).to.equal( '<p>foo<b>bar</b></p>' );
		} );

		it( 'should get root name as a parameter', () => {
			modelDocument.schema.registerItem( 'paragraph', '$block' );
			modelDocument.schema.allow( { name: '$text', inside: '$root' } );

			setData( modelDocument, '<paragraph>foo</paragraph>', { rootName: 'main' } );
			setData( modelDocument, 'Bar', { rootName: 'title' } );

			buildModelConverter().for( data.modelToView ).fromElement( 'paragraph' ).toElement( 'p' );
			buildModelConverter().for( data.modelToView ).fromAttribute( 'bold' ).toElement( 'b' );

			expect( data.get() ).to.equal( '<p>foo</p>' );
			expect( data.get( 'main' ) ).to.equal( '<p>foo</p>' );
			expect( data.get( 'title' ) ).to.equal( 'Bar' );
		} );
	} );

	describe( 'stringify', () => {
		beforeEach( () => {
			modelDocument.schema.registerItem( 'paragraph', '$block' );
			modelDocument.schema.registerItem( 'div' );

			modelDocument.schema.allow( { name: '$block', inside: 'div' } );
			modelDocument.schema.allow( { name: 'div', inside: '$root' } );

			buildModelConverter().for( data.modelToView ).fromElement( 'paragraph' ).toElement( 'p' );
		} );

		it( 'should stringify a content of an element', () => {
			const modelElement = parseModel( '<div><paragraph>foo</paragraph></div>', modelDocument.schema );

			expect( data.stringify( modelElement ) ).to.equal( '<p>foo</p>' );
		} );

		it( 'should stringify a content of a document fragment', () => {
			const modelDocumentFragment = parseModel( '<paragraph>foo</paragraph><paragraph>bar</paragraph>', modelDocument.schema );

			expect( data.stringify( modelDocumentFragment ) ).to.equal( '<p>foo</p><p>bar</p>' );
		} );
	} );

	describe( 'toView', () => {
		beforeEach( () => {
			modelDocument.schema.registerItem( 'paragraph', '$block' );
			modelDocument.schema.registerItem( 'div' );

			modelDocument.schema.allow( { name: '$block', inside: 'div' } );
			modelDocument.schema.allow( { name: 'div', inside: '$root' } );

			buildModelConverter().for( data.modelToView ).fromElement( 'paragraph' ).toElement( 'p' );
		} );

		it( 'should convert a content of an element', () => {
			const modelElement = parseModel( '<div><paragraph>foo</paragraph></div>', modelDocument.schema );

			const viewDocumentFragment = data.toView( modelElement );

			expect( viewDocumentFragment ).to.be.instanceOf( ViewDocumentFragment );

			const viewElement = viewDocumentFragment.getChild( 0 );

			expect( viewElement.name ).to.equal( 'p' );
			expect( viewElement.childCount ).to.equal( 1 );
			expect( viewElement.getChild( 0 ).data ).to.equal( 'foo' );
		} );

		it( 'should convert a document fragment', () => {
			const modelDocumentFragment = parseModel( '<paragraph>foo</paragraph><paragraph>bar</paragraph>', modelDocument.schema );

			const viewDocumentFragment = data.toView( modelDocumentFragment );

			expect( viewDocumentFragment ).to.be.instanceOf( ViewDocumentFragment );
			expect( viewDocumentFragment ).to.have.property( 'childCount', 2 );

			const viewElement = viewDocumentFragment.getChild( 0 );

			expect( viewElement.name ).to.equal( 'p' );
			expect( viewElement.childCount ).to.equal( 1 );
			expect( viewElement.getChild( 0 ).data ).to.equal( 'foo' );
		} );
	} );

	describe( 'destroy', () => {
		it( 'should be there for you', () => {
			// Should not throw.
			data.destroy();

			expect( data ).to.respondTo( 'destroy' );
		} );
	} );

	describe( 'insertContent', () => {
		it( 'should be decorated', () => {
			schema.allow( { name: '$text', inside: '$root' } ); // To surpress warnings.

			const spy = sinon.spy();

			data.on( 'insertContent', spy );

			data.insertContent( new ModelText( 'a' ), modelDocument.selection );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should insert content (item)', () => {
			schema.registerItem( 'paragraph', '$block' );

			setData( modelDocument, '<paragraph>fo[]ar</paragraph>' );

			data.insertContent( new ModelText( 'ob' ), modelDocument.selection );

			expect( getData( modelDocument ) ).to.equal( '<paragraph>foob[]ar</paragraph>' );
		} );

		it( 'should insert content (document fragment)', () => {
			schema.registerItem( 'paragraph', '$block' );

			setData( modelDocument, '<paragraph>fo[]ar</paragraph>' );

			data.insertContent( new ModelDocumentFragment( [ new ModelText( 'ob' ) ] ), modelDocument.selection );

			expect( getData( modelDocument ) ).to.equal( '<paragraph>foob[]ar</paragraph>' );
		} );
	} );

	describe( 'deleteContent', () => {
		it( 'should be decorated', () => {
			const spy = sinon.spy();

			data.on( 'deleteContent', spy );

			data.deleteContent( modelDocument.selection );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should delete selected content', () => {
			schema.registerItem( 'paragraph', '$block' );

			setData( modelDocument, '<paragraph>fo[ob]ar</paragraph>' );

			data.deleteContent( modelDocument.selection, modelDocument.batch() );

			expect( getData( modelDocument ) ).to.equal( '<paragraph>fo[]ar</paragraph>' );
		} );
	} );

	describe( 'modifySelection', () => {
		it( 'should be decorated', () => {
			schema.registerItem( 'paragraph', '$block' );
			setData( modelDocument, '<paragraph>fo[ob]ar</paragraph>' );

			const spy = sinon.spy();

			data.on( 'modifySelection', spy );

			data.modifySelection( modelDocument.selection );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should modify a selection', () => {
			schema.registerItem( 'paragraph', '$block' );

			setData( modelDocument, '<paragraph>fo[ob]ar</paragraph>' );

			data.modifySelection( modelDocument.selection, { direction: 'backward' } );

			expect( getData( modelDocument ) ).to.equal( '<paragraph>fo[o]bar</paragraph>' );
		} );
	} );

	describe( 'getSelectedContent', () => {
		it( 'should be decorated', () => {
			const spy = sinon.spy();
			const sel = new ModelSelection();

			data.on( 'getSelectedContent', spy );

			data.getSelectedContent( sel );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should return selected content', () => {
			schema.registerItem( 'paragraph', '$block' );

			setData( modelDocument, '<paragraph>fo[ob]ar</paragraph>' );

			const content = data.getSelectedContent( modelDocument.selection );

			expect( stringify( content ) ).to.equal( 'ob' );
		} );
	} );

	describe( 'hasContent', () => {
		let root;

		beforeEach( () => {
			schema.registerItem( 'paragraph', '$block' );
			schema.registerItem( 'div', '$block' );
			schema.allow( { name: '$block', inside: 'div' } );
			schema.registerItem( 'image' );
			schema.allow( { name: 'image', inside: 'div' } );
			schema.objects.add( 'image' );

			setData(
				modelDocument,

				'<div>' +
					'<paragraph></paragraph>' +
				'</div>' +
				'<paragraph>foo</paragraph>' +
				'<div>' +
					'<image></image>' +
				'</div>'
			);

			root = modelDocument.getRoot();
		} );

		it( 'should return true if given element has text node', () => {
			const pFoo = root.getChild( 1 );

			expect( data.hasContent( pFoo ) ).to.be.true;
		} );

		it( 'should return true if given element has element that is an object', () => {
			const divImg = root.getChild( 2 );

			expect( data.hasContent( divImg ) ).to.be.true;
		} );

		it( 'should return false if given element has no elements', () => {
			const pEmpty = root.getChild( 0 ).getChild( 0 );

			expect( data.hasContent( pEmpty ) ).to.be.false;
		} );

		it( 'should return false if given element has only elements that are not objects', () => {
			const divP = root.getChild( 0 );

			expect( data.hasContent( divP ) ).to.be.false;
		} );

		it( 'should return true if there is a text node in given range', () => {
			const range = ModelRange.createFromParentsAndOffsets( root, 1, root, 2 );

			expect( data.hasContent( range ) ).to.be.true;
		} );

		it( 'should return true if there is a part of text node in given range', () => {
			const pFoo = root.getChild( 1 );
			const range = ModelRange.createFromParentsAndOffsets( pFoo, 1, pFoo, 2 );

			expect( data.hasContent( range ) ).to.be.true;
		} );

		it( 'should return true if there is element that is an object in given range', () => {
			const divImg = root.getChild( 2 );
			const range = ModelRange.createFromParentsAndOffsets( divImg, 0, divImg, 1 );

			expect( data.hasContent( range ) ).to.be.true;
		} );

		it( 'should return false if range is collapsed', () => {
			const range = ModelRange.createFromParentsAndOffsets( root, 1, root, 1 );

			expect( data.hasContent( range ) ).to.be.false;
		} );

		it( 'should return false if range has only elements that are not objects', () => {
			const range = ModelRange.createFromParentsAndOffsets( root, 0, root, 1 );

			expect( data.hasContent( range ) ).to.be.false;
		} );
	} );
} );
