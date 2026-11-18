# Spec Delta

## Purpose

The catalog shell paints immediately and the catalog body arrives afterward as a deferred server island, so a visitor sees the page before the cards finish rendering.

## ADDED Requirements

### Requirement: Shell paints before the catalog

The home page and each listing page MUST show their shell (title, search, navigation) before the catalog body is ready, and MUST show fallback content in the catalog's place until it arrives.

#### Scenario: Home loads

- **WHEN** a visitor loads `/`
- **THEN** the hero and search are visible before the category columns, and a fallback is visible where the columns will appear

#### Scenario: Listing loads

- **WHEN** a visitor loads a listing page
- **THEN** the breadcrumb and page title are visible before the listing body, and a fallback is visible where the body will appear

### Requirement: Catalog body replaces the fallback

The fallback MUST be replaced by the server-rendered catalog once the deferred island resolves. The visitor MUST NOT be left on the fallback after a successful load.

#### Scenario: Columns arrive

- **WHEN** the home island resolves
- **THEN** the six category columns replace the fallback and each card links to its listing

#### Scenario: Listing body arrives

- **WHEN** the listing island resolves
- **THEN** the facts, verdict, pricing, built-with, and install content replace the fallback

### Requirement: Serializable island data

Data sent to a deferred island MUST be plain JSON. A failed island request MUST leave the fallback visible and MUST NOT return a client error caused by the proxy rewriting the response.

#### Scenario: Island request succeeds

- **WHEN** the browser requests a deferred island
- **THEN** the response is successful and contains the rendered catalog markup

#### Scenario: Island request fails

- **WHEN** the deferred island request fails
- **THEN** the fallback stays visible and the rest of the page remains usable
