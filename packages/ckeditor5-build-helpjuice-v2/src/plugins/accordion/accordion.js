import AccordionEditing from './accordionediting';
import AccordionUI from './accordionui';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import "./styles.css";

export default class Accordion extends Plugin {
	static get requires() {
		return [AccordionEditing, AccordionUI];
	}
}
