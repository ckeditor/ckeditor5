import { Editor } from '@ckeditor/ckeditor5-core';
import { HeadingConfig } from '@ckeditor/ckeditor5-heading';
import { ImageConfig, ImageStyleConfig } from '@ckeditor/ckeditor5-image/src/imageconfig';
import { TableConfig } from '@ckeditor/ckeditor5-table';
export declare function MentionCustomization(editor: Editor): void;
interface CkeditorNumericFontSizeConfig {
    options: (number | string)[];
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
    languages: LanguageConfig[];
};
export declare const HeadingConfiguration: HeadingConfig;
export declare const TableConfiguration: TableConfig;
export {};
