/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module basic-styles/subscript/subscriptui
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { IconSubscript } from 'ckeditor5/src/icons.js';
import { ButtonView, MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';
import { getButtonCreator } from '../utils.js';

const SUBSCRIPT = 'subscript';

/**
 * The subscript UI feature. It introduces the Subscript button.
 */
export default class SubscriptUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'SubscriptUI' as const;
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
		const t = editor.locale.t;

		const createButton = getButtonCreator( {
			editor,
			commandName: SUBSCRIPT,
			plugin: this,
			icon: IconSubscript,
			label: t( 'Subscript' )
		} );

		// Add subscript button to feature components.
		editor.ui.componentFactory.add( SUBSCRIPT, () => createButton( ButtonView ) );
		editor.ui.componentFactory.add( 'menuBar:' + SUBSCRIPT, () => createButton( MenuBarMenuListItemButtonView ) );
	}
}
