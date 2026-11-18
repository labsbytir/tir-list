# Spec Delta

## Purpose
The homepage MUST present the catalog as a browsable tool directory with header navigation, search, category filtering, entry cards, and a contribution sidebar.

## ADDED Requirements

### Requirement: Directory layout
The page MUST render a sticky header (brand, category nav, submit action, mobile menu), a search + category control row, entry cards, and a sidebar with contribution actions.

#### Scenario: Browse and filter
- **WHEN** a visitor picks a category in the header nav or tabs, types in search, or taps a copy button
- **THEN** the grid filters, or the command is copied with visible confirmation

### Requirement: Entry cards
Each card MUST show mono title link, tag line, truncated description, and a meta footer.

#### Scenario: Scan entries
- **WHEN** a visitor scans the grid
- **THEN** every card shows title, tags, a two-line description, and its category
