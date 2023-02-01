/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagecaption/imagecaptionui
 */

import { Plugin, icons } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';
import ImageCaptionUtils from './imagecaptionutils';

/**
 * The image caption UI plugin. It introduces the `'toggleImageCaption'` UI button.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageCaptionUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageCaptionUtils ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageCaptionUI';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const editingView = editor.editing.view;
		const imageCaptionUtils = editor.plugins.get( 'ImageCaptionUtils' );
		const t = editor.t;

		editor.ui.componentFactory.add( 'toggleImageCaption', locale => {
			const command = editor.commands.get( 'toggleImageCaption' );
			const view = new ButtonView( locale );

			view.set( {
				icon: icons.caption,
				tooltip: true,
				isToggleable: true
			} );

			view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );
			view.bind( 'label' ).to( command, 'value', value => value ? t( 'Toggle caption off' ) : t( 'Toggle caption on' ) );

			this.listenTo( view, 'execute', () => {
				editor.execute( 'toggleImageCaption', { focusCaptionOnShow: true } );

				// Scroll to the selection and highlight the caption if the caption showed up.
				const modelCaptionElement = imageCaptionUtils.getCaptionFromModelSelection( editor.model.document.selection );

				if ( modelCaptionElement ) {
					const figcaptionElement = editor.editing.mapper.toViewElement( modelCaptionElement );

					editingView.scrollToTheSelection();

					editingView.change( writer => {
						writer.addClass( 'image__caption_highlighted', figcaptionElement );
					} );
				}

				editor.editing.view.focus();
			} );

			return view;
		} );
	}
}
