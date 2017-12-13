/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals setTimeout, document */

import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';

import EditingController from '../../src/controller/editingcontroller';

import ViewDocument from '../../src/view/document';

import Mapper from '../../src/conversion/mapper';
import ModelConversionDispatcher from '../../src/conversion/modelconversiondispatcher';
import buildModelConverter from '../../src/conversion/buildmodelconverter';

import Model from '../../src/model/model';
import ModelPosition from '../../src/model/position';
import ModelRange from '../../src/model/range';
import ModelDocumentFragment from '../../src/model/documentfragment';

import createElement from '@ckeditor/ckeditor5-utils/src/dom/createelement';

import { parse, getData as getModelData } from '../../src/dev-utils/model';
import { getData as getViewData } from '../../src/dev-utils/view';

describe( 'EditingController', () => {
	describe( 'constructor()', () => {
		let model, editing;

		beforeEach( () => {
			model = new Model();
			editing = new EditingController( model );
		} );

		afterEach( () => {
			editing.destroy();
		} );

		it( 'should create controller with properties', () => {
			expect( editing ).to.have.property( 'model' ).that.equals( model );
			expect( editing ).to.have.property( 'view' ).that.is.instanceof( ViewDocument );
			expect( editing ).to.have.property( 'mapper' ).that.is.instanceof( Mapper );
			expect( editing ).to.have.property( 'modelToView' ).that.is.instanceof( ModelConversionDispatcher );

			editing.destroy();
		} );

		it( 'should be observable', () => {
			const spy = sinon.spy();

			editing.on( 'change:foo', spy );
			editing.set( 'foo', 'bar' );

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'createRoot()', () => {
		let model, modelRoot, editing;

		beforeEach( () => {
			model = new Model();
			modelRoot = model.document.createRoot();
			model.document.createRoot( '$root', 'header' );

			editing = new EditingController( model );
		} );

		afterEach( () => {
			editing.destroy();
			model.markers.destroy();
		} );

		it( 'should create root', () => {
			const domRoot = createElement( document, 'div', null, createElement( document, 'p' ) );

			const viewRoot = editing.createRoot( domRoot );

			expect( viewRoot ).to.equal( editing.view.getRoot() );
			expect( domRoot ).to.equal( editing.view.getDomRoot() );

			expect( editing.view.domConverter.mapViewToDom( viewRoot ) ).to.equal( domRoot );
			expect( editing.view.renderer.markedChildren.has( viewRoot ) ).to.be.true;

			expect( editing.mapper.toModelElement( viewRoot ) ).to.equal( modelRoot );
			expect( editing.mapper.toViewElement( modelRoot ) ).to.equal( viewRoot );
		} );

		it( 'should create root with given name', () => {
			const domRoot = createElement( document, 'div', null, createElement( document, 'p' ) );

			const viewRoot = editing.createRoot( domRoot, 'header' );

			expect( viewRoot ).to.equal( editing.view.getRoot( 'header' ) );
			expect( domRoot ).to.equal( editing.view.getDomRoot( 'header' ) );

			expect( editing.view.domConverter.mapViewToDom( viewRoot ) ).to.equal( domRoot );
			expect( editing.view.renderer.markedChildren.has( viewRoot ) ).to.be.true;

			expect( editing.mapper.toModelElement( viewRoot ) ).to.equal( model.document.getRoot( 'header' ) );
			expect( editing.mapper.toViewElement( model.document.getRoot( 'header' ) ) ).to.equal( viewRoot );
		} );

		it( 'should be possible to attach DOM element later', () => {
			const domRoot = createElement( document, 'div', null, createElement( document, 'p' ) );

			const viewRoot = editing.createRoot( 'div' );

			expect( viewRoot ).to.equal( editing.view.getRoot() );
			expect( editing.view.getDomRoot() ).to.be.undefined;

			editing.view.attachDomRoot( domRoot );

			expect( domRoot ).to.equal( editing.view.getDomRoot() );

			expect( editing.view.domConverter.mapViewToDom( viewRoot ) ).to.equal( domRoot );
			expect( editing.view.renderer.markedChildren.has( viewRoot ) ).to.be.true;

			expect( editing.mapper.toModelElement( viewRoot ) ).to.equal( modelRoot );
			expect( editing.mapper.toViewElement( modelRoot ) ).to.equal( viewRoot );
		} );
	} );

	describe( 'conversion', () => {
		let model, modelRoot, viewRoot, domRoot, editing, listener;

		beforeEach( () => {
			listener = Object.create( EmitterMixin );

			model = new Model();
			modelRoot = model.document.createRoot();

			editing = new EditingController( model );

			domRoot = document.createElement( 'div' );
			domRoot.contentEditable = true;

			document.body.appendChild( domRoot );
			viewRoot = editing.createRoot( domRoot );

			model.schema.registerItem( 'paragraph', '$block' );
			model.schema.registerItem( 'div', '$block' );
			buildModelConverter().for( editing.modelToView ).fromElement( 'paragraph' ).toElement( 'p' );
			buildModelConverter().for( editing.modelToView ).fromElement( 'div' ).toElement( 'div' );
			buildModelConverter().for( editing.modelToView ).fromMarker( 'marker' ).toHighlight( {} );

			// Note: The below code is highly overcomplicated due to #455.
			model.document.selection.removeAllRanges();
			modelRoot.removeChildren( 0, modelRoot.childCount );

			viewRoot.removeChildren( 0, viewRoot.childCount );

			const modelData = new ModelDocumentFragment( parse(
				'<paragraph>foo</paragraph>' +
				'<paragraph></paragraph>' +
				'<paragraph>bar</paragraph>',
				model.schema
			)._children );

			model.change( writer => {
				writer.insert( modelData, model.document.getRoot() );

				model.document.selection.addRange( ModelRange.createFromParentsAndOffsets(
					modelRoot.getChild( 0 ), 1, modelRoot.getChild( 0 ), 1 )
				);
			} );
		} );

		afterEach( () => {
			document.body.removeChild( domRoot );
			listener.stopListening();
			editing.destroy();
		} );

		it( 'should convert insertion', () => {
			expect( getViewData( editing.view ) ).to.equal( '<p>f{}oo</p><p></p><p>bar</p>' );
		} );

		it( 'should convert split', () => {
			expect( getViewData( editing.view ) ).to.equal( '<p>f{}oo</p><p></p><p>bar</p>' );

			model.change( writer => {
				writer.split( model.document.selection.getFirstPosition() );

				model.document.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets(	modelRoot.getChild( 1 ), 0, modelRoot.getChild( 1 ), 0 )
				] );
			} );

			expect( getViewData( editing.view ) ).to.equal( '<p>f</p><p>{}oo</p><p></p><p>bar</p>' );
		} );

		it( 'should convert rename', () => {
			expect( getViewData( editing.view ) ).to.equal( '<p>f{}oo</p><p></p><p>bar</p>' );

			model.change( writer => {
				writer.rename( modelRoot.getChild( 0 ), 'div' );
			} );

			expect( getViewData( editing.view ) ).to.equal( '<div>f{}oo</div><p></p><p>bar</p>' );
		} );

		it( 'should convert delete', () => {
			model.change( writer => {
				writer.remove(
					ModelRange.createFromPositionAndShift( model.document.selection.getFirstPosition(), 1 )
				);

				model.document.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 1, modelRoot.getChild( 0 ), 1 )
				] );
			} );

			expect( getViewData( editing.view ) ).to.equal( '<p>f{}o</p><p></p><p>bar</p>' );
		} );

		it( 'should convert selection from view to model', done => {
			listener.listenTo( editing.view, 'selectionChange', () => {
				setTimeout( () => {
					expect( getModelData( model ) ).to.equal(
						'<paragraph>foo</paragraph>' +
						'<paragraph></paragraph>' +
						'<paragraph>b[a]r</paragraph>'
					);

					done();
				} );
			} );

			editing.view.isFocused = true;
			editing.view.render();

			const domSelection = document.getSelection();
			domSelection.removeAllRanges();
			const domBar = domRoot.childNodes[ 2 ].childNodes[ 0 ];
			const domRange = document.createRange();
			domRange.setStart( domBar, 1 );
			domRange.setEnd( domBar, 2 );
			domSelection.addRange( domRange );
		} );

		it( 'should convert collapsed selection', () => {
			model.change( () => {
				model.document.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 2 ), 1, modelRoot.getChild( 2 ), 1 )
				] );
			} );

			expect( getViewData( editing.view ) ).to.equal( '<p>foo</p><p></p><p>b{}ar</p>' );
		} );

		it( 'should convert not collapsed selection', () => {
			model.change( () => {
				model.document.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 2 ), 1, modelRoot.getChild( 2 ), 2 )
				] );
			} );

			expect( getViewData( editing.view ) ).to.equal( '<p>foo</p><p></p><p>b{a}r</p>' );
		} );

		it( 'should clear previous selection', () => {
			model.change( () => {
				model.document.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 2 ), 1, modelRoot.getChild( 2 ), 1 )
				] );
			} );

			expect( getViewData( editing.view ) ).to.equal( '<p>foo</p><p></p><p>b{}ar</p>' );

			model.change( () => {
				model.document.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 2 ), 2, modelRoot.getChild( 2 ), 2 )
				] );
			} );

			expect( getViewData( editing.view ) ).to.equal( '<p>foo</p><p></p><p>ba{}r</p>' );
		} );

		it( 'should convert adding marker', () => {
			const range = new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 2, 2 ] ) );

			model.change( () => {
				model.markers.set( 'marker', range );
			} );

			expect( getViewData( editing.view, { withoutSelection: true } ) )
				.to.equal( '<p>f<span>oo</span></p><p></p><p><span>ba</span>r</p>' );
		} );

		it( 'should convert removing marker', () => {
			const range = new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 2, 2 ] ) );

			model.change( () => {
				model.markers.set( 'marker', range );
			} );

			model.change( () => {
				model.markers.remove( 'marker' );
			} );

			expect( getViewData( editing.view, { withoutSelection: true } ) )
				.to.equal( '<p>foo</p><p></p><p>bar</p>' );
		} );

		it( 'should convert changing marker', () => {
			const range = new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 2, 2 ] ) );

			model.change( () => {
				model.markers.set( 'marker', range );
			} );

			const range2 = new ModelRange( new ModelPosition( modelRoot, [ 0, 0 ] ), new ModelPosition( modelRoot, [ 0, 2 ] ) );

			model.change( () => {
				model.markers.set( 'marker', range2 );
			} );

			expect( getViewData( editing.view, { withoutSelection: true } ) )
				.to.equal( '<p><span>fo</span>o</p><p></p><p>bar</p>' );
		} );

		it( 'should convert insertion into marker', () => {
			const range = new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 2, 2 ] ) );

			model.change( () => {
				model.markers.set( 'marker', range );
			} );

			model.change( writer => {
				writer.insertText( 'xyz', new ModelPosition( modelRoot, [ 1, 0 ] ) );
			} );

			expect( getViewData( editing.view, { withoutSelection: true } ) )
				.to.equal( '<p>f<span>oo</span></p><p><span>xyz</span></p><p><span>ba</span>r</p>' );
		} );

		it( 'should convert move to marker', () => {
			const range = new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 2, 2 ] ) );

			model.change( () => {
				model.markers.set( 'marker', range );
			} );

			model.change( writer => {
				writer.move(
					new ModelRange( new ModelPosition( modelRoot, [ 2, 2 ] ), new ModelPosition( modelRoot, [ 2, 3 ] ) ),
					new ModelPosition( modelRoot, [ 0, 3 ] )
				);
			} );

			expect( getViewData( editing.view, { withoutSelection: true } ) )
				.to.equal( '<p>f<span>oor</span></p><p></p><p><span>ba</span></p>' );
		} );

		it( 'should convert move from marker', () => {
			const range = new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 2, 2 ] ) );

			model.change( () => {
				model.markers.set( 'marker', range );
			} );

			model.change( writer => {
				writer.move(
					new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 0, 3 ] ) ),
					new ModelPosition( modelRoot, [ 2, 3 ] )
				);
			} );

			expect( getViewData( editing.view, { withoutSelection: true } ) )
				.to.equal( '<p>f</p><p></p><p><span>ba</span>roo</p>' );
		} );

		it( 'should convert the whole marker move', () => {
			const range = new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 0, 3 ] ) );

			model.change( () => {
				model.markers.set( 'marker', range );
			} );

			model.change( writer => {
				writer.move(
					new ModelRange( new ModelPosition( modelRoot, [ 0, 0 ] ), new ModelPosition( modelRoot, [ 0, 3 ] ) ),
					new ModelPosition( modelRoot, [ 1, 0 ] )
				);
			} );

			expect( getViewData( editing.view, { withoutSelection: true } ) )
				.to.equal( '<p></p><p>f<span>oo</span></p><p>bar</p>' );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should remove listenters', () => {
			const model = new Model();
			model.document.createRoot();
			model.schema.registerItem( 'paragraph', '$block' );

			const editing = new EditingController( model );

			const spy = sinon.spy();

			editing.modelToView.on( 'insert:$element', spy );

			editing.destroy();

			model.change( writer => {
				const modelData = parse( '<paragraph>foo</paragraph>', model.schema ).getChild( 0 );

				writer.insert( modelData, model.document.getRoot() );
			} );

			expect( spy.called ).to.be.false;

			editing.destroy();
		} );

		it( 'should destroy view', () => {
			const model = new Model();
			model.document.createRoot();
			model.schema.registerItem( 'paragraph', '$block' );

			const editing = new EditingController( model );

			const spy = sinon.spy( editing.view, 'destroy' );

			editing.destroy();

			expect( spy.called ).to.be.true;
		} );
	} );
} );
