/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module image/imagecaption/imagecaptionui
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { ButtonView } from 'ckeditor5/src/ui.js';
import { IconCaption } from 'ckeditor5/src/icons.js';
import ImageCaptionUtils from './imagecaptionutils.js';
import type ToggleImageCaptionCommand from './toggleimagecaptioncommand.js';

/**
 * The image caption UI plugin. It introduces the `'toggleImageCaption'` UI button.
 */
export default class ImageCaptionUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ImageCaptionUtils ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ImageCaptionUI' as const;
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
		const imageCaptionUtils: ImageCaptionUtils = editor.plugins.get( 'ImageCaptionUtils' );
		const t = editor.t;

		editor.ui.componentFactory.add( 'toggleImageCaption', locale => {
			const command: ToggleImageCaptionCommand = editor.commands.get( 'toggleImageCaption' )!;
			const view = new ButtonView( locale );

			view.set( {
				icon: IconCaption,
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
						writer.addClass( 'image__caption_highlighted', figcaptionElement! );
					} );
				}

				editor.editing.view.focus();
			} );

			return view;
		} );
	}
}
