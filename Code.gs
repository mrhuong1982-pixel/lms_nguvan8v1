
/**
 * LMS Google Apps Script API
 * Version: 3.8 - Added 'system.setup' and 'isPublished' field
 */

// ==========================================
// 1. CONFIGURATION & SCHEMA DEFINITION
// ==========================================

const DB_SCHEMA = {
  'users': ['id', 'username', 'password', 'name', 'role', 'email', 'avatar', 'phone', 'totalScore', 'studyTime', 'createdAt'],
  'classes': ['id', 'name', 'code', 'teacherId', 'subjectId', 'description', 'coverImage', 'isArchived', 'createdAt'],
  'classMembers': ['id', 'classId', 'userId', 'role', 'joinedAt', 'status'],
  'subjects': ['id', 'name', 'code', 'description'],
  'topics': ['id', 'classId', 'title', 'description', 'order', 'isVisible'],
  // UPDATE: Added 'isPublished' to lessons schema
  'lessons': ['id', 'title', 'description', 'monthUnlock', 'introductionHtml', 'subLessons', 'isPublished', 'order', 'createdAt'], 
  'assignments': ['id', 'topicId', 'title', 'description', 'dueDate', 'maxPoints', 'rubricJson', 'filesJson', 'createdAt'],
  'submissions': ['id', 'assignmentId', 'studentId', 'content', 'attachmentsJson', 'grade', 'feedback', 'status', 'submittedAt'],
  'progress': ['id', 'studentId', 'lessonId', 'status', 'lastPosition', 'updatedAt', 'score', 'passed'], // Added score/passed explicitly if needed
  'announcements': ['id', 'classId', 'authorId', 'content', 'createdAt'],
  'settings': ['key', 'value', 'description'],
  'games': ['id', 'title', 'description', 'level', 'type', 'gameUrl', 'thumbnail', 'quizConfigJson', 'isActive', 'createdAt'],
  'exams': ['id', 'title', 'type', 'description', 'duration', 'readingPassage', 'questions'],
  'question_bank': ['id', 'lessonId', 'type', 'question', 'options', 'correctAnswer', 'points', 'explanation', 'tags', 'createdAt']
};

// Fields that store JSON strings and need automatic parsing/stringifying
const JSON_FIELDS = [
  'resourcesJson', 'rubricJson', 'filesJson', 'attachmentsJson', 
  'quizConfigJson', 'questions', 'options', 'tags',
  'subLessons'
]; 

function getDb() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

// ==========================================
// 2. API ENTRY POINTS (CORS HANDLED VIA GAS REDIRECT)
// ==========================================

function doPost(e) {
  return handleRequest(e);
}

function doGet(e) {
  return responseJSON({ status: 'active', message: 'LMS API v3.8 Ready' });
}

