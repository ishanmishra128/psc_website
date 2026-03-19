// message form
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#contactForm");

  form.addEventListener("submit", function (e) {
    e.preventDefault(); // prevent refresh

    const name = form.name.value;
    const email = form.email.value;
    const subject = form.subject.value;
    const message = form.message.value;

    console.log({ name, email, subject, message });

    alert("Message submitted!");

    form.reset();
  });
});

document
  .querySelector(".post-comment-btn")
  .addEventListener("click", function () {
    const textarea = document.querySelector(".comment-textarea");
    const text = textarea.value.trim();

    if (!text) return;

    const commentsContainer = document.querySelector(".comments-container");

    const newComment = document.createElement("div");
    newComment.classList.add("comment-block", "mb-3", "p-4");
    newComment.innerHTML = `
      <div class="is-flex is-justify-content-space-between mb-1">
        <p class="has-text-weight-bold">You</p>
        <p class="has-text-grey is-size-7">Just now</p>
      </div>
      <p>${text}</p>
    `;

    commentsContainer.appendChild(newComment);
    textarea.value = "";
  });
