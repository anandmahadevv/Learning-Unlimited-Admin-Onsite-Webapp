/* Onsite Dashboard & Class Detail JS Logic */

/**
 * 1. Fetch all classes and update dashboard
 */
async function fetchClasses() {
    try {
        const response = await fetch('/api/classes/');
        const data = await response.json();
        
        updateSummaryStats(data);
        renderClassCards(data);
        
        // Update last updated timestamp
        const now = new Date();
        const lastUpdated = document.getElementById('lastUpdated');
        if (lastUpdated) {
            lastUpdated.textContent = now.toLocaleTimeString();
        }
        
        // Update visible counter
        filterClasses();
    } catch (e) {
        console.error("Error fetching classes:", e);
    }
}

/**
 * Update summary stats bar
 */
function updateSummaryStats(classes) {
    const totalClasses = classes.length;
    const openClasses = classes.filter(c => c.registration_open).length;
    const totalEnrolled = classes.reduce((sum, c) => sum + c.enrolled, 0);
    const totalCheckedIn = classes.reduce((sum, c) => sum + c.checked_in, 0);

    const elTotal = document.getElementById('statTotalClasses');
    const elOpen = document.getElementById('statOpenClasses');
    const elEnrolled = document.getElementById('statTotalEnrolled');
    const elCheckedIn = document.getElementById('statTotalCheckedIn');

    if (elTotal) elTotal.textContent = totalClasses;
    if (elOpen) elOpen.textContent = openClasses;
    if (elEnrolled) elEnrolled.textContent = totalEnrolled;
    if (elCheckedIn) elCheckedIn.textContent = totalCheckedIn;

    // Summary for settings page
    const totalClassesD = document.getElementById('totalClassesDisplay');
    if (totalClassesD) {
        totalClassesD.textContent = totalClasses;
        document.getElementById('totalCapacityDisplay').textContent = classes.reduce((sum, c) => sum + c.capacity, 0);
        document.getElementById('totalEnrolledDisplay').textContent = totalEnrolled;
    }
}

/**
 * Render class cards onto dashboard
 */
function renderClassCards(classes) {
    const grid = document.getElementById('classCardsGrid');
    if (!grid) return;

    const template = document.getElementById('classCardTemplate');
    if (!template) return;
    
    grid.innerHTML = '';
    
    classes.forEach((c, index) => {
        const clone = template.content.cloneNode(true);
        const cardContainer = clone.querySelector('.class-card-container');
        
        // Add animation delay
        cardContainer.style.animationDelay = `${index * 0.05}s`;
        cardContainer.classList.add('animate-fade-up');
        
        // Populate fields
        clone.querySelector('.class-name').textContent = c.name;
        clone.querySelector('.teacher-name').textContent = c.teacher_name;
        clone.querySelector('.time-slot').textContent = c.start_time;
        clone.querySelector('.room-number').textContent = c.room;
        clone.querySelector('.category-name').textContent = c.category;
        
        // Status badge
        const badge = clone.querySelector('.status-badge');
        badge.textContent = c.status.toUpperCase();
        badge.className = `badge status-badge badge-${c.status}`;
        
        // Enrollment progress
        clone.querySelector('.enrollment-ratio').textContent = `${c.enrolled}/${c.capacity}`;
        clone.querySelector('.enrollment-percent').textContent = `${c.fill_percentage}%`;
        const enrollBar = clone.querySelector('.enrollment-progress-bar');
        enrollBar.style.width = `${Math.min(c.fill_percentage, 100)}%`;
        
        // Color for enrollment progress
        if (c.fill_percentage >= 100) enrollBar.style.backgroundColor = 'var(--danger)';
        else if (c.fill_percentage >= 80) enrollBar.style.backgroundColor = 'var(--warning)';
        else enrollBar.style.backgroundColor = 'var(--success)';
        
        // Check-in progress
        const checkinPercent = c.enrolled > 0 ? Math.round((c.checked_in / c.enrolled) * 100) : 0;
        clone.querySelector('.checkin-ratio').textContent = `${c.checked_in}/${c.enrolled}`;
        clone.querySelector('.checkin-percent').textContent = `${checkinPercent}%`;
        clone.querySelector('.checkin-progress-bar').style.width = `${checkinPercent}%`;
        
        // Teacher status
        const teacherBtn = clone.querySelector('.teacher-checkin-btn');
        const teacherStatus = clone.querySelector('.teacher-status-text');
        if (c.teacher_checked_in) {
            teacherStatus.textContent = 'Teacher: Checked In ✓';
            teacherStatus.style.color = 'var(--success)';
            teacherBtn.classList.add('bg-success-subtle');
        } else {
            teacherStatus.textContent = 'Teacher: Not Checked In ✗';
            teacherStatus.style.color = 'var(--danger)';
            teacherBtn.classList.remove('bg-success-subtle');
        }
        teacherBtn.onclick = () => toggleTeacherCheckin(c.id);
        
        // Registration toggle
        const regBtn = clone.querySelector('.toggle-reg-btn');
        if (c.registration_open) {
            regBtn.classList.add('btn-danger');
            regBtn.querySelector('.btn-text').textContent = 'Close Registration';
        } else {
            regBtn.classList.add('btn-success');
            regBtn.querySelector('.btn-text').textContent = 'Open Registration';
        }
        regBtn.onclick = () => toggleRegistration(c.id, regBtn);
        
        // Detail link
        clone.querySelector('.detail-link').href = `/onsite/classes/${c.id}/`;
        
        grid.appendChild(clone);
    });
}

