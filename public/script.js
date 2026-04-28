// Firebase Setup
const firebaseConfig = {
  apiKey: "AIzaSyDjrkor7dIGsOfblg7pA-j2_sQjk66o8eY",
  authDomain: "uw-psc.firebaseapp.com",
  projectId: "uw-psc",
  storageBucket: "uw-psc.firebasestorage.app",
  messagingSenderId: "909858577066",
  appId: "1:909858577066:web:1c6ec24fe22a0723270ed3",
  measurementId: "G-ZP2TEXSHWT",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Auth State changed listener - update UI accordingly
auth.onAuthStateChanged(async (user) => {
  const navWelcome = document.getElementById("navWelcome");
  const navUserInfo = document.getElementById("navUserInfo");
  const navAuthBtns = document.getElementById("navAuthBtns");

  if (user) {
    document.body.classList.add("is-signed-in");

    // get role from Firestore (admin or member)
    const userDoc = await db.collection("users").doc(user.uid).get();
    const role = userDoc.data()?.role || "Member";

    if (role === "Admin") {
      document.body.classList.add("is-admin");
    } else {
      document.body.classList.remove("is-admin");
    }

    if (navWelcome) {
      const firstName = (user.displayName || "User").split(" ")[0];
      navWelcome.textContent = `Welcome, ${firstName}`;
    }

    loadAllComments();
    loadEvents();
    loadNextEvent();
  } else {
    document.body.classList.remove("is-signed-in");
    document.body.classList.remove("is-admin");
    showSignedOutCommentState();
    loadEvents();
    loadNextEvent();
  }
});

// Modal Helpers
function openModal(id) {
  document.getElementById(id)?.classList.add("is-active");
}
function closeModal(id) {
  document.getElementById(id)?.classList.remove("is-active");
}
function clearError(id) {
  const el = document.getElementById(id);
  if (el) el.textContent = "";
}

// DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  loadEvents();
  loadNextEvent();
  // open modals
  document.getElementById("openLoginModal")?.addEventListener("click", () => {
    clearError("loginError");
    openModal("loginModal");
  });
  document.getElementById("openSignupModal")?.addEventListener("click", () => {
    clearError("signupError");
    openModal("signupModal");
  });

  // close Modals
  document
    .getElementById("closeLoginModal")
    ?.addEventListener("click", () => closeModal("loginModal"));
  document
    .getElementById("closeSignupModal")
    ?.addEventListener("click", () => closeModal("signupModal"));
  document
    .getElementById("cancelLogin")
    ?.addEventListener("click", () => closeModal("loginModal"));
  document
    .getElementById("cancelSignup")
    ?.addEventListener("click", () => closeModal("signupModal"));

  document
    .getElementById("loginModal")
    ?.querySelector(".modal-background")
    ?.addEventListener("click", () => closeModal("loginModal"));
  document
    .getElementById("signupModal")
    ?.querySelector(".modal-background")
    ?.addEventListener("click", () => closeModal("signupModal"));

  // Hamburger menu toggle
  const burger = document.querySelector(".navbar-burger");
  const menu = document.getElementById("mainNavbar");
  burger?.addEventListener("click", () => {
    burger.classList.toggle("is-active");
    menu.classList.toggle("is-active");
  });
  // close menu when a nav link is clicked (for mobile) -- stackoverflow.com
  document
    .querySelectorAll("#mainNavbar a, #mainNavbar button")
    .forEach((el) => {
      el.addEventListener("click", () => {
        burger.classList.remove("is-active");
        menu.classList.remove("is-active");
      });
    });

  // Log In
  document
    .getElementById("loginSubmit")
    ?.addEventListener("click", async () => {
      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value;
      const errorEl = document.getElementById("loginError");

      if (!email || !password) {
        errorEl.textContent = "Please fill in all fields.";
        return;
      }

      try {
        await auth.signInWithEmailAndPassword(email, password);
        closeModal("loginModal");
        document.getElementById("loginEmail").value = "";
        document.getElementById("loginPassword").value = "";
      } catch (err) {
        errorEl.textContent = friendlyAuthError(err.code);
      }
    });

  // user can press Enter to submit login form stackoverflow.com
  ["loginEmail", "loginPassword"].forEach((id) => {
    document.getElementById(id)?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") document.getElementById("loginSubmit")?.click();
    });
  });

  //  Sign Up
  document
    .getElementById("signupSubmit")
    ?.addEventListener("click", async () => {
      const firstName = document.getElementById("signupFirstName").value.trim();
      const lastName = document.getElementById("signupLastName").value.trim();
      const email = document.getElementById("signupEmail").value.trim();
      const password = document.getElementById("signupPassword").value;
      const errorEl = document.getElementById("signupError");

      // Validation
      if (!firstName || !lastName || !email || !password) {
        errorEl.textContent = "Please fill in all fields.";
        return;
      }
      // Email must end with @wisc.edu and password must be at least 6 characters
      if (!email.toLowerCase().endsWith("@wisc.edu")) {
        errorEl.textContent = "Email must end in @wisc.edu.";
        return;
      }
      if (password.length < 6) {
        errorEl.textContent = "Password must be at least 6 characters.";
        return;
      }

      // error handling
      try {
        // Create auth user
        const cred = await auth.createUserWithEmailAndPassword(email, password);

        // Set display name on auth profile
        await cred.user.updateProfile({
          displayName: `${firstName} ${lastName}`,
        });

        //  Write to firestore users collection
        await db
          .collection("users")
          .doc(cred.user.uid)
          .set({
            Name: {
              First: firstName,
              Last: lastName,
            },
            email: email,
            role: "Member",
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          });

        closeModal("signupModal");
        document.getElementById("signupFirstName").value = "";
        document.getElementById("signupLastName").value = "";
        document.getElementById("signupEmail").value = "";
        document.getElementById("signupPassword").value = "";
      } catch (err) {
        // if an error occurs, use friendlyAuthError to show a user-friendly message instead of the raw Firebase error code
        errorEl.textContent = friendlyAuthError(err.code);
      }
    });

  // Log Out
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    auth.signOut();
  });

  // Contact Form write tocontact_messages collection - trim out whitespace
  const form = document.querySelector("#contactForm");
  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const subject = form.subject.value.trim();
      const message = form.message.value.trim();

      try {
        await db.collection("contact_messages").add({
          name: name,
          email: email,
          subject: subject,
          message: message,
          created_at: firebase.firestore.FieldValue.serverTimestamp(),
        });
        alert("Message submitted! We'll be in touch soon.");
        form.reset();
      } catch (err) {
        console.error("Error submitting contact form:", err);
        alert("There was an error submitting the message. Please try again.");
      }
    });
  }

  // When clicking register for event, if not logged in, open login modal instead of registering
  document.querySelectorAll(".register-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      if (!auth.currentUser) {
        e.preventDefault();
        e.stopImmediatePropagation();
        openModal("loginModal");
      }
    });
  });
  // When clicking on post comment, if not logged in, open login modal instead of posting
  document.querySelectorAll(".post-comment-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      if (!auth.currentUser) {
        e.preventDefault();
        e.stopImmediatePropagation();
        openModal("loginModal");
      }
    });
  });
});

