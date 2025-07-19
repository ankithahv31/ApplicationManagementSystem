import express from 'express';
import cors from 'cors';
import mariadb from 'mariadb';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// MariaDB connection pool
const pool = mariadb.createPool({
  host: 'localhost',
  user: 'root',
  password: 'tiggy',
  database: 'audit_db',
  connectionLimit: 5,
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(
      'SELECT * FROM user_master WHERE login_name = ? AND password_hash = ? LIMIT 1',
      [username, password]
    );
    if (result.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ success: true, user: result[0] });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  } finally {
    if (conn) conn.release();
  }
});

// Dropdown endpoints
app.get('/api/owners', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT owner_id, name FROM owner_master');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching owners:', err);
    res.status(500).json({ error: 'Failed to fetch owners' });
  } finally {
    if (conn) conn.release();
  }
});

app.get('/api/companies', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT company_id, company_name FROM company');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching companies:', err);
    res.status(500).json({ error: 'Failed to fetch companies' });
  } finally {
    if (conn) conn.release();
  }
});

app.get('/api/access-types', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT access_type_id, access_type_name FROM access_type_master');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching access types:', err);
    res.status(500).json({ error: 'Failed to fetch access types' });
  } finally {
    if (conn) conn.release();
  }
});

// Add application
// Add application
app.post('/api/applications', async (req, res) => {
  const { app_name, app_owner_id, company_id, access_type_id } = req.body;

  // Assume req.user is set via auth middleware
  const created_by = req.user?.username || 'system'; // fallback if no login

  if (!app_name || !app_owner_id || !company_id || !access_type_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(
      `INSERT INTO application_master 
        (app_name, app_owner_id, company_id, access_type_id, created_by, created_date, updated_by, updated_date)
       VALUES (?, ?, ?, ?, ?, NOW(), ?, NOW())`,
      [app_name, app_owner_id, company_id, access_type_id, created_by, created_by]
    );
    const insertId = Number(result.insertId || result[0]?.insertId);
    res.status(200).json({ success: true, insertId });
  } catch (err) {
    console.error('❌ Error inserting application:', err);
    res.status(500).json({ error: 'Failed to add application', details: err.message });
  } finally {
    if (conn) conn.release();
  }
});


