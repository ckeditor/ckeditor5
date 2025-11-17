/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablecellproperties/tablecellpropertiesediting
 */

import { type Editor, Plugin } from 'ckeditor5/src/core.js';
import {
	addBorderStylesRules,
	addPaddingStylesRules,
	addBackgroundStylesRules,
	type ModelSchema,
	type Conversion,
	type ViewElement,
	type UpcastConversionApi,
	type UpcastConversionData,
	type UpcastElementEvent
} from 'ckeditor5/src/engine.js';

import { downcastAttributeToStyle, getDefaultValueAdjusted, upcastBorderStyles } from '../converters/tableproperties.js';
import { TableEditing } from './../tableediting.js';
import { TableCellWidthEditing } from '../tablecellwidth/tablecellwidthediting.js';
import { TableCellPaddingCommand } from './commands/tablecellpaddingcommand.js';
import { TableCellHeightCommand } from './commands/tablecellheightcommand.js';
import { TableCellBackgroundColorCommand } from './commands/tablecellbackgroundcolorcommand.js';
import { TableCellVerticalAlignmentCommand } from './commands/tablecellverticalalignmentcommand.js';
import { TableCellHorizontalAlignmentCommand } from './commands/tablecellhorizontalalignmentcommand.js';
import { TableCellBorderStyleCommand } from './commands/tablecellborderstylecommand.js';
import { TableCellBorderColorCommand } from './commands/tablecellbordercolorcommand.js';
import { TableCellBorderWidthCommand } from './commands/tablecellborderwidthcommand.js';
import { TableCellTypeCommand } from './commands/tablecelltypecommand.js';
import { getNormalizedDefaultCellProperties } from '../utils/table-properties.js';
import { enableProperty } from '../utils/common.js';
import { TableWalker } from '../tablewalker.js';

const VALIGN_VALUES_REG_EXP = /^(top|middle|bottom)$/;
const ALIGN_VALUES_REG_EXP = /^(left|center|right|justify)$/;

/**
 * The table cell properties editing feature.
 *
 * Introduces table cell model attributes and their conversion:
 *
 * - border: `tableCellBorderStyle`, `tableCellBorderColor` and `tableCellBorderWidth`
 * - background color: `tableCellBackgroundColor`
 * - cell padding: `tableCellPadding`
 * - horizontal and vertical alignment: `tableCellHorizontalAlignment`, `tableCellVerticalAlignment`
 * - cell width and height: `tableCellWidth`, `tableCellHeight`
 *
 * It also registers commands used to manipulate the above attributes:
 *
 * - border: the `'tableCellBorderStyle'`, `'tableCellBorderColor'` and `'tableCellBorderWidth'` commands
 * - background color: the `'tableCellBackgroundColor'` command
 * - cell padding: the `'tableCellPadding'` command
 * - horizontal and vertical alignment: the `'tableCellHorizontalAlignment'` and `'tableCellVerticalAlignment'` commands
 * - width and height: the `'tableCellWidth'` and `'tableCellHeight'` commands
 */
