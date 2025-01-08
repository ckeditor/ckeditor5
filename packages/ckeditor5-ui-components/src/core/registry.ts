/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui-components/core/registry
 */

import { type Editor } from 'ckeditor5/src/core.js';
import type CKComponent from './ckcomponent.js';
import { type CKComponentConstructor, type ComponentRegisterEvent } from './events.js';

const registryMap = new WeakMap<Editor, Registry>();

export class Registry {
	private readonly _items: Map<string, CKComponentConstructor> = new Map();
	private readonly _editor: Editor;

	constructor( editor: Editor ) {
		this._editor = editor;
	}

	public register( name: string, component: CKComponentConstructor ): void {
		const eventData = { name, component };
		const result = this._editor.fire<ComponentRegisterEvent<CKComponent>>( 'componentRegister', eventData );

		console.log( 'Registry:componentRegister', eventData, result );

		// Update or define once (what happens with multiple editor instances on the same page?)
		if ( !customElements.get( name ) ) {
			this._items.set( name, eventData.component );
			customElements.define( name, eventData.component );
		}
	}
}

export default function getRegistry( editor: Editor ): Registry {
	if ( !registryMap.has( editor ) ) {
		registryMap.set( editor, new Registry( editor ) );
	}

	return registryMap.get( editor )!;
}