// assign colors to categories for event creation and display
function getCategoryTagClass(category) {
  const map = {
    community: "is-red",
    cultural: "is-info",
    planning: "is-warning",
    educational: "is-link",
  };
  return map[(category || "").toLowerCase()] || "is-dark";
}
// format timestamps for firestore
function formatDate(ts) {
  if (!ts) return "TBD";
  const d = ts.toDate();
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
function formatTime(ts) {
  if (!ts) return "";
  return ts
    .toDate()
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
// build event cards from firestore
function buildEventCard(doc, showComments = true) {
  const e = doc.data();
  const eventId = doc.id;
  const start = e.event_datetime?.start_time;
  const end = e.event_datetime?.end_time;
  const tagClass = getCategoryTagClass(e.event_category);
  const commentsSection = showComments
    ? `
    <hr>
    <div class="mt-4 event-card-comments" data-event-id="${eventId}">
      <p class="title is-5 mb-4">
        <span class="icon has-text-green mr-1"><i class="fas fa-comment"></i></span>
        Comments (<span class="comment-count">0</span>)
      </p>
      <div class="commentscontainer"></div>
      <div class="mt-5 comments-section">
        <p class="title is-6 mb-3">Leave a Comment</p>
        <div class="field">
          <div class="control">
            <textarea class="textarea commenttextarea" placeholder="Write your comment here..." rows="3"></textarea>
          </div>
        </div>
        <div class="field">
          <div class="control">
            <button class="button is-green has-text-weight-bold postcommentbtn post-comment-btn" style="border-radius: 8px;">
              Post Comment
            </button>
          </div>
        </div>
      </div>
  `
    : "";
  const wrapper = document.createElement("div");
  wrapper.classList.add("column", "is-full", "px-6");
  wrapper.innerHTML = `
    <div class="box event-card">
      <div class="is-flex is-justify-content-space-between is-align-items-flex-start mb-2">
        <div>
          <p class="title is-4 mb-1">${escapeHtml(e.event_title)}</p>
          <p class="subtitle is-6 has-text-grey">${escapeHtml(e.event_subtitle || "")}</p>
        </div>
        <span class="tag ${tagClass} is-rounded" style="font-weight: 600;">${escapeHtml(e.event_category || "")}</span>
      </div>
      <div class="mb-4">
        <p class="mb-2">
          <span class="icon-text">
            <span class="icon has-text-green"><i class="fas fa-calendar"></i></span>
            <span>${formatDate(start)}</span>
          </span>
        </p>
        <p class="mb-2">
          <span class="icon-text">
            <span class="icon has-text-green"><i class="fas fa-clock"></i></span>
            <span>${formatTime(start)} – ${formatTime(end)}</span>
          </span>
        </p>
        <p class="mb-2">
          <span class="icon-text">
            <span class="icon has-text-green"><i class="fas fa-map-marker-alt"></i></span>
            <span>${escapeHtml(e.event_location || "")}</span>
          </span>
        </p>
      </div>
      <p class="mb-4 has-text-grey-dark">${escapeHtml(e.event_description || "")}</p>
      <button class="button is-green has-text-weight-bold register-btn" style="border-radius: 8p;" data-event-id="${eventId}">
        Register for Event
      </button>
      <button class="button is-link has-text-weight-bold admin-only view-rsvp-btn" 
        style="border-radius: 8px;" data-event-id="${eventId}" data-event-title="${escapeHtml(e.event_title)}">
        View RSVPs
      </button>
      <button class="button is-danger has-text-weight-bold admin-only delete-event-btn"
        style="border-radius: 8px;" data-event-id="${eventId}">
        Delete Event
      </button>
      ${commentsSection}
    </div>
  `;
  return wrapper;
}
// load all events without refreshing — events.html
function loadEvents() {
  const container = document.getElementById("eventsContainer");
  if (!container) return;
  db.collection("events")
    .orderBy("event_datetime.start_time", "asc")
    .onSnapshot((snapshot) => {
      container.innerHTML = "";
      if (snapshot.empty) {
        container.innerHTML = `
        <div class="column is-full px-6 has-text-centered py-6">
          <span class="icon is-large has-text-grey mb-3"><i class="fas fa-calendar-times fa-2x"></i></span>
          <p class="title is-5 has-text-grey">No Upcoming Events</p>
          <p class="has-text-grey-light">Check back soon — more events are on the way!</p>
        </div>
      `;
        return;
      }
      snapshot.forEach((doc) => {
        container.appendChild(buildEventCard(doc, true));
      });
      attachButtonListeners();
      syncRsvpButtonStates();
      loadAllComments();
      if (auth.currentUser) loadAllComments();
    });
}
// next upcoming event on homepage (only one)
function loadNextEvent() {
  const container = document.getElementById("nextEventContainer");
  if (!container) return;
  const now = new Date();
  db.collection("events")
    .orderBy("event_datetime.start_time", "asc")
    .get()
    .then((snapshot) => {
      container.innerHTML = "";
      let nextDoc = null;
      snapshot.forEach((doc) => {
        if (!nextDoc) {
          const start = doc.data().event_datetime?.start_time?.toDate();
          if (start && start >= now) nextDoc = doc;
        }
      });
      if (!nextDoc) {
        container.innerHTML = `
        <div class="column is-full px-6 has-text-centered py-6">
          <span class="icon is-large has-text-grey mb-3"><i class="fas fa-calendar-times fa-2x"></i></span>
          <p class="title is-5 has-text-grey">No Upcoming Events</p>
          <p class="has-text-grey-light">Check back soon — more events are on the way!</p>
        </div>
      `;
        return;
      }
      // hide comments section on homepage
      container.appendChild(buildEventCard(nextDoc, false));
      attachButtonListeners();
    })
    .catch((err) => console.error("Error loading next event:", err));
}
// sync RSVP button based on whether user has RSVPd to each event
function attachButtonListeners() {
  // register/rsvp
  document.querySelectorAll(".register-btn").forEach((btn) => {
    const fresh = btn.cloneNode(true);
    btn.replaceWith(fresh);
    fresh.addEventListener("click", function (e) {
      if (!auth.currentUser) {
        e.preventDefault();
        e.stopImmediatePropagation();
        openModal("loginModal");
      } else {
        handleRsvp(fresh);
      }
    });
  });

  // Post comment
  document.querySelectorAll(".postcommentbtn").forEach((btn) => {
    const fresh = btn.cloneNode(true);
    btn.replaceWith(fresh);
    fresh.addEventListener("click", async function (e) {
      // If logged out — open login modal
      if (!auth.currentUser) {
        e.preventDefault();
        e.stopImmediatePropagation();
        openModal("loginModal");
        return;
      }

      // If logged in — post the comment
      const user = auth.currentUser;
      const card = fresh.closest(".event-card-comments");
      const eventId = card?.dataset.eventId;
      const textarea = card?.querySelector(".commenttextarea");
      const text = textarea?.value.trim();

      if (!text || !eventId) return;

      const newComment = {
        comment_id: generateId(),
        name: user.displayName || "Anonymous",
        user_id: user.uid,
        text: text,
        "created-at": firebase.firestore.Timestamp.now(),
      };

      try {
        await db
          .collection("events")
          .doc(eventId)
          .update({
            comments: firebase.firestore.FieldValue.arrayUnion(newComment),
          });
        textarea.value = "";
      } catch (err) {
        console.error("Error posting comment:", err);
      }
    });
  });
  // View RSVPs (admin only)
  document.querySelectorAll(".view-rsvp-btn").forEach((btn) => {
    const fresh = btn.cloneNode(true);
    btn.replaceWith(fresh);
    fresh.addEventListener("click", async function () {
      const eventId = fresh.dataset.eventId;
      const eventTitle = fresh.dataset.eventTitle;

      // Modal title with event name
      document.getElementById("rsvpModalTitle").textContent =
        `RSVPs — ${eventTitle}`;

      const list = document.getElementById("rsvpList");
      list.innerHTML = `<p class="has-text-grey has-text-centered">Loading...</p>`;
      openModal("rsvpModal");

      try {
        const docSnap = await db.collection("events").doc(eventId).get();
        const registration = docSnap.data()?.registration || [];

        if (registration.length === 0) {
          list.innerHTML = `<p class="has-text-grey has-text-centered">No RSVPs yet.</p>`;
          return;
        }

        // Sort by rsvp_time ascending
        const sorted = [...registration].sort((a, b) => {
          return (
            (a.rsvp_time?.toMillis?.() || 0) - (b.rsvp_time?.toMillis?.() || 0)
          );
        });

        list.innerHTML = "";
        sorted.forEach((r, i) => {
          const ts = r.rsvp_time?.toDate?.();
          const dateStr = ts
            ? ts.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })
            : "Unknown";
          const timeStr = ts
            ? ts.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })
            : "";

          const row = document.createElement("div");
          row.classList.add("mb-3", "p-4");
          row.style.cssText =
            "background-color: #f5f5f5; border-left: 4px solid #00843d; border-radius: 4px;";
          row.innerHTML = `
          <div class="is-flex is-justify-content-space-between is-align-items-center">
            <div>
              <p class="has-text-weight-bold">${i + 1}. ${escapeHtml(r.user_name || "Unknown")}</p>
              <p class="has-text-grey is-size-7">${escapeHtml(r.user_email || "")}</p>
            </div>
            <p class="has-text-grey is-size-7">${dateStr} at ${timeStr}</p>
          </div>
        `;
          list.appendChild(row);
        });

        // Show total count
        document.getElementById("rsvpCount").textContent =
          `${registration.length} registered`;
      } catch (err) {
        console.error("Error loading RSVPs:", err);
        list.innerHTML = `<p class="has-text-danger has-text-centered">Error loading RSVPs.</p>`;
      }
    });
  });
}

