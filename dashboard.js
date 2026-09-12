document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // API CONFIGURATION
    // ==========================================

    // Use this while testing your backend locally.
    const API_URL = "http://localhost:5000";


    // ==========================================
    // AUTHENTICATION
    // ==========================================

    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");


    // User must be logged in
    if (!token) {
        window.location.href = "login.html";
        return;
    }


    // ==========================================
    // USER DATA
    // ==========================================

    let currentUser = null;

    try {

        currentUser = savedUser
            ? JSON.parse(savedUser)
            : null;

    } catch (error) {

        console.error(
            "User data error:",
            error
        );

    }


    // ==========================================
    // USER ELEMENTS
    // ==========================================

    const welcomeUser =
        document.getElementById("welcomeUser");

    const navUserName =
        document.getElementById("navUserName");

    const userAvatar =
        document.getElementById("userAvatar");


    // ==========================================
    // DISPLAY USER INFORMATION
    // ==========================================

    if (currentUser) {

        const name =
            currentUser.name ||
            currentUser.fullName ||
            currentUser.username ||
            "User";


        // Welcome message
        if (welcomeUser) {

            welcomeUser.textContent = name;

        }


        // Navigation username
        if (navUserName) {

            navUserName.textContent = name;

        }


        // Avatar
        if (userAvatar) {

            userAvatar.textContent =
                getInitial(name);

        }

    }


    // ==========================================
    // LOAD POSTS
    // ==========================================

    loadPosts();


    // ==========================================
    // LOGOUT
    // ==========================================

    const logoutButton =
        document.getElementById("logoutBtn");


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            () => {

                localStorage.removeItem("token");
                localStorage.removeItem("user");

                window.location.href =
                    "login.html";

            }
        );

    }


    // ==========================================
    // RETRY BUTTON
    // ==========================================

    const retryButton =
        document.getElementById("retryBtn");


    if (retryButton) {

        retryButton.addEventListener(
            "click",
            () => {

                loadPosts();

            }
        );

    }


    // ==========================================
    // LOAD POSTS FUNCTION
    // ==========================================

    async function loadPosts() {

        const postsContainer =
            document.getElementById(
                "postsContainer"
            );

        const loading =
            document.getElementById(
                "loading"
            );

        const emptyState =
            document.getElementById(
                "emptyState"
            );

        const errorState =
            document.getElementById(
                "errorMessage"
            );

        const errorText =
            document.getElementById(
                "errorText"
            );


        if (!postsContainer) {

            console.error(
                "Posts container not found."
            );

            return;

        }


        // Show loading
        if (loading) {

            loading.style.display =
                "block";

        }


        // Hide empty state
        if (emptyState) {

            emptyState.style.display =
                "none";

        }


        // Hide error
        if (errorState) {

            errorState.style.display =
                "none";

        }


        try {

            // ==================================
            // GET POSTS FROM BACKEND
            // ==================================

            const response = await fetch(
                `${API_URL}/api/posts`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


            // Read response
            let data = {};

            try {

                data = await response.json();

            } catch (jsonError) {

                data = {};

            }


            // ==================================
            // AUTHORIZATION ERROR
            // ==================================

            if (response.status === 401) {

                localStorage.removeItem("token");
                localStorage.removeItem("user");

                window.location.href =
                    "login.html";

                return;

            }


            // ==================================
            // OTHER ERRORS
            // ==================================

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to load posts."
                );

            }


            // ==================================
            // GET POSTS ARRAY
            // ==================================

            const posts =
                Array.isArray(data)
                    ? data
                    : data.posts || [];


            // Hide loading
            if (loading) {

                loading.style.display =
                    "none";

            }


            // ==================================
            // NO POSTS
            // ==================================

            if (posts.length === 0) {

                postsContainer.innerHTML = "";

                if (emptyState) {

                    emptyState.style.display =
                        "block";

                }

                updateStats(0);

                return;

            }


            // ==================================
            // DISPLAY POSTS
            // ==================================

            postsContainer.innerHTML = "";


            posts.forEach((post) => {

                const card =
                    createPostCard(post);

                postsContainer.appendChild(card);

            });


            // Update statistics
            updateStats(posts.length);

        }


        // ======================================
        // ERROR HANDLING
        // ======================================

        catch (error) {

            console.error(
                "Load posts error:",
                error
            );


            if (loading) {

                loading.style.display =
                    "none";

            }


            if (errorState) {

                errorState.style.display =
                    "block";

            }


            if (errorText) {

                errorText.textContent =
                    error.message ||
                    "Unable to load your posts.";

            }


            postsContainer.innerHTML = "";

        }

    }


    // ==========================================
    // CREATE POST CARD
    // ==========================================

    function createPostCard(post) {

        const card =
            document.createElement("div");


        card.className =
            "post-card";


        // Title
        const title =
            escapeHTML(
                post.title ||
                "Untitled Post"
            );


        // Content
        const content =
            escapeHTML(
                post.content ||
                "No content available."
            );


        // Short content
        const shortContent =
            content.length > 180
                ? content.substring(0, 180) + "..."
                : content;


        // Date
        const date =
            formatDate(
                post.created_at ||
                post.createdAt ||
                post.date
            );


        // Author
        const author =
            escapeHTML(
                post.author_name ||
                post.authorName ||
                post.author ||
                currentUser?.name ||
                "Unknown Author"
            );


        // Post ID
        const postId =
            post.id ||
            post._id;


        // ==================================
        // POST CARD HTML
        // ==================================

        card.innerHTML = `

            <div class="post-card-content">


                <div class="post-card-top">

                    <span class="post-badge">
                        BLOG
                    </span>

                    <span class="post-date">
                        ${date}
                    </span>

                </div>


                <h3>
                    ${title}
                </h3>


                <p>
                    ${shortContent}
                </p>


                <div class="post-author">


                    <div class="author-avatar">

                        ${getInitial(author)}

                    </div>


                    <div>

                        <strong>
                            ${author}
                        </strong>

                        <small>
                            Author
                        </small>

                    </div>


                </div>


                <div class="post-actions">


                    <button
                        type="button"
                        class="view-btn"
                        onclick="viewPost('${postId}')"
                    >
                        View
                    </button>


                    <button
                        type="button"
                        class="edit-btn"
                        onclick="editPost('${postId}')"
                    >
                        Edit
                    </button>


                    <button
                        type="button"
                        class="delete-btn"
                        onclick="deletePost('${postId}')"
                    >
                        Delete
                    </button>


                </div>


            </div>

        `;


        return card;

    }


    // ==========================================
    // UPDATE STATISTICS
    // ==========================================

    function updateStats(totalPosts) {

        const totalPostsElement =
            document.getElementById(
                "totalPosts"
            );


        const publishedElement =
            document.getElementById(
                "publishedPosts"
            );


        const accountElement =
            document.getElementById(
                "accountStatus"
            );


        if (totalPostsElement) {

            totalPostsElement.textContent =
                totalPosts;

        }


        if (publishedElement) {

            publishedElement.textContent =
                totalPosts;

        }


        if (accountElement) {

            accountElement.textContent =
                "Active";

        }

    }


    // ==========================================
    // VIEW POST
    // ==========================================

    window.viewPost = function (id) {

        if (!id) {
            return;
        }


        window.location.href =
            `post.html?id=${encodeURIComponent(id)}`;

    };


    // ==========================================
    // EDIT POST
    // ==========================================

    window.editPost = function (id) {

        if (!id) {
            return;
        }


        window.location.href =
            `create-post.html?id=${encodeURIComponent(id)}`;

    };


    // ==========================================
    // DELETE POST
    // ==========================================

    window.deletePost = async function (id) {

        if (!id) {
            return;
        }


        const confirmDelete =
            confirm(
                "Are you sure you want to delete this post?"
            );


        if (!confirmDelete) {
            return;
        }


        try {

            // ==================================
            // DELETE REQUEST
            // ==================================

            const response =
                await fetch(
                    `${API_URL}/api/posts/${encodeURIComponent(id)}`,
                    {
                        method: "DELETE",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`
                        }
                    }
                );


            let data = {};

            try {

                data =
                    await response.json();

            } catch (jsonError) {

                data = {};

            }


            // ==================================
            // UNAUTHORIZED
            // ==================================

            if (response.status === 401) {

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "user"
                );

                window.location.href =
                    "login.html";

                return;

            }


            // ==================================
            // DELETE ERROR
            // ==================================

            if (!response.ok) {

                alert(
                    data.message ||
                    "Unable to delete post."
                );

                return;

            }


            // ==================================
            // SUCCESS
            // ==================================

            alert(
                "Post deleted successfully."
            );


            // Reload posts
            loadPosts();

        }


        catch (error) {

            console.error(
                "Delete error:",
                error
            );


            alert(
                "Unable to connect to the server."
            );

        }

    };


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
    // FORMAT DATE
    // ==========================================

    function formatDate(dateValue) {

        if (!dateValue) {

            return "Recently";

        }


        const date =
            new Date(dateValue);


        if (isNaN(date.getTime())) {

            return "Recently";

        }


        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    // ==========================================
    // ESCAPE HTML
    // ==========================================

    function escapeHTML(value) {

        return String(value)
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }

});