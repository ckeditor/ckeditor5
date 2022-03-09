import Command from '@ckeditor/ckeditor5-core/src/command';

export default class InsertAccordionCommand extends Command {
	execute() {
		this.editor.model.change(writer => {
			// Insert <accordion> at the current selection position
			// in a way that will result in creating a valid model structure.
			this.editor.model.insertContent(createAccordion(writer));
		});
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const allowedIn = model.schema.findAllowedParent(selection.getFirstPosition(), 'accordion');

		this.isEnabled = allowedIn !== null;
	}
}

function createAccordion(writer) {
	const accordion = writer.createElement('accordion');

	const accordionTitle = writer.createElement('accordionTitle');
	writer.insertText("Accordion Title", accordionTitle);

	const accordionBody = writer.createElement('accordionBody');
	const accordionBodyContent = writer.createElement('paragraph');
	writer.insertText("Accordion Body", accordionBodyContent);
	writer.append(accordionBodyContent, accordionBody);

	const accordionToggle = writer.createElement('accordionToggle');

	writer.append(accordionTitle, accordion);
	writer.append(accordionBody, accordion);
	writer.append(accordionToggle, accordion);

	return accordion;
}
