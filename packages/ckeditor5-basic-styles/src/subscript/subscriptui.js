/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/subscript/subscriptui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import subscriptIcon from '../../theme/icons/subscript.svg';

const SUBSCRIPT = 'subscript';

/**
 * The subscript UI feature. It introduces the Subscript button.
 *
 * @extends module:core/plugin~Plugin
 */
export default class SubscriptUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		// Add subscript button to feature components.
		editor.ui.componentFactory.add( SUBSCRIPT, locale => {
			const command = editor.commands.get( SUBSCRIPT );
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Subscript' ),
				icon: subscriptIcon,
				tooltip: true,
				isToggleable: true
			} );

			view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			// Execute command.
			this.listenTo( view, 'execute', () => editor.execute( SUBSCRIPT ) );

			return view;
		} );
	}
}
