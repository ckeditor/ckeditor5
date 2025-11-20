/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tableproperties/tablepropertiesediting
 */

import { type Editor, Plugin } from 'ckeditor5/src/core.js';
import {
	addBackgroundStylesRules,
	addBorderStylesRules,
	addMarginStylesRules,
	type ViewElement,
	type ViewItem,
	type Conversion,
	type ModelSchema,
	type ModelElement,
	type UpcastConversionApi,
	type UpcastConversionData,
	type UpcastDispatcher,
	type UpcastElementEvent,
	type ViewDowncastWriter
} from 'ckeditor5/src/engine.js';
import { first } from 'ckeditor5/src/utils.js';
import type { ViewDocumentClipboardOutputEvent } from 'ckeditor5/src/clipboard.js';

import { TableEditing } from '../tableediting.js';
import {
	downcastAttributeToStyle,
	downcastTableAttribute,
	getDefaultValueAdjusted,
	upcastBorderStyles,
	upcastStyleToAttribute,
	upcastTableAlignmentConfig,
	DEFAULT_TABLE_ALIGNMENT_OPTIONS
} from '../converters/tableproperties.js';
import { TableBackgroundColorCommand } from './commands/tablebackgroundcolorcommand.js';
import { TableBorderColorCommand } from './commands/tablebordercolorcommand.js';
import { TableBorderStyleCommand } from './commands/tableborderstylecommand.js';
import { TableBorderWidthCommand } from './commands/tableborderwidthcommand.js';
import { TableWidthCommand } from './commands/tablewidthcommand.js';
import { TableHeightCommand } from './commands/tableheightcommand.js';
import { TableAlignmentCommand } from './commands/tablealignmentcommand.js';
import { getNormalizedDefaultTableProperties } from '../utils/table-properties.js';
import { getViewTableFromWrapper } from '../utils/structure.js';

/**
 * The table properties editing feature.
 *
 * Introduces table's model attributes and their conversion:
 *
 * - border: `tableBorderStyle`, `tableBorderColor` and `tableBorderWidth`
 * - background color: `tableBackgroundColor`
 * - horizontal alignment: `tableAlignment`
 * - width & height: `tableWidth` & `tableHeight`
 *
 * It also registers commands used to manipulate the above attributes:
 *
 * - border: `'tableBorderStyle'`, `'tableBorderColor'` and `'tableBorderWidth'` commands
 * - background color: `'tableBackgroundColor'`
 * - horizontal alignment: `'tableAlignment'`
 * - width & height: `'tableWidth'` & `'tableHeight'`
 */
export class TablePropertiesEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TablePropertiesEditing' as const;
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
		return [ TableEditing ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const schema = editor.model.schema;
		const conversion = editor.conversion;

		editor.config.define( 'table.tableProperties.defaultProperties', {} );

		const defaultTableProperties = getNormalizedDefaultTableProperties(
			editor.config.get( 'table.tableProperties.defaultProperties' )!,
			{
				includeAlignmentProperty: true
			}
		);

		const useInlineStyles = editor.config.get( 'table.tableProperties.alignment.useInlineStyles' ) !== false;

		editor.data.addStyleProcessorRules( addMarginStylesRules );
		editor.data.addStyleProcessorRules( addBorderStylesRules );
		enableBorderProperties( editor, {
			color: defaultTableProperties.borderColor,
			style: defaultTableProperties.borderStyle,
			width: defaultTableProperties.borderWidth
		} );

		editor.commands.add( 'tableBorderColor', new TableBorderColorCommand( editor, defaultTableProperties.borderColor ) );
		editor.commands.add( 'tableBorderStyle', new TableBorderStyleCommand( editor, defaultTableProperties.borderStyle ) );
		editor.commands.add( 'tableBorderWidth', new TableBorderWidthCommand( editor, defaultTableProperties.borderWidth ) );

		enableAlignmentProperty( schema, conversion, defaultTableProperties.alignment!, useInlineStyles );
		editor.commands.add( 'tableAlignment', new TableAlignmentCommand( editor, defaultTableProperties.alignment! ) );

		enableTableToFigureProperty( schema, conversion, {
			modelAttribute: 'tableWidth',
			styleName: 'width',
			attributeName: 'width',
			attributeType: 'length',
			defaultValue: defaultTableProperties.width
		} );
		editor.commands.add( 'tableWidth', new TableWidthCommand( editor, defaultTableProperties.width ) );

		enableTableToFigureProperty( schema, conversion, {
			modelAttribute: 'tableHeight',
			styleName: 'height',
			attributeName: 'height',
			attributeType: 'length',
			defaultValue: defaultTableProperties.height
		} );
		editor.commands.add( 'tableHeight', new TableHeightCommand( editor, defaultTableProperties.height ) );

		editor.data.addStyleProcessorRules( addBackgroundStylesRules );
		enableProperty( schema, conversion, {
			modelAttribute: 'tableBackgroundColor',
			styleName: 'background-color',
			attributeName: 'bgcolor',
			attributeType: 'color',
			defaultValue: defaultTableProperties.backgroundColor
		} );
		editor.commands.add(
			'tableBackgroundColor',
			new TableBackgroundColorCommand( editor, defaultTableProperties.backgroundColor )
		);

		const viewDoc = editor.editing.view.document;

		// Adjust clipboard output to wrap tables in divs if needed (for alignment).
		this.listenTo<ViewDocumentClipboardOutputEvent>( viewDoc, 'clipboardOutput', ( evt, data ) => {
			editor.editing.view.change( writer => {
				for ( const { item } of writer.createRangeIn( data.content ) ) {
					wrapInDivIfNeeded( item, writer );
				}

				data.dataTransfer.setData( 'text/html', this.editor.data.htmlProcessor.toData( data.content ) );
			} );
		}, { priority: 'lowest' } );
	}
}

