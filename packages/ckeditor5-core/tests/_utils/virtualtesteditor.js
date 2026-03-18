/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Editor } from '../../src/editor/editor.js';

/**
 * A simple editor implementation useful for testing the engine part of the features.
 * It contains full data pipepilne and the engine pipeline but without rendering to DOM.
 *
 * Should work in Node.js. If not now, then in the future :).
 *
 * @memberOf tests.core._utils
 */
export class VirtualTestEditor extends Editor {
	constructor( config ) {
		super( config );

		// Create the ("main") root element of the model tree.
		this.model.document.createRoot();
	}

	static create( config = {} ) {
		return new Promise( resolve => {
			const editor = new this( config );

			resolve(
				editor.initPlugins()
					.then( () => {
						const initialData = config.initialData ?? config.root?.initialData ?? config.roots?.main?.initialData;

						return editor.data.init( initialData || '' );
					} )
					.then( () => {
						editor.fire( 'ready' );
						return editor;
					} )
			);
		} );
	}
}
