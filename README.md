# Pawsitive Pet Academy: Website

A responsive website for **Pawsitive Pet Academy**, a Durban-based pet care and training academy. Built by Neha Haripasath, Sivanesan Rasen, Haylee Alexander and Ali Gaffar for XHAW5112, Task 3.

## Links

| Item | Link |
|---|---|
| Published website | https://nehaharipasath.github.io/XHAW_FINAL_WEBSITE_ST10512418/ |
| Website and mobile app repository | https://github.com/NehaHaripasath/XHAW_FINAL_WEBSITE_ST10512418 |
| Mobile app | [`mobile-app/`](mobile-app/) in this repository |
| Video demonstration (YouTube) | https://youtu.be/JgIASkczmog |
| Website wireframes (Figma) | https://comic-mesh-29595720.figma.site |
| Mobile app wireframes (Figma) | https://blurry-clip-31638226.figma.site |
| PowerPoint presentation | [`presentation/Pawsitive_Pet_Academy_Presentation.pptx`](presentation/Pawsitive_Pet_Academy_Presentation.pptx) |




## Pages

- **Home:** a clean hero with a photo, a **Find a course** drop-down, links to all courses and the fee calculator, and three key facts
- **About Us:** history, vision, mission, goals and a photo
- **Courses:** six-month programmes, six-week short courses and a comparison table of all seven courses
- **Individual course pages:** purpose, content and fee for each of the 7 courses, with an add/remove button
- **Calculate Fees:** contact form, course checkboxes, intake drop-down, discount table and quote table
- **Contact:** phone, email, social links, venue address, a map marking the venue, a Get directions button and an office hours table

All pages live in `index.html` and switch with the URL hash (for example `#fees` or `#course-2`), so links, the back button and bookmarks all work.

## Task 3 requirements

| Requirement | Where it is |
|---|---|
| CSS | `css/style.css`: design tokens, layout, components, form states, tables, responsive and print rules |
| JavaScript | `js/script.js`: course data, rendering, validation, fee calculator, navigation, router |
| Drop-down menu | **Courses** drop-down in the main navigation (mouse, keyboard arrows and Escape). **Find a course** drop-down on the home page. **Preferred intake** drop-down on the fees form. |
| Error handling | Every fee-form field is checked on submit. Each field shows its own message, a summary box lists all problems with links to each field, and messages clear as soon as the field is fixed. Unknown page addresses fall back to Home. |
| Table | Course comparison table (Courses), discount tiers table and quote table (Calculate Fees), office hours table (Contact) |
| Matches the mobile app | Same seven courses, fees, discount tiers, 15% VAT and teal/coral palette |

## Fee rules

One course has no discount, two courses save 5%, three save 10% and more than three save 15%. 15% VAT is added after the discount. All money is calculated in whole cents so every row of the quote adds up. The result is a quote only.

| Example | Subtotal | Discount | VAT | Total |
|---|---|---|---|---|
| 1 course (Puppy Care) | R750.00 | none | R112.50 | R862.50 |
| 2 courses (Canine Obedience + Grooming) | R3 000.00 | 5%: -R150.00 | R427.50 | R3 277.50 |
| 3 courses (Canine Obedience + Grooming + Puppy Care) | R3 750.00 | 10%: -R375.00 | R506.25 | R3 881.25 |
| 4 six-month courses | R6 000.00 | 15%: -R900.00 | R765.00 | R5 865.00 |

## Validation

| Field | Accepted | Message when wrong |
|---|---|---|
| Name | Letters, spaces, hyphens, apostrophes, accents (Zoë, François) | Empty, contains numbers, or fewer than two letters |
| Phone | 10 digits starting with 0, or +27 / 27; spaces, dashes and brackets allowed | Empty, contains letters, or wrong length |
| Email | name@domain.tld | Empty or wrong format |
| Intake | January, April, July or October | Nothing chosen |
| Courses | At least one ticked | None ticked |

## Run it

No build step. Open `index.html` in a browser, or publish with GitHub Pages:

1. Push this folder to the repository's `main` branch.
2. On GitHub go to **Settings → Pages**, set **Source** to *Deploy from a branch*, choose `main` and `/ (root)`, then **Save**.
3. After a minute the site is live at `https://nehaharipasath.github.io/XHAW_FINAL_WEBSITE_ST10512418/`.

## Files

```
index.html          page structure (all views)
css/style.css       all styling
js/script.js        all behaviour
img/                pet photos
mobile-app/         the React Native (Expo) mobile app
presentation/       the PowerPoint presentation
README.md           this file
```

## Design

Teal and coral palette from the academy's brand: Deep Teal #0B5E5E, Teal #0F7C7C, Warm Coral #F4A259, Soft Cream #FAF6F0. Font: Trebuchet MS. Logo: paw print with a coral heart.

## Changes since Task 2

- CSS and JavaScript moved out of `index.html` into `css/style.css` and `js/script.js`.
- Added a **Courses drop-down** in the navigation and a **mobile menu button** for small screens.
- Error handling upgraded: a message under each field, specific messages (for example "cannot contain numbers"), linked error summary, errors clear when fixed, and the form now submits with the Enter key.
- Added tables: course comparison, discount tiers, office hours; the quote table now shows the amount after discount.
- Added a Print quote button and print styles.
- Hover and page-change animations, which are switched off for users who prefer reduced motion.
- Real pet photos on the home page, About Us, course cards and course pages.
- New home page: headline, **Find a course** drop-down, hero photo and three key facts.
- Contact page: venue street address, a map marking the venue and a Get directions button.
- Accessibility fixes: correct heading order, screen-reader text for the course counter, larger checkboxes, focus moves to each new page's heading, and a message for browsers with JavaScript turned off.

## Quality checks

Checked before submission:

- **HTML:** validated with html-validate, no errors.
- **CSS:** linted with stylelint (recommended rules), no errors.
- **JavaScript:** linted with ESLint (no undefined or unused variables, strict equality), no errors. No console errors on any page.
- **Accessibility:** axe-core scan (WCAG 2.2 AA and best practice) of every page, the open drop-down, the error state and the quote, at desktop and phone widths: 0 violations.
- **Functional tests:** about 90 automated checks covering every page and course address, invalid addresses, the back button, the drop-down with mouse and keyboard, the mobile menu, valid and invalid names, phone numbers and emails, every discount tier, form reset after a request, and no sideways scrolling at 320 px.

## Team

| Name | ST number | GitHub username |
|---|---|---|
| Neha Haripasath | ST10512418 | nehaharipasath |
| Sivanesan Rasen | ST10514044 | sivanesanrasen |
| Haylee Alexander | ST10504600 | hayleealexander |
| Ali Gaffar | ST10497389 | aligaffar |

## Photo credits

Pet photos are from Pixabay (via the free yavuzceliker/sample-images collection) and are used under the Pixabay Content License.
