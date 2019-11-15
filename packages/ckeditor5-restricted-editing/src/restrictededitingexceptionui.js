/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module restricted-editing/restrictededitingexceptionui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import restrictedDocumentIcon from '../theme/icons/restricted.svg';

/**
 * @extends module:core/plugin~Plugin
 */
export default class RestrictedEditingExceptionUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( 'restrictedEditingException', locale => {
			const command = editor.commands.get( 'restrictedEditingException' );
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Restricted editing' ),
				icon: restrictedDocumentIcon,
				tooltip: true,
				isToggleable: true
			} );

			view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			this.listenTo( view, 'execute', () => editor.execute( 'restrictedEditingException' ) );

			return view;
		} );
	}
}
