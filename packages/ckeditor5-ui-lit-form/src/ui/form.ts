/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui-components/components/form
 */

import { CKComponent } from '@ckeditor/ckeditor5-ui-components';
import { css, html } from 'lit';

export default class Form extends CKComponent {
	public static componentName = 'my-form';

	public static override properties = {
		isValid: { type: Boolean },
		saveBtn: { type: Boolean },
		cancelBtn: { type: Boolean }
	};

	public isValid: boolean = false;
	public saveBtn: boolean = false;
	public cancelBtn: boolean = false;

	public static override styles = css`
		span.info { 
			color: red;
			display: none;
		}
		span.error {
			display: block;
		}
	`;

	public onSave = ( e: CustomEvent<any> ): void => {
		console.log( 'save', e );

		// Cancel save event if the form is invalid.
		if ( !this.isValid ) {
			e.stopPropagation();
		}
	};
	public onCancel = ( e: CustomEvent<any> ): void => { console.log( 'cancel', e ); };
	public onInput = ( e: CustomEvent<any> ): void => {
		this.isValid = ( e.detail.value || '' ).length > 6; // Dumb check for testing purposes.
	};

	public override render(): ReturnType<CKComponent['render']> {
		return html`
			<ck-form ?saveBtn=${ this.saveBtn } ?cancelBtn=${ this.cancelBtn } @save=${ this.onSave } @input=${ this.onInput }>
				<ck-labeledinput label="Link" for="url"></ck-labeledinput>
				<span class="info ${ this.isValid ? '' : 'error' }">The link is invalid</span>
			</ck-form>
		`;
	}
}
