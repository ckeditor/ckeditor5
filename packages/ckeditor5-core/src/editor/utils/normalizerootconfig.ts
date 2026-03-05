/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module core/editor/utils/normalizerootconfig
 */

import { isElement as _isElement } from 'es-toolkit/compat';

import {
	CKEditorError,
	getDataFromElement,
	logWarning,
	type Config
} from '@ckeditor/ckeditor5-utils';

import type {
	EditorConfig,
	RootConfig,
	RootsConfig
} from '../editorconfig.js';

/**
 * Parameters for {@link module:core/editor/utils/normalizerootconfig~normalizeRootConfig}.
 */
export type NormalizeRootConfigOptions = {

	/**
	 * The editor source element(s) or initial data passed in the first parameter of editor constructor.
	 */
	sourceElementOrData?: HTMLElement | string | Record<string, HTMLElement> | Record<string, string>;

	/**
	 * Indicates whether `sourceElementOrData` contains initial data (`true`) or source element(s) (`false`).
	 */
	isSourceData?: boolean;

	/**
	 * Names of roots passed in `sourceElementOrData`.
	 */
	rootNames?: Array<string>;

	/**
	 * Name of the default root.
	 */
	defaultRootName?: string;

	/**
	 * Forces creation of the default root configuration object.
	 */
	forceDefaultRoot?: boolean;

	/**
	 * Controls whether deprecation warnings should be logged when legacy keys are used.
	 */
	withDeprecationWarnings?: boolean;
};

/**
 * Normalizes root-related configuration options to the `config.roots` structure.
 *
 * The following keys are normalized:
 *
 * * `config.root` (alias for `config.roots.main`)
 * * `config.initialData` (deprecated)
 * * `config.placeholder` (deprecated)
 * * `config.label`
 */
export function normalizeRootConfig(
	config: Config<EditorConfig>,
	{
		sourceElementOrData,
		isSourceData = inferIsSourceData( sourceElementOrData ),
		rootNames = [],
		defaultRootName = 'main',
		forceDefaultRoot = false,
		withDeprecationWarnings = true
	}: NormalizeRootConfigOptions = {}
): void {
	const roots = _getNormalizedRootsConfig( config, defaultRootName );
	const rootNamesFromConfig = Object.keys( roots );
	const allRootNames = new Set( [ ...rootNames, ...rootNamesFromConfig ] );

	if ( forceDefaultRoot ) {
		allRootNames.add( defaultRootName );
	}

	const legacyInitialData = config.get( 'initialData' );

	if ( legacyInitialData !== undefined ) {
		if ( withDeprecationWarnings ) {
			/**
			 * The {@link module:core/editor/editorconfig~EditorConfig#initialData `initialData`} configuration option has been deprecated.
			 * Use {@link module:core/editor/editorconfig~EditorConfig#roots `roots.<rootName>.initialData`} instead.
			 *
			 * @error editor-config-initial-data-deprecated
			 */
			logWarning( 'editor-config-initial-data-deprecated' );
		}

		_applyLegacyInitialData( roots, legacyInitialData, defaultRootName );
	}

	const legacyPlaceholder = config.get( 'placeholder' );

	if ( legacyPlaceholder !== undefined ) {
		if ( withDeprecationWarnings ) {
			/**
			 * The {@link module:core/editor/editorconfig~EditorConfig#placeholder `placeholder`} configuration option has been deprecated.
			 * Use {@link module:core/editor/editorconfig~EditorConfig#roots `roots.<rootName>.placeholder`} instead.
			 *
			 * @error editor-config-placeholder-deprecated
			 */
			logWarning( 'editor-config-placeholder-deprecated' );
		}

		_applyLegacyRootOption( roots, legacyPlaceholder, 'placeholder', allRootNames, defaultRootName );
	}

	_applyLegacyRootOption( roots, config.get( 'label' ), 'label', allRootNames, defaultRootName );

	if ( isSourceData && _containsInitialData( roots ) ) {
		// Documented in core/editor/editorconfig.jsdoc.
		// eslint-disable-next-line ckeditor5-rules/ckeditor-error-message
		throw new CKEditorError( 'editor-create-initial-data', null );
	}

	if ( sourceElementOrData !== undefined ) {
		for ( const rootName of rootNames ) {
			const rootConfig = _getRootConfig( roots, rootName );

			if ( rootConfig.initialData !== undefined ) {
				continue;
			}

			const sourceData = _getDataFromSource( sourceElementOrData, rootName );

			if ( sourceData !== undefined ) {
				rootConfig.initialData = sourceData;
			}
		}

		if ( forceDefaultRoot ) {
			const defaultRootConfig = _getRootConfig( roots, defaultRootName );

			if ( defaultRootConfig.initialData === undefined ) {
				const sourceData = _getDataFromSource( sourceElementOrData, defaultRootName );

				if ( sourceData !== undefined ) {
					defaultRootConfig.initialData = sourceData;
				}
			}
		}
	}

	if ( forceDefaultRoot ) {
		_getRootConfig( roots, defaultRootName );
	}

	config.set( 'roots', roots );

	if ( roots[ defaultRootName ] ) {
		config.set( 'root', roots[ defaultRootName ] );
	}

	const legacyInitialDataOutput = _toLegacyInitialData( roots, defaultRootName, forceDefaultRoot );

	if ( legacyInitialDataOutput !== undefined ) {
		config.set( 'initialData', legacyInitialDataOutput );
	}
}

