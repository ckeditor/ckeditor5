/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablecellproperties/tablecellpropertiesediting
 */

import { priorities } from 'ckeditor5/src/utils.js';
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
	type UpcastElementEvent,
	type ModelElement
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
import { TableCellTypeCommand, updateTablesHeadingAttributes } from './commands/tablecelltypecommand.js';
import { getNormalizedDefaultCellProperties } from '../utils/table-properties.js';
import { enableProperty } from '../utils/common.js';
import { TableUtils } from '../tableutils.js';
import { TableWalker } from '../tablewalker.js';
import { isTableHeaderCellType, type TableCellType } from './tablecellpropertiesutils.js';

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
	}
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

/**
 * Enables the `tableCellType` attribute for table cells.
 */
function enableCellTypeProperty( editor: Editor ) {
	const { model, conversion, editing, config } = editor;
	const { schema } = model;

	const scopedHeaders = !!config.get( 'table.tableCellProperties.scopedHeaders' );
	const tableUtils = editor.plugins.get( TableUtils );

	schema.extend( 'tableCell', {
		allowAttributes: [ 'tableCellType' ]
	} );

	schema.setAttributeProperties( 'tableCellType', {
		isFormatting: true
	} );

	// Upcast conversion for td/th elements.
	conversion.for( 'upcast' ).add( dispatcher => {
		dispatcher.on<UpcastElementEvent>( 'element:th', ( evt, data, conversionApi ) => {
			const { writer } = conversionApi;
			const { modelRange } = data;
			const modelElement = modelRange?.start.nodeAfter;

			if ( modelElement?.is( 'element', 'tableCell' ) && !modelElement.hasAttribute( 'tableCellType' ) ) {
				writer.setAttribute( 'tableCellType', 'header', modelElement );
			}
		} );

		// Table type is examined after all other cell converters, on low priority, so
		// we double check if there is any `th` left in the table. If so, the table is converted to a content table.
		dispatcher.on<UpcastElementEvent>( 'element:table', ( evt, data, conversionApi ) => {
			const { writer } = conversionApi;
			const { modelRange } = data;
			const modelElement = modelRange?.start.nodeAfter;

			if ( modelElement?.is( 'element', 'table' ) && modelElement.getAttribute( 'tableType' ) === 'layout' ) {
				for ( const { cell } of new TableWalker( modelElement ) ) {
					const tableCellType = cell.getAttribute( 'tableCellType' ) as TableCellType;

					if ( isTableHeaderCellType( tableCellType ) ) {
						writer.setAttribute( 'tableType', 'content', modelElement );
						break;
					}
				}
			}
		}, { priority: priorities.low - 1 } );
	} );

	// If scoped headers are enabled, add conversion for the `scope` attribute.
	if ( scopedHeaders ) {
		conversion.for( 'downcast' ).attributeToAttribute( {
			model: {
				name: 'tableCell',
				key: 'tableCellType'
			},
			view: ( modelAttributeValue: TableCellType ) => {
				switch ( modelAttributeValue ) {
					case 'header-row':
						return { key: 'scope', value: 'row' };

					case 'header-column':
						return { key: 'scope', value: 'col' };
				}
			}
		} );

		// Attribute to attribute conversion tend to not override existing `tableCellType` set by other converters.
		// However, in this scenario if the previous converter set `tableCellType` to `header`, we can adjust it
		// based on the `scope` attribute.
		conversion.for( 'upcast' ).add( dispatcher => {
			dispatcher.on<UpcastElementEvent>( 'element:th', ( _, data, conversionApi ) => {
				const { writer, consumable } = conversionApi;
				const { viewItem, modelRange } = data;

				const modelElement = modelRange!.start.nodeAfter!;
				const previousTableCellType = modelElement?.getAttribute( 'tableCellType' ) as TableCellType | undefined;

				if ( previousTableCellType === 'header' && consumable.consume( viewItem, { attributes: [ 'scope' ] } ) ) {
					const scope = viewItem.getAttribute( 'scope' );

					switch ( scope ) {
						case 'row':
							writer.setAttribute( 'tableCellType', 'header-row', modelElement );
							break;

						case 'col':
							writer.setAttribute( 'tableCellType', 'header-column', modelElement );
							break;
					}
				}
			} );
		} );
	}

	// Registers a post-fixer that ensures the `headingRows` and `headingColumns` attributes
	// are consistent with the `tableCellType` attribute of the cells. `tableCellType` has priority
	// over `headingRows` and `headingColumns` and we use it to adjust the heading sections of the table.
	model.document.registerPostFixer( writer => {
		// 1. Collect all tables that need to be checked.
		const changes = model.document.differ.getChanges();
		const tablesToCheck = new Set<ModelElement>();

		for ( const change of changes ) {
			// Check if headingRows or headingColumns changed.
			if ( change.type === 'attribute' && ( change.attributeKey === 'headingRows' || change.attributeKey === 'headingColumns' ) ) {
				const table = change.range.start.nodeAfter as ModelElement;

				if ( table?.is( 'element', 'table' ) && table.root.rootName !== '$graveyard' ) {
					tablesToCheck.add( table );
				}
			}

			// Check if tableCellType changed.
			if ( change.type === 'attribute' && change.attributeKey === 'tableCellType' ) {
				const cell = change.range.start.nodeAfter as ModelElement;

				if ( cell?.is( 'element', 'tableCell' ) && cell.root.rootName !== '$graveyard' ) {
					const table = cell.findAncestor( 'table' ) as ModelElement;

					if ( table ) {
						tablesToCheck.add( table );
					}
				}
			}

			// Check if new headers were inserted.
			if ( change.type === 'insert' && change.position.nodeAfter ) {
				for ( const { item } of model.createRangeOn( change.position.nodeAfter ) ) {
					if (
						item.is( 'element', 'tableCell' ) &&
						item.getAttribute( 'tableCellType' ) &&
						item.root.rootName !== '$graveyard'
					) {
						const table = item.findAncestor( 'table' ) as ModelElement;

						if ( table ) {
							tablesToCheck.add( table );
						}
					}
				}
			}
		}

		// 2. Update the attributes of the collected tables.
		return updateTablesHeadingAttributes( tableUtils, writer, tablesToCheck );
	} );

	// Refresh the table cells in the editing view when their `tableCellType` attribute changes.
	model.document.on( 'change:data', () => {
		const { differ } = model.document;
		const cellsToReconvert = new Set<ModelElement>();

		for ( const change of differ.getChanges() ) {
			// If the `tableCellType` attribute changed, the entire cell needs to be re-rendered.
			if ( change.type === 'attribute' && change.attributeKey === 'tableCellType' ) {
				const tableCell = change.range.start.nodeAfter as ModelElement;

				if ( tableCell.is( 'element', 'tableCell' ) ) {
					cellsToReconvert.add( tableCell );
				}
			}
		}

		// Reconvert table cells that had their `tableCellType` attribute changed.
		for ( const tableCell of cellsToReconvert ) {
			const viewElement = editing.mapper.toViewElement( tableCell );
			const cellType = tableCell.getAttribute( 'tableCellType' ) as TableCellType;
			const expectedElementName = isTableHeaderCellType( cellType ) ? 'th' : 'td';

			if ( viewElement?.name !== expectedElementName ) {
				editing.reconvertItem( tableCell );
			}
		}
	} );
}