// RSVP or un-RSVP to event
async function handleRsvp(btn) {
  const user = auth.currentUser;
  if (!user) return;

  const eventId = btn.dataset.eventId;
  if (!eventId) return;

  try {
    const docRef = db.collection("events").doc(eventId);
    const docSnap = await docRef.get();
    const registration = docSnap.data()?.registration || [];

    const alreadyRsvpd = registration.some((r) => r.user_id === user.uid);

    if (alreadyRsvpd) {
      // Un-RSVP
      const updated = registration.filter((r) => r.user_id !== user.uid);
      await docRef.update({ registration: updated });
      btn.textContent = "Register for Event";
      btn.classList.remove("is-light");
      btn.classList.add("is-green");
      btn.disabled = false;
    } else {
      // RSVP
      const rsvpEntry = {
        user_id: user.uid,
        user_email: user.email,
        user_name: user.displayName || "Anonymous",
        rsvp_time: firebase.firestore.Timestamp.now(),
      };
      await docRef.update({
        registration: firebase.firestore.FieldValue.arrayUnion(rsvpEntry),
      });
      btn.textContent = "Registered. (Click to cancel)";
      btn.classList.remove("is-green");
      btn.classList.add("is-light");
    }
  } catch (err) {
    console.error("RSVP error:", err);
  }
}

