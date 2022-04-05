/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module TODO
 */

import { Command } from 'ckeditor5/src/core';
import { logWarning, first } from 'ckeditor5/src/utils';

/**
 * TODO
 *
 * @extends module:core/command~Command
 */
export default class StyleCommand extends Command {
	constructor( editor, styles ) {
		super( editor );

		/**
		 * TODO
		 *
		 * @observable
		 * @readonly
		 * @member {Boolean|String} #value
		 */

		/**
		 * TODO:
		 *
		 * @readonly
		 * @member {Map.<String, Map.<String, module:style/style~StyleDefinition>>}
		 */
		this.styles = styles;

		/**
		 * TODO
		 */
		this.htmlSupport = editor.plugins.get( 'GeneralHtmlSupport' );

		/**
		 * TODO
		 */
		this.set( 'enabledStyles', [] );

		/**
		 * TODO
		 */
		this.refresh();
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		let value = [];
		const editor = this.editor;
		const selection = editor.model.document.selection;
		const block = first( selection.getSelectedBlocks() );

		this.enabledStyles = [];

		if ( !block || !editor.model.schema.isObject( block ) ) {
			value = this._prepareNewInlineElementValue( value, selection );
			this.enabledStyles = this.styles.getInlineElementsNames();

			if ( block ) {
				value = this._prepareNewBlockElementValue( value, block );
			}
		}

		this.isEnabled = this.enabledStyles.length > 0;
		this.value = this.isEnabled ? value : [];
	}

	/**
	 * TODO
	 *
	 * @param {TODO} styleName
	 */
	execute( styleName ) {
		if ( !this.enabledStyles.includes( styleName ) ) {
			/**
			 * TODO: describe
			 *
			 * @error style-command-executed-with-incorrect-style-name
			 */
			logWarning( 'style-command-executed-with-incorrect-style-name' );
			return;
		}

		const editor = this.editor;
		const model = editor.model;
		const doc = model.document;
		const selection = doc.selection;

		const selectedBlockElement = first( selection.getSelectedBlocks() );
		const definition = this.styles.getDefinitionsByName( styleName );

		if ( selectedBlockElement && definition.isBlock ) {
			this._handleStyleUpdate( definition, selectedBlockElement );
		} else {
			this._handleStyleUpdate( definition, selection );
		}
	}

	/**
	 * TODO
	 *
	 * @param {TODO} definition
	 * @param {TODO} selectable
	 */
	_handleStyleUpdate( definition, selectable ) {
		const { name, element, classes } = definition;

		if ( this.value.includes( name ) ) {
			this.htmlSupport.removeModelHtmlClass( element, classes, selectable );
		} else {
			this.htmlSupport.addModelHtmlClass( element, classes, selectable );
		}
	}

	/**
	 * TODO
	 *
	 * @param {TODO} value
	 * @param {TODO} selection
	 */
	_prepareNewInlineElementValue( value, selection ) {
		let newValue = [];

		const attributes = selection.getAttributes();

		for ( const [ attribute ] of attributes ) {
			newValue = [ ...value, ...this._getAttributeValue( attribute ) ];
		}

		return newValue;
	}

	/**
	 * TODO
	 *
	 * @param {TODO} value
	 * @param {TODO} block
	 */
	_prepareNewBlockElementValue( value, block ) {
		const availableDefinitions = this.styles.getDefinitionsByElementName( block.name );

		if ( availableDefinitions ) {
			const blockStyleNames = availableDefinitions.map( ( { name } ) => name );

			this.enabledStyles = [
				...this.enabledStyles,
				...blockStyleNames
			];
		}

		return [
			...value,
			...this._getAttributeValue( 'htmlAttributes' )
		];
	}

	/**
	 * TODO
	 *
	 * @param {TODO} attribute
	 */
	_getAttributeValue( attribute ) {
		const value = [];
		const classes = attribute === 'htmlAttributes' ?
			this._getValueFromBlockElement() :
			this._getValueFromFirstAllowedNode( attribute );

		for ( const htmlClass of classes ) {
			const { name } = this.styles.getDefinitionsByClassName( htmlClass ) || {};

			value.push( name );
		}

		return value;
	}

	/**
	 * TODO
	 */
	_getValueFromBlockElement() {
		const selection = this.editor.model.document.selection;
		const block = first( selection.getSelectedBlocks() );
		const attributes = block.getAttribute( 'htmlAttributes' );

		if ( attributes ) {
			return attributes.classes;
		}

		return [];
	}

	/**
	 * TODO
	 *
	 * @param {TODO} attributeName
	 */
	_getValueFromFirstAllowedNode( attributeName ) {
		const model = this.editor.model;
		const selection = model.document.selection;

		if ( selection.isCollapsed ) {
			const { classes } = selection.getAttribute( attributeName );
			return classes;
		}

		for ( const range of selection.getRanges() ) {
			for ( const item of range.getItems() ) {
				const { classes } = item.getAttribute( attributeName );
				return classes;
			}
		}
	}
}
