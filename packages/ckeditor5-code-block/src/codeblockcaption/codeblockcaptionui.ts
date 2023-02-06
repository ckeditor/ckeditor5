/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module code-block/codeblockcaption/codeblockcaptionui
 */

import { Plugin, icons, Command, type PluginDependencies } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';
import { getCodeblockCaptionFromModelSelection } from './utils';
import type ToggleCodeblockCaptionCommand from './togglecodeblockcaptioncommand';

const TOGGLECODEBLOCKCAPTION = 'toggleCodeblockCaption';

/**
 * The codeblock caption UI plugin. It introduces the `'toggleCodeblockCaption'` UI button.
 *
 * @extends module:core/plugin~Plugin
 */
export default class CodeblockCaptionUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependencies {
		return [];
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'CodeblockCaptionUI' {
		return 'CodeblockCaptionUI';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const editingView = editor.editing.view;
		const t = editor.t;

		editor.ui.componentFactory.add( TOGGLECODEBLOCKCAPTION, locale => {
			const command = editor.commands.get( TOGGLECODEBLOCKCAPTION ) as ToggleCodeblockCaptionCommand;
			const view = new ButtonView( locale );

			view.set( {
				icon: icons.caption,
				tooltip: true,
				isToggleable: true
			} );

			view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );
			view.bind( 'label' ).to( command, 'value', value => value ? t( 'Toggle caption off' ) : t( 'Toggle caption on' ) );

			this.listenTo( view, 'execute', () => {
				editor.execute( TOGGLECODEBLOCKCAPTION, { focusCaptionOnShow: true } );

				// Scroll to the selection and highlight the caption if the caption showed up.
				const modelCaptionElement = getCodeblockCaptionFromModelSelection( editor.model.document.selection );

				if ( modelCaptionElement ) {
					const figcaptionElement = editor.editing.mapper.toViewElement( modelCaptionElement )!;

					editingView.scrollToTheSelection();

					editingView.change( writer => {
						writer.addClass( 'codeblock__caption_highlighted', figcaptionElement );
					} );
				}

				editor.editing.view.focus();
			} );

			return view;
		} );
	}
}

