/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui-lit-form/ui/wrapperview
 */

import { View } from 'ckeditor5/src/ui.js';
import { type Locale } from 'ckeditor5/src/utils.js';

type ListenersMap = Map<string, ( evt: Event ) => void>;

export default class WrapperView extends View {
	private listeners: ListenersMap = new Map();

	constructor( locale: Locale ) {
		super( locale );

		this.on( 'render', () => {
			this.listeners.forEach( ( callback, eventName ) => {
				this.element?.addEventListener( eventName, callback );
			} );
		}, { priority: 'lowest' } );
	}

	public listen( eventName: string, callback: ( evt: Event ) => void ): void {
		if ( this.isRendered ) {
			this.element?.addEventListener( eventName, callback );
		} else {
			this.listeners.set( eventName, callback );
		}
	}
}
