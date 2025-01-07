/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui-components/components/ckform
 */

import { html } from 'lit';
import CKComponent from '../core/ckcomponent.js';

export default class CKForm extends CKComponent {
	public static componentName = 'ck-form';

	public static override properties = {
		saveBtn: { type: Boolean },
		cancelBtn: { type: Boolean }
	};

	public saveBtn: boolean = false;
	public cancelBtn: boolean = false;

	public override render(): ReturnType<CKComponent['render']> {
		return html`
			<form class="link-form-component">
				<slot></slot>
				${ this.saveBtn ? html`<button class="button-component" type="button" @click=${ this.onSave } }>Save</button>` : '' }
				${ this.cancelBtn ? html`<button class="button-component" type="button" @click=${ this.onCancel }>Cancel</button>` : '' }
			</form>
		`;
	}

	protected onSave(): void {
		this.dispatchEvent( new CustomEvent( 'save', { bubbles: true, composed: true } ) );
	}

	protected onCancel(): void {
		this.dispatchEvent( new CustomEvent( 'cancel', { bubbles: true, composed: true } ) );
	}
}
