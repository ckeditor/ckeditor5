/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ckbox/ckboximageedit/ckboximageeditui
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { ButtonView } from 'ckeditor5/src/ui.js';

import ckboxImageEditIcon from '../../theme/icons/ckbox-image-edit.svg';

/**
 * The UI plugin of the CKBox image edit feature.
 *
 * It registers the `'ckboxImageEdit'` UI button in the editor's {@link module:ui/componentfactory~ComponentFactory component factory}
 * that allows you to open the CKBox dialog and edit the image.
 */
export default class CKBoxImageEditUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'CKBoxImageEditUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'ckboxImageEdit', locale => {
			const command = editor.commands.get( 'ckboxImageEdit' )!;
			const uploadImageCommand = editor.commands.get( 'uploadImage' )!;
			const view = new ButtonView( locale );
			const t = locale.t;

			view.set( {
				icon: ckboxImageEditIcon,
				tooltip: true
			} );

			view.bind( 'label' ).to( uploadImageCommand, 'isAccessAllowed', isAccessAllowed => isAccessAllowed ?
				t( 'Edit image' ) :
				t( 'No permission for image editing. Try using the file manager or contact your administrator.' )
			);
			view.bind( 'isOn' ).to( command, 'value', command, 'isEnabled', ( value, isEnabled ) => value && isEnabled );
			view.bind( 'isEnabled' ).to( command );

			// Execute the command.
			this.listenTo( view, 'execute', () => {
				editor.execute( 'ckboxImageEdit' );
				editor.editing.view.focus();
			} );

			return view;
		} );
	}
}
