# Spec Delta

## Purpose
Anyone MUST be able to comment without an account, with art avatars, spam held automatically, and reports actioned.

## ADDED Requirements

### Requirement: Anonymous posting
First visit MUST set a stable anon id cookie; posting with it MUST work and show the art avatar.

#### Scenario: Anonymous post
- **WHEN** a signed-out visitor posts
- **THEN** the comment appears under an anon name with a generated avatar

### Requirement: Auto-mod + reports
Spammy posts MUST be hidden on arrival; 3 reports MUST hide a comment.

#### Scenario: Spam flood
- **WHEN** a post has 4+ links or banned patterns
- **THEN** it is stored flagged and never listed
