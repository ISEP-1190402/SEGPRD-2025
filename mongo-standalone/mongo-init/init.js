db = db.getSiblingDB('ztadb');

// Create app-level user
db.createUser({
  user: "university_user",
  pwd: "securepass123",
  roles: [{ role: "readWrite", db: "ztadb" }]
});

// -------------------------
// Generate users
// -------------------------

const users = [];

// 100 students
for (let i = 1; i <= 100; i++) {
  users.push({
    _id: `stu${i.toString().padStart(3, '0')}`,
    username: `student${i}`,
    email: `student${i}@university.edu`,
    role: "student",
    passwordHash: "$2b$10$studentHashPlaceholder"
  });
}

// 10 professors
for (let i = 1; i <= 10; i++) {
  users.push({
    _id: `prof${i.toString().padStart(3, '0')}`,
    username: `professor${i}`,
    email: `professor${i}@university.edu`,
    role: "professor",
    passwordHash: "$2b$10$professorHashPlaceholder"
  });
}

// 5 admins
for (let i = 1; i <= 5; i++) {
  users.push({
    _id: `admin${i.toString().padStart(3, '0')}`,
    username: `admin${i}`,
    email: `admin${i}@university.edu`,
    role: "admin",
    passwordHash: "$2b$10$adminHashPlaceholder"
  });
}

db.users.insertMany(users);

// -------------------------
// Generate course materials
// -------------------------

const materials = [];

for (let i = 1; i <= 200; i++) {
  materials.push({
    type: "material",
    title: `Lecture ${i}: Topic ${Math.ceil(i / 5)}`,
    course: `CSE${100 + (i % 10)}`,
    access: ["student", "professor"],
    file: `lecture${i}.pdf`,
    uploadedAt: new Date()
  });
}

db.resources.insertMany(materials);

// -------------------------
// Generate grades
// -------------------------

const grades = [];

for (let i = 1; i <= 500; i++) {
  grades.push({
    type: "grade",
    studentId: `stu${(i % 100 + 1).toString().padStart(3, '0')}`,
    course: `CSE${100 + (i % 10)}`,
    grade: Math.floor(Math.random() * 6) + 15,
    access: ["professor"],
    submittedAt: new Date()
  });
}

db.resources.insertMany(grades);

// -------------------------
// Announcements
// -------------------------

const announcements = [];

for (let i = 1; i <= 20; i++) {
  announcements.push({
    type: "announcement",
    title: `Important Notice ${i}`,
    content: `Please read announcement ${i}.`,
    access: ["student", "professor", "admin"],
    postedAt: new Date()
  });
}

db.resources.insertMany(announcements);

// -------------------------
// Admin forms
// -------------------------

const forms = [];

for (let i = 1; i <= 10; i++) {
  forms.push({
    type: "form",
    title: `Administrative Form ${i}`,
    formUrl: `form${i}.pdf`,
    access: ["admin"],
    lastUpdated: new Date()
  });
}

db.resources.insertMany(forms);

// -------------------------
// Access control policies
// -------------------------

db.policies.insertMany([
  {
    role: "student",
    permissions: ["view:material", "view:announcement"]
  },
  {
    role: "professor",
    permissions: ["view:material", "create:grade", "view:grade", "view:announcement"]
  },
  {
    role: "admin",
    permissions: ["manage:forms", "view:announcement"]
  }
]);
