/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module page-break/pagebreakui
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { ButtonView, MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';

import pageBreakIcon from '../theme/icons/pagebreak.svg';

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
			icon: pageBreakIcon
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