/**
 * Checks whether the view element is a table and if it needs to be wrapped in a div for alignment purposes.
 * If so, it wraps it in a div and inserts it into the data content.
 */
function wrapInDivIfNeeded( viewItem: ViewItem, writer: ViewDowncastWriter ): void {
	if ( !viewItem.is( 'element', 'table' ) ) {
		return;
	}

	const alignAttribute = viewItem.getAttribute( 'align' ) as string | undefined;
	const floatAttribute = viewItem.getStyle( 'float' ) as string | undefined;
	const marginLeft = viewItem.getStyle( 'margin-left' );
	const marginRight = viewItem.getStyle( 'margin-right' );

	if (
		// Align center.
		( alignAttribute && alignAttribute === 'center' ) ||
		// Align right with text wrapping.
		( floatAttribute && floatAttribute === 'right' && alignAttribute && alignAttribute === 'right' )
	) {
		insertWrapperWithAlignment( writer, alignAttribute, viewItem );

		return;
	}

	// Align right with no text wrapping.
	if ( floatAttribute === undefined && marginLeft === 'auto' && marginRight === '0' ) {
		insertWrapperWithAlignment( writer, 'right', viewItem );
	}
}

function insertWrapperWithAlignment( writer: ViewDowncastWriter, align: string, table: ViewElement ): void {
	const position = writer.createPositionBefore( table );
	const wrapper = writer.createContainerElement( 'div', { align }, table );

	writer.insert( position, wrapper );
}

/**
 * Enables `tableBorderStyle'`, `tableBorderColor'` and `tableBorderWidth'` attributes for table.
 *
 * @param defaultBorder The default border values.
 * @param defaultBorder.color The default `tableBorderColor` value.
 * @param defaultBorder.style The default `tableBorderStyle` value.
 * @param defaultBorder.width The default `tableBorderWidth` value.
 */
function enableBorderProperties(
	editor: Editor,
	defaultBorder: { color: string; style: string; width: string }
) {
	const { conversion } = editor;
	const { schema } = editor.model;

	const modelAttributes = {
		width: 'tableBorderWidth',
		color: 'tableBorderColor',
		style: 'tableBorderStyle'
	};

	schema.extend( 'table', {
		allowAttributes: Object.values( modelAttributes )
	} );

	for ( const modelAttribute of Object.values( modelAttributes ) ) {
		schema.setAttributeProperties( modelAttribute, { isFormatting: true } );
	}

	upcastBorderStyles( editor, 'table', modelAttributes, defaultBorder );

	downcastTableAttribute( conversion, { modelAttribute: modelAttributes.color, styleName: 'border-color' } );
	downcastTableAttribute( conversion, { modelAttribute: modelAttributes.style, styleName: 'border-style' } );
	downcastTableAttribute( conversion, { modelAttribute: modelAttributes.width, styleName: 'border-width' } );
}

