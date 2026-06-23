/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module core/editor/utils/registerandinitializerootconfigattributes
 */

import type { Editor, EditorRootAttributes } from '../editor.js';

/**
 * Registers and initializes root attributes from the editor configuration:
 *
 * * the attributes from
 * {@link module:core/editor/editorconfig~RootConfig#modelAttributes `config.root(s).<rootName>.modelAttributes`}, and
 * * the {@link module:core/editor/editorconfig~RootConfig#description `description`} field, stored as the
 * `$description` root attribute.
 *
 * @internal
 */
export function registerAndInitializeRootConfigAttributes( editor: Editor ): void {
	const rootsConfig = editor.config.get( 'roots' )!;

	// Store the `description` configuration as the `$description` key inside `modelAttributes`.
	// This way it is broadcasted through RTC and persisted in revision history.
	// If `$description` is already present in roots attributes (e.g. restored from saved root attributes)
	// it takes precedence over config value and is left untouched.
	for ( const [ rootName, rootConfig ] of Object.entries( rootsConfig ) ) {
		if ( rootConfig.description == null || ( rootConfig.modelAttributes && '$description' in rootConfig.modelAttributes ) ) {
			continue;
		}

		editor.config.set( `roots.${ rootName }.modelAttributes`, {
			...rootConfig.modelAttributes,
			$description: rootConfig.description
		} as EditorRootAttributes );
	}

	// Re-read the configuration so the loops below pick up the `$description` injected above.
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