/**
 * 2. Toggle registration
 */
async function toggleRegistration(classId, button) {
    const btnText = button.querySelector('.btn-text');
    const spinner = button.querySelector('.spinner-border');
    
    // Show spinner
    btnText.classList.add('d-none');
    spinner.classList.remove('d-none');
    
    try {
        const response = await fetch(`/api/classes/${classId}/toggle-registration/`, {
            method: 'POST'
        });
        const data = await response.json();
        
        if (response.ok) {
            showToast(data.message, 'success');
            // Refresh classes to update UI
            setTimeout(fetchClasses, 300);
        } else {
            showToast(data.error || 'Failed to toggle registration.', 'danger');
        }
    } catch (e) {
        showToast('Network error.', 'danger');
    } finally {
        btnText.classList.remove('d-none');
        spinner.classList.add('d-none');
    }
}

/**
 * 3. Toggle teacher check-in
 */
async function toggleTeacherCheckin(classId, isDetailPage = false) {
    try {
        const response = await fetch(`/api/classes/${classId}/toggle-teacher-checkin/`, {
            method: 'POST'
        });
        const data = await response.json();
        
        if (response.ok) {
            showToast('Teacher status updated!', 'success');
            if (isDetailPage) {
                updateTeacherStatusUI(data.teacher_checked_in);
                // Also update header info if on detail page
                fetchClassDetail(classId);
            } else {
                fetchClasses();
            }
        }
    } catch (e) {
        showToast('Failed to update teacher status.', 'danger');
    }
}

function updateTeacherStatusUI(isCheckedIn) {
    const btn = document.getElementById('teacherCheckinBtn');
    if (!btn) return;
    const text = document.getElementById('teacherStatusText');
    if (isCheckedIn) {
        text.textContent = 'Teacher: Checked In ✓';
        text.style.color = 'var(--success)';
        btn.classList.add('bg-success-subtle');
    } else {
        text.textContent = 'Teacher: Not Checked In ✗';
        text.style.color = 'var(--danger)';
        btn.classList.remove('bg-success-subtle');
    }
}

/**
 * 4. Filter classes
 */
