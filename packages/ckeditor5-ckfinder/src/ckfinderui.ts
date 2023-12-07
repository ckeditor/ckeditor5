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

			imageInsertUI.registerIntegration( {
				name: 'assetManager',
				observable: command,

				buttonViewCreator: () => {
					const button = this.editor.ui.componentFactory.create( 'ckfinder' ) as ButtonView;

					button.icon = icons.imageAssetManager;
					button.bind( 'label' ).to( imageInsertUI, 'isImageSelected', isImageSelected => isImageSelected ?
						t( 'Replace image with file manager' ) :
						t( 'Insert image with file manager' )
					);

					return button;
				},

				formViewCreator: () => {
					const button = this.editor.ui.componentFactory.create( 'ckfinder' ) as ButtonView;

					button.icon = icons.imageAssetManager;
					button.withText = true;
					button.bind( 'label' ).to( imageInsertUI, 'isImageSelected', isImageSelected => isImageSelected ?
						t( 'Replace with file manager' ) :
						t( 'Insert with file manager' )
					);

					button.on( 'execute', () => {
						imageInsertUI.dropdownView!.isOpen = false;
					} );

					return button;
				}
			} );
		}
	}
}
