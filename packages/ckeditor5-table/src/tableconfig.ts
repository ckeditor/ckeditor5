/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tableconfig
 */

import type { ToolbarConfigItem } from 'ckeditor5/src/core.js';
import type { ColorOption, ColorPickerConfig } from 'ckeditor5/src/ui.js';

/**
 * The configuration of the table feature. Used by the table feature in the `@ckeditor/ckeditor5-table` package.
 *
 * ```ts
 * ClassicEditor
 * 	.create( editorElement, {
 * 		table: ... // Table feature options.
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 */
export interface TableConfig {

	/**
	 * Number of rows and columns to render by the table heading when inserting new tables.
	 *
	 * You can configure it like this:
	 *
	 * ```ts
	 * const tableConfig = {
	 * 	defaultHeadings: {
	 * 		rows: 1,
	 * 		columns: 1
	 * 	}
	 * };
	 * ```
	 *
	 * Both rows and columns properties are optional, defaulting to 0 (no heading).
	 */
	defaultHeadings?: {
		rows?: number;
		columns?: number;
	};

	/**
	 * Items to be placed in the table content toolbar.
	 * The {@link module:table/tabletoolbar~TableToolbar} plugin is required to make this toolbar work.
	 *
	 * Assuming that you use the {@link module:table/tableui~TableUI} feature, the following toolbar items will be available
	 * in {@link module:ui/componentfactory~ComponentFactory}:
	 *
	 * * `'tableRow'`,
	 * * `'tableColumn'`,
	 * * `'mergeTableCells'`.
	 *
	 * You can thus configure the toolbar like this:
	 *
	 * ```ts
	 * const tableConfig = {
	 * 	contentToolbar: [ 'tableRow', 'tableColumn', 'mergeTableCells' ]
	 * };
	 * ```
	 *
	 * Of course, the same buttons can also be used in the
	 * {@link module:core/editor/editorconfig~EditorConfig#toolbar main editor toolbar}.
	 *
	 * Read more about configuring the toolbar in {@link module:core/editor/editorconfig~EditorConfig#toolbar}.
	 */
	contentToolbar?: Array<ToolbarConfigItem>;

	/**
	 * Items to be placed in the table toolbar.
	 * The {@link module:table/tabletoolbar~TableToolbar} plugin is required to make this toolbar work.
	 *
	 * You can thus configure the toolbar like this:
	 *
	 * ```ts
	 * const tableConfig = {
	 * 	tableToolbar: [ 'blockQuote' ]
	 * };
	 * ```
	 *
	 * Of course, the same buttons can also be used in the
	 * {@link module:core/editor/editorconfig~EditorConfig#toolbar main editor toolbar}.
	 *
	 * Read more about configuring the toolbar in {@link module:core/editor/editorconfig~EditorConfig#toolbar}.
	 */
	tableToolbar?: Array<ToolbarConfigItem>;

	/**
	 * The configuration of the table properties user interface (balloon). It allows us to define:
	 *
	 * * The color palette for the table border color style field (`tableProperties.borderColors`),
	 * * The color palette for the table background style field (`tableProperties.backgroundColors`).
	 *
	 * ```ts
	 * const tableConfig = {
	 * 	tableProperties: {
	 * 		borderColors: [
	 * 			{
	 * 				color: 'hsl(0, 0%, 90%)',
	 * 				label: 'Light grey'
	 * 			},
	 * 			// ...
	 * 		],
	 * 		backgroundColors: [
	 * 			{
	 * 				color: 'hsl(120, 75%, 60%)',
	 * 				label: 'Green'
	 * 			},
	 * 			// ...
	 * 		]
	 * 	}
	 * };
	 * ```
	 *
	 * * The default styles for tables (`tableProperties.defaultProperties`):
	 *
	 * ```
	 * const tableConfig = {
	 * 	tableProperties: {
	 * 		defaultProperties: {
	 * 			borderStyle: 'dashed',
	 * 			borderColor: 'hsl(0, 0%, 90%)',
	 * 			borderWidth: '3px',
	 * 			alignment: 'left'
	 * 		}
	 * 	}
	 * }
	 * ```
	 *
	 * {@link module:table/tableconfig~TablePropertiesOptions Read more about the supported properties.}
	 *
	 * **Note**: The `borderColors` and `backgroundColors` options do not impact the data loaded into the editor,
	 * i.e., they do not limit or filter the colors in the data. They are used only in the user interface,
	 * allowing users to pick colors more conveniently. The `defaultProperties` option does impact the data.
	 * The editor model will not keep the default values.
	 *
	 * The default color palettes for the table background and the table border are the same
	 * ({@link module:table/utils/ui/table-properties#defaultColors check out their content}).
	 *
	 * Both color palette configurations must follow the
	 * {@link module:table/tableconfig~TableColorConfig table color configuration format}.
	 *
	 * Read more about configuring the table feature in {@link module:table/tableconfig~TableConfig}.
	 */
	tableProperties?: TablePropertiesConfig;

