/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ckbox/ckboxui
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { ButtonView, MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';
import { IconBrowseFiles, IconImageAssetManager } from 'ckeditor5/src/icons.js';

import type { ImageInsertUI } from '@ckeditor/ckeditor5-image';

/**
 * Introduces UI components for the `CKBox` plugin.
 *
 * The plugin introduces two UI components to the {@link module:ui/componentfactory~ComponentFactory UI component factory}:
 *
 * * the `'ckbox'` toolbar button,
 * * the `'menuBar:ckbox'` menu bar component, which is by default added to the `'Insert'` menu.
 *
 * It also integrates with the `insertImage` toolbar component and `menuBar:insertImage` menu component.
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
	public static override get isOfficialPlugin(): true {
		return true;
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

		editor.ui.componentFactory.add( 'ckbox', () => this._createFileToolbarButton() );
		editor.ui.componentFactory.add( 'menuBar:ckbox', () => this._createFileMenuBarButton() );

		if ( editor.plugins.has( 'ImageInsertUI' ) ) {
			editor.plugins.get( 'ImageInsertUI' ).registerIntegration( {
				name: 'assetManager',
				observable: () => editor.commands.get( 'ckbox' )!,
				buttonViewCreator: () => this._createImageToolbarButton(),
				formViewCreator: () => this._createImageDropdownButton(),
				menuBarButtonViewCreator: isOnly => this._createImageMenuBarButton( isOnly ? 'insertOnly' : 'insertNested' )
			} );
		}
	}

	/**
	 * Creates the base for various kinds of the button component provided by this feature.
	 */
	private _createButton<T extends typeof ButtonView | typeof MenuBarMenuListItemButtonView>( ButtonClass: T ): InstanceType<T> {
		const editor = this.editor;
		const locale = editor.locale;
		const view = new ButtonClass( locale ) as InstanceType<T>;
		const command = editor.commands.get( 'ckbox' )!;

		view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

		view.on( 'execute', () => {
			editor.execute( 'ckbox' );
		} );

		return view;
	}

	/**
	 * Creates a simple toolbar button for files management, with an icon and a tooltip.
	 */
	private _createFileToolbarButton(): ButtonView {
		const t = this.editor.locale.t;
		const button = this._createButton( ButtonView );

		button.icon = IconBrowseFiles;
		button.label = t( 'Open file manager' );
		button.tooltip = true;

		return button;
	}

	/**
	 * Creates a simple toolbar button for images management, with an icon and a tooltip.
	 */
	private _createImageToolbarButton(): ButtonView {
		const t = this.editor.locale.t;
		const imageInsertUI: ImageInsertUI = this.editor.plugins.get( 'ImageInsertUI' );

		const button = this._createButton( ButtonView );

		button.icon = IconImageAssetManager;
		button.bind( 'label' ).to(
			imageInsertUI,
			'isImageSelected',
			isImageSelected => isImageSelected ? t( 'Replace image with file manager' ) : t( 'Insert image with file manager' )
		);
		button.tooltip = true;

		return button;
	}

	/**
	 * Creates a button for images management for the dropdown view, with an icon, text and no tooltip.
	 */
	private _createImageDropdownButton(): ButtonView {
		const t = this.editor.locale.t;
		const imageInsertUI: ImageInsertUI = this.editor.plugins.get( 'ImageInsertUI' );

		const button = this._createButton( ButtonView );

		button.icon = IconImageAssetManager;
		button.withText = true;
		button.bind( 'label' ).to(
			imageInsertUI,
			'isImageSelected',
			isImageSelected => isImageSelected ? t( 'Replace with file manager' ) : t( 'Insert with file manager' )
		);

		button.on( 'execute', () => {
			imageInsertUI.dropdownView!.isOpen = false;
		} );

		return button;
	}

	/**
	 * Creates a button for files management for the menu bar.
	 */
	private _createFileMenuBarButton(): MenuBarMenuListItemButtonView {
		const t = this.editor.locale.t;
		const button = this._createButton( MenuBarMenuListItemButtonView );

		button.icon = IconBrowseFiles;
		button.withText = true;
		button.label = t( 'File' );

		return button;
	}

	/**
	 * Creates a button for images management for the menu bar.
	 */
	private _createImageMenuBarButton( type: 'insertOnly' | 'insertNested' ): MenuBarMenuListItemButtonView {
		// Use t() stored in a variable with a different name to reuse existing translations from another package.
		const translateVariableKey = this.editor.locale.t;
		const t = this.editor.locale.t;
		const button = this._createButton( MenuBarMenuListItemButtonView );

		button.icon = IconImageAssetManager;
		button.withText = true;

		switch ( type ) {
			case 'insertOnly':
				button.label = translateVariableKey( 'Image' );
				break;
			case 'insertNested':
				button.label = t( 'With file manager' );
				break;
		}

		return button;
	}
}
