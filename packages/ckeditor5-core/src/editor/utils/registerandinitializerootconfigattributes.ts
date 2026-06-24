/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module core/editor/utils/registerandinitializerootconfigattributes
 */

import type { Editor, EditorRootAttributes } from '../editor.js';

// Root config fields persisted as dedicated `$`-prefixed root attributes, so they sync over real-time collaboration.
const CONFIG_FIELDS_AS_ROOT_ATTRIBUTES = [
	[ 'description', '$description' ],
	[ 'title', '$title' ]
] as const;

/**
 * Registers and initializes root attributes from the editor configuration:
 *
 * * the attributes from
 * {@link module:core/editor/editorconfig~RootConfig#modelAttributes `config.root(s).<rootName>.modelAttributes`}, and
 * * the {@link module:core/editor/editorconfig~RootConfig#description `description`} and
 * {@link module:core/editor/editorconfig~RootConfig#title `title`} fields, stored as the `$description` and `$title`
 * root attributes respectively.
 *
 * @internal
 */
export function registerAndInitializeRootConfigAttributes( editor: Editor ): void {
	const rootsConfig = editor.config.get( 'roots' )!;

	// Copy `description`/`title` config into `modelAttributes` so they ship through the RTC initial-data path (like
	// `$rootEditableOptions`). A value already in `modelAttributes` (e.g. restored from saved attributes) wins.
	for ( const [ rootName, rootConfig ] of Object.entries( rootsConfig ) ) {
		let modelAttributes: EditorRootAttributes | null = null;

		for ( const [ configField, attributeKey ] of CONFIG_FIELDS_AS_ROOT_ATTRIBUTES ) {
			if ( rootConfig[ configField ] == null || ( rootConfig.modelAttributes && attributeKey in rootConfig.modelAttributes ) ) {
				continue;
			}

			modelAttributes = modelAttributes || { ...rootConfig.modelAttributes };
			modelAttributes[ attributeKey ] = rootConfig[ configField ];
		}

		if ( modelAttributes ) {
			editor.config.set( `roots.${ rootName }.modelAttributes`, modelAttributes );
		}
	}

	// Re-read the configuration so the loops below pick up the attributes injected above.
	const normalizedRootsConfig = editor.config.get( 'roots' )!;
	let hasRootAttributes = false;

	for ( const rootConfig of Object.values( normalizedRootsConfig ) ) {
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
			for ( const [ rootName, rootConfig ] of Object.entries( normalizedRootsConfig ) ) {
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
