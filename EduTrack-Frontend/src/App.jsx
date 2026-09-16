import React, { useEffect, useState } from 'react';
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

/* =========================================================
   LABELS
   ========================================================= */

const labels = {
  admin: 'System Administrator',
  principal: 'School Principal',
  department_head: 'Department Head',
  registrar: 'Registrar',
  teacher: 'Teacher',
  student: 'Student',
  parent: 'Parent'
};

/* =========================================================
   NAVIGATION
   ========================================================= */

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
    ['logs', 'System Logs', ClipboardList]
  ],

  principal: [
    ['dashboard', 'Dashboard Overview', LayoutDashboard],
    ['students', 'Students', GraduationCap],
    ['grades', 'Academic Records', BookOpen],
    ['documents', 'Documents', FileText],
    ['health', 'Health Records', Activity],
    ['alerts', 'Risk Alerts', AlertTriangle]
  ],

  department_head: [
    ['dashboard', 'Dashboard Overview', LayoutDashboard],
    ['students', 'Students', GraduationCap],
    ['grades', 'Academic Records', BookOpen],
    ['health', 'Health Records', Activity],
    ['tasks', 'Tasks', ClipboardList],
    ['alerts', 'Risk Alerts', AlertTriangle]
  ]
};

/* =========================================================
   HELPERS
   ========================================================= */

const arr = value =>
  Array.isArray(value)
    ? value
    : Array.isArray(value?.data)
    ? value.data
    : [];

const num = (value, fallback = 0) =>
  Number.isFinite(Number(value))
    ? Number(value)
    : fallback;

const avg = records => {
  const grades = records
    .map(record =>
      num(
        record.grade ?? record.average,
        NaN
      )
    )
    .filter(Number.isFinite);

  if (!grades.length) {
    return 0;
  }

  return (
    grades.reduce(
      (total, grade) =>
        total + grade,
      0
    ) / grades.length
  );
};

const init = name =>
  (name || 'User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();

const date = value =>
  value
    ? new Date(value).toLocaleDateString(
        'en-US',
        {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }
      )
    : '—';

const tone = value => {
  const status = String(
    value || ''
  ).toLowerCase();

  if (
    /present|approved|good|passed|active|enrolled|resolved|closed/.test(
      status
    )
  ) {
    return 'success';
  }

  if (
    /absent|high|open|danger/.test(
      status
    )
  ) {
    return 'danger';
  }

  if (
    /late|pending|medium|processing/.test(
      status
    )
  ) {
    return 'warning';
  }

  return 'info';
};

/* =========================================================
   MAIN APP
   ========================================================= */

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      return (
        JSON.parse(
          localStorage.getItem('user')
        ) || null
      );
    } catch {
      return null;
    }
  });

  const [page, setPage] =
    useState('dashboard');

  const [mobile, setMobile] =
    useState(false);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setUser(null);
    setPage('dashboard');
  };

  if (!user) {
    return (
      <Login
        onLogin={setUser}
      />
    );
  }

  const role =
    user.role || 'student';

  const nav =
    navs[role] ||
    navs.student;

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
  setUser={setUser}
/>

      <main className="main">

        <header className="mobile">

          <button
            type="button"
            onClick={() =>
              setMobile(true)
            }
          >
            <Menu size={20} />
          </button>

          <b>
            EduTrack
          </b>

          <Avatar
            name={user.name}
          />

        </header>

        <header className="top">

          <span>
            EduTrack /{' '}
            {labels[role] || role}
          </span>

          <div>

            Last updated:{' '}
            {new Date().toLocaleDateString()}{' '}

            <Avatar
              name={user.name}
            />

          </div>

        </header>

        {page === 'dashboard' && (
          <Dashboard
            role={role}
            user={user}
            setPage={setPage}
          />
        )}

        {page === 'grades' && (
          <Grades
            role={role}
          />
        )}

        {page === 'attendance' && (
          <Attendance />
        )}

        {page === 'documents' && (
          <Documents />
        )}

        {page === 'announcements' && (
          <Announcements />
        )}

        {page === 'communications' && (
           <Communications
            role={role}
          />
        )}

        {page === 'notifications' && (
          <Notifications />
        )}

        {page === 'users' && (
          <UsersPage />
        )}

        {page === 'areas' && (
          <Areas />
        )}

        {page === 'logs' && (
          <Logs />
        )}

        {page === 'security' && (
          <Security />
        )}

        {page === 'students' && (
          <Students />
        )}

        {page === 'parents' && (
          <Parents />
        )}

        {page === 'tasks' && (
          <Tasks />
        )}

        {page === 'health' && (
          <HealthRecords
            role={role}
          />
        )}

        {page === 'alerts' && (
          <Alerts
            role={role}
          />
        )}

      </main>

      {mobile && (
        <div
          className="backdrop"
          onClick={() =>
            setMobile(false)
          }
        />
      )}

    </div>
  );
}

/* =========================================================
   LOGIN
   ========================================================= */

function Login({
  onLogin
}) {
  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [message, setMessage] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const submit = async event => {
    event.preventDefault();

    setMessage('');
    setLoading(true);

    try {
      const response =
        await api.post(
          '/login',
          {
            email:
              email.trim(),
            password
          }
        );

      localStorage.setItem(
        'token',
        response.data.token
      );

      localStorage.setItem(
        'user',
        JSON.stringify(
          response.data.user
        )
      );

      onLogin(
        response.data.user
      );

    } catch (error) {

      setMessage(
        error.response?.data?.message ||
        'Cannot connect to backend.'
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="login">

      <section className="visual">

        <div className="brand">

          <GraduationCap />

          <div>

            <b>
              EduTrack
            </b>

            <small>
              Academic Management System
            </small>

          </div>

        </div>

        <div className="copy">

          <h1>
            Better Learning.
            <br />
            Brighter Future.
          </h1>

          <p>
            Academic management for students,
            parents, teachers and school
            administrators.
          </p>

        </div>

        <div className="books">
          📚　🎓　📖
        </div>

      </section>

      <section className="loginbox">

        <form
          onSubmit={submit}
          className="login-card"
        >

          <small className="eyebrow">
            EDUTRACK PORTAL
          </small>

          <h1>
            Welcome Back!
          </h1>

          <p>
            Sign in to your account
            to continue.
          </p>

          <label>
            Email Address
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={event =>
              setEmail(
                event.target.value
              )
            }
            required
          />

          <label>
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={event =>
              setPassword(
                event.target.value
              )
            }
            required
          />

          <button
            type="submit"
            className="primary"
            disabled={loading}
          >
            {loading
              ? 'Signing in...'
              : 'Login'}
          </button>

          {message && (
            <div className="error">
              {message}
            </div>
          )}

          <small className="hint">
            Use an account already
            registered in your
            EduTrack database.
          </small>

        </form>

      </section>

    </div>
  );
}

/* =========================================================
   SIDEBAR
   ========================================================= */

function Sidebar({
  user,
  role,
  nav,
  page,
  setPage,
  logout,
  mobile,
  setMobile,
  setUser
}) {
  const demoRoles = [
    'admin',
    'principal',
    'department_head',
    'registrar',
    'teacher',
    'student',
    'parent'
  ];

  const switchDemoRole = event => {
    const newRole = event.target.value;

    if (!newRole || newRole === role) {
      return;
    }

    const updatedUser = {
      ...user,
      role: newRole
    };

    localStorage.setItem(
      'user',
      JSON.stringify(updatedUser)
    );

    setUser(updatedUser);
    setPage('dashboard');
    setMobile(false);
  };

  return (
    <aside
      className={
        'side ' +
        (mobile ? 'open' : '')
      }
    >

      <div className="sidebrand">

        <div className="brand">

          <GraduationCap />

          <div>

            <b>
              EduTrack
            </b>

            <small>
              Academic Management
              <br />
              System
            </small>

          </div>

        </div>

      </div>

      <nav>

        {nav.map(
          ([key, label, Icon]) => (

            <button
              type="button"
              className={
                page === key
                  ? 'active'
                  : ''
              }
              key={key}
              onClick={() => {

                setPage(key);
                setMobile(false);

              }}
            >

              <Icon size={18} />

              {label}

            </button>

          )
        )}

      </nav>

      <div className="sidebottom">

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '4px 10px'
          }}
        >

          <RefreshCw
            size={18}
          />

          <select
            value={role}
            onChange={switchDemoRole}
            aria-label="Switch demo role"
            title="Switch role for dashboard testing"
            style={{
              flex: 1,
              minWidth: 0,
              border: 0,
              outline: 0,
              background: 'transparent',
              color: '#ffffffc9',
              font: 'inherit',
              cursor: 'pointer',
              padding: '8px 4px',
              appearance: 'auto'
            }}
          >

            {demoRoles.map(
              demoRole => (
                <option
                  key={demoRole}
                  value={demoRole}
                  style={{
                    color: '#18201c',
                    background: '#ffffff'
                  }}
                >
                  {labels[demoRole] || demoRole}
                </option>
              )
            )}

          </select>

        </div>

        <button
          type="button"
          onClick={logout}
        >

          <LogOut
            size={18}
          />

          Logout

        </button>

        <div className="profile">

          <Avatar
            name={user.name}
          />

          <div>

            <b>
              {user.name}
            </b>

            <small>
              {labels[role] ||
                role}
            </small>

          </div>

        </div>

      </div>

    </aside>
  );
}

/* =========================================================
   BASIC COMPONENTS
   ========================================================= */

function Avatar({
  name,
  large = false
}) {
  return (
    <div
      className={
        'avatar ' +
        (large
          ? 'large'
          : '')
      }
    >
      {init(name)}
    </div>
  );
}

function Header({
  title,
  sub,
  action
}) {
  return (
    <div className="ph">

      <div>

        <h1>
          {title}
        </h1>

        <p>
          {sub}
        </p>

      </div>

      {action}

    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  kind = 'green',
  onClick
}) {
  return (
    <div
      className={
        'stat ' +
        (onClick
          ? 'clickable'
          : '')
      }
      onClick={onClick}
      role={
        onClick
          ? 'button'
          : undefined
      }
      tabIndex={
        onClick
          ? 0
          : undefined
      }
      onKeyDown={
        onClick
          ? event => {

              if (
                event.key ===
                  'Enter' ||
                event.key ===
                  ' '
              ) {
                onClick();
              }

            }
          : undefined
      }
    >

      <div
        className={
          'staticon ' +
          kind
        }
      >

        <Icon
          size={19}
        />

      </div>

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

      {onClick && (
        <small className="statlink">
          View
        </small>
      )}

    </div>
  );
}

function Card({
  title,
  children
}) {
  return (
    <section className="card">

      {title && (
        <h2>
          {title}
        </h2>
      )}

      {children}

    </section>
  );
}

function Badge({
  children
}) {
  return (
    <span
      className={
        'badge ' +
        tone(children)
      }
    >
      {children}
    </span>
  );
}

function Empty({
  children = 'No records found.'
}) {
  return (
    <div className="empty">
      {children}
    </div>
  );
}

/* =========================================================
   TABLE
   ========================================================= */

function Table({
  cols = [],
  rows = []
}) {
  return (
    <div className="tablewrap">

      <table>

        <thead>

          <tr>

            {cols.map(col => (

              <th key={col}>
                {col}
              </th>

            ))}

          </tr>

        </thead>

        <tbody>

          {rows.length ? (

            rows.map(
              (row, rowIndex) => (

                <tr
                  key={rowIndex}
                >

                  {row.map(
                    (
                      cell,
                      cellIndex
                    ) => (

                      <td
                        key={
                          cellIndex
                        }
                      >
                        {cell}
                      </td>

                    )
                  )}

                </tr>

              )
            )

          ) : (

            <tr>

              <td
                colSpan={
                  cols.length ||
                  1
                }
              >

                <Empty />

              </td>

            </tr>

          )}

        </tbody>

      </table>

    </div>
  );
}

/* =========================================================
   HEALTH
   ========================================================= */

function Health({
  label,
  value,
  n = 0
}) {
  const percentage =
    Math.max(
      0,
      Math.min(
        Number(n) || 0,
        100
      )
    );

  return (
    <div
      className="health"
      style={{
        marginBottom:
          '14px'
      }}
    >

      <div
        style={{
          display:
            'flex',
          justifyContent:
            'space-between',
          gap:
            '12px',
          marginBottom:
            '7px'
        }}
      >

        <span>
          {label}
        </span>

        <b>
          {value}
        </b>

      </div>

      <div
        style={{
          width: '100%',
          height: '7px',
          background:
            '#edf1f5',
          borderRadius:
            '999px',
          overflow:
            'hidden'
        }}
      >

        <div
          style={{
            width:
              `${percentage}%`,
            height: '100%',
            background:
              '#16a085',
            borderRadius:
              '999px'
          }}
        />

      </div>

    </div>
  );
}

/* =========================================================
   DASHBOARD
   ========================================================= */

function Dashboard({
  role,
  user,
  setPage
}) {
  if (role === 'student') {
    return (
      <Student
        user={user}
      />
    );
  }

  if (role === 'parent') {
    return <Parent />;
  }

  if (role === 'admin') {
    return (
      <Admin
        setPage={setPage}
      />
    );
  }

  if (role === 'teacher') {
    return <Teacher />;
  }

  if (role === 'registrar') {
    return <Registrar />;
  }

  return (
    <div className="content">

      <Header
        title={
          `${labels[role] || role} Dashboard`
        }
        sub="EduTrack academic management overview."
      />

      <Empty>
        Dashboard ready.
        Use the navigation menu.
      </Empty>

    </div>
  );
}

/* =========================================================
   STUDENT DASHBOARD
   ========================================================= */

function Student({
  user
}) {
  const [data, setData] =
    useState({
      students: [],
      grades: [],
      attendance: [],
      alerts: [],
      communications: []
    });

  useEffect(() => {

    Promise.allSettled([
      api.get('/students'),
      api.get('/academic-records'),
      api.get('/attendance'),
      api.get('/risk-alerts'),
      api.get('/communications')
    ]).then(results => {

      const values =
        results.map(result =>
          result.status ===
          'fulfilled'
            ? arr(result.value.data)
            : []
        );

      setData({
        students:
          values[0],
        grades:
          values[1],
        attendance:
          values[2],
        alerts:
          values[3],
        communications:
          values[4]
      });

    });

  }, []);

  const present =
    data.attendance.filter(
      record =>
        String(
          record.status
        ).toLowerCase() ===
        'present'
    ).length;

  const attendanceRate =
    data.attendance.length
      ? (
          present /
          data.attendance.length *
          100
        ).toFixed(1)
      : '0.0';

  return (
    <div className="content">

      <Header
        title="Student Dashboard"
        sub={
          `${user.name}` +
          (
            data.students[0]
              ?.grade_level
              ? ` · Grade ${data.students[0].grade_level}`
              : ''
          ) +
          (
            data.students[0]
              ?.section
              ? ` - ${data.students[0].section}`
              : ''
          )
        }
      />

      <div className="stats four">

        <Stat
          icon={Activity}
          label="Overall Average"
          value={
            `${avg(
              data.grades
            ).toFixed(0)}%`
          }
        />

        <Stat
          icon={BookOpen}
          label="Subjects"
          value={
            new Set(
              data.grades.map(
                record =>
                  record.subject
              )
            ).size
          }
          kind="blue"
        />

        <Stat
          icon={CalendarDays}
          label="Attendance"
          value={
            `${attendanceRate}%`
          }
        />

        <Stat
          icon={ShieldCheck}
          label="Risk Status"
          value={
            data.alerts.length
              ? 'Monitor'
              : 'Good'
          }
          kind={
            data.alerts.length
              ? 'yellow'
              : 'green'
          }
        />

      </div>

      <div className="cols">

        <Card title="Grade Summary">

          {data.grades.length
            ? data.grades
                .slice(0, 6)
                .map(record => (

                  <div
                    className="row"
                    key={
                      record.record_id ||
                      record.subject
                    }
                  >

                    <div>

                      <b>
                        {
                          record.subject
                        }
                      </b>

                      <small>
                        {
                          record.school_year ||
                          'Academic record'
                        }
                      </small>

                    </div>

                    <b>
                      {
                        record.grade ??
                        record.average ??
                        '—'
                      }
                    </b>

                    <Badge>
                      {
                        num(
                          record.grade ??
                          record.average
                        ) >= 75
                          ? 'Passed'
                          : 'Needs Support'
                      }
                    </Badge>

                  </div>

                ))
            : <Empty />}

        </Card>

        <Card title="School Announcements">

          {data.communications.length
            ? data.communications
                .slice(0, 4)
                .map(item => (

                  <div
                    className="announce"
                    key={
                      item.communication_id
                    }
                  >

                    <div>

                      <b>
                        {
                          item.subject ||
                          'School Announcement'
                        }
                      </b>

                      <p>
                        {item.message}
                      </p>

                      <small>
                        {date(
                          item.created_at
                        )}
                      </small>

                    </div>

                    <Badge>
                      {
                        item.status ||
                        'New'
                      }
                    </Badge>

                  </div>

                ))
            : (

              <Empty>
                No announcements yet.
              </Empty>

            )}

        </Card>

      </div>

      <Card title="Risk Alerts">

        {data.alerts.length
          ? data.alerts.map(
              alert => (

                <div
                  className="alert"
                  key={
                    alert.alert_id
                  }
                >

                  <AlertTriangle
                    size={18}
                  />

                  <div>

                    <b>
                      {
                        alert.alert_type
                      }
                    </b>

                    <small>
                      {
                        alert.description
                      }
                    </small>

                  </div>

                  <Badge>
                    {
                      alert.severity ||
                      alert.status
                    }
                  </Badge>

                </div>

              )
            )
          : (

            <Empty>
              No open alerts.
              Good standing.
            </Empty>

          )}

      </Card>

    </div>
  );
}

/* =========================================================
   PARENT DASHBOARD
   ========================================================= */

function Parent() {
  return (
    <DataDashboard
      title="Parent Dashboard"
      sub="Monitoring: your child"
    />
  );
}

function DataDashboard({
  title,
  sub
}) {
  const [data, setData] =
    useState({
      students: [],
      grades: [],
      attendance: [],
      alerts: []
    });

  useEffect(() => {

    Promise.allSettled([
      api.get('/students'),
      api.get('/academic-performance'),
      api.get('/attendance'),
      api.get('/risk-alerts')
    ]).then(results => {

      const values =
        results.map(result =>
          result.status ===
          'fulfilled'
            ? arr(result.value.data)
            : []
        );

      setData({
        students:
          values[0],
        grades:
          values[1],
        attendance:
          values[2],
        alerts:
          values[3]
      });

    });

  }, []);

  const present =
    data.attendance.filter(
      record =>
        String(
          record.status
        ).toLowerCase() ===
        'present'
    ).length;

  const attendanceRate =
    data.attendance.length
      ? (
          present /
          data.attendance.length *
          100
        ).toFixed(1)
      : '0.0';

  return (
    <div className="content">

      <Header
        title={title}
        sub={sub}
      />

      <div className="stats four">

        <Stat
          icon={Activity}
          label="Overall Average"
          value={
            `${avg(
              data.grades
            ).toFixed(0)}%`
          }
        />

        <Stat
          icon={CalendarDays}
          label="Attendance"
          value={
            `${attendanceRate}%`
          }
        />

        <Stat
          icon={BookOpen}
          label="Subjects"
          value={
            new Set(
              data.grades.map(
                record =>
                  record.subject
              )
            ).size
          }
          kind="blue"
        />

        <Stat
          icon={Bell}
          label="Unread Alerts"
          value={
            data.alerts.length
          }
          kind="red"
        />

      </div>

      <div className="cols">

        <Card title="Child Overview">

          <div className="overview">

            <Avatar
              name={
                data.students[0]
                  ?.name ||
                'Student'
              }
              large
            />

            <div>

              <h3>
                {
                  data.students[0]
                    ?.name ||
                  'Student'
                }
              </h3>

              <p>
                Student record
              </p>

            </div>

          </div>

          <div className="details">

            <span>

              Overall Average

              <b>
                {
                  avg(
                    data.grades
                  ).toFixed(0)
                }%
              </b>

            </span>

            <span>

              Attendance Rate

              <b>
                {attendanceRate}%
              </b>

            </span>

            <span>

              Risk Status

              <Badge>
                {
                  data.alerts.length
                    ? 'Monitor'
                    : 'Good'
                }
              </Badge>

            </span>

          </div>

        </Card>

        <Card title="Recent Notifications">

          {data.alerts.length
            ? data.alerts
                .slice(0, 5)
                .map(alert => (

                  <div
                    className="alert"
                    key={
                      alert.alert_id
                    }
                  >

                    <AlertTriangle
                      size={18}
                    />

                    <div>

                      <b>
                        {
                          alert.alert_type
                        }
                      </b>

                      <small>
                        {
                          alert.description
                        }
                      </small>

                    </div>

                    <small>
                      {
                        date(
                          alert.created_at
                        )
                      }
                    </small>

                  </div>

                ))
            : <Empty />}

        </Card>

      </div>

      <Card title="Grade Performance">

        <Table
          cols={[
            'Subject',
            'Grade',
            'School Year',
            'Status'
          ]}
          rows={
            data.grades.map(
              record => {

                const grade =
                  record.grade ??
                  record.average ??
                  null;

                return [
                  record.subject ||
                    '—',
                  grade ?? '—',
                  record.school_year ||
                    '—',
                  num(grade) >= 75
                    ? 'Passed'
                    : 'Needs Support'
                ];

              }
            )
          }
        />

      </Card>

    </div>
  );
}

/* =========================================================
   ADMIN DASHBOARD
   ========================================================= */

function Admin({
  setPage
}) {
  const [users, setUsers] =
    useState([]);

  const [logs, setLogs] =
    useState([]);

  const [alerts, setAlerts] =
    useState([]);

  useEffect(() => {

    Promise.allSettled([
      api.get('/users'),
      api.get('/audit-logs'),
      api.get('/risk-alerts')
    ]).then(
      ([
        usersResult,
        logsResult,
        alertsResult
      ]) => {

        if (
          usersResult.status ===
          'fulfilled'
        ) {
          setUsers(
            arr(
              usersResult.value.data
            )
          );
        }

        if (
          logsResult.status ===
          'fulfilled'
        ) {
          setLogs(
            arr(
              logsResult.value.data
            )
          );
        }

        if (
          alertsResult.status ===
          'fulfilled'
        ) {
          setAlerts(
            arr(
              alertsResult.value.data
            )
          );
        }

      }
    );

  }, []);

  const atRiskStudents = [
    ...new Set(
      alerts
        .filter(alert => {

          const status =
            String(
              alert.status || ''
            ).toLowerCase();

          const severity =
            String(
              alert.severity || ''
            ).toLowerCase();

          return (
            status === 'open' ||
            (
              status !== 'resolved' &&
              status !== 'closed' &&
              (
                severity === 'high' ||
                severity === 'medium'
              )
            )
          );

        })
        .map(
          alert =>
            alert.student_id
        )
        .filter(Boolean)
    )
  ];

  return (
    <div className="content">

      <Header
        title="System Administrator Dashboard"
        sub="Welcome back. Here's the system overview."
      />

      <div className="stats four">

        <Stat
          icon={Users}
          label="Total Users"
          value={
            users.length
          }
          onClick={() =>
            setPage('users')
          }
        />

        <Stat
          icon={Activity}
          label="Active Users"
          value={
            users.length
          }
          kind="yellow"
          onClick={() =>
            setPage('users')
          }
        />

        <Stat
          icon={GraduationCap}
          label="Total Students"
          value={
            users.filter(
              user =>
                user.role ===
                'student'
            ).length
          }
          kind="blue"
          onClick={() =>
            setPage('students')
          }
        />

        <Stat
          icon={AlertTriangle}
          label="At-Risk Students"
          value={
            atRiskStudents.length
          }
          kind="red"
          onClick={() =>
            setPage('alerts')
          }
        />

      </div>

      <div className="cols">

        <Card title="Recent User Activity">

          {logs.length
            ? logs
                .slice(0, 7)
                .map(log => (

                  <div
                    className="activity"
                    key={
                      log.log_id
                    }
                  >

                    <i />

                    <div>

                      <b>
                        User #{log.user_id}
                      </b>

                      <small>
                        {
                          log.description ||
                          `${log.action} ${log.module}`
                        }
                      </small>

                      <small>
                        {
                          date(
                            log.created_at
                          )
                        }
                      </small>

                    </div>

                  </div>

                ))
            : (

              <Empty>
                No recent activity.
              </Empty>

            )}

        </Card>

        <Card title="System Health">

          <Health
            label="Database Status"
            value="Operational"
            n={100}
          />

          <Health
            label="API Response"
            value="Connected"
            n={88}
          />

          <Health
            label="Storage Usage"
            value="Managed by server"
            n={35}
          />

          <Health
            label="Active Sessions"
            value={
              `${users.length} users`
            }
            n={Math.min(
              users.length * 5,
              100
            )}
          />

        </Card>

      </div>

    </div>
  );
}

