/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tableproperties/utils
 */

import type { ViewElement } from 'ckeditor5/src/engine.js';

const ALIGN_VALUES_REG_EXP = /^(left|center|right)$/;
const FLOAT_VALUES_REG_EXP = /^(left|none|right)$/;

export const DEFAULT_TABLE_ALIGNMENT_OPTIONS = {
	get blockLeft(): { className: string } {
		return {
			className: 'table-style-block-align-left'
		};
	},
	get blockRight(): { className: string } {
		return {
			className: 'table-style-block-align-right'
		};
	}
};

/**
 * Configuration for upcasting table alignment from view to model.
 */
export const upcastTableAlignmentConfig: Array<UpcastTableAlignmentConfig> = [
	// Support for the `float:*;` CSS definition for the table alignment.
	{
		view: {
			name: /^(table|figure)$/,
			styles: {
				float: FLOAT_VALUES_REG_EXP
			}
		},
		getAlign: ( viewElement: ViewElement ): string | undefined => {
			let align = viewElement.getStyle( 'float' );

			if ( align === 'none' ) {
				align = 'center';
			}

			return align;
		},
		get consume(): UpcastTableAlignmentConfig[ 'consume' ] {
			return { styles: 'float' };
		}
	},
	// Support for the `margin-left:auto; margin-right:auto;` CSS definition for the table alignment.
	{
		view: {
			name: /^(table|figure)$/,
			styles: {
				'margin-left': 'auto',
				'margin-right': 'auto'
			}
		},
		getAlign: (): string => 'center',
		get consume(): UpcastTableAlignmentConfig[ 'consume' ] {
			return { styles: [ 'margin-left', 'margin-right' ] };
		}
	},
	// Support for the block alignment left using CSS classes.
	{
		view: {
			name: /^(table|figure)$/,
			key: 'class',
			value: DEFAULT_TABLE_ALIGNMENT_OPTIONS.blockLeft.className
		},
		getAlign: (): string => 'blockLeft',
		get consume(): UpcastTableAlignmentConfig[ 'consume' ] {
			return { classes: DEFAULT_TABLE_ALIGNMENT_OPTIONS.blockLeft.className };
		}
	},
	// Support for the block alignment right using CSS classes.
	{
		view: {
			name: /^(table|figure)$/,
			key: 'class',
			value: DEFAULT_TABLE_ALIGNMENT_OPTIONS.blockRight.className
		},
		getAlign: (): string => 'blockRight',
		get consume(): UpcastTableAlignmentConfig[ 'consume' ] {
			return { classes: DEFAULT_TABLE_ALIGNMENT_OPTIONS.blockRight.className };
		}
	},
	// Support for the block alignment left using margin CSS styles.
	{
		view: {
			name: /^(table|figure)$/,
			styles: {
				'margin-left': '0',
				'margin-right': 'auto'
			}
		},
		getAlign: (): string => 'blockLeft',
		get consume(): UpcastTableAlignmentConfig[ 'consume' ] {
			return { styles: [ 'margin-left', 'margin-right' ] };
		}
	},
	// Support for the block alignment right using margin CSS styles.
	{
		view: {
			name: /^(table|figure)$/,
			styles: {
				'margin-left': 'auto',
				'margin-right': '0'
			}
		},
		getAlign: (): string => 'blockRight',
		get consume(): UpcastTableAlignmentConfig[ 'consume' ] {
			return { styles: [ 'margin-left', 'margin-right' ] };
		}
	},
	// Support for the `align` attribute as the backward compatibility while pasting from other sources.
	{
		view: {
			name: 'table',
			attributes: {
				align: ALIGN_VALUES_REG_EXP
			}
		},
		getAlign: ( viewElement: ViewElement ): string | undefined => viewElement.getAttribute( 'align' ),
		get consume(): UpcastTableAlignmentConfig[ 'consume' ] {
			return { attributes: 'align' };
		}
	}
];

type UpcastTableAlignmentConfig = {
	view: {
		name: RegExp | string;
		styles?: Record<string, RegExp | string>;
		attributes?: Record<string, RegExp | string>;
		key?: string;
		value?: RegExp | string;
	};
	getAlign: ( ( viewElement: ViewElement ) => string | undefined ) | ( () => string );
	get consume(): {
		styles?: string | Array<string>;
		attributes?: string | Array<string>;
		classes?: string | Array<string>;
	};
};