// View all applications
// View all applications
app.get('/api/applications', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`
      SELECT 
        a.aapid,
        a.app_name,
        a.company_id,
        c.company_name,
        a.access_type_id,
        at.access_type_name,
        a.app_owner_id,
        o.name AS owner_name
      FROM application_master a
      LEFT JOIN company c ON a.company_id = c.company_id
      LEFT JOIN access_type_master at ON a.access_type_id = at.access_type_id
      LEFT JOIN owner_master o ON a.app_owner_id = o.owner_id
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching applications:', err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  } finally {
    if (conn) conn.release();
  }
});


// Get application by ID
app.get('/api/applications/:id', async (req, res) => {
  const { id } = req.params;
  let conn;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: 'Invalid application ID' });
  }

  try {
    conn = await pool.getConnection();
    const result = await conn.query('SELECT * FROM application_master WHERE aapid = ?', [id]);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(result[0]);
  } catch (err) {
    console.error('Error fetching application by ID:', err);
    res.status(500).json({ error: 'Failed to fetch application' });
  } finally {
    if (conn) conn.release();
  }
});

// Update application
// Update application
app.put('/api/applications/:id', async (req, res) => {
  const { id } = req.params;
  const { app_name, app_owner_id, company_id, access_type_id } = req.body;

  const updated_by = req.user?.username || 'system';

  if (!app_name || !app_owner_id || !company_id || !access_type_id) {
    return res.status(400).json({ error: 'Missing required fields for update' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(
      `UPDATE application_master
       SET app_name = ?, app_owner_id = ?, company_id = ?, access_type_id = ?, updated_by = ?, updated_date = NOW()
       WHERE aapid = ?`,
      [app_name, app_owner_id, company_id, access_type_id, updated_by, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json({ success: true, message: 'Application updated successfully' });
  } catch (err) {
    console.error('❌ Error updating application:', err);
    res.status(500).json({ error: 'Failed to update application', details: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// Delete application with cascading deletes for application-specific data only
app.delete('/api/applications/:id', async (req, res) => {
  const { id } = req.params;
  const deleted_by = 'admin'; // Replace with session user if needed
  const now = new Date();
  let conn;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: 'Invalid application ID' });
  }

  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // ✅ Check if application exists
    const [exists] = await conn.query(
      `SELECT 
          am.*, 
          om.name AS owner_name, 
          c.company_name, 
          at.access_type_name 
       FROM application_master am
       LEFT JOIN owner_master om ON am.app_owner_id = om.owner_id
       LEFT JOIN company c ON am.company_id = c.company_id
       LEFT JOIN access_type_master at ON am.access_type_id = at.access_type_id
       WHERE am.aapid = ?`,
      [id]
    );

    if (!exists) {
      await conn.rollback();
      return res.status(404).json({ error: 'Application not found' });
    }

    console.log('🔍 Application details:', {
      aapid: exists.aapid,
      app_name: exists.app_name,
      app_owner_id: exists.app_owner_id,
      company_id: exists.company_id,
      access_type_id: exists.access_type_id,
      owner_name: exists.owner_name,
      company_name: exists.company_name,
      access_type_name: exists.access_type_name
    });

    // ✅ Log the application before deletion (optional - skip if table doesn't exist)
    try {
      await conn.query(
        `INSERT INTO log_app_master
          (aapid, app_name, owner_name, company_name, access_type_name, created_by, created_date, updated_by, updated_date, log_type, log_user, log_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'delete', ?, ?)`,
        [
          exists.aapid,
          exists.app_name,
          exists.owner_name,
          exists.company_name,
          exists.access_type_name,
          exists.created_by,
          exists.created_date,
          exists.updated_by,
          exists.updated_date,
          deleted_by,
          now,
        ]
      );
      console.log('✅ Application logged to log_app_master');
    } catch (logErr) {
      console.log('⚠️ Could not log to log_app_master table (table may not exist):', logErr.message);
      // Continue with deletion even if logging fails
    }

    // ✅ Delete only application-specific data (6 buttons data)
    
    console.log(`🗑️ Starting deletion for application ID: ${id}`);
    
    // Check what related data exists for this application
    console.log('🔍 Checking related data...');
    try {
      const auditCount = await conn.query('SELECT COUNT(*) as count FROM audit_report WHERE aapid = ?', [id]);
      const versionCount = await conn.query('SELECT COUNT(*) as count FROM app_version WHERE aapid = ?', [id]);
      const sslCount = await conn.query('SELECT COUNT(*) as count FROM ssl_certificates WHERE aapid = ?', [id]);
      const domainCount = await conn.query('SELECT COUNT(*) as count FROM domain_mapping WHERE aapid = ?', [id]);
      const serverCount = await conn.query('SELECT COUNT(*) as count FROM app_server WHERE aapid = ?', [id]);
      const ownerCount = await conn.query('SELECT COUNT(*) as count FROM application_owner WHERE application_id = ?', [id]);
      
      console.log('📊 Related data counts:', {
        audit_reports: auditCount[0]?.count || 0,
        app_versions: versionCount[0]?.count || 0,
        ssl_certificates: sslCount[0]?.count || 0,
        domain_mappings: domainCount[0]?.count || 0,
        app_servers: serverCount[0]?.count || 0,
        app_owners: ownerCount[0]?.count || 0
      });
    } catch (checkErr) {
      console.log('⚠️ Could not check related data counts:', checkErr.message);
    }
    
    // 1. Delete audit findings and reports
    console.log('🗑️ Step 1: Deleting audit findings and reports...');
    try {
      const auditReports = await conn.query(
        'SELECT audit_report_id FROM audit_report WHERE aapid = ?',
        [id]
      );
      
      for (const report of auditReports) {
        // Delete audit findings for this report
        await conn.query(
          'DELETE FROM audit_findings WHERE audit_report_id = ?',
          [report.audit_report_id]
        );
      }
      
      // Delete audit reports
      await conn.query('DELETE FROM audit_report WHERE aapid = ?', [id]);
      console.log('✅ Step 1 completed');
    } catch (stepErr) {
      console.log('⚠️ Step 1 failed (tables may not exist):', stepErr.message);
    }

    // 2. Delete app versions
    console.log('🗑️ Step 2: Deleting app versions...');
    try {
      await conn.query('DELETE FROM app_version WHERE aapid = ?', [id]);
      console.log('✅ Step 2 completed');
    } catch (stepErr) {
      console.log('⚠️ Step 2 failed (table may not exist):', stepErr.message);
    }

    // 3. Delete SSL certificates
    console.log('🗑️ Step 3: Deleting SSL certificates...');
    try {
      await conn.query('DELETE FROM ssl_certificates WHERE aapid = ?', [id]);
      console.log('✅ Step 3 completed');
    } catch (stepErr) {
      console.log('⚠️ Step 3 failed (table may not exist):', stepErr.message);
    }

    // 4. Delete domain mappings
    console.log('🗑️ Step 4: Deleting domain mappings...');
    try {
      await conn.query('DELETE FROM domain_mapping WHERE aapid = ?', [id]);
      console.log('✅ Step 4 completed');
    } catch (stepErr) {
      console.log('⚠️ Step 4 failed (table may not exist):', stepErr.message);
    }

    // 5. Delete app server associations (but keep hosting_server table intact)
    console.log('🗑️ Step 5: Deleting app server associations...');
    try {
      await conn.query('DELETE FROM app_server WHERE aapid = ?', [id]);
      console.log('✅ Step 5 completed');
    } catch (stepErr) {
      console.log('⚠️ Step 5 failed (table may not exist):', stepErr.message);
    }

    // 6. Delete app owner associations (but keep owner_master table intact)
    console.log('🗑️ Step 6: Deleting app owner associations...');
    try {
      await conn.query('DELETE FROM application_owner WHERE application_id = ?', [id]);
      console.log('✅ Step 6 completed');
    } catch (stepErr) {
      console.log('⚠️ Step 6 failed (table may not exist):', stepErr.message);
    }

    // 7. Finally delete the application itself
    console.log('🗑️ Step 7: Deleting application master record...');
    try {
      const result = await conn.query('DELETE FROM application_master WHERE aapid = ?', [id]);
      console.log('✅ Step 7 completed');
      console.log('📊 Deletion result:', { affectedRows: result.affectedRows });

      if (result.affectedRows === 0) {
        await conn.rollback();
        return res.status(404).json({ error: 'Application could not be deleted' });
      }
    } catch (stepErr) {
      console.log('❌ Step 7 failed:', stepErr.message);
      console.log('❌ Step 7 error details:', {
        code: stepErr.code,
        errno: stepErr.errno,
        sqlState: stepErr.sqlState,
        sqlMessage: stepErr.sqlMessage
      });
      throw stepErr; // Re-throw to be caught by the main catch block
    }

    await conn.commit();
    res.json({ success: true, message: 'Application and all related data deleted successfully.' });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error('❌ Error deleting application:', err);
    console.error('❌ Error details:', {
      message: err.message,
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
      sqlMessage: err.sqlMessage
    });
    res.status(500).json({ error: 'Failed to delete application', details: err.message });
  } finally {
    if (conn) conn.release();
  }
});




// ✅ GET audit logs by audit_report_id
// ✅ Route: Get audit logs by application ID
app.get("/api/audit-logs/by-app/:aapid", async (req, res) => {
  const { aapid } = req.params;

  try {
    const rows = await pool.query(
      `
      SELECT af.finding_id, af.audit_report_id, af.findings, af.severity, af.developer_remarks,
       af.verification_status, af.created_by, af.created_date, af.updated_by, af.updated_date,
       ar.audit_name,
       am.app_name
FROM audit_findings af
JOIN audit_report ar ON ar.audit_report_id = af.audit_report_id
JOIN application_master am ON ar.aapid = am.aapid
WHERE ar.aapid = ?
ORDER BY af.created_date DESC

      `,
      [aapid]
    );

    res.status(200).json(rows || []);
  } catch (err) {
    console.error("Error fetching audit logs by application ID:", err.message);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

//add audit logs
app.post('/api/audit-findings', async (req, res) => {
  const {
    aapid,
    audit_name,
    created_date,
    findings,
    severity,
    developer_remarks,
    verification_status
  } = req.body;

  const created_by = 'system';
  const createdDate = new Date(created_date);     // format date correctly
  const now        = new Date();                  // for log_audit_findings

  if (!aapid || !audit_name || !created_date || !findings || !severity || !verification_status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();                // make the whole insert atomic

    // ✅ 1. Insert into audit_report
    const reportSql = `
      INSERT INTO audit_report (aapid, audit_name, audit_date,
                                created_by, created_date, updated_by, updated_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const reportResult = await conn.query(reportSql, [
      aapid,
      audit_name,
      createdDate,
      created_by,
      createdDate,
      created_by,
      createdDate
    ]);
    const audit_report_id = Number(reportResult.insertId);

    // ✅ 2. Insert into audit_findings
    const findingSql = `
      INSERT INTO audit_findings (
        audit_report_id, findings, severity, developer_remarks,
        verification_status, created_by, created_date, updated_by, updated_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const findingResult = await conn.query(findingSql, [
      audit_report_id,
      findings,
      severity,
      developer_remarks || null,
      verification_status,
      created_by,
      createdDate,
      created_by,
      createdDate
    ]);
    const finding_id = Number(findingResult.insertId);

    // ✅ 3. Archive the brand‑new record in log_audit_findings
    const logSql = `
      INSERT INTO log_audit_findings (
        finding_id, audit_report_id, aapid, audit_name, audit_date,
        findings, severity, developer_remarks, verification_status,
        log_type, log_user, log_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?)
    `;
    await conn.query(logSql, [
      finding_id,
      audit_report_id,
      aapid,
      audit_name,
      createdDate,
      findings,
      severity,
      developer_remarks || null,
      verification_status,
      created_by,
      now
    ]);

    await conn.commit();
    res.status(201).json({
      message: 'Audit report and finding added successfully',
      audit_report_id,
      finding_id
    });

  } catch (err) {
    if (conn) await conn.rollback();
    console.error('❌ Error inserting audit report/finding:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// ✅ New endpoint for creating audit report with multiple findings
app.post('/api/audit-report-with-findings', async (req, res) => {
  const {
    aapid,
    audit_name,
    created_date,
    findings
  } = req.body;

  const created_by = 'system';
  const createdDate = new Date(created_date);

  if (!aapid || !audit_name || !created_date || !findings || !Array.isArray(findings) || findings.length === 0) {
    return res.status(400).json({ error: 'Missing required fields or invalid findings array' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // ✅ 1. Create single audit report
    const reportSql = `
      INSERT INTO audit_report (aapid, audit_name, audit_date,
                                created_by, created_date, updated_by, updated_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const reportResult = await conn.query(reportSql, [
      aapid,
      audit_name,
      createdDate,
      created_by,
      createdDate,
      created_by,
      createdDate
    ]);
    const audit_report_id = Number(reportResult.insertId);

    const findingIds = [];

    // ✅ 2. Insert all findings for this audit report
    for (const finding of findings) {
      const { severity, developer_remarks, verification_status } = finding;
      
      if (!severity || !verification_status) {
        throw new Error('Missing required fields in findings');
      }

      const findingSql = `
        INSERT INTO audit_findings (
          audit_report_id, findings, severity, developer_remarks,
          verification_status, created_by, created_date, updated_by, updated_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const findingResult = await conn.query(findingSql, [
        audit_report_id,
        finding.findings,
        severity,
        developer_remarks || null,
        verification_status,
        created_by,
        createdDate,
        created_by,
        createdDate
      ]);
      
      const finding_id = Number(findingResult.insertId);
      findingIds.push(finding_id);

      // ✅ 3. Archive each finding in log_audit_findings
      const logSql = `
        INSERT INTO log_audit_findings (
          finding_id, audit_report_id, aapid, audit_name, audit_date,
          findings, severity, developer_remarks, verification_status,
          log_type, log_user, log_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?)
      `;
      await conn.query(logSql, [
        finding_id,
        audit_report_id,
        aapid,
        audit_name,
        createdDate,
        finding.findings,
        severity,
        developer_remarks || null,
        verification_status,
        created_by,
        new Date()
      ]);
    }

    await conn.commit();
    res.status(201).json({
      message: 'Audit report with multiple findings added successfully',
      audit_report_id,
      finding_ids: findingIds,
      total_findings: findings.length
    });

  } catch (err) {
    if (conn) await conn.rollback();
    console.error('❌ Error inserting audit report with findings:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});


// ✅ GET audit report IDs for dropdown
// Route: GET /api/audit-report-id/:aapid
app.get("/api/audit-report-id/:aapid", async (req, res) => {
  const { aapid } = req.params;
  try {
    const result = await pool.query(
      "SELECT audit_report_id FROM audit_report WHERE aapid = ?",
      [aapid]
    );
    res.status(200).json(result[0] || null);
  } catch (err) {
    console.error("Error getting audit_report_id from aapid:", err);
    res.status(500).json({ error: "Failed to fetch audit_report_id" });
  }
});


// ✅ PUT update audit log
app.put('/api/audit-logs/:id', async (req, res) => {
  const { id } = req.params;
  const { findings, severity, verification_status, developer_remarks } = req.body;

  if (!findings || !severity || !verification_status) {
    return res.status(400).json({ error: 'Missing fields for update' });
  }

  const updated_by = 'system';
  const now = new Date();

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // ✅ Fetch the existing record for logging
    const [data] = await conn.query(
      `SELECT af.*, ar.aapid, ar.audit_name, ar.audit_date
       FROM audit_findings af
       LEFT JOIN audit_report ar ON af.audit_report_id = ar.audit_report_id
       WHERE af.finding_id = ?`,
      [id]
    );

    if (!data) {
      await conn.rollback();
      return res.status(404).json({ error: 'Audit log not found' });
    }

    // ✅ Insert existing data into log_audit_findings before update
    await conn.query(
      `INSERT INTO log_audit_findings
        (finding_id, audit_report_id, aapid, audit_name, audit_date,
         findings, severity, developer_remarks, verification_status,
         log_type, log_user, log_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'edit', ?, ?)`,
      [
        data.finding_id,
        data.audit_report_id,
        data.aapid,
        data.audit_name,
        data.audit_date,
        data.findings,
        data.severity,
        data.developer_remarks,
        data.verification_status,
        updated_by,
        now
      ]
    );

    // ✅ Perform the actual update
    const result = await conn.query(
      `UPDATE audit_findings
       SET findings = ?, severity = ?, verification_status = ?, developer_remarks = ?, 
           updated_by = ?, updated_date = NOW()
       WHERE finding_id = ?`,
      [findings, severity, verification_status, developer_remarks, updated_by, id]
    );

    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Audit log not found' });
    }

    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    if (conn) await conn.rollback();
    res.status(500).json({ error: 'Update failed' });
  } finally {
    if (conn) conn.release();
  }
});


//delete audit log
app.delete('/api/audit-logs/:id', async (req, res) => {
  const { id } = req.params;
  const deleted_by = 'admin'; // ✅ Replace with session user if needed
  const now = new Date();

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // ✅ Fetch the record before deletion
    const [data] = await conn.query(
      `SELECT af.*, ar.aapid, ar.audit_name, ar.audit_date 
       FROM audit_findings af 
       LEFT JOIN audit_report ar ON af.audit_report_id = ar.audit_report_id 
       WHERE af.finding_id = ?`,
      [id]
    );

    if (!data) {
      await conn.rollback();
      return res.status(404).json({ error: 'Audit log not found or already deleted' });
    }

    // ✅ Insert the fetched data into delete_audit_findings (Trash)
    await conn.query(
      `INSERT INTO log_audit_findings
        (finding_id, audit_report_id, aapid, audit_name, audit_date, 
         findings, severity, developer_remarks, verification_status, 
         log_type, log_user, log_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'delete', ?, ?)`,
      [
        data.finding_id,
        data.audit_report_id,
        data.aapid,
        data.audit_name,
        data.audit_date,
        data.findings,
        data.severity,
        data.developer_remarks,
        data.verification_status,
        deleted_by,
        now
      ]
    );

    // ✅ Delete from main table
    const result = await conn.query(
      'DELETE FROM audit_findings WHERE finding_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Audit log not found or already deleted' });
    }

    await conn.commit();
    res.json({ success: true, message: 'Audit log deleted and saved to trash bin.' });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error('Error deleting audit log:', err);
    res.status(500).json({ error: 'Delete failed', details: err.message });
  } finally {
    if (conn) conn.release();
  }
});


// Get all domain records
// Get all domain mappings
app.get('/api/domain-report', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM domain_mapping');
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching all domain mappings:", err);
    res.status(500).json({ error: "Server error" });
  }
});



// Get domain by aapid
app.get("/api/domain/:aapid", async (req, res) => {
  const { aapid } = req.params;
  try {
    const rows = await pool.query(
      `SELECT * FROM domain_mapping WHERE aapid = ? ORDER BY created_date DESC`,
      [aapid]
    );
    res.json(rows);
  } catch (err) {
    console.error("Failed to fetch domain by aapid", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST new domain
app.post("/api/domain", async (req, res) => {
  const { aapid, domain_name, other_details, created_by, created_date } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    /* 1️⃣  Insert into the main table */
    const result = await connection.query(
      `INSERT INTO domain_mapping
         (aapid, domain_name, other_details, created_by, created_date)
       VALUES (?, ?, ?, ?, ?)`,
      [aapid, domain_name, other_details || "", created_by, created_date]
    );

    const domain_id = Number(result.insertId);

    /* 2️⃣  Log the insert in log_app_domain */
    await connection.query(
      `INSERT INTO log_app_domain
         (domain_id, aapid, domain_name, other_details,
          log_type, log_user, log_date)
       VALUES (?, ?, ?, ?, 'new', ?, ?)`,
      [
        domain_id,
        aapid,
        domain_name,
        other_details || "",
        created_by,
        created_date
      ]
    );

    await connection.commit();
    res.status(201).json({ message: "Domain inserted successfully", domain_id });
  } catch (err) {
    await connection.rollback();
    console.error("Insert error:", err);
    res.status(500).json({ error: "Insert failed" });
  } finally {
    connection.release();
  }
});



// PUT update domain
app.put("/api/domain/:domain_id", async (req, res) => {
  const { domain_id } = req.params;
  const { domain_name, other_details, updated_by, updated_date } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    /* 1️⃣ Fetch existing domain for logging */
    const rows = await connection.query(
      `SELECT * FROM domain_mapping WHERE domain_id = ?`,
      [domain_id]
    );

    if (!rows.length) {
      await connection.rollback();
      return res.status(404).json({ error: "Domain not found" });
    }

    const existing = rows[0];

    /* 2️⃣ Log the current record in log_app_domain */
    await connection.query(
      `INSERT INTO log_app_domain
         (domain_id, aapid, domain_name, other_details,
          log_type, log_user, log_date)
       VALUES (?, ?, ?, ?, 'edit', ?, ?)`,
      [
        existing.domain_id,
        existing.aapid,
        existing.domain_name,
        existing.other_details,
        updated_by,
        updated_date
      ]
    );

    /* 3️⃣ Update the main table */
    const result = await connection.query(
      `UPDATE domain_mapping
         SET domain_name = ?, other_details = ?, updated_by = ?, updated_date = ?
       WHERE domain_id = ?`,
      [domain_name, other_details, updated_by, updated_date, domain_id]
    );

    await connection.commit();
    res.json({ message: "Domain updated", affected: result.affectedRows });
  } catch (err) {
    await connection.rollback();
    console.error("Update error:", err);
    res.status(500).json({ error: "Update failed" });
  } finally {
    connection.release();
  }
});


// DELETE domain
app.delete("/api/domain/:domain_id", async (req, res) => {
  const { domain_id } = req.params;
  const deleted_by = "admin"; // Replace with session user if needed
  const now = new Date();

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 🔥 Fetch domain details before deleting
    const [domain] = await connection.query(
      `SELECT * FROM domain_mapping WHERE domain_id = ?`,
      [domain_id]
    );

    if (!domain) {
      await connection.rollback();
      return res.status(404).json({ error: "Domain not found" });
    }

    // 🔥 Insert into trash bin (delete_app_domain)
    await connection.query(
      `INSERT INTO log_app_domain 
       (domain_id, aapid, domain_name, other_details, log_type, log_user, log_date)
       VALUES (?, ?, ?, ?, 'delete', ?, ?)`,
      [
        domain.domain_id,
        domain.aapid,
        domain.domain_name,
        domain.other_details,
        deleted_by,
        now,
      ]
    );

    // ✅ Delete from domain_mapping
    const result = await connection.query(
      `DELETE FROM domain_mapping WHERE domain_id = ?`,
      [domain_id]
    );

    await connection.commit();
    res.json({ message: "Domain deleted", affected: result.affectedRows });
  } catch (err) {
    await connection.rollback();
    console.error("Delete error:", err);
    res.status(500).json({ error: "Delete failed" });
  } finally {
    connection.release();
  }
});



// Hosting Server API (Express)

app.get("/api/servers", async (req, res) => {
  try {
    const rows = await pool.query("SELECT * FROM hosting_server ORDER BY created_date DESC");
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching servers:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ POST - Add Server
// ✅ ADD Server
app.post("/api/servers", async (req, res) => {
  const { server_name, server_local_ip, created_by } = req.body;
  const now = new Date();

  if (!server_name || !server_local_ip || !created_by) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const result = await connection.query(
      `INSERT INTO hosting_server 
       (server_name, server_local_ip, created_by, created_date, updated_by, updated_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [server_name, server_local_ip, created_by, now, created_by, now]
    );

    const server_id = result.insertId;

    // ✅ Log in log_app_server
    await connection.query(
      `INSERT INTO log_hosting_server 
        (server_id, server_name, server_local_ip, log_type, log_user, log_date)
        VALUES (?, ?, ?, 'new', ?, ?)`,
      [server_id, server_name, server_local_ip, created_by, now]
    );

    await connection.commit();
    res.status(201).json({ message: "Server added" });
  } catch (err) {
    await connection.rollback();
    console.error("Error adding server:", err);
    res.status(500).json({ error: "Insert failed" });
  } finally {
    connection.release();
  }
});

// ✅ UPDATE Server
app.put("/api/servers/:id", async (req, res) => {
  const { id } = req.params;
  const { server_name, server_local_ip, updated_by } = req.body;
  const now = new Date();

  if (!server_name || !server_local_ip || !updated_by) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `SELECT * FROM hosting_server WHERE server_id = ?`,
      [id]
    );

    if (!rows || rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Server not found" });
    }

    await connection.query(
      `UPDATE hosting_server 
       SET server_name = ?, server_local_ip = ?, updated_by = ?, updated_date = ? 
       WHERE server_id = ?`,
      [server_name, server_local_ip, updated_by, now, id]
    );

    // ✅ Log edit
    await connection.query(
      `INSERT INTO log_hosting_server 
       (server_id, server_name, server_local_ip, log_type, log_user, log_date)
       VALUES (?, ?, ?, 'edit', ?, ?)`,
      [id, server_name, server_local_ip, updated_by, now]
    );

    await connection.commit();
    res.status(200).json({ message: "Server updated" });
  } catch (err) {
    await connection.rollback();
    console.error("Error updating server:", err);
    res.status(500).json({ error: "Update failed" });
  } finally {
    connection.release();
  }
});

