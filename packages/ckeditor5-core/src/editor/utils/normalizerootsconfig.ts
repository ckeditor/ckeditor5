/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module core/editor/utils/normalizerootsconfig
 */

import type { EditorConfig, RootConfig } from '../editorconfig.js';

import {
	CKEditorError,
	getDataFromElement,
	logWarning,
	type Config
} from '@ckeditor/ckeditor5-utils';

import { isElement as _isElement } from 'es-toolkit/compat';

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
	config: Config<EditorConfig>,
	defaultRootName: string | false = 'main',
	separateAttachTo: boolean = false
): void {
	const mainRootConfig = config.get( 'root' );
	const rootsConfig: Record<string, RootConfig> = config.get( 'roots' ) || Object.create( null );

	// Avoid mixing `config.root` and `config.roots.main`.
	if ( mainRootConfig ) {
		if ( !defaultRootName ) {
			/**
			 * The {@link module:core/editor/editorconfig~EditorConfig#root `config.root`} option is designed
			 * for single-root editors and cannot be used with the
			 * {@link module:editor-multi-root/multirooteditor~MultiRootEditor multi-root editor}.
			 *
			 * To configure a multi-root editor, define each root individually using
			 * {@link module:core/editor/editorconfig~EditorConfig#roots `config.roots`}:
			 *
			 * ```ts
			 * MultiRootEditor.create( {
			 * 	roots: {
			 * 		header: { initialData: '<p>Header</p>' },
			 * 		content: { initialData: '<p>Content</p>' }
			 * 	}
			 * } );
			 * ```
			 *
			 * @error editor-create-multi-root-with-main
			 */
			throw new CKEditorError( 'editor-create-multi-root-with-main', null );
		}
		else if ( defaultRootName in rootsConfig ) {
			/**
			 * Both {@link module:core/editor/editorconfig~EditorConfig#root `config.root`} and
			 * `config.roots.main` are set, but they both configure the same default editing root,
			 * which creates an ambiguity. Use one or the other:
			 *
			 * * {@link module:core/editor/editorconfig~EditorConfig#root `config.root`} for a single-root editor.
			 * * {@link module:core/editor/editorconfig~EditorConfig#roots `config.roots`} when defining
			 * multiple roots.
			 *
			 * @error editor-create-roots-with-main
			 */
			throw new CKEditorError( 'editor-create-roots-with-main', null );
		}
	}

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
		const sourceElementOrDataForRoot = sourceElementIsPlainObject ? sourceElementsOrData[ rootName ] : sourceElementsOrData;

		// Assign `sourceElement` to root config if it's an element.
		if ( !separateAttachTo && isElement( sourceElementOrDataForRoot ) ) {
			if ( rootConfig.element ) {
				/**
				 * The root element is specified both as the first argument of the editor `create()` method
				 * (e.g. {@link module:editor-inline/inlineeditor~InlineEditor.create `InlineEditor.create()`} or
				 * {@link module:editor-multi-root/multirooteditor~MultiRootEditor.create `MultiRootEditor.create()`})
				 * and in {@link module:core/editor/editorconfig~RootConfig#element `config.root.element`}
				 * (or `config.roots.<rootName>.element` for the
				 * {@link module:editor-multi-root/multirooteditor~MultiRootEditor multi-root editor}).
				 *
				 * Passing the element as the first argument is deprecated. Remove it and use
				 * {@link module:core/editor/editorconfig~RootConfig#element `config.root.element`}
				 * (or `config.roots.<rootName>.element` for the multi-root editor) instead.
				 *
				 * @error editor-create-root-element-overspecified
				 */
				throw new CKEditorError( 'editor-create-root-element-overspecified', null );
			}

			rootConfig.element = sourceElementOrDataForRoot;
		}

		if ( separateAttachTo && isElement( rootConfig.element ) ) {
			/**
			 * The {@link module:editor-classic/classiceditor~ClassicEditor} ignores
			 * {@link module:core/editor/editorconfig~RootConfig#element `config.root.element`} because
			 * the classic editor replaces the DOM element with its own UI rather than editing inline within it.
			 * Use {@link module:core/editor/editorconfig~EditorConfig#attachTo `config.attachTo`}
			 * to specify the DOM element the editor should replace.
			 *
			 * @error editor-create-root-element-not-supported
			 */
			logWarning( 'editor-create-root-element-not-supported' );
		}

		// No dedicated initial data for the root.
		if ( rootConfig.initialData === undefined ) {
			// No legacy initial data for the root, either.
			if ( legacyInitialData[ rootName ] === undefined ) {
				// Use source element data or data itself as a string.
				// Fall back to legacy sourceElement, `rootConfig.element` or `config.attachTo` (for ClassicEditor) for data extraction.
				rootConfig.initialData = getInitialData(
					sourceElementOrDataForRoot || rootConfig.element || ( separateAttachTo && config.get( 'attachTo' ) ) || ''
				);
			}
			// If both `config.initialData` is set and initial data is passed as the constructor parameter, then throw.
			else if ( sourceElementOrDataForRoot && !isElement( sourceElementOrDataForRoot ) ) {
				/**
				 * The initial data is specified both as the first argument of the editor `create()` method
				 * (e.g. {@link module:editor-inline/inlineeditor~InlineEditor.create `InlineEditor.create()`} or
				 * {@link module:editor-multi-root/multirooteditor~MultiRootEditor.create `MultiRootEditor.create()`})
				 * and in the deprecated {@link module:core/editor/editorconfig~EditorConfig#initialData `config.initialData`}.
				 *
				 * Passing initial data as the first argument is deprecated. Remove it and use
				 * {@link module:core/editor/editorconfig~RootConfig#initialData `config.root.initialData`}
				 * (or `config.roots.<rootName>.initialData` for the multi-root editor) instead.
				 *
				 * @error editor-create-initial-data-overspecified
				 */
				throw new CKEditorError( 'editor-create-initial-data-overspecified', null );
			}
			// Use legacy `config.initialData`.
			else {
				rootConfig.initialData = legacyInitialData[ rootName ];
			}
		}
		// If both `rootConfig.initialData` is set and initial data is passed as the constructor parameter, then throw.
		else if ( sourceElementOrDataForRoot && !isElement( sourceElementOrDataForRoot ) ) {
			/**
			 * The initial data is specified both as the first argument of the editor `create()` method
			 * (e.g. {@link module:editor-inline/inlineeditor~InlineEditor.create `InlineEditor.create()`} or
			 * {@link module:editor-multi-root/multirooteditor~MultiRootEditor.create `MultiRootEditor.create()`})
			 * and in {@link module:core/editor/editorconfig~RootConfig#initialData `config.root.initialData`}
			 * (or `config.roots.<rootName>.initialData` for the multi-root editor).
			 *
			 * Passing initial data as the first argument is deprecated. Remove it and use
			 * {@link module:core/editor/editorconfig~RootConfig#initialData `config.root.initialData`}
			 * (or `config.roots.<rootName>.initialData` for the multi-root editor) instead.
			 *
			 * @error editor-create-root-initial-data-overspecified
			 */
			throw new CKEditorError( 'editor-create-root-initial-data-overspecified', null );
		}
		// If both `rootConfig.initialData` and legacy initial data are set, then throw.
		else if ( legacyInitialData[ rootName ] !== undefined ) {
			/**
			 * The initial data is specified both in
			 * {@link module:core/editor/editorconfig~RootConfig#initialData `config.root.initialData`}
			 * (or `config.roots.<rootName>.initialData` for the multi-root editor) and in the deprecated
			 * {@link module:core/editor/editorconfig~EditorConfig#initialData `config.initialData`}.
			 *
			 * The `config.initialData` option is deprecated. Remove it and use
			 * {@link module:core/editor/editorconfig~RootConfig#initialData `config.root.initialData`}
			 * (or `config.roots.<rootName>.initialData` for the multi-root editor) instead.
			 *
			 * @error editor-create-legacy-initial-data-overspecified
			 */
			throw new CKEditorError( 'editor-create-legacy-initial-data-overspecified', null );
		}

		// Handle legacy `config.placeholder` and `config.label` for the root.
		rootConfig.placeholder ??= getLegacyPlainConfigValue( config, 'placeholder', rootName );
		rootConfig.label ??= getLegacyPlainConfigValue( config, 'label', rootName );

		rootsConfig[ rootName ] = rootConfig;
	}

	// The ClassicEditor has a special separate config option `attachTo`.
	// It is used as a source of editor data and attachment element, but not the root element.
	if ( separateAttachTo && isElement( sourceElementsOrData ) ) {
		if ( config.get( 'attachTo' ) ) {
			/**
			 * The element to attach the editor to is specified both as the first argument of
			 * {@link module:editor-classic/classiceditor~ClassicEditor.create `ClassicEditor.create()`}
			 * and in {@link module:core/editor/editorconfig~EditorConfig#attachTo `config.attachTo`}.
			 *
			 * Passing the element as the first argument is deprecated. Remove it and use
			 * {@link module:core/editor/editorconfig~EditorConfig#attachTo `config.attachTo`} instead.
			 *
			 * @error editor-create-attachto-overspecified
			 */
			throw new CKEditorError( 'editor-create-attachto-overspecified', null );
		}

		config.set( 'attachTo', sourceElementsOrData );
	}

	// The `config.attachTo` is only supported by the ClassicEditor.
	if ( !separateAttachTo && config.get( 'attachTo' ) ) {
		/**
		 * The {@link module:core/editor/editorconfig~EditorConfig#attachTo `config.attachTo`} option is only
		 * available for the {@link module:editor-classic/classiceditor~ClassicEditor}. It will be ignored
		 * by other editor types.
		 *
		 * @error editor-create-attachto-ignored
		 */
		logWarning( 'editor-create-attachto-ignored' );
	}

	config.set( 'roots', rootsConfig );
}

