# Spec Delta

## Purpose

Static catalog lets visitors browse and search modern web tools across Skills, MCP Servers, AI Models, and Linux Flavors without a backend.

## ADDED Requirements

### Requirement: Category browsing

The site MUST show items grouped by the four fixed categories.

#### Scenario: View all categories

- **WHEN** a visitor loads `/`
- **THEN** items from skills, mcp-servers, ai-models, and linux-flavors are visible grouped/filterable by category

### Requirement: Search and filter

The site MUST narrow visible cards by text query and by single category.

#### Scenario: Filter by query and category

- **WHEN** a visitor types a query or selects a category tab
- **THEN** only cards matching both the query (name/description/tags) and the category remain visible

### Requirement: Static, linkable entries

Each entry MUST show name, description, tags, and outbound URL.

#### Scenario: Open entry link

- **WHEN** a visitor clicks an entry name
- **THEN** the entry URL opens (external link)
