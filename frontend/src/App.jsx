import { useEffect, useState } from 'react';

import {
  Activity,
  AlertTriangle,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  X
} from 'lucide-react';

import api from './api';

// =====================================================
// LABELS
// =====================================================

const labels = {
  admin: 'System Administrator',
  principal: 'School Principal',
  department_head: 'Department Head',
  registrar: 'Registrar',
  teacher: 'Teacher',
  student: 'Student',
  parent: 'Parent'
};

// =====================================================
// NAVIGATION
// =====================================================

const navs = {
  student: [
    ['dashboard', 'My Dashboard', LayoutDashboard],
    ['grades', 'My Grades', BookOpen],
    ['attendance', 'My Attendance', CalendarDays],
    ['health', 'My Health Records', Activity],
    ['documents', 'Document Requests', FileText],
    ['announcements', 'Announcements', MessageSquare],
    ['communications', 'Communications', MessageSquare]
  ],

  parent: [
    ['dashboard', 'Child Dashboard', LayoutDashboard],
    ['grades', 'Grades & Performance', BookOpen],
    ['attendance', 'Attendance Records', CalendarDays],
    ['health', 'Health Records', Activity],
    ['notifications', 'Notifications', Bell],
    ['announcements', 'Announcements', MessageSquare],
    ['communications', 'Communications', MessageSquare]
  ],

  admin: [
    ['dashboard', 'Dashboard Overview', LayoutDashboard],
    ['users', 'User Management', Users],
    ['students', 'Students', GraduationCap],
    ['parents', 'Parents', Users],
    ['grades', 'Academic Records', BookOpen],
    ['attendance', 'Attendance', CalendarDays],
    ['tasks', 'Tasks', ClipboardList],
    ['documents', 'Documents', FileText],
    ['health', 'Health Records', Activity],
    ['alerts', 'Risk Alerts', AlertTriangle],
    ['communications', 'Communications', MessageSquare],
    ['areas', 'Academic Areas', BookOpen],
    ['logs', 'System Logs', ClipboardList],
    ['security', 'Security Settings', ShieldCheck]
  ],

  teacher: [
    ['dashboard', 'Dashboard', LayoutDashboard],
    ['students', 'My Students', GraduationCap],
    ['grades', 'Grades', BookOpen],
    ['attendance', 'Attendance', CalendarDays],
    ['tasks', 'Tasks', ClipboardList],
    ['health', 'Health Records', Activity],
    ['alerts', 'Risk Alerts', AlertTriangle],
    ['announcements', 'Announcements', MessageSquare],
    ['communications', 'Communications', MessageSquare]
  ],

  registrar: [
    ['dashboard', 'Registrar Dashboard', LayoutDashboard],
    ['students', 'Student Records', GraduationCap],
    ['documents', 'Documents', FileText],
    ['grades', 'Academic Records', BookOpen],
    ['logs', 'System Logs', ClipboardList],
    ['communications', 'Communications', MessageSquare]
  ],

  principal: [
    ['dashboard', 'Dashboard Overview', LayoutDashboard],
    ['students', 'Students', GraduationCap],
    ['grades', 'Academic Records', BookOpen],
    ['documents', 'Documents', FileText],
    ['alerts', 'Risk Alerts', AlertTriangle],
    ['communications', 'Communications', MessageSquare]
  ],

  department_head: [
    ['dashboard', 'Dashboard Overview', LayoutDashboard],
    ['students', 'Students', GraduationCap],
    ['grades', 'Academic Records', BookOpen],
    ['tasks', 'Tasks', ClipboardList],
    ['alerts', 'Risk Alerts', AlertTriangle],
    ['communications', 'Communications', MessageSquare]
  ]
};

// =====================================================
// HELPERS
// =====================================================

const arr = (x) =>
  Array.isArray(x)
    ? x
    : Array.isArray(x?.data)
      ? x.data
      : [];

const num = (x, fallback = 0) => {
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
};

const avg = (items = []) => {
  const grades = items
    .map((x) => num(x?.grade ?? x?.average, NaN))
    .filter(Number.isFinite);

  return grades.length
    ? grades.reduce((sum, value) => sum + value, 0) / grades.length
    : 0;
};

