/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module block-quote/blockquoteui
 */

import { Plugin } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';

import '../theme/blockquote.css';
import icon from '../theme/icons/quote.svg';

/**
 * The block quote UI plugin.
 *
 * It introduces the `'blockQuote'` button.
 *
 * @extends module:core/plugin~Plugin
 */
export default class BlockQuoteUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'BlockQuoteUI';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( 'blockQuote', locale => {
			const command = editor.commands.get( 'blockQuote' );
			const buttonView = new ButtonView( locale );

			buttonView.set( {
				label: t( 'Block quote' ),
				icon,
				tooltip: true,
				isToggleable: true
			} );

			// Bind button model to command.
			buttonView.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			// Execute command.
			this.listenTo( buttonView, 'execute', () => {
				editor.execute( 'blockQuote' );
				editor.editing.view.focus();
			} );

			return buttonView;
		} );
	}
}