// ✅ DELETE Server
app.delete("/api/servers/:id", async (req, res) => {
  const { id } = req.params;
  const deleted_by = "admin"; // Later: use session
  const now = new Date();

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 🔍 Fetch hosting server details before deleting
    const rows= await connection.query(
      `SELECT * FROM hosting_server WHERE server_id = ?`,
      [id]
    );

    const server = rows[0];

    if (!server) {
      await connection.rollback();
      return res.status(404).json({ error: "Server not found" });
    }

    // 🗑️ Insert into log_hosting_server (Trash Bin)
    await connection.query(
      `INSERT INTO log_hosting_server 
       (server_id, server_name, server_local_ip, log_type, log_user, log_date)
       VALUES (?, ?, ?, 'delete', ?, ?)`,
      [
        server.server_id,
        server.server_name,
        server.server_local_ip,
        deleted_by,
        now,
      ]
    );

    // 🔥 Delete from hosting_server table
    await connection.query(`DELETE FROM hosting_server WHERE server_id = ?`, [id]);

    await connection.commit();
    res.json({ message: "Hosting Server deleted and moved to Trash Bin." });

  } catch (err) {
    await connection.rollback();
    console.error("❌ Delete error:", err);

    // ✔️ Handle foreign key constraint error
    if (
      err.code === "ER_ROW_IS_REFERENCED_2" ||
      err.sqlState === "23000" ||
      err.errno === 1451
    ) {
      return res.status(400).json({
        error:
          "Cannot delete. This server is referenced in Application Master. Please remove or update it there first.",
      });
    }

    res.status(500).json({ error: "Delete failed due to server error." });
  } finally {
    connection.release();
  }
});




