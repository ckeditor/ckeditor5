/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Image from '../src/image';
import ImageEngine from '../src/image/imageengine';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import ImageTextAlternative from '../src/imagetextalternative';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import ModelRange from '@ckeditor/ckeditor5-engine/src/model/range';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

describe( 'Image', () => {
	let editorElement, editor, document, viewDocument;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Image ]
			} )
			.then( newEditor => {
				editor = newEditor;
				document = editor.document;
				viewDocument = editor.editing.view;
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( Image ) ).to.instanceOf( Image );
	} );

	it( 'should load ImageEngine plugin', () => {
		expect( editor.plugins.get( ImageEngine ) ).to.instanceOf( ImageEngine );
	} );

	it( 'should load Widget plugin', () => {
		expect( editor.plugins.get( Widget ) ).to.instanceOf( Widget );
	} );

	it( 'should load ImageTextAlternative plugin', () => {
		expect( editor.plugins.get( ImageTextAlternative ) ).to.instanceOf( ImageTextAlternative );
	} );

	describe( 'selection', () => {
		it( 'should create fake selection', () => {
			setModelData( document, '[<image alt="alt text" src="foo.png"></image>]' );

			expect( getViewData( viewDocument ) ).to.equal(
				'[<figure class="image ck-widget ck-widget_selected" contenteditable="false">' +
					'<img alt="alt text" src="foo.png"></img>' +
				'</figure>]'
			);

			expect( viewDocument.selection.isFake ).to.be.true;
			expect( viewDocument.selection.fakeSelectionLabel ).to.equal( 'alt text image widget' );
		} );

		it( 'should create proper fake selection label when alt attribute is empty', () => {
			setModelData( document, '[<image src="foo.png" alt=""></image>]' );

			expect( getViewData( viewDocument ) ).to.equal(
				'[<figure class="image ck-widget ck-widget_selected" contenteditable="false">' +
				'<img alt="" src="foo.png"></img>' +
				'</figure>]'
			);

			expect( viewDocument.selection.isFake ).to.be.true;
			expect( viewDocument.selection.fakeSelectionLabel ).to.equal( 'image widget' );
		} );

		it( 'should remove selected class from previously selected element', () => {
			setModelData( document,
				'[<image src="foo.png" alt="alt text"></image>]' +
				'<image src="foo.png" alt="alt text"></image>'
			);

			expect( getViewData( viewDocument ) ).to.equal(
				'[<figure class="image ck-widget ck-widget_selected" contenteditable="false">' +
				'<img alt="alt text" src="foo.png"></img>' +
				'</figure>]' +
				'<figure class="image ck-widget" contenteditable="false">' +
				'<img alt="alt text" src="foo.png"></img>' +
				'</figure>'
			);

			document.enqueueChanges( () => {
				const secondImage = document.getRoot().getChild( 1 );
				document.selection.setRanges( [ ModelRange.createOn( secondImage ) ] );
			} );

			expect( getViewData( viewDocument ) ).to.equal(
				'<figure class="image ck-widget" contenteditable="false">' +
				'<img alt="alt text" src="foo.png"></img>' +
				'</figure>' +
				'[<figure class="image ck-widget ck-widget_selected" contenteditable="false">' +
				'<img alt="alt text" src="foo.png"></img>' +
				'</figure>]'
			);
		} );
	} );
} );
