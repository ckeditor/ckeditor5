/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui-components/components/cklabeledinput
 */

import { html } from 'lit';
import CKComponent from '../core/ckcomponent.js';

export default class CKLabeledInput extends CKComponent {
	public static override componentName = 'ck-labeledinput';

	public static override properties = {
		label: {},
		for: {},
		namespace: { type: String },
		name: { type: String }
	};

	public label: string = '';
	public for: string = '';

	constructor() {
		super();

		this.name = 'ck-labeledinput';
	}

	public override template(): ReturnType<CKComponent['template']> {
		return html`
			<div class="labeled-field-component">
				<label class="label-component" for=${ this.for }>${ this.label }</label>
				<ck-input uid=${ this.for } namespace=${ this.namespace } name=${ `${ this.name }_input` } />
			</div>
		`;
	}
}
