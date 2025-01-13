/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui-components/core/wrapperview
 */

import { type Editor } from 'ckeditor5/src/core.js';
import { View } from 'ckeditor5/src/ui.js';
import { type Locale } from 'ckeditor5/src/utils.js';
import { context, ContextProvider } from './ckcomponent.js';

type ListenersMap = Map<string, ( evt: Event ) => void>;

export default class WrapperView extends View {
	protected listeners: ListenersMap = new Map();
	protected _provider: ContextProvider<any, HTMLElement> | null = null;

	constructor( locale: Locale, editor: Editor ) {
		super( locale );

		this.on( 'render', () => {
			this._provider = new ContextProvider( this.element!, {
				context,
				initialValue: {
					id: editor.id,
					editor
				}
			} );

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