	/**
	 * The configuration of the table cell properties user interface (balloon). It allows us to define:
	 *
	 * * The color palette for the cell border color style field (`tableCellProperties.borderColors`),
	 * * The color palette for the cell background style field (`tableCellProperties.backgroundColors`).
	 *
	 * ```ts
	 * const tableConfig = {
	 * 	tableCellProperties: {
	 * 		borderColors: [
	 * 			{
	 * 				color: 'hsl(0, 0%, 90%)',
	 * 				label: 'Light grey'
	 * 			},
	 * 			// ...
	 * 		],
	 * 		backgroundColors: [
	 * 			{
	 * 				color: 'hsl(120, 75%, 60%)',
	 * 				label: 'Green'
	 * 			},
	 * 			// ...
	 * 		]
	 * 	}
	 * };
	 * ```
	 *
	 * * The default styles for table cells (`tableCellProperties.defaultProperties`):
	 *
	 * ```ts
	 * const tableConfig = {
	 * 	tableCellProperties: {
	 * 		defaultProperties: {
	 * 			horizontalAlignment: 'right',
	 * 			verticalAlignment: 'bottom',
	 * 			padding: '5px'
	 * 		}
	 * 	}
	 * }
	 * ```
	 *
	 * {@link module:table/tableconfig~TablePropertiesOptions Read more about the supported properties.}
	 *
	 * **Note**: The `borderColors` and `backgroundColors` options do not impact the data loaded into the editor,
	 * i.e., they do not limit or filter the colors in the data. They are used only in the user interface,
	 * allowing users to pick colors in a more convenient way. The `defaultProperties` option does impact the data.
	 * The editor model will not keep the default values.
	 *
	 * The default color palettes for the cell background and the cell border are identical
	 * ({@link module:table/utils/ui/table-properties#defaultColors check out their content}).
	 *
	 * Both color palette configurations must follow the
	 * {@link module:table/tableconfig~TableColorConfig table color configuration format}.
	 *
	 * Read more about configuring the table feature in {@link module:table/tableconfig~TableConfig}.
	 */
	tableCellProperties?: TableCellPropertiesConfig;

	/**
	 * Configuration of the table layout feature.
	 *
	 * ```ts
	 * const tableConfig = {
	 * 	tableLayout: ... // Table layout feature config.
	 * };
	 * ```
	 */
	tableLayout?: TableLayoutConfig;

	/**
	 * Configuration of the table caption feature.
	 *
	 * ```ts
	 * const tableConfig = {
	 * 	tableCaption: ... // Table caption feature config.
	 * };
	 * ```
	 */
	tableCaption?: TableCaptionConfig;
}

/**
 * The configuration of the table properties user interface (balloon).
 */
export interface TablePropertiesConfig {

	/**
	 * The color palette for the table border color picker.
	 *
	 * ```ts
	 * const tableConfig = {
	 * 	tableProperties: {
	 * 		borderColors: [
	 * 			{
	 * 				color: 'hsl(0, 0%, 0%)',
	 * 				label: 'Black'
	 * 			},
	 * 			{
	 * 				color: 'hsl(0, 0%, 100%)',
	 * 				label: 'White',
	 * 				hasBorder: true
	 * 			}
	 * 		]
	 * 	}
	 * };
	 * ```
	 *
	 * **Note**: This configuration only affects the UI. It does not limit or filter the colors in the data.
	 *
	 * Defaults to {@link module:table/utils/ui/table-properties#defaultColors}.
	 *
	 * @see {@link module:table/tableconfig~TableColorConfig}
	 */
	borderColors?: TableColorConfig;

	/**
	 * The color palette for the table background color picker.
	 *
	 * ```ts
	 * const tableConfig = {
	 * 	tableProperties: {
	 * 		backgroundColors: [
	 * 			{
	 * 				color: 'hsl(0, 0%, 100%)',
	 * 				label: 'White',
	 * 				hasBorder: true
	 * 			},
	 * 			{
	 * 				color: 'hsl(120, 75%, 60%)',
	 * 				label: 'Green'
	 * 			}
	 * 		]
	 * 	}
	 * };
	 * ```
	 *
	 * **Note**: This configuration only affects the UI. It does not limit or filter the colors in the data.
	 *
	 * Defaults to {@link module:table/utils/ui/table-properties#defaultColors}.
	 *
	 * @see {@link module:table/tableconfig~TableColorConfig}
	 */
	backgroundColors?: TableColorConfig;

