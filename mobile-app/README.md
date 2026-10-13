# Pawsitive Pet Academy: Mobile App

A React Native (Expo) mobile app for **Pawsitive Pet Academy**, a Durban-based pet care and training academy founded by Sarah Smith. Users can browse courses, read course details, get a fee quote with discounts and VAT, and find the academy's contact details.

Built by [Group name] for XHAW5112, Task 3. It has the same courses, fees, discount rules, colours and logo as the Pawsitive Pet Academy website.

## Features

- **Home:** short introduction to the academy with links to the course lists and fee calculator.
- **About Us:** history, vision, mission and goals.
- **Courses:** six-month programmes and six-week short courses, each linking to its own page, plus a table comparing all seven courses.
- **Course details:** purpose, content and fee for each of the 7 courses, with an add/remove selection button.
- **Calculate Fees:** contact form, course checkboxes, preferred-intake drop-down, discount table and a quote table. A badge on the Fees tab shows how many courses are selected.
- **Contact:** tap-to-call, tap-to-email, tappable social links, venue address, office hours table and an embedded map.

## Fee rules

| Courses selected | Discount |
|---|---|
| 1 | None |
| 2 | 5% |
| 3 | 10% |
| More than 3 | 15% |

The discount is applied to the subtotal, then 15% VAT is added to the discounted amount. All money is calculated in whole cents so every row of the quote adds up exactly. The result is a **quote only**, not an invoice.

| Course | Type | Fee |
|---|---|---|
| Canine Obedience Training | Six-month | R1500 |
| Pet Grooming | Six-month | R1500 |
| Animal Behaviour | Six-month | R1500 |
| Pet Business Management | Six-month | R1500 |
| Puppy Care | Six-week | R750 |
| Pet First Aid | Six-week | R750 |
| Basic Dog Walking | Six-week | R750 |

## Validation and error handling

The quote only calculates when every check passes. Each problem is shown under its field (outlined in red) and listed in a summary box, and a field's message clears as soon as it is fixed. The rules match the website:

- Name: letters (including accents, such as Zoë), spaces, hyphens and apostrophes; at least two letters; no numbers
- Phone: South African number, 10 digits starting with 0, or +27 / 27; spaces, dashes and brackets allowed
- Email: valid address format
- Preferred intake: must be chosen from the drop-down
- Courses: at least one must be selected

Changing a course selection clears any old quote, so an out-of-date price is never shown. After a consultant request, the form resets so the same request cannot be sent twice.

## Data structures

- `courses`: array of course objects (name, fee, type, purpose, content list)
- `selected`: array of the course indexes the user has chosen
- `enquiries`: array of confirmed quote requests (name, phone, email, intake, courses, total)

## Tech stack

- React Native 0.86 with Expo SDK 57
- `react-native-webview` for the map on the Contact screen
- `react-native-safe-area-context` so the header and tab bar clear the phone's notch and gesture bar
- `expo-splash-screen` for the branded splash screen
- No navigation library: screens are switched with component state and a bottom tab bar; the Android back button returns to the previous screen

## Project structure

```
mobile-app/
├── App.js            # all screens, logic and styles
├── index.js          # Expo entry point
├── app.json          # Expo app configuration (name, icons, splash)
├── package.json      # dependencies and scripts
├── package-lock.json
├── assets/           # logo, app icon, Android icons, splash and favicon
├── .gitignore
└── README.md
```

## Getting started

**Prerequisites:** Node.js (LTS), plus the Expo Go app on your phone or an Android emulator.

1. Clone the repository and open the folder:
   ```
   git clone https://github.com/NehaHaripasath/XHAW_FINAL_WEBSITE_ST10512418.git
   cd XHAW_FINAL_WEBSITE_ST10512418/mobile-app
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the app:
   ```
   npx expo start
   ```
   Scan the QR code with Expo Go (make sure Expo Go is up to date, as it must support SDK 57), or press `a` to open the Android emulator.

## Design

The app follows the high-fidelity wireframes designed in Figma: [Figma link]

| Colour | Hex |
|---|---|
| Deep Teal | #0B5E5E |
| Teal | #0F7C7C |
| Warm Coral | #F4A259 |
| Soft Cream | #FAF6F0 |
| Charcoal | #4A4A4A |

## Quality checks

- **Builds:** the app bundles for both Android and iOS with `npx expo export` with no errors.
- **Expo Doctor:** all offline project checks pass.
- **Lint:** ESLint with Expo's rules (`eslint-config-expo`): no errors or warnings.
- **Functional tests:** automated checks of every tab, a course page, adding and removing courses, the Fees badge, typing in the form, valid and invalid names, phone numbers and emails, the intake drop-down, every discount tier (totals match the website exactly), clearing of old quotes, and form reset after a request.

## Changes since Task 2

- Fixed a bug where text boxes lost focus after every letter typed (screens were being re-created on each keystroke).
- Money now calculated in whole cents, so totals always match the website (for example R8 064.38 for all seven courses).
- Validation now matches the website: accented names, +27 phone numbers, a message under each field, and errors that clear when fixed.
- Old quotes are cleared when the course selection changes; the form resets after a consultant request.
- Added a course comparison table, discount table, office hours table and a selected-courses badge on the Fees tab.
- Added the paw-and-heart logo, app icons and a branded splash screen.
- Added safe-area support for notched phones, Android back-button handling, bigger tap targets and screen-reader labels.

## Team

| Name | ST number | GitHub username | Role |
|---|---|---|---|
| [Name] | [ST number] | [username] | [Role] |
| [Name] | [ST number] | [username] | [Role] |
| [Name] | [ST number] | [username] | [Role] |
| [Name] | [ST number] | [username] | [Role] |

## Known limitations

- Quote requests are stored in memory only and are cleared when the app closes. There is no back end yet.
- Contact details and the venue address are placeholders.
- Course images are emoji stand-ins for real photos.

## Academic note

This project was created for coursework at [Institution]. It is not affiliated with a real business.
