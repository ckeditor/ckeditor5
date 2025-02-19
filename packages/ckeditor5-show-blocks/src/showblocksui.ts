/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module show-blocks/showblocksui
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { IconShowBlocks } from 'ckeditor5/src/icons.js';
import { ButtonView, MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';

import '../theme/showblocks.css';

/**
 * The UI plugin of the show blocks feature.
 *
 * It registers the `'showBlocks'` UI button in the editor's {@link module:ui/componentfactory~ComponentFactory component factory}
 * that toggles the visibility of the HTML element names of content blocks.
 */
export default class ShowBlocksUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ShowBlocksUI' as const;
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
	public init(): void {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'showBlocks', () => {
			const buttonView = this._createButton( ButtonView );

			buttonView.set( {
				tooltip: true,
				icon: IconShowBlocks
			} );

			return buttonView;
		} );

		editor.ui.componentFactory.add( 'menuBar:showBlocks', () => {
			return this._createButton( MenuBarMenuListItemButtonView );
		} );
	}

	/**
	 * Creates a button for show blocks command to use either in toolbar or in menu bar.
	 */
	private _createButton<T extends typeof ButtonView>( ButtonClass: T ): InstanceType<T> {
		const editor = this.editor;
		const locale = editor.locale;
		const command = editor.commands.get( 'showBlocks' )!;
		const view = new ButtonClass( locale ) as InstanceType<T>;
		const t = locale.t;

		view.set( {
			label: t( 'Show blocks' ),
			isToggleable: true,
			role: 'menuitemcheckbox'
		} );

		view.bind( 'isEnabled' ).to( command );
		view.bind( 'isOn' ).to( command, 'value', command, 'isEnabled', ( value, isEnabled ) => value && isEnabled );

		// Execute the command.
		this.listenTo( view, 'execute', () => {
			editor.execute( 'showBlocks' );
			editor.editing.view.focus();
		} );

		return view;
	}
}
