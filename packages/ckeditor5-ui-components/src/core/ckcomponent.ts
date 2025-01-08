/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui-components/core/ckcomponent
 */

import { LitElement } from 'lit';
import { ComponentCreateEvent } from './events.js';

export default class CKComponent extends LitElement {
	public static componentName = 'default';

	public static override properties = {
		namespace: { type: String },
		name: { type: String }
	};

	public namespace: string = 'default';
	public name: string = 'default';

	public override connectedCallback(): void {
		console.log(
			'CKComponent:componentInstanceCreated',
			`${ this.namespace }:${ this.name }`,
			( this.constructor as any ).componentName, // Works but it's hacky :/
			this
		);

		// On what object should event be fired? How to get the editor object here?

		const eventDetail = { instance: this, namespace: this.namespace, name: this.name };

		window.dispatchEvent( new ComponentCreateEvent( 'componentInstanceCreated', {
			bubbles: true,
			composed: true,
			detail: eventDetail
		} ) );

		super.connectedCallback();
	}

	// public override updated(): void {
	// 	console.log( 'UPDATED:', this.constructor.name );
	// }

	// public override createRenderRoot(): CKComponent {
	// 	return this;
	// }
}
