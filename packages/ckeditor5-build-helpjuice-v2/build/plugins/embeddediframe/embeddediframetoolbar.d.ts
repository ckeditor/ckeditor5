export default class EmbeddedIFrameToolbar extends Plugin {
    static get requires(): (typeof WidgetToolbarRepository)[];
    afterInit(): void;
}
import { Plugin } from "@ckeditor/ckeditor5-core";
import { WidgetToolbarRepository } from "@ckeditor/ckeditor5-widget";
