/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

declare global {
	interface Window { CKEditorInspector: any }
}

import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Image, ImageCaption, ImageStyle, ImageToolbar } from '@ckeditor/ckeditor5-image';
import { Indent } from '@ckeditor/ckeditor5-indent';
import { Link } from '@ckeditor/ckeditor5-link';
import { List } from '@ckeditor/ckeditor5-list';
import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Table, TableToolbar } from '@ckeditor/ckeditor5-table';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import FindAndReplace from '@ckeditor/ckeditor5-find-and-replace/src/findandreplace.js';
import SpecialCharacters from '@ckeditor/ckeditor5-special-characters/src/specialcharacters.js';
import SpecialCharactersEssentials from '@ckeditor/ckeditor5-special-characters/src/specialcharactersessentials.js';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting.js';
import { ButtonView, Dialog, View } from '../../../src/index.js';
import { Plugin } from '@ckeditor/ckeditor5-core';

class ViewWithEscSupport extends View {
	declare public count: number;

	constructor() {
		super();

		const bind = this.bindTemplate;

		this.set( 'count', 0 );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				tabindex: -1,
				style: {
					padding: '20px'
				}
			},
			children: [
				{
					tag: 'p',
					children: [
						'Focus me and press Esc key 10 times. Count: ',
						{ text: bind.to( 'count' ) }
					]
				}
			],
			on: {
				keydown: bind.to( ( evt: Event ) => {
					if ( ( evt as KeyboardEvent ).key == 'Escape' ) {
						if ( this.count++ < 9 ) {
							evt.preventDefault();
						}
					}
				} )
			}
		} );
	}

	public focus() {
		this.element!.focus();
	}
}

class DialogWithEscapeableChildren extends Plugin {
	public static get requires() {
		return [ Dialog ] as const;
	}

	public init(): void {
		const t = this.editor.locale.t;

		this.editor.ui.componentFactory.add( 'dialogWithEscHandling', locale => {
			const buttonView = new ButtonView( locale );

			buttonView.set( {
				label: t( 'Open dialog' ),
				tooltip: true,
				withText: true
			} );

			buttonView.on( 'execute', () => {
				const dialog = this.editor.plugins.get( 'Dialog' );

				dialog.show( {
					id: 'dialogWithEscHandling',
					isModal: true,
					title: t( 'Dialog with esc handling' ),
					content: new ViewWithEscSupport(),
					actionButtons: [

						{
							label: t( 'Cancel' ),
							withText: true,
							onExecute: () => dialog.hide()
						}
					]
				} );
			} );

			return buttonView;
		} );
	}
}

ClassicEditor.create( document.querySelector( '#editor' ) as HTMLElement, {
	plugins: [
		Essentials,
		Autoformat,
		BlockQuote,
		Bold,
		Heading,
		Image,
		ImageCaption,
		ImageStyle,
		ImageToolbar,
		Indent,
		Italic,
		Link,
		List,
		MediaEmbed,
		Paragraph,
		Table,
		TableToolbar,

		FindAndReplace,
		SpecialCharacters,
		SpecialCharactersEssentials,
		SourceEditing,

		DialogWithEscapeableChildren
	],
	toolbar: {
		items: [
			'dialogWithEscHandling',
			'|',
			'accessibilityHelp', 'heading', 'bold', 'italic', 'link', 'sourceediting', 'findAndReplace'
		],
		shouldNotGroupWhenFull: true
	},
	image: {
		toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|', 'imageTextAlternative' ]
	},
	ui: {
		viewportOffset: {
			top: 50
		}
	}
} )
	.then( editor => {
		Object.assign( window, { editor } );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
