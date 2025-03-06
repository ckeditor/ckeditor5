/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module horizontal-line/horizontallineui
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { IconHorizontalLine } from 'ckeditor5/src/icons.js';
import { ButtonView, MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';

import type HorizontalLineCommand from './horizontallinecommand.js';

/**
 * The horizontal line UI plugin.
 */
export default class HorizontalLineUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'HorizontalLineUI' as const;
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

		// Add the `horizontalLine` button to feature components.
		editor.ui.componentFactory.add( 'horizontalLine', () => {
			const buttonView = this._createButton( ButtonView );

			buttonView.set( {
				tooltip: true
			} );

			return buttonView;
		} );

		editor.ui.componentFactory.add( 'menuBar:horizontalLine', () => {
			return this._createButton( MenuBarMenuListItemButtonView );
		} );
	}

	/**
	 * Creates a button for horizontal line command to use either in toolbar or in menu bar.
	 */
	private _createButton<T extends typeof ButtonView | typeof MenuBarMenuListItemButtonView>( ButtonClass: T ): InstanceType<T> {
		const editor = this.editor;
		const locale = editor.locale;
		const command: HorizontalLineCommand = editor.commands.get( 'horizontalLine' )!;
		const view = new ButtonClass( editor.locale ) as InstanceType<T>;
		const t = locale.t;

		view.set( {
			label: t( 'Horizontal line' ),
			icon: IconHorizontalLine
		} );

		view.bind( 'isEnabled' ).to( command, 'isEnabled' );

		// Execute the command.
		this.listenTo( view, 'execute', () => {
			editor.execute( 'horizontalLine' );
			editor.editing.view.focus();
		} );

		return view;
	}
}