function filterClasses() {
    const searchInput = document.getElementById('searchFilter');
    if (!searchInput) return;

    const search = searchInput.value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const status = document.getElementById('statusFilter').value;
    const time = document.getElementById('timeFilter').value;

    const cards = document.querySelectorAll('.class-card-container');
    let visibleCount = 0;

    cards.forEach(card => {
        const name = card.querySelector('.class-name').textContent.toLowerCase();
        const cat = card.querySelector('.category-name').textContent;
        const statBadge = card.querySelector('.status-badge');
        const stat = statBadge.textContent.toLowerCase();
        const t = card.querySelector('.time-slot').textContent;

        const matchesSearch = !search || name.includes(search);
        const matchesCategory = category === 'All' || cat === category;
        const matchesStatus = status === 'All' || stat === status;
        const matchesTime = time === 'All' || t === time;

        if (matchesSearch && matchesCategory && matchesStatus && matchesTime) {
            card.classList.remove('d-none');
            visibleCount++;
        } else {
            card.classList.add('d-none');
        }
    });

    const vC = document.getElementById('visibleCount');
    if (vC) vC.textContent = visibleCount;
    
    const tC = document.getElementById('totalCount');
    if (tC) tC.textContent = cards.length;

    const noResults = document.getElementById('noResults');
    if (noResults) noResults.classList.toggle('d-none', visibleCount > 0);
}

/**
 * 5. Update clock
 */
function updateClock() {
    const clock = document.getElementById('liveClock');
    if (clock) {
        clock.textContent = new Date().toLocaleTimeString();
    }
}

/**
 * 6. Show toasts
 */
function showToast(message, type = 'success') {
    const toastEl = document.getElementById('statusToast');
    const toastMsg = document.getElementById('toastMsg');
    
    if (toastEl && toastMsg) {
        toastEl.className = `toast align-items-center text-white border-0 bg-${type === 'danger' ? 'danger' : 'success'}`;
        toastMsg.textContent = message;
        
        const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
        toast.show();
    }
}

/**
 * 7. Skeleton loading
 */
function loadingSkeletons() {
    const grid = document.getElementById('classCardsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    for (let i = 0; i < 6; i++) {
        const div = document.createElement('div');
        div.className = 'col-12 col-md-6 col-xl-4 animate-fade-up';
        div.innerHTML = `<div class="card h-100 skeleton-card" style="min-height:300px"></div>`;
        grid.appendChild(div);
    }
}

/* --- Class Detail Functions --- */

async function fetchClassDetail(id) {
    try {
        const response = await fetch(`/api/classes/${id}/`);
        const data = await response.json();
        
        renderStudents(data.students);
        updateClassInfoUI(data);
    } catch (e) {
        console.error("Error fetching class detail:", e);
    }
}

function updateClassInfoUI(c) {
    const cN = document.getElementById('className');
    if (!cN) return;
    
    cN.textContent = c.name;
    document.getElementById('teacherName').textContent = c.teacher_name;
    document.getElementById('roomNumber').textContent = c.room;
    document.getElementById('timeSlot').textContent = `${c.start_time} - ${c.end_time}`;
    document.getElementById('categoryName').textContent = c.category;
    document.getElementById('capacity').textContent = c.capacity;
    document.getElementById('overenrollmentInput').value = c.overenrollment_cap;
    
    const badge = document.getElementById('classStatusBadge');
    badge.textContent = c.status.toUpperCase();
    badge.className = `badge fs-6 px-3 py-2 badge-${c.status}`;

    // Progress
    document.getElementById('enrollmentRatio').textContent = `${c.enrolled}/${c.capacity}`;
    document.getElementById('enrollmentPercent').textContent = `${c.fill_percentage}%`;
    const eb = document.getElementById('enrollmentProgressBar');
    eb.style.width = `${Math.min(c.fill_percentage, 100)}%`;
    if (c.fill_percentage >= 100) eb.style.backgroundColor = 'var(--danger)';
    else if (c.fill_percentage >= 80) eb.style.backgroundColor = 'var(--warning)';
    else eb.style.backgroundColor = 'var(--success)';

    const checkinPercent = c.enrolled > 0 ? Math.round((c.checked_in / c.enrolled) * 100) : 0;
    document.getElementById('checkinRatio').textContent = `${c.checked_in}/${c.enrolled}`;
    document.getElementById('checkinPercent').textContent = `${checkinPercent}%`;
    document.getElementById('checkinProgressBar').style.width = `${checkinPercent}%`;
    
    document.getElementById('studentCount').textContent = c.enrolled;
    document.getElementById('footerCheckinSummary').textContent = `${c.checked_in} of ${c.enrolled} students checked in`;
    document.getElementById('footerCheckinProgressBar').style.width = `${checkinPercent}%`;

    updateTeacherStatusUI(c.teacher_checked_in);
}

