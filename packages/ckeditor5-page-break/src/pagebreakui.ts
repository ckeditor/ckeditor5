/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module page-break/pagebreakui
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { IconPageBreak } from 'ckeditor5/src/icons.js';
import { ButtonView, MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';

/**
 * The page break UI plugin.
 */
export default class PageBreakUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'PageBreakUI' as const;
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

		// Add pageBreak button to feature components.
		editor.ui.componentFactory.add( 'pageBreak', () => {
			const view = this._createButton( ButtonView );

			view.set( {
				tooltip: true
			} );

			return view;
		} );

		editor.ui.componentFactory.add( 'menuBar:pageBreak', () => this._createButton( MenuBarMenuListItemButtonView ) );
	}

	/**
	 * Creates a button for page break command to use either in toolbar or in menu bar.
	 */
	private _createButton<T extends typeof ButtonView | typeof MenuBarMenuListItemButtonView>( ButtonClass: T ): InstanceType<T> {
		const editor = this.editor;
		const locale = editor.locale;
		const command = editor.commands.get( 'pageBreak' )!;
		const view = new ButtonClass( editor.locale ) as InstanceType<T>;
		const t = locale.t;

		view.set( {
			label: t( 'Page break' ),
			icon: IconPageBreak
		} );

		view.bind( 'isEnabled' ).to( command, 'isEnabled' );

		// Execute the command.
		this.listenTo( view, 'execute', () => {
			editor.execute( 'pageBreak' );
			editor.editing.view.focus();
		} );

		return view;
	}
}
