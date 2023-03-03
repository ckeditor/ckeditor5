/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module block-quote/blockquoteui
 */

import { Plugin, icons } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';
import type BlockQuoteCommand from './blockquotecommand';

import '../theme/blockquote.css';

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
	public static get pluginName(): 'BlockQuoteUI' {
		return 'BlockQuoteUI';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( 'blockQuote', locale => {
			const command: BlockQuoteCommand = editor.commands.get( 'blockQuote' )!;
			const buttonView = new ButtonView( locale );

			buttonView.set( {
				label: t( 'Block quote' ),
				icon: icons.quote,
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
