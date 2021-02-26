/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/subscript/subscriptui
 */

import { Plugin } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';

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
	static get pluginName() {
		return 'SubscriptUI';
	}

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
			this.listenTo( view, 'execute', () => {
				editor.execute( SUBSCRIPT );
				editor.editing.view.focus();
			} );

			return view;
		} );
	}
}