export class TableCellPropertiesEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TableCellPropertiesEditing' as const;
	}

	/**
	 * @inheritDoc
	 * @internal
	 */
	public static get licenseFeatureCode(): string {
		return 'TCP';
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isPremiumPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ TableEditing, TableCellWidthEditing ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const schema = editor.model.schema;
		const conversion = editor.conversion;

		editor.config.define( 'table.tableCellProperties.defaultProperties', { } );

		const defaultTableCellProperties = getNormalizedDefaultCellProperties(
			editor.config.get( 'table.tableCellProperties.defaultProperties' )!,
			{
				includeVerticalAlignmentProperty: true,
				includeHorizontalAlignmentProperty: true,
				includePaddingProperty: true,
				isRightToLeftContent: editor.locale.contentLanguageDirection === 'rtl'
			}
		);

		editor.data.addStyleProcessorRules( addBorderStylesRules );
		enableBorderProperties( editor, {
			color: defaultTableCellProperties.borderColor,
			style: defaultTableCellProperties.borderStyle,
			width: defaultTableCellProperties.borderWidth
		} );
		editor.commands.add( 'tableCellBorderStyle', new TableCellBorderStyleCommand( editor, defaultTableCellProperties.borderStyle ) );
		editor.commands.add( 'tableCellBorderColor', new TableCellBorderColorCommand( editor, defaultTableCellProperties.borderColor ) );
		editor.commands.add( 'tableCellBorderWidth', new TableCellBorderWidthCommand( editor, defaultTableCellProperties.borderWidth ) );

		enableProperty( schema, conversion, {
			modelAttribute: 'tableCellHeight',
			styleName: 'height',
			attributeName: 'height',
			attributeType: 'length',
			defaultValue: defaultTableCellProperties.height
		} );
		editor.commands.add( 'tableCellHeight', new TableCellHeightCommand( editor, defaultTableCellProperties.height ) );

		editor.data.addStyleProcessorRules( addPaddingStylesRules );
		enableProperty( schema, conversion, {
			modelAttribute: 'tableCellPadding',
			styleName: 'padding',
			reduceBoxSides: true,
			defaultValue: defaultTableCellProperties.padding!
		} );
		editor.commands.add( 'tableCellPadding', new TableCellPaddingCommand( editor, defaultTableCellProperties.padding! ) );

		editor.data.addStyleProcessorRules( addBackgroundStylesRules );
		enableProperty( schema, conversion, {
			modelAttribute: 'tableCellBackgroundColor',
			styleName: 'background-color',
			attributeName: 'bgcolor',
			attributeType: 'color',
			defaultValue: defaultTableCellProperties.backgroundColor
		} );
		editor.commands.add(
			'tableCellBackgroundColor',
			new TableCellBackgroundColorCommand( editor, defaultTableCellProperties.backgroundColor )
		);

		enableHorizontalAlignmentProperty( schema, conversion, defaultTableCellProperties.horizontalAlignment! );
		editor.commands.add(
			'tableCellHorizontalAlignment',
			new TableCellHorizontalAlignmentCommand( editor, defaultTableCellProperties.horizontalAlignment! )
		);

		enableVerticalAlignmentProperty( schema, conversion, defaultTableCellProperties.verticalAlignment! );
		editor.commands.add(
			'tableCellVerticalAlignment',
			new TableCellVerticalAlignmentCommand( editor, defaultTableCellProperties.verticalAlignment! )
		);

		enableCellTypeProperty( editor );
		editor.commands.add( 'tableCellType', new TableCellTypeCommand( editor ) );

		addTableCellTypePostfixer( editor );
		addInsertedTableCellTypePostfixer( editor );
		addTableCellTypeReconversionHandler( editor );
	}
}

/**
 * Enables the `'tableCellType'` attribute for table cells that switches between `<td>` and `<th>`.
 *
 * @param editor The editor instance.
 */
function enableCellTypeProperty( editor: Editor ) {
	const { conversion } = editor;
	const { schema } = editor.model;
	const tableEditing = editor.plugins.get( TableEditing );

	schema.extend( 'tableCell', {
		allowAttributes: [ 'tableCellType' ]
	} );

	schema.setAttributeProperties( 'tableCellType', {
		isFormatting: true
	} );

	conversion.for( 'upcast' ).add( dispatcher => dispatcher.on<UpcastElementEvent>( 'element', ( evt, data, conversionApi ) => {
		const { writer } = conversionApi;
		const { viewItem, modelRange } = data;

		if ( !viewItem.is( 'element', 'td' ) && !viewItem.is( 'element', 'th' ) ) {
			return;
		}

		const modelElement = modelRange?.start.nodeAfter;

		if ( modelElement && modelElement.is( 'element', 'tableCell' ) ) {
			const cellType = viewItem.name === 'th' ? 'header' : 'data';

			writer.setAttribute( 'tableCellType', cellType, modelElement );
		}
	} ) );

	conversion.for( 'upcast' ).add( dispatcher => dispatcher.on<UpcastElementEvent>( 'element:table', ( evt, data, conversionApi ) => {
		const { writer } = conversionApi;
		const { modelRange } = data;

		const table = modelRange?.start?.nodeAfter;

		if ( !table?.is( 'element', 'table' ) ) {
			return;
		}

		const headingRows = table.getAttribute( 'headingRows' ) as number;
		const headingColumns = table.getAttribute( 'headingColumns' ) as number || 0;
		const tableWalker = new TableWalker( table );

		if ( headingRows + headingColumns === 0 ) {
			return;
		}

		for ( const { cell, row, column } of tableWalker ) {
			if ( row < headingRows || column < headingColumns ) {
				writer.setAttribute( 'tableCellType', 'header', cell );
			}
		}
	} ) );

	tableEditing.registerCellElementNameCallback( ( { tableCell } ) => {
		const cellType = tableCell.getAttribute( 'tableCellType' )!;

		return cellType === 'header' ? 'th' : 'td';
	} );
}

