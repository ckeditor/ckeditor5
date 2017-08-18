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

import ModelDocument from '../../src/model/document';
import ModelPosition from '../../src/model/position';
import ModelElement from '../../src/model/element';
import ModelText from '../../src/model/text';
import ModelRange from '../../src/model/range';
import ModelDocumentFragment from '../../src/model/documentfragment';

import createElement from '@ckeditor/ckeditor5-utils/src/dom/createelement';

import { parse, getData as getModelData } from '../../src/dev-utils/model';
import { getData as getViewData } from '../../src/dev-utils/view';

describe( 'EditingController', () => {
	describe( 'constructor()', () => {
		let model, editing;

		beforeEach( () => {
			model = new ModelDocument();
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
			model = new ModelDocument();
			modelRoot = model.createRoot();
			model.createRoot( '$root', 'header' );

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

			expect( editing.mapper.toModelElement( viewRoot ) ).to.equal( model.getRoot( 'header' ) );
			expect( editing.mapper.toViewElement( model.getRoot( 'header' ) ) ).to.equal( viewRoot );
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

			model = new ModelDocument();
			modelRoot = model.createRoot();

			editing = new EditingController( model );

			domRoot = document.createElement( 'div' );
			document.body.appendChild( domRoot );
			viewRoot = editing.createRoot( domRoot );

			model.schema.registerItem( 'paragraph', '$block' );
			model.schema.registerItem( 'div', '$block' );
			buildModelConverter().for( editing.modelToView ).fromElement( 'paragraph' ).toElement( 'p' );
			buildModelConverter().for( editing.modelToView ).fromElement( 'div' ).toElement( 'div' );

			// Note: The below code is highly overcomplicated due to #455.
			model.selection.removeAllRanges();
			modelRoot.removeChildren( 0, modelRoot.childCount );

			viewRoot.removeChildren( 0, viewRoot.childCount );

			const modelData = new ModelDocumentFragment( parse(
				'<paragraph>foo</paragraph>' +
				'<paragraph></paragraph>' +
				'<paragraph>bar</paragraph>',
				model.schema
			)._children );

			model.enqueueChanges( () => {
				model.batch().insert( ModelPosition.createAt( model.getRoot(), 0 ), modelData );
				model.selection.addRange( ModelRange.createFromParentsAndOffsets(
					modelRoot.getChild( 0 ), 1, modelRoot.getChild( 0 ), 1 ) );
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

			model.enqueueChanges( () => {
				model.batch().split( model.selection.getFirstPosition() );
				model.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets(	modelRoot.getChild( 1 ), 0, modelRoot.getChild( 1 ), 0 )
				] );
			} );

			expect( getViewData( editing.view ) ).to.equal( '<p>f</p><p>{}oo</p><p></p><p>bar</p>' );
		} );

		it( 'should convert rename', () => {
			expect( getViewData( editing.view ) ).to.equal( '<p>f{}oo</p><p></p><p>bar</p>' );

			model.enqueueChanges( () => {
				model.batch().rename( modelRoot.getChild( 0 ), 'div' );
			} );

			expect( getViewData( editing.view ) ).to.equal( '<div>f{}oo</div><p></p><p>bar</p>' );
		} );

		it( 'should convert delete', () => {
			model.enqueueChanges( () => {
				model.batch().remove(
					ModelRange.createFromPositionAndShift( model.selection.getFirstPosition(), 1 )
				);
				model.selection.setRanges( [
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
						'<paragraph>b[a]r</paragraph>' );
					done();
				} );
			} );

			editing.view.isFocused = true;

			const domSelection = document.getSelection();
			domSelection.removeAllRanges();
			const domBar = domRoot.childNodes[ 2 ].childNodes[ 0 ];
			const domRange = document.createRange();
			domRange.setStart( domBar, 1 );
			domRange.setEnd( domBar, 2 );
			domSelection.addRange( domRange );
		} );

		it( 'should convert collapsed selection', () => {
			model.enqueueChanges( () => {
				model.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 2 ), 1, modelRoot.getChild( 2 ), 1 )
				] );
			} );

			expect( getViewData( editing.view ) ).to.equal( '<p>foo</p><p></p><p>b{}ar</p>' );
		} );

		it( 'should convert not collapsed selection', () => {
			model.enqueueChanges( () => {
				model.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 2 ), 1, modelRoot.getChild( 2 ), 2 )
				] );
			} );

			expect( getViewData( editing.view ) ).to.equal( '<p>foo</p><p></p><p>b{a}r</p>' );
		} );

		it( 'should clear previous selection', () => {
			model.enqueueChanges( () => {
				model.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 2 ), 1, modelRoot.getChild( 2 ), 1 )
				] );
			} );

			expect( getViewData( editing.view ) ).to.equal( '<p>foo</p><p></p><p>b{}ar</p>' );

			model.enqueueChanges( () => {
				model.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 2 ), 2, modelRoot.getChild( 2 ), 2 )
				] );
			} );

			expect( getViewData( editing.view ) ).to.equal( '<p>foo</p><p></p><p>ba{}r</p>' );
		} );

		it( 'should forward marker events to model conversion dispatcher', () => {
			const range = ModelRange.createFromParentsAndOffsets( modelRoot, 0, modelRoot, 1 );
			const markerStub = {
				name: 'name',
				getRange: () => range
			};

			sinon.spy( editing.modelToView, 'convertMarker' );

			model.markers.fire( 'add', markerStub );

			expect( editing.modelToView.convertMarker.calledWithExactly( 'addMarker', 'name', range ) ).to.be.true;

			model.markers.fire( 'remove', markerStub );

			expect( editing.modelToView.convertMarker.calledWithExactly( 'removeMarker', 'name', range ) ).to.be.true;

			editing.modelToView.convertMarker.restore();
		} );

		it( 'should forward add marker event if content is inserted into a marker range', () => {
			const markerRange = ModelRange.createFromParentsAndOffsets( modelRoot, 0, modelRoot, 3 );
			const innerRange = ModelRange.createFromParentsAndOffsets( modelRoot, 1, modelRoot, 2 );

			model.markers.set( 'name', markerRange );

			sinon.spy( editing.modelToView, 'convertMarker' );

			editing.modelToView.convertInsertion( innerRange );

			expect( editing.modelToView.convertMarker.calledWithExactly( 'addMarker', 'name', innerRange ) ).to.be.true;

			editing.modelToView.convertMarker.restore();
		} );

		describe( 'should forward add marker event if inserted content has a marker', () => {
			let element, outerRange;

			beforeEach( () => {
				element = new ModelElement( 'paragraph', null, new ModelText( 'foo' ) );
				modelRoot.appendChildren( element );

				outerRange = ModelRange.createOn( element );

				sinon.spy( editing.modelToView, 'convertMarker' );
			} );

			afterEach( () => {
				editing.modelToView.convertMarker.restore();
			} );

			it( 'marker strictly contained', () => {
				const markerRange = ModelRange.createFromParentsAndOffsets( element, 1, element, 2 );
				model.markers.set( 'name', markerRange );

				editing.modelToView.convertInsertion( outerRange );
				expect( editing.modelToView.convertMarker.calledWithExactly( 'addMarker', 'name', markerRange ) ).to.be.true;
			} );

			it( 'marker starts at same position', () => {
				const markerRange = ModelRange.createFromParentsAndOffsets( element, 0, element, 2 );
				model.markers.set( 'name', markerRange );
				editing.modelToView.convertInsertion( outerRange );
				expect( editing.modelToView.convertMarker.calledWithExactly( 'addMarker', 'name', markerRange ) ).to.be.true;
			} );

			it( 'marker ends at same position', () => {
				const markerRange = ModelRange.createFromParentsAndOffsets( element, 1, element, 3 );
				model.markers.set( 'name', markerRange );
				editing.modelToView.convertInsertion( outerRange );
				expect( editing.modelToView.convertMarker.calledWithExactly( 'addMarker', 'name', markerRange ) ).to.be.true;
			} );

			it( 'marker is same as range', () => {
				const markerRange = ModelRange.createFromParentsAndOffsets( element, 0, element, 3 );
				model.markers.set( 'name', markerRange );
				editing.modelToView.convertInsertion( outerRange );
				expect( editing.modelToView.convertMarker.calledWithExactly( 'addMarker', 'name', markerRange ) ).to.be.true;
			} );
		} );

		it( 'should not start marker conversion if content is not inserted into any marker range', () => {
			const markerRange = ModelRange.createFromParentsAndOffsets( modelRoot, 0, modelRoot, 3 );
			const insertRange = ModelRange.createFromParentsAndOffsets( modelRoot, 6, modelRoot, 8 );
			const consumableMock = {
				consume: () => true,
				test: () => true
			};

			model.markers.set( 'name', markerRange );

			sinon.spy( editing.modelToView, 'convertMarker' );

			editing.modelToView.fire( 'insert', {
				range: insertRange
			}, consumableMock, { dispatcher: editing.modelToView } );

			expect( editing.modelToView.convertMarker.called ).to.be.false;

			editing.modelToView.convertMarker.restore();
		} );

		it( 'should forward add marker event if content is moved into a marker range', () => {
			model.enqueueChanges( () => {
				model.batch().insert( ModelPosition.createAt( model.getRoot(), 'end' ), new ModelElement( 'paragraph' ) );
			} );

			const markerRange = ModelRange.createFromParentsAndOffsets( modelRoot, 0, modelRoot, 3 );

			model.markers.set( 'name', markerRange );

			sinon.spy( editing.modelToView, 'convertMarker' );

			editing.modelToView.convertMove(
				ModelPosition.createAt( modelRoot, 3 ),
				ModelRange.createOn( modelRoot.getChild( 1 ) )
			);

			expect( editing.modelToView.convertMarker.calledWith( 'addMarker', 'name' ) ).to.be.true;

			editing.modelToView.convertMarker.restore();
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should remove listenters', () => {
			const model = new ModelDocument();
			model.createRoot();
			model.schema.registerItem( 'paragraph', '$block' );

			const editing = new EditingController( model );

			const spy = sinon.spy();

			editing.modelToView.on( 'insert:$element', spy );

			editing.destroy();

			model.enqueueChanges( () => {
				const modelData = parse( '<paragraph>foo</paragraph>', model.schema ).getChild( 0 );
				model.batch().insert( ModelPosition.createAt( model.getRoot(), 0 ), modelData );
			} );

			expect( spy.called ).to.be.false;

			editing.destroy();
		} );

		it( 'should destroy view', () => {
			const model = new ModelDocument();
			model.createRoot();
			model.schema.registerItem( 'paragraph', '$block' );

			const editing = new EditingController( model );

			const spy = sinon.spy( editing.view, 'destroy' );

			editing.destroy();

			expect( spy.called ).to.be.true;
		} );
	} );
} );
