/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module watchdog/utils/normalizerootsconfig
 */

import { isElement as _isElement } from 'es-toolkit/compat';
import type { EditorConfig } from '@ckeditor/ckeditor5-core';

// Note: This file is a copy of core/editor/utils/normalizerootsconfig with some adjustments.
// The main difference is that it does not use the `Config` class from `@ckeditor/ckeditor5-utils` and instead works
// with a plain `EditorConfig` object. It also does not throw `CKEditorError` but a generic `Error` with a specific message.
// It resolves root configuration for the editor, but does not care about real data in initialData as the watchdog does not need it.
// It just needs to ensure that initialData is defined for all roots, so the editor features can work with it without additional checks.
// Note that this helper modifies the provided config object.

/**
 * Normalizes the editor roots configuration. It ensures that all root configurations are defined in `config.roots`
 * and that they have `initialData` defined.
 *
 * It normalizes a single-root configuration (where `config.root` is used) to a multi-root configuration
 * (where all roots are defined in `config.roots`). This is considered a standard configuration format,
 * so the editor features can always expect roots to be defined in `config.roots`.
 *
 * It also handles legacy configuration options, such as `config.initialData`, `config.placeholder`, and `config.label`.
 *
 * @internal
 */
export function normalizeRootsConfig(
	sourceElementsOrData: HTMLElement | string | Record<string, HTMLElement> | Record<string, string>,
	config: EditorConfig,
	defaultRootName: string | false
): void {
	const mainRootConfig = config.root;
	const rootsConfig = config.roots || Object.create( null );

	// Move `config.root` to `config.roots.main`.
	// This makes access to root configuration more consistent as all roots will be defined in `config.roots`.
	if ( defaultRootName && !rootsConfig[ defaultRootName ] ) {
		rootsConfig[ defaultRootName ] = mainRootConfig || Object.create( null );
	}

	const sourceElementIsPlainObject = isPlainObject( sourceElementsOrData );

	// Collect legacy configuration values for `initialData`, `placeholder`, and `label` from the config.
	const legacyInitialData = getLegacyInitialData( config, sourceElementIsPlainObject, defaultRootName );

	// Collect root names. This includes root names from the source element (if it's an object),
	// from `config.roots`, and from legacy config. This ensures that all roots are processed in the next step.
	const rootNames = Array.from( new Set( [
		...sourceElementIsPlainObject ? Object.keys( sourceElementsOrData ) : [],
		...Object.keys( rootsConfig ),
		...Object.keys( legacyInitialData )
	] ) );

	// Ensure that all roots have `initialData` defined. If not, try to get it from the source element or data.
	for ( const rootName of rootNames ) {
		const rootConfig = rootsConfig[ rootName ] || Object.create( null );

		// Watchdog does not need HTML, it uses dedicated plugin for restoring the model.
		// As watchdog uses only DOM element or map of DOM elements for sourceElementsOrData,
		// it can not use string as initial data, so it can be safely set to an empty string.
		rootConfig.initialData = '';

		// Handle legacy `config.placeholder` and `config.label` for the root.
		rootConfig.placeholder ??= getLegacyPlainConfigValue( config, 'placeholder', rootName );
		rootConfig.label ??= getLegacyPlainConfigValue( config, 'label', rootName );

		rootsConfig[ rootName ] = rootConfig;
	}

	config.roots = rootsConfig;
}

/**
 * Type guard to check if the provided value is a plain object.
 */
function isPlainObject(
	sourceElementsOrData: HTMLElement | string | Record<string, HTMLElement> | Record<string, string>
): sourceElementsOrData is Record<string, HTMLElement> | Record<string, string> {
	return (
		!!sourceElementsOrData &&
		typeof sourceElementsOrData == 'object' &&
		!Array.isArray( sourceElementsOrData ) &&
		!isElement( sourceElementsOrData )
	);
}

/**
 * Retrieve legacy configuration value for `initialData` from the config.
 * Normalize single-root config so returned value is always an object with root names as keys.
 */
function getLegacyInitialData(
	config: EditorConfig,
	sourceElementIsObject: boolean,
	defaultRootName: string | false
): Record<string, string | undefined> {
	return (
		sourceElementIsObject || !defaultRootName ?
			config.initialData || Object.create( null ) :
			{
				[ defaultRootName ]: config.initialData
			}
	) as Record<string, string | undefined>;
}

/**
 * Retrieve legacy configuration value for `placeholder` or `label` from the config for a specific root.
 */
function getLegacyPlainConfigValue(
	config: EditorConfig,
	key: 'placeholder' | 'label',
	rootName: string
): string | undefined {
	const legacyValue = config[ key ];

	if ( legacyValue ) {
		return typeof legacyValue == 'string' ? legacyValue : legacyValue[ rootName ];
	}
}

/**
 * An alias for `isElement` from `es-toolkit/compat` with additional type guard.
 */
function isElement( value: any ): value is Element {
	return _isElement( value );
}
