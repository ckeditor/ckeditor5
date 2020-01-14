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

	function createResizer() {
		const model = new Element( 'resizable' );
		const viewElement = new ContainerElement( 'div' );

		return new Resizer( {
			modelElement: model,
			viewElement,
			editor
		} );
	}
} );
