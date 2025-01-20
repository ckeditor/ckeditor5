/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module basic-styles/code/codeui
 */

import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import { IconCode } from 'ckeditor5/src/icons.js';
import { ButtonView, MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';
import { getButtonCreator } from '../utils.js';

import '../../theme/code.css';

/**
 * The code UI feature. It introduces the Code button.
 */
export default class CodeUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'CodeUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	public constructor( editor: Editor ) {
		super( editor );

		editor.locale.addIcon( 'code', IconCode );
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const CODE = 'code';
		const editor = this.editor;
		const t = editor.locale.t;
		const createButton = getButtonCreator( {
			editor,
			commandName: CODE,
			plugin: this,
			icon: editor.locale.getIcon( 'code' )!,
			label: t( 'Code' )
		} );

		// Add code button to feature components.
		editor.ui.componentFactory.add( CODE, () => createButton( ButtonView ) );
		editor.ui.componentFactory.add( 'menuBar:' + CODE, () => createButton( MenuBarMenuListItemButtonView ) );
	}
}
