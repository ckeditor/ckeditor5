/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module style/styleediting
 */

import { Plugin } from 'ckeditor5/src/core';

import StyleCommand from './stylecommand';
import StyleUtils from './styleutils';

/**
 * The style engine feature.
 *
 * It configures the {@glink features/html/general-html-support General HTML Support feature} based on
 * {@link module:style/style~StyleConfig#definitions configured style definitions} and introduces the
 * {@link module:style/stylecommand~StyleCommand style command} that applies styles to the content of the document.
 *
 * @extends module:core/plugin~Plugin
 */
export default class StyleEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'StyleEditing';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ 'GeneralHtmlSupport', StyleUtils ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const dataSchema = editor.plugins.get( 'DataSchema' );
		const styleUtils = editor.plugins.get( 'StyleUtils' );
		const normalizedStyleDefinitions = styleUtils.normalizeConfig( dataSchema, editor.config.get( 'style.definitions' ) );

		editor.commands.add( 'style', new StyleCommand( editor, normalizedStyleDefinitions ) );

		this._configureGHSDataFilter( normalizedStyleDefinitions );
	}

	/**
	 * This is where the styles feature configures the GHS feature. This method translates normalized
	 * {@link module:style/style~StyleDefinition style definitions} to {@link module:engine/view/matcher~MatcherPattern matcher patterns}
	 * and feeds them to the GHS {@link module:html-support/datafilter~DataFilter} plugin.
	 *
	 * @private
	 * @param {Object} normalizedStyleDefinitions
	 */
	_configureGHSDataFilter( { block: blockDefinitions, inline: inlineDefinitions } ) {
		const ghsDataFilter = this.editor.plugins.get( 'DataFilter' );

		ghsDataFilter.loadAllowedConfig( blockDefinitions.map( normalizedStyleDefinitionToMatcherPattern ) );
		ghsDataFilter.loadAllowedConfig( inlineDefinitions.map( normalizedStyleDefinitionToMatcherPattern ) );
	}
}

// Translates a normalized style definition to a view matcher pattern.
//
// @param {Object} definition A normalized style definition.
// @returns {module:engine/view/matcher~MatcherPattern}
function normalizedStyleDefinitionToMatcherPattern( { element, classes } ) {
	return {
		name: element,
		classes
	};
}
