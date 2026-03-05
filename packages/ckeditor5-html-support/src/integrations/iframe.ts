/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module html-support/integrations/iframe
 */

import type { DowncastDispatcher, DowncastInsertEvent, ModelElement } from 'ckeditor5/src/engine.js';
import { Plugin } from 'ckeditor5/src/core.js';
import { DataFilter, type HtmlSupportDataFilterRegisterEvent } from '../datafilter.js';

/**
 * Provides the General HTML Support integration for `iframe` elements with a mandatory sandbox attribute.
 */
export class IframeElementSupport extends Plugin {
	/**
     * @inheritDoc
     */
	public static get requires() {
		return [ DataFilter ] as const;
	}

	/**
     * @inheritDoc
     */
	public static get pluginName() {
		return 'IframeElementSupport' as const;
	}

	/**
     * @inheritDoc
     */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
     * @inheritDoc
     */
	public init(): void {
		this.editor.config.define( 'htmlSupport.htmlIframeSandbox', true );

		this._setupSandboxConversion();
	}

	/**
	 * Sets up the conversion to enforce the sandbox attribute on `iframe` elements.
	 */
	private _setupSandboxConversion() {
		const { plugins, config, conversion } = this.editor;

		const dataFilter = plugins.get( DataFilter );
		const iframeSandboxConfig = config.get( 'htmlSupport.htmlIframeSandbox' )!;

		if ( iframeSandboxConfig === false ) {
			return;
		}

		const allowedSandboxFlags = Array.isArray( iframeSandboxConfig ) ? Array.from( iframeSandboxConfig ) : [];

		dataFilter.on<HtmlSupportDataFilterRegisterEvent>( 'register:iframe', ( _, definition ) => {
			conversion.for( 'editingDowncast' ).add( ( dispatcher: DowncastDispatcher ) => {
				dispatcher.on<DowncastInsertEvent<ModelElement>>( `insert:${ definition.model }`, ( _, data, conversionApi ) => {
					const { mapper, writer } = conversionApi;
					const viewElement = mapper.toViewElement( data.item )!;

					for ( const { item } of writer.createRangeOn( viewElement ) ) {
						if ( !item.is( 'element', 'iframe' ) ) {
							continue;
						}

						if ( item.hasAttribute( 'sandbox' ) ) {
							// If there is an existing sandbox attribute, read and filter out disallowed values.
							const sandboxValues = new Set<string>();
							const existingSandbox = item.getAttribute( 'sandbox' )!;

							for ( const value of existingSandbox.trim().split( /\s+/ ) ) {
								if ( allowedSandboxFlags.includes( value ) ) {
									sandboxValues.add( value );
								}
							}

							writer.setAttribute( 'sandbox', Array.from( sandboxValues ).join( ' ' ), item );
						} else {
							// If there was no existing sandbox attribute, just use the configured one.
							writer.setAttribute( 'sandbox', allowedSandboxFlags.join( ' ' ), item );
						}
					}
				}, { priority: 'lowest' } );
			} );
		} );
	}
}