/**
 * Adds a postfixer that updates `tableCellType` attribute when `headingRows` or `headingColumns` attributes change on a table.
 *
 * @param editor The editor instance.
 */
function addTableCellTypePostfixer( editor: Editor ) {
	const model = editor.model;

	model.document.registerPostFixer( writer => {
		let changed = false;

		for ( const change of model.document.differ.getChanges() ) {
			// Check if headingRows or headingColumns attribute changed on a table.
			if ( change.type !== 'attribute' || change.range.root.rootName === '$graveyard' ) {
				continue;
			}

			const element = change.range.start.nodeAfter;

			if ( !element?.is( 'element', 'table' ) ) {
				continue;
			}

			if ( change.attributeKey !== 'headingRows' && change.attributeKey !== 'headingColumns' ) {
				continue;
			}

			const oldValue = change.attributeOldValue as number || 0;
			const headingRows = element.getAttribute( 'headingRows' ) as number || 0;
			const headingColumns = element.getAttribute( 'headingColumns' ) as number || 0;

			const tableWalker = new TableWalker( element );

			for ( const { cell, row, column } of tableWalker ) {
				// Determine if this cell's status changed based on the old and new values.
				let wasInHeadingSection;

				if ( change.attributeKey === 'headingRows' ) {
					// Check old headingRows value with current headingColumns.
					wasInHeadingSection = row < oldValue || column < headingColumns;
				} else {
					// Check current headingRows with old headingColumns value.
					wasInHeadingSection = row < headingRows || column < oldValue;
				}

				const isInHeadingSection = row < headingRows || column < headingColumns;

				// Only update cells whose heading status actually changed.
				if ( wasInHeadingSection !== isInHeadingSection ) {
					const expectedCellType = isInHeadingSection ? 'header' : 'data';
					const currentCellType = cell.getAttribute( 'tableCellType' );

					if ( currentCellType !== expectedCellType ) {
						writer.setAttribute( 'tableCellType', expectedCellType, cell );
						changed = true;
					}
				}
			}
		}

		return changed;
	} );
}

/**
 * Adds a postfixer that ensures newly inserted `tableCell` elements have the `tableCellType` attribute set.
 *
 * @param editor The editor instance.
 */
function addInsertedTableCellTypePostfixer( editor: Editor ) {
	const model = editor.model;

	model.document.registerPostFixer( writer => {
		let changed = false;

		for ( const change of model.document.differ.getChanges() ) {
			// Check if something was inserted.
			if ( change.type !== 'insert' || change.name === '$text' || change.position.root.rootName === '$graveyard' ) {
				continue;
			}

			if ( !change.position.nodeAfter ) {
				continue;
			}

			// Create a range over the inserted element to find all tableCell elements within.
			const range = model.createRangeOn( change.position.nodeAfter );

			for ( const item of range.getItems() ) {
				if ( !item.is( 'element', 'tableCell' ) ) {
					continue;
				}

				// Check if the tableCell already has tableCellType attribute.
				if ( item.hasAttribute( 'tableCellType' ) ) {
					continue;
				}

				// Find the parent table to determine heading rows and columns.
				const table = item.findAncestor( 'table' );

				if ( !table ) {
					continue;
				}

				const headingRows = table.getAttribute( 'headingRows' ) as number || 0;
				const headingColumns = table.getAttribute( 'headingColumns' ) as number || 0;

				// Determine the position of the cell in the table.
				const tableWalker = new TableWalker( table );
				let cellRow = 0;
				let cellColumn = 0;

				for ( const { cell, row, column } of tableWalker ) {
					if ( cell === item ) {
						cellRow = row;
						cellColumn = column;
						break;
					}
				}

				// Determine the cell type based on its position.
				const cellType = ( cellRow < headingRows || cellColumn < headingColumns ) ? 'header' : 'data';

				writer.setAttribute( 'tableCellType', cellType, item );
				changed = true;
			}
		}

		return changed;
	} );
}

