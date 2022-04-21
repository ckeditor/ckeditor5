/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ckfinder/ckfinderui
 */

import { Plugin } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';

import browseFilesIcon from '../theme/icons/browse-files.svg';

/**
 * The CKFinder UI plugin. It introduces the `'ckfinder'` toolbar button.
 *
 * @extends module:core/plugin~Plugin
 */
export default class CKFinderUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'CKFinderUI';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const componentFactory = editor.ui.componentFactory;
		const t = editor.t;

		componentFactory.add( 'ckfinder', locale => {
			const command = editor.commands.get( 'ckfinder' );

			const button = new ButtonView( locale );

			button.set( {
				label: t( 'Insert image or file' ),
				icon: browseFilesIcon,
				tooltip: true
			} );

			button.bind( 'isEnabled' ).to( command );

			button.on( 'execute', () => {
				editor.execute( 'ckfinder' );
				editor.editing.view.focus();
			} );

			return button;
		} );
	}
}