/**
 * Normalizes the parameters passed to the editor constructor when a single root is used. It supports both of the following signatures:
 *
 * ```ts
 * new Editor( editorConfig: EditorConfig );
 * new Editor( sourceElementOrData: HTMLElement | string, editorConfig: EditorConfig );
 * ```
 *
 * @internal
 */
export function normalizeSingleRootEditorConstructorParams(
	sourceElementOrDataOrConfig: HTMLElement | string | EditorConfig,
	editorConfig: EditorConfig
): { sourceElementOrData: HTMLElement | string; editorConfig: EditorConfig } {
	if (
		typeof sourceElementOrDataOrConfig === 'string' ||
		isElement( sourceElementOrDataOrConfig ) ||
		editorConfig && Object.keys( editorConfig ).length
	) {
		return {
			sourceElementOrData: sourceElementOrDataOrConfig as HTMLElement | string,
			editorConfig
		};
	} else {
		return {
			sourceElementOrData: '',
			editorConfig: sourceElementOrDataOrConfig as EditorConfig
		};
	}
}

/**
 * Normalizes the parameters passed to the editor constructor when a multi root is used. It supports both of the following signatures:
 *
 * ```ts
 * new Editor( editorConfig: EditorConfig );
 * new Editor( sourceElementsOrData: Record<string, string> | Record<string, HTMLElement>, editorConfig: EditorConfig );
 * ```
 *
 * @internal
 */
