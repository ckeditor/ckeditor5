# Slot conversion

The editor should be loaded with a "box" element that contains multiple fields in which user can edit content.

An additional converter adds `"data-insert-count"` attribute to view elements to show when it was rendered. It is displayed with a CSS in the top-right corner of rendered element. If a view element was not re-rendered this attribute should not change. *Note*: it only acts on "insert" changes, so it can omit attribute-to-element changes or insertions not passed through dispatcher.

Observe which view elements are re-rendered when using UI-buttons:

* `Box title` - updates title attribute which triggers re-rendering of a "box".
* `Box author` - updates author attribute which triggers re-rendering of a "box".
* `+` - adds field to box  which triggers re-rendering of a "box".
* `-` - removes field from box which triggers re-rendering of a "box".

There is a switch above the editor to load single slot version of the plugin (where all fields are in a single wrapper), and a multi-slot version (where first 2 fields are in one wrapper and the rest in the other wrapper). 
