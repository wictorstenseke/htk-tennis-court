# Tennis Booking System – Full Feature Stories

## Feature Status Overview

### 📋 Planned (18 features)

**Core Booking Features**
- 4. Highlight my own bookings
- 5. Quick suggested booking times + "Choose time" manual option
- 6. Preferred booking duration in profile
- 15. Opponent support in bookings
- 16. View booking history

**User Features**
- 17. Profile picture upload (override Gravatar)
- 18. Account deletion & anonymization

**Statistics Features**
- 19. Player statistics on profile
- 20. Statistics for ladder ranking
- 21. Admin statistics dashboard
- 22. "Bravery Prize" feature

**Tennis Ladder Features**
- 23. Join the ladder
- 24. Booking a ladder match
- 25. Reporting match results and winner
- 26. Ladder ranking logic and standings
- 27. Admin tools for ladder management
- 28. Handle walkovers in ladder matches

**Public Pages**
- 13. About the club – Membership via Swish

### ✅ Implemented (11 features)

**Core Booking Features**
- 1. Booking: Logged-in player books the court
- 2. Booking: Cancel my booking
- 3. Public schedule (no login)
- 14. Edit existing bookings

**User Features**
- 7. User profile: Spelarnamn, phone, Gravatar
- 8. User roles: user/admin/superuser

**Admin Features**
- 9. Admin page + access control
- 10. User management table (Admin → Users)
- 11. Toggle bookings on/off (season / maintenance)
- 12. Admin announcement / information section

---

## Detailed Feature Descriptions

Below is the full collection of all user stories discussed, including descriptions and acceptance criteria.

---

# Core Booking Features

## 1. Booking: Logged-in player books the court  
**Status:** [Implemented]

**Description**  
As a logged-in player, I want to see existing bookings and be able to book a free time via a modal, with automatic overlap validation.

**Acceptance Criteria**
1. Player must be logged in to see booking page.  
2. Existing bookings for the selected day are listed in format:  
   `Mon 15 Aug 14:00–16:00 [PlayerName]`  
3. “Book court” button opens a booking modal.  
4. Modal allows selecting date, start time, end time.  
5. Overlap validation prevents booking if times conflict.  
6. Successfully submitting creates a Firestore booking and updates the list immediately.

---

## 2. Booking: Cancel my booking  
**Status:** [Implemented]

**Description**  
As a logged-in player, I want to cancel my own bookings so others can use the court.

**Acceptance Criteria**
1. Only the player who booked the time sees a “Cancel” button.  
2. Cancel opens a confirmation modal.  
3. On confirm, the booking status becomes `"cancelled"` instead of deleting the document.  
4. Security rules ensure only the involved player can perform the cancellation.  
5. UI updates and booking is removed from the active list.

---

## 3. Public schedule (no login)  
**Status:** [Implemented]

**Description**  
As a visitor, I want to see which times are booked without seeing who booked them.

**Acceptance Criteria**
1. Page is publicly accessible.  
2. Shows booked times but hides names.  
3. “Log in to book” button is visible to visitors.  

---

## 4. Highlight my own bookings  
**Status:** [Planned]

**Description**  
As a logged-in player, I want my own bookings to be clearly highlighted.

**Acceptance Criteria**
1. Own bookings appear with visual marker (badge, color, icon).  
2. Other players’ bookings appear normal.  
3. Works consistently across dates and reloads.

---

## 5. Quick suggested booking times + "Choose time" manual option  
**Status:** [Started - Manual Entry Improved]

**Description**  
As a player, I want fast one-click booking suggestions, with the option to manually choose time.

**Acceptance Criteria**
1. System shows a list of free suggested time slots.  
2. Clicking a suggestion books immediately (after validation).  
3. ✅ “Choose time” button reveals manual time entry fields.  
4. ✅ Manual entry uses the same overlap validation.  
5. ✅ Manual time entry now uses autocomplete component with 15-minute increments and smart suggestions.  
6. ✅ Time input auto-fills with next 15-minute interval when date is selected.  
7. Suggestions respect player’s preferred booking duration (if set).

---

## 6. Preferred booking duration in profile  
**Status:** [Planned]

**Description**  
As a player, I want to set my preferred booking duration (e.g. 60/90/120 minutes) so suggestions match my habits.

