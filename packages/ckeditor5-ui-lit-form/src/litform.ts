/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui-lit-form/lit-form
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { ButtonView } from 'ckeditor5/src/ui.js';
import Form from './ui/form.js';
import { getRegistry, UIComponents } from '@ckeditor/ckeditor5-ui-components';
import FormView from './ui/formview.js';

export default class LitForm extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'LitForm' as const;
	}

	public static get requires() {
		return [ UIComponents ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	public init(): void {
		const editor = this.editor;

		getRegistry( editor ).register( Form.componentName, Form );

		editor.ui.componentFactory.add( 'litform', () => {
			const t = this.editor.locale.t;
			const button = this._createDialogButton( ButtonView );

			button.tooltip = true;
			button.label = t( 'Lit Form' );

			return button;
		} );
	}

	private _createDialogButton<T extends typeof ButtonView >( ButtonClass: T ): InstanceType<T> {
		const editor = this.editor;
		const buttonView = new ButtonClass( editor.locale ) as InstanceType<T>;

		buttonView.on( 'execute', () => {
			this._showDialog();
		} );

		return buttonView;
	}

	private _showDialog() {
		const editor = this.editor;
		const dialog = editor.plugins.get( 'Dialog' );
		const t = editor.locale.t;

		dialog.show( {
			id: 'litform-dialog',
			title: t( 'Lit Form' ),
			content: new FormView( editor.locale, dialog ),
			isModal: true,
			onShow: () => {},
			actionButtons: []
		} );
	}
}
