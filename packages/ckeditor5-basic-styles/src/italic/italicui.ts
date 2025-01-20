/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module basic-styles/italic/italicui
 */

import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import { IconItalic } from 'ckeditor5/src/icons.js';
import { MenuBarMenuListItemButtonView, ButtonView } from 'ckeditor5/src/ui.js';
import { getButtonCreator } from '../utils.js';

/**
 * The italic UI feature. It introduces the Italic button.
 */
export default class ItalicUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ItalicUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	public constructor( editor: Editor ) {
		super( editor );

		editor.locale.addIcon( 'italic', IconItalic );
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const ITALIC = 'italic';
		const editor = this.editor;
		const t = editor.locale.t;
		const createButton = getButtonCreator( {
			editor,
			commandName: ITALIC,
			plugin: this,
			icon: editor.locale.getIcon( 'italic' )!,
			keystroke: 'CTRL+I',
			label: t( 'Italic' )
		} );

		// Add bold button to feature components.
		editor.ui.componentFactory.add( ITALIC, () => createButton( ButtonView ) );
		editor.ui.componentFactory.add( 'menuBar:' + ITALIC, () => createButton( MenuBarMenuListItemButtonView ) );
	}
}
