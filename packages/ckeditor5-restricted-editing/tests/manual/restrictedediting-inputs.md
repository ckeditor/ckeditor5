## Restricted editing - Standard mode surrounded by forms

1. The editor should behave exactely the same as editor in Standard Mode.

**Expected behaviour**:
  - Pressing "Tab" should set focus on:
    - Mode form
    - Editor
    - Radio form below the editor
  - Pressing "Tab+Shift" from the latest element should set focus in the oposite direction.

## Restricted editing - Restricted mode surrounded by forms

1. The editor should behave exactely the same as editor in Restricted Mode.
2. The editor is surrounded by forms to test keyboard navigation events using "Tab" and "Tab+Shift".

**Expected behaviour**:
  - When selection is on the **first** restricted exception, pressing "Tab+Shift" should set focus on the text input with a "value" ("Nick") above the editor
  - When selection is on the **last** restricted exception, pressing "Tab" should set focus on the radio input with a "label" ("Test 1") below the editor.
