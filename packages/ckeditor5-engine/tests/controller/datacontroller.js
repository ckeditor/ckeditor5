/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Model from '../../src/model/model.js';
import ModelRange from '../../src/model/range.js';
import ViewRange from '../../src/view/range.js';
import DataController from '../../src/controller/datacontroller.js';
import HtmlDataProcessor from '../../src/dataprocessor/htmldataprocessor.js';

import ModelDocumentFragment from '../../src/model/documentfragment.js';
import ViewDocumentFragment from '../../src/view/documentfragment.js';
import ViewDocument from '../../src/view/document.js';

import { getData, setData, stringify, parse as parseModel } from '../../src/dev-utils/model.js';
import { parse as parseView, stringify as stringifyView } from '../../src/dev-utils/view.js';

import count from '@ckeditor/ckeditor5-utils/src/count.js';

import UpcastHelpers from '../../src/conversion/upcasthelpers.js';
import DowncastHelpers from '../../src/conversion/downcasthelpers.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';

describe( 'DataController', () => {
	let model, modelDocument, data, schema, upcastHelpers, downcastHelpers, viewDocument;

	beforeEach( () => {
		const stylesProcessor = new StylesProcessor();
		model = new Model();

		schema = model.schema;
		modelDocument = model.document;

		modelDocument.createRoot();
		modelDocument.createRoot( '$title', 'title' );

		schema.register( '$title', { inheritAllFrom: '$root' } );

		viewDocument = new ViewDocument( stylesProcessor );
		data = new DataController( model, stylesProcessor );
		upcastHelpers = new UpcastHelpers( [ data.upcastDispatcher ] );
		downcastHelpers = new DowncastHelpers( [ data.downcastDispatcher ] );
	} );

	describe( 'constructor()', () => {
		it( 'sets the model and styles processor properties', () => {
			const stylesProcessor = new StylesProcessor();
			const data = new DataController( model, stylesProcessor );

			expect( data.model ).to.equal( model );
			expect( data.stylesProcessor ).to.equal( stylesProcessor );
		} );

		it( 'should create the #viewDocument property', () => {
			const stylesProcessor = new StylesProcessor();
			const data = new DataController( model, stylesProcessor );

			expect( data.viewDocument ).to.be.instanceOf( ViewDocument );
		} );

		it( 'should create #htmlProcessor property', () => {
			const stylesProcessor = new StylesProcessor();
			const data = new DataController( model, stylesProcessor );

			expect( data.htmlProcessor ).to.be.instanceOf( HtmlDataProcessor );
		} );

		it( 'should assign #htmlProcessor property to the #processor property', () => {
			const stylesProcessor = new StylesProcessor();
			const data = new DataController( model, stylesProcessor );

			expect( data.htmlProcessor ).to.equal( data.processor );
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

		it( 'should parse template with children', () => {
			schema.register( 'container', { inheritAllFrom: '$block' } );
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			schema.extend( 'paragraph', { allowIn: [ 'container' ] } );

			upcastHelpers.elementToElement( { view: 'template', model: 'container' } );
			upcastHelpers.elementToElement( { view: 'p', model: 'paragraph' } );

			const output = data.parse( '<template><p>foo</p></template>' );

			expect( output ).to.instanceof( ModelDocumentFragment );
			expect( stringify( output ) ).to.equal( '<container><paragraph>foo</paragraph></container>' );
		} );
	} );

	describe( 'toModel()', () => {
		beforeEach( () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			upcastHelpers.elementToElement( { view: 'p', model: 'paragraph' } );
		} );

		it( 'should be decorated', () => {
			const viewElement = parseView( '<p>foo</p>' );
			const spy = sinon.spy();

			data.on( 'toModel', spy );
			data.toModel( viewElement );

			sinon.assert.calledWithExactly( spy, sinon.match.any, [ viewElement ] );
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

			schema.register( 'inlineRoot', { allowChildren: '$text' } );

			const viewFragment = new ViewDocumentFragment( viewDocument, [ parseView( 'foo' ) ] );

			// Model fragment in root (note that it is auto-paragraphed because $text is not allowed directly in $root).
			expect( stringify( data.toModel( viewFragment ) ) ).to.equal( '<paragraph>foo</paragraph>' );

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
			}, /datacontroller-init-document-not-empty/, model );
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
			}, 'datacontroller-init-non-existent-root' );
		} );

		it( 'should throw an error when non-existent root is used (one of many)', () => {
			schema.extend( '$text', { allowIn: '$root' } );

			expectToThrowCKEditorError( () => {
				data.init( { main: 'bar', nonexistent: '<p>Bar</p>' } );
			}, /^datacontroller-init-non-existent-root/, model );

			expect( getData( model, { withoutSelection: true } ) ).to.equal( '' );
		} );
	} );

	describe( 'set()', () => {
		it( 'should be decorated', () => {
			const spy = sinon.spy();

			data.on( 'set', spy );

			data.set( 'foo bar' );

			sinon.assert.calledWithExactly( spy, sinon.match.any, [ 'foo bar' ] );
		} );

		it( 'should set data to default main root', () => {
			schema.extend( '$text', { allowIn: '$root' } );
			data.set( 'foo' );

			expect( getData( model, { withoutSelection: true } ) ).to.equal( 'foo' );
		} );

		it( 'should create a batch', () => {
			schema.extend( '$text', { allowIn: '$root' } );
			data.set( 'foo' );

			expect( modelDocument.history.getOperations().length ).to.equal( 1 );
		} );

		it( 'should create a batch with default type if `batchType` option is not given', () => {
			schema.extend( '$text', { allowIn: '$root' } );
			data.set( 'foo' );

			const operation = modelDocument.history.getOperations()[ 0 ];
			const batch = operation.batch;

			expect( batch.isUndoable ).to.be.true;
			expect( batch.isLocal ).to.be.true;
			expect( batch.isUndo ).to.be.false;
			expect( batch.isTyping ).to.be.false;
		} );

		it( 'should create a batch specified by the `options.batch` option when provided', () => {
			schema.extend( '$text', { allowIn: '$root' } );
			data.set( 'foo', { batchType: { isUndoable: true } } );

			const operation = modelDocument.history.getOperations()[ 0 ];

			expect( operation.batch.isUndoable ).to.be.true;
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
			schema.extend( '$text', { allowIn: '$title' } );
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
			}, /datacontroller-set-non-existent-root/, model );
		} );

		it( 'should throw an error when non-existent root is used (one of many) without touching any roots data', () => {
			schema.extend( '$text', { allowIn: '$root' } );
			data.set( 'foo' );

			expectToThrowCKEditorError( () => {
				data.set( { main: 'bar', nonexistent: '<p>Bar</p>' } );
			}, /datacontroller-set-non-existent-root/, model );

			expect( getData( model, { withoutSelection: true } ) ).to.equal( 'foo' );
		} );

		// https://github.com/ckeditor/ckeditor5-engine/issues/1721.
		it( 'should not throw when setting the data with markers that already exist in the editor', () => {
			schema.extend( '$text', { allowIn: '$root' } );

			data.set( 'foo' );

			downcastHelpers.markerToData( { model: 'marker' } );
			upcastHelpers.dataToMarker( { view: 'marker' } );

			model.change( writer => {
				writer.addMarker( 'marker', { range: writer.createRangeIn( modelDocument.getRoot() ), usingOperation: true } );
			} );

			expect( () => {
				data.set( data.get() );
			} ).not.to.throw();
		} );
	} );

	describe( 'get()', () => {
		beforeEach( () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			downcastHelpers.elementToElement( { model: 'paragraph', view: 'p' } );
		} );

		it( 'should be decorated', () => {
			const spy = sinon.spy();

			data.on( 'get', spy );

			data.get();

			sinon.assert.calledWithExactly( spy, sinon.match.any, [] );
		} );

		it( 'should get paragraph with text', () => {
			setData( model, '<paragraph>foo</paragraph>' );

			expect( data.get() ).to.equal( '<p>foo</p>' );
			expect( data.get( { trim: 'empty' } ) ).to.equal( '<p>foo</p>' );
		} );

		it( 'should trim empty paragraph by default', () => {
			setData( model, '<paragraph></paragraph>' );

			expect( data.get() ).to.equal( '' );
			expect( data.get( { trim: 'empty' } ) ).to.equal( '' );
		} );

		it( 'should get empty paragraph (with trim=none)', () => {
			setData( model, '<paragraph></paragraph>' );

			expect( data.get( { trim: 'none' } ) ).to.equal( '<p>&nbsp;</p>' );
		} );

		it( 'should get two paragraphs', () => {
			setData( model, '<paragraph>foo</paragraph><paragraph>bar</paragraph>' );

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
			setData( model, '<paragraph>foo<$text bold="true">bar</$text></paragraph>' );

			expect( data.get() ).to.equal( '<p>foobar</p>' );
			expect( data.get( { trim: 'empty' } ) ).to.equal( '<p>foobar</p>' );
		} );

		it( 'should get paragraphs with bold', () => {
			setData( model, '<paragraph>foo<$text bold="true">bar</$text></paragraph>' );

			downcastHelpers.attributeToElement( { model: 'bold', view: 'strong' } );

			expect( data.get() ).to.equal( '<p>foo<strong>bar</strong></p>' );
			expect( data.get( { trim: 'empty' } ) ).to.equal( '<p>foo<strong>bar</strong></p>' );
		} );

		it( 'should get root name as a parameter', () => {
			schema.extend( '$text', { allowIn: '$root' } );

			setData( model, '<paragraph>foo</paragraph>', { rootName: 'main' } );
			setData( model, 'Bar', { rootName: 'title' } );

			downcastHelpers.attributeToElement( { model: 'bold', view: 'strong' } );

			expect( data.get() ).to.equal( '<p>foo</p>' );
			expect( data.get( { rootName: 'main' } ) ).to.equal( '<p>foo</p>' );
			expect( data.get( { rootName: 'title' } ) ).to.equal( 'Bar' );
		} );

		it( 'should throw an error when non-existent root is used', () => {
			expectToThrowCKEditorError( () => {
				data.get( { rootName: 'nonexistent' } );
			}, 'datacontroller-get-non-existent-root' );
		} );

		it( 'should allow to provide additional options for retrieving data - insert conversion', () => {
			data.downcastDispatcher.on( 'insert:paragraph', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.item, 'insert' );

				const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );
				const viewElement = conversionApi.writer.createContainerElement( 'p', {
					attribute: conversionApi.options.attributeValue
				} );

				conversionApi.mapper.bindElements( data.item, viewElement );
				conversionApi.writer.insert( viewPosition, viewElement );
			}, { priority: 'high' } );

			setData( model, '<paragraph>foo</paragraph>' );

			expect( data.get( { attributeValue: 'foo' } ) ).to.equal( '<p attribute="foo">foo</p>' );
			expect( data.get( { attributeValue: 'bar' } ) ).to.equal( '<p attribute="bar">foo</p>' );
		} );

		it( 'should allow to provide additional options for retrieving data - attribute conversion', () => {
			schema.extend( 'paragraph', { allowAttributes: [ 'foo' ] } );
			downcastHelpers.elementToElement( { model: 'paragraph', view: 'p' } );

			data.downcastDispatcher.on( 'attribute:foo', ( evt, data, conversionApi ) => {
				if ( data.attributeNewValue === conversionApi.options.skipAttribute ) {
					return;
				}

				const viewRange = conversionApi.mapper.toViewRange( data.range );
				const viewElement = conversionApi.writer.createAttributeElement( data.attributeNewValue );

				conversionApi.writer.wrap( viewRange, viewElement );
			} );

			setData( model, '<paragraph>f<$text foo="a">o</$text>ob<$text foo="b">a</$text>r</paragraph>' );

			expect( data.get() ).to.equal( '<p>f<a>o</a>ob<b>a</b>r</p>' );
			expect( data.get( { skipAttribute: 'a' } ) ).to.equal( '<p>foob<b>a</b>r</p>' );
			expect( data.get( { skipAttribute: 'b' } ) ).to.equal( '<p>f<a>o</a>obar</p>' );
		} );

		it( 'should allow to provide additional options for retrieving data - addMarker conversion', () => {
			data.downcastDispatcher.on( 'addMarker', ( evt, data, conversionApi ) => {
				if ( conversionApi.options.skipMarker ) {
					return;
				}

				const viewElement = conversionApi.writer.createAttributeElement( 'marker' );
				const viewRange = conversionApi.mapper.toViewRange( data.markerRange );

				conversionApi.writer.wrap( viewRange, viewElement );
			} );

			setData( model, '<paragraph>foo</paragraph>' );

			const root = model.document.getRoot();

			model.change( writer => {
				const start = writer.createPositionFromPath( root, [ 0, 1 ] );
				const end = writer.createPositionFromPath( root, [ 0, 2 ] );

				writer.addMarker( 'marker', {
					range: writer.createRange( start, end ),
					usingOperation: false
				} );
			} );

			expect( data.get( { skipMarker: false } ) ).to.equal( '<p>f<marker>o</marker>o</p>' );
			expect( data.get( { skipMarker: true } ) ).to.equal( '<p>foo</p>' );
		} );

		it( 'should pass default options value to converters', () => {
			data.downcastDispatcher.on( 'insert:paragraph', ( evt, data, conversionApi ) => {
				expect( conversionApi.options ).to.deep.equal( {} );
			} );

			setData( model, '<paragraph>foo</paragraph>' );
			data.get();
		} );

		it( 'should return empty string and log a warning when asked for data from a detached root', () => {
			setData( model, '<paragraph>foo</paragraph>' );

			model.change( writer => {
				writer.detachRoot( 'main' );
			} );

			const stub = sinon.stub( console, 'warn' );

			const result = data.get( { rootName: 'main' } );

			expect( result ).to.equal( '' );
			sinon.assert.calledWithMatch( stub, 'datacontroller-get-detached-root' );

			console.warn.restore();
		} );

		it( 'should get template with children', () => {
			schema.register( 'container', { inheritAllFrom: '$block' } );
			schema.extend( 'paragraph', { allowIn: [ 'container' ] } );
			setData( model, '<container><paragraph>foo</paragraph></container>' );

			downcastHelpers.elementToElement( {
				model: 'container',
				view: 'template'
			} );

			expect( data.get() ).to.equal( '<template><p>foo</p></template>' );
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

		it( 'should allow to provide additional options to the conversion process', () => {
			const spy = sinon.spy();

			data.downcastDispatcher.on( 'insert:paragraph', ( evt, data, conversionApi ) => {
				spy( conversionApi.options );
			}, { priority: 'high' } );

			const modelDocumentFragment = parseModel( '<paragraph>foo</paragraph><paragraph>bar</paragraph>', schema );
			const options = { foo: 'bar' };

			data.stringify( modelDocumentFragment, options );
			expect( spy.lastCall.args[ 0 ] ).to.equal( options );
		} );

		it( 'should pass default options value to converters', () => {
			data.downcastDispatcher.on( 'insert:paragraph', ( evt, data, conversionApi ) => {
				expect( conversionApi.options ).to.deep.equal( {} );
			} );

			const modelDocumentFragment = parseModel( '<paragraph>foo</paragraph><paragraph>bar</paragraph>', schema );
			data.stringify( modelDocumentFragment );
		} );
	} );

	describe( 'toView()', () => {
		beforeEach( () => {
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			schema.register( 'div', { inheritAllFrom: '$block' } );

			schema.extend( '$block', { allowIn: 'div' } );
			schema.extend( 'div', { allowIn: 'div' } );

			downcastHelpers.elementToElement( { model: 'paragraph', view: 'p' } );
			downcastHelpers.elementToElement( { model: 'div', view: 'div' } );
		} );

		it( 'should be decorated', () => {
			const modelElement = parseModel( '<div><paragraph>foo</paragraph></div>', schema );
			const spy = sinon.spy();

			data.on( 'toView', spy );
			data.toView( modelElement );

			sinon.assert.calledWithExactly( spy, sinon.match.any, [ modelElement ] );
		} );

		it( 'should use #viewDocument as a parent for returned document fragments', () => {
			const modelElement = parseModel( '<div><paragraph>foo</paragraph></div>', schema );
			const viewDocumentFragment = data.toView( modelElement );

			expect( viewDocumentFragment.document ).to.equal( data.viewDocument );
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

		it( 'adjacent markers do not overlap regardless of creation order', () => {
			const modelElement = parseModel( '<div><paragraph>foobar</paragraph></div>', schema );
			const modelRoot = model.document.getRoot();

			downcastHelpers.markerToData( { model: 'marker' } );
			upcastHelpers.dataToMarker( { view: 'marker' } );

			const modelP = modelElement.getChild( 0 );

			model.change( writer => {
				writer.insert( modelElement, modelRoot, 0 );
			} );

			const rangeA = model.createRange( model.createPositionAt( modelP, 0 ), model.createPositionAt( modelP, 3 ) );
			const rangeB = model.createRange( model.createPositionAt( modelP, 3 ), model.createPositionAt( modelP, 6 ) );

			model.change( writer => {
				writer.addMarker( 'marker:a', { range: rangeA, usingOperation: true } );
				writer.addMarker( 'marker:b', { range: rangeB, usingOperation: true } );
			} );

			const viewDocumentFragment1 = data.toView( modelP );
			expect( stringifyView( viewDocumentFragment1 ) ).to.equal(
				'<marker-start name="a"></marker-start>foo<marker-end name="a"></marker-end>' +
				'<marker-start name="b"></marker-start>bar<marker-end name="b"></marker-end>'
			);

			model.change( writer => {
				writer.removeMarker( 'marker:a' );
				writer.removeMarker( 'marker:b' );

				writer.addMarker( 'marker:b', { range: rangeB, usingOperation: true } );
				writer.addMarker( 'marker:a', { range: rangeA, usingOperation: true } );
			} );

			const viewDocumentFragment2 = data.toView( modelP );
			expect( stringifyView( viewDocumentFragment2 ) ).to.equal(
				'<marker-start name="a"></marker-start>foo<marker-end name="a"></marker-end>' +
				'<marker-start name="b"></marker-start>bar<marker-end name="b"></marker-end>'
			);
		} );

		it( 'intersecting markers downcast consistently regardless of creation order', () => {
			const modelElement = parseModel( '<div><paragraph>1234567890</paragraph></div>', schema );
			const modelRoot = model.document.getRoot();

			downcastHelpers.markerToData( { model: 'marker' } );
			upcastHelpers.dataToMarker( { view: 'marker' } );

			const modelP = modelElement.getChild( 0 );

			model.change( writer => {
				writer.insert( modelElement, modelRoot, 0 );
			} );

			function range( start, end ) {
				return model.createRange( model.createPositionAt( modelP, start ), model.createPositionAt( modelP, end ) );
			}

			const markerRanges = {
				base: range( 2, 8 ),
				equal: range( 2, 8 ),
				outsideStart: range( 0, 2 ),
				overlapStart: range( 1, 3 ),
				insideStart: range( 2, 4 ),
				inside: range( 3, 6 ),
				insideEnd: range( 6, 8 ),
				overlapEnd: range( 7, 9 ),
				outsideEnd: range( 8, 10 )
			};

			model.change( writer => {
				for ( const [ name, range ] of Object.entries( markerRanges ) ) {
					writer.addMarker( `marker:${ name }`, { range, usingOperation: true } );
				}
			} );

			const result = stringifyView( data.toView( modelP ) );

			model.change( writer => {
				for ( const name of Object.keys( markerRanges ) ) {
					writer.removeMarker( `marker:${ name }` );
				}

				for ( const [ name, range ] of Object.entries( markerRanges ).reverse() ) {
					writer.addMarker( `marker:${ name }`, { range, usingOperation: true } );
				}
			} );

			const viewDocumentFragment2 = data.toView( modelP );
			expect( stringifyView( viewDocumentFragment2 ) ).to.equal( result );
		} );

		it( 'should convert a document fragment and its markers', () => {
			downcastHelpers.markerToData( { model: 'foo' } );

			const modelDocumentFragment = parseModel( '<paragraph>foo</paragraph><paragraph>bar</paragraph>', schema );

			const range = model.createRange(
				model.createPositionAt( modelDocumentFragment.getChild( 0 ), 1 ),
				model.createPositionAt( modelDocumentFragment.getChild( 1 ), 2 )
			);
			modelDocumentFragment.markers.set( 'foo:bar', range );

			const viewDocumentFragment = data.toView( modelDocumentFragment );

			expect( viewDocumentFragment ).to.be.instanceOf( ViewDocumentFragment );
			expect( viewDocumentFragment ).to.have.property( 'childCount', 2 );

			expect( stringifyView( viewDocumentFragment ) ).to.equal(
				'<p>f<foo-start name="bar"></foo-start>oo</p><p>ba<foo-end name="bar"></foo-end>r</p>'
			);
		} );

		// See https://github.com/ckeditor/ckeditor5/issues/8485.
		it( 'should convert collapsed markers at element boundary', () => {
			const modelElement = parseModel( '<div><paragraph>foo</paragraph></div>', schema );
			const modelRoot = model.document.getRoot();

			downcastHelpers.markerToData( { model: 'marker:a' } );
			downcastHelpers.markerToData( { model: 'marker:b' } );

			const modelParagraph = modelElement.getChild( 0 );

			model.change( writer => {
				writer.insert( modelElement, modelRoot, 0 );

				const rangeAtStart = writer.createRange( writer.createPositionFromPath( modelParagraph, [ 0 ] ) );
				const rangeAtEnd = writer.createRange( writer.createPositionFromPath( modelParagraph, [ 3 ] ) );

				writer.addMarker( 'marker:a', { range: rangeAtStart, usingOperation: true } );
				writer.addMarker( 'marker:b', { range: rangeAtEnd, usingOperation: true } );
			} );

			const viewElement = data.toView( modelParagraph );

			expect( stringifyView( viewElement ) ).to.equal(
				'<marker:a-start></marker:a-start><marker:a-end></marker:a-end>' +
				'foo' +
				'<marker:b-start></marker:b-start><marker:b-end></marker:b-end>'
			);
		} );

		// See https://github.com/ckeditor/ckeditor5/issues/8485.
		it( 'should convert collapsed markers at element boundary in a deeply nested element', () => {
			const modelElement = parseModel( '<div><div><div><div><paragraph>foo</paragraph></div></div></div></div>', schema );
			const modelRoot = model.document.getRoot();

			downcastHelpers.markerToData( { model: 'marker:a' } );
			downcastHelpers.markerToData( { model: 'marker:b' } );

			const modelParagraph = modelElement.getChild( 0 ).getChild( 0 ).getChild( 0 ).getChild( 0 );

			model.change( writer => {
				writer.insert( modelElement, modelRoot, 0 );

				const rangeAtStart = writer.createRange( writer.createPositionFromPath( modelParagraph, [ 0 ] ) );
				const rangeAtEnd = writer.createRange( writer.createPositionFromPath( modelParagraph, [ 3 ] ) );

				writer.addMarker( 'marker:a', { range: rangeAtStart, usingOperation: true } );
				writer.addMarker( 'marker:b', { range: rangeAtEnd, usingOperation: true } );
			} );

			const viewElement = data.toView( modelElement );

			expect( stringifyView( viewElement ) ).to.equal(
				'<div><div><div><p>' +
				'<marker:a-start></marker:a-start><marker:a-end></marker:a-end>' +
				'foo' +
				'<marker:b-start></marker:b-start><marker:b-end></marker:b-end>' +
				'</p></div></div></div>'
			);
		} );

		// See https://github.com/ckeditor/ckeditor5/issues/8485.
		it( 'should skip collapsed markers at other element\'s boundaries', () => {
			const modelElement = parseModel( '<div><paragraph>foo</paragraph><paragraph>bar</paragraph></div>', schema );
			const modelRoot = model.document.getRoot();

			downcastHelpers.markerToData( { model: 'marker:a' } );
			downcastHelpers.markerToData( { model: 'marker:b' } );

			const modelP1 = modelElement.getChild( 0 );
			const modelP2 = modelElement.getChild( 1 );

			model.change( writer => {
				writer.insert( modelElement, modelRoot, 0 );

				const rangeA = writer.createRange( writer.createPositionFromPath( modelP1, [ 0 ] ) );
				const rangeB = writer.createRange( writer.createPositionFromPath( modelP2, [ 0 ] ) );

				writer.addMarker( 'marker:a', { range: rangeA, usingOperation: true } );
				writer.addMarker( 'marker:b', { range: rangeB, usingOperation: true } );
			} );

			const viewElementP1 = data.toView( modelP1 );
			const viewElementP2 = data.toView( modelP2 );

			// The `marker:b` should not be present as it belongs to other element.
			expect( stringifyView( viewElementP1 ) ).to.equal( '<marker:a-start></marker:a-start><marker:a-end></marker:a-end>foo' );

			// The `marker:a` should not be present as it belongs to other element.
			expect( stringifyView( viewElementP2 ) ).to.equal( '<marker:b-start></marker:b-start><marker:b-end></marker:b-end>bar' );
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

		it( 'should allow to provide additional options to the conversion process', () => {
			const root = model.document.getRoot();
			const spy = sinon.spy();

			data.downcastDispatcher.on( 'insert:paragraph', ( evt, data, conversionApi ) => {
				spy( conversionApi.options );
			}, { priority: 'high' } );

			data.downcastDispatcher.on( 'addMarker:marker', ( evt, data, conversionApi ) => {
				spy( conversionApi.options );
			}, { priority: 'high' } );

			setData( model, '<paragraph>foo</paragraph>' );

			model.change( writer => {
				writer.addMarker( 'marker', {
					range: model.createRange( model.createPositionFromPath( root, [ 0, 1 ] ) ),
					usingOperation: false
				} );
			} );

			const options = { foo: 'bar' };

			data.toView( root, options );

			sinon.assert.calledTwice( spy );
			expect( spy.firstCall.args[ 0 ] ).to.equal( options );
			expect( spy.lastCall.args[ 0 ] ).to.equal( options );
		} );

		it( 'should pass default options value to converters', () => {
			data.downcastDispatcher.on( 'insert:paragraph', ( evt, data, conversionApi ) => {
				expect( conversionApi.options ).to.deep.equal( {} );
			} );

			const root = model.document.getRoot();
			setData( model, '<paragraph>foo</paragraph>' );

			data.toView( root );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should be there for you', () => {
			// Should not throw.
			data.destroy();

			expect( data ).to.respondTo( 'destroy' );
		} );
	} );

	describe( 'addStyleProcessorRules()', () => {
		it( 'should execute callback with an instance of StyleProcessor as the first argument', () => {
			const stylesProcessor = new StylesProcessor();
			const data = new DataController( model, stylesProcessor );

			const spy = sinon.spy();

			data.addStyleProcessorRules( spy );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, stylesProcessor );
		} );
	} );

	describe( 'registerRawContentMatcher()', () => {
		it( 'should not register matcher twice for one instance of data processor', () => {
			const stylesProcessor = new StylesProcessor();
			const data = new DataController( model, stylesProcessor );

			const spy = sinon.spy();

			data.processor.registerRawContentMatcher = spy;

			data.registerRawContentMatcher( 'div' );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, 'div' );
		} );

		it( 'should register matcher on both of data processor instances', () => {
			const stylesProcessor = new StylesProcessor();
			const data = new DataController( model, stylesProcessor );
			data.processor = new HtmlDataProcessor( viewDocument );

			const spyProcessor = sinon.spy();
			const spyHtmlProcessor = sinon.spy();

			data.processor.registerRawContentMatcher = spyProcessor;
			data.htmlProcessor.registerRawContentMatcher = spyHtmlProcessor;

			data.registerRawContentMatcher( 'div' );

			sinon.assert.calledOnce( spyProcessor );
			sinon.assert.calledWithExactly( spyProcessor, 'div' );
			sinon.assert.calledOnce( spyHtmlProcessor );
			sinon.assert.calledWithExactly( spyHtmlProcessor, 'div' );
		} );
	} );

	describe( 'nested conversion', () => {
		beforeEach( () => {
			model.schema.register( 'container', {
				inheritAllFrom: '$block'
			} );
			model.schema.register( 'caption', {
				allowIn: 'container',
				inheritAllFrom: '$block'
			} );
			model.schema.extend( '$text', {
				allowAttributes: [ 'bold' ]
			} );
			model.schema.register( 'softBreak', {
				allowWhere: '$text',
				isInline: true
			} );
		} );

		it( 'should allow nesting upcast conversion', () => {
			const dataProcessor = data.processor;

			upcastHelpers.elementToAttribute( { view: 'strong', model: 'bold' } );
			upcastHelpers.elementToElement( { view: 'br', model: 'softBreak' } );

			data.upcastDispatcher.on( 'element:div', ( evt, data, conversionApi ) => {
				const viewItem = data.viewItem;

				// Check if the view element has still unconsumed `data-caption` attribute.
				if ( !conversionApi.consumable.test( viewItem, { name: true, attributes: 'data-caption' } ) ) {
					return;
				}

				const container = conversionApi.writer.createElement( 'container' );

				// Create `caption` model element. Thanks to that element the rest of the `ckeditor5-plugin` converters can
				// recognize this image as a block image with a caption.
				//
				// Caption element is also used as a conversion target so Schema can be properly checked for allowed children.
				// https://github.com/ckeditor/ckeditor5/issues/12797.
				const caption = conversionApi.writer.createElement( 'caption' );

				// Parse HTML from data-caption attribute and upcast it to model fragment.
				const viewFragment = dataProcessor.toView( viewItem.getAttribute( 'data-caption' ) );

				// Consumable must know about those newly parsed view elements.
				conversionApi.consumable.constructor.createFrom( viewFragment, conversionApi.consumable );
				conversionApi.convertChildren( viewFragment, caption );

				// Insert the caption element into image, as a last child.
				conversionApi.writer.append( caption, container );

				// Try to place the image in the allowed position.
				if ( !conversionApi.safeInsert( container, data.modelCursor ) ) {
					return;
				}

				// Mark given element as consumed. Now other converters will not process it anymore.
				conversionApi.consumable.consume( viewItem, { name: true, attributes: [ 'data-caption' ] } );

				// Make sure `modelRange` and `modelCursor` is up to date after inserting new nodes into the model.
				conversionApi.updateConversionResult( container, data );
			} );

			data.set( '<div data-caption="foo<br><strong>baz</strong>">&nbsp;</div>' );

			expect( getData( model, { withoutSelection: true } ) ).to.equal(
				'<container><caption>foo<softBreak></softBreak><$text bold="true">baz</$text></caption></container>'
			);
		} );

		it( 'should allow nesting downcast conversion', () => {
			const downcastDispatcher = data.downcastDispatcher;
			const dataProcessor = data.processor;

			// Test whether list modelViewSplitOnInsert is not breaking conversion (see #11490).
			downcastDispatcher.on( 'insert', ( evt, data, conversionApi ) => {
				if ( conversionApi.consumable.test( data.item, evt.name ) ) {
					conversionApi.mapper.toViewPosition( data.range.start );
				}
			}, { priority: 'high' } );

			downcastHelpers.elementToElement( { model: 'container', view: 'div' } );
			downcastHelpers.attributeToElement( { model: 'bold', view: 'strong' } );
			downcastHelpers.elementToElement( { model: 'softBreak', view: ( element, { writer } ) => writer.createEmptyElement( 'br' ) } );

			data.downcastDispatcher.on( 'insert:caption', ( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.consume( data.item, 'insert' ) ) {
					return;
				}

				const range = model.createRangeIn( data.item );
				const viewDocumentFragment = conversionApi.writer.createDocumentFragment();

				// Bind caption model element to the detached view document fragment so all content of the caption
				// will be downcasted into that document fragment.
				conversionApi.mapper.bindElements( data.item, viewDocumentFragment );

				for ( const { item } of range ) {
					const data = {
						item,
						range: model.createRangeOn( item )
					};

					// The following lines are extracted from DowncastDispatcher#_convertInsertWithAttributes().

					const eventName = `insert:${ item.is( '$textProxy' ) ? '$text' : item.name }`;

					downcastDispatcher.fire( eventName, data, conversionApi );

					for ( const key of item.getAttributeKeys() ) {
						Object.assign( data, {
							attributeKey: key,
							attributeOldValue: null,
							attributeNewValue: data.item.getAttribute( key )
						} );

						downcastDispatcher.fire( `attribute:${ key }`, data, conversionApi );
					}
				}

				// Unbind all the view elements that were downcasted to the document fragment.
				for ( const child of conversionApi.writer.createRangeIn( viewDocumentFragment ).getItems() ) {
					conversionApi.mapper.unbindViewElement( child );
				}

				conversionApi.mapper.unbindViewElement( viewDocumentFragment );

				// Stringify view document fragment to HTML string.
				const captionText = dataProcessor.toData( viewDocumentFragment );

				if ( captionText ) {
					const imageViewElement = conversionApi.mapper.toViewElement( data.item.parent );

					conversionApi.writer.setAttribute( 'data-caption', captionText, imageViewElement );
				}
			} );

			setData( model, '<container><caption>foo<softBreak></softBreak><$text bold="true">baz</$text></caption></container>' );

			expect( data.get() ).to.equal( '<div data-caption="foo<br><strong>baz</strong>">&nbsp;</div>' );
		} );
	} );
} );
