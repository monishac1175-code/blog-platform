document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // GET HTML ELEMENTS
    // ==========================================

    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const togglePassword = document.getElementById("togglePassword");
    const message = document.getElementById("message");
    const loginBtn = document.getElementById("loginBtn");
    const buttonText = document.getElementById("buttonText");
    const buttonLoader = document.getElementById("buttonLoader");
    const forgotPassword = document.getElementById("forgotPassword");


    // ==========================================
    // SHOW / HIDE PASSWORD
    // ==========================================

    if (togglePassword && passwordInput) {

        togglePassword.addEventListener("click", () => {

            if (passwordInput.type === "password") {

                passwordInput.type = "text";

                togglePassword.innerHTML =
                    '<i class="fa-regular fa-eye-slash"></i>';

                togglePassword.setAttribute(
                    "aria-label",
                    "Hide password"
                );

            } else {

                passwordInput.type = "password";

                togglePassword.innerHTML =
                    '<i class="fa-regular fa-eye"></i>';

                togglePassword.setAttribute(
                    "aria-label",
                    "Show password"
                );
            }

        });

    }


    // ==========================================
    // FORGOT PASSWORD
    // ==========================================

    if (forgotPassword) {

        forgotPassword.addEventListener("click", (event) => {

            event.preventDefault();

            showMessage(
                "Password reset feature will be available soon.",
                "info"
            );

        });

    }


    // ==========================================
    // LOGIN FORM
    // ==========================================

    if (loginForm) {

        loginForm.addEventListener("submit", async (event) => {

            event.preventDefault();


            // Get values

            const email = emailInput.value.trim();

            const password = passwordInput.value;


            // ======================================
            // VALIDATION
            // ======================================

            if (!email || !password) {

                showMessage(
                    "Please enter your email and password.",
                    "error"
                );

                return;
            }


            if (!isValidEmail(email)) {

                showMessage(
                    "Please enter a valid email address.",
                    "error"
                );

                return;
            }


            if (password.length < 6) {

                showMessage(
                    "Password must contain at least 6 characters.",
                    "error"
                );

                return;
            }


            // ======================================
            // LOADING STATE
            // ======================================

            setLoading(true);


            try {

                /*
                 * IMPORTANT
                 *
                 * GitHub Pages cannot run Node.js/Express.
                 *
                 * Replace this URL with your deployed backend URL
                 * when your backend is deployed.
                 *
                 * Example:
                 *
                 * https://your-blogverse-api.onrender.com
                 */

                const API_URL = "http://localhost:5000";


                const response = await fetch(
                    `${API_URL}/api/auth/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            email: email,
                            password: password
                        })
                    }
                );


                // ==================================
                // READ RESPONSE
                // ==================================

                let data;

                try {

                    data = await response.json();

                } catch (jsonError) {

                    data = {
                        message: "Invalid response from server."
                    };

                }


                // ==================================
                // LOGIN FAILED
                // ==================================

                if (!response.ok) {

                    showMessage(
                        data.message ||
                        "Login failed. Please check your details.",
                        "error"
                    );

                    setLoading(false);

                    return;
                }


                // ==================================
                // LOGIN SUCCESSFUL
                // ==================================

                if (!data.token) {

                    showMessage(
                        "Login succeeded, but no authentication token was received.",
                        "error"
                    );

                    setLoading(false);

                    return;
                }


                // ==================================
                // SAVE LOGIN INFORMATION
                // ==================================

                localStorage.setItem(
                    "token",
                    data.token
                );


                if (data.user) {

                    localStorage.setItem(
                        "user",
                        JSON.stringify(data.user)
                    );

                }


                // ==================================
                // SUCCESS MESSAGE
                // ==================================

                showMessage(
                    "Login successful! Redirecting...",
                    "success"
                );


                // ==================================
                // REDIRECT
                // ==================================

                setTimeout(() => {

                    window.location.href = "dashboard.html";

                }, 1000);

            }


            // ======================================
            // CONNECTION ERROR
            // ======================================

            catch (error) {

                console.error(
                    "BLOGVERSE Login Error:",
                    error
                );


                showMessage(
                    "Unable to connect to the server. Make sure your BLOGVERSE backend is running.",
                    "error"
                );


                setLoading(false);

            }

        });

    }


    // ==========================================
    // EMAIL VALIDATION
    // ==========================================

    function isValidEmail(email) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    }


    // ==========================================
    // SHOW MESSAGE
    // ==========================================

    function showMessage(text, type) {

        if (!message) {
            return;
        }


        message.textContent = text;


        message.className =
            `auth-message ${type}`;


        message.style.display = "block";

    }


    // ==========================================
    // LOADING STATE
    // ==========================================

    function setLoading(loading) {

        if (!loginBtn) {
            return;
        }


        loginBtn.disabled = loading;


        if (loading) {

            if (buttonText) {
                buttonText.textContent = "Signing In...";
            }

            if (buttonLoader) {
                buttonLoader.style.display = "inline-block";
            }

        } else {

            if (buttonText) {
                buttonText.textContent = "Sign In";
            }

            if (buttonLoader) {
                buttonLoader.style.display = "none";
            }

        }

    }


    // ==========================================
    // ENTER KEY SUPPORT
    // ==========================================

    if (emailInput) {

        emailInput.addEventListener("input", () => {

            if (message) {
                message.style.display = "none";
            }

        });

    }


    if (passwordInput) {

        passwordInput.addEventListener("input", () => {

            if (message) {
                message.style.display = "none";
            }

        });

    }

});