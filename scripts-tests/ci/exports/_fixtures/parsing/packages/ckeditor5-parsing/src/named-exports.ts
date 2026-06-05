/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * Test fixture for the module re-exports validator.
 *
 * @publicApi
 */

export class ParsingFeature {}

export function parsingHelper(): void {}

export const PARSING_ONE = 1;

export const PARSING_TWO = 2;

export type ParsingType = string;

export interface ParsingInterface {
	parsingValue: string;
}

class ParsingLocal {}

type ParsingLocalType = string;

export { ParsingLocal as ParsingRenamed, type ParsingLocalType };
