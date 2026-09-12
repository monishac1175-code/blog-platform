document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // API CONFIGURATION
    // ==========================================

    const API_URL = "http://localhost:5000";


    // ==========================================
    // GET ELEMENTS
    // ==========================================

    const postForm = document.getElementById("postForm");

    const titleInput = document.getElementById("title");
    const contentInput = document.getElementById("content");

    const titleCount = document.getElementById("titleCount");
    const contentCount = document.getElementById("contentCount");

    const message = document.getElementById("message");

    const publishBtn = document.getElementById("publishBtn");
    const publishText = document.getElementById("publishText");
    const publishLoader = document.getElementById("publishLoader");

    const editorStatus = document.getElementById("editorStatus");

    const pageTitle = document.getElementById("pageTitle");

    const cancelBtn = document.getElementById("cancelBtn");

    const userAvatar = document.getElementById("userAvatar");
    const navUserName = document.getElementById("navUserName");

    const logoutBtn = document.getElementById("logoutBtn");


    // ==========================================
    // CHECK LOGIN
    // ==========================================

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }


    // ==========================================
    // GET USER INFORMATION
    // ==========================================

    let currentUser = null;

    try {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            currentUser = JSON.parse(storedUser);
        }

    } catch (error) {
        console.error("Unable to read user information:", error);
    }


    // ==========================================
    // DISPLAY USER
    // ==========================================

    if (currentUser) {

        const userName =
            currentUser.name ||
            currentUser.username ||
            currentUser.email ||
            "User";

        navUserName.textContent = userName;

        userAvatar.textContent = getInitial(userName);
    }


    // ==========================================
    // CHECK CREATE OR EDIT MODE
    // ==========================================

    const urlParams = new URLSearchParams(window.location.search);

    const postId = urlParams.get("id");

    let editMode = Boolean(postId);


    if (editMode) {

        pageTitle.textContent = "Edit Your Story";

        document.querySelector(".editor-label").textContent = "Edit Post";

        editorStatus.textContent = "Editing your story";

        publishText.textContent = "Update Story";

        loadPost(postId);

    } else {

        pageTitle.textContent = "Create a New Story";

        document.querySelector(".editor-label").textContent = "New Post";

        editorStatus.textContent = "Ready to write";

        publishText.textContent = "Publish Story";
    }


    // ==========================================
    // TITLE CHARACTER COUNT
    // ==========================================

    titleInput.addEventListener("input", () => {

        const length = titleInput.value.length;

        titleCount.textContent = `${length} / 150`;

    });


    // ==========================================
    // CONTENT CHARACTER COUNT
    // ==========================================

    contentInput.addEventListener("input", () => {

        const length = contentInput.value.length;

        contentCount.textContent = `${length} characters`;

    });


    // ==========================================
    // FORM SUBMIT
    // ==========================================

    postForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        const title = titleInput.value.trim();

        const content = contentInput.value.trim();


        // ======================================
        // VALIDATION
        // ======================================

        if (!title) {

            showMessage(
                "Please enter a post title.",
                "error"
            );

            titleInput.focus();

            return;
        }


        if (title.length < 3) {

            showMessage(
                "Post title must contain at least 3 characters.",
                "error"
            );

            titleInput.focus();

            return;
        }


        if (!content) {

            showMessage(
                "Please write some content for your post.",
                "error"
            );

            contentInput.focus();

            return;
        }


        if (content.length < 10) {

            showMessage(
                "Your story should contain at least 10 characters.",
                "error"
            );

            contentInput.focus();

            return;
        }


        // ======================================
        // START LOADING
        // ======================================

        setLoading(true);

        editorStatus.textContent =
            editMode
                ? "Updating your story..."
                : "Publishing your story...";


        try {

            // ==================================
            // CREATE POST
            // ==================================

            if (!editMode) {

                const response = await fetch(
                    `${API_URL}/api/posts`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            title: title,
                            content: content
                        })
                    }
                );


                const data = await getResponseData(response);


                if (response.status === 401) {

                    logoutUser();

                    return;
                }


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        data.error ||
                        "Unable to create the post."
                    );
                }


                showMessage(
                    "Your story has been published successfully!",
                    "success"
                );


                editorStatus.textContent = "Published successfully";


                // Redirect after short delay

                setTimeout(() => {

                    window.location.href = "dashboard.html";

                }, 1000);


            }


            // ==================================
            // UPDATE POST
            // ==================================

            else {

                const response = await fetch(
                    `${API_URL}/api/posts/${postId}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            title: title,
                            content: content
                        })
                    }
                );


                const data = await getResponseData(response);


                if (response.status === 401) {

                    logoutUser();

                    return;
                }


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        data.error ||
                        "Unable to update the post."
                    );
                }


                showMessage(
                    "Your story has been updated successfully!",
                    "success"
                );


                editorStatus.textContent =
                    "Updated successfully";


                setTimeout(() => {

                    window.location.href =
                        `post.html?id=${postId}`;

                }, 1000);

            }


        } catch (error) {

            console.error("Post error:", error);


            showMessage(
                error.message ||
                "Something went wrong. Please try again.",
                "error"
            );


            editorStatus.textContent =
                "Something went wrong";


        } finally {

            setLoading(false);

        }

    });


    // ==========================================
    // LOAD POST FOR EDITING
    // ==========================================

    async function loadPost(id) {

        try {

            editorStatus.textContent =
                "Loading your story...";


            const response = await fetch(
                `${API_URL}/api/posts/${id}`,
                {
                    method: "GET",

                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );


            const data = await getResponseData(response);


            if (response.status === 401) {

                logoutUser();

                return;
            }


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    data.error ||
                    "Unable to load the post."
                );
            }


            // ==================================
            // HANDLE DIFFERENT API RESPONSES
            // ==================================

            const post =
                data.post ||
                data.data ||
                data;


            if (!post) {

                throw new Error(
                    "Post information was not found."
                );
            }


            titleInput.value =
                post.title || "";


            contentInput.value =
                post.content || "";


            // Update character counters

            titleInput.dispatchEvent(
                new Event("input")
            );

            contentInput.dispatchEvent(
                new Event("input")
            );


            editorStatus.textContent =
                "Ready to edit";


        } catch (error) {

            console.error(
                "Load post error:",
                error
            );


            showMessage(
                error.message ||
                "Unable to load this post.",
                "error"
            );


            editorStatus.textContent =
                "Unable to load post";


            publishBtn.disabled = true;

        }

    }


    // ==========================================
    // LOADING BUTTON
    // ==========================================

    function setLoading(loading) {

        publishBtn.disabled = loading;


        if (loading) {

            publishText.style.display = "none";

            publishLoader.style.display =
                "inline-block";


        } else {

            publishText.style.display =
                "inline";


            publishLoader.style.display =
                "none";

        }

    }


    // ==========================================
    // SHOW MESSAGE
    // ==========================================

    function showMessage(text, type) {

        message.textContent = text;

        message.className =
            `editor-message ${type}`;

    }


    // ==========================================
    // GET API RESPONSE
    // ==========================================

    async function getResponseData(response) {

        const contentType =
            response.headers.get("content-type") || "";


        if (contentType.includes("application/json")) {

            return await response.json();

        }


        const text = await response.text();


        return {
            message: text
        };

    }


    // ==========================================
    // GET USER INITIAL
    // ==========================================

    function getInitial(name) {

        if (!name) {
            return "U";
        }


        return name
            .trim()
            .charAt(0)
            .toUpperCase();

    }


    // ==========================================
    // LOGOUT
    // ==========================================

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            () => {

                logoutUser();

            }
        );

    }


    function logoutUser() {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        window.location.href = "login.html";

    }


    // ==========================================
    // CANCEL BUTTON
    // ==========================================

    if (cancelBtn) {

        cancelBtn.addEventListener(
            "click",
            (event) => {

                // If user has entered something,
                // ask before leaving.

                const hasContent =
                    titleInput.value.trim() ||
                    contentInput.value.trim();


                if (hasContent) {

                    const confirmed =
                        confirm(
                            "Are you sure you want to leave? Your changes will be lost."
                        );


                    if (!confirmed) {

                        event.preventDefault();

                    }

                }

            }
        );

    }

});
