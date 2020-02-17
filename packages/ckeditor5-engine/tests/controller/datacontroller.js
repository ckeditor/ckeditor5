/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Model from '../../src/model/model';
import ModelRange from '../../src/model/range';
import ViewRange from '../../src/view/range';
import DataController from '../../src/controller/datacontroller';
import HtmlDataProcessor from '../../src/dataprocessor/htmldataprocessor';

import ModelDocumentFragment from '../../src/model/documentfragment';
import ViewDocumentFragment from '../../src/view/documentfragment';
import ViewDocument from '../../src/view/document';

import { getData, setData, stringify, parse as parseModel } from '../../src/dev-utils/model';
import { parse as parseView, stringify as stringifyView } from '../../src/dev-utils/view';

import count from '@ckeditor/ckeditor5-utils/src/count';

import UpcastHelpers from '../../src/conversion/upcasthelpers';
import DowncastHelpers from '../../src/conversion/downcasthelpers';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

describe( 'DataController', () => {
	let model, modelDocument, htmlDataProcessor, data, schema, upcastHelpers, downcastHelpers, viewDocument;

	beforeEach( () => {
		model = new Model();

		schema = model.schema;
		modelDocument = model.document;

		modelDocument.createRoot();
		modelDocument.createRoot( '$title', 'title' );

		schema.register( '$title', { inheritAllFrom: '$root' } );

		htmlDataProcessor = new HtmlDataProcessor();
		viewDocument = new ViewDocument();

		data = new DataController( model, htmlDataProcessor );

		upcastHelpers = new UpcastHelpers( [ data.upcastDispatcher ] );
		downcastHelpers = new DowncastHelpers( [ data.downcastDispatcher ] );
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

			upcastHelpers.elementToElement( { view: 'p', model: 'paragraph' } );

			const output = data.parse( '<p>foo<b>bar</b></p>' );

			expect( output ).to.instanceof( ModelDocumentFragment );
			expect( stringify( output ) ).to.equal( '<paragraph>foobar</paragraph>' );
		} );

		it( 'should set two paragraphs', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			upcastHelpers.elementToElement( { view: 'p', model: 'paragraph' } );

			const output = data.parse( '<p>foo</p><p>bar</p>' );

			expect( output ).to.instanceof( ModelDocumentFragment );
			expect( stringify( output ) ).to.equal( '<paragraph>foo</paragraph><paragraph>bar</paragraph>' );
		} );

		it( 'should set paragraphs with bold', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			schema.extend( '$text', {
				allowAttributes: [ 'bold' ]
			} );

			upcastHelpers.elementToElement( { view: 'p', model: 'paragraph' } );
			upcastHelpers.elementToAttribute( { view: 'strong', model: 'bold' } );

			const output = data.parse( '<p>foo<strong>bar</strong></p>' );

			expect( output ).to.instanceof( ModelDocumentFragment );
			expect( stringify( output ) ).to.equal( '<paragraph>foo<$text bold="true">bar</$text></paragraph>' );
		} );

		it( 'should parse in the root context by default', () => {
			const output = data.parse( 'foo' );

			expect( stringify( output ) ).to.equal( '' );
		} );

		it( 'should accept parsing context', () => {
			const output = data.parse( 'foo', [ '$block' ] );

			expect( stringify( output ) ).to.equal( 'foo' );
		} );
	} );

	describe( 'toModel()', () => {
		beforeEach( () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			upcastHelpers.elementToElement( { view: 'p', model: 'paragraph' } );
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

			const viewFragment = new ViewDocumentFragment( viewDocument, [ parseView( 'foo' ) ] );

			// Model fragment in root.
			expect( stringify( data.toModel( viewFragment ) ) ).to.equal( '' );

			// Model fragment in inline root.
			expect( stringify( data.toModel( viewFragment, [ 'inlineRoot' ] ) ) ).to.equal( 'foo' );
		} );
	} );

	describe( 'init()', () => {
		it( 'should be decorated', () => {
			const spy = sinon.spy();

			data.on( 'init', spy );

			data.init( 'foo bar' );

			sinon.assert.calledWithExactly( spy, sinon.match.any, [ 'foo bar' ] );
		} );

		it( 'should fire ready event after init', () => {
			const spy = sinon.spy();

			data.on( 'ready', spy );

			data.init( 'foo bar' );

			sinon.assert.called( spy );
		} );

		it( 'should throw an error when document data is already initialized', () => {
			data.init( '<p>Foo</p>' );

			expectToThrowCKEditorError( () => {
				data.init( '<p>Bar</p>' );
			}, /datacontroller-init-document-not-empty:/, model );
		} );

		it( 'should set data to default main root', () => {
			schema.extend( '$text', { allowIn: '$root' } );
			data.init( 'foo' );

			expect( getData( model, { withoutSelection: true } ) ).to.equal( 'foo' );
		} );

		it( 'should set data to multiple roots at once', () => {
			schema.extend( '$text', { allowIn: '$root' } );
			data.init( { main: 'bar', title: 'baz' } );

			expect( getData( model, { withoutSelection: true } ) ).to.equal( 'bar' );
			expect( getData( model, { withoutSelection: true, rootName: 'title' } ) ).to.equal( 'baz' );
		} );

		it( 'should get root name as a parameter', () => {
			schema.extend( '$text', { allowIn: '$root' } );
			data.init( { title: 'foo' } );

			expect( getData( model, { withoutSelection: true, rootName: 'title' } ) ).to.equal( 'foo' );
		} );

		it( 'should create a batch', () => {
			schema.extend( '$text', { allowIn: '$root' } );
			data.init( 'foo' );

			expect( count( modelDocument.history.getOperations() ) ).to.equal( 1 );
		} );

		it( 'should cause firing change event', () => {
			const spy = sinon.spy();

			schema.extend( '$text', { allowIn: '$root' } );
			model.document.on( 'change', spy );

			data.init( 'foo' );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should return a resolved Promise', () => {
			const promise = data.init( '<p>Foo</p>' );

			expect( promise ).to.be.instanceof( Promise );

			return promise;
		} );

		it( 'should throw an error when non-existent root is used (single)', () => {
			expectToThrowCKEditorError( () => {
				data.init( { nonexistent: '<p>Bar</p>' } );
			}, /^datacontroller-init-non-existent-root:/ );
		} );

		it( 'should throw an error when non-existent root is used (one of many)', () => {
			schema.extend( '$text', { allowIn: '$root' } );

			expectToThrowCKEditorError( () => {
				data.init( { main: 'bar', nonexistent: '<p>Bar</p>' } );
			}, /^datacontroller-init-non-existent-root:/, model );

			expect( getData( model, { withoutSelection: true } ) ).to.equal( '' );
		} );
	} );

	describe( 'set()', () => {
		it( 'should set data to default main root', () => {
			schema.extend( '$text', { allowIn: '$root' } );
			data.set( 'foo' );

			expect( getData( model, { withoutSelection: true } ) ).to.equal( 'foo' );
		} );

		it( 'should create a batch', () => {
			schema.extend( '$text', { allowIn: '$root' } );
			data.set( 'foo' );

			expect( count( modelDocument.history.getOperations() ) ).to.equal( 1 );
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
			data.set( 'foo' );
			data.set( { title: 'Bar' } );

			expect( getData( model, { withoutSelection: true, rootName: 'main' } ) ).to.equal( 'foo' );
			expect( getData( model, { withoutSelection: true, rootName: 'title' } ) ).to.equal( 'Bar' );

			expect( count( modelDocument.history.getOperations() ) ).to.equal( 2 );
		} );

		it( 'should parse given data before set in a context of correct root', () => {
			schema.extend( '$text', { allowIn: '$title', disallowIn: '$root' } );
			data.set( 'foo', 'main' );
			data.set( { title: 'Bar' } );

			expect( getData( model, { withoutSelection: true, rootName: 'main' } ) ).to.equal( '' );
			expect( getData( model, { withoutSelection: true, rootName: 'title' } ) ).to.equal( 'Bar' );

			expect( count( modelDocument.history.getOperations() ) ).to.equal( 2 );
		} );

		// This case was added when order of params was different and it really didn't work. Let's keep it
		// if anyone will ever try to change this.
		it( 'should allow setting empty data', () => {
			schema.extend( '$text', { allowIn: '$root' } );

			data.set( { title: 'foo' } );

			expect( getData( model, { withoutSelection: true, rootName: 'title' } ) ).to.equal( 'foo' );

			data.set( { title: '' } );

			expect( getData( model, { withoutSelection: true, rootName: 'title' } ) ).to.equal( '' );
		} );

		it( 'should throw an error when non-existent root is used (single)', () => {
			expectToThrowCKEditorError( () => {
				data.set( { nonexistent: '<p>Bar</p>' } );
			}, /datacontroller-set-non-existent-root:/, model );
		} );

		it( 'should throw an error when non-existent root is used (one of many) without touching any roots data', () => {
			schema.extend( '$text', { allowIn: '$root' } );
			data.set( 'foo' );

			expectToThrowCKEditorError( () => {
				data.set( { main: 'bar', nonexistent: '<p>Bar</p>' } );
			}, /datacontroller-set-non-existent-root:/, model );

			expect( getData( model, { withoutSelection: true } ) ).to.equal( 'foo' );
		} );

		// https://github.com/ckeditor/ckeditor5-engine/issues/1721.
		it( 'should not throw when setting the data with markers that already exist in the editor', () => {
			schema.extend( '$text', { allowIn: '$root' } );

			data.set( 'foo' );

			downcastHelpers.markerToElement( { model: 'marker', view: 'marker' } );
			upcastHelpers.elementToMarker( { view: 'marker', model: 'marker' } );

			model.change( writer => {
				writer.addMarker( 'marker', { range: writer.createRangeIn( modelDocument.getRoot() ), usingOperation: true } );
			} );

			expect( () => {
				data.set( data.get() );
			} ).not.to.throw();
		} );
	} );

	describe( 'get()', () => {
		it( 'should get paragraph with text', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			setData( model, '<paragraph>foo</paragraph>' );

			downcastHelpers.elementToElement( { model: 'paragraph', view: 'p' } );

			expect( data.get() ).to.equal( '<p>foo</p>' );
			expect( data.get( { trim: 'empty' } ) ).to.equal( '<p>foo</p>' );
		} );

		it( 'should trim empty paragraph by default', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			setData( model, '<paragraph></paragraph>' );

			downcastHelpers.elementToElement( { model: 'paragraph', view: 'p' } );

			expect( data.get() ).to.equal( '' );
			expect( data.get( { trim: 'empty' } ) ).to.equal( '' );
		} );

		it( 'should get empty paragraph (with trim=none)', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			setData( model, '<paragraph></paragraph>' );

			downcastHelpers.elementToElement( { model: 'paragraph', view: 'p' } );

			expect( data.get( { trim: 'none' } ) ).to.equal( '<p>&nbsp;</p>' );
		} );

		it( 'should get two paragraphs', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			setData( model, '<paragraph>foo</paragraph><paragraph>bar</paragraph>' );

			downcastHelpers.elementToElement( { model: 'paragraph', view: 'p' } );

			expect( data.get() ).to.equal( '<p>foo</p><p>bar</p>' );
			expect( data.get( { trim: 'empty' } ) ).to.equal( '<p>foo</p><p>bar</p>' );
		} );

		it( 'should get text directly in root', () => {
			schema.extend( '$text', { allowIn: '$root' } );
			setData( model, 'foo' );

			expect( data.get() ).to.equal( 'foo' );
			expect( data.get( { trim: 'empty' } ) ).to.equal( 'foo' );
		} );

		it( 'should get paragraphs without bold', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			setData( model, '<paragraph>foo<$text bold="true">bar</$text></paragraph>' );

			downcastHelpers.elementToElement( { model: 'paragraph', view: 'p' } );

			expect( data.get() ).to.equal( '<p>foobar</p>' );
			expect( data.get( { trim: 'empty' } ) ).to.equal( '<p>foobar</p>' );
		} );

		it( 'should get paragraphs with bold', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			setData( model, '<paragraph>foo<$text bold="true">bar</$text></paragraph>' );

			downcastHelpers.elementToElement( { model: 'paragraph', view: 'p' } );
			downcastHelpers.attributeToElement( { model: 'bold', view: 'strong' } );

			expect( data.get() ).to.equal( '<p>foo<strong>bar</strong></p>' );
			expect( data.get( { trim: 'empty' } ) ).to.equal( '<p>foo<strong>bar</strong></p>' );
		} );

		it( 'should get root name as a parameter', () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			schema.extend( '$text', { allowIn: '$root' } );

			setData( model, '<paragraph>foo</paragraph>', { rootName: 'main' } );
			setData( model, 'Bar', { rootName: 'title' } );

			downcastHelpers.elementToElement( { model: 'paragraph', view: 'p' } );
			downcastHelpers.attributeToElement( { model: 'bold', view: 'strong' } );

			expect( data.get() ).to.equal( '<p>foo</p>' );
			expect( data.get( { rootName: 'main' } ) ).to.equal( '<p>foo</p>' );
			expect( data.get( { rootName: 'title' } ) ).to.equal( 'Bar' );
		} );

		it( 'should throw an error when non-existent root is used', () => {
			expectToThrowCKEditorError( () => {
				data.get( { rootName: 'nonexistent' } );
			}, /datacontroller-get-non-existent-root:/ );
		} );
	} );

	describe( 'stringify()', () => {
		beforeEach( () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			schema.register( 'div' );

			schema.extend( '$block', { allowIn: 'div' } );
			schema.extend( 'div', { allowIn: '$root' } );

			downcastHelpers.elementToElement( { model: 'paragraph', view: 'p' } );
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

			downcastHelpers.elementToElement( { model: 'paragraph', view: 'p' } );
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

		it( 'should correctly convert document markers #1', () => {
			const modelElement = parseModel( '<div><paragraph>foobar</paragraph></div>', schema );
			const modelRoot = model.document.getRoot();

			downcastHelpers.markerToHighlight( { model: 'marker:a', view: { classes: 'a' } } );

			model.change( writer => {
				writer.insert( modelElement, modelRoot, 0 );
				const range = writer.createRange( writer.createPositionAt( modelRoot, 0 ), writer.createPositionAt( modelRoot, 1 ) );
				writer.addMarker( 'marker:a', { range, usingOperation: true } );
			} );

			const viewDocumentFragment = data.toView( modelElement );
			const viewElement = viewDocumentFragment.getChild( 0 );

			expect( stringifyView( viewElement ) ).to.equal( '<p><span class="a">foobar</span></p>' );
		} );

		it( 'should correctly convert document markers #2', () => {
			const modelElement = parseModel( '<div><paragraph>foo</paragraph><paragraph>bar</paragraph></div>', schema );
			const modelRoot = model.document.getRoot();

			downcastHelpers.markerToHighlight( { model: 'marker:a', view: { classes: 'a' } } );
			downcastHelpers.markerToHighlight( { model: 'marker:b', view: { classes: 'b' } } );

			const modelP1 = modelElement.getChild( 0 );
			const modelP2 = modelElement.getChild( 1 );

			model.change( writer => {
				writer.insert( modelElement, modelRoot, 0 );

				const rangeA = writer.createRange( writer.createPositionAt( modelP1, 1 ), writer.createPositionAt( modelP1, 3 ) );
				const rangeB = writer.createRange( writer.createPositionAt( modelP2, 0 ), writer.createPositionAt( modelP2, 2 ) );

				writer.addMarker( 'marker:a', { range: rangeA, usingOperation: true } );
				writer.addMarker( 'marker:b', { range: rangeB, usingOperation: true } );
			} );

			const viewDocumentFragment = data.toView( modelP1 );

			expect( stringifyView( viewDocumentFragment ) ).to.equal( 'f<span class="a">oo</span>' );
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

		it( 'should keep view-model mapping', () => {
			const modelDocumentFragment = parseModel( '<paragraph>foo</paragraph><paragraph>bar</paragraph>', schema );
			const viewDocumentFragment = data.toView( modelDocumentFragment );

			const firstModelElement = modelDocumentFragment.getChild( 0 );
			const firstViewElement = viewDocumentFragment.getChild( 0 );

			const modelRange = ModelRange._createOn( firstModelElement );
			const viewRange = ViewRange._createOn( firstViewElement );

			const mappedModelRange = data.mapper.toModelRange( viewRange );
			const mappedViewRange = data.mapper.toViewRange( modelRange );

			expect( mappedModelRange ).to.be.instanceOf( ModelRange );
			expect( mappedViewRange ).to.be.instanceOf( ViewRange );

			expect( mappedModelRange.end.nodeBefore ).to.equal( firstModelElement );
			expect( mappedModelRange.end.nodeAfter ).to.equal( modelDocumentFragment.getChild( 1 ) );
			expect( mappedViewRange.end.nodeBefore ).to.equal( firstViewElement );
			expect( mappedViewRange.end.nodeAfter ).to.equal( viewDocumentFragment.getChild( 1 ) );
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