**Acceptance Criteria**
1. Profile page has a "Preferred booking length" dropdown.  
2. Stored as `preferredBookingLengthMinutes`.  
3. Used when generating suggested time slots.  
4. Pre-fills end time in manual booking form.  
5. Fallback default if not set.

---

## 14. Edit existing bookings  
**Status:** [Implemented]

**Description**  
As a logged-in player, I want to edit my existing bookings to change the time or date if needed.

**Acceptance Criteria**
1. ✅ Only the player who booked the time sees an "Edit" button.  
2. ✅ Edit opens a modal with current booking details pre-filled.  
3. ✅ Overlap validation prevents editing to times that conflict with other bookings (excludes current booking from overlap check).  
4. ✅ Only involved players can edit the booking.  
5. ✅ Security rules ensure only authorized players can perform edits.  
6. ✅ UI updates immediately after successful edit.

---

## 15. Opponent support in bookings  
**Status:** [Planned - Backend Partially Implemented]

**Description**  
As a player, I want to optionally add an opponent to my booking so others can see who I'm playing with.

**Backend Implementation Status**  
✅ Backend infrastructure is already in place:
- `opponentUserId` field exists in Booking type and can be stored/updated
- Security rules support `opponentUserId` field (users can edit bookings where they are the opponent)
- `getInvolvedBookings()` function queries bookings where user is creator OR opponent
- `canEditBooking()` checks if user is creator or opponent
- `createBooking()` and `updateBooking()` support `opponentUserId` parameter

**Remaining Work**  
❌ UI implementation needed:
- Add opponent selection field to BookingModal
- Display opponent information in booking lists ("Player 1 vs Player 2" format)
- Allow opponent selection when editing existing bookings

**Acceptance Criteria**
1. Booking modal includes optional "Opponent" field.  
2. Opponent can be selected from list of registered players.  
3. Bookings display as "Player 1 vs Player 2" when opponent is attached.  
4. Both players can see the booking in their lists.  
5. Security rules support `opponentUserId` field (already implemented).  
6. Opponent can be added, edited, or removed from existing bookings.

---

## 16. View booking history  
**Status:** [Planned]

**Description**  
As a logged-in player, I want to view my booking history for the current and previous year.

**Acceptance Criteria**
1. Profile or dedicated page shows booking history.  
2. History includes current year and previous year.  
3. Shows both active and cancelled bookings.  
4. Displays date, time, opponent (if any), and status.  
5. Admins can view aggregated history for all users.  
6. History is paginated or filtered by year/month.

---

# User Features

## 7. User profile: Spelarnamn, phone, Gravatar  
**Status:** [Implemented]

**Description**  
As a player, I want to edit my display name ("Spelarnamn"), phone number, and have an automatic avatar via Gravatar.

**Acceptance Criteria**
1. Profile page accessible when logged in.  
2. Fields shown: displayName (editable), phone (editable), email (read-only), avatar.  
3. Gravatar is generated from email’s MD5 hash.  
4. profile saves back to `users/{uid}` with validation.  
5. Updated display name appears next to bookings.

---

## 8. User roles: user/admin/superuser  
**Status:** [Implemented]

**Description**  
As a superuser, I want to control user roles so that admin access can be granted when needed.

**Acceptance Criteria**
1. Each user has `role: "user" | "admin" | "superuser"`.  
2. Only superuser can modify roles.  
3. Admin and superuser see admin areas; user does not.  
4. Routes protected by role.

---

## 17. Profile picture upload (override Gravatar)  
**Status:** [Planned]

**Description**  
As a player, I want to upload a custom profile picture instead of using only Gravatar.

**Acceptance Criteria**
1. Profile page includes "Upload profile picture" option.  
2. Image upload replaces Gravatar when custom image is set.  
3. Fallback to Gravatar if no custom image is uploaded.  
4. Image is stored in Firebase Storage.  
5. Image validation (size, format, dimensions).  
6. Option to remove custom image and revert to Gravatar.

---

## 18. Account deletion & anonymization  
**Status:** [Planned]

**Description**  
As a user, I want to delete my account while preserving anonymized data for historical records.

