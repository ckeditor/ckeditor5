/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module core/editor/utils/registerandinitializerootconfigattributes
 */

import type { Editor } from '../editor.js';

/**
 * Registers and initializes root attributes from
 * {@link module:core/editor/editorconfig~EditorConfig#roots `config.roots.<rootName>.modelAttributes`}
 *  and {@link module:core/editor/editorconfig~EditorConfig#roots `config.root.modelAttributes`}.
 *
 * @internal
 */
export function registerAndInitializeRootConfigAttributes( editor: Editor ): void {
	const rootsConfig = editor.config.get( 'roots' )!;
	let hasRootAttributes = false;

	for ( const rootConfig of Object.values( rootsConfig ) ) {
		for ( const key of Object.keys( rootConfig.modelAttributes || {} ) ) {
			editor.registerRootAttribute( key );
			hasRootAttributes = true;
		}
	}

	if ( !hasRootAttributes ) {
		return;
	}

	editor.data.once( 'init', () => {
		editor.model.enqueueChange( { isUndoable: false }, writer => {
			for ( const [ rootName, rootConfig ] of Object.entries( rootsConfig ) ) {
				const root = editor.model.document.getRoot( rootName );

				if ( !root ) {
					continue;
				}

				for ( const [ key, value ] of Object.entries( rootConfig.modelAttributes || {} ) ) {
					if ( value !== null ) {
						writer.setAttribute( key, value, root );
					}
				}
			}
		} );
	} );
}
