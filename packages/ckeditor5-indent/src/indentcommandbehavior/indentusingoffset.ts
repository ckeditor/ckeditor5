/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type { IndentBlockConfig } from '../indentblock';

/**
 * @module indent/indentcommandbehavior/indentusingoffset
 */

/**
 * The block indentation behavior that uses offsets to set indentation.
 */
export default class IndentUsingOffset {
	/**
	 * The direction of indentation.
	 */
	public isForward: boolean;

	/**
	 * The offset of the next indentation step.
	 */
	public offset: number;

	/**
	 * Indentation unit.
	 */
	public unit: string;

	/**
	 * Creates an instance of the indentation behavior.
	 *
	 * @param config.direction The direction of indentation.
	 * @param config.offset The offset of the next indentation step.
	 * @param config.unit Indentation unit.
	 */
	constructor( config: IndentBlockConfig & { direction: string } ) {
		this.isForward = config.direction === 'forward';
		this.offset = config.offset;
		this.unit = config.unit;
	}

	/**
	 * @inheritDoc
	 */
	public checkEnabled( indentAttributeValue: string ): boolean {
		const currentOffset = parseFloat( indentAttributeValue || 0 as any );

		// The command is always enabled for forward indentation.
		return this.isForward || currentOffset > 0;
	}

	/**
	 * @inheritDoc
	 */
	public getNextIndent( indentAttributeValue: string ): string | undefined {
		const currentOffset = parseFloat( indentAttributeValue || 0 as any );
		const isSameUnit = !indentAttributeValue || indentAttributeValue.endsWith( this.unit );

		if ( !isSameUnit ) {
			return this.isForward ? this.offset + this.unit : undefined;
		}

		const nextOffset = this.isForward ? this.offset : -this.offset;

		const offsetToSet = currentOffset + nextOffset;

		return offsetToSet > 0 ? offsetToSet + this.unit : undefined;
	}
}
