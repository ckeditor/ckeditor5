/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module email/integrations/table
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { EmailIntegrationUtils } from '../emailintegrationutils.js';

import type { TableConfig } from '@ckeditor/ckeditor5-table';

/**
 * A plugin that checks if the Table plugin is properly configured for the email integration.
 */
export class TableEmailIntegration extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ EmailIntegrationUtils ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TableEmailIntegration' as const;
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
	public afterInit(): void {
		this._checkPlainTableOutputPlugin();
		this._checkTableConfig();
	}

	/**
	 * Checks if the `PlainTableOutput` plugin is available when the `Table` plugin is enabled.
	 */
	private _checkPlainTableOutputPlugin(): void {
		const { plugins } = this.editor;
		const utils = plugins.get( EmailIntegrationUtils );

		if ( plugins.has( 'Table' ) && !plugins.has( 'PlainTableOutput' ) ) {
			/**
			 * The `PlainTableOutput` plugin is required to use tables in the email integration.
			 * Without it, tables will not be exported correctly and may not be displayed correctly in some email clients.
			 *
			 * @error email-missing-plain-table-output-plugin
			 */
			utils._logSuppressibleWarning( 'email-missing-plain-table-output-plugin' );
		}
	}

	/**
	 * Checks if the table properties colors are supported in the email integration.
	 */
	private _checkTableConfig(): void {
		const tableConfig: TableConfig | undefined = this.editor.config.get( 'table' );

		if ( tableConfig ) {
			this._checkTablePropertiesConfig( 'tableCellProperties' );
			this._checkTablePropertiesConfig( 'tableProperties' );
		}
	}

	/**
	 * Checks if the table cell properties colors are supported in the email integration.
	 */
	private _checkTablePropertiesConfig( field: 'tableProperties' | 'tableCellProperties' ): void {
		const utils = this.editor.plugins.get( EmailIntegrationUtils );
		const colorFields = [
			`table.${ field }.borderColors`,
			`table.${ field }.backgroundColors`,
			`table.${ field }.defaultProperties.borderColor`,
			`table.${ field }.defaultProperties`
		] as const;

		for ( const field of colorFields ) {
			utils._validateConfigColorValue( field );
		}

		utils._validateConfigColorFormat( `table.${ field }.colorPicker.format` );
	}
}
