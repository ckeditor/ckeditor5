/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/engineconfig
 */

/**
 * CKEditor engine configuration options.
 *
 * This is a base class for {@link module:core/editor/editorconfig~EditorConfig `EditorConfig`}.
 */
export interface EngineConfig {

	/**
	 * Enables specific experimental features in the editor for testing and feedback.
	 */
	experimentalFlags?: ExperimentalFlagsConfig;
}

/**
 * The `experimentalFlags` configuration option enables integrators to turn on specific experimental
 * or pre-release features in CKEditor 5. These flags are primarily intended for testing and feedback purposes
 * during the development of new functionality.
 *
 * Each key in the `experimentalFlags` object represents a unique experimental feature identifier.
 * Setting the flag’s value to true activates the feature, while false (or absence of the key) keeps it disabled.
 *
 * Example
 *
 * ```ts
 * EditorClass
 * 	.create( {
 * 		experimentalFlags: {
 * 			modelInsertContentDeepSchemaVerification: true
 * 		}
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * **Notes:**
 * * Use with caution: Experimental features are not guaranteed to be stable and may change or be removed in future releases.
 * * No compatibility guarantees: Their APIs, behavior, and configuration may change without notice.
 * * Intended audience: This option is mainly for developers testing upcoming features, contributors, or early adopters
 * evaluating new editor capabilities.
 */
export interface ExperimentalFlagsConfig {

	/**
	 * When enabled, the editor performs deep schema verification during
	 * {@link module:engine/model/model~Model#insertContent `model.insertContent()`} operations.
	 * This ensures that all elements and attributes in the inserted content fully conform to the schema — not just
	 * at the top level — which helps identify structural inconsistencies early.
	 *
	 * This feature may impact performance on large inserts.
	 */
	modelInsertContentDeepSchemaVerification?: boolean;
}
