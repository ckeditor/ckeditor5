/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module style/styleediting
 */

import { Plugin } from 'ckeditor5/src/core';
import { normalizeConfig } from './utils';

import StyleCommand from './stylecommand';

/**
 * The style engine feature.
 *
 * It configures the {@glink features/general-html-support General HTML Support feature} based on
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
		return [ 'GeneralHtmlSupport' ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const dataSchema = editor.plugins.get( 'DataSchema' );
		const normalizedStyleDefinitions = normalizeConfig( dataSchema, editor.config.get( 'style.definitions' ) );
		const styles = new Styles( normalizedStyleDefinitions );

		editor.commands.add( 'style', new StyleCommand( editor, styles ) );

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

/**
 * The helper class storing various mappings based on
 * {@link module:style/style~StyleConfig#definitions configured style definitions}. Used internally by
 * {@link module:style/stylecommand~StyleCommand}.
 *
 * @private
 */
class Styles {
	/**
	 * @param {Object} An object with normalized style definitions grouped into `block` and `inline` categories (arrays).
	 */
	constructor( styleDefinitions ) {
		this.styleTypes = [ 'inline', 'block' ];
		this.styleDefinitions = styleDefinitions;
		this.elementToDefinition = new Map();
		this.classToDefinition = new Map();
		this.nameToDefinition = new Map();

		this._prepareDefinitionsMapping();
	}

	/**
	 * Populates various maps to simplify getting config definitions
	 * by model name,class name and style name.
	 *
	 * @private
	 */
	_prepareDefinitionsMapping() {
		for ( const type of this.styleTypes ) {
			for ( const { modelElements, name, element, classes, isBlock } of this.styleDefinitions[ type ] ) {
				for ( const modelElement of modelElements ) {
					const currentValue = this.elementToDefinition.get( modelElement ) || [];
					const newValue = [ ...currentValue, { name, element, classes } ];
					this.elementToDefinition.set( modelElement, newValue );
				}

				this.classToDefinition.set( classes.join( ' ' ), { name, element, classes } );
				this.nameToDefinition.set( name, { name, element, classes, isBlock } );
			}
		}
	}

	/**
	 * Returns all inline definitions elements names.
	 *
	 * @protected
	 * @return {Array.<String>} Inline elements names.
	 */
	getInlineElementsNames() {
		return this.styleDefinitions.inline.map( ( { name } ) => name );
	}

	/**
	 * Returns the style config definitions by the model element name.
	 *
	 * @protected
	 * @return {Object} Style config definition.
	 */
	getDefinitionsByElementName( elementName ) {
		return this.elementToDefinition.get( elementName );
	}

	/**
	 * Returns the style config definitions by the style name.
	 *
	 * @protected
	 * @return {Object} Style config definition.
	 */
	getDefinitionsByName( name ) {
		return this.nameToDefinition.get( name );
	}

	/**
	 * Returns the style config definitions by the style name.
	 *
	 * @protected
	 * @return {Object} Style config definition.
	 */
	getDefinitionsByClassName( className ) {
		return this.classToDefinition.get( className );
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