//app server
//  Get all servers for a specific application (by aapid)
app.get('/api/hosting-server/app/:aapid', async (req, res) => {
  const { aapid } = req.params;
  const query = `
    SELECT 
      hs.server_id,
      hs.server_name,
      hs.server_local_ip,
      aps.app_server_id,
      aps.type_id,
      aps.created_by,
      aps.created_date,
      aps.updated_by,
      aps.updated_date,
      aps.aapid,
      stm.type_name AS server_type_name,
      am.app_name                      -- ✅ fetch application name
    FROM app_server aps
    JOIN hosting_server hs ON aps.server_id = hs.server_id
    JOIN server_type_master stm ON aps.type_id = stm.type_id
    JOIN application_master am ON aps.aapid = am.aapid -- ✅ join to get app name
    WHERE aps.aapid = ?
    ORDER BY aps.app_server_id ASC
  `;

  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(query, [aapid]);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching hosting server data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (conn) conn.release();
  }
});


// Get all hosting servers (for dropdowns)
app.get('/api/hosting-server-list', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection(); // 🔄 Changed from db to pool
    const rows= await conn.query(`
      SELECT server_id, server_name, server_local_ip
      FROM hosting_server
      ORDER BY server_id ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error('❌ Error fetching hosting server list:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (conn) conn.release();
  }
});


//  Get all server types (web/api/db/etc.)
app.get('/api/server-types', async (req, res) => {
  try {
    const result = await pool.query(`SELECT type_id, type_name FROM server_type_master ORDER BY type_name`);
    res.status(200).json(result);
  } catch (err) {
    console.error("Fetch server types error:", err);
    res.status(500).json({ error: "Failed to fetch server types" });
  }
});

//fetch appname with id
app.get('/api/app-name/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const rows = await pool.query(
      "SELECT app_name FROM application_master WHERE aapid = ?", [id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json(rows[0]); // ✅ Correct response: { app_name: "HR Portal" }
  } catch (err) {
    console.error("Error fetching app name:", err);
    res.status(500).json({ error: "Failed to fetch application name" });
  }
});



//  Add a new hosting server (only to hosting_server table)
// ✅ Insert to app_server + log to log_app_server
app.post('/api/app-server', async (req, res) => {
  const { aapid, server_id, type_id, created_by } = req.body;
  const created_date = new Date();

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const result = await connection.query(
      `INSERT INTO app_server (aapid, server_id, type_id, created_by, created_date, updated_by, updated_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [aapid, server_id, type_id, created_by, created_date, created_by, created_date]
    );

    const app_server_id = Number(result.insertId);

    // 🔍 Fetch related server details for logging
    const [serverDetails] = await connection.query(
      `SELECT server_name, server_local_ip FROM hosting_server WHERE server_id = ?`,
      [server_id]
    );

    if (serverDetails) {
      await connection.query(
        `INSERT INTO log_app_server (server_id, server_name, server_local_ip, log_type, log_user, log_date)
         VALUES (?, ?, ?, 'new', ?, ?)`,
        [
          server_id,
          serverDetails.server_name,
          serverDetails.server_local_ip,
          created_by,
          created_date,
        ]
      );
    }

    await connection.commit();
    res.status(201).json({ message: "App server added", app_server_id });
  } catch (err) {
    await connection.rollback();
    console.error("Insert error:", err);
    res.status(500).json({ error: "Insert failed" });
  } finally {
    connection.release();
  }
});

