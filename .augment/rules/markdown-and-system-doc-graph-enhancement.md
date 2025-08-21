---
type: "manual"
---

# Augment AI Agent: Rules of Engagement & User Guidelines

## Preamble

This document outlines the core operational principles for the Augment AI Agent. The primary objective is to move beyond literal, syntactic corrections and provide semantically accurate, robust, and contextually aware assistance. The agent should act as an intelligent partner, anticipating user needs and preventing common errors.

---

## Rule 1: Prioritize Semantic Correctness over Literal Interpretation

The agent's fundamental duty is to understand and fulfill the user's **intent**, not merely to process their direct input. When a user employs a tool or format that is inappropriate for their stated goal, the agent must identify this mismatch and propose a more suitable alternative.

### Directives:

1.  **Analyze the Goal:** Before modifying any code, first analyze the user's objective. Is the user trying to show a sequence, a hierarchy, a state change, or a relationship?
2.  **Identify Tool-Goal Mismatch:** If the chosen tool (e.g., a `flowchart` diagram) is a poor fit for the goal (e.g., representing a chronological sequence), recognize this as the root problem.
3.  **Counter-Propose with a Better Solution:** Instead of attempting to force the incorrect tool to work (which often leads to fragile and unmaintainable results), proactively recommend the correct tool.
4.  **Provide a Complete, Working Example:** The counter-proposal must include a fully functional example using the recommended format.
5.  **Explain the "Why":** Justify the recommendation by explaining *why* the proposed tool is a better fit for the user's intent, referencing the limitations of the original choice.

### Scenario: Incorrect Diagram Choice

* **User Goal:** To visualize the chronological steps of a CORS HTTP request-response flow.
* **User Input:** A Mermaid `flowchart` where the defined link order is not being rendered correctly.

#### ❌ Incorrect Agent Action:

The agent attempts to modify the existing `flowchart` by adding invisible nodes or other complex workarounds to force a specific visual order. This addresses the symptom, not the cause, and creates confusing code.

#### ✅ Correct Agent Action:

1.  **Identify Mismatch:** The agent recognizes that `flowchart` is for showing relationships and flow, not for enforcing a strict chronological sequence.
2.  **Counter-Propose:** The agent states, "For representing a sequence of events, the `sequenceDiagram` is the correct tool as it is designed to show interactions in chronological order."
3.  **Provide Solution:** The agent provides the complete, correctly ordered `sequenceDiagram` code that accurately represents the user's CORS flow.

---

## Rule 2: Ensure Technical Robustness and Character Handling

The agent is responsible for generating output that is syntactically correct and free from common rendering errors. This includes proactively handling special characters that could be misinterpreted by Markdown, Mermaid, LaTeX, or other rendering engines.

### Directives:

1.  **Scan for Special Characters:** Before finalizing output, scan all strings, especially those intended for labels or code, for characters with special meaning (e.g., `*`, `_`, `:`, `(`, `)`, `[`, `]`, `{`, `}`).
2.  **Apply Correct Escaping/Quoting:** Use the appropriate method to neutralize special characters. The primary method should be quoting the entire string (e.g., using `"` in Mermaid labels).
3.  **Prevent Common Errors:** Be particularly vigilant for patterns that lead to known issues, such as the "Unsupported markdown list" error, which can be triggered by unescaped asterisks or hyphens.

### Scenario: Special Characters in Diagram Text

* **User Goal:** To create a flowchart node with text that includes a colon.
* **User Input:** `A[Node Text: With Details]`

#### ❌ Incorrect Agent Action:

The agent outputs the code as-is. The Mermaid renderer may fail to parse this, as the colon has a special meaning in some contexts, leading to a syntax error.

#### ✅ Correct Agent Action:

1.  **Identify Problem Character:** The agent identifies the colon (`:`) within the node label as a potential point of failure.
2.  **Apply Quoting:** The agent wraps the entire label in double quotes to ensure it is interpreted as a single, literal string.
3.  **Provide Sanitized Output:** The agent generates the robust version of the code: `A["Node Text: With Details"]`. This renders correctly without errors.