// Admin: Create Event
document
  .getElementById("adminEventSubmit")
  ?.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return;
    const title = document.getElementById("adminEventTitle").value.trim();
    const subtitle = document.getElementById("adminEventSubtitle").value.trim();
    const category = document.getElementById("adminEventCategory").value.trim();
    const location = document.getElementById("adminEventLocation").value.trim();
    const desc = document.getElementById("adminEventDesc").value.trim();
    const startVal = document.getElementById("adminEventStart").value;
    const endVal = document.getElementById("adminEventEnd").value;
    const errorEl = document.getElementById("adminEventError");
    if (!title || !category || !location || !desc || !startVal || !endVal) {
      errorEl.textContent = "Please fill in all required fields.";
      return;
    }
    const startTs = firebase.firestore.Timestamp.fromDate(new Date(startVal));
    const endTs = firebase.firestore.Timestamp.fromDate(new Date(endVal));
    // Get display name from Firestore
    const userDoc = await db.collection("users").doc(user.uid).get();
    const firstName =
      userDoc.data()?.Name?.First || user.displayName || "Admin";
    try {
      await db.collection("events").add({
        event_title: title,
        event_subtitle: subtitle,
        event_category: category,
        event_location: location,
        event_description: desc,
        event_created_by: firstName,
        event_datetime: {
          start_time: startTs,
          end_time: endTs,
        },
        created_at: firebase.firestore.Timestamp.now(),
        comments: [],
        registration: [],
      });
      closeModal("adminEventModal");
      // Clear form
      [
        "adminEventTitle",
        "adminEventSubtitle",
        "adminEventCategory",
        "adminEventLocation",
        "adminEventDesc",
        "adminEventStart",
        "adminEventEnd",
      ].forEach((id) => {
        document.getElementById(id).value = "";
      });
      errorEl.textContent = "";
    } catch (err) {
      console.error("Error creating event:", err);
      errorEl.textContent = "Error creating event. Please try again.";
    }
  });
