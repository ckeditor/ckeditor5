/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module style/styleediting
 */

import { Plugin } from 'ckeditor5/src/core';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport';
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
		return [ GeneralHtmlSupport ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const stylesMap = prepareStylesMap( editor );

		editor.commands.add( 'style', new StyleCommand( editor, stylesMap ) );
	}
}

// TODO
//
// @private
// @param editor
function prepareStylesMap( editor ) {
	const stylesMap = new Map( [
		[ 'elementToDefinition', new Map() ],
		[ 'classToDefinition', new Map() ]
	] );

	convertStyleDefinitionsToStylesMap( editor, stylesMap, 'inline' );
	convertStyleDefinitionsToStylesMap( editor, stylesMap, 'block' );

	return stylesMap;
}

// TODO
//
// @private
// @param editor
// @param stylesMap
// @param type
function convertStyleDefinitionsToStylesMap( editor, stylesMap, type ) {
	const dataSchema = editor.plugins.get( 'DataSchema' );
	const normalizedStyleDefinitions = normalizeConfig( dataSchema, editor.config.get( 'style.definitions' ) );

	for ( const { modelElements, name, element, classes } of normalizedStyleDefinitions[ type ] ) {
		for ( const modelElement of modelElements ) {
			const currentValue = stylesMap.get( 'elementToDefinition' ).get( modelElement ) || [];
			const newValue = [ ...currentValue, { name, element, classes } ];
			stylesMap.get( 'elementToDefinition' ).set( modelElement, newValue );
		}

		for ( const htmlClass of classes ) {
			stylesMap.get( 'classToDefinition' ).set( htmlClass, { name, element, classes } );
		}
	}
}
