/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import type { Editor } from '@ckeditor/ckeditor5-core';
import type { HeadingConfig } from '@ckeditor/ckeditor5-heading';
import type { ImageConfig, ImageStyleConfig } from '@ckeditor/ckeditor5-image/src/imageconfig.js';
import type { TableConfig } from '@ckeditor/ckeditor5-table';
export declare function MentionCustomization(editor: Editor): void;
interface CkeditorNumericFontSizeConfig {
    options: Array<number | string>;
}
export interface LanguageConfig {
    language: string;
    label: string;
    class: string;
}
export declare const NumericFontSizeConfig: CkeditorNumericFontSizeConfig;
export declare const ImageStyles: ImageStyleConfig;
export declare const ImageConfiguration: ImageConfig;
export declare const CodeBlockConfiguration: {
    languages: Array<LanguageConfig>;
};
export declare const HeadingConfiguration: HeadingConfig;
export declare const TableConfiguration: TableConfig;
export {};