/**
 * Enables the `'alignment'` attribute for table.
 *
 * @param defaultValue The default alignment value.
 */
function enableAlignmentProperty( schema: ModelSchema, conversion: Conversion, defaultValue: string, useInlineStyles: boolean ) {
	schema.extend( 'table', {
		allowAttributes: [ 'tableAlignment' ]
	} );

	schema.setAttributeProperties( 'tableAlignment', { isFormatting: true } );

	conversion.for( 'downcast' )
		.attributeToAttribute( {
			model: {
				name: 'table',
				key: 'tableAlignment',
				values: [ 'left', 'center', 'right', 'blockLeft', 'blockRight' ]
			},
			view: {
				left: useInlineStyles ? {
					key: 'style',
					value: {
						float: 'left',
						'margin-right': 'var(--ck-content-table-style-spacing, 1.5em)'
					}
				} : {
					key: 'class',
					value: DEFAULT_TABLE_ALIGNMENT_OPTIONS.left.className
				},
				right: useInlineStyles ? {
					key: 'style',
					value: {
						float: 'right',
						'margin-left': 'var(--ck-content-table-style-spacing, 1.5em)'
					}
				} : {
					key: 'class',
					value: DEFAULT_TABLE_ALIGNMENT_OPTIONS.right.className
				},
				center: useInlineStyles ? {
					key: 'style',
					value: {
						'margin-left': 'auto',
						'margin-right': 'auto'
					}
				} : {
					key: 'class',
					value: DEFAULT_TABLE_ALIGNMENT_OPTIONS.center.className
				},
				blockLeft: useInlineStyles ? {
					key: 'style',
					value: {
						'margin-left': '0',
						'margin-right': 'auto'
					}
				} : {
					key: 'class',
					value: DEFAULT_TABLE_ALIGNMENT_OPTIONS.blockLeft.className
				},
				blockRight: useInlineStyles ? {
					key: 'style',
					value: {
						'margin-left': 'auto',
						'margin-right': '0'
					}
				} : {
					key: 'class',
					value: DEFAULT_TABLE_ALIGNMENT_OPTIONS.blockRight.className
				}
			},
			converterPriority: 'high'
		} );

	/**
	 * Enables upcasting of the `tableAlignment` attribute.
	 */
	upcastTableAlignmentConfig.forEach( config => {
		conversion.for( 'upcast' ).attributeToAttribute( {
			view: config.view,
			model: {
				key: 'tableAlignment',
				value: ( viewElement: ViewElement, conversionApi: UpcastConversionApi, data: UpcastConversionData<ViewElement> ) => {
					if ( isNonTableFigureElement( viewElement ) ) {
						return;
					}

					const localDefaultValue = getDefaultValueAdjusted( defaultValue, '', data );
					const align = config.getAlign( viewElement );
					const consumables = config.getConsumables( viewElement );

					conversionApi.consumable.consume( viewElement, consumables );

					if ( align !== localDefaultValue ) {
						return align;
					}
				}
			}
		} );
	} );

	conversion.for( 'upcast' ).add( upcastTableAlignedDiv( defaultValue ) );
}

/**
 * Returns a function that converts the table view representation:
 *
 * ```html
 * <div align="right"><table>...</table></div>
 * <!-- or -->
 * <div align="center"><table>...</table></div>
 * <!-- or -->
 * <div align="left"><table>...</table></div>
 * ```
 *
 * to the model representation:
 *
 * ```xml
 * <table tableAlignment="right|center|left"></table>
 * ```
 *
 * @internal
 */