function renderStudents(students) {
    const tbody = document.getElementById('studentListBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    students.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-4 py-3 fw-bold student-name">${s.name}</td>
            <td class="py-3 text-muted">Grade ${s.grade}</td>
            <td class="py-3">
                <span class="badge ${s.checked_in ? 'bg-success' : 'bg-secondary-subtle text-muted'}" style="font-size: 0.7rem;">
                    ${s.checked_in ? 'Checked In' : 'Not Checked In'}
                </span>
            </td>
            <td class="pe-4 py-3 text-end">
                <button class="btn btn-sm ${s.checked_in ? 'btn-outline-secondary' : 'btn-navy px-3'}" onclick="toggleStudentCheckin(${s.enrollment_id})" style="${s.checked_in ? '' : 'background: var(--navy); color: white; border: none;'}">
                    ${s.checked_in ? 'Undo' : 'Check In'}
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function toggleStudentCheckin(id) {
    try {
        const response = await fetch(`/api/students/${id}/toggle-checkin/`, {
            method: 'POST'
        });
        if (response.ok) {
            showToast('Student status updated!', 'success');
            if (typeof classId !== 'undefined') {
                fetchClassDetail(classId); // Refresh list if on detail page
            }
        }
    } catch (e) {
        showToast('Failed to toggle student check-in.', 'danger');
    }
}

async function updateOverenrollmentCap(id, val) {
    try {
        const response = await fetch(`/api/classes/${id}/update-cap/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ overenrollment_cap: parseInt(val) })
        });
        if (response.ok) {
            showToast('Overenrollment cap updated!', 'success');
            fetchClassDetail(id);
        }
    } catch (e) {
        showToast('Failed to update cap.', 'danger');
    }
}

/* --- Settings Functions --- */

async function fetchSettings() {
    try {
        const response = await fetch('/api/settings/');
        const data = await response.json();
        
        const toggle = document.getElementById('globalRegToggle');
        if (toggle) {
            toggle.checked = data.global_registration_open;
            updateGlobalUI(data.global_registration_open);
        }
        
        const defOverEn = document.getElementById('defaultOverenrollment');
        if (defOverEn) {
            defOverEn.value = data.default_overenrollment_cap;
        }
    } catch (e) {
        console.error("Error fetching settings:", e);
    }
}

function warnGlobalToggle() {
    const toggle = document.getElementById('globalRegToggle');
    const banner = document.getElementById('warningBanner');
    if (!toggle.checked) {
        banner.classList.remove('d-none');
    } else {
        banner.classList.add('d-none');
    }
    updateGlobalUI(toggle.checked);
}

function updateGlobalUI(isOpen) {
    const badge = document.getElementById('globalStatusBadge');
    if (!badge) return;
    if (isOpen) {
        badge.textContent = 'Registration is OPEN';
        badge.className = 'badge w-100 py-3 fs-5 bg-success';
    } else {
        badge.textContent = 'Registration is CLOSED';
        badge.className = 'badge w-100 py-3 fs-5 bg-danger';
    }
}

async function applyGlobalSettings() {
    try {
        const isOpen = document.getElementById('globalRegToggle').checked;
        const response = await fetch('/api/settings/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ global_registration_open: isOpen })
        });
        if (response.ok) {
            showToast('Registration settings applied to all classes!', 'success');
            fetchSettings();
        }
    } catch (e) {
        showToast('Error applying settings.', 'danger');
    }
}

function adjustCap(delta) {
    const input = document.getElementById('defaultOverenrollment');
    input.value = Math.max(0, parseInt(input.value) + delta);
}

async function saveDefaultCap() {
    try {
        const cap = document.getElementById('defaultOverenrollment').value;
        const updateAll = document.getElementById('applyToAllCheck').checked;
        
        const response = await fetch('/api/settings/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ default_overenrollment_cap: parseInt(cap) })
        });
        if (response.ok) {
            showToast('Default cap saved!', 'success');
        }
    } catch (e) {
        showToast('Error saving cap.', 'danger');
    }
}

async function fetchClassesSummary() {
    try {
        const response = await fetch('/api/classes/');
        const classes = await response.json();
        updateSummaryStats(classes);
    } catch (e) {
        console.error("Error fetching summary stats:", e);
    }
}

function checkInAll() {
    // Prototype: just mark all visible students as checked in
    const buttons = document.querySelectorAll('#studentListBody tr:not(.d-none) button:not(.btn-outline-secondary)');
    if (buttons.length === 0) {
        showToast('All visible students are already checked in.', 'success');
        return;
    }
    buttons.forEach(btn => btn.click());
    showToast('Checking in all students...', 'success');
}

function exportCSV() {
    const rows = document.querySelectorAll('#studentListBody tr:not(.d-none)');
    if (rows.length === 0) {
        showToast('No students to export.', 'danger');
        return;
    }
    let csv = 'Name,Grade,Status\n';
    rows.forEach(tr => {
        const name = tr.querySelector('.student-name').textContent;
        const grade = tr.querySelector('td:nth-child(2)').textContent;
        const status = tr.querySelector('td:nth-child(3) .badge').textContent.trim();
        csv += `"${name}","${grade}","${status}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'student_list.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Exporting CSV...', 'success');
}

/**
 * 8. Seed sample data
 */
async function seedSampleData() {
    const btn = document.getElementById('seedDataBtn');
    if (btn) btn.disabled = true;
    
    showToast('Resetting and seeding data...', 'success');
    
    try {
        const response = await fetch('/api/seed-data/', {
            method: 'POST'
        });
        const data = await response.json();
        
        if (response.ok) {
            showToast(data.message, 'success');
            // Refresh counts
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            showToast(data.error || 'Failed to seed data.', 'danger');
        }
    } catch (e) {
        showToast('Network error.', 'danger');
    } finally {
        if (btn) btn.disabled = false;
    }
}

/**
 * 9. Create new event
 */
async function createNewEvent() {
    const name = prompt("Enter a name for the new event (e.g. Splash 2027):");
    if (!name) return;
    
    if (!confirm(`Warning: This will PERMANENTLY DELETE all current classes and data for ${name}. Continue?`)) return;
    
    showToast('Wiping data and creating new event...', 'success');
    
    try {
        const response = await fetch('/api/create-event/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event_name: name })
        });
        const data = await response.json();
        
        if (response.ok) {
            showToast(data.message, 'success');
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            showToast(data.error || 'Failed to create event.', 'danger');
        }
    } catch (e) {
        showToast('Network error.', 'danger');
    }
}

/**
 * 11. Announcements Logic
 */
async function fetchAnnouncements() {
    try {
        const response = await fetch('/api/announcements/');
        const data = await response.json();
        
        // Update top banner
        const container = document.getElementById('announcementContainer');
        if (container) {
            container.innerHTML = '';
            data.forEach(a => {
                const alert = document.createElement('div');
                alert.className = 'alert alert-info alert-dismissible fade show border-0 shadow-sm';
                alert.style.backgroundColor = 'var(--blue-light)';
                alert.style.color = 'var(--navy)';
                alert.role = 'alert';
                alert.innerHTML = `
                    <i class="bi bi-megaphone-fill me-2"></i>
                    <strong>Announcement:</strong> ${a.message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                `;
                container.appendChild(alert);
            });
        }
        
        // Update settings list if exists
        const list = document.getElementById('activeAnnouncementsList');
        if (list) {
            list.innerHTML = data.length > 0 ? '<h6 class="fw-bold mb-3 small uppercase text-muted">Active Announcements</h6>' : '';
            data.forEach(a => {
                const item = document.createElement('div');
                item.className = 'd-flex justify-content-between align-items-center p-2 border rounded mb-2 bg-light';
                item.innerHTML = `
                    <span class="small">${a.message}</span>
                    <button class="btn btn-sm text-danger" onclick="deleteAnnouncement(${a.id})"><i class="bi bi-trash"></i></button>
                `;
                list.appendChild(item);
            });
        }
    } catch (e) {
        console.error("Error fetching announcements:", e);
    }
}

async function postAnnouncement() {
    const msgInput = document.getElementById('announcementMsg');
    const msg = msgInput.value.trim();
    if (!msg) return;
    
    try {
        const response = await fetch('/api/announcements/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg })
        });
        if (response.ok) {
            showToast('Announcement posted!', 'success');
            msgInput.value = '';
            fetchAnnouncements();
        }
    } catch (e) {
         showToast('Error posting announcement.', 'danger');
    }
}

async function deleteAnnouncement(id) {
    try {
        const response = await fetch(`/api/announcements/${id}/delete/`, {
            method: 'POST'
        });
        if (response.ok) {
            showToast('Announcement deleted!', 'success');
            fetchAnnouncements();
        }
    } catch (e) {
         showToast('Error deleting announcement.', 'danger');
    }
}

/**
 * 12. Global Initialization
 */
document.addEventListener('DOMContentLoaded', () => {
    // Shared - Clock
    const liveClock = document.getElementById('liveClock');
    if (liveClock) {
        updateClock();
        setInterval(updateClock, 1000);
    }
    
    // Shared - Announcements
    fetchAnnouncements();
    // Auto-refresh every 60 seconds
    setInterval(fetchAnnouncements, 60000);

    // Dashboard Page
    const dashboardGrid = document.getElementById('classCardsGrid');
    if (dashboardGrid) {
        loadingSkeletons();
        fetchClasses();
        // Auto-refresh every 30 seconds
        setInterval(fetchClasses, 30000);
    }

    // Class Detail Page
    const studentList = document.getElementById('studentListBody');
    if (studentList) {
        // Extract classId from URL path (e.g., /classes/123/)
        const pathParts = window.location.pathname.split('/');
        // Find the index of 'classes' and get the next part
        const classIdx = pathParts.indexOf('classes');
        if (classIdx !== -1 && pathParts[classIdx + 1]) {
            const classId = pathParts[classIdx + 1];
            fetchClassDetail(classId);

            // Set up listeners
            const saveBtn = document.getElementById('saveCapBtn');
            if (saveBtn) {
                saveBtn.onclick = () => {
                    const newCap = document.getElementById('overenrollmentInput').value;
                    updateOverenrollmentCap(classId, newCap);
                };
            }

            const teacherBtn = document.getElementById('teacherCheckinBtn');
            if (teacherBtn) {
                teacherBtn.onclick = () => toggleTeacherCheckin(classId, true);
            }
        }
    }

    // Settings Page
    const globalRegToggle = document.getElementById('globalRegToggle');
    if (globalRegToggle) {
        fetchSettings();
        fetchClassesSummary();
    }
});

function filterStudents() {
    const query = document.getElementById('studentSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#studentListBody tr');
    let visibleCount = 0;

    rows.forEach(row => {
        const name = row.querySelector('.student-name').textContent.toLowerCase();
        if (name.includes(query)) {
            row.classList.remove('d-none');
            visibleCount++;
        } else {
            row.classList.add('d-none');
        }
    });

    const noStudents = document.getElementById('noStudents');
    if (noStudents) {
        noStudents.classList.toggle('d-none', visibleCount > 0);
    }
}
