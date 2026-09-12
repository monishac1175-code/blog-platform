document.addEventListener("DOMContentLoaded", () => {

    // ==============================
    // API CONFIGURATION
    // ==============================

    // Local backend for testing
    const API_URL = "http://localhost:5000";


    // ==============================
    // GET HTML ELEMENTS
    // ==============================

    const registerForm = document.getElementById("registerForm");

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput =
        document.getElementById("confirmPassword");

    const togglePassword =
        document.getElementById("togglePassword");

    const toggleConfirmPassword =
        document.getElementById("toggleConfirmPassword");

    const strengthBar =
        document.getElementById("strengthBar");

    const strengthText =
        document.getElementById("strengthText");

    const terms =
        document.getElementById("terms");

    const message =
        document.getElementById("message");

    const registerBtn =
        document.getElementById("registerBtn");

    const buttonText =
        document.getElementById("buttonText");

    const buttonLoader =
        document.getElementById("buttonLoader");


    // ==============================
    // SHOW / HIDE PASSWORD
    // ==============================

    if (togglePassword && passwordInput) {

        togglePassword.addEventListener("click", () => {

            if (passwordInput.type === "password") {

                passwordInput.type = "text";
                togglePassword.textContent = "🙈";

            } else {

                passwordInput.type = "password";
                togglePassword.textContent = "👁";

            }

        });

    }


    // ==============================
    // SHOW / HIDE CONFIRM PASSWORD
    // ==============================

    if (toggleConfirmPassword && confirmPasswordInput) {

        toggleConfirmPassword.addEventListener("click", () => {

            if (confirmPasswordInput.type === "password") {

                confirmPasswordInput.type = "text";
                toggleConfirmPassword.textContent = "🙈";

            } else {

                confirmPasswordInput.type = "password";
                toggleConfirmPassword.textContent = "👁";

            }

        });

    }


    // ==============================
    // PASSWORD STRENGTH
    // ==============================

    if (passwordInput) {

        passwordInput.addEventListener("input", () => {

            const password = passwordInput.value;

            updatePasswordStrength(password);

        });

    }


    function updatePasswordStrength(password) {

        if (!strengthBar || !strengthText) {
            return;
        }


        if (password.length === 0) {

            strengthBar.style.width = "0%";
            strengthText.textContent = "Password strength";

            strengthBar.className = "";
            strengthText.className = "";

            return;

        }


        let strength = 0;


        // Length
        if (password.length >= 6) {
            strength++;
        }


        // Uppercase
        if (/[A-Z]/.test(password)) {
            strength++;
        }


        // Lowercase
        if (/[a-z]/.test(password)) {
            strength++;
        }


        // Number
        if (/[0-9]/.test(password)) {
            strength++;
        }


        // Special character
        if (/[^A-Za-z0-9]/.test(password)) {
            strength++;
        }


        // Weak
        if (strength <= 2) {

            strengthBar.style.width = "30%";
            strengthText.textContent = "Weak password";

            strengthBar.className = "weak";
            strengthText.className = "weak";

        }


        // Medium
        else if (strength <= 4) {

            strengthBar.style.width = "65%";
            strengthText.textContent = "Medium password";

            strengthBar.className = "medium";
            strengthText.className = "medium";

        }


        // Strong
        else {

            strengthBar.style.width = "100%";
            strengthText.textContent = "Strong password";

            strengthBar.className = "strong";
            strengthText.className = "strong";

        }

    }


    // ==============================
    // REGISTER FORM
    // ==============================

    if (!registerForm) {
        console.error("Register form not found.");
        return;
    }


    registerForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        // Get values
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;


        // ==============================
        // VALIDATION
        // ==============================

        if (!name || !email || !password || !confirmPassword) {

            showMessage(
                "Please fill in all fields.",
                "error"
            );

            return;
        }


        // Name validation
        if (name.length < 2) {

            showMessage(
                "Name must contain at least 2 characters.",
                "error"
            );

            return;
        }


        // Email validation
        if (!isValidEmail(email)) {

            showMessage(
                "Please enter a valid email address.",
                "error"
            );

            return;
        }


        // Password validation
        if (password.length < 6) {

            showMessage(
                "Password must contain at least 6 characters.",
                "error"
            );

            return;
        }


        // Confirm password
        if (password !== confirmPassword) {

            showMessage(
                "Passwords do not match.",
                "error"
            );

            return;
        }


        // Terms
        if (terms && !terms.checked) {

            showMessage(
                "Please agree to the BLOGVERSE terms.",
                "error"
            );

            return;
        }


        // ==============================
        // LOADING STATE
        // ==============================

        setLoading(true);


        try {

            // ==============================
            // SEND REGISTRATION REQUEST
            // ==============================

            const response = await fetch(
                `${API_URL}/api/auth/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password
                    })
                }
            );


            // Try to read JSON response
            let data = {};

            try {
                data = await response.json();
            } catch (jsonError) {
                data = {};
            }


            // ==============================
            // REGISTRATION FAILED
            // ==============================

            if (!response.ok) {

                showMessage(
                    data.message ||
                    "Registration failed. Please try again.",
                    "error"
                );

                setLoading(false);

                return;
            }


            // ==============================
            // SAVE USER INFORMATION
            // ==============================

            if (data.token) {

                localStorage.setItem(
                    "token",
                    data.token
                );

            }


            if (data.user) {

                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );

            }


            // ==============================
            // SUCCESS
            // ==============================

            showMessage(
                "Account created successfully! Redirecting...",
                "success"
            );


            setTimeout(() => {

                window.location.href = "dashboard.html";

            }, 1000);


        } catch (error) {

            console.error(
                "Registration error:",
                error
            );


            showMessage(
                "Unable to connect to the server. Make sure your backend is running.",
                "error"
            );


            setLoading(false);

        }

    });


    // ==============================
    // EMAIL VALIDATION
    // ==============================

    function isValidEmail(email) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    }


    // ==============================
    // SHOW MESSAGE
    // ==============================

    function showMessage(text, type) {

        if (!message) {
            return;
        }


        message.textContent = text;

        message.className = `auth-message ${type}`;

        message.style.display = "block";

    }


    // ==============================
    // LOADING BUTTON
    // ==============================

    function setLoading(loading) {

        if (registerBtn) {
            registerBtn.disabled = loading;
        }


        if (buttonText) {

            buttonText.textContent =
                loading
                    ? "Creating Account..."
                    : "Create Account";

        }


        if (buttonLoader) {

            buttonLoader.style.display =
                loading ? "inline-block" : "none";

        }

    }


    // ==============================
    // CLEAR ERROR MESSAGE
    // ==============================

    const inputs = [
        nameInput,
        emailInput,
        passwordInput,
        confirmPasswordInput
    ];


    inputs.forEach((input) => {

        if (!input) {
            return;
        }


        input.addEventListener("input", () => {

            if (message) {
                message.style.display = "none";
            }

        });

    });

});