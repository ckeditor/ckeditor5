/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ckbox/ckboxui
 */

import { Plugin } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';

import browseFilesIcon from '../theme/icons/browse-files.svg';

/**
 * The CKBoxUI plugin. It introduces the `'ckbox'` toolbar button.
 *
 * @extends module:core/plugin~Plugin
 */
export default class CKBoxUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'CKBoxUI';
	}

	/**
	 * @inheritDoc
	 */
	afterInit() {
		const editor = this.editor;

		// Do not register the `ckbox` button if the command does not exist.
		if ( !editor.commands.get( 'ckbox' ) ) {
			return;
		}

		const t = editor.t;
		const componentFactory = editor.ui.componentFactory;

		componentFactory.add( 'ckbox', locale => {
			const command = editor.commands.get( 'ckbox' );

			const button = new ButtonView( locale );

			button.set( {
				label: t( 'Open file manager' ),
				icon: browseFilesIcon,
				tooltip: true
			} );

			button.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			button.on( 'execute', () => {
				editor.execute( 'ckbox' );
			} );

			return button;
		} );
	}
}
