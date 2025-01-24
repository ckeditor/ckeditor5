/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
* @module table/tablecaption/tablecaptionui
*/
import { Plugin } from 'ckeditor5/src/core.js';
import { ButtonView } from 'ckeditor5/src/ui.js';
import { IconCaption } from 'ckeditor5/src/icons.js';
import type ToggleTableCaptionCommand from './toggletablecaptioncommand.js';

import { getCaptionFromModelSelection } from './utils.js';

/**
  * The table caption UI plugin. It introduces the `'toggleTableCaption'` UI button.
  */
export default class TableCaptionUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TableCaptionUI' as const;
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
		const editingView = editor.editing.view;
		const t = editor.t;

		editor.ui.componentFactory.add( 'toggleTableCaption', locale => {
			const command: ToggleTableCaptionCommand = editor.commands.get( 'toggleTableCaption' )!;
			const view = new ButtonView( locale );

			view.set( {
				icon: IconCaption,
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
