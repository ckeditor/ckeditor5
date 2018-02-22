/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/tableui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import icon from '@ckeditor/ckeditor5-core/theme/icons/object-center.svg';

export default class TableUI extends Plugin {
	init() {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'insertTable', locale => {
			const command = editor.commands.get( 'insertTable' );
			const buttonView = new ButtonView( locale );

			buttonView.bind( 'isEnabled' ).to( command );

			buttonView.set( {
				label: 'Insert table',
				icon,
				tooltip: true
			} );

			buttonView.on( 'execute', () => {
				editor.execute( 'insertTable' );
				editor.editing.view.focus();
			} );

			return buttonView;
		} );
	}
}
