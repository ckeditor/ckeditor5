/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui-components/core/ckcomponent
 */

import { LitElement } from 'lit';
import { createContext, ContextConsumer, ContextProvider } from '@lit/context';
import getRegistry from './registry.js';

export { ContextConsumer, ContextProvider };

export const context = createContext( Symbol( 'editorContext' ) );

export default abstract class CKComponent extends LitElement {
	protected _consumer = new ContextConsumer( this, { context, subscribe: true } );

	public static componentName = 'default';

	public static override properties = {
		namespace: { type: String },
		name: { type: String }
	};

	public namespace: string = 'default';
	public name: string = 'default';

	// public override connectedCallback(): void {
	// 	super.connectedCallback();
	// }

	public override render(): ReturnType<LitElement['render']> {
		return this.updateTemplate( this.template() );
	}

	protected template(): ReturnType<LitElement['render']> {
		throw new Error( 'Method not implemented.' );
	}

	private updateTemplate( template: ReturnType<LitElement['render']> ) {
		console.log( 'UPDATE TEMPLATE', template, this._consumer.value, this.namespace, this.name );

		if ( !this._consumer.value ) {
			return template;
		}

		const registry = getRegistry( ( this._consumer.value as any ).editor );
		const newTemplate: any = {};
		newTemplate.strings = [ ...template.strings ];
		newTemplate.strings.raw = [ ...template.strings.raw ];
		newTemplate.values = template.values;
		newTemplate._$litType$ = template._$litType$;

		console.log( 'NEW TEMPLATE:', newTemplate );

		const templateStrings = newTemplate.strings;
		for ( let i = 0; i < templateStrings.length; i++ ) {
			const part = templateStrings[ i ];
			const values: Array<string> = ( template as any ).values;
			console.log( 'PART:', part );

			const components = part.match( /<ck-[a-zA-Z]*/g );
			console.log( 'COMPONENTS:', components );

			if ( components?.length ) {
				for ( const component of components ) {
					const customComponent = registry.getComponentOverride(
						( component as string ).substring( 1 ), values[ 3 ], values[ 4 ]
					);
					console.log( 'CUSTOM COMPONENT:', customComponent );

					if ( customComponent !== component ) {
						templateStrings[ i ] = part.replace( component, `<${ customComponent }` );
					}
				}
			}

			console.log( 'PART2:', part );
		}

		return newTemplate;
	}

	// public override updated(): void {
	// 	console.log( 'UPDATED:', this.constructor.name );
	// }

	// public override createRenderRoot(): CKComponent {
	// 	return this;
	// }
}
