/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module TODO
 */

import { Command } from 'ckeditor5/src/core';
import { first } from 'ckeditor5/src/utils';

function addClass( writer, elementOrSelection ) {
	writer.setAttribute( 'htmlAttributes', { classes: [ 'red-heading', 'large-heading' ] }, elementOrSelection );
}

function removeClass( writer, elementOrSelection ) {
	writer.setAttribute( 'htmlAttributes', { classes: [ 'red-heading' ] }, elementOrSelection );
}

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
		this.set( 'enabledStyles', [] );

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
		const isInline = !selection.getSelectedElement();

		this.enabledStyles = [];

		if ( isInline ) {
			value = this._prepareNewInlineElementValue( value, selection );
			this.enabledStyles = this.styles.getInlineElementsNames();
		}

		if ( block ) {
			value = this._prepareNewBlockElementValue( value, block );
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
		// TODO: error message.
		if ( !this.enabledStyles.includes( styleName ) ) {
			return;
		}

		const editor = this.editor;
		const model = editor.model;
		const doc = model.document;
		const selection = doc.selection;

		model.change( writer => {
			const selectedBlockElement = this._getSelectedBlockElement( selection );
			const definition = this.styles.getDefinitionsByName( styleName );
			const { classes, modelElements } = definition;
			const data = { writer, styleName, classes };

			if ( selectedBlockElement ) {
				this._handleClasses( data, selectedBlockElement );
				return;
			}

			if ( selection.isCollapsed ) {
				this._handleClasses( data, selection );
				return;
			}

			const attributeElement = modelElements.find( attributeName => attributeName.startsWith( 'html' ) );
			const ranges = model.schema.getValidRanges( selection.getRanges(), attributeElement );
			this._handleClasses( data, ranges );
		} );
	}

	/**
	 * TODO
	 *
	 * @param {TODO} data
	 * @param {TODO} selectable
	 */
	_handleClasses( data, selectable ) {
		const { writer, styleName, classes } = data;

		if ( this.value.includes( styleName ) ) {
			removeClass( writer, selectable, classes );
		} else {
			addClass( writer, selectable, classes );
		}
	}

	/**
	 * TODO
	 *
	 * @param {TODO} selection
	 */
	_getSelectedBlockElement( selection ) {
		const isInline = !selection.getSelectedElement();

		if ( isInline ) {
			return first( selection.getSelectedBlocks() );
		}

		return selection.getSelectedElement();
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

		if ( !classes ) {
			return value;
		}

		for ( const htmlClass of classes ) {
			const { name } = this.styles.getDefinitionsByClassName( htmlClass );

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
		const schema = model.schema;
		const selection = model.document.selection;

		if ( selection.isCollapsed ) {
			const attribute = selection.getAttribute( attributeName );

			if ( attribute && Object.prototype.hasOwnProperty.call( attribute, 'classes' ) ) {
				return attribute.classes;
			}
		}

		for ( const range of selection.getRanges() ) {
			for ( const item of range.getItems() ) {
				if ( schema.checkAttribute( item, attributeName ) ) {
					const { classes } = item.getAttribute( attributeName ) || {};

					if ( classes ) {
						return classes;
					}
				}
			}
		}

		return [];
	}
}
