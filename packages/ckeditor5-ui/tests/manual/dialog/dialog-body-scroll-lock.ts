/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Plugin } from '@ckeditor/ckeditor5-core';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { ButtonView, Dialog, TextareaView } from '../../../src/index.js';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';

declare global {
	interface Window { editor: any }
}

interface FormElements extends HTMLFormControlsCollection {
	isScrollable: RadioNodeList;
	hasPosition: RadioNodeList;
}

class PluginWithModal extends Plugin {
	public static get requires() {
		return [ Dialog ] as const;
	}

	public init(): void {
		this.editor.ui.componentFactory.add( 'modal', locale => {
			const button = new ButtonView( locale );
			const dialog = this.editor.plugins.get( 'Dialog' );
			const textareaView = new TextareaView( locale );

			textareaView.minRows = 5;
			textareaView.maxRows = 10;
			textareaView.value =
				`Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor
				quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean
				ultricies mi vitae est. Mauris placerat eleifend leo.`.repeat( 10 );

			button.label = '>>> Open modal <<<';
			button.withText = true;
			button.on( 'execute', () => {
				dialog.show( {
					id: 'modalWithText',
					isModal: true,
					title: 'A modal',
					content: textareaView,
					actionButtons: [
						{
							label: 'Close',
							class: 'ck-button-action',
							withText: true,
							onExecute: () => dialog.hide()
						}
					],
					onShow() {
						textareaView.element!.style.margin = '10px';
						textareaView.element!.style.width = '400px';
					}
				} );
			} );

			return button;
		} );
	}
}

ClassicEditor.create( document.querySelector( '#editor' ) as HTMLElement, {
	extraPlugins: [ Essentials, Heading, Bold, Italic, PluginWithModal ],
	toolbar: [ 'heading', '|', 'bold', 'italic', '|', 'modal' ]
} ).then( editor => {
	window.editor = editor;
} );

const form = document.querySelector( 'form' )!;

form.addEventListener( 'change', () => {
	const elements = form.elements as FormElements;

	document.body.style.height = elements.isScrollable.value === 'yes' ? '3000px' : '';
	document.body.style.width = elements.isScrollable.value === 'yes' ? '3000px' : '';

	document.body.style.position = elements.hasPosition.value === 'yes' ? 'absolute' : '';
	document.body.style.top = elements.hasPosition.value === 'yes' ? '100px' : '';
	document.body.style.left = elements.hasPosition.value === 'yes' ? '100px' : '';
} );
