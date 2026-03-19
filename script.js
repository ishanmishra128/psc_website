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
