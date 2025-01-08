/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui-components/components/ckinput
 */

import { html } from 'lit';
import CKComponent from '../core/ckcomponent.js';

export default class CKInput extends CKComponent {
	public static override componentName = 'ck-input';

	public static override properties = {
		uid: {},
		value: {},
		namespace: { type: String },
		name: { type: String }
	};

	public value: string = '';
	public uid: string = '';

	constructor() {
		super();

		this.name = 'ck-input';
	}

	public override render(): ReturnType<CKComponent['render']> {
		return html`
			<input
				class="input-component"
				type="input"
				id=${ this.uid }
				@input=${ this.onInput }
			/>
		`;
	}

	public onInput( e: InputEvent ): void {
		this.value = ( e.target as HTMLInputElement ).value;

		e.stopPropagation();

		this.dispatchEvent( new CustomEvent( 'input', {
			bubbles: true,
			composed: true,
			detail: { id: this.uid, value: this.value }
		} ) );
	}
}
