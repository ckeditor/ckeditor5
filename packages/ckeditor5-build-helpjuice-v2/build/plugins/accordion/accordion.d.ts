export default class Accordion extends Plugin {
    static get requires(): (typeof AccordionUI)[];
}
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import AccordionUI from "./accordionui";
