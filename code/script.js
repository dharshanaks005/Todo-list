
function info() {
    const userName = document.getElementById("userName").value.trim();
    const password = document.getElementById("password").value.trim();

    if (userName === '' || password === '') {
        alert("Enter info to proceed");
        return;
    }

    fetch('/login', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: userName, password: password })
    })
    .then(res => {
        if (res.ok) {
            window.location.href = "homePage.html";
        } else {
            alert("Invalid login");
        }
    });
}

function togglePassword() {
    const passwordInput = document.getElementById("password");
    const eyeIcon = document.getElementById("togglePassword");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        eyeIcon.src = "files/eye-open.png";
    } else {
        passwordInput.type = "password";
        eyeIcon.src = "files/eye-closed.png";
    }
}



const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");

function addTask() {
    const task = inputBox.value.trim();
    if (task === '') {
        alert("You must write something");
        return;
    }

    fetch('/add', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: task })
    })
    .then(() => {
        inputBox.value = '';
        loadTasks();
    });
}

function loadTasks() {
    fetch('/todos')
    .then(res => {
        if (res.status === 401) {
            window.location.href = "index.html"; // redirect to login if session expired
            return;
        }
        return res.json();
    })
    .then(data => {
        if (!data) return;
        listContainer.innerHTML = '';
        data.forEach(task => {
            const li = document.createElement("li");
            li.textContent = task.title;
            li.setAttribute("data-id", task._id);
            if (task.done) li.classList.add("checked");

            const span = document.createElement("span");
            span.textContent = "\u00d7"; // × character
            li.appendChild(span);

            listContainer.appendChild(li);
        });
    });
}

listContainer?.addEventListener("click", function (e) {
    const li = e.target.closest("li");
    const taskId = li?.getAttribute("data-id");

    if (e.target.tagName === "LI") {
        fetch(`/toggle?id=${taskId}`, { method: 'POST' }).then(loadTasks);
    } else if (e.target.tagName === "SPAN") {
        fetch(`/delete?id=${taskId}`, { method: 'POST' }).then(loadTasks);
    }
});


window.onload = function () {
    if (listContainer) loadTasks();
};