/**
 * Adds a handler that forces reconversion of table cells when their `tableCellType` attribute changes.
 * This is necessary because changing from `<td>` to `<th>` (or vice versa) requires rebuilding the element.
 *
 * @param editor The editor instance.
 */
function addTableCellTypeReconversionHandler( editor: Editor ) {
	const model = editor.model;
	const editing = editor.editing;

	model.document.on( 'change:data', () => {
		const differ = model.document.differ;

		for ( const change of differ.getChanges() ) {
			// Only process attribute changes.
			if ( change.type !== 'attribute' ) {
				continue;
			}

			// Check if tableCellType attribute changed.
			if ( change.attributeKey !== 'tableCellType' ) {
				continue;
			}

			// Get the table cell element.
			const tableCell = change.range.start.nodeAfter;

			if ( !tableCell || !tableCell.is( 'element', 'tableCell' ) ) {
				continue;
			}

			// Get the view element for this table cell.
			const viewElement = editing.mapper.toViewElement( tableCell );

			if ( !viewElement || !viewElement.is( 'element' ) ) {
				continue;
			}

			// Determine the expected element name based on the new attribute value.
			const cellType = tableCell.getAttribute( 'tableCellType' );
			const expectedElementName = cellType === 'header' ? 'th' : 'td';

			// Only reconvert if the element name actually needs to change.
			if ( viewElement.name !== expectedElementName ) {
				editing.reconvertItem( tableCell );
			}
		}
	} );
}

/**
 * Enables the `'tableCellBorderStyle'`, `'tableCellBorderColor'` and `'tableCellBorderWidth'` attributes for table cells.
 *
 * @param editor The editor instance.
 * @param defaultBorder The default border values.
 * @param defaultBorder.color The default `tableCellBorderColor` value.
 * @param defaultBorder.style The default `tableCellBorderStyle` value.
 * @param defaultBorder.width The default `tableCellBorderWidth` value.
 */
function enableBorderProperties(
	editor: Editor,
	defaultBorder: { color: string; style: string; width: string }
) {
	const { conversion } = editor;
	const { schema } = editor.model;

	const modelAttributes = {
		width: 'tableCellBorderWidth',
		color: 'tableCellBorderColor',
		style: 'tableCellBorderStyle'
	};

	schema.extend( 'tableCell', {
		allowAttributes: Object.values( modelAttributes )
	} );

	for ( const modelAttribute of Object.values( modelAttributes ) ) {
		schema.setAttributeProperties( modelAttribute, { isFormatting: true } );
	}

	upcastBorderStyles( editor, 'td', modelAttributes, defaultBorder );
	upcastBorderStyles( editor, 'th', modelAttributes, defaultBorder );
	downcastAttributeToStyle( conversion, { modelElement: 'tableCell', modelAttribute: modelAttributes.style, styleName: 'border-style' } );
	downcastAttributeToStyle( conversion, { modelElement: 'tableCell', modelAttribute: modelAttributes.color, styleName: 'border-color' } );
	downcastAttributeToStyle( conversion, { modelElement: 'tableCell', modelAttribute: modelAttributes.width, styleName: 'border-width' } );
}

/**
 * Enables the `'tableCellHorizontalAlignment'` attribute for table cells.
 *
 * @param defaultValue The default horizontal alignment value.
 */