// Open Admin Modal
document.getElementById("openAdminModal")?.addEventListener("click", () => {
  openModal("adminEventModal");
});
document.getElementById("closeAdminModal")?.addEventListener("click", () => {
  closeModal("adminEventModal");
});
document.getElementById("cancelAdminEvent")?.addEventListener("click", () => {
  closeModal("adminEventModal");
});

document.getElementById("closeRsvpModal")?.addEventListener("click", () => {
  closeModal("rsvpModal");
});
document.getElementById("cancelRsvpModal")?.addEventListener("click", () => {
  closeModal("rsvpModal");
});

// Delete event (admin only) - using event delegation since these buttons are dynamically generated - stackoverflow.com & GenAI
document.addEventListener("click", async function (e) {
  const btn = e.target.closest(".delete-event-btn");
  if (!btn) return;

  const eventId = btn.dataset.eventId;
  console.log("Delete clicked, eventId:", eventId);

  if (
    !confirm(
      "Are you sure you want to delete this event? This cannot be undone.",
    )
  )
    return;

  try {
    await db.collection("events").doc(eventId).delete();
    console.log("Event deleted successfully");
  } catch (err) {
    console.error("Error deleting event:", err);
    alert("Error deleting event. Please try again.");
  }
});

// end DOMContentLoaded

// Load Comments from Firestore - stackoverflow.com & GenAI
// Comments live as an array inside the event document
const commentListeners = [];