const init = (name) =>
  (name || 'User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0])
    .join('')
    .toUpperCase();

const date = (value) => {
  if (!value) return '—';

  const d = new Date(value);

  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
};

const tone = (status) => {
  const s = String(status || '').toLowerCase();

  if (/present|approved|good|passed|active|enrolled|enabled|operational|connected/.test(s)) {
    return 'success';
  }

  if (/absent|high|open|danger|failed|error/.test(s)) {
    return 'danger';
  }

  if (/late|pending|medium|processing|monitor|needs support/.test(s)) {
    return 'warning';
  }

  return 'info';
};

// =====================================================
// APP
// =====================================================

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  });

  const [page, setPage] = useState('dashboard');
  const [mobile, setMobile] = useState(false);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setPage('dashboard');
    setMobile(false);
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const role = user.role || 'student';
  const nav = navs[role] || navs.student;

  return (
    <div className="shell">
      <Sidebar
        user={user}
        role={role}
        nav={nav}
        page={page}
        setPage={setPage}
        logout={logout}
        mobile={mobile}
        setMobile={setMobile}
      />

      <main className="main">
        <header className="mobile">
          <button type="button" onClick={() => setMobile(true)}>
            <Menu size={20} />
          </button>

          <b>EduTrack</b>

          <Avatar name={user.name} />
        </header>

        <header className="top">
          <span>
            EduTrack / {labels[role] || role}
          </span>

          <div>
            Last updated: {new Date().toLocaleDateString()}

            <Avatar name={user.name} />
          </div>
        </header>

        {page === 'dashboard' && <Dashboard role={role} user={user} />}
        {page === 'grades' && <Grades role={role} />}
        {page === 'attendance' && <Attendance />}
        {page === 'documents' && <Documents />}
        {page === 'announcements' && <Announcements />}
        {page === 'communications' && (
          <Communications role={role} user={user} />
        )}
        {page === 'notifications' && <Notifications />}
        {page === 'users' && <UsersPage />}
        {page === 'areas' && <Areas />}
        {page === 'logs' && <Logs />}
        {page === 'security' && <Security />}
        {page === 'students' && <Students />}
        {page === 'tasks' && <Tasks />}
        {page === 'alerts' && <Alerts />}
        {page === 'health' && <HealthPage />}

        {mobile && (
          <div
            className="backdrop"
            onClick={() => setMobile(false)}
          />
        )}
      </main>
    </div>
  );
}

// =====================================================
// LOGIN
// =====================================================

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/login', {
        email: email.trim(),
        password
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      onLogin(response.data.user);

      setEmail('');
      setPassword('');
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        'Cannot connect to backend.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login">
      <section className="visual">
        <div className="brand">
          <GraduationCap />

          <div>
            <b>EduTrack</b>
            <small>Academic Management System</small>
          </div>
        </div>

        <div className="copy">
          <h1>
            Better Learning.
            <br />
            Brighter Future.
          </h1>

          <p>
            Academic management for students, parents,
            teachers and school administrators.
          </p>
        </div>

        <div className="books">📚　🎓　📖</div>
      </section>

      <section className="loginbox">
        <form onSubmit={submit} className="login-card">
          <small className="eyebrow">EDUTRACK PORTAL</small>

          <h1>Welcome Back!</h1>

          <p>Sign in to your account to continue.</p>

          <label>Email Address</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>

          {message && <div className="error">{message}</div>}

          <small className="hint">
            Use an account already registered in your EduTrack database.
          </small>
        </form>
      </section>
    </div>
  );
}

// =====================================================
// SIDEBAR
// =====================================================

