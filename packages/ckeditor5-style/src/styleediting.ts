/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module style/styleediting
 */

import { Plugin } from 'ckeditor5/src/core';
import type { MatcherPattern } from 'ckeditor5/src/engine';
import type { DataFilter, DataSchema } from '@ckeditor/ckeditor5-html-support';

import StyleCommand from './stylecommand';
import StyleUtils, { type NormalizedStyleDefinitions } from './styleutils';
import type { StyleConfig, StyleDefinition } from './styleconfig';

/**
 * The style engine feature.
 *
 * It configures the {@glink features/general-html-support General HTML Support feature} based on
 * {@link module:style/styleconfig~StyleConfig#definitions configured style definitions} and introduces the
 * {@link module:style/stylecommand~StyleCommand style command} that applies styles to the content of the document.
 */
export default class StyleEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'StyleEditing' {
		return 'StyleEditing';
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ 'GeneralHtmlSupport', StyleUtils ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const dataSchema: DataSchema = editor.plugins.get( 'DataSchema' );
		const styleUtils: StyleUtils = editor.plugins.get( 'StyleUtils' );
		const styleDefinitions: StyleConfig['definitions'] = editor.config.get( 'style.definitions' )!;
		const normalizedStyleDefinitions = styleUtils.normalizeConfig( dataSchema, styleDefinitions );

		editor.commands.add( 'style', new StyleCommand( editor, normalizedStyleDefinitions ) );

		this._configureGHSDataFilter( normalizedStyleDefinitions );
	}

	/**
	 * This is where the styles feature configures the GHS feature. This method translates normalized
	 * {@link module:style/styleconfig~StyleDefinition style definitions} to
	 * {@link module:engine/view/matcher~MatcherPattern matcher patterns} and feeds them to the GHS
	 * {@link module:html-support/datafilter~DataFilter} plugin.
	 */
	private _configureGHSDataFilter( { block, inline }: NormalizedStyleDefinitions ): void {
		const ghsDataFilter: DataFilter = this.editor.plugins.get( 'DataFilter' );

		ghsDataFilter.loadAllowedConfig( block.map( normalizedStyleDefinitionToMatcherPattern ) );
		ghsDataFilter.loadAllowedConfig( inline.map( normalizedStyleDefinitionToMatcherPattern ) );
	}
}

/**
 * Translates a normalized style definition to a view matcher pattern.
 */
function normalizedStyleDefinitionToMatcherPattern( { element, classes }: StyleDefinition ): MatcherPattern {
	return {
		name: element,
		classes
	};
}
