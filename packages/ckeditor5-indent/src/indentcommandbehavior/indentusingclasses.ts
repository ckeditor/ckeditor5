/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type { IndentBlockConfig } from '../indentblock';

/**
 * @module indent/indentcommandbehavior/indentusingclasses
 */

/**
 * The block indentation behavior that uses classes to set indentation.
 */
export default class IndentUsingClasses {
	/**
	 * The direction of indentation.
	 */
	public isForward: boolean;

	/**
	 * A list of classes used for indentation.
	 */
	public classes: Array<string>;

	/**
	 * Creates an instance of the indentation behavior.
	 *
	 * @param config.direction The direction of indentation.
	 * @param config.classes A list of classes used for indentation.
	 */
	constructor( config: IndentBlockConfig & { direction: string } ) {
		this.isForward = config.direction === 'forward';
		this.classes = config.classes!;
	}

	/**
	 * @inheritDoc
	 */
	public checkEnabled( indentAttributeValue: string ): boolean {
		const currentIndex = this.classes.indexOf( indentAttributeValue );

		if ( this.isForward ) {
			return currentIndex < this.classes.length - 1;
		} else {
			return currentIndex >= 0;
		}
	}

	/**
	 * @inheritDoc
	 */
	public getNextIndent( indentAttributeValue: string ): string {
		const currentIndex = this.classes.indexOf( indentAttributeValue );
		const indexStep = this.isForward ? 1 : -1;

		return this.classes[ currentIndex + indexStep ];
	}
}
