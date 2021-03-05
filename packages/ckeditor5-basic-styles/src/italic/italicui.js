/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/italic/italicui
 */

import { Plugin } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';

import italicIcon from '../../theme/icons/italic.svg';

const ITALIC = 'italic';

/**
 * The italic UI feature. It introduces the Italic button.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ItalicUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ItalicUI';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		// Add bold button to feature components.
		editor.ui.componentFactory.add( ITALIC, locale => {
			const command = editor.commands.get( ITALIC );
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Italic' ),
				icon: italicIcon,
				keystroke: 'CTRL+I',
				tooltip: true,
				isToggleable: true
			} );

			view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			// Execute command.
			this.listenTo( view, 'execute', () => {
				editor.execute( ITALIC );
				editor.editing.view.focus();
			} );

			return view;
		} );
	}
}
