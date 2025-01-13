/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui-lit-form/ui/formview
 */

import { type Editor } from 'ckeditor5/src/core.js';
import { type Locale } from 'ckeditor5/src/utils.js';
import { type Dialog } from 'ckeditor5/src/ui.js';
import { WrapperView } from '@ckeditor/ckeditor5-ui-components';

export default class FormView extends WrapperView {
	constructor( locale: Locale, dialog: Dialog, editor: Editor ) {
		super( locale, editor );

		this.setTemplate( {
			tag: 'my-form',

			attributes: {
				'savebtn': true,
				'cancelbtn': true
			}
		} );

		this.listen( 'save', () => {
			console.log( 'FormView', 'save' );
			dialog.hide();
		} );

		this.listen( 'cancel', () => {
			console.log( 'FormView', 'cancel' );
			dialog.hide();
		} );

		this.listen( 'input', () => {
			console.log( 'FormView', 'input' );
		} );
	}
}
