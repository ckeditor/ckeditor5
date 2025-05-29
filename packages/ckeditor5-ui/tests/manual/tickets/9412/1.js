/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { IconBold } from '@ckeditor/ckeditor5-icons';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import ButtonView from '../../../../src/button/buttonview.js';

function customButtonView( editor ) {
	editor.ui.componentFactory.add( 'customButtonView', locale => {
		const view = new ButtonView( locale );
		view.set( {
			label: 'Custom Button',
			icon: IconBold,
			tooltip: true,
			withKeystroke: true
		} );

		return view;
	} );
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Essentials,
			Paragraph,
			Heading,
			customButtonView
		],
		toolbar: [ 'customButtonView' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
