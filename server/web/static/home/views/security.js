var sessions = [];

getSessions().then((sessionslist) => {
    sessions = sessionslist;
    console.log(document.getElementById("userlist"));
    document.getElementById("userlist").innerHTML = renderSessions(sessions);
});

function SessionItem(session) {
    return `<div class="listitem">
        <div style="height: 20px;"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-round"><circle cx="12" cy="8" r="5"></circle><path d="M20 21a8 8 0 0 0-16 0"></path></svg></div>
        <div>${session.id} • Created ${new Date(session.createdAt).toLocaleString()} • Expires ${new Date(session.expiresAt).toLocaleString()}</div>
    </div>`;
}

function renderSessions(sessions) {
    var html = "";
    for (var session of sessions) {
        html += SessionItem(session);
    }
    return html;
}

document.goToUser = (id) => {
    window.history.pushState(null, null, "/app/admin/usermanage/" + id);
    handleNav();
}