/* =========================================================
   TEACHER
   ========================================================= */

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

/* =========================================================
   REGISTRAR
   ========================================================= */

function Registrar() {
  return (
    <ListDashboard
      title="Registrar Dashboard"
      endpoints={[
        '/students',
        '/documents'
      ]}
      stats={[
        'Students',
        'Documents'
      ]}
    />
  );
}

/* =========================================================
   LIST DASHBOARD
   ========================================================= */

function ListDashboard({
  title,
  endpoints,
  stats
}) {
  const [data, setData] =
    useState([]);

  useEffect(() => {

    Promise.allSettled(
      endpoints.map(
        endpoint =>
          api.get(endpoint)
      )
    ).then(results => {

      setData(
        results.map(
          result =>
            result.status ===
            'fulfilled'
              ? arr(
                  result.value.data
                )
              : []
        )
      );

    });

  }, [endpoints]);

  return (
    <div className="content">

      <Header
        title={title}
        sub="EduTrack management overview."
      />

      <div className="stats three">

        {stats.map(
          (label, index) => (

            <Stat
              key={label}
              icon={
                index
                  ? BookOpen
                  : Users
              }
              label={label}
              value={
                data[index]
                  ?.length || 0
              }
            />

          )
        )}

      </div>

      <Card title="Recent Records">

        <Table
          cols={[
            'Name / ID',
            'Grade',
            'Section',
            'Status'
          ]}
          rows={
            (data[0] || [])
              .slice(0, 10)
              .map(record => [
                record.name ||
                  `#${record.student_id}`,
                record.grade_level ||
                  '—',
                record.section ||
                  '—',
                record.enrollment_status ||
                  '—'
              ])
          }
        />

      </Card>

    </div>
  );
}

/* =========================================================
   GRADES
   ========================================================= */

/* =========================================================
   ACADEMIC RECORDS - CRUD
   ========================================================= */