function Sidebar({
  user,
  role,
  nav,
  page,
  setPage,
  logout,
  mobile,
  setMobile
}) {
  return (
    <aside className={`side ${mobile ? 'open' : ''}`}>
      <div className="sidebrand">
        <div className="brand">
          <GraduationCap />

          <div>
            <b>EduTrack</b>

            <small>
              Academic Management
              <br />
              System
            </small>
          </div>
        </div>
      </div>

      <nav>
        {nav.map(([key, label, Icon]) => (
          <button
            type="button"
            className={page === key ? 'active' : ''}
            key={key}
            onClick={() => {
              setPage(key);
              setMobile(false);
            }}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>

      <div className="sidebottom">
        <button type="button" disabled title="Demo feature">
          <RefreshCw size={18} />
          Switch Role (Demo)
        </button>

        <button type="button" onClick={logout}>
          <LogOut size={18} />
          Logout
        </button>

        <div className="profile">
          <Avatar name={user.name} />

          <div>
            <b>{user.name}</b>
            <small>{labels[role] || role}</small>
          </div>
        </div>
      </div>
    </aside>
  );
}

// =====================================================
// BASIC COMPONENTS
// =====================================================

function Avatar({ name, large = false }) {
  return (
    <div className={`avatar ${large ? 'large' : ''}`}>
      {init(name)}
    </div>
  );
}

function Header({ title, sub, action }) {
  return (
    <div className="ph">
      <div>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>

      {action}
    </div>
  );
}

function Stat({ icon: Icon, label, value, kind = 'green' }) {
  return (
    <div className="stat">
      <div className={`staticon ${kind}`}>
        <Icon size={19} />
      </div>

      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <section className="card">
      {title && <h2>{title}</h2>}
      {children}
    </section>
  );
}

function Badge({ children }) {
  return (
    <span className={`badge ${tone(children)}`}>
      {children}
    </span>
  );
}

function Empty({ children = 'No records found.' }) {
  return <div className="empty">{children}</div>;
}

// =====================================================
// DASHBOARD ROUTER
// =====================================================

function Dashboard({ role, user }) {
  if (role === 'student') return <Student user={user} />;
  if (role === 'parent') return <Parent />;
  if (role === 'admin') return <Admin />;
  if (role === 'teacher') return <Teacher />;
  if (role === 'registrar') return <Registrar />;

  return (
    <div className="content">
      <Header
        title={`${labels[role] || role} Dashboard`}
        sub="EduTrack academic management overview."
      />

      <Empty>
        Dashboard ready. Use the navigation menu.
      </Empty>
    </div>
  );
}

// =====================================================
// STUDENT DASHBOARD
// =====================================================

function Student({ user }) {
  const [data, setData] = useState({
    students: [],
    grades: [],
    attendance: [],
    risks: [],
    communications: []
  });

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      api.get('/students'),
      api.get('/academic-records'),
      api.get('/attendance'),
      api.get('/risk-alerts'),
      api.get('/communications')
    ]).then((results) => {
      if (!active) return;

      const values = results.map((result) =>
        result.status === 'fulfilled'
          ? arr(result.value.data)
          : []
      );

      setData({
        students: values[0],
        grades: values[1],
        attendance: values[2],
        risks: values[3],
        communications: values[4]
      });
    });

    return () => {
      active = false;
    };
  }, []);

  const present = data.attendance.filter(
    (item) =>
      String(item.status || '').toLowerCase() === 'present'
  ).length;

  const attendanceRate = data.attendance.length
    ? ((present / data.attendance.length) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="content">
      <Header
        title="Student Dashboard"
        sub={
          `${user.name}` +
          (data.students[0]?.grade_level
            ? ` · Grade ${data.students[0].grade_level}`
            : '') +
          (data.students[0]?.section
            ? ` - ${data.students[0].section}`
            : '')
        }
      />

      <div className="stats four">
        <Stat
          icon={Activity}
          label="Overall Average"
          value={`${avg(data.grades).toFixed(0)}%`}
        />

        <Stat
          icon={BookOpen}
          label="Subjects"
          value={
            new Set(
              data.grades.map((item) => item.subject)
            ).size
          }
          kind="blue"
        />

        <Stat
          icon={CalendarDays}
          label="Attendance"
          value={`${attendanceRate}%`}
        />

        <Stat
          icon={ShieldCheck}
          label="Risk Status"
          value={data.risks.length ? 'Monitor' : 'Good'}
          kind={data.risks.length ? 'yellow' : 'green'}
        />
      </div>

      <div className="cols">
        <Card title="Grade Summary">
          {data.grades.length ? (
            data.grades.slice(0, 6).map((item) => (
              <div
                className="row"
                key={item.record_id || item.subject}
              >
                <div>
                  <b>{item.subject || 'Subject'}</b>

                  <small>
                    {item.school_year || 'Academic record'}
                  </small>
                </div>

                <b>
                  {item.grade ?? item.average ?? '—'}
                </b>

                <Badge>
                  {num(item.grade ?? item.average) >= 75
                    ? 'Passed'
                    : 'Needs Support'}
                </Badge>
              </div>
            ))
          ) : (
            <Empty />
          )}
        </Card>

        <Card title="School Announcements">
          {data.communications.length ? (
            data.communications.slice(0, 4).map((item) => (
              <div
                className="announce"
                key={item.communication_id || item.id}
              >
                <div>
                  <b>
                    {item.subject || 'School Announcement'}
                  </b>

                  <p>
                    {item.message ||
                      item.description ||
                      'No message.'}
                  </p>

                  <small>{date(item.created_at)}</small>
                </div>

                <Badge>{item.status || 'New'}</Badge>
              </div>
            ))
          ) : (
            <Empty>No announcements yet.</Empty>
          )}
        </Card>
      </div>

      <Card title="Risk Alerts">
        {data.risks.length ? (
          data.risks.map((item) => (
            <div className="alert" key={item.alert_id}>
              <AlertTriangle size={18} />

              <div>
                <b>{item.alert_type}</b>
                <small>{item.description}</small>
              </div>

              <Badge>
                {item.severity || item.status || 'Alert'}
              </Badge>
            </div>
          ))
        ) : (
          <Empty>No open alerts. Good standing.</Empty>
        )}
      </Card>
    </div>
  );
}

// =====================================================
// PARENT DASHBOARD
// =====================================================

function Parent() {
  return (
    <DataDashboard
      title="Parent Dashboard"
      sub="Monitoring: your child"
    />
  );
}

// =====================================================
// DATA DASHBOARD
// =====================================================

