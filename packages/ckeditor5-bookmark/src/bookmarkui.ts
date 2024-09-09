/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module bookmark/bookmarkui
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { ButtonView, MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';

import bookmarkIcon from '../theme/icons/bookmark.svg';
import '../theme/bookmark.css';

/**
 * The UI plugin of the bookmark feature.
 *
 * It registers the `'bookmark'` UI button in the editor's {@link module:ui/componentfactory~ComponentFactory component factory}
 * which inserts the `bookmark` element upon selection.
 */
export default class BookmarkUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'BookmarkUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'bookmark', () => {
			const buttonView = this._createButton( ButtonView );

			buttonView.set( {
				tooltip: true
			} );

			return buttonView;
		} );

		editor.ui.componentFactory.add( 'menuBar:bookmark', () => {
			return this._createButton( MenuBarMenuListItemButtonView );
		} );
	}

	/**
	 * Creates a button for `bookmark` command to use either in toolbar or in menu bar.
	 */
	private _createButton<T extends typeof ButtonView>( ButtonClass: T ): InstanceType<T> {
		const editor = this.editor;
		const locale = editor.locale;
		const view = new ButtonClass( locale ) as InstanceType<T>;
		const t = locale.t;

		view.set( {
			label: t( 'Bookmark' ),
			icon: bookmarkIcon
		} );

		// Execute the command.
		this.listenTo( view, 'execute', () => {
			editor.editing.view.focus();
		} );

		return view;
	}
}
