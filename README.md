# PSC Website

A multi-page student organization website built for the **UW–Madison Palestine Solidarity Committee** to centralize information, communicate events, and support member engagement through authentication, RSVPs, comments, and admin-managed content.

## Live Demo

Visit the live site here: [uw-psc.web.app](https://uw-psc.web.app/)

## Overview

The PSC Website was designed to serve as a polished, real-world digital hub for a campus organization. Rather than functioning as a simple static informational site, the platform combines a responsive public-facing experience with dynamic, database-backed features that allow members to interact with events and administrators to manage organization activity.

The project emphasizes both **technical implementation** and **practical usability**. It was built to help real users navigate key organization information, learn about the group’s mission, stay updated on events, submit contact inquiries, and engage with the organization through RSVP and comment functionality.

## Key Features

- **Multi-page organization website**
  - Home page with organization overview and upcoming event preview
  - About page covering mission, values, community, and activities
  - Events page with dynamic event listings and engagement features
  - Contact page with form-based outreach and organization contact details

- **Authentication and user state**
  - Log in and sign up flows using **Firebase Authentication**
  - Sign-up restrictions requiring a valid `@wisc.edu` email
  - Signed-in vs signed-out UI states across the site
  - Personalized navbar greeting for authenticated users
  - Logout controls and gated interactions based on auth status

- **Dynamic event system**
  - Event data rendered dynamically from **Cloud Firestore**
  - No hardcoded event listings
  - Homepage preview of the next upcoming event
  - RSVP and un-RSVP functionality tied to event data
  - Real-time updates for event content and user interactions

- **Community engagement features**
  - Event comments tied to authenticated users
  - Signed-out users are prompted to log in before viewing or posting comments
  - Contact form submissions stored in Firestore

- **Admin controls**
  - Admin-only ability to create and delete events
  - Admin access to RSVP data through modal-based workflows
  - Admin moderation and deletion of comments
  - Role-based access logic using Firestore user roles

- **Responsive UI**
  - Built with a mobile-friendly layout
  - Bulma navbar hamburger support for smaller screens
  - Auth-driven UI visibility and interaction states
  - Clear content architecture for real-world usability

## Tech Stack

### Frontend
- **HTML**
- **CSS**
- **Vanilla JavaScript**
- **Bulma**

### Backend / Platform Services
- **Firebase Authentication**
- **Cloud Firestore**
- **Firebase Hosting**

### Development / Collaboration
- **GitHub**
- **Scrum-style project organization**

## Project Highlights

- Built a **Firestore-backed campus organization platform** instead of a purely static student site
- Implemented **real-time event, RSVP, and comment functionality**
- Added **role-based admin features** for lightweight event and engagement management
- Designed a **responsive, multi-page experience** for real student organization use
- Combined **frontend development**, **authentication**, **database integration**, and **team-based project delivery**

## Project Structure

The site is organized as a multi-page web application with key public-facing pages such as:

- `index.html` — homepage and upcoming event preview
- `about.html` — organization mission, values, and background
- `events.html` — dynamic events, RSVPs, comments, and admin event actions
- `contact.html` — contact form and organization contact information

Supporting JavaScript and CSS handle:

- authentication state
- modal interactions
- Firestore reads and writes
- real-time event/comment rendering
- responsive navigation behavior
- UI visibility for signed-in and admin-only actions

## Core Functionality

### Authentication
Users can create an account and sign in using Firebase Authentication. The sign-up flow includes validation rules such as requiring a `@wisc.edu` email. Once authenticated, users see a personalized experience with updated navigation controls and access to member interaction features.

### Firestore-Backed Event Management
Events are stored in Firestore and rendered dynamically on the site, allowing the organization to manage content without hardcoding each event into the frontend. This improves maintainability and supports future scalability.

### RSVP and Comment Workflows
Authenticated users can engage with events directly by RSVPing and participating in comments. These interactions are stored in Firestore and update in real time, making the site feel more interactive and organization-centered.

### Role-Based Admin Access
Admin functionality is gated using user role information stored in Firestore. Admins can create events, delete events, review RSVPs, and moderate comments, enabling lightweight content management without a traditional separate admin dashboard.

## Firestore Data Model

The project uses Firestore collections such as:

### `users`
Stores registered user information, including:
- first name
- last name
- email
- role
- created timestamp

### `events`
Stores event data and associated engagement content, including:
- event details
- RSVP information
- comment objects
- metadata for rendering and interaction

### `contact_messages`
Stores submitted contact form entries, including:
- name
- email
- subject
- message
- created timestamp

## Technical Highlights

- **Real-time Firestore rendering** using `onSnapshot`
- **Auth-driven UI behavior** to avoid flashing unauthenticated content before Firebase resolves
- **Role-based admin gating** for protected actions
- **Event delegation** for dynamically rendered content
- **Schema-aligned Firestore CRUD operations**
- **Form validation** including required-field checks and `@wisc.edu` email restrictions
- **CSS-based UI state management** for signed-in, signed-out, and admin experiences
- **Modal-based workflows** for authentication and admin tasks
- **Debugging and refactoring** to improve reliability and reduce redundant logic

## Project Management Approach

This project was developed in a collaborative team environment and documented using **Scrum-style project management practices**, including:

- sprint-based planning
- backlog-style feature prioritization
- daily standups
- sprint reviews
- retrospectives
- iterative refinement based on feedback

In addition to technical implementation, the project required coordination around content gathering, page responsibilities, and organization-facing needs, making it a practical exercise in both software delivery and stakeholder-aware development.

## UX and Design Considerations

The site was built with a strong focus on usability and consistency. Key considerations included:

- a **clear multi-page information architecture**
- **consistent styling** and a cohesive visual identity
- intuitive navigation across public pages
- responsive behavior across desktop and mobile devices
- clear sign-in prompts for restricted actions
- user-friendly empty states and feedback messaging

These choices helped the project feel more like a real organization website than a classroom demo.

## Challenges and Lessons Learned

This project involved several practical challenges that strengthened both technical and project-management skills:

- adapting frontend behavior to an existing Firestore schema
- debugging Firebase initialization and script conflicts
- managing signed-in vs signed-out UI states cleanly
- ensuring dynamic content behaved correctly across pages
- balancing organization needs with technical scope
- coordinating responsibilities and handling content dependencies within a team

## Future Improvements

Potential future enhancements include:

- more granular Firestore permissions
- expanded admin tooling
- additional production hardening
- richer event discovery and calendar views
- announcements, newsletters, or gallery content
- formal accessibility and performance auditing

## Setup and Local Development

To run the project locally:

1. Clone the repository.
2. Open the project in your editor.
3. Create and configure a Firebase project.
4. Enable **Email/Password Authentication** in Firebase.
5. Set up **Cloud Firestore** with the expected collections.
6. Add your Firebase config to the appropriate frontend JavaScript files.
7. Serve the project locally using a simple local server.

## Deployment

The project is deployed at [uw-psc.web.app](https://uw-psc.web.app/) using **Firebase Hosting**.

A typical deployment workflow includes:

1. Installing Firebase tools
2. Logging into Firebase
3. Initializing hosting
4. Deploying through Firebase Hosting

## What This Project Demonstrates

This project showcases:

- frontend web development with **HTML, CSS, JavaScript, and Bulma**
- Firebase-based authentication and database integration
- responsive design for real-world users
- role-based feature control
- collaborative project execution
- technical documentation and project presentation
- building a polished product for an actual organization rather than a purely academic mockup

## Acknowledgments

Built for the **UW–Madison Palestine Solidarity Committee** as a digital platform to support community-building, communication, and event engagement.
