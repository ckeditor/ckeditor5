export default class EmbeddedIFrameEditing extends Plugin {
    static get requires(): (typeof Widget)[];
    init(): void;
    _defineSchema(): void;
    _defineConverters(): void;
}
import { Plugin } from "@ckeditor/ckeditor5-core";
import { Widget } from "@ckeditor/ckeditor5-widget";
