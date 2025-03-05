/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module paragraph/paragraphbuttonui
 */

import { Plugin } from '@ckeditor/ckeditor5-core';
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import { IconParagraph } from '@ckeditor/ckeditor5-icons';

import Paragraph from './paragraph.js';
import type ParagraphCommand from './paragraphcommand.js';

/**
 * This plugin defines the `'paragraph'` button. It can be used together with
 * {@link module:heading/headingbuttonsui~HeadingButtonsUI} to replace the standard heading dropdown.
 *
 * This plugin is not loaded automatically by the {@link module:paragraph/paragraph~Paragraph} plugin. It must
 * be added manually.
 *
 * ```ts
 * ClassicEditor
 *   .create( {
 *     plugins: [ ..., Heading, Paragraph, HeadingButtonsUI, ParagraphButtonUI ]
 *     toolbar: [ 'paragraph', 'heading1', 'heading2', 'heading3' ]
 *   } )
 *   .then( ... )
 *   .catch( ... );
 * ```
 */
export default class ParagraphButtonUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ Paragraph ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( 'paragraph', locale => {
			const view = new ButtonView( locale );
			const command: ParagraphCommand = editor.commands.get( 'paragraph' )!;

			view.label = t( 'Paragraph' );
			view.icon = IconParagraph;
			view.tooltip = true;
			view.isToggleable = true;
			view.bind( 'isEnabled' ).to( command );
			view.bind( 'isOn' ).to( command, 'value' );

			view.on( 'execute', () => {
				editor.execute( 'paragraph' );
			} );

			return view;
		} );
	}
}
