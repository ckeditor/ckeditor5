/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module paragraph/paragraphbuttonui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import icon from '../theme/icons/paragraph.svg';

export default class ParagraphButtonUI extends Plugin {
	init() {
		const editor = this.editor;
		editor.ui.componentFactory.add( 'paragraph', locale => {
			const view = new ButtonView( locale );
			const command = editor.commands.get( 'paragraph' );

			view.label = 'Paragraph';
			view.icon = icon;
			view.tooltip = true;
			view.bind( 'isEnabled' ).to( command );
			view.bind( 'isOn' ).to( command, 'value' );

			view.on( 'execute', () => {
				editor.execute( 'paragraph' );
			} );

			return view;
		} );
	}
}
