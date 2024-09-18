/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, window, document */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Enter } from '@ckeditor/ckeditor5-enter';
import { Typing } from '@ckeditor/ckeditor5-typing';
import { Link, LinkImage } from '@ckeditor/ckeditor5-link';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Undo } from '@ckeditor/ckeditor5-undo';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { Table } from '@ckeditor/ckeditor5-table';
import { Image, ImageUpload, ImageInsert } from '@ckeditor/ckeditor5-image';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { EasyImage } from '@ckeditor/ckeditor5-easy-image';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { ButtonView } from '@ckeditor/ckeditor5-ui';

import Bookmark from '../../src/bookmark.js';
import BookmarkFormView from '../../src/ui/bookmarkformview.js';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Link, LinkImage, Typing, Paragraph, Undo, Enter, Table, Image, ImageUpload,
			EasyImage, CloudServices, ImageInsert, Heading, Bold, Italic, Bookmark, BookmarkTest
		],
		toolbar: [
			'bookmark', '|',
			'undo', 'redo', '|',
			'bold', 'italic', '|',
			'insertImage', 'insertTable', '|',
			'heading', 'link', 'bookmarkTest'
		],
		cloudServices: CS_CONFIG,
		menuBar: {
			isVisible: true
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

function BookmarkTest( editor ) {
	editor.ui.componentFactory.add( 'bookmarkTest', () => {
		const buttonView = new ButtonView( editor.locale );
		let formView = null;

		buttonView.set( {
			label: 'Test bookmark',
			withText: true
		} );

		buttonView.on( 'execute', () => {
			const balloon = editor.plugins.get( 'ContextualBalloon' );

			if ( !formView ) {
				formView = new BookmarkFormView( editor.locale, [
					( { id } ) => !id ? 'Some fake error' : null
				] );
			}

			formView.on( 'submit', () => {
				if ( formView.isValid() ) {
					console.log( 'Bookmark ID:', formView.id );

					formView.insertButtonView.focus();
					balloon.remove( formView );
					editor.editing.view.focus();
				}
			} );

			formView.idInputView.on( 'change:errorText', () => {
				editor.ui.update();
			} );

			formView.resetFormStatus();

			balloon.add( {
				view: formView,
				position: {
					target: buttonView.element
				}
			} );
		} );

		return buttonView;
	} );
}