export function normalizeMultiRootEditorConstructorParams(
	sourceElementOrDataOrConfig: Record<string, string> | Record<string, HTMLElement>,
	editorConfig: EditorConfig
): { sourceElementsOrData: Record<string, string> | Record<string, HTMLElement>; editorConfig: EditorConfig } {
	if (
		editorConfig && Object.keys( editorConfig ).length ||
		Object.keys( sourceElementOrDataOrConfig ).length == 0 ||
		Object.values( sourceElementOrDataOrConfig ).every( value => typeof value === 'string' || isElement( value ) )
	) {
		return {
			sourceElementsOrData: sourceElementOrDataOrConfig as Record<string, string> | Record<string, HTMLElement>,
			editorConfig
		};
	} else {
		return {
			sourceElementsOrData: {},
			editorConfig: sourceElementOrDataOrConfig as EditorConfig
		};
	}
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
 * Retrieve data from source element or return the string data as is.
 */
function getInitialData( sourceElementOrData: HTMLElement | string ): string {
	return isElement( sourceElementOrData ) ? getDataFromElement( sourceElementOrData ) : sourceElementOrData;
}

/**
 * Retrieve legacy configuration value for `initialData` from the config.
 * Normalize single-root config so returned value is always an object with root names as keys.
 */
function getLegacyInitialData(
	config: Config<EditorConfig>,
	sourceElementIsObject: boolean,
	defaultRootName: string | false
): Record<string, string | undefined> {
	return (
		sourceElementIsObject || !defaultRootName ?
			config.get( 'initialData' ) || Object.create( null ) :
			{
				[ defaultRootName ]: config.get( 'initialData' )
			}
	) as Record<string, string | undefined>;
}

/**
 * Retrieve legacy configuration value for `placeholder` or `label` from the config for a specific root.
 */
function getLegacyPlainConfigValue(
	config: Config<EditorConfig>,
	key: 'placeholder' | 'label',
	rootName: string
): string | undefined {
	const legacyValue = config.get( key );

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
