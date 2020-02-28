/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import Resizer from '../../src/widgetresize/resizer';

import Element from '@ckeditor/ckeditor5-engine/src/model/element';
import ContainerElement from '@ckeditor/ckeditor5-engine/src/view/containerelement';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

describe( 'Resizer', () => {
	let editor, editorElement;

	before( () => {
		editorElement = document.createElement( 'div' );
		document.body.append( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [
					ArticlePluginSet
				]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	after( () => {
		editorElement.remove();
		return editor.destroy();
	} );

	it( 'constructs properly', () => {
		const resizerInstance = createResizer();

		expect( resizerInstance.isEnabled ).to.be.true;
	} );

	describe( 'markup', () => {
		let resizerInstance, renderedElement;

		before( () => {
			resizerInstance = createResizer();
			resizerInstance.attach();

			renderedElement = resizerInstance._viewResizerWrapper.render( document );
		} );

		after( () => {
			renderedElement.remove();
		} );

		it( 'root element contains proper classes', () => {
			const rootElementClasses = Array.from( renderedElement.classList );

			expect( rootElementClasses ).to.include( 'ck' );
			expect( rootElementClasses ).to.include( 'ck-reset_all' );
			expect( rootElementClasses ).to.include( 'ck-widget__resizer' );
		} );

		it( 'includes handle for each corner', () => {
			const handleSelectors = [
				'.ck-widget__resizer__handle.ck-widget__resizer__handle-bottom-right',
				'.ck-widget__resizer__handle.ck-widget__resizer__handle-bottom-left',
				'.ck-widget__resizer__handle.ck-widget__resizer__handle-top-left',
				'.ck-widget__resizer__handle.ck-widget__resizer__handle-top-right'
			];

			for ( const selector of handleSelectors ) {
				expect( renderedElement.querySelectorAll( selector ).length, `Selector "${ selector }" matches` ).to.be.equal( 1 );
			}
		} );

		it( 'renders sizeUi', () => {
			expect( renderedElement.querySelectorAll( '.ck-size-view' ).length ).to.be.equal( 1 );
		} );
	} );

	describe( 'redraw()', () => {
		it( 'works fetch proper rect if handleHostRect argument not given explicitly', () => {
			const resizerInstance = createResizer( {
				getHandleHost: widgetWrapper => widgetWrapper
			} );
			resizerInstance.attach();
			const renderedElement = resizerInstance._viewResizerWrapper.render( document );

			document.body.appendChild( renderedElement );

			resizerInstance.redraw();

			// Cleanup.
			renderedElement.remove();
		} );
	} );

	describe( '_proposeNewSize()', () => {
		let resizer;

		beforeEach( () => {
			const state = {
				originalWidth: 40,
				originalHeight: 40,
				originalWidthPercents: 10,
				aspectRatio: 1,
				_referenceCoordinates: {
					x: 0,
					y: 0
				},
				activeHandlePosition: 'bottom-right'
			};

			resizer = createResizer();
			resizer.state = state;
		} );

		it( 'enlarges center-aligned objects correctly', () => {
			// Note that center-aligned objects needs to be enlarged twice as much
			// as your x-axis mouse distance, since it expands towards both directions.
			const proposedSize = resizer._proposeNewSize( {
				pageX: 50,
				pageY: 50
			} );

			expect( proposedSize.width, 'width' ).to.be.equal( 60 );
			expect( proposedSize.height, 'height' ).to.be.equal( 60 );
			expect( proposedSize.widthPercents, 'widthPercents' ).to.be.equal( 15 );
		} );

		it( 'enlarges objects correctly', () => {
			resizer._options.isCentered = () => false;

			const proposedSize = resizer._proposeNewSize( {
				pageX: 50,
				pageY: 50
			} );

			expect( proposedSize.width, 'width' ).to.be.equal( 50 );
			expect( proposedSize.height, 'height' ).to.be.equal( 50 );
			expect( proposedSize.widthPercents, 'widthPercents' ).to.be.equal( 12.5 );
		} );

		it( 'rounds returned width and height properties', () => {
			const proposedSize = resizer._proposeNewSize( {
				pageX: 50.000000000002,
				pageY: 50.000000000002
			} );

			expect( proposedSize.width, 'width' ).to.be.equal( 60 );
			expect( proposedSize.height, 'height' ).to.be.equal( 60 );
		} );
	} );

	function createResizer( customOptions ) {
		const model = new Element( 'resizable' );
		const viewElement = new ContainerElement( 'div' );

		return new Resizer( Object.assign( {
			modelElement: model,
			viewElement,
			editor
		}, customOptions ) );
	}
} );
