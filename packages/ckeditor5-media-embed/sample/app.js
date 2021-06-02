/* eslint-disable no-undef */
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import { Paragraph } from 'ckeditor5/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import CKEditorInspector from '@ckeditor/ckeditor5-inspector';

import { genericUrlRegex } from '@social-embed/lib';

import MediaEmbed from '../src/mediaembed';

import '@social-embed/wc';

ClassicEditor.create( document.querySelector( '#editor' ), {
	plugins: [ Essentials, Paragraph, Bold, Italic, MediaEmbed ],
	toolbar: [ 'bold', 'italic', 'mediaEmbed' ],
	mediaEmbed: {
		elementName: 'o-embed',
		extraProviders: [
			{
				name: 'genericProvider',
				url: genericUrlRegex,
				html: match => {
					return `<o-embed url="${ match[ 0 ] }"></o-embed>`;
				}
			}
		]
	}
} )
	.then( editor => {
		console.log( 'Editor was initialized', editor );
		window.editor = editor;
		CKEditorInspector.attach( editor );
	} )
	.catch( error => {
		console.error( error );
		console.error( error.stack );
	} );