	/**
	 * Default styles for newly created tables.
	 *
	 * ```ts
	 * const tableConfig = {
	 * 	tableProperties: {
	 * 		defaultProperties: {
	 * 			borderStyle: 'dashed',
	 * 			borderColor: 'hsl(0, 0%, 90%)',
	 * 			borderWidth: '3px',
	 * 			alignment: 'left',
	 * 			width: '550px',
	 * 			height: '450px'
	 * 		}
	 * 	}
	 * }
	 * ```
	 *
	 * **Note**: The model does not store the default values. The editor will only keep values that differ from the defaults.
	 *
	 * See {@link module:table/tableconfig~TablePropertiesOptions} for the full list of properties.
	 */
	defaultProperties?: TablePropertiesOptions;

	/**
	 * Configuration of the table alignment behavior in the editor output.
	 *
	 * ```ts
	 * const tableConfig = {
	 * 	tableProperties: {
	 * 		alignment: {
	 * 			useInlineStyles: true // Use inline styles instead of CSS classes
	 * 		}
	 * 	}
	 * };
	 * ```
	 */
	alignment?: TableAlignmentConfig;

	/**
	 * Configuration of the color picker in the table properties balloon.
	 *
	 * If set to `false` the picker will not appear.
	 */
	colorPicker?: false | ColorPickerConfig;
}

/**
 * The configuration of the table default properties feature.
 */
export interface TablePropertiesOptions {

	/**
	 * The default `width` of the table.
	 */
	width?: string;

	/**
	 * The default `height` of the table.
	 */
	height?: string;

	/**
	 * The default `background-color` of the table.
	 */
	backgroundColor?: string;

	/**
	 * The default `border-color` of the table.
	 */
	borderColor?: string;

	/**
	 * The default `border-width` of the table.
	 */
	borderWidth?: string;

	/**
	 * The default `border-style` of the table.
	 *
	 * @default 'none'
	 */
	borderStyle?: string;

	/**
	 * The default `alignment` of the table.
	 *
	 * @default 'center'
	 */
	alignment?: string;
}

/**
 * The configuration of the table cell properties user interface (balloon).
 */
export interface TableCellPropertiesConfig {

	/**
	 * The color palette for the table cell border color picker.
	 *
	 * ```ts
	 * const tableConfig = {
	 * 	tableCellProperties: {
	 * 		borderColors: [
	 * 			{
	 * 				color: 'hsl(0, 0%, 0%)',
	 * 				label: 'Black'
	 * 			},
	 * 			{
	 * 				color: 'hsl(0, 0%, 100%)',
	 * 				label: 'White',
	 * 				hasBorder: true
	 * 			}
	 * 		]
	 * 	}
	 * };
	 * ```
	 *
	 * **Note**: This configuration only affects the UI. It does not limit or filter the colors in the data.
	 *
	 * Defaults to {@link module:table/utils/ui/table-properties#defaultColors}.
	 *
	 * @see {@link module:table/tableconfig~TableColorConfig}
	 */
	borderColors?: TableColorConfig;

	/**
	 * The color palette for the table cell background color picker.
	 *
	 * ```ts
	 * const tableConfig = {
	 * 	tableCellProperties: {
	 * 		backgroundColors: [
	 * 			{
	 * 				color: 'hsl(0, 0%, 100%)',
	 * 				label: 'White',
	 * 				hasBorder: true
	 * 			},
	 * 			{
	 * 				color: 'hsl(120, 75%, 60%)',
	 * 				label: 'Green'
	 * 			}
	 * 		]
	 * 	}
	 * };
	 * ```
	 *
	 * **Note**: This configuration only affects the UI. It does not limit or filter the colors in the data.
	 *
	 * Defaults to {@link module:table/utils/ui/table-properties#defaultColors}.
	 *
	 * @see {@link module:table/tableconfig~TableColorConfig}
	 */
	backgroundColors?: TableColorConfig;