// ✅ Update type_id in app_server + log to log_app_server
app.put('/api/app-server/:app_server_id', async (req, res) => {
  const { app_server_id } = req.params;
  const { type_id, updated_by } = req.body;
  const updated_date = new Date();

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 🔍 Get server_id to fetch details for logging
    const [row] = await connection.query(
      `SELECT server_id FROM app_server WHERE app_server_id = ?`,
      [app_server_id]
    );

    if (!row) {
      await connection.rollback();
      return res.status(404).json({ error: "App server not found" });
    }

    const server_id = row.server_id;
    const [serverDetails] = await connection.query(
      `SELECT server_name, server_local_ip FROM hosting_server WHERE server_id = ?`,
      [server_id]
    );

    await connection.query(
      `UPDATE app_server 
       SET type_id = ?, updated_by = ?, updated_date = ? 
       WHERE app_server_id = ?`,
      [type_id, updated_by, updated_date, app_server_id]
    );

    if (serverDetails) {
      await connection.query(
        `INSERT INTO log_app_server (server_id, server_name, server_local_ip, log_type, log_user, log_date)
         VALUES (?, ?, ?, 'edit', ?, ?)`,
        [
          server_id,
          serverDetails.server_name,
          serverDetails.server_local_ip,
          updated_by,
          updated_date,
        ]
      );
    }

    await connection.commit();
    res.status(200).json({ message: "App server updated" });
  } catch (err) {
    await connection.rollback();
    console.error("Update failed:", err.message);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.release();
  }
});

// ✅ Delete from app_server + log to log_app_server
app.delete("/api/app-server/:app_server_id", async (req, res) => {
  const { app_server_id } = req.params;
  const deleted_by = "admin";
  const now = new Date();

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [row] = await connection.query(
      `SELECT server_id FROM app_server WHERE app_server_id = ?`,
      [app_server_id]
    );

    if (!row) {
      await connection.rollback();
      return res.status(404).json({ error: "App server not found" });
    }

    const server_id = row.server_id;

    const [server] = await connection.query(
      `SELECT * FROM hosting_server WHERE server_id = ?`,
      [server_id]
    );

    await connection.query(`DELETE FROM app_server WHERE app_server_id = ?`, [app_server_id]);

    if (server) {
      await connection.query(
        `INSERT INTO log_app_server (server_id, server_name, server_local_ip, log_type, log_user, log_date)
         VALUES (?, ?, ?, 'delete', ?, ?)`,
        [server_id, server.server_name, server.server_local_ip, deleted_by, now]
      );
    }

    await connection.commit();
    res.json({ message: "App server deleted and logged" });
  } catch (err) {
    await connection.rollback();
    console.error("❌ Error deleting app server:", err);

    if (err.code === "ER_ROW_IS_REFERENCED_2" || err.sqlState === "23000") {
      return res.status(400).json({
        error: "Cannot delete. Server is referenced elsewhere.",
      });
    }

    res.status(500).json({ error: "Delete failed." });
  } finally {
    connection.release();
  }
});

//  Delete app_server mapping (optional if needed)
app.delete('/api/app-server/:app_server_id', async (req, res) => {
  const { app_server_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM app_server WHERE app_server_id = ?`,
      [app_server_id]
    );
    res.json({ message: "App server mapping deleted", affected: result.affectedRows });
  } catch (err) {
    console.error("Mapping delete error:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

//Fetch all roles
//  Correct way to return array of roles
// Final working /api/all-roles route
//  Fetch all roles
app.get("/api/all-roles", async (req, res) => {
  try {
    const rows = await pool.query("SELECT role_id, role_name FROM owner_role_master");
    console.log(" Roles fetched (array expected):", Array.isArray(rows), rows);
    res.status(200).json(rows);
  } catch (err) {
    console.error(" Error fetching roles:", err);
    res.status(500).json({ error: "Failed to fetch roles" });
  }
});

//  Fetch all owners with role names (Owner Master Page)
//  Add this to your index.js

//  Fetch owners assigned to an application
app.get("/api/app-owners/:appId", async (req, res) => {
  const { appId } = req.params;
  try {
    const rows = await pool.query(`
      SELECT 
        ao.app_owner_id,
        ao.application_id,
        ao.owner_id,
        om.name AS owner_name,
        ao.role_id,
        orm.role_name,
        ao.created_by,
        ao.updated_by,
        ao.created_date,
        ao.updated_date
      FROM application_owner ao
      LEFT JOIN owner_master om ON ao.owner_id = om.owner_id
      LEFT JOIN owner_role_master orm ON ao.role_id = orm.role_id
      WHERE ao.application_id = ?
    `, [appId]);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching app owners:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

//  Add owner to application
// ADD  ────────────────────────────────────────────────────────────
app.post("/api/app-owners", async (req, res) => {
  const {
    application_id,
    owner_id,
    role_id,
    created_by = "admin", 
     updated_by = "admin",            // default user
  } = req.body;

  const now = new Date();            // server‑side timestamp
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    /* 1️⃣  Insert the new row */
    const insertResult= await connection.query(
      `INSERT INTO application_owner
         (application_id, owner_id, role_id,
          created_by, created_date,
          updated_by, updated_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        application_id,
        owner_id,
        role_id,
        created_by,
        now,
        updated_by,   // first “updated_by”
        now,          // first “updated_date”
      ]
    );

    /* 2️⃣  Lookup the owner’s display name */
   /* 3️⃣ Fetch owner’s display name for the log */
const nameRows = await connection.query(
  `SELECT name FROM owner_master WHERE owner_id = ?`,
  [owner_id]
);
const ownerName = nameRows.length ? nameRows[0].name : null;

/* 4️⃣ Insert an audit‑trail record */
await connection.query(
  `INSERT INTO log_app_owner
     (owner_id, name, role_id, log_type, log_user, log_date)
   VALUES (?, ?, ?, 'new', ?, ?)`,
  [owner_id, ownerName, role_id, updated_by, now]
);


    await connection.commit();

    res.status(201).json({
      message: "App Owner added and logged.",
      app_owner_id: insertResult.insertId.toString(), // safest

    });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Error adding app owner:", err);
    res.status(500).json({ error: "Failed to add app owner" });
  } finally {
    if (connection) connection.release();
  }
});




