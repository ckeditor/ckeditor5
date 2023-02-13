/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module remove-format/removeformatui
 */

import { Plugin } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';

import removeFormatIcon from '../theme/icons/remove-format.svg';

const REMOVE_FORMAT = 'removeFormat';

/**
 * The remove format UI plugin. It registers the `'removeFormat'` button which can be
 * used in the toolbar.
 *
 * @extends module:core/plugin~Plugin
 */
export default class RemoveFormatUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'RemoveFormatUI';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( REMOVE_FORMAT, locale => {
			const command = editor.commands.get( REMOVE_FORMAT );
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Remove Format' ),
				icon: removeFormatIcon,
				tooltip: true
			} );

			view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			// Execute the command.
			this.listenTo( view, 'execute', () => {
				editor.execute( REMOVE_FORMAT );
				editor.editing.view.focus();
			} );

			return view;
		} );
	}
}
