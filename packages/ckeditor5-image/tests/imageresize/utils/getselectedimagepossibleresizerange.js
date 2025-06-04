/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Widget from '@ckeditor/ckeditor5-widget/src/widget.js';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import ImageResizeEditing from '../../../src/imageresize/imageresizeediting.js';
import ImageCaptionEditing from '../../../src/imagecaption/imagecaptionediting.js';
import Image from '../../../src/image.js';
import ImageStyle from '../../../src/imagestyle.js';
import { getSelectedImagePossibleResizeRange } from '../../../src/imageresize/utils/getselectedimagepossibleresizerange.js';

describe( 'getSelectedImagePossibleResizeRange', () => {
	let editor, model, editorElement;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );
		editor = await createEditor();
	} );

	afterEach( async () => {
		editorElement.remove();

		if ( editor ) {
			await editor.destroy();
		}
	} );

	it( 'should return null if image is not selected', () => {
		setData( model, '<imageBlock resizedWidth="50px"></imageBlock>[<paragraph>ABC</paragraph>]' );
		expect( getSelectedImagePossibleResizeRange( editor, '%' ) ).to.be.null;
	} );

	it( 'should return proper resize range', () => {
		setData( model, '[<imageBlock resizedWidth="50px"></imageBlock>]' );

		expect( getSelectedImagePossibleResizeRange( editor, '%' ) ).to.be.deep.equal( {
			unit: '%',
			lower: 10,
			upper: 100
		} );

		expect( getSelectedImagePossibleResizeRange( editor, 'px' ) ).to.be.deep.equal( {
			unit: 'px',
			lower: 50,
			upper: 500
		} );
	} );

	it( 'should return proper fallback if `minWidth` is not set on resized image', () => {
		const { getComputedStyle } = window;

		setData( model, '[<imageBlock resizedWidth="50px"></imageBlock>]' );

		window.getComputedStyle = element => {
			const result = getComputedStyle( element );

			return {
				width: result.width,
				minWidth: null
			};
		};

		expect( getSelectedImagePossibleResizeRange( editor, '%' ) ).to.be.deep.equal( {
			unit: '%',
			lower: 0.2,
			upper: 100
		} );

		expect( getSelectedImagePossibleResizeRange( editor, 'px' ) ).to.be.deep.equal( {
			unit: 'px',
			lower: 1,
			upper: 500
		} );

		window.getComputedStyle = getComputedStyle;
	} );

	async function createEditor( config ) {
		const editor = await ClassicEditor.create( editorElement, config || {
			plugins: [ Widget, Image, ImageStyle, ImageCaptionEditing, ImageResizeEditing, Paragraph ],
			image: {
				resizeUnit: 'px'
			}
		} );

		editor.editing.view.change( writer => {
			writer.setStyle(
				{
					width: '500px',
					padding: '0px'
				},
				editor.editing.view.document.getRoot()
			);
		} );

		model = editor.model;
		return editor;
	}
} );
