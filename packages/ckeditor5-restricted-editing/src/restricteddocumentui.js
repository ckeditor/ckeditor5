/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module core/restricteddocumentui
 */

import Plugin from './plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import boldIcon from '@ckeditor/ckeditor5-basic-styles/theme/icons/bold.svg';

/**
 * @extends module:core/plugin~Plugin
 */
export default class RestrictedDocumentUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( 'nonRestricted', locale => {
			const command = editor.commands.get( 'nonRestricted' );
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Restricted editing' ),
				icon: boldIcon,
				tooltip: true,
				isToggleable: true
			} );

			view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			this.listenTo( view, 'execute', () => editor.execute( 'nonRestricted' ) );

			return view;
		} );
	}
}
