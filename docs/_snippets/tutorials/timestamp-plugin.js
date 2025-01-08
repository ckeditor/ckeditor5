/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals console, window, document */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { List } from '@ckeditor/ckeditor5-list';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

import { Plugin } from '@ckeditor/ckeditor5-core';
import { ButtonView } from '@ckeditor/ckeditor5-ui';

class Timestamp extends Plugin {
	init() {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'timestamp', () => {
			const button = new ButtonView();

			button.set( {
				label: 'Timestamp',
				withText: true
			} );

			button.on( 'execute', () => {
				const now = new Date();

				editor.model.change( writer => {
					editor.model.insertContent( writer.createText( now.toString() ) );
				} );
			} );

			return button;
		} );
	}
}

ClassicEditor
	.create( document.querySelector( '#snippet-timestamp-plugin' ), {
		cloudServices: CS_CONFIG,
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		plugins: [ Essentials, Bold, Italic, Heading, List, Paragraph, Timestamp ],
		toolbar: [ 'heading', '|', 'bold', 'italic', 'numberedList', 'bulletedList', '|', 'timestamp' ],
		licenseKey: 'GPL'
	} )
	.then( editor => {
		window.editor = editor;
		window.attachTourBalloon( {
			target: window.findToolbarItem( editor.ui.view.toolbar,
				item => item.label && item.label === 'Timestamp' ),
			text: 'Click to add timestamp.',
			editor
		} );
	} )
	.catch( err => {
		console.error( err );
	} );