export function upcastTableAlignedDiv( defaultValue: string ) {
	return ( dispatcher: UpcastDispatcher ): void => {
		dispatcher.on<UpcastElementEvent>( 'element:div', ( evt, data, conversionApi ) => {
			// Do not convert if this is not a "table wrapped in div with align attribute".
			if ( !conversionApi.consumable.test( data.viewItem, { name: true, attributes: 'align' } ) ) {
				return;
			}

			// Find a table element inside the div element.
			const viewTable = getViewTableFromWrapper( data.viewItem );

			// Do not convert if table element is absent or was already converted.
			if ( !viewTable || !conversionApi.consumable.test( viewTable, { name: true } ) ) {
				return;
			}

			// Consume the div to prevent other converters from processing it again.
			conversionApi.consumable.consume( data.viewItem, { name: true, attributes: 'align' } );

			// Convert view table to model table.
			const conversionResult = conversionApi.convertItem( viewTable, data.modelCursor );

			// Get table element from conversion result.
			const modelTable = first( conversionResult.modelRange!.getItems() as Iterator<ModelElement> );

			// When table wasn't successfully converted then finish conversion.
			if ( !modelTable || !modelTable.is( 'element', 'table' ) ) {
				// Revert consumed div so other features can convert it.
				conversionApi.consumable.revert( data.viewItem, { name: true, attributes: 'align' } );

				// If anyway some table content was converted, we have to pass the model range and cursor.
				if ( conversionResult.modelRange && !conversionResult.modelRange.isCollapsed ) {
					data.modelRange = conversionResult.modelRange;
					data.modelCursor = conversionResult.modelCursor;
				}

				return;
			}

			const alignAttributeFromDiv = data.viewItem.getAttribute( 'align' ) as string;
			const alignAttributeFromTable = viewTable.getAttribute( 'align' ) as string;
			const localDefaultValue = getDefaultValueAdjusted( defaultValue, '', data );
			const align = convertToTableAlignment( alignAttributeFromDiv, alignAttributeFromTable, localDefaultValue );

			if ( align ) {
				conversionApi.writer.setAttribute( 'tableAlignment', align, modelTable );
			}

			conversionApi.convertChildren( data.viewItem, conversionApi.writer.createPositionAt( modelTable, 'end' ) );
			conversionApi.updateConversionResult( modelTable, data );
		} );
	};
}

/**
 * Converts div `align` and table `align` attributes to the model `tableAlignment` attribute.
 *
 * @param divAlign The value of the div `align` attribute.
 * @param tableAlign The value of the table `align` attribute.
 * @param defaultValue The default alignment value.
 * @returns The model `tableAlignment` value or `undefined` if no conversion is needed.
 */
function convertToTableAlignment( divAlign: string, tableAlign: string, defaultValue: string ): string | undefined {
	if ( divAlign ) {
		switch ( divAlign ) {
			case 'right':
				if ( tableAlign === 'right' ) {
					return 'right';
				} else {
					return 'blockRight';
				}
			case 'center':
				return 'center';
			case 'left':
				if ( tableAlign === 'left' ) {
					return 'left';
				} else {
					return 'blockLeft';
				}
			default:
				return defaultValue;
		}
	}

	return undefined;
}

/**
 * Enables conversion for an attribute for simple view-model mappings.
 *
 * @param options.defaultValue The default value for the specified `modelAttribute`.
 */
function enableProperty(
	schema: ModelSchema,
	conversion: Conversion,
	options: {
		modelAttribute: string;
		styleName: string;
		attributeName?: string;
		attributeType?: 'length' | 'color';
		defaultValue: string;
	}
) {
	const { modelAttribute } = options;

	schema.extend( 'table', {
		allowAttributes: [ modelAttribute ]
	} );

	schema.setAttributeProperties( modelAttribute, { isFormatting: true } );

	upcastStyleToAttribute( conversion, { viewElement: 'table', ...options } );
	downcastTableAttribute( conversion, options );
}

/**
 * Enables conversion for an attribute for simple view (figure) to model (table) mappings.
 */
function enableTableToFigureProperty(
	schema: ModelSchema,
	conversion: Conversion,
	options: {
		modelAttribute: string;
		styleName: string;
		attributeName?: string;
		attributeType?: 'length' | 'color';
		defaultValue: string;
	}
) {
	const { modelAttribute } = options;

	schema.extend( 'table', {
		allowAttributes: [ modelAttribute ]
	} );

	schema.setAttributeProperties( modelAttribute, { isFormatting: true } );

	upcastStyleToAttribute( conversion, {
		viewElement: /^(table|figure)$/,
		shouldUpcast: ( viewElement: ViewElement ) => !(
			viewElement.name == 'table' && viewElement.parent!.name == 'figure' ||
			viewElement.name == 'figure' && !viewElement.hasClass( 'table' )
		),
		...options
	} );

	downcastAttributeToStyle( conversion, { modelElement: 'table', ...options } );
}

/**
 * Checks whether a given figure element should be ignored when upcasting table properties.
 */
function isNonTableFigureElement( viewElement: ViewElement ): boolean {
	return viewElement.name == 'figure' && !viewElement.hasClass( 'table' );
}
