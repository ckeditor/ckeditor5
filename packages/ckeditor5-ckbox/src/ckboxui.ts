/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ckbox/ckboxui
 */

import { icons, Plugin } from 'ckeditor5/src/core.js';
import { ButtonView, MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';

import type { ImageInsertUI } from '@ckeditor/ckeditor5-image';

/**
 * The CKBoxUI plugin. It introduces the `'ckbox'` toolbar button.
 */
export default class CKBoxUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'CKBoxUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
		const editor = this.editor;

		// Do not register the `ckbox` button if the command does not exist.
		// This might happen when CKBox library is not loaded on the page.
		if ( !editor.commands.get( 'ckbox' ) ) {
			return;
		}

		const t = editor.t;
		const componentFactory = editor.ui.componentFactory;

		componentFactory.add( 'ckbox', () => {
			const button = this._createButton( ButtonView );

			button.tooltip = true;

			return button;
		} );

		componentFactory.add( 'menuBar:ckbox', () => this._createButton( MenuBarMenuListItemButtonView ) );

		if ( editor.plugins.has( 'ImageInsertUI' ) ) {
			const imageInsertUI: ImageInsertUI = editor.plugins.get( 'ImageInsertUI' );

			imageInsertUI.registerIntegration( {
				name: 'assetManager',
				observable: () => editor.commands.get( 'ckbox' )!,

				buttonViewCreator: () => {
					const button = this.editor.ui.componentFactory.create( 'ckbox' ) as ButtonView;

					button.icon = icons.imageAssetManager;
					button.bind( 'label' ).to( imageInsertUI, 'isImageSelected', isImageSelected => isImageSelected ?
						t( 'Replace image with file manager' ) :
						t( 'Insert image with file manager' )
					);

					return button;
				},

				formViewCreator: () => {
					const button = this.editor.ui.componentFactory.create( 'ckbox' ) as ButtonView;

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

	/**
	 * Creates a button for CKBox command to use either in toolbar or in menu bar.
	 */
	private _createButton<T extends typeof ButtonView | typeof MenuBarMenuListItemButtonView>( ButtonClass: T ): InstanceType<T> {
		const editor = this.editor;
		const locale = editor.locale;
		const view = new ButtonClass( locale ) as InstanceType<T>;
		const command = editor.commands.get( 'ckbox' )!;
		const t = locale.t;

		view.set( {
			label: t( 'Open file manager' ),
			icon: icons.browseFiles
		} );

		view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

		view.on( 'execute', () => {
			editor.execute( 'ckbox' );
		} );

		return view;
	}
}