//  Update owner assignment
app.put("/api/app-owners/:id", async (req, res) => {
  const { id } = req.params;
  const {
    application_id,
    owner_id,
    role_id,
    updated_by = "admin",
    updated_date,
  } = req.body;

  const now = updated_date ? new Date(updated_date) : new Date();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1️⃣ Check if app_owner exists
    const current = await connection.query(
      `SELECT * FROM application_owner WHERE app_owner_id = ?`,
      [id]
    );
    if (!current.length) {
      await connection.rollback();
      return res.status(404).json({ error: "App Owner not found" });
    }

    // 2️⃣ Update app_owner
    await connection.query(
      `UPDATE application_owner
         SET application_id = ?,
             owner_id = ?,
             role_id = ?,
             updated_by = ?,
             updated_date = ?
       WHERE app_owner_id = ?`,
      [application_id, owner_id, role_id, updated_by, now, id]
    );

    // 3️⃣ Fetch owner name properly
    const nameRows = await connection.query(
      `SELECT name FROM owner_master WHERE owner_id = ?`,
      [owner_id]
    );
    const ownerName = nameRows.length ? nameRows[0].name : null;

    // 4️⃣ Log the edit
    await connection.query(
      `INSERT INTO log_app_owner
         (owner_id, name, role_id, log_type, log_user, log_date)
       VALUES (?, ?, ?, 'edit', ?, ?)`,
      [owner_id, ownerName, role_id, updated_by, now]
    );

    await connection.commit();
    res.status(200).json({ message: "App Owner updated and logged." });
  } catch (err) {
    await connection.rollback();
    console.error("Error updating app owner:", err);
    res.status(500).json({ error: "Failed to update app owner" });
  } finally {
    connection.release();
  }
});


// Delete owner assignment
app.delete("/api/app-owners/:id", async (req, res) => {
  const { id } = req.params;
  const deleted_by = "admin"; 
  const now = new Date();

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // ✅ Fetch the owner data from application_owner
    const [ownerData] = await connection.query(
      `SELECT * FROM application_owner WHERE app_owner_id = ?`,
      [id]
    );

    if (!ownerData) {
      await connection.rollback();
      return res.status(404).json({ error: "App Owner not found" });
    }

    // ✅ Fetch the owner name from owner_master
    const [ownerNameData] = await connection.query(
      `SELECT name FROM owner_master WHERE owner_id = ?`,
      [ownerData.owner_id]
    );

    const ownerName = ownerNameData ? ownerNameData.name : null;

    // ✅ Insert into delete_app_owner trash bin
    await connection.query(
      `INSERT INTO log_app_owner 
        (owner_id, name, role_id, log_type, log_user, log_date) 
       VALUES (?, ?, ?, 'delete', ?, ?)`,
      [
        ownerData.owner_id,
        ownerName,
        ownerData.role_id,
        deleted_by,
        now,
      ]
    );

    // ✅ Delete from application_owner
    await connection.query(
      `DELETE FROM application_owner WHERE app_owner_id = ?`,
      [id]
    );

    await connection.commit();
    res.json({ message: "App Owner deleted and added to trash bin." });
  } catch (err) {
    await connection.rollback();
    console.error("Error deleting app owner:", err);
    res.status(500).json({ error: "Delete failed" });
  } finally {
    connection.release();
  }
});



// Get all companies
// Get all companies
app.get("/api/all-companies", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT company_id, company_name, group_name FROM company');
    res.json(rows);
  } catch (err) {
    console.error("Error fetching companies:", err);
    res.status(500).json({ error: "Failed to fetch companies" });
  } finally {
    if (conn) conn.release();
  }
});



// Add company
app.post("/api/companies", async (req, res) => {
  const { company_name, group_name, created_by } = req.body;
  const created_date = new Date();

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 🔹 Insert into company table
    const result = await connection.query(
      `INSERT INTO company (company_name, group_name, created_by, created_date)
       VALUES (?, ?, ?, ?)`,
      [company_name, group_name, created_by, created_date]
    );

    const company_id = result.insertId;

    //  Log insert action into log_app_company
    await connection.query(
      `INSERT INTO log_app_company 
       (company_id, company_name,group_name,log_type, log_user, log_date)
       VALUES (?, ?, ?, 'new', ?, ?)`,
      [
        company_id,
        company_name,
        group_name,
        created_by,
        created_date
      ]
    );

    await connection.commit();
    res.status(201).json({ message: "Company created and logged successfully" });
  } catch (err) {
    await connection.rollback();
    console.error("Insert error:", err);
    res.status(500).json({ error: "Insert failed" });
  } finally {
    connection.release();
  }
});


// Update company
app.put("/api/companies/:id", async (req, res) => {
  const { id } = req.params;
  const { company_name, group_name, updated_by } = req.body;
  const updated_date = new Date();

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 🔍 Fetch existing company data
    const [company] = await connection.query(
      `SELECT * FROM company WHERE company_id = ?`,
      [id]
    );

    if (!company) {
      await connection.rollback();
      return res.status(404).json({ error: "Company not found" });
    }

    //  Insert into log_app_company for update tracking
    await connection.query(
      `INSERT INTO log_app_company
        (company_id, company_name, group_name, log_type, log_user, log_date)
       VALUES (?, ?, ?, 'edit', ?, ?)`,
      [
        company.company_id,
        company.company_name,
        company.group_name,
        updated_by,
        updated_date
      ]
    );

    // 🔧 Perform the update
    const result = await connection.query(
      `UPDATE company
       SET company_name = ?, group_name = ?, updated_by = ?, updated_date = ?
       WHERE company_id = ?`,
      [company_name, group_name, updated_by, updated_date, id]
    );

    await connection.commit();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Company not found" });
    }

    res.json({ message: "Company updated and logged successfully" });
  } catch (err) {
    await connection.rollback();
    console.error("Update error:", err);
    res.status(500).json({ error: "Update failed due to server error." });
  } finally {
    connection.release();
  }
});


