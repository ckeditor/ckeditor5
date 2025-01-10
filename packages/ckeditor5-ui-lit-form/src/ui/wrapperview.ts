/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui-lit-form/ui/wrapperview
 */

import { getRegistry } from '@ckeditor/ckeditor5-ui-components';
import { type Editor } from 'ckeditor5/src/core.js';
import { Template, type TemplateDefinition, View, type RenderData } from 'ckeditor5/src/ui.js';
import { type Locale } from 'ckeditor5/src/utils.js';

type ListenersMap = Map<string, ( evt: Event ) => void>;

const xhtmlNs = 'http://www.w3.org/1999/xhtml';
class WrapperTemplate extends Template {
	private editor: Editor;

	constructor( definition: TemplateDefinition, editor: Editor ) {
		super( definition );

		this.editor = editor;
	}

	public setEditor( editor: Editor ): void {
		this.editor = editor;
	}

	protected override _renderElement( data: RenderData ): HTMLElement | Text {
		const registry = getRegistry( this.editor );
		const tag = registry.getComponentTagName( this.tag! );

		if ( tag !== this.tag! ) {
			console.log( 'WrapperTemplate._renderElement', 'tag changed', this.tag, tag );
			this.tag = tag;
		}

		let node = data.node;

		if ( !node ) {
			node = data.node = document.createElementNS( this.ns || xhtmlNs, this.tag! ) as any;
		}

		console.log( 'WrapperTemplate._renderElement', data, registry );

		this._renderAttributes( data );
		this._renderElementChildren( data );
		this._setUpListeners( data );

		return node;
	}
}

export default class WrapperView extends View {
	private listeners: ListenersMap = new Map();
	private editor: Editor;

	constructor( locale: Locale, editor: Editor ) {
		super( locale );

		this.editor = editor;

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

	public override setTemplate( definition: TemplateDefinition ): void {
		this.template = new WrapperTemplate( definition, this.editor );
	}
}
