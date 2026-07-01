---
category: getting-started
order: 20
menu-title: Build with AI
meta-title: CKEditor 5 skill for AI coding agents | CKEditor 5 Documentation
meta-description: Install the official CKEditor 5 skill in Claude Code, Cursor, Codex, OpenCode, or Copilot to set up, configure, and get the most out of its features.
modified_at: 2026-06-29
---

# Using CKEditor&nbsp;5 with AI coding agents

The official **CKEditor skill** teaches your AI coding agent how to add CKEditor&nbsp;5 to a project: it selects an installation method, wires up the editor, maps features to your use case, loads the styles, and sets the license key. Install it with one command:

```bash
npx skills add ckeditor/skills
```

<info-box>
	This guide covers **AI agent skills** that help you integrate CKEditor&nbsp;5 into your application. It is not the in-editor {@link features/ckeditor-ai-overview CKEditor AI} feature that helps you with content workflow.
</info-box>

## What the skill does

The skill loads automatically when you ask your agent to install, set up, configure, or troubleshoot CKEditor&nbsp;5. It will:

* Choose an install method &ndash; npm, CDN, or ZIP.
* Wire up the editor in vanilla JavaScript or an official React, Angular, or Vue wrapper.
* Configure plugins, the toolbar, content styles, and the UI language.
* Set the license key and unlock premium features.
* Send version-specific questions to the live documentation instead of guessing.

## Supported agents

The skill uses the open [Agent Skills](https://agentskills.io/home) format, so it works in any agent that supports it &ndash; including **Claude&nbsp;Code**, **Cursor**, **Codex**, **OpenCode**, **GitHub Copilot**, **Windsurf**, **Gemini**, **Cline**, **AMP**, **Zed**, and more.

## Other ways to install

Besides [skills.sh](https://skills.sh), which installs the skill into every supported agent it detects, you have two more options.

### Claude Code plugin marketplace

```text
/plugin marketplace add ckeditor/skills
/plugin install ckeditor@ckeditor
```

### Manual installation

Copy the `skills/ckeditor/` directory from the [`ckeditor/skills`](https://github.com/ckeditor/skills) repository into your agent's skills directory, for example `.claude/skills/ckeditor/`.

## Connect the documentation MCP server

The skill works on its own, but it is more effective when your agent can search the live documentation. The hosted **CKEditor 5 documentation MCP server** (powered by Kapa.ai) gives agents semantic search over the docs, returned as relevant snippets with source links.

<info-box note>
	This optional server is for your coding agent and is separate from the {@link features/ckeditor-ai-mcp CKEditor AI MCP} feature inside the editor.
</info-box>

* **Endpoint:** `https://ckeditor5.mcp.kapa.ai`
* **Authentication:** Google or GitHub SSO, which Kapa uses to control abuse of the MCP server.

Add the server to your agent's MCP configuration.

### Claude Code

```bash
claude mcp add --transport http --scope project ckeditor5 https://ckeditor5.mcp.kapa.ai
```

<details>
<summary>Or add it manually to <code>.mcp.json</code></summary>

```json
{
	"mcpServers": {
		"ckeditor5": {
			"type": "http",
			"url": "https://ckeditor5.mcp.kapa.ai"
		}
	}
}
```

</details>

### Cursor

Add it to `.cursor/mcp.json`:

```json
{
	"mcpServers": {
		"ckeditor5": {
			"url": "https://ckeditor5.mcp.kapa.ai"
		}
	}
}
```

### Codex

```bash
codex mcp add ckeditor5-docs --url https://ckeditor5.mcp.kapa.ai
```

<details>
<summary>Or add it manually to <code>~/.codex/config.toml</code></summary>

```toml
[mcp_servers.ckeditor5-docs]
url = "https://ckeditor5.mcp.kapa.ai"
startup_timeout_sec = 20
tool_timeout_sec = 60
enabled = true
```

</details>

### OpenCode

Add it to `opencode.json`:

```json
{
	"$schema": "https://opencode.ai/config.json",
	"mcp": {
		"ckeditor5-docs": {
			"type": "remote",
			"url": "https://ckeditor5.mcp.kapa.ai",
			"enabled": true
		}
	}
}
```

For any other agent, point its MCP client at the streamable HTTP endpoint above and authenticate with Google or GitHub SSO.

## Feedback

Found wrong, stale, or missing guidance? [Open an issue](https://github.com/ckeditor/skills/issues/new?template=skill-feedback.yml) in the [`ckeditor/skills`](https://github.com/ckeditor/skills) repository. Agents are encouraged to file these when reality contradicts the skill.
