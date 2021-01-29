/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { Plugin, Command } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';

class ACommand extends Command {
	execute() {
		const model = this.editor.model;

		model.change( writer => {
			model.insertContent( writer.createText( 'The cake is a lie!' ) );
		} );
	}
}

class DLLConsumerPlugin extends Plugin {
	constructor( editor ) {
		super( editor );

		editor.commands.add( 'a-command', new ACommand( editor ) );

		editor.ui.componentFactory.add( 'a-button', locale => {
			const button = new ButtonView( locale );

			const command = editor.commands.get( 'a-command' );

			button.set( {
				withText: true,
				icon: false,
				label: 'Click me!'
			} );

			button.bind( 'isEnabled' ).to( command );

			button.on( 'execute', () => editor.execute( 'a-command' ) );

			return button;
		} );
	}
}

export default DLLConsumerPlugin;
