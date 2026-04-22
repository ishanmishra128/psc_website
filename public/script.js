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

// Auth State Observer
auth.onAuthStateChanged((user) => {
  const navWelcome = document.getElementById("navWelcome");
  const navUserInfo = document.getElementById("navUserInfo");
  const navAuthBtns = document.getElementById("navAuthBtns");

  if (user) {
    // Add signed-in class to body — CSS handles all visibility
    document.body.classList.add("is-signed-in");

    // Show welcome name
    if (navWelcome) {
      const firstName = (user.displayName || "User").split(" ")[0];
      navWelcome.textContent = `Welcome, ${firstName}`;
    }

    // Load comments if on events page
    loadAllComments();
  } else {
    // Remove signed-in class — CSS hides signed-in elements automatically
    document.body.classList.remove("is-signed-in");

    // Show signed-out comment state
    showSignedOutCommentState();
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
  // Open Modals
  document.getElementById("openLoginModal")?.addEventListener("click", () => {
    clearError("loginError");
    openModal("loginModal");
  });
  document.getElementById("openSignupModal")?.addEventListener("click", () => {
    clearError("signupError");
    openModal("signupModal");
  });

  //  Close Modals
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

  // Enter key support for login
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
      if (!email.toLowerCase().endsWith("@wisc.edu")) {
        errorEl.textContent = "Email must end in @wisc.edu.";
        return;
      }
      if (password.length < 6) {
        errorEl.textContent = "Password must be at least 6 characters.";
        return;
      }

      try {
        // Create auth user
        const cred = await auth.createUserWithEmailAndPassword(email, password);

        // Set display name on auth profile
        await cred.user.updateProfile({
          displayName: `${firstName} ${lastName}`,
        });

        //  Write to Firestore `users` collection
        // Matches your schema: Name (map), email, role, createdAt
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
        errorEl.textContent = friendlyAuthError(err.code);
      }
    });

  // Log Out
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    auth.signOut();
  });

  // Contact Form contact_messages collection
  const form = document.querySelector("#contactForm");
  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const subject = form.subject.value.trim();
      const message = form.message.value.trim();

      try {
        // Matches your schema: name, email, subject, message, created_at
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
        alert("There was an error submitting your message. Please try again.");
      }
    });
  }

  // ── Prompt sign-in on Register button click when logged out ──
  document.querySelectorAll(".register-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      if (!auth.currentUser) {
        e.preventDefault();
        e.stopImmediatePropagation();
        openModal("loginModal");
      }
    });
  });
  // ── Prompt sign-in on Comment button click when logged out ──
  document.querySelectorAll(".post-comment-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      if (!auth.currentUser) {
        e.preventDefault();
        e.stopImmediatePropagation();
        openModal("loginModal");
      }
    });
  });

  //  Post Comment
  // Comments stored as an array inside the event document
  document.querySelectorAll(".postcommentbtn").forEach((btn) => {
    btn.addEventListener("click", async function () {
      const user = auth.currentUser;
      if (!user) return;

      const card = btn.closest(".event-card-comments");
      const eventId = card?.dataset.eventId;
      const textarea = card?.querySelector(".commenttextarea");
      const text = textarea?.value.trim();

      if (!text || !eventId) return;

      // Build comment map matching your schema exactly
      const newComment = {
        comment_id: generateId(),
        name: user.displayName || "Anonymous",
        user_id: user.uid,
        text: text,
        "created-at": firebase.firestore.FieldValue.serverTimestamp(),
      };

      try {
        // arrayUnion appends to the comments array in the event document
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
}); // end DOMContentLoaded

// Load Comments from Firestore
// Comments live as an array inside the event document (not a subcollection)
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

    // Real-time listener on the event document
    const unsub = db
      .collection("events")
      .doc(eventId)
      .onSnapshot((doc) => {
        if (!doc.exists) return;

        const data = doc.data();
        const comments = data.comments || [];

        commentsContainer.innerHTML = "";
        if (commentCount) commentCount.textContent = comments.length;

        // Sort by created-at ascending (note the hyphen in your schema)
        const sorted = comments.slice().sort((a, b) => {
          const aTime = a["created-at"]?.toMillis?.() ?? 0;
          const bTime = b["created-at"]?.toMillis?.() ?? 0;
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

          const block = document.createElement("div");
          block.classList.add("commentblock", "mb-3", "p-4");
          block.innerHTML = `
            <div class="is-flex is-justify-content-space-between mb-1">
              <p class="has-text-weight-bold">${escapeHtml(comment.name)}</p>
              <p class="has-text-grey is-size-7">${dateStr}</p>
            </div>
            <p>${escapeHtml(comment.text)}</p>`;
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

// Map Firebase auth error codes to friendly messages
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
