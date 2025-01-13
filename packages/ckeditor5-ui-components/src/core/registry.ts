/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui-components/core/registry
 */

import { type Editor } from 'ckeditor5/src/core.js';
import { type CKComponentConstructor } from './events.js';

const registryMap = new WeakMap<Editor, Registry>();

export class Registry {
	private readonly _definitions: Map<string, CKComponentConstructor> = new Map();
	private readonly _instances: Map<string, CKComponentConstructor> = new Map();
	private readonly _editor: Editor;

	constructor( editor: Editor ) {
		this._editor = editor;
	}

	public register( name: string, component: CKComponentConstructor ): void {
		this._definitions.set( name, component );
	}

	public extendComponentDefinition( name: string, definition: CKComponentConstructor ): void {
		this._definitions.set( name, definition );
	}

	public extendComponentInstance( name: string, namespace: string, id: string, definition: CKComponentConstructor ): void {
		this._instances.set( this.composeInstanceId( name, namespace, id ), definition );
	}

	public commit(): void {
		for ( const [ name, component ] of this._definitions ) {
			// Update or define once (what happens with multiple editor instances on the same page?)
			if ( !customElements.get( name ) ) {
				customElements.define( name, component );
			} else {
				console.warn( `Component "${ name }" is already registered.` );
			}
		}
	}

	public getComponentOverride( name: string, namespace: string, id: string ): string {
		const instanceId = this.composeInstanceId( name, namespace, id );

		// If there is no instance override, return the original component name.
		if ( !this._instances.has( instanceId ) ) {
			return name;
		}

		// Register the instance override if it's not registered yet.
		if ( !customElements.get( instanceId ) ) {
			customElements.define( instanceId, this._instances.get( instanceId )! );
		}

		return instanceId;
	}

	protected composeInstanceId( name: string, namespace: string, id: string ): string {
		return `${ name }-${ namespace }_${ id }`;
	}
}

export default function getRegistry( editor: Editor ): Registry {
	if ( !registryMap.has( editor ) ) {
		registryMap.set( editor, new Registry( editor ) );
	}

	return registryMap.get( editor )!;
}