function _getNormalizedRootsConfig( config: Config<EditorConfig>, defaultRootName: string ): RootsConfig {
	const roots = { ...( config.get( 'roots' ) || {} ) };
	const root = config.get( 'root' );

	if ( root ) {
		roots[ defaultRootName ] = _mergeRootConfig( root, roots[ defaultRootName ] || {} );
	}

	return roots;
}

function _mergeRootConfig( source: RootConfig, target: RootConfig ): RootConfig {
	const sourceRootConfig = source as RootConfig & Record<string, unknown>;
	const targetRootConfig = target as RootConfig & Record<string, unknown>;
	const sourceModelElement = sourceRootConfig.modelElement as Record<string, unknown> | undefined;
	const targetModelElement = targetRootConfig.modelElement as Record<string, unknown> | undefined;
	const mergedRootConfig = {
		...sourceRootConfig,
		...targetRootConfig
	};

	if ( sourceModelElement || targetModelElement ) {
		mergedRootConfig.modelElement = {
			...sourceModelElement,
			...targetModelElement
		};
	}

	return mergedRootConfig as RootConfig;
}

function _applyLegacyInitialData(
	roots: RootsConfig,
	initialData: EditorConfig[ 'initialData' ],
	defaultRootName: string
): void {
	if ( typeof initialData === 'string' ) {
		_getRootConfig( roots, defaultRootName ).initialData ??= initialData;

		return;
	}

	if ( !initialData ) {
		return;
	}

	for ( const [ rootName, value ] of Object.entries( initialData ) ) {
		_getRootConfig( roots, rootName ).initialData ??= value;
	}
}

function _applyLegacyRootOption(
	roots: RootsConfig,
	value: string | Record<string, string> | undefined,
	key: 'placeholder' | 'label',
	rootNames: Set<string>,
	defaultRootName: string
): void {
	if ( value === undefined ) {
		return;
	}

	if ( typeof value === 'string' ) {
		if ( rootNames.size === 0 ) {
			_getRootConfig( roots, defaultRootName )[ key ] ??= value;

			return;
		}

		for ( const rootName of rootNames ) {
			_getRootConfig( roots, rootName )[ key ] ??= value;
		}

		return;
	}

	for ( const [ rootName, rootValue ] of Object.entries( value ) ) {
		_getRootConfig( roots, rootName )[ key ] ??= rootValue;
	}
}

function _containsInitialData( roots: RootsConfig ): boolean {
	return Object.values( roots ).some( rootConfig => rootConfig.initialData !== undefined );
}

function _toLegacyInitialData(
	roots: RootsConfig,
	defaultRootName: string,
	isSingleRoot: boolean
): string | Record<string, string> | undefined {
	const initialDataEntries = Object.entries( roots )
		.filter( ( [ , rootConfig ] ) => rootConfig.initialData !== undefined )
		.map( ( [ rootName, rootConfig ] ) => [ rootName, rootConfig.initialData! ] as const );

	if ( initialDataEntries.length === 0 ) {
		return undefined;
	}

	if ( isSingleRoot && initialDataEntries.length === 1 && initialDataEntries[ 0 ][ 0 ] === defaultRootName ) {
		return initialDataEntries[ 0 ][ 1 ];
	}

	return Object.fromEntries( initialDataEntries );
}

function _getRootConfig( roots: RootsConfig, rootName: string ): RootConfig {
	if ( !roots[ rootName ] ) {
		roots[ rootName ] = {};
	}

	return roots[ rootName ];
}

function _getDataFromSource(
	sourceElementOrData: HTMLElement | string | Record<string, HTMLElement> | Record<string, string>,
	rootName: string
): string | undefined {
	if ( typeof sourceElementOrData === 'string' ) {
		return rootName === 'main' ? sourceElementOrData : undefined;
	}

	if ( isElement( sourceElementOrData ) ) {
		return rootName === 'main' ? getDataFromElement( sourceElementOrData ) : undefined;
	}

	const sourceDataForRoot = sourceElementOrData[ rootName ];

	if ( sourceDataForRoot === undefined ) {
		return undefined;
	}

	return isElement( sourceDataForRoot ) ? getDataFromElement( sourceDataForRoot ) : sourceDataForRoot;
}

function inferIsSourceData(
	sourceElementOrData: NormalizeRootConfigOptions[ 'sourceElementOrData' ]
): boolean {
	if ( sourceElementOrData === undefined ) {
		return false;
	}

	if ( typeof sourceElementOrData === 'string' ) {
		return true;
	}

	if ( isElement( sourceElementOrData ) ) {
		return false;
	}

	const firstEntry = Object.values( sourceElementOrData )[ 0 ];

	return typeof firstEntry === 'string';
}

function isElement( value: any ): value is HTMLElement {
	return _isElement( value );
}