// Delete company
app.delete("/api/companies/:id", async (req, res) => {
  const { id } = req.params;
  const deleted_by = "admin"; // Change to session user if needed
  const now = new Date();

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 🔍 Fetch company details before deleting
    const [company] = await connection.query(
      `SELECT * FROM company WHERE company_id = ?`,
      [id]
    );

    if (!company) {
      await connection.rollback();
      return res.status(404).json({ error: "Company not found" });
    }

    //  Insert into delete_app_company (Trash Bin)
   await connection.query(
  `INSERT INTO log_app_company 
   (company_id, company_name, group_name, log_type, log_user, log_date)
   VALUES (?, ?, ?, 'delete', ?, ?)`,
  [
    company.company_id,
    company.company_name,
    company.group_name,  // ✅ Added this missing value
    deleted_by,
    now,
  ]
);

    //  Delete from company table
    await connection.query(`DELETE FROM company WHERE company_id = ?`, [id]);

    await connection.commit();
    res.json({ message: "Company deleted and moved to Trash Bin." });
  } catch (err) {
    await connection.rollback();
    console.error("Delete error:", err);

    // ✔️ Handle foreign key constraint error
    if (
      err.code === "ER_ROW_IS_REFERENCED_2" ||
      err.sqlState === "23000" ||
      err.errno === 1451
    ) {
      return res.status(400).json({
        error:
          "Cannot delete. This company is referenced in Application Master. Please remove or update it there first.",
      });
    }

    res.status(500).json({ error: "Delete failed due to server error." });
  } finally {
    connection.release();
  }
});


// Get SSL certificates for an application
app.get("/api/ssl-certificates/:id", async (req, res) => {
  try {
    const rows = await pool.query("SELECT * FROM ssl_certificates WHERE aapid = ?", [req.params.id]);
    res.json(rows); // ✅ rows is now a pure array
  } catch (err) {
    console.error("Fetch SSL error:", err);
    res.status(500).json({ error: "Failed to fetch SSL certificates" });
  }
});


// Add new SSL certificate
app.post("/api/ssl-certificates", async (req, res) => {
  const { aapid, certificate_name, expiry_date, created_by, created_date } = req.body;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // ✅ Insert into main ssl_certificates table
    const result = await connection.query(
      `INSERT INTO ssl_certificates 
         (aapid, certificate_name, expiry_date, created_by, created_date)
       VALUES (?, ?, ?, ?, ?)`,
      [aapid, certificate_name, expiry_date, created_by, created_date]
    );

    const cert_id = result.insertId; // get auto-generated ID

    //  Log the insertion into log_app_ssl with log_type 'new'
    await connection.query(
      `INSERT INTO log_app_ssl 
         (cert_id, aapid, certificate_name, expiry_date, log_type, log_user, log_date)
       VALUES (?, ?, ?, ?, 'new', ?, ?)`,
      [
        cert_id,
        aapid,
        certificate_name,
        expiry_date,
        created_by,
        created_date
      ]
    );

    await connection.commit();
    res.status(201).json({ message: "SSL Certificate added" });
  } catch (err) {
    await connection.rollback();
    console.error("Insert error:", err);
    res.status(500).json({ error: "Insert failed" });
  } finally {
    connection.release();
  }
});


// Update SSL certificate
app.put("/api/ssl-certificates/:id", async (req, res) => {
  const { certificate_name, expiry_date, updated_by, updated_date } = req.body;
  const { id } = req.params;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const rows = await connection.query(
      "SELECT * FROM ssl_certificates WHERE cert_id = ?",
      [id]
    );

    if (!rows.length) {
      await connection.rollback();
      return res.status(404).json({ error: "SSL Certificate not found" });
    }

    const existing = rows[0];

    await connection.query(
      "UPDATE ssl_certificates SET certificate_name = ?, expiry_date = ?, updated_by = ?, updated_date = ? WHERE cert_id = ?",
      [certificate_name, expiry_date, updated_by, updated_date, id]
    );

    await connection.query(
      `INSERT INTO log_app_ssl
         (cert_id, aapid, certificate_name, expiry_date, log_type, log_user, log_date)
       VALUES (?, ?, ?, ?, 'edit', ?, ?)`,
      [id, existing.aapid, certificate_name, expiry_date, updated_by, updated_date]
    );

    await connection.commit();
    res.json({ message: "SSL Certificate updated" });
  } catch (err) {
    await connection.rollback();
    console.error("Update error:", err);
    res.status(500).json({ error: "Update failed" });
  } finally {
    connection.release();
  }
});


// Delete SSL certificate
app.delete("/api/ssl-certificates/:id", async (req, res) => {
  const { id } = req.params;
  const deleted_by = "admin"; //  Replace this with session user if needed
  const now = new Date();

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    //  Fetch the SSL record before deleting
    const [ssl] = await connection.query(
      "SELECT * FROM ssl_certificates WHERE cert_id = ?",
      [id]
    );

    if (!ssl) {
      await connection.rollback();
      return res.status(404).json({ error: "SSL Certificate not found" });
    }

    //  Insert into delete_app_ssl (trash bin)
    await connection.query(
      `INSERT INTO log_app_ssl 
       (cert_id, aapid, certificate_name, expiry_date, log_type, log_user, log_date)
       VALUES (?, ?, ?, ?, 'delete', ?, ?)`,
      [
        ssl.cert_id,
        ssl.aapid,
        ssl.certificate_name,
        ssl.expiry_date,
        deleted_by,
        now,
      ]
    );

    // ✅ Delete from main table
    await connection.query("DELETE FROM ssl_certificates WHERE cert_id = ?", [id]);

    await connection.commit();
    res.json({ message: "SSL Certificate deleted" });
  } catch (err) {
    await connection.rollback();
    console.error("Delete error:", err);
    res.status(500).json({ error: "Delete failed" });
  } finally {
    connection.release();
  }
});


// Get versions for a specific application
// Get versions for a specific application
app.get("/api/app-versions/:id", async (req, res) => {
  try {
    const rows = await pool.query(`
      SELECT v.*, r.release_type_name
      FROM app_version v
      JOIN release_type_master r ON v.release_type_id = r.release_type_id
      WHERE v.aapid = ?
      ORDER BY v.version_date DESC
    `, [req.params.id]);

    res.json(rows);
  } catch (err) {
    console.error("Fetch versions error:", err);
    res.status(500).json({ error: "Failed to fetch versions" });
  }
});



