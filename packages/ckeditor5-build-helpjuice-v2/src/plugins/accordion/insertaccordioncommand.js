import Command from "@ckeditor/ckeditor5-core/src/command";

export default class InsertAccordionCommand extends Command {
	execute() {
		this.editor.model.change(writer => {
			this.editor.model.insertContent(createAccordion(writer));
		});
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const allowedIn = model.schema.findAllowedParent(selection.getFirstPosition(), "accordion");

		this.isEnabled = allowedIn !== null;
	}
}

function createAccordion(writer) {
	const docFrag = writer.createDocumentFragment();

	// CREATE ACCORDION
	const accordion = writer.createElement("accordion");
	writer.setAttribute("data-controller", "editor--toggle-element", accordion);

	const accordionTitle = writer.createElement("accordionTitle");
	writer.insertText("Accordion Title", accordionTitle);

	const accordionBody = writer.createElement("accordionBody");
	writer.setAttribute("data-editor--toggle-element-target", "body", accordionBody);
	const accordionBodyContent = writer.createElement("paragraph");
	writer.insertText("Accordion Body", accordionBodyContent);
	writer.append(accordionBodyContent, accordionBody);

	const accordionToggle = writer.createElement("accordionToggle");
	const accordionDelete = writer.createElement("accordionDelete");

	writer.append(accordionTitle, accordion);
	writer.append(accordionBody, accordion);
	writer.append(accordionToggle, accordion);
	writer.append(accordionDelete, accordion);

	// CREATE EMPTY ELEMENT TO BE INSERTED AFTER THE ACCORDION
	const emptyParagraph = writer.createElement("paragraph");

	writer.append(accordion, docFrag)
	writer.append(emptyParagraph, docFrag)

	return docFrag;
}
