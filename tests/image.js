/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Image from '../src/image';
import ImageEditing from '../src/image/imageediting';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import ImageTextAlternative from '../src/imagetextalternative';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'Image', () => {
	let editorElement, model, view, editor, document, viewDocument;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Image ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				document = model.document;
				view = editor.editing.view;
				viewDocument = editor.editing.view.document;
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( Image ) ).to.instanceOf( Image );
	} );

	it( 'should load ImageEditing plugin', () => {
		expect( editor.plugins.get( ImageEditing ) ).to.instanceOf( ImageEditing );
	} );

	it( 'should load Widget plugin', () => {
		expect( editor.plugins.get( Widget ) ).to.instanceOf( Widget );
	} );

	it( 'should load ImageTextAlternative plugin', () => {
		expect( editor.plugins.get( ImageTextAlternative ) ).to.instanceOf( ImageTextAlternative );
	} );

	describe( 'selection', () => {
		it( 'should create fake selection', () => {
			setModelData( model, '[<image alt="alt text" src="/assets/sample.png"></image>]' );

			expect( getViewData( view ) ).to.equal(
				'[<figure class="ck-widget ck-widget_selected image" contenteditable="false">' +
					'<img alt="alt text" src="/assets/sample.png"></img>' +
				'</figure>]'
			);

			expect( viewDocument.selection.isFake ).to.be.true;
			expect( viewDocument.selection.fakeSelectionLabel ).to.equal( 'alt text image widget' );
		} );

		it( 'should create proper fake selection label when alt attribute is empty', () => {
			setModelData( model, '[<image src="/assets/sample.png" alt=""></image>]' );

			expect( getViewData( view ) ).to.equal(
				'[<figure class="ck-widget ck-widget_selected image" contenteditable="false">' +
				'<img alt="" src="/assets/sample.png"></img>' +
				'</figure>]'
			);

			expect( viewDocument.selection.isFake ).to.be.true;
			expect( viewDocument.selection.fakeSelectionLabel ).to.equal( 'image widget' );
		} );

		it( 'should remove selected class from previously selected element', () => {
			setModelData( model,
				'[<image src="/assets/sample.png" alt="alt text"></image>]' +
				'<image src="/assets/sample.png" alt="alt text"></image>'
			);

			expect( getViewData( view ) ).to.equal(
				'[<figure class="ck-widget ck-widget_selected image" contenteditable="false">' +
				'<img alt="alt text" src="/assets/sample.png"></img>' +
				'</figure>]' +
				'<figure class="ck-widget image" contenteditable="false">' +
				'<img alt="alt text" src="/assets/sample.png"></img>' +
				'</figure>'
			);

			model.change( writer => {
				const secondImage = document.getRoot().getChild( 1 );
				writer.setSelection( writer.createRangeOn( secondImage ) );
			} );

			expect( getViewData( view ) ).to.equal(
				'<figure class="ck-widget image" contenteditable="false">' +
				'<img alt="alt text" src="/assets/sample.png"></img>' +
				'</figure>' +
				'[<figure class="ck-widget ck-widget_selected image" contenteditable="false">' +
				'<img alt="alt text" src="/assets/sample.png"></img>' +
				'</figure>]'
			);
		} );
	} );
} );
