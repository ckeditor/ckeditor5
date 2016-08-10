/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals setTimeout, Range, document */
/* bender-tags: view */

import EditingController from '/ckeditor5/engine/editingcontroller.js';

import ViewDocument from '/ckeditor5/engine/view/document.js';

import Mapper from '/ckeditor5/engine/conversion/mapper.js';
import ModelConversionDispatcher from '/ckeditor5/engine/conversion/modelconversiondispatcher.js';
import buildModelConverter from '/ckeditor5/engine/conversion/buildmodelconverter.js';

import ModelDocument from '/ckeditor5/engine/model/document.js';
import ModelPosition from '/ckeditor5/engine/model/position.js';
import ModelRange from '/ckeditor5/engine/model/range.js';
import ModelDocumentFragment from '/ckeditor5/engine/model/documentfragment.js';

import createElement from '/ckeditor5/utils/dom/createelement.js';

import { parse, getData as getModelData } from '/tests/engine/_utils/model.js';
import { getData as getViewData } from '/tests/engine/_utils/view.js';

describe( 'EditingController', () => {
	describe( 'constructor', () => {
		let model, editing;

		beforeEach( () => {
			model = new ModelDocument();
			editing = new EditingController( model );
		} );

		it( 'should create controller with properties', () => {
			expect( editing ).to.have.property( 'model' ).that.equals( model );
			expect( editing ).to.have.property( 'view' ).that.is.instanceof( ViewDocument );
			expect( editing ).to.have.property( 'mapper' ).that.is.instanceof( Mapper );
			expect( editing ).to.have.property( 'modelToView' ).that.is.instanceof( ModelConversionDispatcher );
		} );
	} );

	describe( 'createRoot', () => {
		let model, modelRoot, editing;

		beforeEach( () => {
			model = new ModelDocument();
			modelRoot = model.createRoot();
			model.createRoot( '$root', 'header' );

			editing = new EditingController( model );
		} );

		it( 'should create root', () => {
			const domRoot = createElement( document, 'div', null, createElement( document, 'p' ) );

			const viewRoot = editing.createRoot( domRoot );

			expect( viewRoot ).to.equal( editing.view.getRoot() );
			expect( domRoot ).to.equal( editing.view.getDomRoot() );

			expect( editing.view.domConverter.getCorrespondingDom( viewRoot ) ).to.equal( domRoot );
			expect( editing.view.renderer.markedChildren.has( viewRoot ) ).to.be.true;

			expect( editing.mapper.toModelElement( viewRoot ) ).to.equal( modelRoot );
			expect( editing.mapper.toViewElement( modelRoot ) ).to.equal( viewRoot );
		} );

		it( 'should create root with given name', () => {
			const domRoot = createElement( document, 'div', null, createElement( document, 'p' ) );

			const viewRoot = editing.createRoot( domRoot, 'header' );

			expect( viewRoot ).to.equal( editing.view.getRoot( 'header' ) );
			expect( domRoot ).to.equal( editing.view.getDomRoot( 'header' ) );

			expect( editing.view.domConverter.getCorrespondingDom( viewRoot ) ).to.equal( domRoot );
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

			expect( editing.view.domConverter.getCorrespondingDom( viewRoot ) ).to.equal( domRoot );
			expect( editing.view.renderer.markedChildren.has( viewRoot ) ).to.be.true;

			expect( editing.mapper.toModelElement( viewRoot ) ).to.equal( modelRoot );
			expect( editing.mapper.toViewElement( modelRoot ) ).to.equal( viewRoot );
		} );
	} );

	describe( 'conversion', () => {
		let model, modelRoot, viewRoot, domRoot, editing;

		before( () => {
			model = new ModelDocument();
			modelRoot = model.createRoot();

			editing = new EditingController( model );

			domRoot = document.getElementById( 'editor' );
			viewRoot = editing.createRoot( domRoot );

			model.schema.registerItem( 'paragraph', '$block' );
			buildModelConverter().for( editing.modelToView ).fromElement( 'paragraph' ).toElement( 'p' );
		} );

		beforeEach( () => {
			// Note: The below code is highly overcomplicated due to #455.

			model.selection.removeAllRanges();
			modelRoot.removeChildren( 0, modelRoot.childCount );

			viewRoot.removeChildren( 0, viewRoot.childCount );

			const modelData = new ModelDocumentFragment( parse(
				'<paragraph>foo</paragraph>' +
				'<paragraph></paragraph>' +
				'<paragraph>bar</paragraph>'
			)._children );

			model.enqueueChanges( () => {
				model.batch().insert( ModelPosition.createAt( model.getRoot(), 0 ), modelData );
				model.selection.addRange( ModelRange.createFromParentsAndOffsets(
					modelRoot.getChild( 0 ), 1, modelRoot.getChild( 0 ), 1 ) );
			} );
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

		it( 'should convert selection from view to model', ( done ) => {
			editing.view.on( 'selectionChange', () => {
				setTimeout( () => {
					expect( getModelData( model ) ).to.equal(
						'<paragraph>foo</paragraph>' +
						'<paragraph></paragraph>' +
						'<paragraph>b<selection>a</selection>r</paragraph>' );
					done();
				} );
			} );

			editing.view.isFocused = true;

			const domSelection = document.getSelection();
			domSelection.removeAllRanges();
			const domBar = domRoot.childNodes[ 2 ].childNodes[ 0 ];
			const domRange = new Range();
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
	} );

	describe( 'destroy', () => {
		it( 'should remove listenters', () => {
			let model, editing;

			model = new ModelDocument();
			model.createRoot();
			model.schema.registerItem( 'paragraph', '$block' );

			editing = new EditingController( model );

			const spy = sinon.spy();

			editing.modelToView.on( 'insert:$element', spy );

			editing.destroy();

			model.enqueueChanges( () => {
				const modelData = parse( '<paragraph>foo</paragraph>' ).getChild( 0 );
				model.batch().insert( ModelPosition.createAt( model.getRoot(), 0 ), modelData );
			} );

			expect( spy.called ).to.be.false;
		} );
	} );
} );
