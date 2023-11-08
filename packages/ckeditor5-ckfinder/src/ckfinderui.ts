/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ckfinder/ckfinderui
 */

import { icons, Plugin } from 'ckeditor5/src/core';
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
			const command: CKFinderCommand = editor.commands.get( 'ckfinder' )!;

			imageInsertUI.registerIntegration( 'assetManager', command, type => {
				const button = this.editor.ui.componentFactory.create( 'ckfinder' ) as ButtonView;

				button.icon = icons.imageFolder;

				if ( type == 'formView' ) {
					button.class = 'ck-image-insert__ck-finder-button';
					button.withText = true;

					// TODO add to context (note that it's shared with CKBox)
					button.bind( 'label' ).to( imageInsertUI, 'isImageSelected', isImageSelected => isImageSelected ?
						t( 'Replace with File Manager' ) :
						t( 'Insert with File Manager' )
					);
				}

				return button;
			} );
		}
	}
}
