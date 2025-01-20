/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module basic-styles/bold/boldui
 */

import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import { IconBold } from 'ckeditor5/src/icons.js';
import { ButtonView, MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';
import { getButtonCreator } from '../utils.js';

/**
 * The bold UI feature. It introduces the Bold button.
 */
export default class BoldUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'BoldUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	public constructor( editor: Editor ) {
		super( editor );

		editor.locale.addIcon( 'bold', IconBold );
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const BOLD = 'bold';
		const editor = this.editor;
		const t = editor.locale.t;
		const createButton = getButtonCreator( {
			editor,
			commandName: BOLD,
			plugin: this,
			icon: editor.locale.getIcon( 'bold' )!,
			label: t( 'Bold' ),
			keystroke: 'CTRL+B'
		} );

		// Add bold button to feature components.
		editor.ui.componentFactory.add( BOLD, () => createButton( ButtonView ) );
		editor.ui.componentFactory.add( 'menuBar:' + BOLD, () => createButton( MenuBarMenuListItemButtonView ) );
	}
}
