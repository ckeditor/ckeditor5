/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ckfinder/ckfinderui
 */

import { Plugin } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';
import type { ImageInsertUI } from '@ckeditor/ckeditor5-image';

import type CKFinderCommand from './ckfindercommand';

import browseFilesIcon from '../theme/icons/browse-files.svg';

/**
 * The CKFinder UI plugin. It introduces the `'ckfinder'` toolbar button.
 */
export default class CKFinderUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'CKFinderUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const componentFactory = editor.ui.componentFactory;
		const t = editor.t;

		componentFactory.add( 'ckfinder', locale => {
			const command: CKFinderCommand = editor.commands.get( 'ckfinder' )!;

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

		if ( editor.plugins.has( 'ImageInsertUI' ) ) {
			const imageInsertUI: ImageInsertUI = editor.plugins.get( 'ImageInsertUI' );

			imageInsertUI.registerIntegration( 'assetManager', type => {
				const button = this.editor.ui.componentFactory.create( 'ckfinder' ) as ButtonView;

				if ( type == 'formView' ) {
					button.class = 'ck-image-insert__ck-finder-button';
					button.withText = true;
					button.label = t( 'Insert with a File manager' ); // TODO add to context (note that it's shared with CKBox)
					// TODO this should change to 'Replace with a File manager' if image is selected
				}

				return button;
			} );
		}
	}
}
