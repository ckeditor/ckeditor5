/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui-components/core/ckcomponent
 */

import { LitElement } from 'lit';

export default class CKComponent extends LitElement {
	public override connectedCallback(): void {
		// On what object should event be fired? How to get the editor object here?
		console.log( 'connected', this );
		super.connectedCallback();
	}

	public override updated(): void {
		console.log( 'UPDATED:', this.constructor.name );
	}

	// public override createRenderRoot(): CKComponent {
	// 	return this;
	// }
}