// Add new version
app.post("/api/app-versions", async (req, res) => {
  const { aapid, version_date, release_type_id, changes, created_by, created_date } = req.body;

  const now       = new Date();          // for log_app_version
  const log_user  = created_by || "system";

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    /* 1️⃣ Insert into the main table */
    const insertSql = `
      INSERT INTO app_version
        (aapid, version_date, release_type_id, changes, created_by, created_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await conn.query(insertSql, [
      aapid, version_date, release_type_id, changes, created_by, created_date
    ]);

    const version_entry_id = Number(result.insertId);

    /* 2️⃣ Archive the same data in log_app_version */
    const logSql = `
      INSERT INTO log_app_version
        (version_entry_id, aapid, version_date, release_type_id, changes,
         log_type, log_user, log_date)
      VALUES (?, ?, ?, ?, ?, 'new', ?, ?)
    `;
    await conn.query(logSql, [
      version_entry_id,
      aapid,
      version_date,
      release_type_id,
      changes,
      log_user,
      now
    ]);

    await conn.commit();
    res.status(201).json({ message: "Version added", version_entry_id });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("Insert version error:", err);
    res.status(500).json({ error: "Insert failed" });
  } finally {
    if (conn) conn.release();
  }
});


// Update version
app.put("/api/app-versions/:id", async (req, res) => {
  const { id } = req.params;
  const { version_date, release_type_id, changes } = req.body;

  // ➜ use session user if you have one
  const updated_by = "admin";
  const now        = new Date();

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    /* 1️⃣ Fetch the current record so we can log it */
    const [version] = await conn.query(
      `SELECT * FROM app_version WHERE version_entry_id = ?`,
      [id]
    );

    if (!version) {
      await conn.rollback();
      return res.status(404).json({ error: "Version entry not found" });
    }

    /* 2️⃣ Archive the existing row in log_app_version */
    await conn.query(
      `INSERT INTO log_app_version
        (version_entry_id, aapid, version_date, release_type_id, changes,
         log_type, log_user, log_date)
       VALUES (?, ?, ?, ?, ?, 'edit', ?, ?)`,
      [
        version.version_entry_id,
        version.aapid,
        version.version_date,
        version.release_type_id,
        version.changes,
        updated_by,
        now
      ]
    );

    /* 3️⃣ Apply the update to the main table */
    await conn.query(
      `UPDATE app_version
         SET version_date   = ?,
             release_type_id = ?,
             changes        = ?,
             updated_by     = ?,
             updated_date   = ?
       WHERE version_entry_id = ?`,
      [version_date, release_type_id, changes, updated_by, now, id]
    );

    await conn.commit();
    res.json({ message: "Version updated" });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("Update version error:", err);
    res.status(500).json({ error: "Update failed" });
  } finally {
    if (conn) conn.release();
  }
});

// Delete version
app.delete("/api/app-versions/:id", async (req, res) => {
  const { id } = req.params;
  const deleted_by = "admin"; //  Replace with session user if needed
  const now = new Date();

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    //  Fetch version details before deleting
    const [version] = await connection.query(
      `SELECT * FROM app_version WHERE version_entry_id = ?`,
      [id]
    );

    if (!version) {
      await connection.rollback();
      return res.status(404).json({ error: "Version not found" });
    }

    //  Log the delete into delete_app_version
    await connection.query(
      `INSERT INTO log_app_version 
       (version_entry_id, aapid, version_date, release_type_id, changes, log_type, log_user, log_date)
       VALUES (?, ?, ?, ?, ?, 'delete', ?, ?)`,
      [
        version.version_entry_id,
        version.aapid,
        version.version_date,
        version.release_type_id,
        version.changes,
        deleted_by,
        now,
      ]
    );

    // ✅ Delete from main table
    await connection.query(
      `DELETE FROM app_version WHERE version_entry_id = ?`,
      [id]
    );

    await connection.commit();
    res.status(200).json({ message: "Version deleted" });
  } catch (err) {
    await connection.rollback();
    console.error("Error deleting version:", err);
    res.status(500).json({ error: "Delete failed" });
  } finally {
    connection.release();
  }
});

// Get release types
app.get("/api/release-types", async (req, res) => {
  try {
    const rows = await pool.query("SELECT * FROM release_type_master");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch release types" });
  }
});
// ✅ Get all owners
// GET /api/owners-master  – returns just owner_id and name
app.get("/api/owners-master", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();

    // No role join – only pull the two columns you need
    const rows = await conn.query(
      `SELECT owner_id, name 
       FROM owner_master 
       ORDER BY owner_id`
    );

    res.json(rows);               // 👉 [{ owner_id: 1, name: "Alice" }, …]
  } catch (err) {
    console.error("Error fetching owners:", err);
    res.status(500).json({ error: "Server error" });
  } finally {
    if (conn) conn.release();
  }
});


// ✅ Add owner
app.post("/api/owners-master", async (req, res) => {
  const { name, created_by = "system" } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Owner name is required" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1️⃣ Insert into owner_master
    const result = await conn.query(
      `INSERT INTO owner_master 
         (name, created_by, created_date, updated_by, updated_date)
       VALUES (?, ?, NOW(), ?, NOW())`,
      [name, created_by, created_by]
    );
    
    const rawId = result.insertId ?? result[0]?.insertId;
    const owner_id = String(rawId); // ✅ Convert BigInt to string

    // 2️⃣ Log the insertion
    await conn.query(
      `INSERT INTO log_owner_master
         (owner_id, name, log_type, log_user, log_date)
       VALUES (?, ?, 'new', ?, NOW())`,
      [owner_id, name, created_by]
    );

    await conn.commit();
    res.status(201).json({ message: "Owner added successfully", owner_id });
  } catch (err) {
    await conn.rollback();
    console.error("Error adding owner:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  } finally {
    conn.release();
  }
});

// ✅ Update owner
// PUT /api/owners-master/:id
app.put("/api/owners-master/:id", async (req, res) => {
  const { id } = req.params;
  const { name, updated_by = "admin" } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Owner name is required" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1️⃣ Check if referenced in application_master
    const appRefRows = await conn.query(
      "SELECT 1 FROM application_master WHERE app_owner_id = ? LIMIT 1",
      [id]
    );
    if (appRefRows.length) {
      await conn.rollback();
      return res.status(400).json({
        error:
          "Cannot update owner. It is referenced in Application Master. Remove or update those applications first.",
      });
    }

    // 2️⃣ Fetch existing owner record
    const ownerRows = await conn.query(
      "SELECT * FROM owner_master WHERE owner_id = ?",
      [id]
    );
    if (!ownerRows.length) {
      await conn.rollback();
      return res.status(404).json({ error: "Owner not found" });
    }

    const existingOwner = ownerRows[0];

    // 3️⃣ Log existing data before update
    await conn.query(
      `INSERT INTO log_owner_master 
         (owner_id, name, log_type, log_user, log_date)
       VALUES (?, ?, 'edit', ?, NOW())`,
      [existingOwner.owner_id, existingOwner.name, updated_by]
    );

    // 4️⃣ Perform update
    const result = await conn.query(
      `UPDATE owner_master 
         SET name = ?, updated_by = ?, updated_date = NOW() 
       WHERE owner_id = ?`,
      [name, updated_by, id]
    );

    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Owner not found" });
    }

    await conn.commit();
    res.json({ message: "Owner updated successfully" });
  } catch (err) {
    await conn.rollback();
    console.error("Error updating owner:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  } finally {
    conn.release();
  }
});


// ✅ Delete owner
app.delete("/api/owners-master/:id", async (req, res) => {
  const { id } = req.params;
  const deleted_by = "admin";
  const now = new Date();

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Check for references in application_master
    const [appCheck] = await connection.query(
      `SELECT * FROM application_master WHERE app_owner_id = ?`,
      [id]
    );

    if (appCheck) {
      await connection.rollback();
      return res.status(400).json({
        error:
          "Cannot delete owner. It is referenced in Application Master. Please delete or update the related applications first.",
      });
    }

    // Fetch owner data before delete
    const [owner] = await connection.query(
      `SELECT * FROM owner_master WHERE owner_id = ?`,
      [id]
    );

    if (!owner) {
      await connection.rollback();
      return res.status(404).json({ error: "Owner not found." });
    }

    // Insert into delete_owner_master (Trash)
    await connection.query(
      `INSERT INTO log_owner_master 
      (owner_id, name,  log_type, log_user, log_date) 
      VALUES (?, ?,  'delete', ?, ?)`,
      [owner.owner_id, owner.name,  deleted_by, now]
    );

    // Perform delete
    await connection.query(
      `DELETE FROM owner_master WHERE owner_id = ?`,
      [id]
    );

    await connection.commit();
    res.json({ message: "Owner deleted and moved to Trash Bin." });
  } catch (err) {
    await connection.rollback();
    console.error("Error deleting owner:", err);

    if (
      err.code === "ER_ROW_IS_REFERENCED_2" ||
      err.errno === 1451 ||
      err.sqlState === "23000"
    ) {
      return res.status(400).json({
        error:
          "Cannot delete owner. It is referenced in another table. Remove or update the reference first.",
      });
    }

    res.status(500).json({ error: "Server error during delete." });
  } finally {
    connection.release();
  }
});


// Serve frontend
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
app._router.stack
  .filter((r) => r.route)
  .forEach((r) => {
    console.log(
      `🛣️  ${Object.keys(r.route.methods)[0].toUpperCase()} ${r.route.path}`
    );
  });