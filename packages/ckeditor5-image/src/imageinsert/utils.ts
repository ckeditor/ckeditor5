/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageinsert/utils
 */

import type { Locale } from 'ckeditor5/src/utils';
import type { Editor } from 'ckeditor5/src/core';
import { LabeledFieldView, createLabeledInputText, type View } from 'ckeditor5/src/ui';

/**
 * Creates integrations object that will be passed to the
 * {@link module:image/imageinsert/ui/imageinsertpanelview~ImageInsertPanelView}.
 *
 * @param {module:core/editor/editor~Editor} editor Editor instance.
 *
 * @returns {Object.<String, module:ui/view~View>} Integrations object.
 */
export function prepareIntegrations( editor: Editor ): Record<string, View> {
	const panelItems = editor.config.get( 'image.insert.integrations' );
	const imageInsertUIPlugin = editor.plugins.get( 'ImageInsertUI' );

	const PREDEFINED_INTEGRATIONS: Record<string, any> = {
		'insertImageViaUrl': createLabeledInputView( editor.locale )
	};

	if ( !panelItems ) {
		return PREDEFINED_INTEGRATIONS;
	}

	// Prepares ckfinder component for the `openCKFinder` integration token.
	if ( panelItems.find( item => item === 'openCKFinder' ) && editor.ui.componentFactory.has( 'ckfinder' ) ) {
		const ckFinderButton = editor.ui.componentFactory.create( 'ckfinder' );
		( ckFinderButton as any ).set( {
			withText: true,
			class: 'ck-image-insert__ck-finder-button'
		} );

		// We want to close the dropdown panel view when user clicks the ckFinderButton.
		ckFinderButton.delegate( 'execute' ).to( imageInsertUIPlugin, 'cancel' );

		PREDEFINED_INTEGRATIONS.openCKFinder = ckFinderButton;
	}

	// Creates integrations object of valid views to pass it to the ImageInsertPanelView.
	return panelItems.reduce( ( object: any, key ) => {
		if ( PREDEFINED_INTEGRATIONS[ key ] ) {
			object[ key ] = PREDEFINED_INTEGRATIONS[ key ];
		} else if ( editor.ui.componentFactory.has( key ) ) {
			object[ key ] = editor.ui.componentFactory.create( key );
		}

		return object;
	}, {} );
}

/**
 * Creates labeled field view.
 *
 * @param {module:utils/locale~Locale} locale The localization services instance.
 *
 * @returns {module:ui/labeledfield/labeledfieldview~LabeledFieldView}
 */
export function createLabeledInputView( locale: Locale ): LabeledFieldView {
	const t = locale.t;
	const labeledInputView = new LabeledFieldView( locale, createLabeledInputText );

	labeledInputView.set( {
		label: t( 'Insert image via URL' )
	} );
	labeledInputView.fieldView.placeholder = 'https://example.com/image.png';

	return labeledInputView;
}