	/**
	 * Default styles for newly created table cells.
	 *
	 * ```ts
	 * const tableConfig = {
	 * 	tableCellProperties: {
	 * 		defaultProperties: {
	 * 			borderStyle: 'dashed',
	 * 			borderColor: 'hsl(0, 0%, 90%)',
	 * 			borderWidth: '3px',
	 * 			horizontalAlignment: 'center',
	 * 			verticalAlignment: 'middle',
	 * 			padding: '10px'
	 * 		}
	 * 	}
	 * }
	 * ```
	 *
	 * **Note**: The model does not store the default values. The editor will only keep values that differ from the defaults.
	 *
	 * See {@link module:table/tableconfig~TableCellPropertiesOptions} for the full list of properties.
	 */
	defaultProperties?: TableCellPropertiesOptions;

	/**
	 * Configuration of the color picker in the table cell properties balloon.
	 *
	 * If set to `false` the picker will not appear.
	 */
	colorPicker?: false | ColorPickerConfig;
}

/**
 * An array of color definitions (either strings or objects).
 *
 * ```ts
 * const colors = [
 * 	{
 * 		color: 'hsl(0, 0%, 60%)',
 * 		label: 'Grey'
 * 	},
 * 	'hsl(0, 0%, 80%)',
 * 	{
 * 		color: 'hsl(0, 0%, 90%)',
 * 		label: 'Light grey'
 * 	},
 * 	{
 * 		color: 'hsl(0, 0%, 100%)',
 * 		label: 'White',
 * 		hasBorder: true
 * 	},
 * 	'#FF0000'
 * ]
 * ```
 *
 * Usually used as a configuration parameter, for instance in
 * {@link module:table/tableconfig~TableConfig#tableProperties `config.table.tableProperties`}
 * or {@link module:table/tableconfig~TableConfig#tableCellProperties `config.table.tableCellProperties`}.
 */
export type TableColorConfig = Array<ColorOption>;

/**
 * The configuration of the table cell default properties feature.
 */
export interface TableCellPropertiesOptions {

	/**
	 * The default `width` of the table cell.
	 */
	width?: string;

	/**
	 * The default `height` of the table cell.
	 */
	height?: string;

	/**
	 * The default `padding` of the table cell.
	 */
	padding?: string;

	/**
	 * The default `background-color` of the table cell.
	 */
	backgroundColor?: string;

	/**
	 * The default `border-color` of the table cell.
	 */
	borderColor?: string;

	/**
	 * The default `border-width` of the table cell.
	 */
	borderWidth?: string;

	/**
	 * The default `border-style` of the table cell.
	 *
	 * @default 'none'
	 */
	borderStyle?: string;

	/**
	 * The default `horizontalAlignment` of the table cell.
	 *
	 * @default 'center'
	 */
	horizontalAlignment?: string;

	/**
	 * The default `verticalAlignment` of the table cell.
	 *
	 * @default 'middle'
	 */
	verticalAlignment?: string;
}

/**
 * The configuration of the table layout feature.
 */
export interface TableLayoutConfig {

	/**
	 * Sets the preferred type for loading external tables.
	 *
	 * This setting overrides the default detection method and uses the specified type ('content' or 'layout').
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( {
	 * 		table: {
	 * 			tableLayout: {
	 * 				preferredExternalTableType: 'content' // or 'layout'
	 * 			}
	 * 		}
	 * 	} )
	 * 	.then( ... )
	 * 	.catch( ... );
	 * ```
	 */
	preferredExternalTableType: TableType;
}

/**
 * The configuration of the table caption feature.
 */
export interface TableCaptionConfig {

	/**
	 * Sets the preferred HTML structure for table captions.
	 *
	 * When this option is `false` (the default) the structure is like this:
	 *
	 * ```html
	 * <figure class="table">
	 * 	<table>
	 * 		<tbody> ... </tbody>
	 * 	</table>
	 * 	<figcaption> ... </figcaption>
	 * </figure>
	 * ```
	 *
	 * When this option is `true` the structure is like this:
	 *
	 * ```html
	 * <figure class="table">
	 * 	<table>
	 * 		<tbody> ... </tbody>
	 * 		<caption> ... </caption>
	 * 	</table>
	 * </figure>
	 * ```
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( {
	 * 		table: {
	 * 			tableCaption: {
	 * 				useCaptionElement: true
	 * 			}
	 * 		}
	 * 	} )
	 * 	.then( ... )
	 * 	.catch( ... );
	 * ```
	 */
	useCaptionElement?: boolean;
}

/**
 * The type of the table.
 */
export type TableType = 'content' | 'layout';

export interface TableAlignmentConfig {

	/**
	 * Whether to use inline styles for table alignment in the editor output.
	 *
	 * * When `true`, the alignment is rendered as inline styles.
	 * * When `false` (default), the alignment is rendered as CSS classes.
	 *
	 * @default false
	 */
	useInlineStyles?: boolean;
}
