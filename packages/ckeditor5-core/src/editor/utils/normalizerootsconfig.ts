/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module core/editor/utils/normalizerootsconfig
 */

import type {
	EditorConfig,
	RootConfig,
	ViewRootElementDefinition
} from '../editorconfig.js';

import {
	CKEditorError,
	getDataFromElement,
	logWarning,
	toArray,
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
			 * The {@link module:editor-classic/classiceditor~ClassicEditor} cannot use an existing DOM element as
			 * {@link module:core/editor/editorconfig~RootConfig#element `config.root.element`} because the classic
			 * editor replaces the source element with its own UI rather than editing inline within it. The passed
			 * element is ignored along with its content, so any markup inside it will not be used as the editor's
			 * initial data. Use {@link module:core/editor/editorconfig~EditorConfig#attachTo `config.attachTo`}
			 * to specify the DOM element the editor should replace, or pass the initial data via
			 * {@link module:core/editor/editorconfig~RootConfig#initialData `config.root.initialData`}.
			 *
			 * A tag name string (e.g. `'h1'`) or a
			 * {@link module:core/editor/editorconfig~ViewRootElementDefinition view root element definition} are still
			 * accepted - they describe the editable root element the classic editor creates inside its UI box.
			 *
			 * @error editor-create-root-element-not-supported
			 */
			logWarning( 'editor-create-root-element-not-supported' );

			// Drop the unsupported DOM element so downstream code can read a normalized value without re-checking.
			rootConfig.element = undefined;
		}

		// No dedicated initial data for the root.
		if ( rootConfig.initialData === undefined ) {
			// No legacy initial data for the root, either.
			if ( legacyInitialData[ rootName ] === undefined ) {
				// Use source element data or data itself as a string.
				// Fall back to legacy sourceElement, `rootConfig.element` (only when it is an HTMLElement)
				// or `config.attachTo` (for ClassicEditor) for data extraction.
				const rootConfigElement = isElement( rootConfig.element ) ? rootConfig.element : undefined;

				rootConfig.initialData = getInitialData(
					sourceElementOrDataForRoot || rootConfigElement || ( separateAttachTo && config.get( 'attachTo' ) ) || ''
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

		// Default model element to `$root` so all callers can rely on `rootConfig.modelElement` being a string.
		rootConfig.modelElement ||= '$root';

		// Reshape `rootConfig.element` into a canonical form (`HTMLElement` or `ViewRootElementDefinition`)
		// so downstream code can read it directly without re-running the string / flat-notation normalization.
		rootConfig.element = normalizeViewRootElementDefinition( rootConfig.element );

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
		 * available for the {@link module:editor-classic/classiceditor~ClassicEditor} because it replaces the
		 * given DOM element with its own UI. Other editor types (e.g. inline, balloon, decoupled) render inside
		 * the root element directly, so `config.attachTo` is not applicable.
		 *
		 * Remove the `attachTo` option from the editor configuration and use
		 * {@link module:core/editor/editorconfig~RootConfig#element `config.root.element`}
		 * (or `config.roots.<rootName>.element` for the multi-root editor) to specify the DOM element instead.
		 *
		 * @error editor-create-attachto-ignored
		 */
		throw new CKEditorError( 'editor-create-attachto-ignored', null );
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
 * Normalizes the value passed in {@link module:core/editor/editorconfig~RootConfig#element `config.root.element`} into a
 * canonical form (`HTMLElement` or {@link module:core/editor/editorconfig~ViewRootElementDefinition}) that the UI layer
 * can consume directly.
 *
 * Accepts:
 *
 * * an existing `HTMLElement` - returned as is, so the editor wraps it in place,
 * * a tag name string (e.g. `'h1'`) - turned into `{ name: 'h1' }`,
 * * a {@link module:core/editor/editorconfig~ViewRootElementDefinition} object - reshaped so `classes` becomes an
 * array and `attributes.class` is lifted into it.
 *
 * The `class` attribute may be passed either as the dedicated `classes` field (string or array of strings) or as a
 * `class` key inside `attributes`. They are concatenated. The `style` attribute may be passed either as the `styles`
 * object or as a `style` string inside `attributes`. When both are provided, the object form takes precedence and a
 * warning is logged.
 *
 * The `<textarea>` tag name is rejected as it cannot host a rich-text editable.
 *
 * Already used internally by {@link ~normalizeRootsConfig `normalizeRootsConfig()`} for `config.root.element` /
 * `config.roots.*.element`. Exported for callers that bypass the regular config-normalization pass, e.g.
 * {@link module:editor-multi-root/multirooteditor~MultiRootEditor#addRoot `MultiRootEditor.addRoot()`}
 * and {@link module:editor-multi-root/multirooteditor~MultiRootEditor#createEditable `MultiRootEditor.createEditable()`}.
 *
 * @internal
 */
export function normalizeViewRootElementDefinition(
	spec: HTMLElement | string | ViewRootElementDefinition | undefined
): HTMLElement | ViewRootElementDefinition | undefined {
	if ( spec == null ) {
		return undefined;
	}

	if ( isElement( spec ) ) {
		assertAllowedTagName( spec.tagName );

		return spec;
	}

	if ( typeof spec === 'string' ) {
		assertAllowedTagName( spec );

		return { name: spec };
	}

	const { name, classes, styles, attributes } = spec;

	if ( name !== undefined ) {
		assertAllowedTagName( name );
	}

	const { class: attrClass, style: attrStyle, ...restAttributes } = attributes || {};
	const hadAttrClass = !!attributes && 'class' in attributes;
	const hasStyles = !!styles && Object.keys( styles ).length > 0;
	const stylesOverrode = hasStyles && !!attrStyle;

	if ( stylesOverrode ) {
		/**
		 * Both the {@link module:core/editor/editorconfig~ViewRootElementDefinition#styles `styles`} object
		 * and the {@link module:core/editor/editorconfig~ViewRootElementDefinition#attributes `attributes.style`}
		 * string were provided in {@link module:core/editor/editorconfig~RootConfig#element `config.root.element`}.
		 * Provide one or the other - the object form takes precedence.
		 *
		 * @error editor-root-element-styles-overspecified
		 */
		logWarning( 'editor-root-element-styles-overspecified' );
	}

	// Split whitespace-separated tokens (e.g. `'foo bar'` or `[ 'a b', 'c' ]`) into individual class names so the
	// canonical `classes` array is "one class per entry". This matches how a caller would expect the array form to
	// behave if it were ever passed directly to per-class APIs.
	const normalizedClasses: Array<string> = [
		...tokenizeClasses( classes ),
		...tokenizeClasses( attrClass )
	];

	// `class` and `style` are kept as empty strings (rather than stripped) when their value was lifted into `classes`
	// or overridden by `styles`. This way the deep-merge in `Config.set()` overwrites any stale value left from the
	// user-provided input, instead of preserving it.
	const normalizedAttributes: Record<string, string> = { ...restAttributes };

	if ( hadAttrClass ) {
		normalizedAttributes.class = '';
	}

	if ( stylesOverrode ) {
		normalizedAttributes.style = '';
	} else if ( attrStyle ) {
		normalizedAttributes.style = attrStyle;
	}

	return {
		...( name !== undefined && { name } ),
		...( normalizedClasses.length && { classes: normalizedClasses } ),
		...( hasStyles && { styles } ),
		...( Object.keys( normalizedAttributes ).length && { attributes: normalizedAttributes } )
	};
}

/**
 * Splits a class value (string, array of strings, or `undefined`) into individual class tokens.
 * Whitespace-separated tokens within a single string are split into separate array entries and empty entries are dropped.
 */
function tokenizeClasses( value: string | Array<string> | undefined ): Array<string> {
	if ( !value ) {
		return [];
	}

	return toArray( value ).flatMap( token => token.split( /\s+/ ) ).filter( Boolean );
}

/**
 * Throws when the given tag name cannot be used as an editable root.
 *
 * The `<textarea>` and `<input>` elements are form fields and cannot contain other HTML elements,
 * so the editor cannot render rich-text content inside them.
 *
 * To fix the error, use a tag that can contain other elements - for example `'div'`, `'section'`, `'article'`,
 * or a heading like `'h1'`. You can also omit the `name` field to use the default `'div'`.
 */
function assertAllowedTagName( name: string ): void {
	if ( [ 'textarea', 'input' ].includes( name.toLowerCase() ) ) {
		/**
		 * The DOM tag name specified in {@link module:core/editor/editorconfig~RootConfig#element `config.root.element`}
		 * cannot be used as an editor's editable root. The `<textarea>` and `<input>` elements are form fields and
		 * cannot contain other HTML elements, so the editor cannot render rich-text content inside them.
		 *
		 * To fix the error, use a tag that can contain other elements - for example `'div'`, `'section'`, `'article'`,
		 * or a heading like `'h1'`. You can also omit the `name` field to use the default `'div'`.
		 *
		 * @error editor-wrong-element
		 */
		throw new CKEditorError( 'editor-wrong-element', null );
	}
}

/**
 * An alias for `isElement` from `es-toolkit/compat` with additional type guard.
 */
function isElement( value: any ): value is HTMLElement {
	return _isElement( value );
}
