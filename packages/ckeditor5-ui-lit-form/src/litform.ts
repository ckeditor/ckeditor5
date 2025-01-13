/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui-lit-form/lit-form
 */

import { type Editor, Plugin } from 'ckeditor5/src/core.js';
import { ButtonView } from 'ckeditor5/src/ui.js';
import {
	CKForm,
	CKInput,
	getRegistry,
	UIComponents,
	html
} from '@ckeditor/ckeditor5-ui-components';
import FormView from './ui/formview.js';
import Form from './ui/form.js';

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

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		//
		// Overriding component class.
		//

		const registry = getRegistry( editor );

		class BetterForm extends CKForm {
			public static override componentName = 'betterform';

			public override template() {
				const template = super.template();

				return html`
					<div>
						<h3>Better Form</h3>
						${ template }
					</div>
				`;
			}
		}

		registry.register( Form.componentName, Form );
		registry.extendComponentDefinition( CKForm.componentName, BetterForm );

		//
		// Overriding component instance.
		//

		class BetterInput extends CKInput {
			public static override componentName = 'betterinput';

			public override template() {
				return html`
					<div>
						<input
							style="border: 1px solid blue;"
							class="input-component"
							type="input"
							id=${ this.uid }
							@input=${ this.onInput }
						/>
					</div>
				`;
			}
		}

		registry.extendComponentInstance( CKInput.componentName, 'link', 'ck-labeledinput_input', BetterInput );
	}

	public init(): void {
		const editor = this.editor;

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
			content: new FormView( editor.locale, dialog, editor ),
			isModal: true,
			onShow: () => {},
			actionButtons: []
		} );
	}
}