function DataDashboard({ title, sub }) {
  const [data, setData] = useState({
    students: [],
    grades: [],
    attendance: [],
    risks: []
  });

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      api.get('/students'),
      api.get('/academic-performance'),
      api.get('/attendance'),
      api.get('/risk-alerts')
    ]).then((results) => {
      if (!active) return;

      const values = results.map((result) =>
        result.status === 'fulfilled'
          ? arr(result.value.data)
          : []
      );

      setData({
        students: values[0],
        grades: values[1],
        attendance: values[2],
        risks: values[3]
      });
    });

    return () => {
      active = false;
    };
  }, []);

  const present = data.attendance.filter(
    (item) =>
      String(item.status || '').toLowerCase() === 'present'
  ).length;

  const rate = data.attendance.length
    ? ((present / data.attendance.length) * 100).toFixed(1)
    : '0.0';

  const child = data.students[0];

  return (
    <div className="content">
      <Header title={title} sub={sub} />

      <div className="stats four">
        <Stat
          icon={Activity}
          label="Overall Average"
          value={`${avg(data.grades).toFixed(0)}%`}
        />

        <Stat
          icon={CalendarDays}
          label="Attendance"
          value={`${rate}%`}
        />

        <Stat
          icon={BookOpen}
          label="Subjects"
          value={
            new Set(
              data.grades.map((item) => item.subject)
            ).size
          }
          kind="blue"
        />

        <Stat
          icon={Bell}
          label="Unread Alerts"
          value={data.risks.length}
          kind="red"
        />
      </div>

      <div className="cols">
        <Card title="Child Overview">
          <div className="overview">
            <Avatar
              name={child?.name || 'Student'}
              large
            />

            <div>
              <h3>{child?.name || 'Student'}</h3>
              <p>Student record</p>
            </div>
          </div>

          <div className="details">
            <span>
              Overall Average
              <b>{avg(data.grades).toFixed(0)}%</b>
            </span>

            <span>
              Attendance Rate
              <b>{rate}%</b>
            </span>

            <span>
              Risk Status
              <Badge>
                {data.risks.length ? 'Monitor' : 'Good'}
              </Badge>
            </span>
          </div>
        </Card>

        <Card title="Recent Notifications">
          {data.risks.length ? (
            data.risks.slice(0, 5).map((item) => (
              <div className="alert" key={item.alert_id}>
                <AlertTriangle size={18} />

                <div>
                  <b>{item.alert_type}</b>
                  <small>{item.description}</small>
                </div>

                <small>{date(item.created_at)}</small>
              </div>
            ))
          ) : (
            <Empty />
          )}
        </Card>
      </div>

      <Card title="Grade Performance">
        <Table
          cols={['Subject', 'Grade', 'School Year', 'Status']}
          rows={data.grades.map((item) => {
            const grade = item.grade ?? item.average;

            return [
              item.subject || '—',
              grade ?? '—',
              item.school_year || '—',
              num(grade, 0) >= 75
                ? 'Passed'
                : 'Needs Support'
            ];
          })}
        />
      </Card>
    </div>
  );
}

// =====================================================
// ADMIN DASHBOARD
// =====================================================

function Admin() {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      api.get('/users'),
      api.get('/audit-logs')
    ]).then(([usersResult, logsResult]) => {
      if (!active) return;

      if (usersResult.status === 'fulfilled') {
        setUsers(arr(usersResult.value.data));
      }

      if (logsResult.status === 'fulfilled') {
        setLogs(arr(logsResult.value.data));
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="content">
      <Header
        title="System Administrator Dashboard"
        sub="Welcome back. Here's the system overview."
      />

      <div className="stats four">
        <Stat icon={Users} label="Total Users" value={users.length} />

        <Stat
          icon={Activity}
          label="Active Users"
          value={users.length}
          kind="yellow"
        />

        <Stat
          icon={GraduationCap}
          label="Total Students"
          value={
            users.filter(
              (item) => item.role === 'student'
            ).length
          }
          kind="blue"
        />

        <Stat
          icon={AlertTriangle}
          label="At-Risk Students"
          value="—"
          kind="red"
        />
      </div>

      <div className="cols">
        <Card title="Recent User Activity">
          {logs.length ? (
            logs.slice(0, 7).map((item) => (
              <div className="activity" key={item.log_id}>
                <i />

                <div>
                  <b>User #{item.user_id}</b>

                  <small>
                    {item.description ||
                      `${item.action} ${item.module}`}
                  </small>

                  <small>{date(item.created_at)}</small>
                </div>
              </div>
            ))
          ) : (
            <Empty />
          )}
        </Card>

        <Card title="System Health">
          <Health label="Database Status" value="Operational" n={100} />
          <Health label="API Response" value="Connected" n={88} />
          <Health
            label="Storage Usage"
            value="Managed by server"
            n={35}
          />
          <Health
            label="Active Sessions"
            value={`${users.length} users`}
            n={Math.min(users.length * 5, 100)}
          />
        </Card>
      </div>
    </div>
  );
}

// =====================================================
// TEACHER / REGISTRAR DASHBOARDS
// =====================================================

function Teacher() {
  return (
    <ListDashboard
      title="Teacher Dashboard"
      endpoints={[
        '/students',
        '/academic-records',
        '/attendance'
      ]}
      stats={[
        'Students',
        'Academic Records',
        'Attendance Records'
      ]}
    />
  );
}

function Registrar() {
  return (
    <ListDashboard
      title="Registrar Dashboard"
      endpoints={['/students', '/documents']}
      stats={['Students', 'Documents']}
    />
  );
}

function ListDashboard({ title, endpoints, stats }) {
  const [data, setData] = useState([]);

  // FIX: the original [endpoints] dependency caused repeated
  // requests because the array is recreated on every render.
  const endpointKey = endpoints.join('|');

  useEffect(() => {
    let active = true;

    Promise.allSettled(
      endpoints.map((endpoint) => api.get(endpoint))
    ).then((results) => {
      if (!active) return;

      setData(
        results.map((result) =>
          result.status === 'fulfilled'
            ? arr(result.value.data)
            : []
        )
      );
    });

    return () => {
      active = false;
    };
  }, [endpointKey]);

  return (
    <div className="content">
      <Header
        title={title}
        sub="EduTrack management overview."
      />

      <div className="stats three">
        {stats.map((label, index) => (
          <Stat
            key={label}
            icon={index === 0 ? Users : BookOpen}
            label={label}
            value={data[index]?.length || 0}
          />
        ))}
      </div>

      <Card title="Recent Records">
        <Table
          cols={['Name / ID', 'Grade', 'Section', 'Status']}
          rows={(data[0] || []).slice(0, 10).map((item) => [
            item.name || `#${item.student_id ?? '—'}`,
            item.grade_level || '—',
            item.section || '—',
            item.enrollment_status || '—'
          ])}
        />
      </Card>
    </div>
  );
}

// =====================================================
// GRADES
// =====================================================

function Grades({ role }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    let active = true;

    const endpoint =
      role === 'student' || role === 'parent'
        ? '/academic-performance'
        : '/academic-records';

    api
      .get(endpoint)
      .then((response) => {
        if (active) {
          setData(arr(response.data));
        }
      })
      .catch(() => {
        if (active) setData([]);
      });

    return () => {
      active = false;
    };
  }, [role]);

  return (
    <div className="content">
      <Header
        title={
          role === 'parent'
            ? 'Grades & Performance'
            : 'My Grades'
        }
        sub="Academic performance and subject records."
      />

      <div className="stats three">
        <Stat
          icon={Activity}
          label="Overall Average"
          value={`${avg(data).toFixed(0)}%`}
        />

        <Stat
          icon={BookOpen}
          label="Subjects"
          value={
            new Set(
              data.map((item) => item.subject)
            ).size
          }
          kind="blue"
        />

        <Stat
          icon={CheckCircle2}
          label="Passing Records"
          value={
            data.filter(
              (item) =>
                num(item.grade ?? item.average, 0) >= 75
            ).length
          }
        />
      </div>

      <Card title="Academic Records">
        <Table
          cols={[
            'Subject',
            'Grade',
            'School Year',
            'Semester',
            'Remarks'
          ]}
          rows={data.map((item) => {
            const grade = item.grade ?? item.average;

            return [
              item.subject || '—',
              grade ?? '—',
              item.school_year || '—',
              item.semester || '—',
              num(grade, 0) >= 75
                ? 'Passed'
                : 'Needs Support'
            ];
          })}
        />
      </Card>
    </div>
  );
}

