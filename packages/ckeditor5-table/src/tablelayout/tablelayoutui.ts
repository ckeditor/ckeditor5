/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablelayout/tablelayoutui
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { IconTableLayout } from 'ckeditor5/src/icons.js';
import { createDropdown, MenuBarMenuView } from 'ckeditor5/src/ui.js';
import type { ObservableChangeEvent } from 'ckeditor5/src/utils.js';

import InsertTableView from '../ui/inserttableview.js';
import InsertTableLayoutCommand from '../commands/inserttablelayoutcommand.js';

/**
 * The table layout UI plugin. It introduces:
 *
 * * The `'insertTableLayout'` dropdown,
 * * The `'menuBar:insertTableLayout'` menu bar menu.
 */
export default class TableLayoutUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TableLayoutUI' as const;
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
		const t = this.editor.t;

		// TODO: Remove after merging with the editing part.
		editor.commands.add( 'insertTableLayout', new InsertTableLayoutCommand( editor ) );

		editor.ui.componentFactory.add( 'insertTableLayout', locale => {
			const command: InsertTableLayoutCommand = editor.commands.get( 'insertTableLayout' )!;
			const dropdownView = createDropdown( locale );

			dropdownView.bind( 'isEnabled' ).to( command );

			// Decorate dropdown's button.
			dropdownView.buttonView.set( {
				icon: IconTableLayout,
				label: t( 'Insert table layout' ),
				tooltip: true
			} );

			let insertTableLayoutView: InsertTableView;

			dropdownView.on( 'change:isOpen', () => {
				if ( insertTableLayoutView ) {
					return;
				}

				// Prepare custom view for dropdown's panel.
				insertTableLayoutView = new InsertTableView( locale );
				dropdownView.panelView.children.add( insertTableLayoutView );

				insertTableLayoutView.delegate( 'execute' ).to( dropdownView );

				dropdownView.on( 'execute', () => {
					editor.execute( 'insertTableLayout', {
						rows: insertTableLayoutView.rows,
						columns: insertTableLayoutView.columns
					} );
					editor.editing.view.focus();
				} );
			} );

			return dropdownView;
		} );

		editor.ui.componentFactory.add( 'menuBar:insertTableLayout', locale => {
			const command: InsertTableLayoutCommand = editor.commands.get( 'insertTableLayout' )!;
			const menuView = new MenuBarMenuView( locale );
			const insertTableLayoutView = new InsertTableView( locale );

			insertTableLayoutView.delegate( 'execute' ).to( menuView );

			menuView.on<ObservableChangeEvent<boolean>>( 'change:isOpen', ( event, name, isOpen ) => {
				if ( !isOpen ) {
					insertTableLayoutView.reset();
				}
			} );

			insertTableLayoutView.on( 'execute', () => {
				editor.execute( 'insertTableLayout', {
					rows: insertTableLayoutView.rows,
					columns: insertTableLayoutView.columns
				} );
				editor.editing.view.focus();
			} );

			menuView.buttonView.set( {
				label: t( 'Table layout' ),
				icon: IconTableLayout
			} );

			menuView.panelView.children.add( insertTableLayoutView );

			menuView.bind( 'isEnabled' ).to( command );

			return menuView;
		} );
	}
}
