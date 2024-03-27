/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module remove-format/removeformatui
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { ButtonView, MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';

import type RemoveFormatCommand from './removeformatcommand.js';

import removeFormatIcon from '../theme/icons/remove-format.svg';

const REMOVE_FORMAT = 'removeFormat';

/**
 * The remove format UI plugin. It registers the `'removeFormat'` button which can be
 * used in the toolbar.
 */
export default class RemoveFormatUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'RemoveFormatUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		editor.ui.componentFactory.add( REMOVE_FORMAT, () => {
			const view = this._createButton( ButtonView );

			view.set( {
				tooltip: true
			} );

			return view;
		} );

		editor.ui.componentFactory.add( `menuBar:${ REMOVE_FORMAT }`, () => this._createButton( MenuBarMenuListItemButtonView ) );
	}

	/**
	 * Creates a button for remove format command to use either in toolbar or in menu bar.
	 */
	private _createButton<T extends typeof ButtonView | typeof MenuBarMenuListItemButtonView>( ButtonClass: T ): InstanceType<T> {
		const editor = this.editor;
		const locale = editor.locale;
		const command: RemoveFormatCommand = editor.commands.get( REMOVE_FORMAT )!;
		const view = new ButtonClass( editor.locale ) as InstanceType<T>;
		const t = locale.t;

		view.set( {
			label: t( 'Remove Format' ),
			icon: removeFormatIcon
		} );

		view.bind( 'isEnabled' ).to( command, 'isEnabled' );

		// Execute the command.
		this.listenTo( view, 'execute', () => {
			editor.execute( REMOVE_FORMAT );
			editor.editing.view.focus();
		} );

		return view;
	}
}