// =====================================================
// ATTENDANCE
// =====================================================

function Attendance() {
  const [data, setData] = useState([]);

  useEffect(() => {
    let active = true;

    api
      .get('/attendance')
      .then((response) => {
        if (active) setData(arr(response.data));
      })
      .catch(() => {
        if (active) setData([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const present = data.filter(
    (item) =>
      String(item.status || '').toLowerCase() === 'present'
  ).length;

  const absent = data.filter(
    (item) =>
      String(item.status || '').toLowerCase() === 'absent'
  ).length;

  const late = data.filter(
    (item) =>
      String(item.status || '').toLowerCase() === 'late'
  ).length;

  const rate = data.length
    ? ((present / data.length) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="content">
      <Header
        title="My Attendance"
        sub="Attendance monitoring and records."
      />

      <div className="stats four">
        <Stat icon={CheckCircle2} label="Present" value={present} />

        <Stat
          icon={X}
          label="Absent"
          value={absent}
          kind="red"
        />

        <Stat
          icon={CalendarDays}
          label="Late"
          value={late}
          kind="yellow"
        />

        <Stat
          icon={Activity}
          label="Attendance Rate"
          value={`${rate}%`}
        />
      </div>

      <Card title="Attendance Records">
        <Table
          cols={['Date', 'Status', 'Remarks']}
          rows={data.map((item) => [
            date(item.attendance_date),
            item.status || '—',
            item.remarks || '—'
          ])}
        />
      </Card>
    </div>
  );
}

// =====================================================
// DOCUMENTS
// =====================================================

function Documents() {
  const [data, setData] = useState([]);

  useEffect(() => {
    let active = true;

    api
      .get('/documents')
      .then((response) => {
        if (active) setData(arr(response.data));
      })
      .catch(() => {
        if (active) setData([]);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="content">
      <Header
        title="Document Requests"
        sub="Request and track official school documents."
        action={
          <button
            type="button"
            className="primary small"
            onClick={() =>
              alert('New document request form is ready for the backend.')
            }
          >
            + New Request
          </button>
        }
      />

      <Card title="My Requests">
        <Table
          cols={[
            'Document Type',
            'Status',
            'Requested',
            'Action'
          ]}
          rows={data.map((item) => [
            item.document_type || item.type || 'Document',
            item.status || '—',
            date(item.created_at || item.requested_at),
            'View'
          ])}
        />
      </Card>
    </div>
  );
}

// =====================================================
// ANNOUNCEMENTS
// =====================================================

function Announcements() {
  const [data, setData] = useState([]);

  useEffect(() => {
    let active = true;

    api
      .get('/communications')
      .then((response) => {
        if (active) setData(arr(response.data));
      })
      .catch(() => {
        if (active) setData([]);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="content">
      <Header
        title="Announcements"
        sub="School announcements and communication."
      />

      <div className="cards3">
        {data.map((item) => (
          <div
            className="announcement-card"
            key={item.communication_id || item.id}
          >
            <Badge>{item.status || 'New'}</Badge>

            <h3>
              {item.subject || 'School Announcement'}
            </h3>

            <p>
              {item.message || item.description || 'No message.'}
            </p>

            <small>{date(item.created_at)}</small>
          </div>
        ))}
      </div>

      {!data.length && <Empty />}
    </div>
  );
}

// =====================================================
// COMMUNICATIONS
// =====================================================

function Communications({ role }) {
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadCommunications = async () => {
    setLoading(true);

    try {
      const response = await api.get('/communications');
      setCommunications(arr(response.data));
    } catch (error) {
      console.error('Load communications error:', error);
      setCommunications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommunications();
  }, []);

  return (
    <div className="content">
      <Header
        title="Communications"
        sub={`Communication center for ${labels[role] || role}.`}
        action={
          <button
            type="button"
            className="small"
            onClick={loadCommunications}
            disabled={loading}
          >
            <RefreshCw size={15} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        }
      />

      <Card title="Communication Records">
        {loading ? (
          <Empty>Loading communications...</Empty>
        ) : communications.length ? (
          communications.map((item) => (
            <div
              className="announce"
              key={item.communication_id || item.id}
            >
              <div>
                <b>{item.subject || 'Communication'}</b>

                <p>
                  {item.message ||
                    item.description ||
                    'No message.'}
                </p>

                <small>
                  {item.sender_name
                    ? `From: ${item.sender_name} `
                    : ''}
                  {date(item.created_at)}
                </small>
              </div>

              <Badge>{item.status || 'New'}</Badge>
            </div>
          ))
        ) : (
          <Empty>No communications yet.</Empty>
        )}
      </Card>

      <Card title="Send Communication">
        <textarea
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{
            width: '100%',
            minHeight: '100px',
            padding: '12px',
            boxSizing: 'border-box',
            marginBottom: '10px'
          }}
        />

        <button
          type="button"
          className="primary small"
          onClick={() => {
            if (!message.trim()) {
              alert('Please enter a message.');
              return;
            }

            alert(
              'Communication form is ready for your backend send endpoint.'
            );
          }}
        >
          Send Communication
        </button>
      </Card>
    </div>
  );
}

// =====================================================
// NOTIFICATIONS
// =====================================================

function Notifications() {
  const [data, setData] = useState([]);

  useEffect(() => {
    let active = true;

    api
      .get('/risk-alerts')
      .then((response) => {
        if (active) setData(arr(response.data));
      })
      .catch(() => {
        if (active) setData([]);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="content">
      <Header
        title="Notifications & Alerts"
        sub="Stay updated on the student's academic journey."
      />

      <Card>
        {data.length ? (
          data.map((item) => (
            <div className="alert" key={item.alert_id}>
              <div className="notif">
                <AlertTriangle size={18} />
              </div>

              <div>
                <b>{item.alert_type}</b>
                <small>{item.description}</small>
              </div>

              <Badge>
                {item.severity || item.status || 'Alert'}
              </Badge>

              <small>{date(item.created_at)}</small>
            </div>
          ))
        ) : (
          <Empty />
        )}
      </Card>
    </div>
  );
}

// =====================================================
// USERS
// =====================================================

function UsersPage() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;

    api
      .get('/users')
      .then((response) => {
        if (active) setData(arr(response.data));
      })
      .catch(() => {
        if (active) setData([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = data.filter((item) => {
    const q = search.trim().toLowerCase();

    if (!q) return true;

    return (
      String(item.name || '').toLowerCase().includes(q) ||
      String(item.email || '').toLowerCase().includes(q) ||
      String(item.role || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="content">
      <Header
        title="User Management"
        sub="Manage all system users, roles and permissions."
        action={
          <button
            type="button"
            className="primary small"
            onClick={() =>
              alert('Add User form is ready for the backend.')
            }
          >
            + Add User
          </button>
        }
      />

      <div className="search">
        <Search size={17} />

        <input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <Table
          cols={[
            'Name',
            'Email',
            'Role',
            'Status',
            'Actions'
          ]}
          rows={filtered.map((item) => [
            item.name || '—',
            item.email || '—',
            item.role || '—',
            'Active',
            'Edit · Delete'
          ])}
        />
      </Card>
    </div>
  );
}

// =====================================================
// ACADEMIC AREAS
// =====================================================

function Areas() {
  const [areas, setAreas] = useState([]);
  const [showAddArea, setShowAddArea] = useState(false);
  const [newArea, setNewArea] = useState('');
  const [loadingAreas, setLoadingAreas] = useState(false);

  const loadAreas = async () => {
    setLoadingAreas(true);

    try {
      const response = await api.get('/academic-areas');

      setAreas(
        arr(response.data).map((area) => ({
          area_id: area.area_id,
          area_name: area.area_name,
          description: area.description || '',
          created_at: area.created_at,
          teachers_assigned: num(area.teachers_assigned, 0)
        }))
      );
    } catch (error) {
      console.error('Load academic areas error:', error);

      alert(
        error.response?.data?.message ||
        'Failed to load academic areas.'
      );
    } finally {
      setLoadingAreas(false);
    }
  };

  useEffect(() => {
    loadAreas();
  }, []);

  const handleAddArea = async () => {
    const areaName = newArea.trim();

    if (!areaName) {
      alert('Please enter an academic area.');
      return;
    }

    try {
      const response = await api.post('/academic-areas', {
        area_name: areaName,
        description: ''
      });

      alert(
        response.data?.message ||
        'Academic area created successfully.'
      );

      setNewArea('');
      setShowAddArea(false);

      await loadAreas();
    } catch (error) {
      console.error('Add academic area error:', error);

      alert(
        error.response?.data?.message ||
        'Failed to create academic area.'
      );
    }
  };

  const handleUpdateArea = async (areaId, currentName) => {
    const newName = window.prompt(
      'Enter new academic area name:',
      currentName
    );

    if (newName === null) return;

    const trimmedName = newName.trim();

    if (!trimmedName) {
      alert('Please enter an academic area name.');
      return;
    }

    try {
      await api.put(`/academic-areas/${areaId}`, {
        area_name: trimmedName,
        description: ''
      });

      alert('Academic area updated successfully.');

      await loadAreas();
    } catch (error) {
      console.error('Update academic area error:', error);

      alert(
        error.response?.data?.message ||
        'Failed to update academic area.'
      );
    }
  };

  const handleDeleteArea = async (areaId, areaName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete academic area #${areaId} (${areaName})?`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/academic-areas/${areaId}`);

      alert('Academic area deleted successfully.');

      await loadAreas();
    } catch (error) {
      console.error('Delete academic area error:', error);

      alert(
        error.response?.data?.message ||
        'Failed to delete academic area.'
      );
    }
  };

  return (
    <div className="content">
      <Header
        title="Academic Areas"
        sub="Configure academic areas and assign department heads."
        action={
          <button
            type="button"
            className="small"
            onClick={loadAreas}
            disabled={loadingAreas}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={15} />
            {loadingAreas ? 'Refreshing...' : 'Refresh'}
          </button>
        }
      />

      {showAddArea && (
        <div
          className="card"
          style={{
            marginBottom: '20px',
            padding: '20px'
          }}
        >
          <h3 style={{ marginTop: 0 }}>
            Add New Academic Area
          </h3>

          <input
            type="text"
            placeholder="Enter academic area"
            value={newArea}
            onChange={(e) => setNewArea(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddArea();
            }}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              boxSizing: 'border-box'
            }}
          />

          <div
            style={{
              display: 'flex',
              gap: '8px'
            }}
          >
            <button
              type="button"
              className="primary small"
              onClick={handleAddArea}
            >
              Add Area
            </button>

            <button
              type="button"
              className="small"
              onClick={() => {
                setNewArea('');
                setShowAddArea(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="areas">
        {loadingAreas ? (
          <div
            className="card"
            style={{
              padding: '20px',
              width: '100%'
            }}
          >
            Loading academic areas...
          </div>
        ) : areas.length ? (
          areas.map((area) => (
            <div className="area" key={area.area_id}>
              <div>📖</div>

              <h3>{area.area_name}</h3>

              <p>
                {area.teachers_assigned} Teachers Assigned
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  justifyContent: 'center',
                  marginTop: '10px',
                  flexWrap: 'wrap'
                }}
              >
                <button
                  type="button"
                  className="small"
                  onClick={() =>
                    handleUpdateArea(
                      area.area_id,
                      area.area_name
                    )
                  }
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="small"
                  onClick={() =>
                    handleDeleteArea(
                      area.area_id,
                      area.area_name
                    )
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div
            className="card"
            style={{
              padding: '20px',
              width: '100%'
            }}
          >
            No academic areas found.
          </div>
        )}

        <div
          className="area add"
          onClick={() => {
            setShowAddArea(true);
            setNewArea('');
          }}
          style={{ cursor: 'pointer' }}
        >
          <strong>+</strong>
          <p>Add New Area</p>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// LOGS
// =====================================================

function Logs() {
  const [data, setData] = useState([]);

  useEffect(() => {
    let active = true;

    api
      .get('/audit-logs')
      .then((response) => {
        if (active) setData(arr(response.data));
      })
      .catch(() => {
        if (active) setData([]);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="content">
      <Header
        title="System Logs"
        sub="Audit trail of important system actions."
      />

      <Card>
        <Table
          cols={[
            'Log ID',
            'User',
            'Action',
            'Module',
            'Record',
            'Date'
          ]}
          rows={data.map((item) => [
            item.log_id,
            `User #${item.user_id ?? '—'}`,
            item.action || '—',
            item.module || '—',
            item.record_id ?? '—',
            date(item.created_at)
          ])}
        />
      </Card>
    </div>
  );
}

// =====================================================
// SECURITY
// =====================================================

function Security() {
  return (
    <div className="content">
      <Header
        title="Security Settings"
        sub="Authentication and access-control overview."
      />

      <div className="security">
        {[
          [
            'JWT Authentication',
            'Protected API routes use Bearer token authentication.'
          ],
          [
            'Role-Based Access',
            'Permissions are enforced by the Node.js backend.'
          ],
          [
            'Audit Logging',
            'Important operations are recorded in audit logs.'
          ]
        ].map(([title, description]) => (
          <div className="security-card" key={title}>
            <ShieldCheck />

            <h3>{title}</h3>
            <p>{description}</p>

            <Badge>Enabled</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

// =====================================================
// STUDENTS
// =====================================================

function Students() {
  const [data, setData] = useState([]);

  useEffect(() => {
    let active = true;

    api
      .get('/students')
      .then((response) => {
        if (active) setData(arr(response.data));
      })
      .catch(() => {
        if (active) setData([]);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="content">
      <Header
        title="Student Records"
        sub="View student information available to your role."
      />

      <Card>
        <Table
          cols={[
            'Student',
            'Grade',
            'Section',
            'Enrollment Status'
          ]}
          rows={data.map((item) => [
            item.name ||
              `Student #${item.student_id ?? '—'}`,
            item.grade_level || '—',
            item.section || '—',
            item.enrollment_status || '—'
          ])}
        />
      </Card>
    </div>
  );
}

// =====================================================
// TASKS
// =====================================================

function Tasks() {
  const [data, setData] = useState([]);

  useEffect(() => {
    let active = true;

    api
      .get('/tasks')
      .then((response) => {
        if (active) setData(arr(response.data));
      })
      .catch(() => {
        if (active) setData([]);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="content">
      <Header
        title="Tasks"
        sub="Academic and student-related tasks."
      />

      <Card>
        <Table
          cols={['Task', 'Student', 'Status', 'Due Date']}
          rows={data.map((item) => [
            item.title || item.task || 'Task',
            item.student_id ?? '—',
            item.status || '—',
            date(item.due_date)
          ])}
        />
      </Card>
    </div>
  );
}

// =====================================================
// ALERTS
// =====================================================

function Alerts() {
  const [data, setData] = useState([]);

  useEffect(() => {
    let active = true;

    api
      .get('/risk-alerts')
      .then((response) => {
        if (active) setData(arr(response.data));
      })
      .catch(() => {
        if (active) setData([]);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="content">
      <Header
        title="Risk Alerts"
        sub="Academic and attendance risk monitoring."
      />

      <Card>
        <Table
          cols={[
            'Student',
            'Alert',
            'Severity',
            'Status',
            'Created'
          ]}
          rows={data.map((item) => [
            item.student_id ?? '—',
            item.alert_type || '—',
            item.severity || '—',
            item.status || '—',
            date(item.created_at)
          ])}
        />
      </Card>
    </div>
  );
}

// =====================================================
// HEALTH
// =====================================================

function HealthPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    let active = true;

    api
      .get('/health')
      .then((response) => {
        if (active) setData(arr(response.data));
      })
      .catch(() => {
        if (active) setData([]);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="content">
      <Header
        title="Health Records"
        sub="Student health information."
      />

      <Card>
        <Table
          cols={[
            'Student',
            'Condition',
            'Status',
            'Date'
          ]}
          rows={data.map((item) => [
            item.student_id ?? '—',
            item.condition ||
              item.health_condition ||
              '—',
            item.status || '—',
            date(item.created_at || item.date)
          ])}
        />
      </Card>
    </div>
  );
}

// =====================================================
// TABLE
// =====================================================

function Table({ cols, rows }) {
  if (!rows.length) {
    return <Empty />;
  }

  return (
    <div className="tablewrap">
      <table>
        <thead>
          <tr>
            {cols.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((value, columnIndex) => {
                const text = String(value ?? '—');

                const shouldBadge =
                  columnIndex === row.length - 1 &&
                  [
                    'Passed',
                    'Needs Support',
                    'Active',
                    'Pending',
                    'Approved',
                    'open',
                    'medium',
                    'high',
                    'Good',
                    'Monitor',
                    'Enabled',
                    'Operational',
                    'Connected'
                  ].includes(text);

                return (
                  <td key={columnIndex}>
                    {shouldBadge ? (
                      <Badge>{text}</Badge>
                    ) : (
                      value ?? '—'
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// =====================================================
// HEALTH STATUS COMPONENT
// =====================================================

function Health({ label, value, n }) {
  return (
    <div className="health">
      <div>
        <span>{label}</span>
        <b>{value}</b>
      </div>

      <i>
        <em style={{ width: `${num(n, 0)}%` }} />
      </i>
    </div>
  );
}
