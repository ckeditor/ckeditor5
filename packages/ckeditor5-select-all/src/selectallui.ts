/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module select-all/selectallui
 */

import { Plugin } from '@ckeditor/ckeditor5-core';
import { IconSelectAll } from '@ckeditor/ckeditor5-icons';
import { ButtonView, MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui';

/**
 * The select all UI feature.
 *
 * It registers the `'selectAll'` UI button in the editor's
 * {@link module:ui/componentfactory~ComponentFactory component factory}. When clicked, the button
 * executes the {@link module:select-all/selectallcommand~SelectAllCommand select all command}.
 */
export default class SelectAllUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'SelectAllUI' as const;
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

		editor.ui.componentFactory.add( 'selectAll', () => {
			const buttonView = this._createButton( ButtonView );

			buttonView.set( {
				tooltip: true
			} );

			return buttonView;
		} );

		editor.ui.componentFactory.add( 'menuBar:selectAll', () => {
			return this._createButton( MenuBarMenuListItemButtonView );
		} );
	}

	/**
	 * Creates a button for select all command to use either in toolbar or in menu bar.
	 */
	private _createButton<T extends typeof ButtonView | typeof MenuBarMenuListItemButtonView>( ButtonClass: T ): InstanceType<T> {
		const editor = this.editor;
		const locale = editor.locale;
		const command = editor.commands.get( 'selectAll' )!;
		const view = new ButtonClass( editor.locale ) as InstanceType<T>;
		const t = locale.t;

		view.set( {
			label: t( 'Select all' ),
			icon: IconSelectAll,
			keystroke: 'Ctrl+A'
		} );

		view.bind( 'isEnabled' ).to( command, 'isEnabled' );

		// Execute the command.
		this.listenTo( view, 'execute', () => {
			editor.execute( 'selectAll' );
			editor.editing.view.focus();
		} );

		return view;
	}
}
