// ─────────────────────────────────────────
// HELPER — show message on screen
function showMessage(text, type) {
  const box = document.getElementById("message");
  box.textContent = text;
  box.className = `glass-alert ${type}`;
  box.style.display = "block";
}

// ─────────────────────────────────────────
// REGISTER

// Email format validator
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
const registerBtn = document.getElementById("registerBtn");

if (registerBtn) {
  registerBtn.addEventListener("click", async () => {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // Basic frontend validation
    if (!name || !email || !password) {
      showMessage("All fields are required", "danger");
      return;
    }

    if (!isValidEmail(email)) {
      showMessage("Please enter a valid email address", "danger");
      return;
    }

    if (password.length < 6) {
      showMessage("Password must be at least 6 characters", "danger");
      return;
    }

    try {
      // Disable button while request is in flight
      registerBtn.disabled = true;
      registerBtn.textContent = "Creating account...";

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage("Account created! Redirecting to login...", "success");
        setTimeout(() => {
          window.location.href = "/login.html";
        }, 1500);
      } else {
        showMessage(data.message, "danger");
        registerBtn.disabled = false;
        registerBtn.textContent = "Create Account";
      }
    } catch (error) {
      showMessage("Something went wrong. Try again.", "danger");
      registerBtn.disabled = false;
      registerBtn.textContent = "Create Account";
    }
  });
}

// Register page — Enter moves to next field
const nameInput = document.getElementById("name");
const emailInputReg = document.getElementById("email");
const passwordInputReg = document.getElementById("password");

if (nameInput) {
  nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      emailInputReg.focus();
    }
  });
}

if (emailInputReg && registerBtn) {
  emailInputReg.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      passwordInputReg.focus();
    }
  });
}

// Register page — press Enter on any field
const registerInputs = document.querySelectorAll("#name, #email, #password");
registerInputs.forEach((input) => {
  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && registerBtn) registerBtn.click();
    });
  }
});

// ─────────────────────────────────────────
// LOGIN
const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      showMessage("All fields are required", "danger");
      return;
    }
    if (!isValidEmail(email)) {
      showMessage("Please enter a valid email address", "danger");
      return;
    }

    try {
      loginBtn.disabled = true;
      loginBtn.textContent = "Logging in...";

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save token and user info to localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        showMessage("Login successful! Redirecting...", "success");
        setTimeout(() => {
          window.location.href = "/dashboard.html";
        }, 1000);
      } else {
        showMessage(data.message, "danger");
        loginBtn.disabled = false;
        loginBtn.textContent = "Login";
      }
    } catch (error) {
      showMessage("Something went wrong. Try again.", "danger");
      loginBtn.disabled = false;
      loginBtn.textContent = "Login";
    }
  });
}

// Login page — Enter on email moves to password
const loginEmail = document.getElementById("email");
const loginPassword = document.getElementById("password");

if (loginEmail && loginBtn) {
  loginEmail.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      loginPassword.focus();
    }
  });
}

// Login page — press Enter on any field
const loginInputs = document.querySelectorAll("#email, #password");
loginInputs.forEach((input) => {
  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && loginBtn) loginBtn.click();
    });
  }
});
