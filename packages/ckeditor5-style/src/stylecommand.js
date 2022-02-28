/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module TODO
 */

import { Command } from 'ckeditor5/src/core';
import { normalizeConfig } from './utils';
import { first } from 'ckeditor5/src/utils';

/**
 * TODO
 *
 * @extends module:core/command~Command
 */
export default class StyleCommand extends Command {
	constructor( editor, stylesMap ) {
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
		this.stylesMap = stylesMap;

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
		const dataSchema = editor.plugins.get( 'DataSchema' );
		const normalizedStyleDefinitions = normalizeConfig( dataSchema, editor.config.get( 'style.definitions' ) );
		const selection = editor.model.document.selection;
		const block = first( selection.getSelectedBlocks() );
		const isInline = !selection.getSelectedElement();

		this.enabledStyles = [];

		if ( isInline ) {
			const inlineStylesNames = normalizedStyleDefinitions.inline.map( ( { name } ) => name );

			this.enabledStyles = [ ...this.enabledStyles, ...inlineStylesNames ];

			const attributes = selection.getAttributes();

			for ( const [ attribute ] of attributes ) {
				value = [ ...value, ...this._getValue( attribute ) ];
			}
		}

		if ( block ) {
			const availableDefinitions = this.stylesMap.get( 'elementToDefinition' ).get( block.name );

			if ( availableDefinitions ) {
				const blockStyleNames = availableDefinitions.map( ( { name } ) => name );

				this.enabledStyles = [ ...this.enabledStyles, ...blockStyleNames ];
			}

			value = [ ...value, ...this._getValue( 'htmlAttributes' ) ];
		}

		this.isEnabled = this.enabledStyles.length > 0;
		this.value = this.isEnabled ? value : [];
	}

	/**
	 * TODO
	 *
	 * @param {TODO} definition
	 */
	execute( definition ) {
		const editor = this.editor;
		const model = editor.model;
		const doc = model.document;
		const selection = doc.selection;
		const value = definition.classes.join( ' ' );
		const isBlock = definition.isBlock;
		const block = first( selection.getSelectedBlocks() );

		if ( !this.isEnabled ) {
			return;
		}

		model.change( writer => {
			let selectedElement = selection.getSelectedElement();

			if ( isBlock ) {
				selectedElement = block;
			}

			if ( selectedElement ) {
				writer.setAttribute( 'htmlAttributes', {
					classes: this._mergeElementClasses( value, selectedElement )
				}, selectedElement );

				return;
			}

			const { modelElements } = definition;
			const attributeElement = modelElements.find( attributeName =>
				attributeName.startsWith( 'html' )
			);

			if ( selection.isCollapsed ) {
				if ( value ) {
					writer.setSelectionAttribute( attributeElement, {
						classes: this._mergeCollapsedSelectionClasses(
							value,
							attributeElement,
							selection
						)
					} );
				} else {
					writer.removeSelectionAttribute( attributeElement );
				}
			} else {
				const ranges = model.schema.getValidRanges(
					selection.getRanges(),
					attributeElement
				);

				for ( const range of ranges ) {
					if ( value ) {
						for ( const item of range.getItems() ) {
							writer.setAttribute( attributeElement, {
								classes: this._mergeRangeItemClasses(
									value,
									attributeElement,
									item
								)
							}, item );
						}
					} else {
						writer.removeAttribute( attributeElement, range );
					}
				}
			}
		} );
	}

	/**
	 * TODO
	 *
	 * @param {TODO} attribute
	 */
	_getValue( attribute ) {
		const value = [];
		const classes =
			attribute === 'htmlAttributes' ?
				this._getValueFromBlockElement() :
				this._getValueFromFirstAllowedNode( attribute );

		if ( !classes ) {
			return value;
		}

		for ( const htmlClass of classes ) {
			const { name } = this.stylesMap.get( 'classToDefinition' ).get( htmlClass );

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

	/**
	 * TODO
	 *
	 * @param {TODO} value
	 * @param {TODO} element
	 */
	_mergeElementClasses( value, element ) {
		const styleClasses = [ value ];

		const { classes } = element.getAttribute( 'htmlAttributes' ) || {};

		if ( Array.isArray( classes ) ) {
			styleClasses.push( ...classes );
		}

		return styleClasses;
	}

	/**
	 * TODO
	 *
	 * @param {TODO} value
	 * @param {TODO} attributeElement
	 * @param {TODO} selection
	 */
	_mergeCollapsedSelectionClasses( value, attributeElement, selection ) {
		const styleClasses = [ value ];

		const { classes } = selection.getAttribute( attributeElement ) || {};

		if ( Array.isArray( classes ) ) {
			styleClasses.push( ...classes );
		}

		return styleClasses;
	}

	/**
	 * TODO
	 *
	 * @param {TODO} value
	 * @param {TODO} item
	 * @param {TODO} attributeElement
	 */
	_mergeRangeItemClasses( value, attributeElement, item ) {
		const styleClasses = [ value ];

		const { classes } = item.getAttribute( attributeElement ) || {};

		if ( Array.isArray( classes ) ) {
			styleClasses.push( ...classes );
		}

		return styleClasses;
	}
}
