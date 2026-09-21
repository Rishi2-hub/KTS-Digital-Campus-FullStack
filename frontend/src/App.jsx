import React, { useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  CreditCard,
  Download,
  Eye,
  FileCheck2,
  FileText,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MoreHorizontal,
  Plus,
  Pencil,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  Upload,
  UserPlus,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import logo from "./assets/kts-logo.png";
import { createAssignment, deleteAssignment, deleteMaterial, getAssignments, getFileUrl, getGrades, getMaterials, getStudents, login as apiLogin, logout as apiLogout, saveGrade, updateAssignment, uploadMaterial } from "./api";

const DEMO_USERS = {
  admin: {
    email: "admin@kts.edu.np",
    password: "Admin@123",
    name: "KTS Administrator",
    role: "admin",
  },
  teacher: {
    email: "teacher@kts.edu.np",
    password: "Teacher@123",
    name: "Demo Teacher",
    role: "teacher",
  },
  student: {
    email: "student@kts.edu.np",
    password: "Student@123",
    name: "Demo Student",
    role: "student",
  },
};

const COURSE_OPTIONS = {
  caregiver: [
    "Caregiver",
  ],
  hospitality: [
    "CNG",
    "Barista — Advance Barista Course",
    "Barista — Basic Barista Course",
    "Bakery — Advance Bakery Course",
    "Bakery — Basic Bakery Course",
  ],
};

const MENU = {
  admin: [
    ["dashboard", "Dashboard", LayoutDashboard],
    ["teachers", "Teachers", Users],
    ["students", "Students", GraduationCap],
    ["register", "Register User", UserPlus],
    ["activities", "Activities", Activity],
    ["timetable", "Timetable", CalendarDays],
    ["announcements", "Announcements", Bell],
    ["billing", "Billing", WalletCards],
    ["settings", "Settings", Settings],
  ],
  teacher: [
    ["dashboard", "Dashboard", LayoutDashboard],
    ["courses", "Courses & Materials", BookOpen],
    ["assignments", "Assignments", ClipboardList],
    ["grades", "Grades", BarChart3],
    ["attendance", "Attendance", ClipboardCheck],
    ["timetable", "Timetable & Rooms", CalendarDays],
    ["leave", "Leave Application", FileText],
    ["announcements", "Announcements", Bell],
  ],
  student: [
    ["dashboard", "Dashboard", LayoutDashboard],
    ["attendance", "My Attendance", ClipboardCheck],
    ["courses", "Study Materials", BookOpen],
    ["tests", "Tests & Exams", FileCheck2],
    ["billing", "Fees & Bills", CreditCard],
    ["timetable", "My Timetable", CalendarDays],
    ["announcements", "Announcements", Bell],
    ["activities", "Activities", Activity],
  ],
};

const initialTeachers = [
  { name: "Anita Shrestha", email: "anita@kts.edu.np", type: "Caregiver Teacher", status: "Active" },
  { name: "Prakash Rai", email: "prakash@kts.edu.np", type: "Hospitality Teacher", status: "Active" },
  { name: "Mina Gurung", email: "mina@kts.edu.np", type: "Hospitality Teacher", status: "On leave" },
  { name: "Ramesh Karki", email: "ramesh@kts.edu.np", type: "Caregiver Teacher", status: "Active" },
];

const initialStudents = [
  { name: "Sujan Gurung", email: "sujan@kts.edu.np", type: "Caregiver Student", batch: "C-07", status: "Active" },
  { name: "Asha Tamang", email: "asha@kts.edu.np", type: "Hospitality Student", batch: "B-04", status: "Active" },
  { name: "Nabin Lama", email: "nabin@kts.edu.np", type: "Hospitality Student", batch: "B-05", status: "Active" },
  { name: "Kritika Shahi", email: "kritika@kts.edu.np", type: "Caregiver Student", batch: "C-06", status: "Pending documents" },
];

function App() {
  const [session, setSession] = useState(null);
  const [loginError, setLoginError] = useState("");

  const handleLogin = async (email, password) => {
    try {
      const account = await apiLogin(email, password);
      setLoginError("");
      setSession(account);
    } catch (error) {
      setLoginError(error.message || "Invalid email or password.");
    }
  };

  if (!session) {
    return <LoginScreen onLogin={handleLogin} error={loginError} />;
  }

  return <Portal session={session} onLogout={() => { apiLogout(); setSession(null); }} />;
}

function LoginScreen({ onLogin, error }) {
  const [email, setEmail] = useState("admin@kts.edu.np");
  const [password, setPassword] = useState("Admin@123");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const useDemo = (role) => {
    setEmail(DEMO_USERS[role].email);
    setPassword(DEMO_USERS[role].password);
  };

  return (
    <div className="login-page">
      <section className="login-brand-side">
        <div className="brand-lockup">
          <img src={logo} alt="Kathmandu Technical School logo" />
          <div>
            <strong>Kathmandu Technical School</strong>
            <span>Digital Campus</span>
          </div>
        </div>

        <div className="login-hero">
          <span className="eyebrow">KTS DIGITAL CAMPUS</span>
          <h1>Skills today.<br /><em>Opportunity tomorrow.</em></h1>
          <p>
            A single platform for administration, teaching, learning,
            attendance, assessments, documents, fees and campus activities.
          </p>
          <div className="hero-feature-list">
            <span><ShieldCheck size={16} /> Role-based secure access</span>
            <span><BookOpen size={16} /> Caregiver & Hospitality learning</span>
            <span><Users size={16} /> Connected teachers & students</span>
          </div>
        </div>

        <div className="login-brand-footer">
          © 2026 Kathmandu Technical School
        </div>
      </section>

      <section className="login-form-side">
        <div className="login-card">
          <div className="mobile-logo">
            <img src={logo} alt="KTS logo" />
          </div>
          <span className="eyebrow">WELCOME BACK</span>
          <h2>Sign in to KTS Portal</h2>
          <p className="muted">Enter your KTS email and password to continue.</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onLogin(email, password);
            }}
          >
            <Field label="Email address" icon={Mail}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@kts.edu.np"
                required
              />
            </Field>

            <Field label="Password" icon={ShieldCheck}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                className="input-icon-button"
                onClick={() => setShowPassword((v) => !v)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                <Eye size={18} />
              </button>
            </Field>

            <div className="login-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                Remember me
              </label>
              <button type="button" className="link-button" onClick={() => setForgotOpen(true)}>
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="error-message">
                <AlertCircle size={17} />
                {error}
              </div>
            )}

            <button className="primary-button full-width" type="submit">
              Sign in <ArrowRight size={18} />
            </button>
          </form>

          <div className="demo-login">
            <div className="demo-title">Demo accounts</div>
            {Object.entries(DEMO_USERS).map(([role, user]) => (
              <div className="demo-row" key={role}>
                <span><strong>{role[0].toUpperCase() + role.slice(1)}</strong> — {user.email}</span>
                <button type="button" onClick={() => useDemo(role)}>Use</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {forgotOpen && (
        <Modal title="Forgot password" onClose={() => { setForgotOpen(false); setResetSent(false); }}>
          {!resetSent ? (
            <>
              <p className="muted">
                Enter your KTS email. In the production system this request
                will be sent to the password-reset service.
              </p>
              <Field label="KTS email address" icon={Mail}>
                <input placeholder="name@kts.edu.np" />
              </Field>
              <button className="primary-button full-width" onClick={() => setResetSent(true)}>
                Send reset request
              </button>
            </>
          ) : (
            <div className="success-message">
              <CheckCircle2 size={20} />
              <div>
                <strong>Reset request submitted</strong>
                <p>The password reset instructions will be sent if the account exists.</p>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

function Portal({ session, onLogout }) {
  const menu = MENU[session.role];
  const [active, setActive] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeTitle = menu.find(([id]) => id === active)?.[1] || "Dashboard";

  const changePage = (id) => {
    setActive(id);
    setSidebarOpen(false);
  };

  return (
    <div className="portal">
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <img src={logo} alt="KTS" />
          <div>
            <strong>KTS</strong>
            <span>Digital Campus</span>
          </div>
        </div>

        <div className={`role-pill ${session.role}`}>
          {session.role === "admin" ? "ADMINISTRATOR" : session.role.toUpperCase()}
        </div>

        <nav className="sidebar-nav">
          {menu.map(([id, label, Icon]) => (
            <button
              key={id}
              className={`nav-button ${active === id ? "active" : ""}`}
              onClick={() => changePage(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="profile-mini">
            <Avatar name={session.name} />
            <div>
              <strong>{session.name}</strong>
              <span>{session.email}</span>
            </div>
          </div>
          <button className="logout-button" onClick={onLogout}>
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </aside>

      <main className="portal-main">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setSidebarOpen((v) => !v)}>
            <Menu />
          </button>
          <div>
            <div className="breadcrumb">KTS Portal / {session.role}</div>
            <h2>{activeTitle}</h2>
          </div>
          <div className="topbar-actions">
            <button className="notification-button">
              <Bell size={19} />
              <i />
            </button>
            <div className="top-profile">
              <Avatar name={session.name} />
              <span>{session.name}</span>
              <ChevronDown size={16} />
            </div>
          </div>
        </header>

        <div className="page-content">
          {session.role === "admin" && <AdminPages active={active} changePage={changePage} />}
          {session.role === "teacher" && <TeacherPages active={active} session={session} changePage={changePage} />}
          {session.role === "student" && <StudentPages active={active} />}
        </div>
      </main>
    </div>
  );
}

function AdminPages({ active, changePage }) {
  const [teachers, setTeachers] = useState(initialTeachers);
  const [students, setStudents] = useState(initialStudents);
  const [registrationType, setRegistrationType] = useState("teacher");

  if (active === "teachers") {
    return <PeoplePage title="Teachers" rows={teachers} personType="teacher" onAdd={() => changePage("register")} />;
  }
  if (active === "students") {
    return <PeoplePage title="Students" rows={students} personType="student" onAdd={() => changePage("register")} />;
  }
  if (active === "register") {
    return (
      <RegistrationPage
        registrationType={registrationType}
        setRegistrationType={setRegistrationType}
        onCreated={(type, data) => {
          if (type === "teacher") setTeachers((prev) => [data, ...prev]);
          else setStudents((prev) => [data, ...prev]);
        }}
      />
    );
  }
  if (active === "activities") return <ActivityPage />;
  if (active === "timetable") return <TimetablePage admin />;
  if (active === "announcements") return <AnnouncementsPage />;
  if (active === "billing") return <BillingPage admin />;
  if (active === "settings") return <SettingsPage />;

  return <AdminDashboard onRegister={() => changePage("register")} />;
}

function AdminDashboard({ onRegister }) {
  const stats = [
    ["Total Students", "248", "+12 this month", GraduationCap],
    ["Active Teachers", "26", "+3 this month", Users],
    ["Caregiver Students", "132", "53% of students", ShieldCheck],
    ["Hospitality Students", "116", "47% of students", BookOpen],
  ];

  return (
    <>
      <PageIntro
        eyebrow="ADMIN OVERVIEW"
        title="Good evening, Administrator 👋"
        description="Manage people, learning, attendance, fees and all KTS activities from one place."
        action={<button className="primary-button" onClick={onRegister}><UserPlus size={18} /> Register user</button>}
      />

      <div className="stat-grid">
        {stats.map(([label, value, sub, Icon]) => (
          <StatCard key={label} label={label} value={value} sub={sub} icon={Icon} />
        ))}
      </div>

      <div className="dashboard-grid">
        <Panel title="Recent activity" action="View all">
          <ActivityRows />
        </Panel>

        <Panel title="Today's snapshot">
          <div className="snapshot-list">
            <div>
              <span>Present today</span>
              <strong>226 / 248</strong>
              <div className="progress"><i style={{ width: "91%" }} /></div>
            </div>
            <div><span>Pending leave requests</span><strong>7</strong></div>
            <div><span>Fees outstanding</span><strong>NPR 486,500</strong></div>
            <div><span>Published materials</span><strong>184</strong></div>
          </div>
        </Panel>
      </div>

      <Panel title="Quick actions">
        <div className="quick-grid">
          {[
            ["Register teacher", "Create account + temporary password", UserPlus],
            ["Register student", "Upload documents and assign course", GraduationCap],
            ["Publish announcement", "Holiday, test, exam or event", Bell],
            ["Manage timetable", "Assign teacher, room and batch", CalendarDays],
          ].map(([title, text, Icon]) => (
            <button className="quick-card" key={title}>
              <div className="quick-icon"><Icon size={19} /></div>
              <div><strong>{title}</strong><span>{text}</span></div>
              <ArrowRight size={17} />
            </button>
          ))}
        </div>
      </Panel>
    </>
  );
}

function RegistrationPage({ registrationType, setRegistrationType, onCreated }) {
  return (
    <>
      <PageIntro
        eyebrow="USER MANAGEMENT"
        title={`Register a new ${registrationType}`}
        description="Create the account, issue a temporary password and store the required documents."
      />
      <div className="segmented">
        <button className={registrationType === "teacher" ? "selected" : ""} onClick={() => setRegistrationType("teacher")}>
          Teacher registration
        </button>
        <button className={registrationType === "student" ? "selected" : ""} onClick={() => setRegistrationType("student")}>
          Student registration
        </button>
      </div>

      {registrationType === "teacher" ? (
        <TeacherRegistrationForm onCreated={onCreated} />
      ) : (
        <StudentRegistrationForm onCreated={onCreated} />
      )}
    </>
  );
}

function TeacherRegistrationForm({ onCreated }) {
  const [category, setCategory] = useState("caregiver");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("KTS@Temp123");
  const [files, setFiles] = useState({});
  const [created, setCreated] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!name || !email || !files.cv || !files.certificate) return;
    const record = {
      name,
      email,
      type: category === "caregiver" ? "Caregiver Teacher" : "Hospitality Teacher",
      status: "Active",
    };
    onCreated("teacher", record);
    setCreated(true);
  };

  return (
    <form className="panel form-panel" onSubmit={submit}>
      <FormSection title="Basic information">
        <div className="form-grid">
          <ControlledField label="Full name" required value={name} onChange={setName} placeholder="Teacher full name" />
          <ControlledField label="Email address" required value={email} onChange={setEmail} placeholder="teacher@kts.edu.np" type="email" />
          <Field label="Phone number" placeholder="+977 98XXXXXXXX" />
          <ControlledField label="Temporary password" required value={temporaryPassword} onChange={setTemporaryPassword} placeholder="Temporary password" />
        </div>
      </FormSection>

      <FormSection title="Teacher category">
        <div className="choice-grid">
          <ChoiceCard
            selected={category === "caregiver"}
            onClick={() => setCategory("caregiver")}
            icon={ShieldCheck}
            title="Caregiver Teacher"
            text="Caregiving, first aid and related programmes."
          />
          <ChoiceCard
            selected={category === "hospitality"}
            onClick={() => setCategory("hospitality")}
            icon={BookOpen}
            title="Hospitality Teacher"
            text="CNG, Barista and Bakery programmes."
          />
        </div>
      </FormSection>

      <FormSection title="Professional documents" required>
        <div className="upload-grid">
          <UploadBox title="CV / Resume" required onFile={(file) => setFiles((p) => ({ ...p, cv: file }))} />
          <UploadBox title="Professional certificate" required onFile={(file) => setFiles((p) => ({ ...p, certificate: file }))} />
          <UploadBox title="Other certificate" onFile={(file) => setFiles((p) => ({ ...p, other: file }))} />
        </div>
      </FormSection>

      <FormSection title="Teaching course access">
        <div className="course-check-grid">
          {COURSE_OPTIONS[category].map((course) => (
            <label key={course} className="course-check">
              <input type="checkbox" />
              <span>{course}</span>
            </label>
          ))}
        </div>
      </FormSection>

      <div className="form-actions">
        <button type="button" className="secondary-button">Save draft</button>
        <button type="submit" className="primary-button"><UserPlus size={18} /> Create teacher account</button>
      </div>

      {created && (
        <div className="success-message">
          <CheckCircle2 size={20} />
          <div>
            <strong>Teacher account created successfully.</strong>
            <p>The temporary password can now be sent to the teacher's email. First login should force a password change.</p>
          </div>
        </div>
      )}
    </form>
  );
}

function StudentRegistrationForm({ onCreated }) {
  const [category, setCategory] = useState("caregiver");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("");
  const [files, setFiles] = useState({});
  const [created, setCreated] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!name || !email || !course || !files.photo || !files.id || !files.certificate) return;
    onCreated("student", {
      name,
      email,
      type: category === "caregiver" ? "Caregiver Student" : "Hospitality Student",
      batch: "New",
      status: "Active",
    });
    setCreated(true);
  };

  return (
    <form className="panel form-panel" onSubmit={submit}>
      <FormSection title="Student information">
        <div className="form-grid">
          <ControlledField label="Full name" required value={name} onChange={setName} placeholder="Student full name" />
          <ControlledField label="Email address" required value={email} onChange={setEmail} placeholder="student@kts.edu.np" type="email" />
          <Field label="Phone number" placeholder="+977 98XXXXXXXX" />
          <Field label="Temporary password" placeholder="Auto-generate or enter password" />
          <Field label="Date of birth" type="date" />
          <Field label="Address" placeholder="Permanent address" />
        </div>
      </FormSection>

      <FormSection title="Programme type">
        <div className="choice-grid">
          <ChoiceCard
            selected={category === "caregiver"}
            onClick={() => { setCategory("caregiver"); setCourse(""); }}
            icon={ShieldCheck}
            title="Caregiver Student"
            text="Caregiving and health-support related training."
          />
          <ChoiceCard
            selected={category === "hospitality"}
            onClick={() => { setCategory("hospitality"); setCourse(""); }}
            icon={BookOpen}
            title="Hospitality Student"
            text="CNG, Barista and Bakery training programmes."
          />
        </div>
      </FormSection>

      <FormSection title={`${category === "caregiver" ? "Caregiver" : "Hospitality"} course & documents`}>
        <div className="single-field">
          <label>Course <span className="required">*</span></label>
          <div className="select-wrap">
            <select value={course} onChange={(e) => setCourse(e.target.value)} required>
              <option value="">Select a course</option>
              {COURSE_OPTIONS[category].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown size={17} />
          </div>
        </div>

        <div className="upload-grid">
          <UploadBox title="Passport-size photo" required onFile={(file) => setFiles((p) => ({ ...p, photo: file }))} />
          <UploadBox title="Citizenship / National ID" required onFile={(file) => setFiles((p) => ({ ...p, id: file }))} />
          <UploadBox title="Previous certificate" required onFile={(file) => setFiles((p) => ({ ...p, certificate: file }))} />
          <UploadBox title="Other certificate" onFile={(file) => setFiles((p) => ({ ...p, other: file }))} />
          <UploadBox title="Training / experience document" onFile={(file) => setFiles((p) => ({ ...p, experience: file }))} />
        </div>
      </FormSection>

      <FormSection title="Enrollment details">
        <div className="form-grid">
          <Field label="Batch / group" placeholder="e.g. C-07" />
          <Field label="Enrollment date" type="date" />
          <Field label="Emergency contact" placeholder="Name + phone" />
        </div>
      </FormSection>

      <div className="form-actions">
        <button type="button" className="secondary-button">Save draft</button>
        <button type="submit" className="primary-button"><UserPlus size={18} /> Create student account</button>
      </div>

      {created && (
        <div className="success-message">
          <CheckCircle2 size={20} />
          <div>
            <strong>Student account created successfully.</strong>
            <p>The temporary login credentials are ready to send by email.</p>
          </div>
        </div>
      )}
    </form>
  );
}

function PeoplePage({ title, rows, personType, onAdd }) {
  const [query, setQuery] = useState("");
  const filtered = rows.filter((row) =>
    `${row.name} ${row.email} ${row.type}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Panel
      title={title}
      action={<button className="primary-button" onClick={onAdd}><Plus size={18} /> Add {personType}</button>}
    >
      <div className="table-toolbar">
        <div className="search-box">
          <Search size={17} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${title.toLowerCase()}...`} />
        </div>
        <div className="filter-chip">{filtered.length} records</div>
      </div>

      <div className="responsive-table">
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Programme / role</th>{personType === "student" && <th>Batch</th>}<th>Status</th><th /></tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.email}>
                <td><div className="person-cell"><Avatar name={row.name} /><strong>{row.name}</strong></div></td>
                <td>{row.email}</td>
                <td>{row.type}</td>
                {personType === "student" && <td>{row.batch}</td>}
                <td><span className={`status ${statusClass(row.status)}`}>{row.status}</span></td>
                <td><button className="icon-button"><MoreHorizontal size={18} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function ActivityPage() {
  const items = [
    ["Sujan Gurung", "Submitted Assignment 03 — Caregiver", "Today, 10:41 AM", "Student"],
    ["Prakash Rai", "Published Barista Course PDF — Module 04", "Today, 9:32 AM", "Teacher"],
    ["Anita Shrestha", "Updated attendance for C-07", "Today, 8:55 AM", "Teacher"],
    ["Asha Tamang", "Completed Online Test — Food Safety", "Yesterday, 4:18 PM", "Student"],
    ["Admin", "Registered new Hospitality student", "Yesterday, 2:04 PM", "Admin"],
    ["Ramesh Karki", "Submitted leave application", "Yesterday, 1:16 PM", "Teacher"],
  ];

  return (
    <Panel title="Student & teacher activity" subtitle="Administrator can review platform activity, submissions, attendance and account events.">
      <div className="table-toolbar">
        <div className="search-box"><Search size={17} /><input placeholder="Search activity..." /></div>
        <div className="filter-chip">All activity</div>
      </div>
      <div className="activity-feed">
        {items.map(([name, text, time, role], index) => (
          <div className="activity-item" key={index}>
            <div className="activity-icon"><Activity size={16} /></div>
            <div className="activity-body"><strong>{name}</strong><p>{text}</p></div>
            <div className="activity-meta"><span>{role}</span><small>{time}</small></div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function TimetablePage({ admin = false }) {
  const rows = [
    ["09:00–10:30", "C-07", "Caregiver", "Anita Shrestha", "Room 201"],
    ["11:00–12:30", "C-08", "First Aid & Patient Safety", "Ramesh Karki", "Lab 1"],
    ["13:00–14:30", "B-04", "Barista — Basic", "Prakash Rai", "Hospitality Lab"],
    ["15:00–16:30", "B-05", "Bakery — Basic", "Mina Gurung", "Bakery Lab"],
  ];

  return (
    <Panel
      title={admin ? "Class timetable management" : "Timetable & classrooms"}
      subtitle={admin ? "Assign batch, teacher, course, room and time." : "See your scheduled classes, rooms and assigned batches."}
      action={admin && <button className="primary-button"><Plus size={18} /> Add class</button>}
    >
      <div className="week-switcher">
        <button>‹</button><strong>Monday, 11 August 2026</strong><button>›</button>
      </div>
      <div className="responsive-table">
        <table>
          <thead><tr><th>Time</th><th>Batch</th><th>Course</th><th>Teacher</th><th>Classroom</th>{admin && <th />}</tr></thead>
          <tbody>{rows.map((r, i) => <tr key={i}>{r.map((v, j) => <td key={j}>{v}</td>)}{admin && <td><button className="icon-button"><MoreHorizontal size={18}/></button></td>}</tr>)}</tbody>
        </table>
      </div>
    </Panel>
  );
}

function AnnouncementsPage() {
  const announcements = [
    ["Holiday Notice", "KTS will remain closed on 15 August for a scheduled holiday.", "12 Aug 2026", "Holiday"],
    ["Mid-term Examination", "Mid-term examinations begin from 24 August. Check your timetable.", "10 Aug 2026", "Exam"],
    ["Fun Activity Day", "Inter-batch sports and fun activities will be held this Friday.", "08 Aug 2026", "Activity"],
  ];

  return (
    <Panel title="Announcements" subtitle="Publish and view holidays, tests, exams, activities and important notices." action={<button className="primary-button"><Plus size={18}/> New announcement</button>}>
      <div className="announcement-grid">
        {announcements.map(([title, text, date, tag]) => (
          <article className="announcement-card" key={title}>
            <div className="announcement-top"><span className="tag">{tag}</span><small>{date}</small></div>
            <h3>{title}</h3>
            <p>{text}</p>
            <button className="text-button">Read more <ArrowRight size={15}/></button>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function BillingPage({ admin = false }) {
  return (
    <Panel title={admin ? "Billing & fee overview" : "Fees & bills"} subtitle={admin ? "Monitor paid, due and outstanding student fees." : "See your paid amount, current due and payment history."}>
      <div className="billing-summary">
        <div><span>Total paid</span><strong>NPR 54,000</strong></div>
        <div><span>Current due</span><strong>NPR 18,000</strong></div>
        <div><span>Next payment</span><strong>30 Aug 2026</strong></div>
      </div>
      <div className="responsive-table">
        <table>
          <thead><tr><th>Invoice</th><th>Description</th><th>Amount</th><th>Due date</th><th>Status</th><th /></tr></thead>
          <tbody>
            <tr><td>INV-2026-081</td><td>August tuition fee</td><td>NPR 18,000</td><td>30 Aug 2026</td><td><span className="status due">Due</span></td><td><button className="text-button">Pay now</button></td></tr>
            <tr><td>INV-2026-072</td><td>July tuition fee</td><td>NPR 18,000</td><td>31 Jul 2026</td><td><span className="status active">Paid</span></td><td><button className="icon-button"><Download size={17}/></button></td></tr>
            <tr><td>INV-2026-063</td><td>June tuition fee</td><td>NPR 18,000</td><td>30 Jun 2026</td><td><span className="status active">Paid</span></td><td><button className="icon-button"><Download size={17}/></button></td></tr>
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function SettingsPage() {
  return (
    <Panel title="Settings" subtitle="Core KTS portal settings and account preferences.">
      <div className="settings-grid">
        <div className="setting-card"><ShieldCheck size={20}/><div><strong>Security</strong><p>Require password change for temporary passwords and control session security.</p></div><button className="secondary-button">Configure</button></div>
        <div className="setting-card"><Bell size={20}/><div><strong>Notifications</strong><p>Email alerts for registration, leave, announcements and fee reminders.</p></div><button className="secondary-button">Configure</button></div>
        <div className="setting-card"><Users size={20}/><div><strong>Roles & permissions</strong><p>Admin has full access; teacher and student access is restricted by role.</p></div><button className="secondary-button">Configure</button></div>
      </div>
    </Panel>
  );
}

function TeacherPages({ active, session, changePage }) {
  if (active === "courses") return <CoursesPage session={session} />;
  if (active === "assignments") return <AssignmentsPage session={session} />;
  if (active === "grades") return <GradesPage />;
  if (active === "attendance") return <AttendancePage />;
  if (active === "timetable") return <TimetablePage />;
  if (active === "leave") return <LeavePage />;
  if (active === "announcements") return <AnnouncementsPage />;
  return <TeacherDashboard changePage={changePage} />;
}

function TeacherDashboard({ changePage }) {
  return (
    <>
      <PageIntro
        eyebrow="TEACHER PORTAL"
        title="Good evening, Teacher 👋"
        description="Manage your courses, materials, attendance, grades and classes."
        action={<button className="primary-button" onClick={() => changePage("courses")}><Upload size={18}/> Upload material</button>}
      />
      <div className="stat-grid">
        <StatCard label="Assigned students" value="42" sub="Across 3 batches" icon={GraduationCap} />
        <StatCard label="Attendance today" value="39/42" sub="92.9% present" icon={ClipboardCheck} />
        <StatCard label="Pending grading" value="8" sub="Assignments & tests" icon={BarChart3} />
        <StatCard label="Classes today" value="3" sub="2 completed" icon={CalendarDays} />
      </div>
      <div className="dashboard-grid">
        <Panel title="Today's timetable">
          <ScheduleList />
        </Panel>
        <Panel title="Needs attention">
          <div className="attention-list">
            <div><span className="attention-number">8</span><div><strong>Assignments waiting for grades</strong><small>Due for review</small></div></div>
            <div><span className="attention-number">1</span><div><strong>Leave application</strong><small>Pending administrator review</small></div></div>
            <div><span className="attention-number">3</span><div><strong>Materials to publish</strong><small>Draft documents</small></div></div>
          </div>
        </Panel>
      </div>
    </>
  );
}

function CoursesPage({ session }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", course: "Caregiver", description: "", published: true, file: null });

  const loadMaterials = async () => {
    try {
      setLoading(true);
      setError("");
      setMaterials(await getMaterials());
    } catch (e) {
      setError(e.message || "Unable to load materials.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { loadMaterials(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.file) return setError("Please select a PDF, Word, image or presentation file.");
    try {
      setSaving(true);
      setError("");
      await uploadMaterial(form);
      setForm({ title: "", course: "Caregiver", description: "", published: true, file: null });
      setModalOpen(false);
      await loadMaterials();
    } catch (e) {
      setError(e.message || "Upload failed.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this material?")) return;
    try {
      await deleteMaterial(id);
      await loadMaterials();
    } catch (e) {
      setError(e.message || "Could not delete material.");
    }
  };

  return (
    <>
      <Panel title="Courses & learning materials" subtitle="Upload real PDF, Word, image and presentation files for your students." action={<button className="primary-button" onClick={() => setModalOpen(true)}><Upload size={18}/> Upload material</button>}>
        {error && <div className="error-message"><AlertCircle size={18}/><div>{error}</div></div>}
        {loading ? <p className="muted">Loading materials...</p> : materials.length === 0 ? <div className="empty-state"><BookOpen size={28}/><strong>No materials uploaded yet.</strong><span>Click “Upload material” to create your first real course material.</span></div> : (
          <div className="material-grid">
            {materials.map((m) => (
              <div className="material-card" key={m.id}>
                <div className="file-icon"><FileText size={21}/></div>
                <div><strong>{m.title}</strong><span>{m.original_filename} · {(m.size_bytes / 1024 / 1024).toFixed(2)} MB · {new Date(m.created_at).toLocaleDateString()}</span><small>{m.course}</small></div>
                <div className="material-actions">
                  <a className="download-button" href={getFileUrl(m.download_url)} target="_blank" rel="noreferrer"><Download size={17}/> Open</a>
                  {m.teacher_id === session.id && <button className="icon-button" onClick={() => remove(m.id)} title="Delete"><X size={17}/></button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {modalOpen && <Modal title="Upload course material" onClose={() => !saving && setModalOpen(false)}>
        <form className="form-stack" onSubmit={submit}>
          <div className="form-grid">
            <Field label="Material title"><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Caregiver Module 01" required /></Field>
            <Field label="Course"><select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}><option>Caregiver</option><option>CNG</option><option>Barista — Advance Barista Course</option><option>Barista — Basic Barista Course</option><option>Bakery — Advance Bakery Course</option><option>Bakery — Basic Bakery Course</option></select></Field>
          </div>
          <Field label="Description"><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What should students learn from this material?" rows="4" /></Field>
          <label className="upload-box" style={{ cursor: "pointer" }}>
            <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.ppt,.pptx,.xls,.xlsx" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })} required />
            <div className="upload-icon"><Upload size={18}/></div><strong>{form.file?.name || "Choose file"}</strong><span>Maximum 20 MB</span><small>PDF, DOC, DOCX, JPG, PNG, PPT, PPTX, XLS or XLSX</small>
          </label>
          <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? "Uploading..." : "Upload & Publish"}</button></div>
        </form>
      </Modal>}
    </>
  );
}

function AssignmentsPage({ session }) {
  const [assignments, setAssignments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const emptyForm = { title: "", course: "Caregiver", description: "", due_date: "", max_marks: 100 };
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    try {
      setError("");
      setAssignments(await getAssignments());
    } catch (e) {
      setError(e.message || "Unable to load assignments.");
    }
  };

  React.useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (assignment) => {
    setEditing(assignment);
    setForm({
      title: assignment.title,
      course: assignment.course,
      description: assignment.description || "",
      due_date: assignment.due_date || "",
      max_marks: assignment.max_marks,
    });
    setError("");
    setModalOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      const payload = {
        ...form,
        title: form.title.trim(),
        course: form.course.trim(),
        max_marks: Number(form.max_marks),
        due_date: form.due_date || null,
        description: form.description || null,
      };

      if (editing) {
        await updateAssignment(editing.id, payload);
      } else {
        await createAssignment(payload);
      }

      setForm(emptyForm);
      setEditing(null);
      setModalOpen(false);
      await load();
    } catch (e) {
      setError(e.message || (editing ? "Could not update assignment." : "Could not create assignment."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (assignment) => {
    if (!window.confirm(`Delete "${assignment.title}"? This will also remove grades recorded for this assignment.`)) return;
    try {
      setError("");
      await deleteAssignment(assignment.id);
      await load();
    } catch (e) {
      setError(e.message || "Could not delete assignment.");
    }
  };

  return (
    <>
      <Panel
        title="Assignments"
        subtitle="Create assignments, edit details, delete old assignments and review student work."
        action={<button className="primary-button" onClick={openCreate}><Plus size={18}/> Create assignment</button>}
      >
        {error && <div className="error-message"><AlertCircle size={18}/><div>{error}</div></div>}
        {assignments.length === 0 ? (
          <div className="empty-state">
            <ClipboardList size={28}/>
            <strong>No assignments created yet.</strong>
            <span>Click “Create assignment” to add one to the database.</span>
          </div>
        ) : (
          <div className="assignment-list">
            {assignments.map((a) => (
              <div className="assignment-row" key={a.id}>
                <div className="file-icon"><ClipboardList size={20}/></div>
                <div>
                  <strong>{a.title}</strong>
                  <span>{a.course} · {a.max_marks} marks · {a.due_date ? `Due ${a.due_date}` : "No deadline"}</span>
                  <small>{a.description || "No description"}</small>
                </div>
                <div className="assignment-actions">
                  <button className="secondary-button" onClick={() => openEdit(a)} title="Edit assignment"><Pencil size={15}/> Edit</button>
                  <button className="icon-button" onClick={() => remove(a)} title="Delete assignment"><Trash2 size={17}/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {modalOpen && (
        <Modal title={editing ? "Edit assignment" : "Create assignment"} onClose={() => !saving && setModalOpen(false)}>
          <form className="form-stack" onSubmit={submit}>
            <div className="form-grid">
              <Field label="Assignment title">
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Patient Safety Assignment" required />
              </Field>
              <Field label="Course">
                <select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
                  <option>Caregiver</option>
                  <option>CNG</option>
                  <option>Barista — Advance Barista Course</option>
                  <option>Barista — Basic Barista Course</option>
                  <option>Bakery — Advance Bakery Course</option>
                  <option>Bakery — Basic Bakery Course</option>
                </select>
              </Field>
              <Field label="Due date" type="date">
                <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
              </Field>
              <Field label="Maximum marks">
                <input type="number" min="1" max="1000" value={form.max_marks} onChange={(e) => setForm({ ...form, max_marks: e.target.value })} required />
              </Field>
            </div>
            <Field label="Instructions">
              <textarea rows="5" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Write assignment instructions..." />
            </Field>
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</button>
              <button className="primary-button" disabled={saving}>{saving ? (editing ? "Saving..." : "Creating...") : (editing ? "Save changes" : "Create assignment")}</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

function GradesPage() {
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [grades, setGrades] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedAssignment = assignments.find((a) => String(a.id) === String(selectedAssignmentId));

  const loadInitial = async () => {
    try {
      setLoading(true);
      setError("");
      const [assignmentRows, studentRows] = await Promise.all([getAssignments(), getStudents()]);
      setAssignments(assignmentRows);
      setStudents(studentRows);
      if (assignmentRows.length) setSelectedAssignmentId(String(assignmentRows[0].id));
    } catch (e) {
      setError(e.message || "Unable to load grading data.");
    } finally {
      setLoading(false);
    }
  };

  const loadGrades = async (assignmentId) => {
    if (!assignmentId) {
      setGrades([]);
      setDrafts({});
      return;
    }

    try {
      setError("");
      const rows = await getGrades(Number(assignmentId));
      setGrades(rows);

      const next = {};
      rows.forEach((g) => {
        next[g.student_id] = {
          marks: g.marks,
          feedback: g.feedback || "",
          gradeId: g.id,
        };
      });
      setDrafts(next);
    } catch (e) {
      setError(e.message || "Unable to load grades.");
    }
  };

  React.useEffect(() => { loadInitial(); }, []);
  React.useEffect(() => { loadGrades(selectedAssignmentId); }, [selectedAssignmentId]);

  const updateDraft = (studentId, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { marks: "", feedback: "" }),
        [field]: value,
      },
    }));
  };

  const saveAll = async () => {
    if (!selectedAssignment) return;

    const rows = students.filter((student) => {
      const draft = drafts[student.id];
      return draft && draft.marks !== "" && draft.marks !== null && draft.marks !== undefined;
    });

    if (!rows.length) {
      setError("Enter marks for at least one student before saving.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      for (const student of rows) {
        const draft = drafts[student.id];
        const marks = Number(draft.marks);

        if (!Number.isInteger(marks) || marks < 0 || marks > selectedAssignment.max_marks) {
          throw new Error(`${student.name}: marks must be between 0 and ${selectedAssignment.max_marks}.`);
        }

        await saveGrade({
          assignment_id: selectedAssignment.id,
          student_id: student.id,
          marks,
          feedback: draft.feedback || null,
        });
      }

      await loadGrades(selectedAssignment.id);
      setSuccess(`Grades saved successfully for ${rows.length} student${rows.length === 1 ? "" : "s"}.`);
    } catch (e) {
      setError(e.message || "Could not save grades.");
    } finally {
      setSaving(false);
    }
  };

  const gradeMap = useMemo(() => {
    const map = {};
    grades.forEach((g) => { map[g.student_id] = g; });
    return map;
  }, [grades]);

  return (
    <Panel
      title="Grades & assessments"
      subtitle="Select an assignment, enter marks for students and save the grades to the database."
      action={<button className="primary-button" onClick={saveAll} disabled={saving || !selectedAssignment}>{saving ? "Saving..." : "Save grades"}</button>}
    >
      {error && <div className="error-message"><AlertCircle size={18}/><div>{error}</div></div>}
      {success && <div className="success-message"><CheckCircle2 size={19}/><div><strong>Grades saved.</strong><p>{success}</p></div></div>}

      {loading ? (
        <p className="muted">Loading assignments and students...</p>
      ) : assignments.length === 0 ? (
        <div className="empty-state"><ClipboardList size={28}/><strong>Create an assignment first.</strong><span>Once an assignment exists, you can select it here and grade students.</span></div>
      ) : (
        <>
          <div className="table-toolbar">
            <div className="select-wrap compact">
              <select value={selectedAssignmentId} onChange={(e) => setSelectedAssignmentId(e.target.value)}>
                {assignments.map((a) => <option key={a.id} value={a.id}>{a.title} — {a.max_marks} marks</option>)}
              </select>
              <ChevronDown size={17}/>
            </div>
            {selectedAssignment && <span className="muted">Maximum: {selectedAssignment.max_marks} marks</span>}
          </div>

          <div className="responsive-table">
            <table>
              <thead>
                <tr><th>Student</th><th>Marks</th><th>Percentage</th><th>Feedback</th><th>Status</th></tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const draft = drafts[student.id] || { marks: "", feedback: "" };
                  const existing = gradeMap[student.id];
                  const marks = draft.marks === "" ? "" : Number(draft.marks);
                  const percentage = marks !== "" && selectedAssignment?.max_marks ? Math.round((marks / selectedAssignment.max_marks) * 100) : null;

                  return (
                    <tr key={student.id}>
                      <td><strong>{student.name}</strong><br/><small>{student.email}</small></td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max={selectedAssignment?.max_marks || 100}
                          value={draft.marks}
                          onChange={(e) => updateDraft(student.id, "marks", e.target.value)}
                          style={{ width: 90 }}
                          placeholder="—"
                        />
                      </td>
                      <td>{percentage === null ? "—" : `${percentage}%`}</td>
                      <td>
                        <input
                          value={draft.feedback || ""}
                          onChange={(e) => updateDraft(student.id, "feedback", e.target.value)}
                          placeholder="Optional feedback"
                          style={{ minWidth: 190 }}
                        />
                      </td>
                      <td>{existing ? <span className="status-pill active">Graded</span> : <span className="status-pill pending">Not graded</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Panel>
  );
}

function AttendancePage() {
  const [saved, setSaved] = useState(false);
  const [present, setPresent] = useState({ Sujan: true, Kritika: true, Nabin: false, Asha: true });

  return (
    <Panel title="Take attendance" subtitle="Select a batch and mark today's attendance." action={<button className="primary-button" onClick={() => setSaved(true)}><Check size={18}/> Save attendance</button>}>
      {saved && <div className="success-message"><CheckCircle2 size={19}/><div><strong>Attendance saved.</strong><p>Today's attendance for the selected batch has been recorded.</p></div></div>}
      <div className="attendance-header"><div className="select-wrap compact"><select><option>C-07 — Caregiver</option><option>B-04 — Barista Basic</option></select><ChevronDown size={17}/></div><div className="date-pill"><CalendarDays size={16}/> 11 Aug 2026</div></div>
      <div className="attendance-list">
        {Object.entries(present).map(([name, value]) => (
          <label className="attendance-row" key={name}>
            <Avatar name={name} /><span><strong>{name}</strong><small>C-07</small></span>
            <input type="checkbox" checked={value} onChange={() => setPresent((p) => ({ ...p, [name]: !p[name] }))} />
            <b className={value ? "present" : "absent"}>{value ? "Present" : "Absent"}</b>
          </label>
        ))}
      </div>
    </Panel>
  );
}

function LeavePage() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <Panel title="Leave application" subtitle="Submit your leave request for administrator approval.">
      {submitted ? (
        <div className="success-message"><CheckCircle2 size={20}/><div><strong>Leave application submitted.</strong><p>Your request is now pending administrator review.</p><button className="text-button" onClick={() => setSubmitted(false)}>Submit another</button></div></div>
      ) : (
        <div className="leave-form">
          <div className="form-grid">
            <Field label="Leave type"><select><option>Personal leave</option><option>Sick leave</option><option>Emergency leave</option><option>Other</option></select></Field>
            <Field label="Start date" type="date" />
            <Field label="End date" type="date" />
            <Field label="Reason"><textarea placeholder="Explain the reason for your leave..." /></Field>
          </div>
          <button className="primary-button" onClick={() => setSubmitted(true)}>Submit leave application</button>
        </div>
      )}
    </Panel>
  );
}

function StudentPages({ active }) {
  if (active === "attendance") return <StudentAttendance />;
  if (active === "courses") return <StudentMaterials />;
  if (active === "tests") return <StudentTests />;
  if (active === "billing") return <BillingPage />;
  if (active === "timetable") return <TimetablePage />;
  if (active === "announcements") return <AnnouncementsPage />;
  if (active === "activities") return <StudentActivities />;
  return <StudentDashboard />;
}

function StudentDashboard() {
  return (
    <>
      <PageIntro eyebrow="STUDENT PORTAL" title="Good evening, Student 👋" description="Your learning, attendance, fees and campus activities at a glance." />
      <div className="stat-grid">
        <StatCard label="Attendance" value="92.9%" sub="39 of 42 classes" icon={ClipboardCheck} />
        <StatCard label="Current due" value="NPR 18,000" sub="Due 30 Aug 2026" icon={CreditCard} />
        <StatCard label="Course progress" value="68%" sub="Caregiver" icon={BookOpen} />
        <StatCard label="Average grade" value="82%" sub="Across assessments" icon={Award} />
      </div>
      <div className="dashboard-grid">
        <Panel title="My next classes">
          <ScheduleList />
        </Panel>
        <Panel title="Latest announcements">
          <div className="notice-list">
            <div><span className="tag">Exam</span><strong>Mid-term examination begins 24 Aug</strong><small>Check the exam timetable.</small></div>
            <div><span className="tag">Holiday</span><strong>KTS holiday on 15 Aug</strong><small>Campus will remain closed.</small></div>
            <div><span className="tag">Activity</span><strong>Inter-batch fun day</strong><small>Friday, 14 Aug.</small></div>
          </div>
        </Panel>
      </div>
    </>
  );
}

function StudentAttendance() {
  return (
    <Panel title="My attendance" subtitle="View your attendance by course and month.">
      <div className="attendance-summary"><div><span>Overall</span><strong>92.9%</strong></div><div><span>Present</span><strong>39</strong></div><div><span>Absent</span><strong>3</strong></div><div><span>Classes</span><strong>42</strong></div></div>
      <div className="responsive-table">
        <table><thead><tr><th>Date</th><th>Course</th><th>Teacher</th><th>Room</th><th>Status</th></tr></thead><tbody>
          {[
            ["11 Aug", "Caregiver", "Anita Shrestha", "201", "Present"],
            ["09 Aug", "First Aid", "Ramesh Karki", "Lab 1", "Present"],
            ["07 Aug", "Caregiver", "Anita Shrestha", "201", "Absent"],
            ["05 Aug", "Caregiver", "Anita Shrestha", "201", "Present"],
          ].map((r) => <tr key={r[0]}>{r.map((v,i)=><td key={i}>{i===4?<span className={`status ${v.toLowerCase()}`}>{v}</span>:v}</td>)}</tr>)}
        </tbody></table>
      </div>
    </Panel>
  );
}

function StudentMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  React.useEffect(() => {
    getMaterials().then(setMaterials).catch((e) => setError(e.message || "Unable to load materials.")).finally(() => setLoading(false));
  }, []);
  return <Panel title="Study materials" subtitle="Download course PDFs, Word documents, assignments and other learning resources.">
    {error && <div className="error-message"><AlertCircle size={18}/><div>{error}</div></div>}
    {loading ? <p className="muted">Loading study materials...</p> : materials.length === 0 ? <div className="empty-state"><BookOpen size={28}/><strong>No published materials yet.</strong><span>Your teacher's uploaded materials will appear here.</span></div> : <div className="material-grid">
      {materials.map((m) => <div className="material-card" key={m.id}><div className="file-icon"><FileText size={21}/></div><div><strong>{m.title}</strong><span>{m.original_filename} · {(m.size_bytes / 1024 / 1024).toFixed(2)} MB</span><small>{m.course} · By {m.teacher_name}</small></div><a className="download-button" href={getFileUrl(m.download_url)} target="_blank" rel="noreferrer"><Download size={17}/> Download</a></div>)}
    </div>}
  </Panel>;
}

function StudentTests() {
  const [started, setStarted] = useState(null);
  return (
    <Panel title="Tests & examinations" subtitle="Take available online tests and view published results.">
      <div className="test-grid">
        {[
          ["Food Safety — Test 02", "20 questions", "25 min", "Available"],
          ["Caregiver — Mid-term Exam", "50 questions", "60 min", "Upcoming"],
          ["First Aid — Practice Quiz", "15 questions", "15 min", "Available"],
        ].map(([title, questions, time, status]) => (
          <div className="test-card" key={title}>
            <div className="test-icon"><FileCheck2 size={21}/></div>
            <span className="tag">{status}</span>
            <h3>{title}</h3>
            <p>{questions} · {time}</p>
            <button className="primary-button" disabled={status === "Upcoming"} onClick={() => setStarted(title)}>
              {status === "Available" ? "Start test" : "View schedule"}
            </button>
          </div>
        ))}
      </div>
      {started && <Modal title={started} onClose={() => setStarted(null)}><p className="muted">This demo opens the test flow. Connect the assessment API here for the production exam system.</p><button className="primary-button full-width" onClick={() => setStarted(null)}>Begin test</button></Modal>}
    </Panel>
  );
}

function StudentActivities() {
  return (
    <Panel title="Campus activities" subtitle="Fun activities, events and other KTS community updates.">
      <div className="event-grid">
        {[
          ["Inter-batch Sports Day", "14 Aug 2026", "KTS Ground", "Sports"],
          ["Career Guidance Session", "19 Aug 2026", "Seminar Hall", "Career"],
          ["Hospitality Skills Showcase", "28 Aug 2026", "Hospitality Lab", "Showcase"],
        ].map(([title, date, place, type]) => (
          <article className="event-card" key={title}><span className="tag">{type}</span><h3>{title}</h3><p><CalendarDays size={15}/> {date}</p><p><Home size={15}/> {place}</p><button className="text-button">View details <ArrowRight size={15}/></button></article>
        ))}
      </div>
    </Panel>
  );
}

/* ---------- Reusable UI ---------- */

function PageIntro({ eyebrow, title, description, action }) {
  return (
    <div className="page-intro">
      <div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>
      {action}
    </div>
  );
}

function Panel({ title, subtitle, action, children }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div>
        {action && (typeof action === "string" ? <button className="text-button">{action}</button> : action)}
      </div>
      {children}
    </section>
  );
}

function StatCard({ label, value, sub, icon: Icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon"><Icon size={20}/></div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{sub}</small>
    </div>
  );
}

function ActivityRows() {
  const rows = [
    ["Teacher registration", "A new Hospitality teacher was registered.", "10 min ago"],
    ["Assignment submitted", "Sujan Gurung submitted Assignment 03.", "34 min ago"],
    ["Attendance updated", "Caregiver Batch C-07 attendance was updated.", "1 hr ago"],
    ["Fee payment", "NPR 18,000 payment received from A. Tamang.", "2 hrs ago"],
  ];

  return (
    <div className="activity-list">
      {rows.map(([title, text, time]) => (
        <div className="activity-row" key={title}>
          <div className="activity-dot"><Activity size={15}/></div>
          <div><strong>{title}</strong><p>{text}</p><small>{time}</small></div>
        </div>
      ))}
    </div>
  );
}

function ScheduleList() {
  const rows = [
    ["09:00–10:30", "C-07", "Caregiver", "Room 201"],
    ["11:00–12:30", "C-08", "First Aid", "Lab 1"],
    ["14:00–15:30", "B-04", "Barista Basic", "Hospitality Lab"],
  ];

  return (
    <div className="schedule-list">
      {rows.map(([time, batch, course, room]) => (
        <div className="schedule-row" key={`${time}-${batch}`}>
          <span className="schedule-time"><Clock3 size={15}/>{time}</span>
          <div><strong>{course}</strong><small>{batch} · {room}</small></div>
          <ChevronDown size={16}/>
        </div>
      ))}
    </div>
  );
}

function FormSection({ title, required, children }) {
  return <div className="form-section"><h3>{title} {required && <span className="required">Required</span>}</h3>{children}</div>;
}

function Field({ label, icon: Icon, children, type = "text", placeholder, required }) {
  return (
    <div className="field">
      <label>{label} {required && <span className="required">*</span>}</label>
      {children ? children : (
        <div className="field-control">
          {Icon && <Icon size={17}/>}
          {type === "textarea" ? <textarea placeholder={placeholder} /> : <input type={type} placeholder={placeholder} />}
        </div>
      )}
    </div>
  );
}

function ControlledField({ label, value, onChange, type = "text", placeholder, required }) {
  return (
    <div className="field">
      <label>{label} {required && <span className="required">*</span>}</label>
      <div className="field-control">
        <input value={value} onChange={(e) => onChange(e.target.value)} type={type} placeholder={placeholder} required={required} />
      </div>
    </div>
  );
}

function ChoiceCard({ selected, onClick, icon: Icon, title, text }) {
  return (
    <button type="button" className={`choice-card ${selected ? "selected" : ""}`} onClick={onClick}>
      <div className="choice-icon"><Icon size={21}/></div>
      <div><strong>{title}</strong><span>{text}</span></div>
      <span className={`radio ${selected ? "checked" : ""}`}>{selected && <Check size={12}/>}</span>
    </button>
  );
}

function UploadBox({ title, required, onFile }) {
  const [fileName, setFileName] = useState("");
  const inputId = `upload-${title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${Math.random().toString(36).slice(2)}`;

  const handle = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFile?.(file);
    }
  };

  return (
    <label className="upload-box" htmlFor={inputId}>
      <input id={inputId} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handle} />
      <div className="upload-icon"><Upload size={18}/></div>
      <strong>{title} {required && <span className="required">*</span>}</strong>
      <span>{fileName || "PDF, DOC, DOCX, JPG or PNG"}</span>
      {fileName ? <small className="uploaded">Selected</small> : <small>Click to upload</small>}
    </label>
  );
}

function Avatar({ name }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  return <div className="avatar">{initials}</div>;
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header"><h3>{title}</h3><button className="icon-button" onClick={onClose}><X size={19}/></button></div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

function statusClass(status) {
  const s = status.toLowerCase();
  if (s.includes("leave")) return "leave";
  if (s.includes("pending")) return "pending";
  if (s.includes("due")) return "due";
  if (s.includes("absent")) return "absent";
  return "active";
}

export default App;