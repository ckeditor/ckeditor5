/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Model from '../../src/model/model';
import DataController from '../../src/controller/datacontroller';
import HtmlDataProcessor from '../../src/dataprocessor/htmldataprocessor';

import buildViewConverter from '../../src/conversion/buildviewconverter';
import buildModelConverter from '../../src/conversion/buildmodelconverter';

import ModelDocumentFragment from '../../src/model/documentfragment';

import ViewDocumentFragment from '../../src/view/documentfragment';

import { getData, setData, stringify, parse as parseModel } from '../../src/dev-utils/model';
import { parse as parseView } from '../../src/dev-utils/view';

import count from '@ckeditor/ckeditor5-utils/src/count';

describe( 'DataController', () => {
	let model, modelDocument, htmlDataProcessor, data, schema;

	beforeEach( () => {
		model = new Model();
		modelDocument = model.document;
		modelDocument.createRoot();
		modelDocument.createRoot( '$root', 'title' );

		htmlDataProcessor = new HtmlDataProcessor();

		data = new DataController( model, htmlDataProcessor );

		schema = model.schema;
	} );

	describe( 'constructor()', () => {
		it( 'works without data processor', () => {
			const data = new DataController( model );

			expect( data.processor ).to.be.undefined;
		} );
	} );

	describe( 'parse()', () => {
		it( 'should set text', () => {
			schema.extend( '$text', { allowIn: '$root' } );
			const output = data.parse( '<p>foo<b>bar</b></p>' );

			expect( output ).to.instanceof( ModelDocumentFragment );
			expect( stringify( output ) ).to.equal( 'foobar' );
		} );

		it( 'should set paragraph', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			buildViewConverter().for( data.viewToModel ).fromElement( 'p' ).toElement( 'paragraph' );

			const output = data.parse( '<p>foo<b>bar</b></p>' );

			expect( output ).to.instanceof( ModelDocumentFragment );
			expect( stringify( output ) ).to.equal( '<paragraph>foobar</paragraph>' );
		} );

		it( 'should set two paragraphs', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			buildViewConverter().for( data.viewToModel ).fromElement( 'p' ).toElement( 'paragraph' );

			const output = data.parse( '<p>foo</p><p>bar</p>' );

			expect( output ).to.instanceof( ModelDocumentFragment );
			expect( stringify( output ) ).to.equal( '<paragraph>foo</paragraph><paragraph>bar</paragraph>' );
		} );

		it( 'should set paragraphs with bold', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			schema.extend( '$text', {
				allowAttributes: [ 'bold' ]
			} );

			buildViewConverter().for( data.viewToModel ).fromElement( 'p' ).toElement( 'paragraph' );
			buildViewConverter().for( data.viewToModel ).fromElement( 'b' ).toAttribute( 'bold', true );

			const output = data.parse( '<p>foo<b>bar</b></p>' );

			expect( output ).to.instanceof( ModelDocumentFragment );
			expect( stringify( output ) ).to.equal( '<paragraph>foo<$text bold="true">bar</$text></paragraph>' );
		} );

		it( 'should parse in the root context by default', () => {
			const output = data.parse( 'foo' );

			expect( stringify( output ) ).to.equal( '' );
		} );

		it( 'should accept parsing context', () => {
			const output = data.parse( 'foo', '$block' );

			expect( stringify( output ) ).to.equal( 'foo' );
		} );
	} );

	describe( 'toModel()', () => {
		beforeEach( () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			buildViewConverter().for( data.viewToModel ).fromElement( 'p' ).toElement( 'paragraph' );
		} );

		it( 'should convert content of an element #1', () => {
			const viewElement = parseView( '<p>foo</p>' );
			const output = data.toModel( viewElement );

			expect( output ).to.instanceof( ModelDocumentFragment );
			expect( stringify( output ) ).to.equal( '<paragraph>foo</paragraph>' );
		} );

		it( 'should convert content of an element #2', () => {
			const viewFragment = parseView( '<p>foo</p><p>bar</p>' );
			const output = data.toModel( viewFragment );

			expect( output ).to.be.instanceOf( ModelDocumentFragment );
			expect( stringify( output ) ).to.equal( '<paragraph>foo</paragraph><paragraph>bar</paragraph>' );
		} );

		it( 'should accept parsing context', () => {
			modelDocument.createRoot( 'inlineRoot', 'inlineRoot' );

			schema.register( 'inlineRoot' );
			schema.extend( '$text', { allowIn: 'inlineRoot' } );

			const viewFragment = new ViewDocumentFragment( [ parseView( 'foo' ) ] );

			// Model fragment in root.
			expect( stringify( data.toModel( viewFragment ) ) ).to.equal( '' );

			// Model fragment in inline root.
			expect( stringify( data.toModel( viewFragment, 'inlineRoot' ) ) ).to.equal( 'foo' );
		} );
	} );

	describe( 'set()', () => {
		it( 'should set data to root', () => {
			schema.extend( '$text', { allowIn: '$root' } );
			data.set( 'foo' );

			expect( getData( model, { withoutSelection: true } ) ).to.equal( 'foo' );
		} );

		it( 'should create a batch', () => {
			schema.extend( '$text', { allowIn: '$root' } );
			data.set( 'foo' );

			expect( count( modelDocument.history.getDeltas() ) ).to.equal( 1 );
		} );

		it( 'should cause firing change event', () => {
			const spy = sinon.spy();

			schema.extend( '$text', { allowIn: '$root' } );
			model.document.on( 'change', spy );

			data.set( 'foo' );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should get root name as a parameter', () => {
			schema.extend( '$text', { allowIn: '$root' } );
			data.set( 'foo', 'main' );
			data.set( 'Bar', 'title' );

			expect( getData( model, { withoutSelection: true, rootName: 'main' } ) ).to.equal( 'foo' );
			expect( getData( model, { withoutSelection: true, rootName: 'title' } ) ).to.equal( 'Bar' );

			expect( count( modelDocument.history.getDeltas() ) ).to.equal( 2 );
		} );

		// This case was added when order of params was different and it really didn't work. Let's keep it
		// if anyone will ever try to change this.
		it( 'should allow setting empty data', () => {
			schema.extend( '$text', { allowIn: '$root' } );

			data.set( 'foo', 'title' );

			expect( getData( model, { withoutSelection: true, rootName: 'title' } ) ).to.equal( 'foo' );

			data.set( '', 'title' );

			expect( getData( model, { withoutSelection: true, rootName: 'title' } ) ).to.equal( '' );
		} );
	} );

	describe( 'get()', () => {
		it( 'should get paragraph with text', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			setData( model, '<paragraph>foo</paragraph>' );

			buildModelConverter().for( data.modelToView ).fromElement( 'paragraph' ).toElement( 'p' );

			expect( data.get() ).to.equal( '<p>foo</p>' );
		} );

		it( 'should get empty paragraph', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			setData( model, '<paragraph></paragraph>' );

			buildModelConverter().for( data.modelToView ).fromElement( 'paragraph' ).toElement( 'p' );

			expect( data.get() ).to.equal( '<p>&nbsp;</p>' );
		} );

		it( 'should get two paragraphs', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			setData( model, '<paragraph>foo</paragraph><paragraph>bar</paragraph>' );

			buildModelConverter().for( data.modelToView ).fromElement( 'paragraph' ).toElement( 'p' );

			expect( data.get() ).to.equal( '<p>foo</p><p>bar</p>' );
		} );

		it( 'should get text directly in root', () => {
			schema.extend( '$text', { allowIn: '$root' } );
			setData( model, 'foo' );

			expect( data.get() ).to.equal( 'foo' );
		} );

		it( 'should get paragraphs without bold', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			setData( model, '<paragraph>foo<$text bold="true">bar</$text></paragraph>' );

			buildModelConverter().for( data.modelToView ).fromElement( 'paragraph' ).toElement( 'p' );

			expect( data.get() ).to.equal( '<p>foobar</p>' );
		} );

		it( 'should get paragraphs with bold', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			setData( model, '<paragraph>foo<$text bold="true">bar</$text></paragraph>' );

			buildModelConverter().for( data.modelToView ).fromElement( 'paragraph' ).toElement( 'p' );
			buildModelConverter().for( data.modelToView ).fromAttribute( 'bold' ).toElement( 'b' );

			expect( data.get() ).to.equal( '<p>foo<b>bar</b></p>' );
		} );

		it( 'should get root name as a parameter', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			schema.extend( '$text', { allowIn: '$root' } );

			setData( model, '<paragraph>foo</paragraph>', { rootName: 'main' } );
			setData( model, 'Bar', { rootName: 'title' } );

			buildModelConverter().for( data.modelToView ).fromElement( 'paragraph' ).toElement( 'p' );
			buildModelConverter().for( data.modelToView ).fromAttribute( 'bold' ).toElement( 'b' );

			expect( data.get() ).to.equal( '<p>foo</p>' );
			expect( data.get( 'main' ) ).to.equal( '<p>foo</p>' );
			expect( data.get( 'title' ) ).to.equal( 'Bar' );
		} );
	} );

	describe( 'stringify()', () => {
		beforeEach( () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			schema.register( 'div' );

			schema.extend( '$block', { allowIn: 'div' } );
			schema.extend( 'div', { allowIn: '$root' } );

			buildModelConverter().for( data.modelToView ).fromElement( 'paragraph' ).toElement( 'p' );
		} );

		it( 'should stringify a content of an element', () => {
			const modelElement = parseModel( '<div><paragraph>foo</paragraph></div>', schema );

			expect( data.stringify( modelElement ) ).to.equal( '<p>foo</p>' );
		} );

		it( 'should stringify a content of a document fragment', () => {
			const modelDocumentFragment = parseModel( '<paragraph>foo</paragraph><paragraph>bar</paragraph>', schema );

			expect( data.stringify( modelDocumentFragment ) ).to.equal( '<p>foo</p><p>bar</p>' );
		} );
	} );

	describe( 'toView()', () => {
		beforeEach( () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			schema.register( 'div' );

			schema.extend( '$block', { allowIn: 'div' } );
			schema.extend( 'div', { allowIn: '$root' } );

			buildModelConverter().for( data.modelToView ).fromElement( 'paragraph' ).toElement( 'p' );
		} );

		it( 'should convert a content of an element', () => {
			const modelElement = parseModel( '<div><paragraph>foo</paragraph></div>', schema );

			const viewDocumentFragment = data.toView( modelElement );

			expect( viewDocumentFragment ).to.be.instanceOf( ViewDocumentFragment );

			const viewElement = viewDocumentFragment.getChild( 0 );

			expect( viewElement.name ).to.equal( 'p' );
			expect( viewElement.childCount ).to.equal( 1 );
			expect( viewElement.getChild( 0 ).data ).to.equal( 'foo' );
		} );

		it( 'should convert a document fragment', () => {
			const modelDocumentFragment = parseModel( '<paragraph>foo</paragraph><paragraph>bar</paragraph>', schema );
			const viewDocumentFragment = data.toView( modelDocumentFragment );

			expect( viewDocumentFragment ).to.be.instanceOf( ViewDocumentFragment );
			expect( viewDocumentFragment ).to.have.property( 'childCount', 2 );

			const viewElement = viewDocumentFragment.getChild( 0 );

			expect( viewElement.name ).to.equal( 'p' );
			expect( viewElement.childCount ).to.equal( 1 );
			expect( viewElement.getChild( 0 ).data ).to.equal( 'foo' );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should be there for you', () => {
			// Should not throw.
			data.destroy();

			expect( data ).to.respondTo( 'destroy' );
		} );
	} );
} );
