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
import { IMAGE_SRC_FIXTURE } from '../_utils/utils.js';
import { getSelectedImageWidthInUnits } from '../../../src/imageresize/utils/getselectedimagewidthinunits.js';

describe( 'getSelectedImageWidthInUnits', () => {
	let editor, model, editorElement;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await createEditor();
	} );

	afterEach( async () => {
		editorElement.remove();

		await editor.destroy();
	} );

	it( 'should return selected image width in pixels', () => {
		setData( model, '[<imageBlock resizedWidth="50px"></imageBlock>]' );

		expect( getSelectedImageWidthInUnits( editor, 'px' ) ).to.deep.equal( {
			value: 50,
			unit: 'px'
		} );
	} );

	it( 'should return null if image is not selected', () => {
		setData( model, '<imageBlock resizedWidth="0px"></imageBlock><paragraph>[abc]</paragraph>' );

		expect( getSelectedImageWidthInUnits( editor, 'px' ) ).to.equal( null );
	} );

	it( 'should return null if resizeWidth is malformed', () => {
		setData( model, '[<imageBlock resizedWidth="sdasdpx"></imageBlock>]' );

		expect( getSelectedImageWidthInUnits( editor, 'px' ) ).to.equal( null );
	} );

	it( 'should return casted percentage value to pixels', () => {
		setData( model, `[<imageBlock src="${ IMAGE_SRC_FIXTURE }" resizedWidth="62%"></imageBlock>]` );

		const { unit, value } = getSelectedImageWidthInUnits( editor, 'px' );

		expect( unit ).to.be.equal( 'px' );
		expect( value ).to.be.equal( 310 );
	} );

	it( 'should return casted pixels value to percentage', () => {
		setData( model, `[<imageBlock src="${ IMAGE_SRC_FIXTURE }" resizedWidth="250px"></imageBlock>]` );

		const { unit, value } = getSelectedImageWidthInUnits( editor, '%' );

		expect( unit ).to.be.equal( '%' );
		expect( value ).to.be.equal( 50 );
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
