/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
* @module table/tablecaption/tablecaptionui
*/

import { Plugin, icons } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';
import type ToggleTableCaptionCommand from './toggletablecaptioncommand';

import { getCaptionFromModelSelection } from './utils';

/**
  * The table caption UI plugin. It introduces the `'toggleTableCaption'` UI button.
  */
export default class TableCaptionUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'TableCaptionUI' {
		return 'TableCaptionUI';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const editingView = editor.editing.view;
		const t = editor.t;

		editor.ui.componentFactory.add( 'toggleTableCaption', locale => {
			const command: ToggleTableCaptionCommand = editor.commands.get( 'toggleTableCaption' )!;
			const view = new ButtonView( locale );

			view.set( {
				icon: icons.caption,
				tooltip: true,
				isToggleable: true
			} );

			view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );
			view.bind( 'label' ).to( command, 'value', value => value ? t( 'Toggle caption off' ) : t( 'Toggle caption on' ) );

			this.listenTo( view, 'execute', () => {
				editor.execute( 'toggleTableCaption', { focusCaptionOnShow: true } );

				// Scroll to the selection and highlight the caption if the caption showed up.
				if ( command.value ) {
					const modelCaptionElement = getCaptionFromModelSelection( editor.model.document.selection )!;
					const figcaptionElement = editor.editing.mapper.toViewElement( modelCaptionElement );

					if ( !figcaptionElement ) {
						return;
					}

					editingView.scrollToTheSelection();
					editingView.change( writer => {
						writer.addClass( 'table__caption_highlighted', figcaptionElement );
					} );
				}

				editor.editing.view.focus();
			} );

			return view;
		} );
	}
}
