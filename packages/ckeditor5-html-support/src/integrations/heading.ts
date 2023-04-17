/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/integrations/heading
 */

import { Plugin, type Editor } from 'ckeditor5/src/core';
import type { Item } from 'ckeditor5/src/engine';
import type { HeadingOption } from '@ckeditor/ckeditor5-heading';
import {
	Enter,
	type EnterCommand,
	type EnterCommandAfterExecuteEvent
} from 'ckeditor5/src/enter';

import DataSchema from '../dataschema';
import { modifyGhsAttribute } from '../utils';

/**
 * Provides the General HTML Support integration with {@link module:heading/heading~Heading Heading} feature.
 */
export default class HeadingElementSupport extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ DataSchema, Enter ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'HeadingElementSupport' {
		return 'HeadingElementSupport';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		if ( !editor.plugins.has( 'HeadingEditing' ) ) {
			return;
		}

		const options: Array<HeadingOption> = editor.config.get( 'heading.options' )!;

		this.registerHeadingElements( editor, options );
		this.removeClassesOnEnter( editor, options );
	}

	/**
	 * Registers all elements supported by HeadingEditing to enable custom attributes for those elements.
	 */
	private registerHeadingElements( editor: Editor, options: Array<HeadingOption> ) {
		const dataSchema = editor.plugins.get( DataSchema );

		const headerModels = [];
		for ( const option of options ) {
			if ( 'model' in option && 'view' in option ) {
				dataSchema.registerBlockElement( {
					view: option.view as string,
					model: option.model
				} );

				headerModels.push( option.model );
			}
		}

		dataSchema.extendBlockElement( {
			model: 'htmlHgroup',
			modelSchema: {
				allowChildren: headerModels
			}
		} );
	}

	/**
	 * Removes css classes from "htmlAttributes" of new paragraph created when hitting "enter" in heading.
	 */
	private removeClassesOnEnter( editor: Editor, options: Array<HeadingOption> ): void {
		const enterCommand: EnterCommand = editor.commands.get( 'enter' )!;

		this.listenTo<EnterCommandAfterExecuteEvent>( enterCommand, 'afterExecute', ( evt, data ) => {
			const positionParent = editor.model.document.selection.getFirstPosition()!.parent;
			const isHeading = options.some( option => positionParent.is( 'element', option.model ) );

			if ( isHeading && positionParent.childCount === 0 ) {
				modifyGhsAttribute(
					data.writer,
					positionParent as Item,
					'htmlAttributes',
					'classes',
					classes => classes.clear()
				);
			}
		} );
	}
}
