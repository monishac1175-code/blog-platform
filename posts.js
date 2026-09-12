/* =========================================
   BLOGVERSE POST JAVASCRIPT
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

    // =========================================
    // API CONFIGURATION
    // =========================================

    const API_URL = "http://localhost:5000";


    // =========================================
    // GET TOKEN
    // =========================================

    const token = localStorage.getItem("token");


    // =========================================
    // GET POST ID FROM URL
    // Example:
    // post.html?id=5
    // =========================================

    const urlParams =
        new URLSearchParams(window.location.search);

    const postId =
        urlParams.get("id");


    // =========================================
    // ELEMENTS
    // =========================================

    const postTitle =
        document.getElementById("postTitle");

    const postAuthor =
        document.getElementById("postAuthor");

    const postDate =
        document.getElementById("postDate");

    const postContent =
        document.getElementById("postContent");

    const commentsContainer =
        document.getElementById("commentsContainer");

    const commentForm =
        document.getElementById("commentForm");

    const commentInput =
        document.getElementById("commentInput");

    const commentMessage =
        document.getElementById("commentMessage");

    const commentSubmit =
        document.getElementById("commentSubmit");


    // =========================================
    // LOGIN CHECK
    // =========================================

    if (!token) {

        window.location.href = "login.html";

        return;
    }


    // =========================================
    // POST ID CHECK
    // =========================================

    if (!postId) {

        showPostError(
            "No post was selected."
        );

        return;
    }


    // =========================================
    // LOAD POST
    // =========================================

    loadPost();


    // =========================================
    // LOAD COMMENTS
    // =========================================

    loadComments();


    // =========================================
    // LOAD POST FUNCTION
    // =========================================

    async function loadPost() {

        try {

            const response = await fetch(
                `${API_URL}/api/posts/${postId}`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


            const data =
                await getResponseData(response);


            // Unauthorized

            if (response.status === 401) {

                logoutUser();

                return;
            }


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    data.error ||
                    "Unable to load this post."
                );
            }


            const post =
                data.post ||
                data.data ||
                data;


            if (!post) {

                throw new Error(
                    "Post was not found."
                );
            }


            // =================================
            // DISPLAY POST
            // =================================

            postTitle.textContent =
                post.title ||
                "Untitled Post";


            postAuthor.textContent =
                getAuthorName(post);


            postDate.textContent =
                formatDate(
                    post.created_at ||
                    post.createdAt ||
                    post.date
                );


            postContent.textContent =
                post.content ||
                "No content available.";


            // Update browser title

            document.title =
                `${post.title || "Post"} | BLOGVERSE`;


        } catch (error) {

            console.error(
                "Load post error:",
                error
            );


            showPostError(
                error.message ||
                "Unable to load the post."
            );

        }

    }


    // =========================================
    // LOAD COMMENTS
    // =========================================

    async function loadComments() {

        if (!commentsContainer) {
            return;
        }


        commentsContainer.innerHTML = `

            <div class="loading">

                <div class="loading-spinner"></div>

                <p>
                    Loading comments...
                </p>

            </div>

        `;


        try {

            const response = await fetch(
                `${API_URL}/api/comments/post/${postId}`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


            const data =
                await getResponseData(response);


            if (response.status === 401) {

                logoutUser();

                return;
            }


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    data.error ||
                    "Unable to load comments."
                );
            }


            const comments =
                data.comments ||
                data.data ||
                [];


            displayComments(comments);


        } catch (error) {

            console.error(
                "Load comments error:",
                error
            );


            commentsContainer.innerHTML = `

                <div class="empty-state">

                    <div class="empty-state-icon">
                        !
                    </div>

                    <h3>
                        Unable to load comments
                    </h3>

                    <p>
                        ${escapeHTML(error.message)}
                    </p>

                    <button
                        type="button"
                        class="comment-btn"
                        id="retryComments"
                    >
                        Try Again
                    </button>

                </div>

            `;


            const retryComments =
                document.getElementById(
                    "retryComments"
                );


            if (retryComments) {

                retryComments.addEventListener(
                    "click",
                    loadComments
                );

            }

        }

    }


    // =========================================
    // DISPLAY COMMENTS
    // =========================================

    function displayComments(comments) {

        if (!comments || comments.length === 0) {

            commentsContainer.innerHTML = `

                <div class="empty-state">

                    <div class="empty-state-icon">
                        ✦
                    </div>

                    <h3>
                        No comments yet
                    </h3>

                    <p>
                        Be the first to share your thoughts.
                    </p>

                </div>

            `;

            return;
        }


        commentsContainer.innerHTML =
            comments.map(
                comment => {

                    const author =
                        comment.author_name ||
                        comment.author ||
                        comment.user_name ||
                        comment.username ||
                        "Anonymous";


                    const content =
                        comment.content ||
                        comment.comment ||
                        "";


                    const date =
                        formatDate(
                            comment.created_at ||
                            comment.createdAt ||
                            comment.date
                        );


                    const commentId =
                        comment.id;


                    return `

                        <article
                            class="comment-card"
                            data-comment-id="${commentId}"
                        >

                            <div class="comment-header">

                                <div class="comment-user">

                                    <div class="user-avatar">

                                        ${escapeHTML(
                                            getInitial(author)
                                        )}

                                    </div>

                                    <div>

                                        <strong>
                                            ${escapeHTML(author)}
                                        </strong>

                                        <small>
                                            ${date}
                                        </small>

                                    </div>

                                </div>

                            </div>


                            <div class="comment-content">

                                ${escapeHTML(content)}

                            </div>


                            <div
                                class="comment-actions"
                                data-comment-owner="${comment.user_id || comment.userId || ""}"
                            >

                                <button
                                    type="button"
                                    class="comment-btn delete"
                                    onclick="deleteComment(${commentId})"
                                >
                                    Delete
                                </button>

                            </div>

                        </article>

                    `;

                }
            ).join("");

    }


    // =========================================
    // ADD COMMENT
    // =========================================

    if (commentForm) {

        commentForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const content =
                    commentInput.value.trim();


                // Validation

                if (!content) {

                    showCommentMessage(
                        "Please write a comment.",
                        "error"
                    );

                    commentInput.focus();

                    return;
                }


                if (content.length < 2) {

                    showCommentMessage(
                        "Comment must contain at least 2 characters.",
                        "error"
                    );

                    commentInput.focus();

                    return;
                }


                // Loading state

                commentSubmit.disabled = true;

                commentSubmit.textContent =
                    "Adding Comment...";


                try {

                    const response = await fetch(
                        `${API_URL}/api/comments`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`
                            },

                            body: JSON.stringify({
                                post_id: postId,
                                content: content
                            })
                        }
                    );


                    const data =
                        await getResponseData(response);


                    if (response.status === 401) {

                        logoutUser();

                        return;
                    }


                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            data.error ||
                            "Unable to add comment."
                        );
                    }


                    // Clear textarea

                    commentInput.value = "";


                    showCommentMessage(
                        "Comment added successfully!",
                        "success"
                    );


                    // Reload comments

                    await loadComments();


                } catch (error) {

                    console.error(
                        "Add comment error:",
                        error
                    );


                    showCommentMessage(
                        error.message ||
                        "Unable to add comment.",
                        "error"
                    );


                } finally {

                    commentSubmit.disabled = false;

                    commentSubmit.textContent =
                        "Add Comment";

                }

            }
        );

    }


    // =========================================
    // DELETE COMMENT
    // =========================================

    window.deleteComment =
        async function (commentId) {

            const confirmed =
                confirm(
                    "Are you sure you want to delete this comment?"
                );


            if (!confirmed) {
                return;
            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/api/comments/${commentId}`,
                        {
                            method: "DELETE",

                            headers: {
                                "Authorization":
                                    `Bearer ${token}`
                            }
                        }
                    );


                const data =
                    await getResponseData(response);


                if (response.status === 401) {

                    logoutUser();

                    return;
                }


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        data.error ||
                        "Unable to delete comment."
                    );
                }


                showCommentMessage(
                    "Comment deleted successfully.",
                    "success"
                );


                await loadComments();


            } catch (error) {

                console.error(
                    "Delete comment error:",
                    error
                );


                showCommentMessage(
                    error.message ||
                    "Unable to delete comment.",
                    "error"
                );

            }

        };


    // =========================================
    // SHOW POST ERROR
    // =========================================

    function showPostError(text) {

        if (postTitle) {

            postTitle.textContent =
                "Unable to load post";

        }


        if (postAuthor) {

            postAuthor.textContent =
                "BLOGVERSE";

        }


        if (postDate) {

            postDate.textContent =
                "";

        }


        if (postContent) {

            postContent.innerHTML = `

                <div class="empty-state">

                    <div class="empty-state-icon">
                        !
                    </div>

                    <h3>
                        Something went wrong
                    </h3>

                    <p>
                        ${escapeHTML(text)}
                    </p>

                    <a
                        href="dashboard.html"
                        class="comment-btn"
                    >
                        Back to Dashboard
                    </a>

                </div>

            `;

        }

    }


    // =========================================
    // SHOW COMMENT MESSAGE
    // =========================================

    function showCommentMessage(
        text,
        type
    ) {

        if (!commentMessage) {
            return;
        }


        commentMessage.textContent =
            text;


        commentMessage.className =
            `comment-message ${type}`;


        setTimeout(
            () => {

                commentMessage.className =
                    "comment-message";

                commentMessage.textContent =
                    "";

            },
            4000
        );

    }


    // =========================================
    // GET AUTHOR NAME
    // =========================================

    function getAuthorName(post) {

        return (
            post.author_name ||
            post.author ||
            post.username ||
            post.user_name ||
            "Anonymous"
        );

    }


    // =========================================
    // GET INITIAL
    // =========================================

    function getInitial(name) {

        if (!name) {
            return "U";
        }


        return String(name)
            .trim()
            .charAt(0)
            .toUpperCase();

    }


    // =========================================
    // FORMAT DATE
    // =========================================

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


    // =========================================
    // ESCAPE HTML
    // =========================================

    function escapeHTML(value) {

        const element =
            document.createElement("div");


        element.textContent =
            value == null
                ? ""
                : String(value);


        return element.innerHTML;

    }


    // =========================================
    // API RESPONSE HANDLER
    // =========================================

    async function getResponseData(response) {

        const contentType =
            response.headers.get(
                "content-type"
            ) || "";


        if (
            contentType.includes(
                "application/json"
            )
        ) {

            return await response.json();

        }


        const text =
            await response.text();


        return {
            message: text
        };

    }


    // =========================================
    // LOGOUT
    // =========================================

    function logoutUser() {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        window.location.href =
            "login.html";

    }

});