**Acceptance Criteria**
1. Profile page includes "Delete account" option.  
2. Deletion requires confirmation with password or re-authentication.  
3. User data is anonymized (not deleted) with fake celebrity name replacement ("fiktivt kändisnamn").  
4. Stats and match history are preserved without breaking records.  
5. Bookings are anonymized but remain in system.  
6. User cannot log in after account deletion.  
7. Admin can see anonymized data but not original user identity.

---

# Admin Features

## 9. Admin page + access control  
**Status:** [Implemented]

**Description**  
As an admin or superuser, I want a dedicated admin page accessible via profile dropdown.

**Acceptance Criteria**
1. Profile dropdown shows “Admin” for admin/superuser only.  
2. Admin route `/admin` is protected via role guard.  
3. Superuser sees additional tools (e.g. user management).  
4. Regular users cannot access or see the admin menu.

---

## 10. User management table (Admin → Users)  
**Status:** [Implemented]

**Description**  
Admins can view all users; superusers can change roles.

**Acceptance Criteria**
1. Admin page includes `/admin/users`.  
2. Table lists displayName, email, role, createdAt.  
3. Admin sees table read-only.  
4. Superuser can edit role via dropdown (except their own).  
5. Firestore updates role on save.  
6. Errors show feedback; UI reverts on failure.

---

## 11. Toggle bookings on/off (season / maintenance)  
**Status:** [Implemented]

**Description**  
As an admin, I want to turn bookings off during off-season or maintenance and display a friendly message.

**Acceptance Criteria**
1. Admin can toggle `bookingsEnabled` in app settings.  
2. Admin can provide a custom `bookingsDisabledMessage`.  
3. If disabled:
   - “Book” button hidden/disabled.  
   - Message displayed to users.  
4. Booking creation blocked while disabled.  
5. Only admin/superuser can change the setting.

---

## 12. Admin announcement / information section  
**Status:** [Implemented]

**Description**  
As an admin, I want to publish a site-wide announcement with title, text, and links.

**Acceptance Criteria**
1. Admin section contains an "Announcement" editor.  
2. Fields: enabled, title, body, links[].  
3. When enabled, announcement shows on main pages.  
4. Hidden entirely when disabled.  
5. Independent of booking-off message.

---

# Statistics Features

## 19. Player statistics on profile  
**Status:** [Planned]

**Description**  
As a player, I want to see my match statistics displayed on my profile page.

**Acceptance Criteria**
1. Profile page shows statistics section.  
2. Displays: matches played, wins, losses, win rate.  
3. Shows favorite opponents ("Favoritmotståndare").  
4. Shows match history with dates and results.  
5. Statistics update automatically from match results.  
6. Statistics are visible to the player and optionally to others.

---

## 20. Statistics for ladder ranking  
**Status:** [Planned]

**Description**  
As a player, I want to see statistics integrated into ladder rankings to understand player performance.

**Acceptance Criteria**
1. Ladder standings include relevant statistics.  
2. Shows win/loss record for ladder matches.  
3. Displays match count and recent form.  
4. Statistics help inform ladder position beyond just wins/losses.  
5. Historical statistics preserved across ladder resets.

---

## 21. Admin statistics dashboard  
**Status:** [Planned]

**Description**  
As an admin, I want to see aggregated statistics about player activity and engagement.

**Acceptance Criteria**
1. Admin dashboard includes statistics section.  
2. Shows most active players.  
3. Displays winning streaks and notable achievements.  
4. Shows booking patterns and court usage statistics.  
5. Provides insights into ladder activity and participation.  
6. Statistics can be filtered by date range.

---

## 22. "Bravery Prize" feature  
**Status:** [Planned]

**Description**  
As part of the Tennis 2.0 vision, I want to recognize players who lose the most but keep playing.

**Acceptance Criteria**
1. System tracks players with most losses who continue playing.  
2. "Bravery Prize" is displayed on leaderboard or special section.  
3. Encourages participation regardless of win rate.  
4. Shows positive reinforcement for consistent play.  
5. Can be toggled on/off by admin.

---

# Tennis Ladder Features

## 23. Join the ladder  
**Status:** [Planned]

**Description**  
As a player, I want to join the official tennis ladder to participate in competitive matches.

