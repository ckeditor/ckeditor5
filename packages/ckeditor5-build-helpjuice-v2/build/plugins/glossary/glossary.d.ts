export default class Glossary extends Plugin {
    static get requires(): (typeof GlossaryEditing | typeof GlossaryUI)[];
    static get pluginName(): string;
    toGlossaryAttribute(viewElement: any, data: any): any;
}
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import GlossaryEditing from "./glossaryediting";
import GlossaryUI from "./glossaryui";
