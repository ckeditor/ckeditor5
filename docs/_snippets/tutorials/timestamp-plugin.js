/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor, Bold, Italic, Essentials, Heading, List, Paragraph, Plugin, ButtonView } from 'ckeditor5';
import {
	CS_CONFIG,
	getViewportTopOffsetConfig,
	attachTourBalloon,
	findToolbarItem
} from '@snippets/index.js';

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
				top: getViewportTopOffsetConfig()
			}
		},
		plugins: [ Essentials, Bold, Italic, Heading, List, Paragraph, Timestamp ],
		toolbar: [ 'heading', '|', 'bold', 'italic', 'numberedList', 'bulletedList', '|', 'timestamp' ]
	} )
	.then( editor => {
		window.editor = editor;

		attachTourBalloon( {
			target: findToolbarItem( editor.ui.view.toolbar, item => item.label && item.label === 'Timestamp' ),
			text: 'Click to add timestamp.',
			editor
		} );
	} )
	.catch( err => {
		console.error( err );
	} );