**Acceptance Criteria**
1. Ladder page shows "Join ladder" button for eligible players.  
2. Player must be logged in to join.  
3. Joining adds player to ladder with initial ranking.  
4. Ladder information is visible even when logged out.  
5. Player can leave ladder (with admin approval or automatic handling).

---

## 24. Booking a ladder match  
**Status:** [Planned]

**Description**  
As a ladder participant, I want to book a court and create a ladder match in one flow.

**Acceptance Criteria**
1. Booking modal includes "Create ladder match" option.  
2. When selected, opponent selection is required.  
3. Booking creates both court booking and ladder match record.  
4. Both players are notified of the match.  
5. Match appears in ladder system awaiting result.  
6. Flow combines court booking with ladder match creation.

---

## 25. Reporting match results and winner  
**Status:** [Planned]

**Description**  
As a player who played a ladder match, I want to report the match result and winner.

**Acceptance Criteria**
1. Completed matches show "Report result" button.  
2. Form allows entering scores and selecting winner.  
3. Both players can report results (first report is accepted, second confirms).  
4. Result updates ladder rankings automatically.  
5. Match history is updated with result.  
6. Statistics are updated for both players.

---

## 26. Ladder ranking logic and standings  
**Status:** [Planned]

**Description**  
As a player, I want to see the current ladder standings and understand how rankings work.

**Acceptance Criteria**
1. Ladder page displays current standings.  
2. Shows player position, name, wins, losses, and ranking points.  
3. Ranking algorithm is transparent (documented or visible).  
4. Standings update automatically when results are reported.  
5. Historical standings can be viewed (previous seasons).  
6. Standings are publicly visible (even when logged out).

---

## 27. Admin tools for ladder management  
**Status:** [Planned]

**Description**  
As an admin, I want tools to manage the ladder including resets and season handling.

**Acceptance Criteria**
1. Admin section includes ladder management tools.  
2. Can reset ladder for new season.  
3. Can archive previous season data.  
4. Can manually adjust rankings if needed.  
5. Can remove players from ladder.  
6. Can view ladder statistics and activity.

---

## 28. Handle walkovers in ladder matches  
**Status:** [Planned]

**Description**  
As a player or admin, I want to handle walkovers (no-shows) in ladder matches appropriately.

**Acceptance Criteria**
1. Match reporting includes "Walkover" option.  
2. Walkover results in automatic win for the present player.  
3. Walkovers are tracked separately from regular wins.  
4. Only involved players can report walkover.  
5. Walkovers affect ladder rankings appropriately.  
6. Admin can review and adjust walkover results if needed.

---

# Public Pages

## 13. About the club – Membership via Swish  
**Status:** [Planned]

**Description**  
As a visitor, I want to easily pay the membership fee by scanning a Swish QR code.

**Acceptance Criteria**
1. "Become a member" section on About page.  
2. Shows membership fee amount.  
3. Shows Swish QR code.  
4. Optional fallback: Swish number + payment reference.  
5. Purely informational in v1 — no automatic membership activation needed.

---

# Future Ideas

These are potential features that have been discussed but need more definition before becoming full feature stories:

## UI/UX Improvements
- ✅ Editable time slots / selectable time UI component (predefined available slots shown, custom UI for picking times) - **Implemented: TimeAutocomplete component with autocomplete and 15-minute increments**
- Alternative list view / calendar view for bookings
- ✅ Making booking flow smoother with pre-filled times - **Implemented: Auto-fills time when date badge is selected, dropdown shows next 3 hours of available slots**
- Better display of time slots
- Highlighting rules (e.g., if off-season)
- ✅ Improved booking modal UI - **Implemented: Smaller, tighter modal with better time input UX**

## Ladder Features
- Custom ladders (player-created ladders with invitations)
- Ladder creation interface
- Ladder admin tools for custom ladders
- Accept/decline ladder invitations

## Security & Auth
- Enhanced Firestore rules for additional features
- Protecting role changes (already implemented, but may need expansion)
- Protecting booking edits (security rules)

## App Settings
- Expanded admin panel settings beyond bookings on/off
- Additional configuration options for admins

## Other Ideas
- Email notifications for bookings
- Recurring bookings
- Mobile app version
- Integration with payment systems
- Court availability calendar export (iCal)
- Match reminders and notifications