function enableHorizontalAlignmentProperty( schema: ModelSchema, conversion: Conversion, defaultValue: string ) {
	schema.extend( 'tableCell', {
		allowAttributes: [ 'tableCellHorizontalAlignment' ]
	} );

	schema.setAttributeProperties( 'tableCellHorizontalAlignment', { isFormatting: true } );

	conversion.for( 'downcast' )
		.attributeToAttribute( {
			model: {
				name: 'tableCell',
				key: 'tableCellHorizontalAlignment'
			},
			view: alignment => ( {
				key: 'style',
				value: {
					'text-align': alignment
				}
			} )
		} );

	conversion.for( 'upcast' )
		// Support for the `text-align:*;` CSS definition for the table cell alignment.
		.attributeToAttribute( {
			view: {
				name: /^(td|th)$/,
				styles: {
					'text-align': ALIGN_VALUES_REG_EXP
				}
			},
			model: {
				key: 'tableCellHorizontalAlignment',
				value: ( viewElement: ViewElement, conversionApi: UpcastConversionApi, data: UpcastConversionData<ViewElement> ) => {
					const localDefaultValue = getDefaultValueAdjusted( defaultValue, 'left', data );
					const align = viewElement.getStyle( 'text-align' );

					if ( align !== localDefaultValue ) {
						return align;
					}

					// Consume the style even if not applied to the element so it won't be processed by other converters.
					conversionApi.consumable.consume( viewElement, { styles: 'text-align' } );
				}
			}
		} )
		// Support for the `align` attribute as the backward compatibility while pasting from other sources.
		.attributeToAttribute( {
			view: {
				name: /^(td|th)$/,
				attributes: {
					align: ALIGN_VALUES_REG_EXP
				}
			},
			model: {
				key: 'tableCellHorizontalAlignment',
				value: ( viewElement: ViewElement, conversionApi: UpcastConversionApi, data: UpcastConversionData<ViewElement> ) => {
					const localDefaultValue = getDefaultValueAdjusted( defaultValue, 'left', data );
					const align = viewElement.getAttribute( 'align' );

					if ( align !== localDefaultValue ) {
						return align;
					}

					// Consume the style even if not applied to the element so it won't be processed by other converters.
					conversionApi.consumable.consume( viewElement, { attributes: 'align' } );
				}
			}
		} );
}

/**
 * Enables the `'verticalAlignment'` attribute for table cells.
 *
 * @param defaultValue The default vertical alignment value.
 */
function enableVerticalAlignmentProperty( schema: ModelSchema, conversion: Conversion, defaultValue: string ) {
	schema.extend( 'tableCell', {
		allowAttributes: [ 'tableCellVerticalAlignment' ]
	} );

	schema.setAttributeProperties( 'tableCellVerticalAlignment', { isFormatting: true } );

	conversion.for( 'downcast' )
		.attributeToAttribute( {
			model: {
				name: 'tableCell',
				key: 'tableCellVerticalAlignment'
			},
			view: alignment => ( {
				key: 'style',
				value: {
					'vertical-align': alignment
				}
			} )
		} );

	conversion.for( 'upcast' )
		// Support for the `vertical-align:*;` CSS definition for the table cell alignment.
		.attributeToAttribute( {
			view: {
				name: /^(td|th)$/,
				styles: {
					'vertical-align': VALIGN_VALUES_REG_EXP
				}
			},
			model: {
				key: 'tableCellVerticalAlignment',
				value: ( viewElement: ViewElement, conversionApi: UpcastConversionApi, data: UpcastConversionData<ViewElement> ) => {
					const localDefaultValue = getDefaultValueAdjusted( defaultValue, 'middle', data );
					const align = viewElement.getStyle( 'vertical-align' );

					if ( align !== localDefaultValue ) {
						return align;
					}

					// Consume the style even if not applied to the element so it won't be processed by other converters.
					conversionApi.consumable.consume( viewElement, { styles: 'vertical-align' } );
				}
			}
		} )
		// Support for the `align` attribute as the backward compatibility while pasting from other sources.
		.attributeToAttribute( {
			view: {
				name: /^(td|th)$/,
				attributes: {
					valign: VALIGN_VALUES_REG_EXP
				}
			},
			model: {
				key: 'tableCellVerticalAlignment',
				value: ( viewElement: ViewElement, conversionApi: UpcastConversionApi, data: UpcastConversionData<ViewElement> ) => {
					const localDefaultValue = getDefaultValueAdjusted( defaultValue, 'middle', data );
					const valign = viewElement.getAttribute( 'valign' );

					if ( valign !== localDefaultValue ) {
						return valign;
					}

					// Consume the attribute even if not applied to the element so it won't be processed by other converters.
					conversionApi.consumable.consume( viewElement, { attributes: 'valign' } );
				}
			}
		} );
}