function handleRequest(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    if (!e.postData || !e.postData.contents) {
      return responseJSON({ ok: false, error: 'No data found' });
    }

    const request = JSON.parse(e.postData.contents);
    const action = request.action;
    const payload = request.payload || {};
    const ss = getDb();
    
    let result = null;

    // --- ROUTING ---
    switch (action) {
      // AUTH
      case 'auth.login':
        result = handleLogin(ss, payload);
        break;

      // SYSTEM: Create missing columns in Sheet
      case 'system.setup':
        setupDatabase();
        result = { success: true, message: "Database schema synchronized." };
        break;

      // USERS / STUDENTS
      case 'users.list':
        result = listData(ss, 'users');
        break;
      case 'users.add':
      case 'students.add':
        payload.role = payload.role || 'student';
        payload.id = payload.id || generateId('u');
        payload.createdAt = new Date().toISOString();
        result = insertData(ss, 'users', payload);
        break;
      case 'users.update':
      case 'students.update':
        result = updateData(ss, 'users', payload.id, payload);
        break;
      case 'users.remove':
      case 'students.remove':
        result = deleteData(ss, 'users', payload.id);
        break;

      // LESSONS
      case 'lessons.list':
        result = listData(ss, 'lessons');
        break;
      case 'lessons.add':
        payload.id = payload.id || generateId('l');
        payload.createdAt = new Date().toISOString();
        result = insertData(ss, 'lessons', payload);
        break;
      case 'lessons.update':
        result = updateData(ss, 'lessons', payload.id, payload);
        break;
      case 'lessons.remove':
        result = deleteData(ss, 'lessons', payload.id);
        break;

      // PROGRESS
      case 'progress.list': // For Admin Report
        result = listData(ss, 'progress');
        break;
      case 'progress.listByStudent':
        result = listData(ss, 'progress', { studentId: payload.studentId });
        break;
      case 'progress.update':
        result = handleProgressUpdate(ss, payload);
        break;

      // EXAMS
      case 'exams.list':
        result = listData(ss, 'exams');
        break;
      case 'exams.add':
        payload.id = payload.id || generateId('ex');
        result = insertData(ss, 'exams', payload);
        break;
      case 'exams.update':
        result = updateData(ss, 'exams', payload.id, payload);
        break;
      case 'exams.remove':
        result = deleteData(ss, 'exams', payload.id);
        break;

      // GAMES
      case 'games.list':
        result = listData(ss, 'games');
        break;
      case 'games.add':
        payload.id = payload.id || generateId('gm');
        payload.createdAt = new Date().toISOString();
        result = insertData(ss, 'games', payload);
        break;
      case 'games.update':
        result = updateData(ss, 'games', payload.id, payload);
        break;
      case 'games.remove':
        result = deleteData(ss, 'games', payload.id);
        break;
      case 'games.saveResult':
        result = handleGameResult(ss, payload);
        break;

      // ASSIGNMENTS
      case 'assignments.list':
        result = listData(ss, 'assignments');
        break;
      case 'assignments.add':
        payload.id = payload.id || generateId('a');
        payload.createdAt = new Date().toISOString();
        result = insertData(ss, 'assignments', payload);
        break;
      case 'assignments.update':
        result = updateData(ss, 'assignments', payload.id, payload);
        break;
      case 'assignments.remove':
        result = deleteData(ss, 'assignments', payload.id);
        break;

      // SUBMISSIONS
      case 'submissions.listAll':
        result = listData(ss, 'submissions');
        break;
      case 'submissions.listByStudent':
        result = listData(ss, 'submissions', { studentId: payload.student_id });
        break;
      case 'submissions.submit':
        result = handleSubmission(ss, payload);
        break;
      case 'submissions.grade':
        result = updateData(ss, 'submissions', payload.id, {
          grade: payload.grade,
          feedback: payload.feedback,
          status: 'graded'
        });
        updateUserTotalScore(ss, result.studentId);
        break;

      // QUESTION BANK
      case 'questions.list':
        result = listData(ss, 'question_bank', payload); 
        break;
      case 'questions.add':
        payload.id = payload.id || generateId('q');
        payload.createdAt = new Date().toISOString();
        result = insertData(ss, 'question_bank', payload);
        break;
      case 'questions.update':
        result = updateData(ss, 'question_bank', payload.id, payload);
        break;
      case 'questions.remove':
        result = deleteData(ss, 'question_bank', payload.id);
        break;

      // REPORTS
      case 'reports.classOverview':
        result = generateReport(ss);
        break;

      // FALLBACK
      default:
        const parts = action.split('.');
        const tableName = parts[0];
        const method = parts[1];
        
        if (DB_SCHEMA[tableName]) {
           if (method === 'list') {
             result = listData(ss, tableName, payload);
           } else if (method === 'add') {
             payload.id = payload.id || generateId(tableName.substring(0,2));
             payload.createdAt = new Date().toISOString();
             result = insertData(ss, tableName, payload);
           } else if (method === 'update') {
             result = updateData(ss, tableName, payload.id, payload);
           } else if (method === 'remove') {
             result = deleteData(ss, tableName, payload.id);
           } else {
             throw new Error(`Method '${method}' not supported for table '${tableName}'`);
           }
        } else {
           throw new Error(`Action '${action}' not found or table does not exist`);
        }
    }

    return responseJSON({ ok: true, data: result });

  } catch (err) {
    Logger.log(err);
    return responseJSON({ ok: false, error: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// --- LOGIC FUNCTIONS ---

function handleLogin(ss, { username, password }) {
  const users = listData(ss, 'users', { username: username });
  if (users.length === 0) throw new Error("Tên đăng nhập không tồn tại");
  const user = users[0];
  if (String(password).trim() !== String(user.password).trim()) throw new Error(`Mật khẩu không chính xác.`); 
  const { password: _, ...safeUser } = user;
  if (!safeUser.totalScore) safeUser.totalScore = 0;
  if (!safeUser.studyTime) safeUser.studyTime = 0;
  if (!safeUser.avatar) safeUser.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(safeUser.name)}&background=random`;
  return safeUser;
}

function handleSubmission(ss, payload) {
  const table = 'submissions';
  const dbPayload = {
    id: payload.id || generateId('sub'),
    type: payload.type || 'assignment',
    assignmentId: payload.assignment_id,
    studentId: payload.student_id,
    studentName: payload.studentName,
    content: payload.content || '',
    attachmentsJson: payload.essay_links || payload.answers_json || '{}',
    grade: payload.auto_score || '',
    status: payload.status || 'pending',
    submittedAt: new Date().toISOString()
  };
  const sheet = getSheet(ss, table);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const studentIdIdx = headers.indexOf('studentId');
  const assignIdIdx = headers.indexOf('assignmentId');
  let foundId = null;
  if (studentIdIdx > -1 && assignIdIdx > -1) {
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][studentIdIdx]) === String(dbPayload.studentId) && 
          String(data[i][assignIdIdx]) === String(dbPayload.assignmentId)) {
         foundId = data[i][headers.indexOf('id')];
         break;
      }
    }
  }
  if (foundId) return updateData(ss, table, foundId, dbPayload);
  return insertData(ss, table, dbPayload);
}

function handleProgressUpdate(ss, payload) {
  // Check if progress for this lesson exists
  const existing = listData(ss, 'progress', { studentId: payload.studentId, lessonId: payload.lessonId });
  
  if (existing.length > 0) {
    // Determine if new score is better or keep old one? Usually keep highest or latest.
    // For now, we update to latest.
    const newData = { 
        ...payload, 
        updatedAt: new Date().toISOString(),
        score: payload.score,
        passed: payload.passed
    };
    const result = updateData(ss, 'progress', existing[0].id, newData);
    updateUserTotalScore(ss, payload.studentId);
    return result;
  }
  
  // Create new progress record
  payload.id = generateId('prog');
  payload.updatedAt = new Date().toISOString();
  const result = insertData(ss, 'progress', payload);
  updateUserTotalScore(ss, payload.studentId);
  return result;
}

function handleGameResult(ss, payload) {
   const users = listData(ss, 'users', { id: payload.studentId });
   if (users.length > 0) {
      const user = users[0];
      const newScore = (Number(user.totalScore) || 0) + (Number(payload.score) || 0);
      updateData(ss, 'users', user.id, { totalScore: newScore });
   }
   return { success: true, scoreAdded: payload.score };
}

function updateUserTotalScore(ss, userId) {
  // 1. Get all progress
  const allProg = listData(ss, 'progress', { studentId: userId });
  // 2. Get all submissions (assignments/exams)
  const allSubs = listData(ss, 'submissions', { studentId: userId });
  
  let total = 0;
  
  // Sum lesson scores (max 10 per lesson usually)
  allProg.forEach(p => {
     total += (Number(p.score) || 0);
  });
  
  // Sum submission grades
  allSubs.forEach(s => {
     if (s.status === 'graded') {
        total += (Number(s.grade) || 0);
     }
  });
  
  // Update User
  const users = listData(ss, 'users', { id: userId });
  if (users.length > 0) {
     updateData(ss, 'users', users[0].id, { totalScore: total });
  }
}

function generateReport(ss) {
  const students = listData(ss, 'users', { role: 'student' });
  const reportData = students.map(s => {
    const score = Number(s.totalScore) || 0;
    return { id: s.id, name: s.name, avgScore: (score / 10).toFixed(1), totalScore: score, isAtRisk: score < 50 };
  });
  return { totalStudents: students.length, completionRate: 75, atRiskCount: reportData.filter(r => r.isAtRisk).length, students: reportData };
}

// --- DATABASE HELPERS ---

function getSheet(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (DB_SCHEMA[name]) {
       sheet.appendRow(DB_SCHEMA[name]);
       sheet.getRange(1, 1, 1, DB_SCHEMA[name].length).setFontWeight('bold');
    }
  }
  return sheet;
}

function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  for (const [tableName, schemaHeaders] of Object.entries(DB_SCHEMA)) {
    const sheet = getSheet(ss, tableName);
    const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1).getValues()[0];
    
    if (currentHeaders.length === 1 && currentHeaders[0] === '') {
       // Sheet empty, set headers
       sheet.clear();
       sheet.appendRow(schemaHeaders);
    } else {
       // Check for missing columns
       const missingHeaders = [];
       schemaHeaders.forEach(h => {
          if (!currentHeaders.includes(h)) missingHeaders.push(h);
       });
       
       if (missingHeaders.length > 0) {
          const startCol = sheet.getLastColumn() + 1;
          sheet.getRange(1, startCol, 1, missingHeaders.length).setValues([missingHeaders]);
          sheet.getRange(1, startCol, 1, missingHeaders.length).setFontWeight('bold');
       }
    }
  }
}

function listData(ss, sheetName, criteria = {}) {
  const sheet = getSheet(ss, sheetName);
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 2) return [];

  const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = data[0];
  const results = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const obj = {};
    let match = true;
    for (let j = 0; j < headers.length; j++) {
      const header = headers[j];
      let value = row[j];
      
      // Auto-parse JSON fields
      if (JSON_FIELDS.includes(header) && typeof value === 'string') {
          value = value.trim();
          if (value.startsWith('{') || value.startsWith('[')) {
             try { 
               value = JSON.parse(value); 
             } catch(e) {
               // Default to empty array for list types
               if (['questions', 'subLessons', 'options', 'tags', 'rubric', 'attachmentsJson'].includes(header)) value = [];
               else value = {};
             }
          } else if (['questions', 'subLessons', 'options', 'tags'].includes(header)) {
              value = []; // Ensure array
          }
      }

      // Filter nulls/undefined in arrays
      if (Array.isArray(value)) {
         value = value.filter(item => item !== null && item !== undefined);
      }

      obj[header] = value;
    }
    
    // Legacy Fix: Swap 'order' and 'subLessons' if mixed up
    if (sheetName === 'lessons') {
        const valOrder = obj['order'];
        const valSub = obj['subLessons'];
        const orderIsJson = typeof valOrder === 'string' && valOrder.trim().startsWith('[');
        const subIsNumber = (typeof valSub === 'number') || (typeof valSub === 'string' && !isNaN(Number(valSub)));

        if (orderIsJson && subIsNumber) {
            obj['order'] = Number(valSub);
            try { obj['subLessons'] = JSON.parse(valOrder); } catch(e) { obj['subLessons'] = []; }
        } else if (orderIsJson) {
            try { obj['subLessons'] = JSON.parse(valOrder); } catch(e) { obj['subLessons'] = []; }
            obj['order'] = 0; 
        }
    }

    for (const key in criteria) {
      if (criteria[key] === 'all') continue; 
      // Loose comparison for IDs
      if (String(obj[key]).trim() !== String(criteria[key]).trim()) {
        match = false;
        break;
      }
    }
    if (match) results.push(obj);
  }
  return results;
}

function insertData(ss, sheetName, dataObj) {
  const sheet = getSheet(ss, sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map(header => {
    let val = dataObj[header];
    if (val && typeof val === 'object') {
      try { val = JSON.stringify(val); } catch(e) { val = '{}'; }
    }
    return val === undefined ? '' : val;
  });
  sheet.appendRow(row);
  return dataObj;
}

function updateData(ss, sheetName, id, updateObj) {
  const sheet = getSheet(ss, sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIndex = headers.indexOf('id');
  if (idIndex === -1) return null;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idIndex]) === String(id)) {
      const rowIndex = i + 1;
      const currentRow = data[i];
      const currentObj = {};
      headers.forEach((h, idx) => currentObj[h] = currentRow[idx]);
      
      for (const key in updateObj) {
        const colIndex = headers.indexOf(key);
        if (colIndex > -1) {
          let val = updateObj[key];
          if (val && typeof val === 'object') {
            try { val = JSON.stringify(val); } catch(e) { val = '{}'; }
          }
          sheet.getRange(rowIndex, colIndex + 1).setValue(val);
          currentObj[key] = val;
        }
      }
      return { ...currentObj, ...updateObj };
    }
  }
  return null;
}

function deleteData(ss, sheetName, id) {
  const sheet = getSheet(ss, sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIndex = headers.indexOf('id');
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idIndex]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { success: true, id };
    }
  }
  return { error: 'Not found' };
}

function generateId(prefix) {
  return prefix + '_' + Math.random().toString(36).substr(2, 9);
}
