/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ButtonView, View, document, ClassicEditor, Essentials, Bold, Italic, Underline, Dialog, Paragraph, Plugin, console, window */

class MinimalisticDialog extends Plugin {
	get requires() {
		return [ Dialog ];
	}

	init() {
		this.editor.ui.componentFactory.add( 'showDialog', locale => {
			const buttonView = new ButtonView( locale );

			buttonView.set( {
				label: 'Show a dialog',
				tooltip: true,
				withText: true
			} );

			buttonView.on( 'execute', () => {
				const dialog = this.editor.plugins.get( 'Dialog' );

				if ( buttonView.isOn ) {
					dialog.hide();
					buttonView.isOn = false;

					return;
				}

				buttonView.isOn = true;

				const textView = new View( locale );

				textView.setTemplate( {
					tag: 'div',
					attributes: {
						style: {
							padding: 'var(--ck-spacing-large)',
							whiteSpace: 'initial',
							width: '100%',
							maxWidth: '500px'
						},
						tabindex: -1
					},
					children: [
						'This is a sample content of the dialog.',
						'You can put here text, images, inputs, buttons, etc.'
					]
				} );

				dialog.show( {
					title: 'Dialog with text',
					content: textView,
					actionButtons: [
						{
							label: 'OK',
							class: 'ck-button-action',
							withText: true,
							onExecute: () => dialog.hide()
						}
					],
					onHide() { buttonView.isOn = false; }
				} );
			} );

			return buttonView;
		} );
	}
}

ClassicEditor
	.create( document.querySelector( '#ui-dialog-editor' ), {
		plugins: [ Essentials, Paragraph, Bold, Italic, Underline, MinimalisticDialog, Dialog ],
		toolbar: [ 'bold', 'italic', 'underline', '|', 'showDialog' ]
	} )
	.then( editor => {
		window.attachTourBalloon( {
			target: window.findToolbarItem( editor.ui.view.toolbar,
				item => item.label === 'Show a dialog' ),
			text: 'Click here to display a dialog.',
			editor,
			tippyOptions: {
				placement: 'bottom-start'
			}
		} );
	} )
	.catch( error => {
		console.error( error.stack );
	} );
