/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module code-block/codeblockui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import codeBlockIcon from '../theme/icons/codeblock.svg';
import '../theme/codeblock.css';

/**
 * The code block UI plugin.
 *
 * Introduces the `'codeBlock'` button.
 *
 * @extends module:core/plugin~Plugin
 */
export default class CodeBlockUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( 'codeBlock', locale => {
			const command = editor.commands.get( 'codeBlock' );
			const buttonView = new ButtonView( locale );

			buttonView.set( {
				label: t( 'Code block' ),
				icon: codeBlockIcon,
				tooltip: true,
				isToggleable: true
			} );

			// Bind button model to command.
			buttonView.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			// Execute command.
			this.listenTo( buttonView, 'execute', () => editor.execute( 'codeBlock' ) );

			return buttonView;
		} );
	}
}
