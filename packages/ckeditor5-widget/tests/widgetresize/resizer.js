/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import Resizer from '../../src/widgetresize/resizer';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
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
				],
				image: {
					toolbar: [ 'imageStyle:block', 'imageStyle:side' ]
				}
			} )
			.then( newEditor => {
				editor = newEditor;

				editor.model.schema.register( 'resizable', {
					isBlock: true,
					allowWhere: '$block'
				} );

				editor.conversion.for( 'downcast' ).elementToElement( {
					model: 'resizable',
					view: {
						name: 'div',
						classes: 'resizable'
					}
				} );
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
				expect( renderedElement.querySelectorAll( selector ).length, `Selector "${ selector }" matches` ).to.equal( 1 );
			}
		} );

		it( 'renders sizeUi', () => {
			expect( renderedElement.querySelectorAll( '.ck-size-view' ).length ).to.equal( 1 );
		} );
	} );

	describe( 'attach()', () => {
		it( 'doesn\'t show resizer if it\'s initialized as disabled', () => {
			const resizerInstance = createResizer();
			resizerInstance.isEnabled = false;
			resizerInstance.attach();

			const domResizerWrapper = resizerInstance._viewResizerWrapper.render( document );
			expect( domResizerWrapper.style.display ).to.equal( 'none' );
		} );

		it( 'hides the resizer if it gets disabled at a runtime', () => {
			const resizerInstance = createResizer();
			resizerInstance.isEnabled = true;
			resizerInstance.attach();
			const domResizerWrapper = resizerInstance._viewResizerWrapper.render( document );

			resizerInstance.isEnabled = false;
			expect( domResizerWrapper.style.display ).to.equal( 'none' );
		} );

		it( 'restores the resizer if it gets enabled at a runtime', () => {
			const resizerInstance = createResizer( {
				getHandleHost: widgetWrapper => widgetWrapper
			} );
			resizerInstance.isEnabled = false;
			resizerInstance.attach();
			const domResizerWrapper = resizerInstance._viewResizerWrapper.render( document );

			resizerInstance.isEnabled = true;
			expect( domResizerWrapper.style.display ).to.equal( '' );
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

		// https://github.com/ckeditor/ckeditor5/issues/7633
		it( 'should not cause changes in the view unless the host size actually changed', () => {
			const resizerInstance = createResizer( {
				getHandleHost: widgetWrapper => widgetWrapper
			} );

			resizerInstance.attach();
			const renderedElement = resizerInstance._viewResizerWrapper.render( document );

			document.body.appendChild( renderedElement );

			const viewChangeSpy = sinon.spy( editor.editing.view, 'change' );

			resizerInstance.redraw();
			sinon.assert.calledOnce( viewChangeSpy );

			resizerInstance.redraw();
			sinon.assert.calledOnce( viewChangeSpy );

			const host = resizerInstance._getHandleHost();

			host.style.width = '123px';

			resizerInstance.redraw();
			sinon.assert.calledTwice( viewChangeSpy );

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

			expect( proposedSize.width, 'width' ).to.equal( 60 );
			expect( proposedSize.height, 'height' ).to.equal( 60 );
			expect( proposedSize.widthPercents, 'widthPercents' ).to.equal( 15 );
		} );

		it( 'enlarges objects correctly', () => {
			resizer._options.isCentered = () => false;

			const proposedSize = resizer._proposeNewSize( {
				pageX: 50,
				pageY: 50
			} );

			expect( proposedSize.width, 'width' ).to.equal( 50 );
			expect( proposedSize.height, 'height' ).to.equal( 50 );
			expect( proposedSize.widthPercents, 'widthPercents' ).to.equal( 12.5 );
		} );

		it( 'rounds returned width and height properties', () => {
			const proposedSize = resizer._proposeNewSize( {
				pageX: 50.000000000002,
				pageY: 50.000000000002
			} );

			expect( proposedSize.width, 'width' ).to.equal( 60 );
			expect( proposedSize.height, 'height' ).to.equal( 60 );
		} );
	} );

	describe( '_domResizerWrapper', () => {
		it( 'should refer to a DOM element in the editing root despite being rendered multiple times (also in different documents)', () => {
			const resizerInstance = createResizer();
			const anotherDocument = document.implementation.createDocument( 'http://www.w3.org/1999/xhtml', 'html', null );

			resizerInstance.isEnabled = true;
			resizerInstance.attach();

			// Render in the same DOM document as the editor editing DOM root.
			resizerInstance._viewResizerWrapper.render( document );

			// Again, render in the same DOM document as editor editing DOM root.
			resizerInstance._viewResizerWrapper.render( document );

			// Render in some other document. This could be a document in an <iframe>.
			resizerInstance._viewResizerWrapper.render( anotherDocument );

			expect( resizerInstance._domResizerWrapper.ownerDocument ).to.equal( document );
			expect( editor.editing.view.getDomRoot().contains( resizerInstance._domResizerWrapper ) ).to.be.true;
		} );
	} );

	function createResizer( customOptions ) {
		setModelData( editor.model, '<resizable></resizable>' );

		return new Resizer( Object.assign( {
			modelElement: editor.model.document.getRoot().getChild( 0 ),
			viewElement: editor.editing.view.document.getRoot().getChild( 0 ),
			editor
		}, customOptions ) );
	}
} );
