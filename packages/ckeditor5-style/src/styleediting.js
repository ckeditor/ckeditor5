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
 * TODO
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

class Styles {
	constructor( styleDefinitions ) {
		this.styleTypes = [ 'inline', 'block' ];
		this.styleDefinitions = styleDefinitions;
		this.elementToDefinition = new Map();
		this.classToDefinition = new Map();

		this._prepareDefinitionsMapping();
	}

	/**
	 * TODO
	 */
	_prepareDefinitionsMapping() {
		for ( const type of this.styleTypes ) {
			for ( const { modelElements, name, element, classes } of this.styleDefinitions[ type ] ) {
				for ( const modelElement of modelElements ) {
					const currentValue = this.elementToDefinition.get( modelElement ) || [];
					const newValue = [ ...currentValue, { name, element, classes } ];
					this.elementToDefinition.set( modelElement, newValue );
				}

				this.classToDefinition.set( classes.join( ' ' ), { name, element, classes } );
			}
		}
	}

	/**
	 * TODO
	 */
	getInlineElementsNames() {
		return this.styleDefinitions.inline.map( ( { name } ) => name );
	}

	/**
	 * TODO
	 */
	getDefinitionsByElementName( elementName ) {
		return this.elementToDefinition.get( elementName );
	}

	/**
	 * TODO
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
