/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module basic-styles/strikethrough/strikethroughui
 */

import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import { IconStrikethrough } from 'ckeditor5/src/icons.js';
import { ButtonView, MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';
import { getButtonCreator } from '../utils.js';

/**
 * The strikethrough UI feature. It introduces the Strikethrough button.
 */
export default class StrikethroughUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'StrikethroughUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	public constructor( editor: Editor ) {
		super( editor );

		editor.locale.addIcon( 'strikethrough', IconStrikethrough );
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const STRIKETHROUGH = 'strikethrough';
		const editor = this.editor;
		const t = editor.locale.t;
		const createButton = getButtonCreator( {
			editor,
			commandName: STRIKETHROUGH,
			plugin: this,
			icon: editor.locale.getIcon( 'strikethrough' )!,
			keystroke: 'CTRL+SHIFT+X',
			label: t( 'Strikethrough' )
		} );

		// Add strikethrough button to feature components.
		editor.ui.componentFactory.add( STRIKETHROUGH, () => createButton( ButtonView ) );
		editor.ui.componentFactory.add( 'menuBar:' + STRIKETHROUGH, () => createButton( MenuBarMenuListItemButtonView ) );
	}
}
