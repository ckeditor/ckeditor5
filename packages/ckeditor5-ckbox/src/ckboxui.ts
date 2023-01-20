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
import type CKBoxCommand from './ckboxcommand';

/**
 * The CKBoxUI plugin. It introduces the `'ckbox'` toolbar button.
 */
export default class CKBoxUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'CKBoxUI' {
		return 'CKBoxUI';
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
		const editor = this.editor;

		const command: CKBoxCommand | undefined = editor.commands.get( 'ckbox' );

		// Do not register the `ckbox` button if the command does not exist.
		if ( !command ) {
			return;
		}

		const t = editor.t;
		const componentFactory = editor.ui.componentFactory;

		componentFactory.add( 'ckbox', locale => {
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
