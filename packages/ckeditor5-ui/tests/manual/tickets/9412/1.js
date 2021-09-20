/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document, console:false */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import boldIcon from '@ckeditor/ckeditor5-basic-styles/theme/icons/bold.svg';
import ButtonView from '../../../../src/button/buttonview';

function customButtonView( editor ) {
	editor.ui.componentFactory.add( 'customButtonView', locale => {
		const view = new ButtonView( locale );
		view.set( {
			label: 'Custom Button',
			icon: boldIcon,
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