function loadAllComments() {
  commentListeners.forEach((unsub) => unsub());
  commentListeners.length = 0;

  document.querySelectorAll(".event-card-comments").forEach((card) => {
    const eventId = card.dataset.eventId;
    const commentsContainer = card.querySelector(".commentscontainer");
    const commentCount = card.querySelector(".comment-count");
    const commentsSection = card.querySelector(".comments-section");
    const signedOutMsg = card.querySelector(".signed-out-msg");

    if (!eventId || !commentsContainer) return;

    // Show comments section, hide signed-out message
    if (commentsSection) commentsSection.style.display = "block";
    if (signedOutMsg) signedOutMsg.style.display = "none";

    // Listener on the event document
    const unsub = db
      .collection("events")
      .doc(eventId)
      .onSnapshot((doc) => {
        if (!doc.exists) return;

        const data = doc.data();
        const comments = data.comments || [];

        commentsContainer.innerHTML = "";
        if (commentCount) commentCount.textContent = comments.length;

        // Sort by created-at ascending
        const sorted = [...comments].sort((a, b) => {
          const aTime = a["created-at"]?.toMillis?.() || 0;
          const bTime = b["created-at"]?.toMillis?.() || 0;
          return aTime - bTime;
        });

        sorted.forEach((comment) => {
          const ts = comment["created-at"]?.toDate?.();
          const dateStr = ts
            ? ts.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })
            : "Just now";

          // All users can delete their own comments. Admins can delete any comment
          const isOwner = auth.currentUser?.uid === comment.user_id;
          const isAdmin = document.body.classList.contains("is-admin");
          const canDelete = isOwner || isAdmin;

          const block = document.createElement("div");
          block.classList.add("mb-3", "p-4");
          block.style.cssText =
            "background-color: #f5f5f5; border-left: 4px solid #00843d; border-radius: 4px;";
          block.innerHTML = `
            <div class="is-flex is-justify-content-space-between mb-1">
              <p class="has-text-weight-bold">${escapeHtml(comment.name)}</p>
              <div class="is-flex is-align-items-center" style="gap: 0.5rem;">
                <p class="has-text-grey is-size-7">${dateStr}</p>
                ${canDelete ? `<button class="delete is-small delete-comment-btn" data-comment-id="${comment.comment_id}" data-event-id="${eventId}" title="Delete comment"></button>` : ""}
              </div>
            </div>
            <p>${escapeHtml(comment.text)}</p>
          `;

          // Attach delete listener if owner
          if (canDelete) {
            block
              .querySelector(".delete-comment-btn")
              ?.addEventListener("click", async function () {
                const cId = this.dataset.commentId;
                const eId = this.dataset.eventId;
                if (!confirm("Delete this comment?")) return;

                try {
                  const docRef = db.collection("events").doc(eId);
                  const docSnap = await docRef.get();
                  const existingComments = docSnap.data()?.comments || [];
                  const updated = existingComments.filter(
                    (c) => c.comment_id !== cId,
                  );
                  await docRef.update({ comments: updated });
                } catch (err) {
                  console.error("Error deleting comment:", err);
                }
              });
          }

          commentsContainer.appendChild(block);
        });
      });

    commentListeners.push(unsub);
  });
}

function showSignedOutCommentState() {
  document.querySelectorAll(".event-card-comments").forEach((card) => {
    const commentsSection = card.querySelector(".comments-section");
    const signedOutMsg = card.querySelector(".signed-out-msg");
    if (commentsSection) commentsSection.style.display = "none";
    if (signedOutMsg) signedOutMsg.style.display = "block";
  });
}

// Other functions needed
function generateId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Map Firebase auth error codes to friendly messages -- stacoverflow.com, Copilot
function friendlyAuthError(code) {
  const map = {
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/too-many-requests": "Too many attempts. Please wait and try again.",
    "auth/invalid-credential": "Invalid email or password.",
  };
  return map[code] || "Something went wrong. Please try again.";
}

function syncRsvpButtonStates() {
  const user = auth.currentUser;
  if (!user) return;

  document
    .querySelectorAll(".register-btn[data-event-id]")
    .forEach(async (btn) => {
      const eventId = btn.dataset.eventId;
      try {
        const docSnap = await db.collection("events").doc(eventId).get();
        const registration = docSnap.data()?.registration || [];
        const alreadyRsvpd = registration.some((r) => r.user_id === user.uid);
        if (alreadyRsvpd) {
          btn.textContent = "Registered (click to cancel)";
          btn.classList.remove("is-green");
          btn.classList.add("is-light");
        }
      } catch (err) {
        console.error("Error syncing RSVP state:", err);
      }
    });
}