function Grades({
  role
}) {
  const [records, setRecords] =
    useState([]);

  const [students, setStudents] =
    useState([]);

  const [search, setSearch] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState('');

  const [messageType, setMessageType] =
    useState('success');

  const [showModal, setShowModal] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [form, setForm] =
    useState({
      student_id: '',
      subject: '',
      grade: '',
      school_year: '',
      semester: ''
    });

  /* =======================================================
     CHECK IF USER CAN MANAGE RECORDS
     ======================================================= */

  const canCreate = [
    'admin',
    'registrar',
    'department_head',
    'teacher'
  ].includes(role);

  const canUpdate = [
    'admin',
    'principal',
    'registrar',
    'department_head',
    'teacher'
  ].includes(role);

  const canDelete =
    role === 'admin';

  /* =======================================================
     LOAD ACADEMIC RECORDS
     ======================================================= */

  const loadRecords = async () => {

    setLoading(true);

    try {

      const response =
        await api.get(
          '/academic-records'
        );

      setRecords(
        arr(
          response.data
        )
      );

    } catch (error) {

      console.error(
        'Load academic records error:',
        error
      );

      setMessage(
        error.response?.data?.message ||
        'Failed to load academic records.'
      );

      setMessageType(
        'error'
      );

    } finally {

      setLoading(false);

    }
  };

  /* =======================================================
     LOAD STUDENTS
     ======================================================= */

  const loadStudents = async () => {

    try {

      const response =
        await api.get(
          '/students'
        );

      setStudents(
        arr(
          response.data
        )
      );

    } catch (error) {

      console.error(
        'Load students error:',
        error
      );

    }

  };

  /* =======================================================
     INITIAL LOAD
     ======================================================= */

  useEffect(() => {

    loadRecords();

    if (canCreate || canUpdate) {
      loadStudents();
    }

  }, [role]);

  /* =======================================================
     FORM CHANGE
     ======================================================= */

  const handleChange = event => {

    const {
      name,
      value
    } = event.target;

    setForm(
      previous => ({
        ...previous,
        [name]: value
      })
    );

  };

  /* =======================================================
     RESET FORM
     ======================================================= */

  const resetForm = () => {

    setForm({
      student_id: '',
      subject: '',
      grade: '',
      school_year: '',
      semester: ''
    });

    setEditingId(null);

  };

  /* =======================================================
     OPEN ADD MODAL
     ======================================================= */

  const openAddModal = () => {

    resetForm();

    setMessage('');

    setShowModal(true);

  };

  /* =======================================================
     OPEN EDIT MODAL
     ======================================================= */

  const openEditModal =
    record => {

      setEditingId(
        record.record_id
      );

      setForm({
        student_id:
          record.student_id ??
          '',
        subject:
          record.subject ||
          '',
        grade:
          record.grade ??
          '',
        school_year:
          record.school_year ||
          '',
        semester:
          record.semester ||
          ''
      });

      setMessage('');

      setShowModal(true);

    };

  /* =======================================================
     CLOSE MODAL
     ======================================================= */

  const closeModal = () => {

    if (saving) {
      return;
    }

    setShowModal(false);

    resetForm();

  };

  /* =======================================================
     VALIDATE FORM
     ======================================================= */

  const validateForm = () => {

    const studentId =
      Number(
        form.student_id
      );

    const subject =
      form.subject.trim();

    const grade =
      Number(
        form.grade
      );

    const schoolYear =
      form.school_year.trim();

    const semester =
      form.semester.trim();

    if (
      !Number.isInteger(
        studentId
      ) ||
      studentId <= 0
    ) {

      setMessage(
        'Please select a valid student.'
      );

      setMessageType(
        'error'
      );

      return false;
    }

    if (!subject) {

      setMessage(
        'Subject is required.'
      );

      setMessageType(
        'error'
      );

      return false;
    }

    if (
      !Number.isFinite(
        grade
      )
    ) {

      setMessage(
        'Grade is required.'
      );

      setMessageType(
        'error'
      );

      return false;
    }

    if (
      grade < 0 ||
      grade > 100
    ) {

      setMessage(
        'Grade must be between 0 and 100.'
      );

      setMessageType(
        'error'
      );

      return false;
    }

    if (!schoolYear) {

      setMessage(
        'School year is required.'
      );

      setMessageType(
        'error'
      );

      return false;
    }

    if (!semester) {

      setMessage(
        'Semester is required.'
      );

      setMessageType(
        'error'
      );

      return false;
    }

    return true;
  };

  /* =======================================================
     SAVE RECORD
     ======================================================= */

  const saveRecord =
    async event => {

      event.preventDefault();

      setMessage('');

      if (!validateForm()) {
        return;
      }

      setSaving(true);

      try {

        const payload = {
          student_id:
            Number(
              form.student_id
            ),

          subject:
            form.subject.trim(),

          grade:
            Number(
              form.grade
            ),

          school_year:
            form.school_year.trim(),

          semester:
            form.semester.trim()
        };

        /* CREATE */

        if (!editingId) {

          const response =
            await api.post(
              '/academic-records',
              payload
            );

          setMessage(
            response.data?.message ||
            'Academic record added successfully.'
          );

        }

        /* UPDATE */

        else {

          const response =
            await api.put(
              `/academic-records/${editingId}`,
              payload
            );

          setMessage(
            response.data?.message ||
            `Academic record #${editingId} updated successfully.`
          );

        }

        setMessageType(
          'success'
        );

        setShowModal(false);

        resetForm();

        await loadRecords();

      } catch (error) {

        console.error(
          'Save academic record error:',
          error
        );

        setMessage(
          error.response?.data?.message ||
          'Failed to save academic record.'
        );

        setMessageType(
          'error'
        );

      } finally {

        setSaving(false);

      }

    };

  /* =======================================================
     DELETE RECORD
     ======================================================= */

  const deleteRecord =
    async record => {

      const confirmed =
        window.confirm(
          `Are you sure you want to delete Academic Record #${record.record_id}?`
        );

      if (!confirmed) {
        return;
      }

      setMessage('');

      try {

        const response =
          await api.delete(
            `/academic-records/${record.record_id}`
          );

        setMessage(
          response.data?.message ||
          `Academic record #${record.record_id} deleted successfully.`
        );

        setMessageType(
          'success'
        );

        await loadRecords();

      } catch (error) {

        console.error(
          'Delete academic record error:',
          error
        );

        setMessage(
          error.response?.data?.message ||
          'Failed to delete academic record.'
        );

        setMessageType(
          'error'
        );

      }

    };

  /* =======================================================
     SEARCH
     ======================================================= */

  const filteredRecords =
    records.filter(
      record => {

        const query =
          search
            .toLowerCase()
            .trim();

        return (

          String(
            record.record_id ||
            ''
          )
            .toLowerCase()
            .includes(query) ||

          String(
            record.student_id ||
            ''
          )
            .toLowerCase()
            .includes(query) ||

          String(
            record.student_name ||
            record.name ||
            ''
          )
            .toLowerCase()
            .includes(query) ||

          String(
            record.subject ||
            ''
          )
            .toLowerCase()
            .includes(query) ||

          String(
            record.school_year ||
            ''
          )
            .toLowerCase()
            .includes(query) ||

          String(
            record.semester ||
            ''
          )
            .toLowerCase()
            .includes(query)

        );

      }
    );

  /* =======================================================
     STATISTICS
     ======================================================= */

  const overallAverage =
    avg(
      records
    );

  const passingRecords =
    records.filter(
      record =>
        num(
          record.grade ??
          record.average
        ) >= 75
    ).length;

  const failingRecords =
    records.filter(
      record =>
        num(
          record.grade ??
          record.average
        ) < 75
    ).length;

  const subjects =
    new Set(
      records
        .map(
          record =>
            record.subject
        )
        .filter(Boolean)
    ).size;

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="content">

      <Header
        title={
          role === 'student'
            ? 'My Grades'
            : role === 'parent'
            ? 'Grades & Performance'
            : 'Academic Records'
        }
        sub={
          role === 'student' ||
          role === 'parent'
            ? 'View academic performance and subject records.'
            : 'Manage student academic records and grades.'
        }
        action={

          <div
            style={{
              display:
                'flex',
              gap:
                '8px',
              flexWrap:
                'wrap'
            }}
          >

            <button
              type="button"
              className="small"
              onClick={
                loadRecords
              }
              disabled={
                loading
              }
              style={{
                display:
                  'flex',
                alignItems:
                  'center',
                gap:
                  '6px'
              }}
            >

              <RefreshCw
                size={15}
              />

              {loading
                ? 'Refreshing...'
                : 'Refresh'}

            </button>

            {canCreate && (

              <button
                type="button"
                className="primary small"
                onClick={
                  openAddModal
                }
              >
                + Add Record
              </button>

            )}

          </div>

        }
      />

      {/* ===================================================
          MESSAGE
          =================================================== */}

      {message && (

        <div
          className="card"
          style={{
            marginBottom:
              '20px',
            padding:
              '13px 16px',
            borderLeft:
              messageType ===
              'error'
                ? '4px solid #dc2626'
                : '4px solid #16a085',
            background:
              messageType ===
              'error'
                ? '#fff5f5'
                : '#f0fdf4'
          }}
        >
          {message}
        </div>

      )}

      {/* ===================================================
          SEARCH
          =================================================== */}

      <div
        className="search"
        style={{
          marginBottom:
            '20px'
        }}
      >

        <Search
          size={17}
        />

        <input
          placeholder="Search by record ID, student, subject, school year or semester..."
          value={
            search
          }
          onChange={
            event =>
              setSearch(
                event.target.value
              )
          }
        />

      </div>

      {/* ===================================================
          SUMMARY
          =================================================== */}

      <div
        className="stats four"
        style={{
          marginBottom:
            '20px'
        }}
      >

        <Stat
          icon={Activity}
          label="Overall Average"
          value={
            `${overallAverage.toFixed(1)}%`
          }
        />

        <Stat
          icon={BookOpen}
          label="Subjects"
          value={
            subjects
          }
          kind="blue"
        />

        <Stat
          icon={CheckCircle2}
          label="Passing"
          value={
            passingRecords
          }
        />

        <Stat
          icon={AlertTriangle}
          label="Needs Support"
          value={
            failingRecords
          }
          kind="red"
        />

      </div>

      {/* ===================================================
          RECORD TABLE
          =================================================== */}

      <Card
        title={
          role === 'student' ||
          role === 'parent'
            ? 'Academic Records'
            : 'Student Academic Records'
        }
      >

        {!filteredRecords.length ? (

          <Empty>

            {records.length
              ? 'No academic records match your search.'
              : 'No academic records found in the database.'}

          </Empty>

        ) : (

          <div
            className="tablewrap"
          >

            <table>

              <thead>

                <tr>

                  <th>
                    Record ID
                  </th>

                  <th>
                    Student
                  </th>

                  <th>
                    Subject
                  </th>

                  <th>
                    Grade
                  </th>

                  <th>
                    School Year
                  </th>

                  <th>
                    Semester
                  </th>

                  <th>
                    Remarks
                  </th>

                  {(canUpdate ||
                    canDelete) && (

                    <th>
                      Actions
                    </th>

                  )}

                </tr>

              </thead>

              <tbody>

                {filteredRecords.map(
                  record => {

                    const grade =
                      record.grade ??
                      record.average ??
                      null;

                    const passed =
                      num(
                        grade
                      ) >= 75;

                    return (

                      <tr
                        key={
                          record.record_id
                        }
                      >

                        <td>
                          #
                          {
                            record.record_id
                          }
                        </td>

                        <td>

                          <div>

                            <b>
                              {
                                record.student_name ||
                                record.name ||
                                `Student #${record.student_id}`
                              }
                            </b>

                            <small
                              style={{
                                display:
                                  'block',
                                marginTop:
                                  '3px'
                              }}
                            >
                              Student ID: #
                              {
                                record.student_id ??
                                '—'
                              }
                            </small>

                          </div>

                        </td>

                        <td>
                          {
                            record.subject ||
                            '—'
                          }
                        </td>

                        <td>

                          <b>
                            {
                              grade ??
                              '—'
                            }
                          </b>

                        </td>

                        <td>
                          {
                            record.school_year ||
                            '—'
                          }
                        </td>

                        <td>
                          {
                            record.semester ||
                            '—'
                          }
                        </td>

                        <td>

                          <Badge>
                            {
                              passed
                                ? 'Passed'
                                : 'Needs Support'
                            }
                          </Badge>

                        </td>

                        {(canUpdate ||
                          canDelete) && (

                          <td>

                            <div
                              style={{
                                display:
                                  'flex',
                                gap:
                                  '7px',
                                flexWrap:
                                  'wrap'
                              }}
                            >

                              {canUpdate && (

                                <button
                                  type="button"
                                  className="small"
                                  onClick={() =>
                                    openEditModal(
                                      record
                                    )
                                  }
                                >
                                  Edit
                                </button>

                              )}

                              {canDelete && (

                                <button
                                  type="button"
                                  className="small"
                                  onClick={() =>
                                    deleteRecord(
                                      record
                                    )
                                  }
                                >
                                  Delete
                                </button>

                              )}

                            </div>

                          </td>

                        )}

                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </Card>

      {/* ===================================================
          ADD / EDIT MODAL
          =================================================== */}

      {showModal && (

        <div
          onClick={event => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }

          }}
          style={{
            position:
              'fixed',
            inset:
              0,
            background:
              'rgba(15, 23, 42, 0.55)',
            display:
              'flex',
            alignItems:
              'center',
            justifyContent:
              'center',
            padding:
              '20px',
            zIndex:
              9999
          }}
        >

          <div
            style={{
              width:
                '100%',
              maxWidth:
                '680px',
              maxHeight:
                '90vh',
              overflowY:
                'auto',
              background:
                '#ffffff',
              borderRadius:
                '16px',
              boxShadow:
                '0 25px 60px rgba(0,0,0,.20)'
            }}
          >

            {/* MODAL HEADER */}

            <div
              style={{
                display:
                  'flex',
                alignItems:
                  'center',
                justifyContent:
                  'space-between',
                padding:
                  '20px 22px',
                borderBottom:
                  '1px solid #e5e7eb'
              }}
            >

              <div>

                <h2
                  style={{
                    margin:
                      0,
                    fontSize:
                      '20px'
                  }}
                >

                  {editingId
                    ? 'Edit Academic Record'
                    : 'Add Academic Record'}

                </h2>

                <p
                  style={{
                    margin:
                      '5px 0 0',
                    color:
                      '#6b7280',
                    fontSize:
                      '13px'
                  }}
                >

                  {editingId
                    ? `Update Academic Record #${editingId}.`
                    : 'Create a new academic grade record for a student.'}

                </p>

              </div>

              <button
                type="button"
                className="small"
                onClick={
                  closeModal
                }
                disabled={
                  saving
                }
                style={{
                  width:
                    '36px',
                  height:
                    '36px',
                  padding:
                    0,
                  display:
                    'flex',
                  alignItems:
                    'center',
                  justifyContent:
                    'center'
                }}
              >

                <X
                  size={18}
                />

              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                saveRecord
              }
              noValidate
              style={{
                padding:
                  '22px'
              }}
            >

              <div
                style={{
                  display:
                    'grid',
                  gridTemplateColumns:
                    'repeat(2, minmax(0, 1fr))',
                  gap:
                    '16px'
                }}
              >

                {/* STUDENT */}

                <div
                  style={{
                    gridColumn:
                      '1 / -1'
                  }}
                >

                  <label
                    style={{
                      display:
                        'block',
                      marginBottom:
                        '6px',
                      fontWeight:
                        600
                    }}
                  >
                    Student *
                  </label>

                  <select
                    name="student_id"
                    value={
                      form.student_id
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      Boolean(
                        editingId
                      )
                    }
                    style={{
                      width:
                        '100%',
                      height:
                        '42px',
                      padding:
                        '8px 12px',
                      borderRadius:
                        '8px',
                      border:
                        '1px solid #d9dee7',
                      background:
                        '#ffffff'
                    }}
                  >

                    <option value="">
                      Select student
                    </option>

                    {students.map(
                      student => (

                        <option
                          key={
                            student.student_id
                          }
                          value={
                            student.student_id
                          }
                        >
                          #
                          {
                            student.student_id
                          }
                          {' — '}
                          {
                            student.name ||
                            `Student #${student.student_id}`
                          }
                          {' — '}
                          {
                            student.email ||
                            `User ID ${student.user_id ?? '—'}`
                          }
                        </option>

                      )
                    )}

                  </select>

                  {!students.length && (

                    <small
                      style={{
                        display:
                          'block',
                        marginTop:
                          '6px',
                        color:
                          '#6b7280'
                      }}
                    >
                      No student records are available.
                    </small>

                  )}

                  {editingId && (

                    <small
                      style={{
                        display:
                          'block',
                        marginTop:
                          '6px',
                        color:
                          '#6b7280'
                      }}
                    >
                      The linked student cannot be changed while editing.
                    </small>

                  )}

                </div>

                {/* SUBJECT */}

                <div
                  style={{
                    gridColumn:
                      '1 / -1'
                  }}
                >

                  <label
                    style={{
                      display:
                        'block',
                      marginBottom:
                        '6px',
                      fontWeight:
                        600
                    }}
                  >
                    Subject *
                  </label>

                  <input
                    type="text"
                    name="subject"
                    value={
                      form.subject
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Mathematics"
                    maxLength={100}
                    style={{
                      width:
                        '100%'
                    }}
                  />

                </div>

                {/* GRADE */}

                <div>

                  <label
                    style={{
                      display:
                        'block',
                      marginBottom:
                        '6px',
                      fontWeight:
                        600
                    }}
                  >
                    Grade *
                  </label>

                  <input
                    type="number"
                    name="grade"
                    value={
                      form.grade
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. 93.50"
                    min="0"
                    max="100"
                    step="0.01"
                    style={{
                      width:
                        '100%'
                    }}
                  />

                </div>

                {/* SCHOOL YEAR */}

                <div>

                  <label
                    style={{
                      display:
                        'block',
                      marginBottom:
                        '6px',
                      fontWeight:
                        600
                    }}
                  >
                    School Year *
                  </label>

                  <input
                    type="text"
                    name="school_year"
                    value={
                      form.school_year
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. 2025-2026"
                    maxLength={20}
                    style={{
                      width:
                        '100%'
                    }}
                  />

                </div>

                {/* SEMESTER */}

                <div
                  style={{
                    gridColumn:
                      '1 / -1'
                  }}
                >

                  <label
                    style={{
                      display:
                        'block',
                      marginBottom:
                        '6px',
                      fontWeight:
                        600
                    }}
                  >
                    Semester *
                  </label>

                  <select
                    name="semester"
                    value={
                      form.semester
                    }
                    onChange={
                      handleChange
                    }
                    style={{
                      width:
                        '100%',
                      height:
                        '42px',
                      padding:
                        '8px 12px',
                      borderRadius:
                        '8px',
                      border:
                        '1px solid #d9dee7',
                      background:
                        '#ffffff'
                    }}
                  >

                    <option value="">
                      Select semester
                    </option>

                    <option value="1st Semester">
                      1st Semester
                    </option>

                    <option value="2nd Semester">
                      2nd Semester
                    </option>

                  </select>

                </div>

              </div>

              {/* BUTTONS */}

              <div
                style={{
                  display:
                    'flex',
                  justifyContent:
                    'flex-end',
                  gap:
                    '10px',
                  marginTop:
                    '24px',
                  paddingTop:
                    '18px',
                  borderTop:
                    '1px solid #e5e7eb'
                }}
              >

                <button
                  type="button"
                  className="small"
                  onClick={
                    closeModal
                  }
                  disabled={
                    saving
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary"
                  disabled={
                    saving
                  }
                >

                  {saving
                    ? 'Saving...'
                    : editingId
                    ? 'Save Changes'
                    : 'Create Record'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

/* =========================================================
   ATTENDANCE - CRUD
   ========================================================= */

function Attendance() {
  const [records, setRecords] =
    useState([]);

  const [students, setStudents] =
    useState([]);

  const [search, setSearch] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState('all');

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState('');

  const [messageType, setMessageType] =
    useState('success');

  const [showModal, setShowModal] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [form, setForm] =
    useState({
      student_id: '',
      attendance_date: '',
      status: 'Present',
      remarks: ''
    });

  /* =======================================================
     LOAD ATTENDANCE
     ======================================================= */

  const loadAttendance = async () => {

    setLoading(true);

    try {

      const response =
        await api.get(
          '/attendance'
        );

      setRecords(
        arr(
          response.data
        )
      );

    } catch (error) {

      console.error(
        'Load attendance error:',
        error
      );

      setMessage(
        error.response?.data?.message ||
        'Failed to load attendance records.'
      );

      setMessageType(
        'error'
      );

    } finally {

      setLoading(false);

    }
  };

  /* =======================================================
     LOAD STUDENTS
     ======================================================= */

  const loadStudents = async () => {

    try {

      const response =
        await api.get(
          '/students'
        );

      setStudents(
        arr(
          response.data
        )
      );

    } catch (error) {

      console.error(
        'Load students error:',
        error
      );

    }

  };

  /* =======================================================
     INITIAL LOAD
     ======================================================= */

  useEffect(() => {

    loadAttendance();
    loadStudents();

  }, []);

  /* =======================================================
     FORM CHANGE
     ======================================================= */

  const handleChange = event => {

    const {
      name,
      value
    } = event.target;

    setForm(
      previous => ({
        ...previous,
        [name]: value
      })
    );

  };

  /* =======================================================
     RESET
     ======================================================= */

  const resetForm = () => {

    setForm({
      student_id: '',
      attendance_date: '',
      status: 'Present',
      remarks: ''
    });

    setEditingId(null);

  };

  /* =======================================================
     OPEN ADD
     ======================================================= */

  const openAddModal = () => {

    resetForm();

    const today =
      new Date()
        .toISOString()
        .split('T')[0];

    setForm(
      previous => ({
        ...previous,
        attendance_date:
          today
      })
    );

    setMessage('');

    setShowModal(true);

  };

  /* =======================================================
     OPEN EDIT
     ======================================================= */

  const openEditModal =
    record => {

      setEditingId(
        record.attendance_id
      );

      setForm({
        student_id:
          record.student_id ??
          '',
        attendance_date:
          record.attendance_date
            ? String(
                record.attendance_date
              ).slice(0, 10)
            : '',
        status:
          record.status ||
          'Present',
        remarks:
          record.remarks ||
          ''
      });

      setMessage('');

      setShowModal(true);

    };

  /* =======================================================
     CLOSE MODAL
     ======================================================= */

  const closeModal = () => {

    if (saving) {
      return;
    }

    setShowModal(false);

    resetForm();

  };

  /* =======================================================
     VALIDATE
     ======================================================= */

  const validateForm = () => {

    const studentId =
      Number(
        form.student_id
      );

    const attendanceDate =
      form.attendance_date.trim();

    const status =
      form.status.trim();

    if (
      !Number.isInteger(
        studentId
      ) ||
      studentId <= 0
    ) {

      setMessage(
        'Please select a valid student.'
      );

      setMessageType(
        'error'
      );

      return false;
    }

    if (!attendanceDate) {

      setMessage(
        'Attendance date is required.'
      );

      setMessageType(
        'error'
      );

      return false;
    }

    if (!status) {

      setMessage(
        'Attendance status is required.'
      );

      setMessageType(
        'error'
      );

      return false;
    }

    return true;
  };

  /* =======================================================
     SAVE
     ======================================================= */

  const saveAttendance =
    async event => {

      event.preventDefault();

      setMessage('');

      if (!validateForm()) {
        return;
      }

      setSaving(true);

      try {

        const payload = {
          student_id:
            Number(
              form.student_id
            ),

          attendance_date:
            form.attendance_date,

          status:
            form.status.trim(),

          remarks:
            form.remarks.trim()
        };

        /* CREATE */

        if (!editingId) {

          const response =
            await api.post(
              '/attendance',
              payload
            );

          setMessage(
            response.data?.message ||
            'Attendance record added successfully.'
          );

        }

        /* UPDATE */

        else {

          const response =
            await api.put(
              `/attendance/${editingId}`,
              payload
            );

          setMessage(
            response.data?.message ||
            `Attendance record #${editingId} updated successfully.`
          );

        }

        setMessageType(
          'success'
        );

        setShowModal(false);

        resetForm();

        await loadAttendance();

      } catch (error) {

        console.error(
          'Save attendance error:',
          error
        );

        setMessage(
          error.response?.data?.message ||
          'Failed to save attendance record.'
        );

        setMessageType(
          'error'
        );

      } finally {

        setSaving(false);

      }

    };

  /* =======================================================
     DELETE
     ======================================================= */

  const deleteAttendance =
    async record => {

      const confirmed =
        window.confirm(
          `Are you sure you want to delete Attendance Record #${record.attendance_id}?`
        );

      if (!confirmed) {
        return;
      }

      setMessage('');

      try {

        const response =
          await api.delete(
            `/attendance/${record.attendance_id}`
          );

        setMessage(
          response.data?.message ||
          `Attendance record #${record.attendance_id} deleted successfully.`
        );

        setMessageType(
          'success'
        );

        await loadAttendance();

      } catch (error) {

        console.error(
          'Delete attendance error:',
          error
        );

        setMessage(
          error.response?.data?.message ||
          'Failed to delete attendance record.'
        );

        setMessageType(
          'error'
        );

      }

    };

  /* =======================================================
     SEARCH + FILTER
     ======================================================= */

  const filteredRecords =
    records.filter(
      record => {

        const query =
          search
            .toLowerCase()
            .trim();

        const matchesSearch =
          String(
            record.attendance_id ||
            ''
          )
            .toLowerCase()
            .includes(query) ||

          String(
            record.student_id ||
            ''
          )
            .toLowerCase()
            .includes(query) ||

          String(
            record.student_name ||
            record.name ||
            ''
          )
            .toLowerCase()
            .includes(query) ||

          String(
            record.status ||
            ''
          )
            .toLowerCase()
            .includes(query) ||

          String(
            record.remarks ||
            ''
          )
            .toLowerCase()
            .includes(query);

        const matchesStatus =
          statusFilter === 'all' ||
          String(
            record.status ||
            ''
          ).toLowerCase() ===
          statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );

      }
    );

  /* =======================================================
     STATISTICS
     ======================================================= */

  const present =
    records.filter(
      record =>
        String(
          record.status || ''
        ).toLowerCase() ===
        'present'
    ).length;

  const absent =
    records.filter(
      record =>
        String(
          record.status || ''
        ).toLowerCase() ===
        'absent'
    ).length;

  const late =
    records.filter(
      record =>
        String(
          record.status || ''
        ).toLowerCase() ===
        'late'
    ).length;

  const attendanceRate =
    records.length
      ? (
          present /
          records.length *
          100
        ).toFixed(1)
      : '0.0';

  return (
    <div className="content">

      <Header
        title="Attendance Records"
        sub="Manage daily student attendance and monitoring."
        action={

          <div
            style={{
              display:
                'flex',
              gap:
                '8px',
              flexWrap:
                'wrap'
            }}
          >

            <button
              type="button"
              className="small"
              onClick={
                loadAttendance
              }
              disabled={
                loading
              }
              style={{
                display:
                  'flex',
                alignItems:
                  'center',
                gap:
                  '6px'
              }}
            >

              <RefreshCw
                size={15}
              />

              {loading
                ? 'Refreshing...'
                : 'Refresh'}

            </button>

            <button
              type="button"
              className="primary small"
              onClick={
                openAddModal
              }
            >
              + Add Attendance
            </button>

          </div>

        }
      />

      {/* MESSAGE */}

      {message && (

        <div
          className="card"
          style={{
            marginBottom:
              '20px',
            padding:
              '13px 16px',
            borderLeft:
              messageType ===
              'error'
                ? '4px solid #dc2626'
                : '4px solid #16a085',
            background:
              messageType ===
              'error'
                ? '#fff5f5'
                : '#f0fdf4'
          }}
        >
          {message}
        </div>

      )}

      {/* FILTERS */}

      <div
        style={{
          display:
            'flex',
          gap:
            '10px',
          flexWrap:
            'wrap',
          marginBottom:
            '20px'
        }}
      >

        <div
          className="search"
          style={{
            flex:
              '1 1 300px',
            minWidth:
              '250px',
            marginBottom:
              0
          }}
        >

          <Search
            size={17}
          />

          <input
            placeholder="Search by attendance ID, student, status or remarks..."
            value={
              search
            }
            onChange={
              event =>
                setSearch(
                  event.target.value
                )
            }
          />

        </div>

        <select
          value={
            statusFilter
          }
          onChange={
            event =>
              setStatusFilter(
                event.target.value
              )
          }
          style={{
            minWidth:
              '150px',
            height:
              '42px',
            padding:
              '8px 12px',
            borderRadius:
              '8px',
            border:
              '1px solid #d9dee7',
            background:
              '#ffffff'
          }}
        >

          <option value="all">
            All Status
          </option>

          <option value="present">
            Present
          </option>

          <option value="absent">
            Absent
          </option>

          <option value="late">
            Late
          </option>

        </select>

      </div>

      {/* SUMMARY */}

      <div
        className="stats four"
        style={{
          marginBottom:
            '20px'
        }}
      >

        <Stat
          icon={CheckCircle2}
          label="Present"
          value={
            present
          }
        />

        <Stat
          icon={X}
          label="Absent"
          value={
            absent
          }
          kind="red"
        />

        <Stat
          icon={CalendarDays}
          label="Late"
          value={
            late
          }
          kind="yellow"
        />

        <Stat
          icon={Activity}
          label="Attendance Rate"
          value={
            `${attendanceRate}%`
          }
        />

      </div>

      {/* TABLE */}

      <Card title="Attendance Records">

        {!filteredRecords.length ? (

          <Empty>

            {records.length
              ? 'No attendance records match your search or filter.'
              : 'No attendance records found in the database.'}

          </Empty>

        ) : (

          <div
            className="tablewrap"
          >

            <table>

              <thead>

                <tr>

                  <th>
                    Attendance ID
                  </th>

                  <th>
                    Student
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Remarks
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredRecords.map(
                  record => (

                    <tr
                      key={
                        record.attendance_id
                      }
                    >

                      <td>
                        #
                        {
                          record.attendance_id
                        }
                      </td>

                      <td>

                        <div>

                          <b>
                            {
                              record.student_name ||
                              record.name ||
                              `Student #${record.student_id}`
                            }
                          </b>

                          <small
                            style={{
                              display:
                                'block',
                              marginTop:
                                '3px'
                            }}
                          >
                            Student ID: #
                            {
                              record.student_id ??
                              '—'
                            }
                          </small>

                        </div>

                      </td>

                      <td>
                        {
                          date(
                            record.attendance_date
                          )
                        }
                      </td>

                      <td>

                        <Badge>
                          {
                            record.status ||
                            '—'
                          }
                        </Badge>

                      </td>

                      <td>
                        {
                          record.remarks ||
                          '—'
                        }
                      </td>

                      <td>

                        <div
                          style={{
                            display:
                              'flex',
                            gap:
                              '7px',
                            flexWrap:
                              'wrap'
                          }}
                        >

                          <button
                            type="button"
                            className="small"
                            onClick={() =>
                              openEditModal(
                                record
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="small"
                            onClick={() =>
                              deleteAttendance(
                                record
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </Card>

      {/* =================================================
          ATTENDANCE MODAL
          ================================================= */}

      {showModal && (

        <div
          onClick={event => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }

          }}
          style={{
            position:
              'fixed',
            inset:
              0,
            background:
              'rgba(15, 23, 42, 0.55)',
            display:
              'flex',
            alignItems:
              'center',
            justifyContent:
              'center',
            padding:
              '20px',
            zIndex:
              9999
          }}
        >

          <div
            style={{
              width:
                '100%',
              maxWidth:
                '650px',
              maxHeight:
                '90vh',
              overflowY:
                'auto',
              background:
                '#ffffff',
              borderRadius:
                '16px',
              boxShadow:
                '0 25px 60px rgba(0,0,0,.20)'
            }}
          >

            {/* HEADER */}

            <div
              style={{
                display:
                  'flex',
                alignItems:
                  'center',
                justifyContent:
                  'space-between',
                padding:
                  '20px 22px',
                borderBottom:
                  '1px solid #e5e7eb'
              }}
            >

              <div>

                <h2
                  style={{
                    margin:
                      0,
                    fontSize:
                      '20px'
                  }}
                >

                  {editingId
                    ? 'Edit Attendance Record'
                    : 'Add Attendance Record'}

                </h2>

                <p
                  style={{
                    margin:
                      '5px 0 0',
                    color:
                      '#6b7280',
                    fontSize:
                      '13px'
                  }}
                >

                  {editingId
                    ? `Update Attendance Record #${editingId}.`
                    : 'Record a student attendance entry.'}

                </p>

              </div>

              <button
                type="button"
                className="small"
                onClick={
                  closeModal
                }
                disabled={
                  saving
                }
                style={{
                  width:
                    '36px',
                  height:
                    '36px',
                  padding:
                    0,
                  display:
                    'flex',
                  alignItems:
                    'center',
                  justifyContent:
                    'center'
                }}
              >

                <X
                  size={18}
                />

              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                saveAttendance
              }
              noValidate
              style={{
                padding:
                  '22px'
              }}
            >

              <div
                style={{
                  display:
                    'grid',
                  gridTemplateColumns:
                    'repeat(2, minmax(0, 1fr))',
                  gap:
                    '16px'
                }}
              >

                {/* STUDENT */}

                <div
                  style={{
                    gridColumn:
                      '1 / -1'
                  }}
                >

                  <label
                    style={{
                      display:
                        'block',
                      marginBottom:
                        '6px',
                      fontWeight:
                        600
                    }}
                  >
                    Student *
                  </label>

                  <select
                    name="student_id"
                    value={
                      form.student_id
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      Boolean(
                        editingId
                      )
                    }
                    style={{
                      width:
                        '100%',
                      height:
                        '42px',
                      padding:
                        '8px 12px',
                      borderRadius:
                        '8px',
                      border:
                        '1px solid #d9dee7',
                      background:
                        '#ffffff'
                    }}
                  >

                    <option value="">
                      Select student
                    </option>

                    {students.map(
                      student => (

                        <option
                          key={
                            student.student_id
                          }
                          value={
                            student.student_id
                          }
                        >
                          #
                          {
                            student.student_id
                          }
                          {' — '}
                          {
                            student.name ||
                            `Student #${student.student_id}`
                          }
                          {' — '}
                          Grade {
                            student.grade_level ||
                            '—'
                          }
                        </option>

                      )
                    )}

                  </select>

                  {!students.length && (

                    <small
                      style={{
                        display:
                          'block',
                        marginTop:
                          '6px',
                        color:
                          '#6b7280'
                      }}
                    >
                      No student records are available.
                    </small>

                  )}

                  {editingId && (

                    <small
                      style={{
                        display:
                          'block',
                        marginTop:
                          '6px',
                        color:
                          '#6b7280'
                      }}
                    >
                      The linked student cannot be changed while editing.
                    </small>

                  )}

                </div>

                {/* DATE */}

                <div>

                  <label
                    style={{
                      display:
                        'block',
                      marginBottom:
                        '6px',
                      fontWeight:
                        600
                    }}
                  >
                    Attendance Date *
                  </label>

                  <input
                    type="date"
                    name="attendance_date"
                    value={
                      form.attendance_date
                    }
                    onChange={
                      handleChange
                    }
                    style={{
                      width:
                        '100%'
                    }}
                  />

                </div>

                {/* STATUS */}

                <div>

                  <label
                    style={{
                      display:
                        'block',
                      marginBottom:
                        '6px',
                      fontWeight:
                        600
                    }}
                  >
                    Status *
                  </label>

                  <select
                    name="status"
                    value={
                      form.status
                    }
                    onChange={
                      handleChange
                    }
                    style={{
                      width:
                        '100%',
                      height:
                        '42px',
                      padding:
                        '8px 12px',
                      borderRadius:
                        '8px',
                      border:
                        '1px solid #d9dee7',
                      background:
                        '#ffffff'
                    }}
                  >

                    <option value="Present">
                      Present
                    </option>

                    <option value="Absent">
                      Absent
                    </option>

                    <option value="Late">
                      Late
                    </option>

                  </select>

                </div>

                {/* REMARKS */}

                <div
                  style={{
                    gridColumn:
                      '1 / -1'
                  }}
                >

                  <label
                    style={{
                      display:
                        'block',
                      marginBottom:
                        '6px',
                      fontWeight:
                        600
                    }}
                  >
                    Remarks
                  </label>

                  <textarea
                    name="remarks"
                    value={
                      form.remarks
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Optional remarks..."
                    rows={4}
                    maxLength={500}
                    style={{
                      width:
                        '100%',
                      resize:
                        'vertical',
                      padding:
                        '10px 12px',
                      borderRadius:
                        '8px',
                      border:
                        '1px solid #d9dee7',
                      fontFamily:
                        'inherit'
                    }}
                  />

                </div>

              </div>

              {/* BUTTONS */}

              <div
                style={{
                  display:
                    'flex',
                  justifyContent:
                    'flex-end',
                  gap:
                    '10px',
                  marginTop:
                    '24px',
                  paddingTop:
                    '18px',
                  borderTop:
                    '1px solid #e5e7eb'
                }}
              >

                <button
                  type="button"
                  className="small"
                  onClick={
                    closeModal
                  }
                  disabled={
                    saving
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary"
                  disabled={
                    saving
                  }
                >

                  {saving
                    ? 'Saving...'
                    : editingId
                    ? 'Save Changes'
                    : 'Create Attendance'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}


/* =========================================================
   DOCUMENTS - CRUD
   ========================================================= */

function Documents() {
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    student_id: '',
    document_name: '',
    status: 'Pending'
  });

  /* =======================================================
     LOAD DOCUMENTS
     ======================================================= */

  const loadDocuments = async () => {
    setLoading(true);

    try {
      const response = await api.get('/documents');

      setRecords(arr(response.data));
    } catch (error) {
      console.error(
        'Load documents error:',
        error
      );

      setMessage(
        error.response?.data?.message ||
        'Failed to load document records.'
      );

      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     LOAD STUDENTS
     ======================================================= */

  const loadStudents = async () => {
    try {
      const response = await api.get('/students');

      setStudents(arr(response.data));
    } catch (error) {
      console.error(
        'Load students error:',
        error
      );
    }
  };

  /* =======================================================
     INITIAL LOAD
     ======================================================= */

  useEffect(() => {
    loadDocuments();
    loadStudents();
  }, []);

  /* =======================================================
     FORM CHANGE
     ======================================================= */

  const handleChange = event => {
    const {
      name,
      value
    } = event.target;

    setForm(previous => ({
      ...previous,
      [name]: value
    }));
  };

  /* =======================================================
     RESET FORM
     ======================================================= */

  const resetForm = () => {
    setForm({
      student_id: '',
      document_name: '',
      status: 'Pending'
    });

    setEditingId(null);
  };

  /* =======================================================
     OPEN ADD MODAL
     ======================================================= */

  const openAddModal = () => {
    resetForm();
    setMessage('');
    setShowModal(true);
  };

  /* =======================================================
     OPEN EDIT MODAL
     ======================================================= */

  const openEditModal = record => {
    setEditingId(record.document_id);

    setForm({
      student_id:
        record.student_id ?? '',

      document_name:
        record.document_name ||
        record.document_type ||
        record.type ||
        '',

      status:
        record.status ||
        'Pending'
    });

    setMessage('');
    setShowModal(true);
  };

  /* =======================================================
     CLOSE MODAL
     ======================================================= */

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    resetForm();
  };

  /* =======================================================
     VALIDATION
     ======================================================= */

  const validateForm = () => {
    const studentId =
      Number(form.student_id);

    const documentName =
      form.document_name.trim();

    const status =
      form.status.trim();

    if (
      !Number.isInteger(studentId) ||
      studentId <= 0
    ) {
      setMessage(
        'Please select a valid student.'
      );

      setMessageType('error');
      return false;
    }

    if (!documentName) {
      setMessage(
        'Document name is required.'
      );

      setMessageType('error');
      return false;
    }

    if (!status) {
      setMessage(
        'Document status is required.'
      );

      setMessageType('error');
      return false;
    }

    return true;
  };

  /* =======================================================
     CREATE / UPDATE
     ======================================================= */

  const saveDocument = async event => {
    event.preventDefault();

    setMessage('');

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const payload = {
        student_id:
          Number(form.student_id),

        document_name:
          form.document_name.trim(),

        status:
          form.status.trim()
      };

      /* CREATE */

      if (!editingId) {
        const response = await api.post(
          '/documents',
          payload
        );

        setMessage(
          response.data?.message ||
          'Document created successfully.'
        );
      }

      /* UPDATE */

      else {
        const response = await api.put(
          `/documents/${editingId}`,
          payload
        );

        setMessage(
          response.data?.message ||
          `Document #${editingId} updated successfully.`
        );
      }

      setMessageType('success');

      setShowModal(false);
      resetForm();

      await loadDocuments();

    } catch (error) {
      console.error(
        'Save document error:',
        error
      );

      setMessage(
        error.response?.data?.message ||
        'Failed to save document.'
      );

      setMessageType('error');

    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     DELETE
     ======================================================= */

  const deleteDocument = async record => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete Document #${record.document_id}?`
      );

    if (!confirmed) {
      return;
    }

    setMessage('');

    try {
      const response = await api.delete(
        `/documents/${record.document_id}`
      );

      setMessage(
        response.data?.message ||
        `Document #${record.document_id} deleted successfully.`
      );

      setMessageType('success');

      await loadDocuments();

    } catch (error) {
      console.error(
        'Delete document error:',
        error
      );

      setMessage(
        error.response?.data?.message ||
        'Failed to delete document.'
      );

      setMessageType('error');
    }
  };

  /* =======================================================
     SEARCH + FILTER
     ======================================================= */

  const filteredRecords =
    records.filter(record => {
      const query =
        search
          .toLowerCase()
          .trim();

      const matchesSearch =
        String(
          record.document_id || ''
        )
          .toLowerCase()
          .includes(query) ||

        String(
          record.student_id || ''
        )
          .toLowerCase()
          .includes(query) ||

        String(
          record.student_name ||
          record.name ||
          ''
        )
          .toLowerCase()
          .includes(query) ||

        String(
          record.document_name ||
          record.document_type ||
          record.type ||
          ''
        )
          .toLowerCase()
          .includes(query) ||

        String(
          record.status || ''
        )
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === 'all' ||
        String(
          record.status || ''
        ).toLowerCase() ===
          statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  /* =======================================================
     STATISTICS
     ======================================================= */

  const totalDocuments =
    records.length;

  const pendingDocuments =
    records.filter(
      record =>
        String(
          record.status || ''
        ).toLowerCase() ===
        'pending'
    ).length;

  const approvedDocuments =
    records.filter(
      record =>
        String(
          record.status || ''
        ).toLowerCase() ===
        'approved'
    ).length;

  const completedDocuments =
    records.filter(
      record =>
        String(
          record.status || ''
        ).toLowerCase() ===
        'completed'
    ).length;

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="content">

      <Header
        title="Document Requests"
        sub="Manage official school document requests."
        action={
          <div
            style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap'
            }}
          >

            <button
              type="button"
              className="small"
              onClick={loadDocuments}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >

              <RefreshCw size={15} />

              {loading
                ? 'Refreshing...'
                : 'Refresh'}

            </button>

            <button
              type="button"
              className="primary small"
              onClick={openAddModal}
            >
              + Add Request
            </button>

          </div>
        }
      />

      {/* ===================================================
          MESSAGE
          =================================================== */}

      {message && (
        <div
          className="card"
          style={{
            marginBottom: '20px',
            padding: '13px 16px',
            borderLeft:
              messageType === 'error'
                ? '4px solid #dc2626'
                : '4px solid #16a085',
            background:
              messageType === 'error'
                ? '#fff5f5'
                : '#f0fdf4'
          }}
        >
          {message}
        </div>
      )}

      {/* ===================================================
          FILTERS
          =================================================== */}

      <div
        style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          marginBottom: '20px'
        }}
      >

        <div
          className="search"
          style={{
            flex: '1 1 300px',
            minWidth: '250px',
            marginBottom: 0
          }}
        >

          <Search size={17} />

          <input
            placeholder="Search by document ID, student, document name or status..."
            value={search}
            onChange={event =>
              setSearch(
                event.target.value
              )
            }
          />

        </div>

        <select
          value={statusFilter}
          onChange={event =>
            setStatusFilter(
              event.target.value
            )
          }
          style={{
            minWidth: '150px',
            height: '42px',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #d9dee7',
            background: '#ffffff'
          }}
        >

          <option value="all">
            All Status
          </option>

          <option value="pending">
            Pending
          </option>

          <option value="processing">
            Processing
          </option>

          <option value="approved">
            Approved
          </option>

          <option value="completed">
            Completed
          </option>

          <option value="rejected">
            Rejected
          </option>

        </select>

      </div>

      {/* ===================================================
          SUMMARY
          =================================================== */}

      <div
        className="stats four"
        style={{
          marginBottom: '20px'
        }}
      >

        <Stat
          icon={FileText}
          label="Total Requests"
          value={totalDocuments}
        />

        <Stat
          icon={Activity}
          label="Pending"
          value={pendingDocuments}
          kind="yellow"
        />

        <Stat
          icon={CheckCircle2}
          label="Approved"
          value={approvedDocuments}
        />

        <Stat
          icon={ClipboardList}
          label="Completed"
          value={completedDocuments}
          kind="blue"
        />

      </div>

      {/* ===================================================
          TABLE
          =================================================== */}

      <Card title="Document Request Records">

        {!filteredRecords.length ? (

          <Empty>
            {records.length
              ? 'No document requests match your search or filter.'
              : 'No document requests found in the database.'}
          </Empty>

        ) : (

          <div className="tablewrap">

            <table>

              <thead>

                <tr>

                  <th>
                    Document ID
                  </th>

                  <th>
                    Student
                  </th>

                  <th>
                    Document Name
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Requested
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredRecords.map(
                  record => (

                    <tr
                      key={
                        record.document_id
                      }
                    >

                      <td>
                        #
                        {
                          record.document_id
                        }
                      </td>

                      <td>

                        <div>

                          <b>
                            {
                              record.student_name ||
                              record.name ||
                              `Student #${record.student_id}`
                            }
                          </b>

                          <small
                            style={{
                              display:
                                'block',
                              marginTop:
                                '3px'
                            }}
                          >
                            Student ID: #
                            {
                              record.student_id ??
                              '—'
                            }
                          </small>

                        </div>

                      </td>

                      <td>
                        {
                          record.document_name ||
                          record.document_type ||
                          record.type ||
                          '—'
                        }
                      </td>

                      <td>

                        <Badge>
                          {
                            record.status ||
                            '—'
                          }
                        </Badge>

                      </td>

                      <td>
                        {
                          date(
                            record.created_at ||
                            record.requested_at
                          )
                        }
                      </td>

                      <td>

                        <div
                          style={{
                            display:
                              'flex',
                            gap:
                              '7px',
                            flexWrap:
                              'wrap'
                          }}
                        >

                          <button
                            type="button"
                            className="small"
                            onClick={() =>
                              openEditModal(
                                record
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="small"
                            onClick={() =>
                              deleteDocument(
                                record
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </Card>

      {/* ===================================================
          ADD / EDIT MODAL
          =================================================== */}

      {showModal && (

        <div
          onClick={event => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }

          }}
          style={{
            position: 'fixed',
            inset: 0,
            background:
              'rgba(15, 23, 42, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 9999
          }}
        >

          <div
            style={{
              width: '100%',
              maxWidth: '650px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#ffffff',
              borderRadius: '16px',
              boxShadow:
                '0 25px 60px rgba(0,0,0,.20)'
            }}
          >

            {/* MODAL HEADER */}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 22px',
                borderBottom:
                  '1px solid #e5e7eb'
              }}
            >

              <div>

                <h2
                  style={{
                    margin: 0,
                    fontSize: '20px'
                  }}
                >
                  {editingId
                    ? 'Edit Document Request'
                    : 'Add Document Request'}
                </h2>

                <p
                  style={{
                    margin:
                      '5px 0 0',
                    color:
                      '#6b7280',
                    fontSize:
                      '13px'
                  }}
                >
                  {editingId
                    ? `Update Document #${editingId}.`
                    : 'Create a new document request for a student.'}
                </p>

              </div>

              <button
                type="button"
                className="small"
                onClick={closeModal}
                disabled={saving}
                style={{
                  width: '36px',
                  height: '36px',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >

                <X size={18} />

              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={saveDocument}
              noValidate
              style={{
                padding: '22px'
              }}
            >

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    '1fr',
                  gap: '16px'
                }}
              >

                {/* STUDENT */}

                <div>

                  <label
                    style={{
                      display:
                        'block',
                      marginBottom:
                        '6px',
                      fontWeight:
                        600
                    }}
                  >
                    Student *
                  </label>

                  <select
                    name="student_id"
                    value={
                      form.student_id
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      Boolean(
                        editingId
                      )
                    }
                    style={{
                      width: '100%',
                      height: '42px',
                      padding:
                        '8px 12px',
                      borderRadius:
                        '8px',
                      border:
                        '1px solid #d9dee7',
                      background:
                        '#ffffff'
                    }}
                  >

                    <option value="">
                      Select student
                    </option>

                    {students.map(
                      student => (

                        <option
                          key={
                            student.student_id
                          }
                          value={
                            student.student_id
                          }
                        >
                          #
                          {
                            student.student_id
                          }
                          {' — '}
                          {
                            student.name ||
                            `Student #${student.student_id}`
                          }
                          {' — Grade '}
                          {
                            student.grade_level ||
                            '—'
                          }
                        </option>

                      )
                    )}

                  </select>

                  {!availableStudents.length && (
                    <small
                      style={{
                        display:
                          'block',
                        marginTop:
                          '6px',
                        color:
                          '#6b7280'
                      }}
                    >
                      No student records are available.
                    </small>
                  )}

                  {editingId && (
                    <small
                      style={{
                        display:
                          'block',
                        marginTop:
                          '6px',
                        color:
                          '#6b7280'
                      }}
                    >
                      The linked student cannot be changed while editing.
                    </small>
                  )}

                </div>

                {/* DOCUMENT NAME */}

                <div>

                  <label
                    style={{
                      display:
                        'block',
                      marginBottom:
                        '6px',
                      fontWeight:
                        600
                    }}
                  >
                    Document Name *
                  </label>

                  <select
                    name="document_name"
                    value={
                      form.document_name
                    }
                    onChange={
                      handleChange
                    }
                    style={{
                      width: '100%',
                      height: '42px',
                      padding:
                        '8px 12px',
                      borderRadius:
                        '8px',
                      border:
                        '1px solid #d9dee7',
                      background:
                        '#ffffff'
                    }}
                  >

                    <option value="">
                      Select document
                    </option>

                    <option value="Certificate of Enrollment">
                      Certificate of Enrollment
                    </option>

                    <option value="Report Card">
                      Report Card
                    </option>

                    <option value="Good Moral Certificate">
                      Good Moral Certificate
                    </option>

                    <option value="Transcript of Records">
                      Transcript of Records
                    </option>

                    <option value="Certificate of Completion">
                      Certificate of Completion
                    </option>

                    <option value="School Record">
                      School Record
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>

                {/* STATUS */}

                <div>

                  <label
                    style={{
                      display:
                        'block',
                      marginBottom:
                        '6px',
                      fontWeight:
                        600
                    }}
                  >
                    Status *
                  </label>

                  <select
                    name="status"
                    value={
                      form.status
                    }
                    onChange={
                      handleChange
                    }
                    style={{
                      width: '100%',
                      height: '42px',
                      padding:
                        '8px 12px',
                      borderRadius:
                        '8px',
                      border:
                        '1px solid #d9dee7',
                      background:
                        '#ffffff'
                    }}
                  >

                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Processing">
                      Processing
                    </option>

                    <option value="Approved">
                      Approved
                    </option>

                    <option value="Completed">
                      Completed
                    </option>

                    <option value="Rejected">
                      Rejected
                    </option>

                  </select>

                </div>

              </div>

              {/* BUTTONS */}

              <div
                style={{
                  display:
                    'flex',
                  justifyContent:
                    'flex-end',
                  gap:
                    '10px',
                  marginTop:
                    '24px',
                  paddingTop:
                    '18px',
                  borderTop:
                    '1px solid #e5e7eb'
                }}
              >

                <button
                  type="button"
                  className="small"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary"
                  disabled={saving}
                >

                  {saving
                    ? 'Saving...'
                    : editingId
                    ? 'Save Changes'
                    : 'Create Request'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

/* =========================================================
   COMMUNICATIONS
   ========================================================= */

function Communications({
  role
}) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);

  const [form, setForm] = useState({
    receiver_id: '',
    subject: '',
    message: ''
  });

  const loadCommunications = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await api.get(
        '/communications',
        {
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache'
          }
        }
      );

      setRecords(
        arr(response.data)
      );
    } catch (error) {
      console.error(
        'Load communications error:',
        error
      );

      setMessage(
        error.response?.data?.message ||
        'Failed to load communications.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommunications();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    setSending(true);
    setMessage('');

    try {
      const savedUser =
        localStorage.getItem('user');

      const currentUser =
        savedUser
          ? JSON.parse(savedUser)
          : null;

      if (!currentUser?.id) {
        setMessage(
          'Logged-in user information was not found.'
        );
        return;
      }

      if (!form.receiver_id) {
        setMessage(
          'Please enter the receiver user ID.'
        );
        return;
      }

      if (!form.message.trim()) {
        setMessage(
          'Please enter a message.'
        );
        return;
      }

      await api.post(
        '/communications',
        {
          sender_id: Number(currentUser.id),
          receiver_id: Number(form.receiver_id),
          subject:
            form.subject.trim() || null,
          message:
            form.message.trim()
        }
      );

      setForm({
        receiver_id: '',
        subject: '',
        message: ''
      });

      setShowNewMessage(false);

      await loadCommunications();

setMessage(
  'Message sent successfully.'
);

    } catch (error) {
      console.error(
        'Send communication error:',
        error
      );

      setMessage(
        error.response?.data?.message ||
        'Failed to send message.'
      );
    } finally {
      setSending(false);
    }
  };


const handleUpdateStatus = async (
  communicationId,
  currentStatus
) => {
  const newStatus = window.prompt(
    'Enter new status:',
    currentStatus || 'New'
  );

  if (!newStatus) {
    return;
  }

  try {
    setMessage('');

    await api.put(
      `/communications/${communicationId}`,
      {
        status: newStatus
      }
    );

    await loadCommunications();

    setMessage(
      'Message status updated successfully.'
    );
  } catch (error) {
    console.error(
      'Update communication error:',
      error
    );

    setMessage(
      error.response?.data?.message ||
      'Failed to update message status.'
    );
  }
};

const handleDeleteMessage = async (
  communicationId
) => {
  const confirmed = window.confirm(
    `Are you sure you want to delete communication #${communicationId}?`
  );

  if (!confirmed) {
    return;
  }

  try {
    setMessage('');

    await api.delete(
      `/communications/${communicationId}`
    );

    await loadCommunications();

    setMessage(
      'Message deleted successfully.'
    );
  } catch (error) {
    console.error(
      'Delete communication error:',
      error
    );

    setMessage(
      error.response?.data?.message ||
      'Failed to delete message.'
    );
  }
};

  return (
    <div className="content">

      <Header
        title="Communications"
        sub="View system communications and messages."
        action={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap'
            }}
          >

            <button
              type="button"
              className="small"
              onClick={loadCommunications}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={15} />

              {loading
                ? 'Refreshing...'
                : 'Refresh'}
            </button>

            <button
              type="button"
              className="primary small"
              onClick={() => {
                setMessage('');
                setShowNewMessage(true);
              }}
            >
              + New Message
            </button>

          </div>
        }
      />

      {message && (
        <div
          className="card"
          style={{
            marginBottom: '20px',
            padding: '13px 16px',
            borderLeft:
              '4px solid #2563eb',
            background: '#eff6ff',
            color: '#1e40af'
          }}
        >
          {message}
        </div>
      )}

      <Card title="Communication Records">

        {loading ? (
          <Empty>
            Loading communications...
          </Empty>
        ) : records.length ? (

          <div className="tablewrap">
            <table>

              <thead>
                <tr>
                  <th>Communication ID</th>
                  <th>Sender ID</th>
                  <th>Receiver ID</th>
                  <th>Subject</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {records.map(record => (

                  <tr
                    key={
                      record.communication_id
                    }
                  >

                    <td>
                      <b>
                        #{record.communication_id}
                      </b>
                    </td>

                    <td>
                      {record.sender_id
                        ? `#${record.sender_id}`
                        : '—'}
                    </td>

                    <td>
                      {record.receiver_id
                        ? `#${record.receiver_id}`
                        : '—'}
                    </td>

                    <td>
                      {record.subject ||
                        'School Announcement'}
                    </td>

                    <td
                      style={{
                        whiteSpace:
                          'normal',
                        minWidth: '260px'
                      }}
                    >
                      {record.message ||
                        '—'}
                    </td>

                    <td>
                      <Badge>
                        {record.status ||
                          'New'}
                      </Badge>
                    </td>

                   <td>
  {date(
    record.created_at
  )}
</td>

<td>
  <div
    style={{
      display: 'flex',
      gap: '6px',
      flexWrap: 'wrap'
    }}
  >
    {(role === 'admin' ||
      role === 'principal' ||
      role === 'teacher') && (
      <button
        type="button"
        className="small"
        onClick={() =>
          handleUpdateStatus(
            record.communication_id,
            record.status
          )
        }
      >
        Update
      </button>
    )}

    {role === 'admin' && (
      <button
        type="button"
        className="small"
        onClick={() =>
          handleDeleteMessage(
            record.communication_id
          )
        }
      >
        Delete
      </button>
    )}
  </div>
</td>

                  </tr>

                ))}

              </tbody>

            </table>
          </div>

        ) : (

          <Empty>
            No communication records found.
          </Empty>

        )}

      </Card>


      {/* =====================================================
          NEW MESSAGE MODAL
      ===================================================== */}

      {showNewMessage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >

          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#fff',
              borderRadius: '14px',
              padding: '24px'
            }}
          >

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}
            >

              <div>
                <h2
                  style={{
                    margin: 0,
                    marginBottom: '5px'
                  }}
                >
                  New Message
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: '#64748b'
                  }}
                >
                  Send a message to another EduTrack account.
                </p>
              </div>

              <button
                type="button"
                className="small"
                onClick={() =>
                  setShowNewMessage(false)
                }
                disabled={sending}
              >
                ✕
              </button>

            </div>


            <form
              onSubmit={handleSendMessage}
            >

              <div
                style={{
                  marginBottom: '16px'
                }}
              >

                <label>
                  Your User ID
                </label>

                <input
                  type="text"
                  value={
                    (() => {
                      try {
                        const savedUser =
                          localStorage.getItem('user');

                        const currentUser =
                          savedUser
                            ? JSON.parse(savedUser)
                            : null;

                        return currentUser?.id
                          ? `User #${currentUser.id}`
                          : '';
                      } catch {
                        return '';
                      }
                    })()
                  }
                  disabled
                  style={{
                    width: '100%',
                    marginTop: '6px'
                  }}
                />

              </div>


              <div
                style={{
                  marginBottom: '16px'
                }}
              >

                <label>
                  Receiver User ID
                </label>

                <input
                  type="number"
                  min="1"
                  placeholder="Example: 2"
                  value={
                    form.receiver_id
                  }
                  onChange={e =>
                    setForm({
                      ...form,
                      receiver_id:
                        e.target.value
                    })
                  }
                  required
                  style={{
                    width: '100%',
                    marginTop: '6px'
                  }}
                />

              </div>


              <div
                style={{
                  marginBottom: '16px'
                }}
              >

                <label>
                  Subject
                </label>

                <input
                  type="text"
                  placeholder="Enter message subject"
                  value={
                    form.subject
                  }
                  onChange={e =>
                    setForm({
                      ...form,
                      subject:
                        e.target.value
                    })
                  }
                  style={{
                    width: '100%',
                    marginTop: '6px'
                  }}
                />

              </div>


              <div
                style={{
                  marginBottom: '20px'
                }}
              >

                <label>
                  Message
                </label>

                <textarea
                  rows="6"
                  placeholder="Write your message here..."
                  value={
                    form.message
                  }
                  onChange={e =>
                    setForm({
                      ...form,
                      message:
                        e.target.value
                    })
                  }
                  required
                  style={{
                    width: '100%',
                    marginTop: '6px',
                    resize: 'vertical'
                  }}
                />

              </div>


              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px'
                }}
              >

                <button
                  type="button"
                  className="small"
                  onClick={() =>
                    setShowNewMessage(false)
                  }
                  disabled={sending}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary"
                  disabled={sending}
                >
                  {sending
                    ? 'Sending...'
                    : 'Send Message'}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

/* =========================================================
   ANNOUNCEMENTS
   ========================================================= */

function Announcements() {
  const [data, setData] =
    useState([]);

  useEffect(() => {

    api
      .get('/communications')
      .then(response =>
        setData(
          arr(
            response.data
          )
        )
      )
      .catch(() => {});

  }, []);

  return (
    <div className="content">

      <Header
        title="Announcements"
        sub="School announcements and communication."
      />

      <div className="cards3">

        {data.map(item => (

          <div
            className="announcement-card"
            key={
              item.communication_id
            }
          >

            <Badge>
              {
                item.status ||
                'New'
              }
            </Badge>

            <h3>
              {
                item.subject ||
                'School Announcement'
              }
            </h3>

            <p>
              {item.message}
            </p>

            <small>
              {
                date(
                  item.created_at
                )
              }
            </small>

          </div>

        ))}

      </div>

      {!data.length && (
        <Empty />
      )}

    </div>
  );
}

/* =========================================================
   NOTIFICATIONS
   ========================================================= */

function Notifications() {
  const [data, setData] =
    useState([]);

  useEffect(() => {

    api
      .get('/risk-alerts')
      .then(response =>
        setData(
          arr(
            response.data
          )
        )
      )
      .catch(() => {});

  }, []);

  return (
    <div className="content">

      <Header
        title="Notifications & Alerts"
        sub="Stay updated on the student's academic journey."
      />

      <Card>

        {data.map(alert => (

          <div
            className="alert"
            key={
              alert.alert_id
            }
          >

            <div className="notif">

              <AlertTriangle
                size={18}
              />

            </div>

            <div>

              <b>
                {alert.alert_type}
              </b>

              <small>
                {alert.description}
              </small>

            </div>

            <Badge>
              {
                alert.severity ||
                alert.status
              }
            </Badge>

            <small>
              {
                date(
                  alert.created_at
                )
              }
            </small>

          </div>

        ))}

        {!data.length && (
          <Empty />
        )}

      </Card>

    </div>
  );
}

/* =========================================================
   USER MANAGEMENT
   ========================================================= */

function UsersPage() {
  const [users, setUsers] =
    useState([]);

  const [search, setSearch] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState('');

  const [messageType, setMessageType] =
    useState('success');

  const [showModal, setShowModal] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [form, setForm] =
    useState({
      name: '',
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      role: 'student'
    });

  const loadUsers = async () => {

    setLoading(true);

    try {

      const response =
        await api.get('/users');

      setUsers(
        arr(
          response.data
        )
      );

    } catch (error) {

      console.error(
        'Load users error:',
        error
      );

      setMessage(
        error.response?.data?.message ||
        'Failed to load users.'
      );

      setMessageType(
        'error'
      );

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {

    loadUsers();

  }, []);

  const handleChange = event => {

    const {
      name,
      value
    } = event.target;

    setForm(
      previous => ({
        ...previous,
        [name]: value
      })
    );

  };

  const resetForm = () => {

    setForm({
      name: '',
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      role: 'student'
    });

    setEditingId(null);

  };

  const openAddModal = () => {

    resetForm();

    setMessage('');

    setShowModal(true);

  };

  const openEditModal = user => {

    setEditingId(
      user.id
    );

    setForm({
      name:
        user.name || '',
      email:
        user.email || '',
      password: '',
      first_name:
        user.first_name || '',
      last_name:
        user.last_name || '',
      role:
        user.role || 'student'
    });

    setMessage('');

    setShowModal(true);

  };

  const closeModal = () => {

    if (saving) {
      return;
    }

    setShowModal(false);

    resetForm();

  };

  const validateForm = () => {

    const name =
      form.name.trim();

    const email =
      form.email.trim();

    const password =
      form.password.trim();

    if (!name) {

      setMessage(
        'Name is required.'
      );

      setMessageType(
        'error'
      );

      return false;
    }

    if (!email) {

      setMessage(
        'Email is required.'
      );

      setMessageType(
        'error'
      );

      return false;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(
        email
      )
    ) {

      setMessage(
        'Please enter a valid email address.'
      );

      setMessageType(
        'error'
      );

      return false;
    }

    if (
      !editingId &&
      !password
    ) {

      setMessage(
        'Password is required when creating a user.'
      );

      setMessageType(
        'error'
      );

      return false;
    }

    if (
      password &&
      password.length < 6
    ) {

      setMessage(
        'Password must be at least 6 characters.'
      );

      setMessageType(
        'error'
      );

      return false;
    }

    if (!form.role) {

      setMessage(
        'Please select a user role.'
      );

      setMessageType(
        'error'
      );

      return false;
    }

    return true;
  };

  const saveUser = async event => {

    event.preventDefault();

    setMessage('');

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {

      const payload = {
        name:
          form.name.trim(),

        email:
          form.email.trim(),

        first_name:
          form.first_name.trim(),

        last_name:
          form.last_name.trim(),

        role:
          form.role
      };

      if (!editingId) {

        payload.password =
          form.password.trim();

        const response =
          await api.post(
            '/users',
            payload
          );

        setMessage(
          response.data?.message ||
          'User created successfully.'
        );

      } else {

        const password =
          form.password.trim();

        if (password) {

          payload.password =
            password;

        }

        const response =
          await api.put(
            `/users/${editingId}`,
            payload
          );

        setMessage(
          response.data?.message ||
          `User #${editingId} updated successfully.`
        );

      }

      setMessageType(
        'success'
      );

      setShowModal(false);

      resetForm();

      await loadUsers();

    } catch (error) {

      console.error(
        'Save user error:',
        error
      );

      setMessage(
        error.response?.data?.message ||
        'Failed to save user.'
      );

      setMessageType(
        'error'
      );

    } finally {

      setSaving(false);

    }
  };

  const deleteUser = async user => {

    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${
          user.name ||
          `User #${user.id}`
        }?`
      );

    if (!confirmed) {
      return;
    }

    setMessage('');

    try {

      const response =
        await api.delete(
          `/users/${user.id}`
        );

      setMessage(
        response.data?.message ||
        `User #${user.id} deleted successfully.`
      );

      setMessageType(
        'success'
      );

      await loadUsers();

    } catch (error) {

      console.error(
        'Delete user error:',
        error
      );

      setMessage(
        error.response?.data?.message ||
        'Failed to delete user.'
      );

      setMessageType(
        'error'
      );

    }
  };

  const filteredUsers =
    users.filter(user => {

      const query =
        search
          .toLowerCase()
          .trim();

      return (
        String(
          user.id || ''
        )
          .toLowerCase()
          .includes(query) ||

        String(
          user.name || ''
        )
          .toLowerCase()
          .includes(query) ||

        String(
          user.email || ''
        )
          .toLowerCase()
          .includes(query) ||

        String(
          user.role || ''
        )
          .toLowerCase()
          .includes(query)
      );

    });

  const roleLabel = role => {

    const names = {
      admin:
        'System Administrator',
      principal:
        'School Principal',
      department_head:
        'Department Head',
      registrar:
        'Registrar',
      teacher:
        'Teacher',
      student:
        'Student',
      parent:
        'Parent'
    };

    return (
      names[role] ||
      role ||
      '—'
    );
  };

  return (
    <div className="content">

      <Header
        title="User Management"
        sub="Manage all system users, roles and permissions."
        action={

          <div
            style={{
              display:
                'flex',
              gap:
                '8px',
              flexWrap:
                'wrap'
            }}
          >

            <button
              type="button"
              className="small"
              onClick={
                loadUsers
              }
              disabled={
                loading
              }
              style={{
                display:
                  'flex',
                alignItems:
                  'center',
                gap:
                  '6px'
              }}
            >

              <RefreshCw
                size={15}
              />

              {loading
                ? 'Refreshing...'
                : 'Refresh'}

            </button>

            <button
              type="button"
              className="primary small"
              onClick={
                openAddModal
              }
            >
              + Add User
            </button>

          </div>
        }
      />

      {message && (

        <div
          className="card"
          style={{
            marginBottom:
              '20px',
            padding:
              '13px 16px',
            borderLeft:
              messageType ===
              'error'
                ? '4px solid #dc2626'
                : '4px solid #16a085',
            background:
              messageType ===
              'error'
                ? '#fff5f5'
                : '#f0fdf4'
          }}
        >
          {message}
        </div>

      )}

      <div
        className="search"
        style={{
          marginBottom:
            '20px'
        }}
      >

        <Search
          size={17}
        />

        <input
          placeholder="Search by ID, name, email or role..."
          value={
            search
          }
          onChange={
            event =>
              setSearch(
                event.target.value
              )
          }
        />

      </div>

      <div
        className="stats three"
        style={{
          marginBottom:
            '20px'
        }}
      >

        <Stat
          icon={Users}
          label="Total Users"
          value={
            users.length
          }
        />

        <Stat
          icon={CheckCircle2}
          label="Displayed"
          value={
            filteredUsers.length
          }
          kind="blue"
        />

        <Stat
          icon={ShieldCheck}
          label="Administrators"
          value={
            users.filter(
              user =>
                user.role ===
                'admin'
            ).length
          }
          kind="yellow"
        />

      </div>

      <Card title="System Users">

        {!filteredUsers.length ? (

          <Empty>

            {users.length
              ? 'No users match your search.'
              : 'No users found in the database.'}

          </Empty>

        ) : (

          <div
            className="tablewrap"
          >

            <table>

              <thead>

                <tr>

                  <th>
                    ID
                  </th>

                  <th>
                    Name
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Role
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredUsers.map(
                  user => (

                    <tr
                      key={
                        user.id
                      }
                    >

                      <td>
                        #
                        {user.id}
                      </td>

                      <td>

                        <div>

                          <b>
                            {
                              user.name ||
                              '—'
                            }
                          </b>

                          {(
                            user.first_name ||
                            user.last_name
                          ) && (

                            <small
                              style={{
                                display:
                                  'block',
                                marginTop:
                                  '3px'
                              }}
                            >
                              {[
                                user.first_name,
                                user.last_name
                              ]
                                .filter(
                                  Boolean
                                )
                                .join(
                                  ' '
                                )}
                            </small>

                          )}

                        </div>

                      </td>

                      <td>
                        {
                          user.email ||
                          '—'
                        }
                      </td>

                      <td>

                        <Badge>
                          {
                            roleLabel(
                              user.role
                            )
                          }
                        </Badge>

                      </td>

                      <td>

                        <Badge>
                          Active
                        </Badge>

                      </td>

                      <td>

                        <div
                          style={{
                            display:
                              'flex',
                            gap:
                              '7px',
                            flexWrap:
                              'wrap'
                          }}
                        >

                          <button
                            type="button"
                            className="small"
                            onClick={() =>
                              openEditModal(
                                user
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="small"
                            onClick={() =>
                              deleteUser(
                                user
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </Card>

      {showModal && (

        <div
          onClick={event => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }

          }}
          style={{
            position:
              'fixed',
            inset:
              0,
            background:
              'rgba(15, 23, 42, 0.55)',
            display:
              'flex',
            alignItems:
              'center',
            justifyContent:
              'center',
            padding:
              '20px',
            zIndex:
              9999
          }}
        >

          <div
            style={{
              width:
                '100%',
              maxWidth:
                '680px',
              maxHeight:
                '90vh',
              overflowY:
                'auto',
              background:
                '#ffffff',
              borderRadius:
                '16px',
              boxShadow:
                '0 25px 60px rgba(0,0,0,.20)'
            }}
          >

            <div
              style={{
                display:
                  'flex',
                alignItems:
                  'center',
                justifyContent:
                  'space-between',
                padding:
                  '20px 22px',
                borderBottom:
                  '1px solid #e5e7eb'
              }}
            >

              <div>

                <h2
                  style={{
                    margin:
                      0,
                    fontSize:
                      '20px'
                  }}
                >
                  {editingId
                    ? 'Edit User'
                    : 'Add New User'}
                </h2>

                <p
                  style={{
                    margin:
                      '5px 0 0',
                    color:
                      '#6b7280',
                    fontSize:
                      '13px'
                  }}
                >
                  {editingId
                    ? `Update information for User #${editingId}.`
                    : 'Create a new EduTrack system account.'}
                </p>

              </div>

              <button
                type="button"
                className="small"
                onClick={
                  closeModal
                }
                disabled={
                  saving
                }
                style={{
                  width:
                    '36px',
                  height:
                    '36px',
                  padding:
                    0,
                  display:
                    'flex',
                  alignItems:
                    'center',
                  justifyContent:
                    'center'
                }}
              >

                <X
                  size={18}
                />

              </button>

            </div>

            <form
              onSubmit={
                saveUser
              }
              noValidate
              style={{
                padding:
                  '22px'
              }}
            >

              <div
                style={{
                  display:
                    'grid',
                  gridTemplateColumns:
                    'repeat(2, minmax(0, 1fr))',
                  gap:
                    '16px'
                }}
              >

                <div
                  style={{
                    gridColumn:
                      '1 / -1'
                  }}
                >

                  <label
                    style={{
                      display:
                        'block',
                      marginBottom:
                        '6px',
                      fontWeight:
                        600
                    }}
                  >
                    Display Name *
                  </label>

                  <input
                    name="name"
                    value={
                      form.name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter full display name"
                    style={{
                      width:
                        '100%'
                    }}
                  />

                </div>

                <div>

                  <label
                    style={{
                      display:
                        'block',
                      marginBottom:
                        '6px',
                      fontWeight:
                        600
                    }}
                  >
                    First Name
                  </label>

                  <input
                    name="first_name"
                    value={
                      form.first_name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="First name"
                    style={{
                      width:
                        '100%'
                    }}
                  />

                </div>

                <div>

                  <label
                    style={{
                      display:
                        'block',
                      marginBottom:
                        '6px',
                      fontWeight:
                        600
                    }}
                  >
                    Last Name
                  </label>

                  <input
                    name="last_name"
                    value={
                      form.last_name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Last name"
                    style={{
                      width:
                        '100%'
                    }}
                  />

                </div>

                <div
                  style={{
                    gridColumn:
                      '1 / -1'
                  }}
                >

                  <label
                    style={{
                      display:
                        'block',
                      marginBottom:
                        '6px',
                      fontWeight:
                        600
                    }}
                  >
                    Email Address *
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={
                      form.email
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="example@email.com"
                    style={{
                      width:
                        '100%'
                    }}
                  />

                </div>

                <div
                  style={{
                    gridColumn:
                      '1 / -1'
                  }}
                >

                  <label
                    style={{
                      display:
                        'block',
                      marginBottom:
                        '6px',
                      fontWeight:
                        600
                    }}
                  >
                    Password
                    {!editingId &&
                      ' *'}
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={
                      form.password
                    }
                    onChange={
                      handleChange
                    }
                    placeholder={
                      editingId
                        ? 'Leave blank to keep current password'
                        : 'Enter password'
                    }
                    style={{
                      width:
                        '100%'
                    }}
                  />

                  {editingId && (

                    <small
                      style={{
                        display:
                          'block',
                        marginTop:
                          '6px',
                        color:
                          '#6b7280'
                      }}
                    >
                      Leave this blank if you do not want
                      to change the current password.
                    </small>

                  )}

                </div>

                <div
                  style={{
                    gridColumn:
                      '1 / -1'
                  }}
                >

                  <label
                    style={{
                      display:
                        'block',
                      marginBottom:
                        '6px',
                      fontWeight:
                        600
                    }}
                  >
                    User Role *
                  </label>

                  <select
                    name="role"
                    value={
                      form.role
                    }
                    onChange={
                      handleChange
                    }
                    style={{
                      width:
                        '100%',
                      height:
                        '42px',
                      padding:
                        '8px 12px',
                      borderRadius:
                        '8px',
                      border:
                        '1px solid #d9dee7',
                      background:
                        '#ffffff'
                    }}
                  >

                    <option value="admin">
                      System Administrator
                    </option>

                    <option value="principal">
                      School Principal
                    </option>

                    <option value="department_head">
                      Department Head
                    </option>

                    <option value="registrar">
                      Registrar
                    </option>

                    <option value="teacher">
                      Teacher
                    </option>

                    <option value="student">
                      Student
                    </option>

                    <option value="parent">
                      Parent
                    </option>

                  </select>

                </div>

              </div>

              <div
                style={{
                  display:
                    'flex',
                  justifyContent:
                    'flex-end',
                  gap:
                    '10px',
                  marginTop:
                    '24px',
                  paddingTop:
                    '18px',
                  borderTop:
                    '1px solid #e5e7eb'
                }}
              >

                <button
                  type="button"
                  className="small"
                  onClick={
                    closeModal
                  }
                  disabled={
                    saving
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary"
                  disabled={
                    saving
                  }
                >
                  {saving
                    ? 'Saving...'
                    : editingId
                    ? 'Save Changes'
                    : 'Create User'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

/* =========================================================
   ACADEMIC AREAS
   ========================================================= */

function Areas() {
  const [areas, setAreas] = useState([]);
  const [showAddArea, setShowAddArea] = useState(false);
  const [newArea, setNewArea] = useState('');
  const [loadingAreas, setLoadingAreas] = useState(false);


  // =========================================
  // LOAD ACADEMIC AREAS FROM DATABASE
  // =========================================
  const loadAreas = async () => {
    setLoadingAreas(true);

    try {
      const response = await api.get(
        '/academic-areas'
      );

      setAreas(
        arr(response.data).map(area => ({
          area_id: area.area_id,
          area_name: area.area_name,
          description:
            area.description || '',
          created_at:
            area.created_at
        }))
      );

    } catch (error) {
      console.error(
        'Load academic areas error:',
        error
      );

      alert(
        error.response?.data?.message ||
        'Failed to load academic areas.'
      );

    } finally {
      setLoadingAreas(false);
    }
  };


  // =========================================
  // LOAD WHEN PAGE OPENS
  // =========================================
  useEffect(() => {
    loadAreas();
  }, []);


  // =========================================
  // ADD NEW ACADEMIC AREA
  // =========================================
  const handleAddArea = async () => {
    const areaName = newArea.trim();

    if (!areaName) {
      alert(
        'Please enter an academic area.'
      );
      return;
    }

    try {
      const response = await api.post(
        '/academic-areas',
        {
          area_name: areaName,
          description: ''
        }
      );

      alert(
        response.data?.message ||
        'Academic area created successfully.'
      );

      setNewArea('');
      setShowAddArea(false);

      await loadAreas();

    } catch (error) {
      console.error(
        'Add academic area error:',
        error
      );

      alert(
        error.response?.data?.message ||
        'Failed to create academic area.'
      );
    }
  };


  // =========================================
  // UPDATE ACADEMIC AREA
  // =========================================
  const handleUpdateArea = async (
    areaId,
    currentName
  ) => {
    const newName = window.prompt(
      'Enter new academic area name:',
      currentName
    );

    if (newName === null) {
      return;
    }

    const trimmedName =
      newName.trim();

    if (!trimmedName) {
      alert(
        'Please enter an academic area name.'
      );
      return;
    }

    try {
      await api.put(
        `/academic-areas/${areaId}`,
        {
          area_name: trimmedName,
          description: ''
        }
      );

      alert(
        'Academic area updated successfully.'
      );

      await loadAreas();

    } catch (error) {
      console.error(
        'Update academic area error:',
        error
      );

      alert(
        error.response?.data?.message ||
        'Failed to update academic area.'
      );
    }
  };


  // =========================================
  // DELETE ACADEMIC AREA
  // =========================================
  const handleDeleteArea = async (
    areaId,
    areaName
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete academic area #${areaId} (${areaName})?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/academic-areas/${areaId}`
      );

      alert(
        'Academic area deleted successfully.'
      );

      await loadAreas();

    } catch (error) {
      console.error(
        'Delete academic area error:',
        error
      );

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
      />


      {/* =====================================
          ADD NEW AREA FORM
      ===================================== */}

      {showAddArea && (
        <div
          className="card"
          style={{
            marginBottom: '20px',
            padding: '20px'
          }}
        >

          <h3
            style={{
              marginTop: 0
            }}
          >
            Add New Academic Area
          </h3>


          <input
            type="text"
            placeholder="Enter academic area"
            value={newArea}
            onChange={e =>
              setNewArea(
                e.target.value
              )
            }
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


      {/* =====================================
          ACADEMIC AREAS LIST
      ===================================== */}

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

          areas.map(
            (area, index) => (

              <div
                className="area"
                key={area.area_id}
              >

                <div>
                  📖
                </div>


                <h3>
                  {area.area_name}
                </h3>


                <p>
                  {index % 4 + 2}
                  {' '}
                  Teachers Assigned
                </p>


                {/* ACTION BUTTONS */}

                <div
                  style={{
                    display: 'flex',
                    gap: '6px',
                    justifyContent:
                      'center',
                    flexWrap: 'wrap',
                    marginTop: '10px'
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

            )
          )

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


        {/* =====================================
            ADD NEW AREA
        ===================================== */}

        <div
          className="area add"
          onClick={() => {
            setShowAddArea(true);
            setNewArea('');
          }}
          style={{
            cursor: 'pointer'
          }}
        >

          <strong>
            +
          </strong>

          <p>
            Add New Area
          </p>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   LOGS
   ========================================================= */

function Logs() {
  const [data, setData] =
    useState([]);

  useEffect(() => {

    api
      .get('/audit-logs')
      .then(response =>
        setData(
          arr(
            response.data
          )
        )
      )
      .catch(() => {});

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
          rows={
            data.map(log => [
              log.log_id,
              `User #${log.user_id}`,
              log.action,
              log.module,
              log.record_id ??
                '—',
              date(
                log.created_at
              )
            ])
          }
        />

      </Card>

    </div>
  );
}

/* =========================================================
   SECURITY
   ========================================================= */

function Security() {
  const settings = [
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
  ];

  return (
    <div className="content">

      <Header
        title="Security Settings"
        sub="Authentication and access-control overview."
      />

      <div className="security">

        {settings.map(
          ([title, description]) => (

            <div
              className="security-card"
              key={title}
            >

              <ShieldCheck />

              <h3>
                {title}
              </h3>

              <p>
                {description}
              </p>

              <Badge>
                Enabled
              </Badge>

            </div>

          )
        )}

      </div>

    </div>
  );
}

/* =========================================================
   STUDENTS - CRUD
   ========================================================= */

function Students() {

  const [students, setStudents] =
    useState([]);

  const [parents, setParents] =
    useState([]);

  const [studentUsers, setStudentUsers] =
    useState([]);

  const [search, setSearch] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState('');

  const [messageType, setMessageType] =
    useState('success');

  const [showModal, setShowModal] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [form, setForm] =
    useState({
      grade_level: '',
      parent_id: '',
      section: '',
      enrollment_status:
        'Enrolled',
      user_id: ''
    });

  const loadStudents = async () => {

    setLoading(true);

    try {

      const response =
        await api.get(
          '/students'
        );

      setStudents(
        arr(
          response.data
        )
      );

    } catch (error) {

      console.error(
        'Load students error:',
        error
      );

      setMessage(
        error.response?.data?.message ||
        'Failed to load student records.'
      );

      setMessageType(
        'error'
      );

    } finally {

      setLoading(false);

    }
  };

  const loadParents = async () => {

    try {

      const response =
        await api.get(
          '/parents'
        );

      setParents(
        arr(
          response.data
        )
      );

    } catch (error) {

      console.error(
        'Load parents error:',
        error
      );

    }
  };

  const loadStudentUsers =
    async () => {

      try {

        const response =
          await api.get(
            '/users'
          );

        const allUsers =
          arr(
            response.data
          );

        setStudentUsers(
          allUsers.filter(
            account =>
              account.role ===
              'student'
          )
        );

      } catch (error) {

        console.error(
          'Student user list error:',
          error
        );

      }

    };

  useEffect(() => {

    loadStudents();
    loadParents();
    loadStudentUsers();

  }, []);

  const handleChange = event => {

    const {
      name,
      value
    } = event.target;

    setForm(
      previous => ({
        ...previous,
        [name]: value
      })
    );

  };

  const resetForm = () => {

    setForm({
      grade_level: '',
      parent_id: '',
      section: '',
      enrollment_status:
        'Enrolled',
      user_id: ''
    });

    setEditingId(null);

  };

  const openAddModal = () => {

    resetForm();

    setMessage('');

    setShowModal(true);

  };

  const openEditModal =
    student => {

      setEditingId(
        student.student_id
      );

      setForm({
        grade_level:
          student.grade_level ||
          '',

        parent_id:
          student.parent_id ??
          '',

        section:
          student.section ||
          '',

        enrollment_status:
          student.enrollment_status ||
          'Enrolled',

        user_id:
          student.user_id ??
          ''
      });

      setMessage('');

      setShowModal(true);

    };

  const closeModal = () => {

    if (saving) {
      return;
    }

    setShowModal(false);

    resetForm();

  };

  const validateForm = () => {

    const grade =
      form.grade_level.trim();

    const section =
      form.section.trim();

    const status =
      form.enrollment_status.trim();

    const userId =
      Number(form.user_id);

    if (!grade) {

      setMessage(
        'Grade level is required.'
      );

      setMessageType(
        'error'
      );

      return false;
    }

    if (!section) {

      setMessage(
        'Section is required.'
      );

      setMessageType(
        'error'
      );

      return false;
    }

    if (!status) {

      setMessage(
        'Enrollment status is required.'
      );

      setMessageType(
        'error'
      );

      return false;
    }

    if (
      !Number.isInteger(
        userId
      ) ||
      userId <= 0
    ) {

      setMessage(
        'Please select a valid student account.'
      );

      setMessageType(
        'error'
      );

      return false;
    }

    return true;
  };

  const saveStudent =
    async event => {

      event.preventDefault();

      setMessage('');

      if (!validateForm()) {
        return;
      }

      setSaving(true);

      try {

        const payload = {
          grade_level:
            form.grade_level.trim(),

          parent_id:
            form.parent_id
              ? Number(
                  form.parent_id
                )
              : null,

          section:
            form.section.trim(),

          enrollment_status:
            form.enrollment_status.trim(),

          user_id:
            Number(
              form.user_id
            )
        };

        if (!editingId) {

          const response =
            await api.post(
              '/students',
              payload
            );

          setMessage(
            response.data?.message ||
            'Student added successfully.'
          );

        } else {

          const updatePayload = {
            grade_level:
              payload.grade_level,

            parent_id:
              payload.parent_id,

            section:
              payload.section,

            enrollment_status:
              payload.enrollment_status
          };

          const response =
            await api.put(
              `/students/${editingId}`,
              updatePayload
            );

          setMessage(
            response.data?.message ||
            `Student #${editingId} updated successfully.`
          );

        }

        setMessageType(
          'success'
        );

        setShowModal(false);

        resetForm();

        await loadStudents();

      } catch (error) {

        console.error(
          'Save student error:',
          error
        );

        setMessage(
          error.response?.data?.message ||
          'Failed to save student.'
        );

        setMessageType(
          'error'
        );

      } finally {

        setSaving(false);

      }

    };

  const deleteStudent =
    async student => {

      const confirmed =
        window.confirm(
          `Are you sure you want to delete Student #${student.student_id}?`
        );

      if (!confirmed) {
        return;
      }

      setMessage('');

      try {

        const response =
          await api.delete(
            `/students/${student.student_id}`
          );

        setMessage(
          response.data?.message ||
          `Student #${student.student_id} deleted successfully.`
        );

        setMessageType(
          'success'
        );

        await loadStudents();

      } catch (error) {

        console.error(
          'Delete student error:',
          error
        );

        setMessage(
          error.response?.data?.message ||
          'Failed to delete student.'
        );

        setMessageType(
          'error'
        );

      }

    };

  const filteredStudents =
    students.filter(
      student => {

        const query =
          search
            .toLowerCase()
            .trim();

        return (

          String(
            student.student_id ||
            ''
          )
            .toLowerCase()
            .includes(query) ||

          String(
            student.name ||
            ''
          )
            .toLowerCase()
            .includes(query) ||

          String(
            student.email ||
            ''
          )
            .toLowerCase()
            .includes(query) ||

          String(
            student.grade_level ||
            ''
          )
            .toLowerCase()
            .includes(query) ||

          String(
            student.section ||
            ''
          )
            .toLowerCase()
            .includes(query) ||

          String(
            student.enrollment_status ||
            ''
          )
            .toLowerCase()
            .includes(query)

        );

      }
    );

  return (
    <div className="content">

      <Header
        title="Student Records"
        sub="Manage student information, enrollment and parent assignments."
        action={

          <div
            style={{
              display:
                'flex',
              gap:
                '8px',
              flexWrap:
                'wrap'
            }}
          >

            <button
              type="button"
              className="small"
              onClick={
                loadStudents
              }
              disabled={
                loading
              }
              style={{
                display:
                  'flex',
                alignItems:
                  'center',
                gap:
                  '6px'
              }}
            >

              <RefreshCw
                size={15}
              />

              {loading
                ? 'Refreshing...'
                : 'Refresh'}

            </button>

            <button
              type="button"
              className="primary small"
              onClick={
                openAddModal
              }
            >
              + Add Student
            </button>

          </div>

        }
      />

      {message && (

        <div
          className="card"
          style={{
            marginBottom:
              '20px',
            padding:
              '13px 16px',
            borderLeft:
              messageType ===
              'error'
                ? '4px solid #dc2626'
                : '4px solid #16a085',
            background:
              messageType ===
              'error'
                ? '#fff5f5'
                : '#f0fdf4'
          }}
        >
          {message}
        </div>

      )}

      <div
        className="search"
        style={{
          marginBottom:
            '20px'
        }}
      >

        <Search
          size={17}
        />

        <input
          placeholder="Search by student ID, name, email, grade or section..."
          value={
            search
          }
          onChange={
            event =>
              setSearch(
                event.target.value
              )
          }
        />

      </div>

      <div
        className="stats four"
        style={{
          marginBottom:
            '20px'
        }}
      >

        <Stat
          icon={GraduationCap}
          label="Total Students"
          value={
            students.length
          }
        />

        <Stat
          icon={CheckCircle2}
          label="Displayed"
          value={
            filteredStudents.length
          }
          kind="blue"
        />

        <Stat
          icon={Activity}
          label="Enrolled"
          value={
            students.filter(
              student =>
                String(
                  student.enrollment_status ||
                  ''
                ).toLowerCase() ===
                'enrolled'
            ).length
          }
        />

        <Stat
          icon={Users}
          label="With Parent"
          value={
            students.filter(
              student =>
                student.parent_id
            ).length
          }
          kind="yellow"
        />

      </div>

      <Card title="Student Records">

        {!filteredStudents.length ? (

          <Empty>

            {students.length
              ? 'No students match your search.'
              : 'No student records found in the database.'}

          </Empty>

        ) : (

          <div
            className="tablewrap"
          >

            <table>

              <thead>

                <tr>

                  <th>
                    Student ID
                  </th>

                  <th>
                    Student
                  </th>

                  <th>
                    Grade
                  </th>

                  <th>
                    Section
                  </th>

                  <th>
                    Parent
                  </th>

                  <th>
                    Enrollment
                  </th>

                  <th>
                    User ID
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredStudents.map(
                  student => (

                    <tr
                      key={
                        student.student_id
                      }
                    >

                      <td>
                        #
                        {
                          student.student_id
                        }
                      </td>

                      <td>

                        <div>

                          <b>
                            {
                              student.name ||
                              `Student #${student.student_id}`
                            }
                          </b>

                          {student.email && (

                            <small
                              style={{
                                display:
                                  'block',
                                marginTop:
                                  '3px'
                              }}
                            >
                              {
                                student.email
                              }
                            </small>

                          )}

                        </div>

                      </td>

                      <td>
                        {
                          student.grade_level ||
                          '—'
                        }
                      </td>

                      <td>
                        {
                          student.section ||
                          '—'
                        }
                      </td>

                      <td>

                        {student.parent_id ? (

                          <span>

                            Parent #
                            {
                              student.parent_id
                            }

                            {student.contact_number && (

                              <small
                                style={{
                                  display:
                                    'block',
                                  marginTop:
                                    '3px'
                                }}
                              >
                                {
                                  student.contact_number
                                }
                              </small>

                            )}

                          </span>

                        ) : (
                          'No Parent'
                        )}

                      </td>

                      <td>

                        <Badge>
                          {
                            student.enrollment_status ||
                            '—'
                          }
                        </Badge>

                      </td>

                      <td>
                        {
                          student.user_id ??
                          '—'
                        }
                      </td>

                      <td>

                        <div
                          style={{
                            display:
                              'flex',
                            gap:
                              '7px',
                            flexWrap:
                              'wrap'
                          }}
                        >

                          <button
                            type="button"
                            className="small"
                            onClick={() =>
                              openEditModal(
                                student
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="small"
                            onClick={() =>
                              deleteStudent(
                                student
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </Card>

      {showModal && (

        <div
          onClick={event => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }

          }}
          style={{
            position:
              'fixed',
            inset:
              0,
            background:
              'rgba(15, 23, 42, 0.55)',
            display:
              'flex',
            alignItems:
              'center',
            justifyContent:
              'center',
            padding:
              '20px',
            zIndex:
              9999
          }}
        >

          <div
            style={{
              width:
                '100%',
              maxWidth:
                '680px',
              maxHeight:
                '90vh',
              overflowY:
                'auto',
              background:
                '#ffffff',
              borderRadius:
                '16px',
              boxShadow:
                '0 25px 60px rgba(0,0,0,.20)'
            }}
          >

            <div
              style={{
                display:
                  'flex',
                alignItems:
                  'center',
                justifyContent:
                  'space-between',
                padding:
                  '20px 22px',
                borderBottom:
                  '1px solid #e5e7eb'
              }}
            >

              <div>

                <h2
                  style={{
                    margin:
                      0,
                    fontSize:
                      '20px'
                  }}
                >
                  {editingId
                    ? 'Edit Student'
                    : 'Add New Student'}
                </h2>

                <p
                  style={{
                    margin:
                      '5px 0 0',
                    color:
                      '#6b7280',
                    fontSize:
                      '13px'
                  }}
                >
                  {editingId
                    ? `Update information for Student #${editingId}.`
                    : 'Create a student record and connect it to a student account.'}
                </p>

              </div>

              <button
                type="button"
                className="small"
                onClick={
                  closeModal
                }
                disabled={
                  saving
                }
                style={{
                  width:
                    '36px',
                  height:
                    '36px',
                  padding:
                    0,
                  display:
                    'flex',
                  alignItems:
                    'center',
                  justifyContent:
                    'center'
                }}
              >

                <X
                  size={18}
                />

              </button>

            </div>

            <form
              onSubmit={
                saveStudent
              }
              noValidate
              style={{
                padding:
                  '22px'
              }}
            >

              <div
                style={{
                  display:
                    'grid',
                  gridTemplateColumns:
                    'repeat(2, minmax(0, 1fr))',
                  gap:
                    '16px'
                }}
              >

                <div
                  style={{
                    gridColumn:
                      '1 / -1'
                  }}
                >

                  <label
                    style={{
                      display:
                        'block',
                      marginBottom:
                        '6px',
                      fontWeight:
                        600
                    }}
                  >
                    Student Account *
                  </label>

                  <select
                    name="user_id"
                    value={
                      form.user_id
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      Boolean(
                        editingId
                      )
                    }
                    style={{
                      width:
                        '100%',
                      height:
                        '42px',
                      padding:
                        '8px 12px',
                      borderRadius:
                        '8px',
                      border:
                        '1px solid #d9dee7',
                      background:
                        '#ffffff'
                    }}
                  >

                    <option value="">
                      Select student account
                    </option>

                    {studentUsers.map(
                      account => (

                        <option
                          key={
                            account.id
                          }
                          value={
                            account.id
                          }
                        >
                          #{account.id}
                          {' — '}
                          {
                            account.name ||
                            'Unnamed Student'
                          }
                          {' — '}
                          {
                            account.email
                          }
                        </option>

                      )
                    )}

                  </select>

                  {!studentUsers.length && (
                    <small
                      style={{
                        display:
                          'block',
                        marginTop:
                          '6px',
                        color:
                          '#6b7280'
                      }}
                    >
                      No student user accounts available.
                      Create a user with the Student role first.
                    </small>
                  )}

                  {editingId && (

                    <small
                      style={{
                        display:
                          'block',
                        marginTop:
                          '6px',
                        color:
                          '#6b7280'
                      }}
                    >
                      The linked student account cannot be changed while editing.
                    </small>

                  )}

                </div>

                <div>

                  <label
                    style={{
                      display:
                        'block',
                      marginBottom:
                        '6px',
                      fontWeight:
                        600
                    }}
                  >
                    Grade Level *
                  </label>

                  <input
                    name="grade_level"
                    value={
                      form.grade_level
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Grade 8"
                    style={{
                      width:
                        '100%'
                    }}
                  />

                </div>

                <div>

                  <label
                    style={{
                      display:
                        'block',
                      marginBottom:
                        '6px',
                      fontWeight:
                        600
                    }}
                  >
                    Section *
                  </label>

                  <input
                    name="section"
                    value={
                      form.section
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Section A"
                    style={{
                      width:
                        '100%'
                    }}
                  />

                </div>

                <div>

                  <label
                    style={{
                      display:
                        'block',
                      marginBottom:
                        '6px',
                      fontWeight:
                        600
                    }}
                  >
                    Parent
                  </label>

                  <select
                    name="parent_id"
                    value={
                      form.parent_id
                    }
                    onChange={
                      handleChange
                    }
                    style={{
                      width:
                        '100%',
                      height:
                        '42px',
                      padding:
                        '8px 12px',
                      borderRadius:
                        '8px',
                      border:
                        '1px solid #d9dee7',
                      background:
                        '#ffffff'
                    }}
                  >

                    <option value="">
                      No Parent Assigned
                    </option>

                    {parents.map(
                      parent => (

                        <option
                          key={
                            parent.parent_id
                          }
                          value={
                            parent.parent_id
                          }
                        >
                          Parent #
                          {
                            parent.parent_id
                          }
                          {' — '}
                          {
                            parent.contact_number ||
                            'No contact number'
                          }
                        </option>

                      )
                    )}

                  </select>

                </div>

                <div>

                  <label
                    style={{
                      display:
                        'block',
                      marginBottom:
                        '6px',
                      fontWeight:
                        600
                    }}
                  >
                    Enrollment Status *
                  </label>

                  <select
                    name="enrollment_status"
                    value={
                      form.enrollment_status
                    }
                    onChange={
                      handleChange
                    }
                    style={{
                      width:
                        '100%',
                      height:
                        '42px',
                      padding:
                        '8px 12px',
                      borderRadius:
                        '8px',
                      border:
                        '1px solid #d9dee7',
                      background:
                        '#ffffff'
                    }}
                  >

                    <option value="Enrolled">
                      Enrolled
                    </option>

                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Dropped">
                      Dropped
                    </option>

                    <option value="Graduated">
                      Graduated
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>

                  </select>

                </div>

              </div>

              <div
                style={{
                  display:
                    'flex',
                  justifyContent:
                    'flex-end',
                  gap:
                    '10px',
                  marginTop:
                    '24px',
                  paddingTop:
                    '18px',
                  borderTop:
                    '1px solid #e5e7eb'
                }}
              >

                <button
                  type="button"
                  className="small"
                  onClick={
                    closeModal
                  }
                  disabled={
                    saving
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary"
                  disabled={
                    saving
                  }
                >

                  {saving
                    ? 'Saving...'
                    : editingId
                    ? 'Save Changes'
                    : 'Create Student'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

/* =========================================================
   PARENTS - CRUD
   ========================================================= */

function Parents() {

  const [parents, setParents] =
    useState([]);

  const [parentUsers, setParentUsers] =
    useState([]);

  const [search, setSearch] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState('');

  const [messageType, setMessageType] =
    useState('success');

  const [showModal, setShowModal] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [form, setForm] =
    useState({
      user_id: '',
      contact_number: ''
    });

  /* =======================================================
     LOAD PARENTS
     ======================================================= */

  const loadParents = async () => {

    setLoading(true);

    try {

      const response =
        await api.get(
          '/parents'
        );

      setParents(
        arr(
          response.data
        )
      );

    } catch (error) {

      console.error(
        'Load parents error:',
        error
      );

      setMessage(
        error.response?.data?.message ||
        'Failed to load parent records.'
      );

      setMessageType(
        'error'
      );

    } finally {

      setLoading(false);

    }
  };

  /* =======================================================
     LOAD PARENT USER ACCOUNTS
     ======================================================= */

  const loadParentUsers =
    async () => {

      try {

        const response =
          await api.get(
            '/users'
          );

        const allUsers =
          arr(
            response.data
          );

        setParentUsers(
          allUsers.filter(
            account =>
              String(
                account.role || ''
              ).toLowerCase() ===
              'parent'
          )
        );

      } catch (error) {

        console.error(
          'Load parent users error:',
          error
        );

      }

    };

  /* =======================================================
     INITIAL LOAD
     ======================================================= */

  useEffect(() => {

    loadParents();
    loadParentUsers();

  }, []);

  /* =======================================================
     FORM CHANGE
     ======================================================= */

  const handleChange = event => {

    const {
      name,
      value
    } = event.target;

    setForm(
      previous => ({
        ...previous,
        [name]: value
      })
    );

  };

  /* =======================================================
     RESET FORM
     ======================================================= */

  const resetForm = () => {

    setForm({
      user_id: '',
      contact_number: ''
    });

    setEditingId(null);

  };

  /* =======================================================
     OPEN ADD MODAL
     ======================================================= */

  const openAddModal = () => {

    resetForm();

    setMessage('');

    setShowModal(true);

  };

  /* =======================================================
     OPEN EDIT MODAL
     ======================================================= */

  const openEditModal =
    parent => {

      setEditingId(
        parent.parent_id
      );

      setForm({
        user_id:
          parent.user_id ??
          '',
        contact_number:
          parent.contact_number ||
          ''
      });

      setMessage('');

      setShowModal(true);

    };

  /* =======================================================
     CLOSE MODAL
     ======================================================= */

  const closeModal = () => {

    if (saving) {
      return;
    }

    setShowModal(false);

    resetForm();

  };

  /* =======================================================
     VALIDATION
     ======================================================= */

  const validateForm = () => {

    const contact =
      form.contact_number.trim();

    const userId =
      Number(
        form.user_id
      );

    if (!editingId) {

      if (
        !Number.isInteger(
          userId
        ) ||
        userId <= 0
      ) {

        setMessage(
          'Please select a valid parent account.'
        );

        setMessageType(
          'error'
        );

        return false;
      }

    }

    if (!contact) {

      setMessage(
        'Contact number is required.'
      );

      setMessageType(
        'error'
      );

      return false;
    }

    if (
      contact.length < 7
    ) {

      setMessage(
        'Please enter a valid contact number.'
      );

      setMessageType(
        'error'
      );

      return false;
    }

    return true;
  };

  /* =======================================================
     SAVE PARENT
     ======================================================= */

  const saveParent =
    async event => {

      event.preventDefault();

      setMessage('');

      if (!validateForm()) {
        return;
      }

      setSaving(true);

      try {

        if (!editingId) {

          const response =
            await api.post(
              '/parents',
              {
                user_id:
                  Number(
                    form.user_id
                  ),
                contact_number:
                  form.contact_number.trim()
              }
            );

          setMessage(
            response.data?.message ||
            'Parent created successfully.'
          );

        } else {

          const response =
            await api.put(
              `/parents/${editingId}`,
              {
                contact_number:
                  form.contact_number.trim()
              }
            );

          setMessage(
            response.data?.message ||
            `Parent #${editingId} updated successfully.`
          );

        }

        setMessageType(
          'success'
        );

        setShowModal(false);

        resetForm();

        await loadParents();

      } catch (error) {

        console.error(
          'Save parent error:',
          error
        );

        setMessage(
          error.response?.data?.message ||
          'Failed to save parent.'
        );

        setMessageType(
          'error'
        );

      } finally {

        setSaving(false);

      }

    };

  /* =======================================================
     DELETE PARENT
     ======================================================= */

  const deleteParent =
    async parent => {

      const confirmed =
        window.confirm(
          `Are you sure you want to delete Parent #${parent.parent_id}?`
        );

      if (!confirmed) {
        return;
      }

      setMessage('');

      try {

        const response =
          await api.delete(
            `/parents/${parent.parent_id}`
          );

        setMessage(
          response.data?.message ||
          `Parent #${parent.parent_id} deleted successfully.`
        );

        setMessageType(
          'success'
        );

        await loadParents();

      } catch (error) {

        console.error(
          'Delete parent error:',
          error
        );

        setMessage(
          error.response?.data?.message ||
          'Failed to delete parent.'
        );

        setMessageType(
          'error'
        );

      }

    };

  /* =======================================================
     SEARCH
     ======================================================= */

  const filteredParents =
    parents.filter(
      parent => {

        const query =
          search
            .toLowerCase()
            .trim();

        return (

          String(
            parent.parent_id ||
            ''
          )
            .toLowerCase()
            .includes(query) ||

          String(
            parent.user_id ||
            ''
          )
            .toLowerCase()
            .includes(query) ||

          String(
            parent.name ||
            ''
          )
            .toLowerCase()
            .includes(query) ||

          String(
            parent.email ||
            ''
          )
            .toLowerCase()
            .includes(query) ||

          String(
            parent.contact_number ||
            ''
          )
            .toLowerCase()
            .includes(query)

        );

      }
    );

  return (
    <div className="content">

      <Header
        title="Parent Records"
        sub="Manage parent and guardian information."
        action={

          <div
            style={{
              display:
                'flex',
              gap:
                '8px',
              flexWrap:
                'wrap'
            }}
          >

            <button
              type="button"
              className="small"
              onClick={
                loadParents
              }
              disabled={
                loading
              }
              style={{
                display:
                  'flex',
                alignItems:
                  'center',
                gap:
                  '6px'
              }}
            >

              <RefreshCw
                size={15}
              />

              {loading
                ? 'Refreshing...'
                : 'Refresh'}

            </button>

            <button
              type="button"
              className="primary small"
              onClick={
                openAddModal
              }
            >
              + Add Parent
            </button>

          </div>

        }
      />

      {message && (

        <div
          className="card"
          style={{
            marginBottom:
              '20px',
            padding:
              '13px 16px',
            borderLeft:
              messageType ===
              'error'
                ? '4px solid #dc2626'
                : '4px solid #16a085',
            background:
              messageType ===
              'error'
                ? '#fff5f5'
                : '#f0fdf4'
          }}
        >
          {message}
        </div>

      )}

      <div
        className="search"
        style={{
          marginBottom:
            '20px'
        }}
      >

        <Search
          size={17}
        />

        <input
          placeholder="Search by parent ID, name, email, contact number or user ID..."
          value={
            search
          }
          onChange={
            event =>
              setSearch(
                event.target.value
              )
          }
        />

      </div>

      <div
        className="stats four"
        style={{
          marginBottom:
            '20px'
        }}
      >

        <Stat
          icon={Users}
          label="Total Parents"
          value={
            parents.length
          }
        />

        <Stat
          icon={CheckCircle2}
          label="Displayed"
          value={
            filteredParents.length
          }
          kind="blue"
        />

        <Stat
          icon={Activity}
          label="With Contact"
          value={
            parents.filter(
              parent =>
                String(
                  parent.contact_number ||
                  ''
                ).trim()
            ).length
          }
        />

        <Stat
          icon={ShieldCheck}
          label="Parent Accounts"
          value={
            parentUsers.length
          }
          kind="yellow"
        />

      </div>

      <Card title="Parent Records">

        {!filteredParents.length ? (

          <Empty>

            {parents.length
              ? 'No parents match your search.'
              : 'No parent records found in the database.'}

          </Empty>

        ) : (

          <div
            className="tablewrap"
          >

            <table>

              <thead>

                <tr>

                  <th>
                    Parent ID
                  </th>

                  <th>
                    Parent
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Contact Number
                  </th>

                  <th>
                    User ID
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredParents.map(
                  parent => (

                    <tr
                      key={
                        parent.parent_id
                      }
                    >

                      <td>
                        #
                        {
                          parent.parent_id
                        }
                      </td>

                      <td>

                        <div>

                          <b>
                            {
                              parent.name ||
                              `Parent #${parent.parent_id}`
                            }
                          </b>

                        </div>

                      </td>

                      <td>
                        {
                          parent.email ||
                          '—'
                        }
                      </td>

                      <td>
                        {
                          parent.contact_number ||
                          '—'
                        }
                      </td>

                      <td>
                        {
                          parent.user_id ??
                          '—'
                        }
                      </td>

                      <td>

                        <div
                          style={{
                            display:
                              'flex',
                            gap:
                              '7px',
                            flexWrap:
                              'wrap'
                          }}
                        >

                          <button
                            type="button"
                            className="small"
                            onClick={() =>
                              openEditModal(
                                parent
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="small"
                            onClick={() =>
                              deleteParent(
                                parent
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </Card>

      {showModal && (

        <div
          onClick={event => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }

          }}
          style={{
            position:
              'fixed',
            inset:
              0,
            background:
              'rgba(15, 23, 42, 0.55)',
            display:
              'flex',
            alignItems:
              'center',
            justifyContent:
              'center',
            padding:
              '20px',
            zIndex:
              9999
          }}
        >

          <div
            style={{
              width:
                '100%',
              maxWidth:
                '620px',
              maxHeight:
                '90vh',
              overflowY:
                'auto',
              background:
                '#ffffff',
              borderRadius:
                '16px',
              boxShadow:
                '0 25px 60px rgba(0,0,0,.20)'
            }}
          >

            <div
              style={{
                display:
                  'flex',
                alignItems:
                  'center',
                justifyContent:
                  'space-between',
                padding:
                  '20px 22px',
                borderBottom:
                  '1px solid #e5e7eb'
              }}
            >

              <div>

                <h2
                  style={{
                    margin:
                      0,
                    fontSize:
                      '20px'
                  }}
                >

                  {editingId
                    ? 'Edit Parent'
                    : 'Add New Parent'}

                </h2>

                <p
                  style={{
                    margin:
                      '5px 0 0',
                    color:
                      '#6b7280',
                    fontSize:
                      '13px'
                  }}
                >

                  {editingId
                    ? `Update information for Parent #${editingId}.`
                    : 'Create a parent record and connect it to a parent account.'}

                </p>

              </div>

              <button
                type="button"
                className="small"
                onClick={
                  closeModal
                }
                disabled={
                  saving
                }
                style={{
                  width:
                    '36px',
                  height:
                    '36px',
                  padding:
                    0,
                  display:
                    'flex',
                  alignItems:
                    'center',
                  justifyContent:
                    'center'
                }}
              >

                <X
                  size={18}
                />

              </button>

            </div>

            <form
              onSubmit={
                saveParent
              }
              noValidate
              style={{
                padding:
                  '22px'
              }}
            >

              <div
                style={{
                  display:
                    'grid',
                  gridTemplateColumns:
                    '1fr',
                  gap:
                    '16px'
                }}
              >

                <div>

                  <label
                    style={{
                      display:
                        'block',
                      marginBottom:
                        '6px',
                      fontWeight:
                        600
                    }}
                  >
                    Parent Account *
                  </label>

                  <select
                    name="user_id"
                    value={
                      form.user_id
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      Boolean(
                        editingId
                      )
                    }
                    style={{
                      width:
                        '100%',
                      height:
                        '42px',
                      padding:
                        '8px 12px',
                      borderRadius:
                        '8px',
                      border:
                        '1px solid #d9dee7',
                      background:
                        '#ffffff'
                    }}
                  >

                    <option value="">
                      Select parent account
                    </option>

                    {parentUsers.map(
                      account => (

                        <option
                          key={
                            account.id
                          }
                          value={
                            account.id
                          }
                        >
                          #{account.id}
                          {' — '}
                          {
                            account.name ||
                            'Unnamed Parent'
                          }
                          {' — '}
                          {
                            account.email
                          }
                        </option>

                      )
                    )}

                  </select>

                  {!parentUsers.length && (
                    <small
                      style={{
                        display:
                          'block',
                        marginTop:
                          '6px',
                        color:
                          '#6b7280'
                      }}
                    >
                      No parent user accounts available.
                      Create a user with the Parent role first.
                    </small>
                  )}

                  {editingId && (

                    <small
                      style={{
                        display:
                          'block',
                        marginTop:
                          '6px',
                        color:
                          '#6b7280'
                      }}
                    >
                      The linked parent account cannot be changed while editing.
                    </small>

                  )}

                </div>

                <div>

                  <label
                    style={{
                      display:
                        'block',
                      marginBottom:
                        '6px',
                      fontWeight:
                        600
                    }}
                  >
                    Contact Number *
                  </label>

                  <input
                    type="text"
                    name="contact_number"
                    value={
                      form.contact_number
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="09171234567"
                    maxLength={50}
                    style={{
                      width:
                        '100%'
                    }}
                  />

                  <small
                    style={{
                      display:
                        'block',
                      marginTop:
                        '6px',
                      color:
                        '#6b7280'
                    }}
                  >
                    Enter the parent's active contact number.
                  </small>

                </div>

              </div>

              <div
                style={{
                  display:
                    'flex',
                  justifyContent:
                    'flex-end',
                  gap:
                    '10px',
                  marginTop:
                    '24px',
                  paddingTop:
                    '18px',
                  borderTop:
                    '1px solid #e5e7eb'
                }}
              >

                <button
                  type="button"
                  className="small"
                  onClick={
                    closeModal
                  }
                  disabled={
                    saving
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary"
                  disabled={
                    saving
                  }
                >

                  {saving
                    ? 'Saving...'
                    : editingId
                    ? 'Save Changes'
                    : 'Create Parent'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}


/* =========================================================
   TASKS - CRUD
   ========================================================= */

function Tasks() {
  const [records, setRecords] =
    useState([]);

  const [students, setStudents] =
    useState([]);

  const [search, setSearch] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState('all');

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState('');

  const [messageType, setMessageType] =
    useState('success');

  const [showModal, setShowModal] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [form, setForm] =
    useState({
      student_id: '',
      title: '',
      description: '',
      due_date: '',
      status: 'Pending'
    });

  /* =======================================================
     LOAD TASKS
     ======================================================= */

  const loadTasks = async () => {

    setLoading(true);

    try {

      const response =
        await api.get(
          '/tasks'
        );

      setRecords(
        arr(
          response.data
        )
      );

    } catch (error) {

      console.error(
        'Load tasks error:',
        error
      );

      setMessage(
        error.response?.data?.message ||
        'Failed to load task records.'
      );

      setMessageType(
        'error'
      );

    } finally {

      setLoading(false);

    }
  };

  /* =======================================================
     LOAD STUDENTS
     ======================================================= */

  const loadStudents = async () => {

    try {

      const response =
        await api.get(
          '/students'
        );

      setStudents(
        arr(
          response.data
        )
      );

    } catch (error) {

      console.error(
        'Load students error:',
        error
      );

    }

  };

  /* =======================================================
     INITIAL LOAD
     ======================================================= */

  useEffect(() => {

    loadTasks();
    loadStudents();

  }, []);

  /* =======================================================
     FORM CHANGE
     ======================================================= */

  const handleChange = event => {

    const {
      name,
      value
    } = event.target;

    setForm(
      previous => ({
        ...previous,
        [name]: value
      })
    );

  };

  /* =======================================================
     RESET FORM
     ======================================================= */

  const resetForm = () => {

    setForm({
      student_id: '',
      title: '',
      description: '',
      due_date: '',
      status: 'Pending'
    });

    setEditingId(null);

  };

  /* =======================================================
     OPEN ADD MODAL
     ======================================================= */

  const openAddModal = () => {

    resetForm();

    setMessage('');

    setShowModal(true);

  };

  /* =======================================================
     OPEN EDIT MODAL
     ======================================================= */

  const openEditModal =
    task => {

      setEditingId(
        task.task_id
      );

      setForm({
        student_id:
          task.student_id ??
          '',
        title:
          task.title ||
          task.task ||
          '',
        description:
          task.description ||
          '',
        due_date:
          task.due_date
            ? String(
                task.due_date
              ).slice(0, 10)
            : '',
        status:
          task.status ||
          'Pending'
      });

      setMessage('');

      setShowModal(true);

    };

  /* =======================================================
     CLOSE MODAL
     ======================================================= */

  const closeModal = () => {

    if (saving) {
      return;
    }

    setShowModal(false);

    resetForm();

  };

  /* =======================================================
     VALIDATE
     ======================================================= */

  const validateForm = () => {

    const studentId =
      Number(
        form.student_id
      );

    const title =
      form.title.trim();

    const dueDate =
      form.due_date.trim();

    const status =
      form.status.trim();

    if (
      !Number.isInteger(
        studentId
      ) ||
      studentId <= 0
    ) {

      setMessage(
        'Please select a valid student.'
      );

      setMessageType(
        'error'
      );

      return false;
    }

    if (!title) {

      setMessage(
        'Task title is required.'
      );

      setMessageType(
        'error'
      );

      return false;
    }

    if (!dueDate) {

      setMessage(
        'Due date is required.'
      );

      setMessageType(
        'error'
      );

      return false;
    }

    if (!status) {

      setMessage(
        'Task status is required.'
      );

      setMessageType(
        'error'
      );

      return false;
    }

    return true;
  };

  /* =======================================================
     SAVE TASK
     ======================================================= */

  const saveTask =
    async event => {

      event.preventDefault();

      setMessage('');

      if (!validateForm()) {
        return;
      }

      setSaving(true);

      try {

        const payload = {
          student_id:
            Number(
              form.student_id
            ),

          title:
            form.title.trim(),

          description:
            form.description.trim(),

          due_date:
            form.due_date,

          status:
            form.status.trim()
        };

        /* CREATE */

        if (!editingId) {

          const response =
            await api.post(
              '/tasks',
              payload
            );

          setMessage(
            response.data?.message ||
            'Task added successfully.'
          );

        }

        /* UPDATE */

        else {

          const response =
            await api.put(
              `/tasks/${editingId}`,
              payload
            );

          setMessage(
            response.data?.message ||
            `Task #${editingId} updated successfully.`
          );

        }

        setMessageType(
          'success'
        );

        setShowModal(false);

        resetForm();

        await loadTasks();

      } catch (error) {

        console.error(
          'Save task error:',
          error
        );

        setMessage(
          error.response?.data?.message ||
          'Failed to save task.'
        );

        setMessageType(
          'error'
        );

      } finally {

        setSaving(false);

      }

    };

  /* =======================================================
     DELETE TASK
     ======================================================= */

  const deleteTask =
    async task => {

      const confirmed =
        window.confirm(
          `Are you sure you want to delete Task #${task.task_id}?`
        );

      if (!confirmed) {
        return;
      }

      setMessage('');

      try {

        const response =
          await api.delete(
            `/tasks/${task.task_id}`
          );

        setMessage(
          response.data?.message ||
          `Task #${task.task_id} deleted successfully.`
        );

        setMessageType(
          'success'
        );

        await loadTasks();

      } catch (error) {

        console.error(
          'Delete task error:',
          error
        );

        setMessage(
          error.response?.data?.message ||
          'Failed to delete task.'
        );

        setMessageType(
          'error'
        );

      }

    };

  /* =======================================================
     SEARCH + FILTER
     ======================================================= */

  const filteredTasks =
    records.filter(
      task => {

        const query =
          search
            .toLowerCase()
            .trim();

        const matchesSearch =
          String(
            task.task_id ||
            ''
          )
            .toLowerCase()
            .includes(query) ||

          String(
            task.student_id ||
            ''
          )
            .toLowerCase()
            .includes(query) ||

          String(
            task.student_name ||
            task.name ||
            ''
          )
            .toLowerCase()
            .includes(query) ||

          String(
            task.title ||
            task.task ||
            ''
          )
            .toLowerCase()
            .includes(query) ||

          String(
            task.description ||
            ''
          )
            .toLowerCase()
            .includes(query) ||

          String(
            task.status ||
            ''
          )
            .toLowerCase()
            .includes(query);

        const matchesStatus =
          statusFilter === 'all' ||
          String(
            task.status ||
            ''
          ).toLowerCase() ===
          statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );

      }
    );

  /* =======================================================
     STATISTICS
     ======================================================= */

  const totalTasks =
    records.length;

  const pendingTasks =
    records.filter(
      task =>
        String(
          task.status || ''
        ).toLowerCase() ===
        'pending'
    ).length;

  const completedTasks =
    records.filter(
      task =>
        String(
          task.status || ''
        ).toLowerCase() ===
        'completed'
    ).length;

  const overdueTasks =
    records.filter(task => {

      if (
        !task.due_date ||
        String(
          task.status || ''
        ).toLowerCase() ===
          'completed'
      ) {
        return false;
      }

      const due =
        new Date(
          task.due_date
        );

      const today =
        new Date();

      due.setHours(
        23,
        59,
        59,
        999
      );

      return due < today;

    }).length;

  return (
    <div className="content">

      <Header
        title="Tasks"
        sub="Manage academic and student-related tasks."
        action={

          <div
            style={{
              display:
                'flex',
              gap:
                '8px',
              flexWrap:
                'wrap'
            }}
          >

            <button
              type="button"
              className="small"
              onClick={
                loadTasks
              }
              disabled={
                loading
              }
              style={{
                display:
                  'flex',
                alignItems:
                  'center',
                gap:
                  '6px'
              }}
            >

              <RefreshCw
                size={15}
              />

              {loading
                ? 'Refreshing...'
                : 'Refresh'}

            </button>

            <button
              type="button"
              className="primary small"
              onClick={
                openAddModal
              }
            >
              + Add Task
            </button>

          </div>

        }
      />

      {/* MESSAGE */}

      {message && (

        <div
          className="card"
          style={{
            marginBottom:
              '20px',
            padding:
              '13px 16px',
            borderLeft:
              messageType ===
              'error'
                ? '4px solid #dc2626'
                : '4px solid #16a085',
            background:
              messageType ===
              'error'
                ? '#fff5f5'
                : '#f0fdf4'
          }}
        >
          {message}
        </div>

      )}

      {/* FILTERS */}

      <div
        style={{
          display:
            'flex',
          gap:
            '10px',
          flexWrap:
            'wrap',
          marginBottom:
            '20px'
        }}
      >

        <div
          className="search"
          style={{
            flex:
              '1 1 300px',
            minWidth:
              '250px',
            marginBottom:
              0
          }}
        >

          <Search
            size={17}
          />

          <input
            placeholder="Search by task, student, status or description..."
            value={
              search
            }
            onChange={
              event =>
                setSearch(
                  event.target.value
                )
            }
          />

        </div>

        <select
          value={
            statusFilter
          }
          onChange={
            event =>
              setStatusFilter(
                event.target.value
              )
          }
          style={{
            minWidth:
              '150px',
            height:
              '42px',
            padding:
              '8px 12px',
            borderRadius:
              '8px',
            border:
              '1px solid #d9dee7',
            background:
              '#ffffff'
          }}
        >

          <option value="all">
            All Status
          </option>

          <option value="pending">
            Pending
          </option>

          <option value="in progress">
            In Progress
          </option>

          <option value="completed">
            Completed
          </option>

          <option value="overdue">
            Overdue
          </option>

        </select>

      </div>

      {/* SUMMARY */}

      <div
        className="stats four"
        style={{
          marginBottom:
            '20px'
        }}
      >

        <Stat
          icon={ClipboardList}
          label="Total Tasks"
          value={
            totalTasks
          }
        />

        <Stat
          icon={Activity}
          label="Pending"
          value={
            pendingTasks
          }
          kind="yellow"
        />

        <Stat
          icon={CheckCircle2}
          label="Completed"
          value={
            completedTasks
          }
        />

        <Stat
          icon={AlertTriangle}
          label="Overdue"
          value={
            overdueTasks
          }
          kind="red"
        />

      </div>

      {/* TABLE */}

      <Card title="Task Records">

        {!filteredTasks.length ? (

          <Empty>

            {records.length
              ? 'No tasks match your search or filter.'
              : 'No task records found in the database.'}

          </Empty>

        ) : (

          <div
            className="tablewrap"
          >

            <table>

              <thead>

                <tr>

                  <th>
                    Task ID
                  </th>

                  <th>
                    Student
                  </th>

                  <th>
                    Task
                  </th>

                  <th>
                    Description
                  </th>

                  <th>
                    Due Date
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredTasks.map(
                  task => (

                    <tr
                      key={
                        task.task_id
                      }
                    >

                      <td>
                        #
                        {
                          task.task_id
                        }
                      </td>

                      <td>

                        <div>

                          <b>
                            {
                              task.student_name ||
                              task.name ||
                              `Student #${task.student_id}`
                            }
                          </b>

                          <small
                            style={{
                              display:
                                'block',
                              marginTop:
                                '3px'
                            }}
                          >
                            Student ID: #
                            {
                              task.student_id ??
                              '—'
                            }
                          </small>

                        </div>

                      </td>

                      <td>

                        <b>
                          {
                            task.title ||
                            task.task ||
                            '—'
                          }
                        </b>

                      </td>

                      <td>
                        {
                          task.description ||
                          '—'
                        }
                      </td>

                      <td>
                        {
                          date(
                            task.due_date
                          )
                        }
                      </td>

                      <td>

                        <Badge>
                          {
                            task.status ||
                            '—'
                          }
                        </Badge>

                      </td>

                      <td>

                        <div
                          style={{
                            display:
                              'flex',
                            gap:
                              '7px',
                            flexWrap:
                              'wrap'
                          }}
                        >

                          <button
                            type="button"
                            className="small"
                            onClick={() =>
                              openEditModal(
                                task
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="small"
                            onClick={() =>
                              deleteTask(
                                task
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </Card>

      {/* =================================================
          TASK MODAL
          ================================================= */}

      {showModal && (

        <div
          onClick={event => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }

          }}
          style={{
            position:
              'fixed',
            inset:
              0,
            background:
              'rgba(15, 23, 42, 0.55)',
            display:
              'flex',
            alignItems:
              'center',
            justifyContent:
              'center',
            padding:
              '20px',
            zIndex:
              9999
          }}
        >

          <div
            style={{
              width:
                '100%',
              maxWidth:
                '680px',
              maxHeight:
                '90vh',
              overflowY:
                'auto',
              background:
                '#ffffff',
              borderRadius:
                '16px',
              boxShadow:
                '0 25px 60px rgba(0,0,0,.20)'
            }}
          >

            {/* HEADER */}

            <div
              style={{
                display:
                  'flex',
                alignItems:
                  'center',
                justifyContent:
                  'space-between',
                padding:
                  '20px 22px',
                borderBottom:
                  '1px solid #e5e7eb'
              }}
            >

              <div>

                <h2
                  style={{
                    margin:
                      0,
                    fontSize:
                      '20px'
                  }}
                >

                  {editingId
                    ? 'Edit Task'
                    : 'Add Task'}

                </h2>

                <p
                  style={{
                    margin:
                      '5px 0 0',
                    color:
                      '#6b7280',
                    fontSize:
                      '13px'
                  }}
                >

                  {editingId
                    ? `Update Task #${editingId}.`
                    : 'Create a new student-related task.'}

                </p>

              </div>

              <button
                type="button"
                className="small"
                onClick={
                  closeModal
                }
                disabled={
                  saving
                }
                style={{
                  width:
                    '36px',
                  height:
                    '36px',
                  padding:
                    0,
                  display:
                    'flex',
                  alignItems:
                    'center',
                  justifyContent:
                    'center'
                }}
              >

                <X
                  size={18}
                />

              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                saveTask
              }
              noValidate
              style={{
                padding:
                  '22px'
              }}
            >

              <div
                style={{
                  display:
                    'grid',
                  gridTemplateColumns:
                    'repeat(2, minmax(0, 1fr))',
                  gap:
                    '16px'
                }}
              >

                {/* STUDENT */}

                <div
                  style={{
                    gridColumn:
                      '1 / -1'
                  }}
                >

                  <label
                    style={{
                      display:
                        'block',
                      marginBottom:
                        '6px',
                      fontWeight:
                        600
                    }}
                  >
                    Student *
                  </label>

                  <select
                    name="student_id"
                    value={
                      form.student_id
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      Boolean(
                        editingId
                      )
                    }
                    style={{
                      width:
                        '100%',
                      height:
                        '42px',
                      padding:
                        '8px 12px',
                      borderRadius:
                        '8px',
                      border:
                        '1px solid #d9dee7',
                      background:
                        '#ffffff'
                    }}
                  >

                    <option value="">
                      Select student
                    </option>

                    {students.map(
                      student => (

                        <option
                          key={
                            student.student_id
                          }
                          value={
                            student.student_id
                          }
                        >
                          #
                          {
                            student.student_id
                          }
                          {' — '}
                          {
                            student.name ||
                            `Student #${student.student_id}`
                          }
                          {' — Grade '}
                          {
                            student.grade_level ||
                            '—'
                          }
                        </option>

                      )
                    )}

                  </select>

                  {!students.length && (

                    <small
                      style={{
                        display:
                          'block',
                        marginTop:
                          '6px',
                        color:
                          '#6b7280'
                      }}
                    >
                      No student records are available.
                    </small>

                  )}

                  {editingId && (

                    <small
                      style={{
                        display:
                          'block',
                        marginTop:
                          '6px',
                        color:
                          '#6b7280'
                      }}
                    >
                      The linked student cannot be changed while editing.
                    </small>

                  )}

                </div>

                {/* TASK TITLE */}

                <div
                  style={{
                    gridColumn:
                      '1 / -1'
                  }}
                >

                  <label
                    style={{
                      display:
                        'block',
                      marginBottom:
                        '6px',
                      fontWeight:
                        600
                    }}
                  >
                    Task Title *
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={
                      form.title
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Mathematics Assignment"
                    maxLength={255}
                    style={{
                      width:
                        '100%'
                    }}
                  />

                </div>

                {/* DESCRIPTION */}

                <div
                  style={{
                    gridColumn:
                      '1 / -1'
                  }}
                >

                  <label
                    style={{
                      display:
                        'block',
                      marginBottom:
                        '6px',
                      fontWeight:
                        600
                    }}
                  >
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      form.description
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter task details..."
                    rows={4}
                    maxLength={1000}
                    style={{
                      width:
                        '100%',
                      resize:
                        'vertical',
                      padding:
                        '10px 12px',
                      borderRadius:
                        '8px',
                      border:
                        '1px solid #d9dee7',
                      fontFamily:
                        'inherit'
                    }}
                  />

                </div>

                {/* DUE DATE */}

                <div>

                  <label
                    style={{
                      display:
                        'block',
                      marginBottom:
                        '6px',
                      fontWeight:
                        600
                    }}
                  >
                    Due Date *
                  </label>

                  <input
                    type="date"
                    name="due_date"
                    value={
                      form.due_date
                    }
                    onChange={
                      handleChange
                    }
                    style={{
                      width:
                        '100%'
                    }}
                  />

                </div>

                {/* STATUS */}

                <div>

                  <label
                    style={{
                      display:
                        'block',
                      marginBottom:
                        '6px',
                      fontWeight:
                        600
                    }}
                  >
                    Status *
                  </label>

                  <select
                    name="status"
                    value={
                      form.status
                    }
                    onChange={
                      handleChange
                    }
                    style={{
                      width:
                        '100%',
                      height:
                        '42px',
                      padding:
                        '8px 12px',
                      borderRadius:
                        '8px',
                      border:
                        '1px solid #d9dee7',
                      background:
                        '#ffffff'
                    }}
                  >

                    <option value="Pending">
                      Pending
                    </option>

                    <option value="In Progress">
                      In Progress
                    </option>

                    <option value="Completed">
                      Completed
                    </option>

                    <option value="Overdue">
                      Overdue
                    </option>

                  </select>

                </div>

              </div>

              {/* BUTTONS */}

              <div
                style={{
                  display:
                    'flex',
                  justifyContent:
                    'flex-end',
                  gap:
                    '10px',
                  marginTop:
                    '24px',
                  paddingTop:
                    '18px',
                  borderTop:
                    '1px solid #e5e7eb'
                }}
              >

                <button
                  type="button"
                  className="small"
                  onClick={
                    closeModal
                  }
                  disabled={
                    saving
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary"
                  disabled={
                    saving
                  }
                >

                  {saving
                    ? 'Saving...'
                    : editingId
                    ? 'Save Changes'
                    : 'Create Task'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

/* =========================================================
   HEALTH RECORDS - CRUD
   ========================================================= */

function HealthRecords({
  role
}) {
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    student_id: '',
    medical_condition: '',
    allergies: '',
    medications: '',
    blood_type: '',
    emergency_contact: '',
    emergency_contact_number: '',
    remarks: ''
  });

  const canCreate = ['admin', 'teacher'].includes(role);
  const canUpdate = ['admin', 'teacher'].includes(role);
  const canDelete = role === 'admin';

  const loadHealthRecords = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await api.get('/health', {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache'
        }
      });

      const data = arr(response.data);
      setRecords(data);
      setMessage(`Health records loaded successfully. ${data.length} record(s) found.`);
      setMessageType('success');
    } catch (error) {
      console.error('Load health records error:', error);
      setMessage(
        error.response?.data?.message ||
        error.message ||
        'Failed to load health records.'
      );
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(arr(response.data));
    } catch (error) {
      console.error('Load health students error:', error);
    }
  };

  useEffect(() => {
    loadHealthRecords();
    if (canCreate || canUpdate) {
      loadStudents();
    }
  }, [role]);

  const handleChange = event => {
    const { name, value } = event.target;
    setForm(previous => ({
      ...previous,
      [name]: value
    }));
  };

  const resetForm = () => {
    setForm({
      student_id: '',
      medical_condition: '',
      allergies: '',
      medications: '',
      blood_type: '',
      emergency_contact: '',
      emergency_contact_number: '',
      remarks: ''
    });
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setMessage('');
    setShowModal(true);
  };

  const openEditModal = record => {
    setEditingId(record.health_id);
    setForm({
      student_id: record.student_id ?? '',
      medical_condition: record.medical_condition || '',
      allergies: record.allergies || '',
      medications: record.medications || '',
      blood_type: record.blood_type || '',
      emergency_contact: record.emergency_contact || '',
      emergency_contact_number: record.emergency_contact_number || '',
      remarks: record.remarks || ''
    });
    setMessage('');
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    resetForm();
  };

  const validateForm = () => {
    const studentId = Number(form.student_id);

    if (!Number.isInteger(studentId) || studentId <= 0) {
      setMessage('Please select a valid student.');
      setMessageType('error');
      return false;
    }

    if (!form.medical_condition.trim()) {
      setMessage('Medical condition is required.');
      setMessageType('error');
      return false;
    }

    if (!editingId) {
      const duplicateExists = records.some(
        record => Number(record.student_id) === studentId
      );

      if (duplicateExists) {
        setMessage(
          `Student #${studentId} already has a health record. Please select another student.`
        );
        setMessageType('error');
        return false;
      }
    }

    return true;
  };

  const saveHealthRecord = async event => {
    event.preventDefault();
    setMessage('');

    if (!validateForm()) return;

    setSaving(true);

    const payload = {
      student_id: Number(form.student_id),
      medical_condition: form.medical_condition.trim(),
      allergies: form.allergies.trim(),
      medications: form.medications.trim(),
      blood_type: form.blood_type.trim(),
      emergency_contact: form.emergency_contact.trim(),
      emergency_contact_number: form.emergency_contact_number.trim(),
      remarks: form.remarks.trim()
    };

    try {
      if (!editingId) {
        const response = await api.post('/health', payload);
        setMessage(
          response.data?.message ||
          'Health record created successfully.'
        );
      } else {
        const response = await api.put(
          `/health/${editingId}`,
          payload
        );
        setMessage(
          response.data?.message ||
          `Health record #${editingId} updated successfully.`
        );
      }

      setMessageType('success');
      setShowModal(false);
      resetForm();
      await loadHealthRecords();
    } catch (error) {
      console.error('Save health record error:', error);
      setMessage(
        error.response?.data?.message ||
        'Failed to save health record.'
      );
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const deleteHealthRecord = async record => {
    const confirmed = window.confirm(
      `Are you sure you want to delete Health Record #${record.health_id}?`
    );

    if (!confirmed) return;

    setMessage('');

    try {
      const response = await api.delete(
        `/health/${record.health_id}`
      );

      setMessage(
        response.data?.message ||
        `Health record #${record.health_id} deleted successfully.`
      );
      setMessageType('success');
      await loadHealthRecords();
    } catch (error) {
      console.error('Delete health record error:', error);
      setMessage(
        error.response?.data?.message ||
        'Failed to delete health record.'
      );
      setMessageType('error');
    }
  };

  const filteredRecords = records.filter(record => {
    const query = search.toLowerCase().trim();

    return [
      record.health_id,
      record.student_id,
      record.student_name,
      record.name,
      record.medical_condition,
      record.allergies,
      record.medications,
      record.blood_type,
      record.emergency_contact,
      record.emergency_contact_number,
      record.remarks
    ]
      .map(value => String(value || '').toLowerCase())
      .some(value => value.includes(query));
  });

  // One health record per student. On CREATE, students that already have
  // a health record are excluded from the dropdown. On EDIT, the current
  // student remains available so the existing record can still be updated.
  const usedStudentIds = new Set(
    records
      .map(record => Number(record.student_id))
      .filter(Number.isInteger)
  );

  const availableStudents = students.filter(student => {
    const studentId = Number(student.student_id);

    return (
      !usedStudentIds.has(studentId) ||
      studentId === Number(form.student_id)
    );
  });

  return (
    <div className="content">
      <Header
        title="Health Records"
        sub="Manage and monitor student health information."
        action={
          <div
            style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap'
            }}
          >
            <button
              type="button"
              className="small"
              onClick={loadHealthRecords}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={15} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>

            {canCreate && (
              <button
                type="button"
                className="primary small"
                onClick={openAddModal}
              >
                + Add Health Record
              </button>
            )}
          </div>
        }
      />

      {message && (
        <div
          className="card"
          style={{
            marginBottom: '20px',
            padding: '13px 16px',
            borderLeft:
              messageType === 'error'
                ? '4px solid #dc2626'
                : '4px solid #16a085',
            background:
              messageType === 'error'
                ? '#fff5f5'
                : '#f0fdf4'
          }}
        >
          {message}
        </div>
      )}

      <div
        className="search"
        style={{
          maxWidth: '650px',
          marginBottom: '20px'
        }}
      >
        <Search size={17} />
        <input
          placeholder="Search by health ID, student, condition, allergy or blood type..."
          value={search}
          onChange={event => setSearch(event.target.value)}
        />
      </div>

      <div className="stats four">
        <Stat
          icon={Activity}
          label="Total Records"
          value={records.length}
        />

        <Stat
          icon={Users}
          label="Students Covered"
          value={new Set(
            records
              .map(record => record.student_id)
              .filter(Boolean)
          ).size}
          kind="blue"
        />

        <Stat
          icon={AlertTriangle}
          label="With Allergies"
          value={records.filter(record =>
            String(record.allergies || '').trim()
          ).length}
          kind="yellow"
        />

        <Stat
          icon={CheckCircle2}
          label="With Emergency Contact"
          value={records.filter(record =>
            String(record.emergency_contact_number || '').trim()
          ).length}
        />
      </div>

      <Card title="Student Health Records">
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Health ID</th>
                <th>Student</th>
                <th>Medical Condition</th>
                <th>Allergies</th>
                <th>Medications</th>
                <th>Blood Type</th>
                <th>Emergency Contact</th>
                <th>Contact Number</th>
                <th>Remarks</th>
                <th>Created</th>
                {canUpdate || canDelete ? (
                  <th
                    style={{
                      position: 'sticky',
                      right: 0,
                      background: '#fafbf9',
                      zIndex: 3
                    }}
                  >
                    Actions
                  </th>
                ) : null}
              </tr>
            </thead>

            <tbody>
              {filteredRecords.length ? (
                filteredRecords.map(record => (
                  <tr key={record.health_id}>
                    <td>
                      <b>#{record.health_id}</b>
                    </td>

                    <td>
                      <b>
                        {record.student_name ||
                          record.name ||
                          `Student #${record.student_id}`}
                      </b>
                      <small
                        style={{
                          display: 'block',
                          marginTop: '3px'
                        }}
                      >
                        Student ID: #{record.student_id}
                      </small>
                    </td>

                    <td>{record.medical_condition || '—'}</td>
                    <td>{record.allergies || 'None reported'}</td>
                    <td>{record.medications || 'None reported'}</td>
                    <td>
                      {record.blood_type ? (
                        <Badge>{record.blood_type}</Badge>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td>{record.emergency_contact || '—'}</td>
                    <td>{record.emergency_contact_number || '—'}</td>
                    <td>{record.remarks || '—'}</td>
                    <td>{date(record.created_at)}</td>

                    {(canUpdate || canDelete) && (
                      <td
                        style={{
                          position: 'sticky',
                          right: 0,
                          background: '#ffffff',
                          zIndex: 2
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            gap: '6px',
                            flexWrap: 'wrap'
                          }}
                        >
                          {canUpdate && (
                            <button
                              type="button"
                              className="small"
                              onClick={() =>
                                openEditModal(record)
                              }
                            >
                              Edit
                            </button>
                          )}

                          {canDelete && (
                            <button
                              type="button"
                              className="small"
                              onClick={() =>
                                deleteHealthRecord(record)
                              }
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={
                      canUpdate || canDelete ? 11 : 10
                    }
                  >
                    <Empty>
                      No health records found.
                    </Empty>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && (
        <div
          className="backdrop"
          style={{
            display: 'grid',
            placeItems: 'center',
            padding: '20px',
            zIndex: 40
          }}
        >
          <div
            className="card"
            style={{
              width: 'min(900px, 100%)',
              maxHeight: '90vh',
              overflowY: 'auto',
              margin: 0
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '15px',
                borderBottom: '1px solid #e5e7eb',
                paddingBottom: '16px',
                marginBottom: '20px'
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>
                  {editingId
                    ? 'Edit Health Record'
                    : 'Add Health Record'}
                </h2>
                <p
                  style={{
                    margin: '5px 0 0',
                    color: '#6b7280',
                    fontSize: '13px'
                  }}
                >
                  {editingId
                    ? `Update Health Record #${editingId}.`
                    : 'Enter the student health information.'}
                </p>
              </div>

              <button
                type="button"
                className="small"
                onClick={closeModal}
                disabled={saving}
              >
                X
              </button>
            </div>

            <form onSubmit={saveHealthRecord}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(2, minmax(0, 1fr))',
                  gap: '16px'
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontWeight: 600
                    }}
                  >
                    Student *
                  </label>
                  <select
                    name="student_id"
                    value={form.student_id}
                    onChange={handleChange}
                    disabled={Boolean(editingId)}
                    required
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #d9dee7',
                      background: '#ffffff'
                    }}
                  >
                    <option value="">
                      Select student
                    </option>

                    {availableStudents.map(student => (
                      <option
                        key={student.student_id}
                        value={student.student_id}
                      >
                        #{student.student_id} —{' '}
                        {student.name || 'Student'}
                      </option>
                    ))}
                  </select>

                  {!students.length && (
                    <small
                      style={{
                        display: 'block',
                        marginTop: '6px',
                        color: '#6b7280'
                      }}
                    >
                      No students are available for a new health record.
                    </small>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontWeight: 600
                    }}
                  >
                    Blood Type
                  </label>
                  <select
                    name="blood_type"
                    value={form.blood_type}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #d9dee7',
                      background: '#ffffff'
                    }}
                  >
                    <option value="">
                      Select blood type
                    </option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontWeight: 600
                    }}
                  >
                    Medical Condition *
                  </label>
                  <input
                    type="text"
                    name="medical_condition"
                    value={form.medical_condition}
                    onChange={handleChange}
                    placeholder="e.g. Asthma"
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontWeight: 600
                    }}
                  >
                    Allergies
                  </label>
                  <input
                    type="text"
                    name="allergies"
                    value={form.allergies}
                    onChange={handleChange}
                    placeholder="e.g. Peanuts"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontWeight: 600
                    }}
                  >
                    Medications
                  </label>
                  <input
                    type="text"
                    name="medications"
                    value={form.medications}
                    onChange={handleChange}
                    placeholder="e.g. Inhaler"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontWeight: 600
                    }}
                  >
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    name="emergency_contact"
                    value={form.emergency_contact}
                    onChange={handleChange}
                    placeholder="e.g. Parent / Guardian"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontWeight: 600
                    }}
                  >
                    Emergency Contact Number
                  </label>
                  <input
                    type="text"
                    name="emergency_contact_number"
                    value={form.emergency_contact_number}
                    onChange={handleChange}
                    placeholder="e.g. 09171234567"
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontWeight: 600
                    }}
                  >
                    Remarks
                  </label>
                  <textarea
                    name="remarks"
                    value={form.remarks}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Additional health notes or special instructions"
                    style={{
                      width: '100%',
                      minHeight: '100px',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '24px',
                  paddingTop: '18px',
                  borderTop: '1px solid #e5e7eb'
                }}
              >
                <button
                  type="button"
                  className="small"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary"
                  disabled={saving}
                >
                  {saving
                    ? 'Saving...'
                    : editingId
                    ? 'Save Changes'
                    : 'Create Health Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   RISK ALERTS - CRUD
   ========================================================= */

function Alerts({
  role
}) {
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);

  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkCandidates, setBulkCandidates] = useState([]);
  const [selectedCandidateKeys, setSelectedCandidateKeys] = useState([]);

  const [form, setForm] = useState({
    student_id: '',
    alert_type: '',
    severity: 'medium',
    description: '',
    status: 'open'
  });

  const canCreate = [
    'admin',
    'department_head',
    'teacher'
  ].includes(role);

  const canUpdate = [
    'admin',
    'principal',
    'department_head',
    'teacher'
  ].includes(role);

  const canDelete = role === 'admin';

  /* =======================================================
     LOAD ALERTS
     ======================================================= */

  const loadAlerts = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await api.get('/risk-alerts', {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache'
        }
      });

      const alerts = arr(response.data);
      setRecords(alerts);

      setMessage(
        `Risk alerts loaded successfully. ${alerts.length} record(s) found.`
      );
      setMessageType('success');
    } catch (error) {
      console.error('Risk Alerts FULL ERROR:', error);

      setMessage(
        error.response?.data?.message ||
        error.message ||
        'Failed to load risk alerts.'
      );
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     LOAD STUDENTS
     ======================================================= */

  const loadStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(arr(response.data));
    } catch (error) {
      console.error('Load students error:', error);
    }
  };

  /* =======================================================
     INITIAL LOAD
     ======================================================= */

  useEffect(() => {
    loadAlerts();

    if (canCreate || canUpdate) {
      loadStudents();
    }
  }, [role]);

  /* =======================================================
     FORM
     ======================================================= */

  const handleChange = event => {
    const { name, value } = event.target;

    setForm(previous => ({
      ...previous,
      [name]: value
    }));
  };

  const resetForm = () => {
    setForm({
      student_id: '',
      alert_type: '',
      severity: 'medium',
      description: '',
      status: 'open'
    });

    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setMessage('');
    setShowModal(true);
  };

  const openEditModal = alert => {
    setEditingId(alert.alert_id);

    setForm({
      student_id: alert.student_id ?? '',
      alert_type: alert.alert_type || '',
      severity: alert.severity || 'medium',
      description: alert.description || '',
      status: alert.status || 'open'
    });

    setMessage('');
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    resetForm();
  };

  /* =======================================================
     VALIDATE
     ======================================================= */

  const validateForm = () => {
    const studentId = Number(form.student_id);
    const alertType = form.alert_type.trim();
    const severity = form.severity.trim();
    const status = form.status.trim();

    if (!Number.isInteger(studentId) || studentId <= 0) {
      setMessage('Please select a valid student.');
      setMessageType('error');
      return false;
    }

    if (!alertType) {
      setMessage('Alert type is required.');
      setMessageType('error');
      return false;
    }

    if (!['low', 'medium', 'high'].includes(severity)) {
      setMessage('Please select a valid severity.');
      setMessageType('error');
      return false;
    }

    if (!['open', 'resolved', 'closed'].includes(status)) {
      setMessage('Please select a valid status.');
      setMessageType('error');
      return false;
    }

    return true;
  };

  /* =======================================================
     CREATE / UPDATE
     ======================================================= */

  const saveAlert = async event => {
    event.preventDefault();
    setMessage('');

    if (!validateForm()) return;

    setSaving(true);

    try {
      const payload = {
        student_id: Number(form.student_id),
        alert_type: form.alert_type.trim(),
        severity: form.severity.trim(),
        description: form.description.trim(),
        status: form.status.trim()
      };

      if (!editingId) {
        const response = await api.post(
          '/risk-alerts',
          payload
        );

        setMessage(
          response.data?.message ||
          'Risk alert created successfully.'
        );
      } else {
        const response = await api.put(
          `/risk-alerts/${editingId}`,
          payload
        );

        setMessage(
          response.data?.message ||
          `Risk Alert #${editingId} updated successfully.`
        );
      }

      setMessageType('success');
      setShowModal(false);
      resetForm();

      await loadAlerts();
    } catch (error) {
      console.error('Save risk alert error:', error);

      setMessage(
        error.response?.data?.message ||
        'Failed to save risk alert.'
      );
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     BULK RISK SCAN
     ======================================================= */

  const makeCandidateKey = candidate =>
    `${candidate.student_id}-${candidate.alert_type}`;

  const scanForRiskAlerts = async () => {
    setBulkLoading(true);
    setMessage('');
    setBulkCandidates([]);
    setSelectedCandidateKeys([]);

    try {
      const [studentsResponse, gradesResponse, attendanceResponse, alertsResponse] =
        await Promise.all([
          api.get('/students'),
          api.get('/academic-records'),
          api.get('/attendance'),
          api.get('/risk-alerts')
        ]);

      const studentRows = arr(studentsResponse.data);
      const gradeRows = arr(gradesResponse.data);
      const attendanceRows = arr(attendanceResponse.data);
      const alertRows = arr(alertsResponse.data);

      const gradeMap = {};
      const attendanceMap = {};

      gradeRows.forEach(record => {
        const studentId = Number(record.student_id);
        const grade = Number(
          record.grade ?? record.average
        );

        if (!Number.isFinite(studentId) || !Number.isFinite(grade)) {
          return;
        }

        if (!gradeMap[studentId]) {
          gradeMap[studentId] = [];
        }

        gradeMap[studentId].push(grade);
      });

      attendanceRows.forEach(record => {
        const studentId = Number(record.student_id);

        if (!Number.isFinite(studentId)) {
          return;
        }

        if (!attendanceMap[studentId]) {
          attendanceMap[studentId] = {
            absent: 0,
            late: 0
          };
        }

        const status = String(
          record.status || ''
        ).toLowerCase();

        if (status === 'absent') {
          attendanceMap[studentId].absent += 1;
        }

        if (status === 'late') {
          attendanceMap[studentId].late += 1;
        }
      });

      const existingOpenKeys = new Set(
        alertRows
          .filter(alert =>
            String(alert.status || '').toLowerCase() === 'open'
          )
          .map(alert =>
            `${Number(alert.student_id)}-${String(alert.alert_type || '')}`
          )
      );

      const candidates = [];

      studentRows.forEach(student => {
        const studentId = Number(student.student_id);

        if (!Number.isFinite(studentId)) {
          return;
        }

        const studentName =
          student.student_name ||
          student.name ||
          `Student #${studentId}`;

        const grades = gradeMap[studentId] || [];
        const average = grades.length
          ? grades.reduce(
              (total, grade) => total + grade,
              0
            ) / grades.length
          : null;

        const attendance =
          attendanceMap[studentId] || {
            absent: 0,
            late: 0
          };

        const addCandidate = (
          alertType,
          severity,
          description,
          reason
        ) => {
          const key = `${studentId}-${alertType}`;

          if (existingOpenKeys.has(key)) {
            return;
          }

          if (
            candidates.some(
              candidate =>
                makeCandidateKey(candidate) === key
            )
          ) {
            return;
          }

          candidates.push({
            key,
            student_id: studentId,
            student_name: studentName,
            alert_type: alertType,
            severity,
            description,
            reason
          });
        };

        if (average !== null && average < 75) {
          addCandidate(
            'Low Academic Performance',
            'high',
            `Average grade is ${average.toFixed(1)}%. Student needs academic monitoring.`,
            `Average grade: ${average.toFixed(1)}%`
          );
        } else if (average !== null && average < 80) {
          addCandidate(
            'Academic Risk',
            'medium',
            `Average grade is ${average.toFixed(1)}%. Student should be monitored.`,
            `Average grade: ${average.toFixed(1)}%`
          );
        }

        if (attendance.absent >= 2) {
          addCandidate(
            'Repeated Absences',
            'medium',
            `Student has ${attendance.absent} recorded absences. Attendance monitoring is recommended.`,
            `Absences: ${attendance.absent}`
          );
        }

        if (attendance.late >= 3) {
          addCandidate(
            'Attendance Concern',
            'low',
            `Student has ${attendance.late} recorded late entries. Attendance follow-up is recommended.`,
            `Late entries: ${attendance.late}`
          );
        }
      });

      setBulkCandidates(candidates);
      setSelectedCandidateKeys(
        candidates.map(candidate => candidate.key)
      );

      if (!candidates.length) {
        setMessage(
          'No new risk alerts detected. Existing open alerts were skipped to prevent duplicates.'
        );
        setMessageType('success');
      } else {
        setMessage(
          `${candidates.length} risk alert candidate(s) found. Review and select which ones to create.`
        );
        setMessageType('success');
      }
    } catch (error) {
      console.error('Risk scan error:', error);

      setMessage(
        error.response?.data?.message ||
        'Failed to scan students for risk alerts.'
      );
      setMessageType('error');
    } finally {
      setBulkLoading(false);
    }
  };

  const toggleCandidate = key => {
    setSelectedCandidateKeys(previous =>
      previous.includes(key)
        ? previous.filter(item => item !== key)
        : [...previous, key]
    );
  };

  const selectAllCandidates = checked => {
    setSelectedCandidateKeys(
      checked
        ? bulkCandidates.map(candidate => candidate.key)
        : []
    );
  };

  const createSelectedAlerts = async () => {
    const selected = bulkCandidates.filter(
      candidate =>
        selectedCandidateKeys.includes(candidate.key)
    );

    if (!selected.length) {
      setMessage('Please select at least one risk alert.');
      setMessageType('error');
      return;
    }

    setSaving(true);
    setMessage('');

    let created = 0;
    let failed = 0;

    try {
      for (const candidate of selected) {
        try {
          await api.post('/risk-alerts', {
            student_id: candidate.student_id,
            alert_type: candidate.alert_type,
            severity: candidate.severity,
            description: candidate.description,
            status: 'open'
          });

          created += 1;
        } catch (error) {
          console.error(
            `Failed to create alert for Student #${candidate.student_id}:`,
            error
          );

          failed += 1;
        }
      }

      setShowBulkModal(false);
      setBulkCandidates([]);
      setSelectedCandidateKeys([]);

      if (failed) {
        setMessage(
          `Bulk creation finished: ${created} created, ${failed} failed.`
        );
        setMessageType('error');
      } else {
        setMessage(
          `${created} risk alert(s) created successfully.`
        );
        setMessageType('success');
      }

      await loadAlerts();
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     DELETE
     ======================================================= */

  const deleteAlert = async alert => {
    const confirmed = window.confirm(
      `Are you sure you want to delete Risk Alert #${alert.alert_id}?`
    );

    if (!confirmed) return;

    setMessage('');

    try {
      const response = await api.delete(
        `/risk-alerts/${alert.alert_id}`
      );

      setMessage(
        response.data?.message ||
        `Risk Alert #${alert.alert_id} deleted successfully.`
      );
      setMessageType('success');

      await loadAlerts();
    } catch (error) {
      console.error('Delete risk alert error:', error);

      setMessage(
        error.response?.data?.message ||
        'Failed to delete risk alert.'
      );
      setMessageType('error');
    }
  };

  /* =======================================================
     QUICK STATUS UPDATE
     ======================================================= */

  const updateStatus = async (alert, newStatus) => {
    try {
      const response = await api.put(
        `/risk-alerts/${alert.alert_id}`,
        {
          student_id: alert.student_id,
          alert_type: alert.alert_type,
          severity: alert.severity,
          description: alert.description || '',
          status: newStatus
        }
      );

      setMessage(
        response.data?.message ||
        `Risk Alert #${alert.alert_id} status updated to ${newStatus}.`
      );
      setMessageType('success');

      await loadAlerts();
    } catch (error) {
      console.error('Update alert status error:', error);

      setMessage(
        error.response?.data?.message ||
        'Failed to update alert status.'
      );
      setMessageType('error');
    }
  };

  /* =======================================================
     SEARCH + FILTER
     ======================================================= */

  const filteredAlerts = records.filter(alert => {
    const query = search.toLowerCase().trim();

    const matchesSearch =
      String(alert.alert_id || '')
        .toLowerCase()
        .includes(query) ||
      String(alert.student_id || '')
        .toLowerCase()
        .includes(query) ||
      String(
        alert.student_name || alert.name || ''
      )
        .toLowerCase()
        .includes(query) ||
      String(alert.alert_type || '')
        .toLowerCase()
        .includes(query) ||
      String(alert.description || '')
        .toLowerCase()
        .includes(query);

    const matchesSeverity =
      severityFilter === 'all' ||
      String(alert.severity || '').toLowerCase() ===
        severityFilter;

    const matchesStatus =
      statusFilter === 'all' ||
      String(alert.status || '').toLowerCase() ===
        statusFilter;

    return (
      matchesSearch &&
      matchesSeverity &&
      matchesStatus
    );
  });

  /* =======================================================
     STATISTICS
     ======================================================= */

  const totalAlerts = records.length;

  const openAlerts = records.filter(
    alert =>
      String(alert.status || '').toLowerCase() ===
      'open'
  ).length;

  const highAlerts = records.filter(
    alert =>
      String(alert.severity || '').toLowerCase() ===
      'high'
  ).length;

  const resolvedAlerts = records.filter(alert => {
    const status = String(
      alert.status || ''
    ).toLowerCase();

    return (
      status === 'resolved' ||
      status === 'closed'
    );
  }).length;

  const allCandidatesSelected =
    bulkCandidates.length > 0 &&
    selectedCandidateKeys.length ===
      bulkCandidates.length;

  return (
    <div className="content">

      <Header
        title="Risk Alerts"
        sub="Academic and attendance risk monitoring."
        action={
          <div
            style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap'
            }}
          >
            <button
              type="button"
              className="small"
              onClick={loadAlerts}
              disabled={loading}
            >
              <RefreshCw size={15} />{' '}
              {loading
                ? 'Refreshing...'
                : 'Refresh'}
            </button>

            {canCreate && (
              <button
                type="button"
                className="small"
                onClick={() => {
                  setShowBulkModal(true);
                  setMessage('');
                }}
                disabled={bulkLoading}
              >
                <AlertTriangle size={15} />{' '}
                Generate Risk Alerts
              </button>
            )}

            {canCreate && (
              <button
                type="button"
                className="primary small"
                onClick={openAddModal}
              >
                + Add Alert
              </button>
            )}
          </div>
        }
      />

      {message && (
        <div
          className="card"
          style={{
            marginBottom: '20px',
            padding: '13px 16px',
            borderLeft:
              messageType === 'error'
                ? '4px solid #dc2626'
                : '4px solid #16a085',
            background:
              messageType === 'error'
                ? '#fff5f5'
                : '#f0fdf4'
          }}
        >
          {message}
        </div>
      )}

      <div
        className="risk-filter-area"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          marginBottom: '20px'
        }}
      >
        <div
          className="search"
          style={{
            flex: '1 1 300px',
            minWidth: '250px',
            marginBottom: 0
          }}
        >
          <Search size={17} />
          <input
            placeholder="Search alert, student or description..."
            value={search}
            onChange={event =>
              setSearch(event.target.value)
            }
          />
        </div>

        <select
          value={severityFilter}
          onChange={event =>
            setSeverityFilter(event.target.value)
          }
          style={{
            minWidth: '140px',
            height: '42px',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #d9dee7',
            background: '#ffffff'
          }}
        >
          <option value="all">All Severity</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <select
          value={statusFilter}
          onChange={event =>
            setStatusFilter(event.target.value)
          }
          style={{
            minWidth: '140px',
            height: '42px',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #d9dee7',
            background: '#ffffff'
          }}
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="stats four">
        <Stat
          icon={AlertTriangle}
          label="Total Alerts"
          value={totalAlerts}
          kind="red"
        />

        <Stat
          icon={Bell}
          label="Open Alerts"
          value={openAlerts}
          kind="yellow"
        />

        <Stat
          icon={AlertTriangle}
          label="High Severity"
          value={highAlerts}
          kind="red"
        />

        <Stat
          icon={CheckCircle2}
          label="Resolved / Closed"
          value={resolvedAlerts}
        />
      </div>

      <Card title="Risk Alert Records">
        {!filteredAlerts.length ? (
          <Empty>
            {records.length
              ? 'No risk alerts match your search or filters.'
              : 'No risk alerts found in the database.'}
          </Empty>
        ) : (
          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  <th>Alert ID</th>
                  <th>Student</th>
                  <th>Alert Type</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Created</th>
                  {(canUpdate || canDelete) && (
                    <th>Actions</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {filteredAlerts.map(alert => (
                  <tr key={alert.alert_id}>
                    <td>#{alert.alert_id}</td>

                    <td>
                      <div>
                        <b>
                          {alert.student_name ||
                            alert.name ||
                            `Student #${alert.student_id}`}
                        </b>
                        <small
                          style={{
                            display: 'block',
                            marginTop: '3px'
                          }}
                        >
                          Student ID: #{alert.student_id ?? '—'}
                        </small>
                      </div>
                    </td>

                    <td>
                      <div>
                        <b>
                          {alert.alert_type || '—'}
                        </b>
                        {alert.description && (
                          <small
                            style={{
                              display: 'block',
                              marginTop: '4px',
                              maxWidth: '280px'
                            }}
                          >
                            {alert.description}
                          </small>
                        )}
                      </div>
                    </td>

                    <td>
                      <Badge>
                        {alert.severity || '—'}
                      </Badge>
                    </td>

                    <td>
                      <Badge>
                        {alert.status || '—'}
                      </Badge>
                    </td>

                    <td>
                      {date(alert.created_at)}
                    </td>

                    {(canUpdate || canDelete) && (
                      <td>
                        <div
                          style={{
                            display: 'flex',
                            gap: '6px',
                            flexWrap: 'wrap'
                          }}
                        >
                          {canUpdate &&
                            String(
                              alert.status || ''
                            ).toLowerCase() === 'open' && (
                              <button
                                type="button"
                                className="small"
                                onClick={() =>
                                  updateStatus(
                                    alert,
                                    'resolved'
                                  )
                                }
                              >
                                Resolve
                              </button>
                            )}

                          {canUpdate &&
                            String(
                              alert.status || ''
                            ).toLowerCase() === 'resolved' && (
                              <button
                                type="button"
                                className="small"
                                onClick={() =>
                                  updateStatus(
                                    alert,
                                    'open'
                                  )
                                }
                              >
                                Reopen
                              </button>
                            )}

                          {canUpdate && (
                            <button
                              type="button"
                              className="small"
                              onClick={() =>
                                openEditModal(alert)
                              }
                            >
                              Edit
                            </button>
                          )}

                          {canDelete && (
                            <button
                              type="button"
                              className="small"
                              onClick={() =>
                                deleteAlert(alert)
                              }
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ===================================================
          ADD / EDIT MODAL
          =================================================== */}

      {showModal && (
        <div
          onClick={event => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 9999
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 25px 60px rgba(0,0,0,.20)'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 22px',
                borderBottom: '1px solid #e5e7eb'
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>
                  {editingId
                    ? 'Edit Risk Alert'
                    : 'Add Risk Alert'}
                </h2>
                <p
                  style={{
                    margin: '5px 0 0',
                    color: '#6b7280',
                    fontSize: '13px'
                  }}
                >
                  {editingId
                    ? `Update Risk Alert #${editingId}.`
                    : 'Create a manual risk alert.'}
                </p>
              </div>

              <button
                type="button"
                className="small"
                onClick={closeModal}
                disabled={saving}
              >
                X
              </button>
            </div>

            <form
              onSubmit={saveAlert}
              style={{
                padding: '22px'
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gap: '16px'
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontWeight: 700,
                      fontSize: '12px',
                      marginBottom: '7px'
                    }}
                  >
                    Student *
                  </label>

                  <select
                    name="student_id"
                    value={form.student_id}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #d9dee7',
                      background: '#ffffff'
                    }}
                  >
                    <option value="">
                      Select student
                    </option>

                    {students.map(student => (
                      <option
                        key={student.student_id}
                        value={student.student_id}
                      >
                        #{student.student_id} — {student.name || student.student_name || 'Student'}
                        {student.grade_level
                          ? ` — Grade ${student.grade_level}`
                          : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontWeight: 700,
                      fontSize: '12px',
                      marginBottom: '7px'
                    }}
                  >
                    Alert Type *
                  </label>

                  <select
                    name="alert_type"
                    value={form.alert_type}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #d9dee7',
                      background: '#ffffff'
                    }}
                  >
                    <option value="">
                      Select alert type
                    </option>
                    <option value="Low Academic Performance">
                      Low Academic Performance
                    </option>
                    <option value="Attendance Concern">
                      Attendance Concern
                    </option>
                    <option value="Repeated Absences">
                      Repeated Absences
                    </option>
                    <option value="Late Submissions">
                      Late Submissions
                    </option>
                    <option value="Academic Risk">
                      Academic Risk
                    </option>
                    <option value="Needs Academic Monitoring">
                      Needs Academic Monitoring
                    </option>
                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px'
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontWeight: 700,
                        fontSize: '12px',
                        marginBottom: '7px'
                      }}
                    >
                      Severity *
                    </label>

                    <select
                      name="severity"
                      value={form.severity}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #d9dee7',
                        background: '#ffffff'
                      }}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontWeight: 700,
                        fontSize: '12px',
                        marginBottom: '7px'
                      }}
                    >
                      Status *
                    </label>

                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #d9dee7',
                        background: '#ffffff'
                      }}
                    >
                      <option value="open">Open</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontWeight: 700,
                      fontSize: '12px',
                      marginBottom: '7px'
                    }}
                  >
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Enter details or recommended action..."
                    rows={4}
                    maxLength={1000}
                    style={{
                      width: '100%',
                      resize: 'vertical',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #d9dee7',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '24px',
                  paddingTop: '18px',
                  borderTop: '1px solid #e5e7eb'
                }}
              >
                <button
                  type="button"
                  className="small"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary"
                  disabled={saving}
                >
                  {saving
                    ? 'Saving...'
                    : editingId
                    ? 'Save Changes'
                    : 'Create Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================
          BULK RISK ALERT MODAL
          =================================================== */}

      {showBulkModal && (
        <div
          onClick={event => {
            if (event.target === event.currentTarget) {
              if (!bulkLoading && !saving) {
                setShowBulkModal(false);
              }
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 9999
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '900px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 25px 60px rgba(0,0,0,.20)'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                padding: '20px 22px',
                borderBottom: '1px solid #e5e7eb'
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>
                  Generate Risk Alerts
                </h2>
                <p
                  style={{
                    margin: '5px 0 0',
                    color: '#6b7280',
                    fontSize: '13px'
                  }}
                >
                  Scan academic and attendance records, review the suggested alerts, then create the selected alerts in one action.
                </p>
              </div>

              <button
                type="button"
                className="small"
                onClick={() => {
                  if (!bulkLoading && !saving) {
                    setShowBulkModal(false);
                  }
                }}
                disabled={bulkLoading || saving}
              >
                X
              </button>
            </div>

            <div style={{ padding: '22px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap',
                  marginBottom: '16px'
                }}
              >
                <div>
                  <b>
                    {bulkCandidates.length
                      ? `${bulkCandidates.length} candidate(s) found`
                      : 'No scan results yet'}
                  </b>
                  <div
                    style={{
                      color: '#6b7280',
                      fontSize: '12px',
                      marginTop: '3px'
                    }}
                  >
                    Existing open alerts of the same type are automatically skipped.
                  </div>
                </div>

                <button
                  type="button"
                  className="primary small"
                  onClick={scanForRiskAlerts}
                  disabled={bulkLoading || saving}
                >
                  <RefreshCw size={15} />{' '}
                  {bulkLoading
                    ? 'Scanning...'
                    : 'Scan Students'}
                </button>
              </div>

              {!bulkCandidates.length ? (
                <Empty>
                  Click "Scan Students" to find students who may need risk monitoring.
                </Empty>
              ) : (
                <>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                      padding: '12px 14px',
                      background: '#f8faf9',
                      border: '1px solid #e7ece8',
                      borderRadius: '10px',
                      marginBottom: '12px'
                    }}
                  >
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={allCandidatesSelected}
                        onChange={event =>
                          selectAllCandidates(
                            event.target.checked
                          )
                        }
                      />
                      Select all candidates
                    </label>

                    <span
                      style={{
                        fontSize: '12px',
                        color: '#6b7280'
                      }}
                    >
                      {selectedCandidateKeys.length} selected
                    </span>
                  </div>

                  <div className="tablewrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Select</th>
                          <th>Student</th>
                          <th>Alert Type</th>
                          <th>Severity</th>
                          <th>Reason</th>
                        </tr>
                      </thead>

                      <tbody>
                        {bulkCandidates.map(candidate => {
                          const checked = selectedCandidateKeys.includes(
                            candidate.key
                          );

                          return (
                            <tr key={candidate.key}>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() =>
                                    toggleCandidate(
                                      candidate.key
                                    )
                                  }
                                />
                              </td>

                              <td>
                                <b>
                                  {candidate.student_name}
                                </b>
                                <small
                                  style={{
                                    display: 'block',
                                    marginTop: '3px'
                                  }}
                                >
                                  Student ID: #{candidate.student_id}
                                </small>
                              </td>

                              <td>
                                <b>
                                  {candidate.alert_type}
                                </b>
                                <small
                                  style={{
                                    display: 'block',
                                    marginTop: '3px'
                                  }}
                                >
                                  {candidate.description}
                                </small>
                              </td>

                              <td>
                                <Badge>
                                  {candidate.severity}
                                </Badge>
                              </td>

                              <td>
                                {candidate.reason}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: '10px',
                      marginTop: '20px',
                      paddingTop: '18px',
                      borderTop: '1px solid #e5e7eb'
                    }}
                  >
                    <button
                      type="button"
                      className="small"
                      onClick={() =>
                        setShowBulkModal(false)
                      }
                      disabled={saving}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className="primary"
                      onClick={createSelectedAlerts}
                      disabled={
                        saving ||
                        !selectedCandidateKeys.length
                      }
                    >
                      {saving
                        ? 'Creating Alerts...'
                        : `Create Selected Alerts (${selectedCandidateKeys.length})`}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
