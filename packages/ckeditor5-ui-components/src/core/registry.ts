/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui-components/core/registry
 */

import { type Editor } from 'ckeditor5/src/core.js';
import { type CKComponentConstructor } from './events.js';

type ComponentDefinitionExtension = {
	component: CKComponentConstructor;
	override?: boolean;
	global?: boolean;
};

const registryMap = new WeakMap<Editor, Registry>();

export class Registry {
	private readonly _definitions: Map<string, ComponentDefinitionExtension> = new Map();
	private readonly _instances: Map<string, CKComponentConstructor> = new Map();
	private readonly _scopedDefinitions: Set<string> = new Set();
	private readonly _editor: Editor;

	constructor( editor: Editor ) {
		this._editor = editor;
	}

	public register( name: string, component: CKComponentConstructor ): void {
		this._definitions.set( name, { component } );
	}

	public confirm(): void {
		for ( const [ name, componentExtension ] of this._definitions.entries() ) {
			// Update or define once (what happens with multiple editor instances on the same page?)
			if ( customElements.get( name ) ) {
				console.warn( `Component "${ name }" is already defined.` );
				continue;
			}

			// Register regular component.
			if ( !componentExtension.override || componentExtension.global ) {
				customElements.define( name, componentExtension.component );
				console.log( `Component "${ name }" registered.` );
			}

			// Register component extension for specific editor instance.
			if ( componentExtension.override && !componentExtension.global ) {
				const suffixedName = `${ name }-${ this._editor.id }`;
				customElements.define( suffixedName, componentExtension.component );
				this._scopedDefinitions.add( suffixedName );
				console.log( `Component "${ suffixedName }" registered.` );
			}
		}
	}

	public extendComponent( name: string, component: CKComponentConstructor, global = false ): void {
		if ( !this._definitions.has( name ) ) {
			throw new Error( `Component "${ name }" is not registered.` );
		}

		this._definitions.set( name, { component, override: true, global } );
	}

	public extendInstance( id: string, component: CKComponentConstructor ): void {
		if ( !this._instances.has( id ) ) {
			throw new Error( `Instance "${ id }" is not registered.` );
		}

		// component.componentName
		this._instances.set( id, component );
	}

	public getComponentTagName( name: string ): string {
		const suffixedName = `${ name }-${ this._editor.id }`;

		console.log( 'getComponentTagName', name, suffixedName );
		console.log( this._scopedDefinitions );

		return this._scopedDefinitions.has( suffixedName ) ? suffixedName : name;
	}
}

export default function getRegistry( editor: Editor ): Registry {
	if ( !registryMap.has( editor ) ) {
		registryMap.set( editor, new Registry( editor ) );
	}

	return registryMap.get( editor )!;
}
