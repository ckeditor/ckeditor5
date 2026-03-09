/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module core/editor/utils/normalizerootsconfig
 */

import type { EditorConfig } from '../editorconfig.js';

import {
	CKEditorError,
	getDataFromElement,
	type Config
} from '@ckeditor/ckeditor5-utils';

import { isElement as _isElement } from 'es-toolkit/compat';

/**
 * TODO
 *
 * @internal
 */
export function normalizeRootsConfig(
	sourceElementsOrData: HTMLElement | string | Record<string, HTMLElement> | Record<string, string>,
	config: Config<EditorConfig>,
	defaultRootName: string | false = 'main'
): void {
	const mainRootConfig = config.get( 'root' );
	const rootsConfig = config.get( 'roots' ) || {};

	// Avoid mixing `config.root` and `config.roots.main`.
	if ( mainRootConfig && ( !defaultRootName || defaultRootName in rootsConfig ) ) {
		// Documented in core/editor/editorconfig.ts.
		// eslint-disable-next-line ckeditor5-rules/ckeditor-error-message
		throw new CKEditorError( 'editor-create-roots-initial-data' );
	}

	// Move `config.root` to `config.roots.main`.
	// This makes access to root configuration more consistent as all roots will be defined in `config.roots`.
	if ( defaultRootName ) {
		rootsConfig[ defaultRootName ] = mainRootConfig || {};
	}

	const sourceElementIsObject = isSourceElementOrDataPlainObject( sourceElementsOrData );

	// Collect legacy configuration values for `initialData`, `placeholder`, and `label` from the config.
	const legacyInitialData = getLegacyConfigValue( config, 'initialData', sourceElementIsObject, defaultRootName );
	const legacyPlaceholder = getLegacyConfigValue( config, 'placeholder', sourceElementIsObject, defaultRootName );
	const legacyLabel = getLegacyConfigValue( config, 'label', sourceElementIsObject, defaultRootName );

	// Collect root names. This includes root names from the source element (if it's an object),
	// from `config.roots`, and from legacy config. This ensures that all roots are processed in the next step.
	const rootNames = Array.from( new Set( [
		...sourceElementIsObject ? Object.keys( sourceElementsOrData ) : [],
		...Object.keys( rootsConfig ),
		...Object.keys( legacyInitialData )
	] ) );

	// TODO handle legacy data mismatch with source element keys.

	// Ensure that all roots have `initialData` defined. If not, try to get it from the source element or data.
	for ( const rootName of rootNames ) {
		const rootConfig = rootsConfig[ rootName ] || {};
		const sourceElementOrDataForRoot = sourceElementIsObject ? sourceElementsOrData[ rootName ] : sourceElementsOrData;

		// No dedicated initial data for the root.
		if ( rootConfig.initialData === undefined ) {
			// No legacy initial data for the root, either.
			if ( legacyInitialData[ rootName ] === undefined ) {
				// Use source element data or data itself as a string.
				rootConfig.initialData = getInitialData( sourceElementOrDataForRoot );
			}
			// If both `config.initialData` is set and initial data is passed as the constructor parameter, then throw.
			else if ( sourceElementOrDataForRoot && !isElement( sourceElementOrDataForRoot ) ) {
				// Documented in core/editor/editorconfig.ts.
				// eslint-disable-next-line ckeditor5-rules/ckeditor-error-message
				throw new CKEditorError( 'editor-create-initial-data', null );
			}
			// Use legacy `config.initialData`.
			else {
				rootConfig.initialData = legacyInitialData[ rootName ];
			}
		}
		// If both `rootConfig.initialData` is set and initial data is passed as the constructor parameter, then throw.
		else if ( sourceElementOrDataForRoot && !isElement( sourceElementOrDataForRoot ) ) {
			// Documented in core/editor/editorconfig.ts.
			// eslint-disable-next-line ckeditor5-rules/ckeditor-error-message
			throw new CKEditorError( 'editor-create-initial-data', null );
		}
		// If both `rootConfig.initialData` and legacy initial data are set, then throw.
		else if ( legacyInitialData[ rootName ] !== undefined ) {
			// Documented in core/editor/editorconfig.ts.
			// eslint-disable-next-line ckeditor5-rules/ckeditor-error-message
			throw new CKEditorError( 'editor-create-roots-initial-data' );
		}

		rootConfig.placeholder ??= legacyPlaceholder[ rootName ];
		rootConfig.label ??= legacyLabel[ rootName ];

		rootsConfig[ rootName ] = rootConfig;
	}

	config.set( 'roots', rootsConfig );
}

/**
 * Type guard to check if the provided value is a plain object or plain value.
 */
function isSourceElementOrDataPlainObject(
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
 * Retrieve data from source element or return the string data as is.
 */
function getInitialData( sourceElementOrData: HTMLElement | string ): string {
	return isElement( sourceElementOrData ) ? getDataFromElement( sourceElementOrData ) : sourceElementOrData;
}

/**
 * Retrieve legacy configuration value for `initialData`, `placeholder`, or `label` from the config.
 * Normalize single-root config so returned value is always an object with root names as keys.
 */
function getLegacyConfigValue(
	config: Config<EditorConfig>,
	key: 'initialData' | 'placeholder' | 'label',
	sourceElementIsObject: boolean,
	defaultRootName: string | false
): Record<string, string | undefined> {
	return (
		sourceElementIsObject || !defaultRootName ?
			config.get( key ) || {} :
			{ [ defaultRootName ]: config.get( key ) }
	) as Record<string, string | undefined>;
}

/**
 * An alias for `isElement` from `es-toolkit/compat` with additional type guard.
 */
function isElement( value: any ): value is Element {
	return _isElement( value );
}
