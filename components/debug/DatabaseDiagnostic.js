"use client";
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function DatabaseDiagnostic() {
    const [results, setResults] = useState({});
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const runDiagnostics = async () => {
        setLoading(true);
        const diagnostics = {};

        try {
            // 1. Check authentication
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            diagnostics.auth = {
                status: user ? '✅ Authenticated' : '❌ Not authenticated',
                userId: user?.id || 'N/A',
                email: user?.email || 'N/A',
                error: authError?.message || null
            };

            if (!user) {
                setResults(diagnostics);
                setLoading(false);
                return;
            }

            // 2. Check pets table
            const { data: petsData, error: petsError } = await supabase
                .from('pets')
                .select('*')
                .limit(1);

            diagnostics.pets_table = {
                status: petsError ? '❌ Error' : '✅ Accessible',
                error: petsError?.message || null,
                recordCount: petsData?.length || 0
            };

            // 3. Check health_records table
            const { data: healthData, error: healthError } = await supabase
                .from('health_records')
                .select('*')
                .limit(1);

            diagnostics.health_records_table = {
                status: healthError ? '❌ Error' : '✅ Accessible',
                error: healthError?.message || null,
                errorCode: healthError?.code || null,
                recordCount: healthData?.length || 0
            };

            // 4. Check behaviors table
            const { data: behaviorsData, error: behaviorsError } = await supabase
                .from('behaviors')
                .select('*')
                .limit(1);

            diagnostics.behaviors_table = {
                status: behaviorsError ? '❌ Error' : '✅ Accessible',
                error: behaviorsError?.message || null,
                recordCount: behaviorsData?.length || 0
            };

            // 5. Check expenses table
            const { data: expensesData, error: expensesError } = await supabase
                .from('expenses')
                .select('*')
                .limit(1);

            diagnostics.expenses_table = {
                status: expensesError ? '❌ Error' : '✅ Accessible',
                error: expensesError?.message || null,
                recordCount: expensesData?.length || 0
            };

            // 6. Test insert capability (dry run - we'll rollback)
            const testData = {
                user_id: user.id,
                pet_id: petsData?.[0]?.id || 1,
                type: 'Test',
                title: 'Diagnostic Test',
                date: new Date().toISOString().split('T')[0],
                notes: 'This is a test record'
            };

            const { error: insertError } = await supabase
                .from('health_records')
                .insert([testData])
                .select();

            diagnostics.insert_test = {
                status: insertError ? '❌ Failed' : '✅ Success',
                error: insertError?.message || null,
                errorDetails: insertError?.details || null,
                errorHint: insertError?.hint || null,
                errorCode: insertError?.code || null,
                testData: testData
            };

            // If insert succeeded, delete the test record
            if (!insertError) {
                await supabase
                    .from('health_records')
                    .delete()
                    .eq('title', 'Diagnostic Test')
                    .eq('user_id', user.id);
            }

        } catch (error) {
            diagnostics.general_error = {
                status: '❌ Failed',
                message: error.message,
                stack: error.stack
            };
        }

        setResults(diagnostics);
        setLoading(false);
    };

    return (
        <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '2rem' }}>
            <div className="card">
                <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>🔍 Database Diagnostics</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    This tool checks your database connection, tables, and permissions.
                </p>

                <button
                    onClick={runDiagnostics}
                    disabled={loading}
                    className="btn btn-primary"
                    style={{ marginBottom: '2rem' }}
                >
                    {loading ? '🔄 Running Diagnostics...' : '▶️ Run Diagnostics'}
                </button>

                {Object.keys(results).length > 0 && (
                    <div>
                        <h3 style={{ marginBottom: '1rem' }}>Results:</h3>
                        <pre style={{
                            background: '#f5f5f5',
                            padding: '1.5rem',
                            borderRadius: '8px',
                            overflow: 'auto',
                            fontSize: '0.9rem',
                            lineHeight: '1.6',
                            border: '1px solid #ddd'
                        }}>
                            {JSON.stringify(results, null, 2)}
                        </pre>

                        {/* Quick summary */}
                        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fff', borderRadius: '8px', border: '1px solid #ddd' }}>
                            <h4 style={{ marginBottom: '0.5rem' }}>Quick Summary:</h4>
                            <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
                                {Object.entries(results).map(([key, value]) => (
                                    <li key={key}>
                                        <strong>{key}:</strong> {value.status}
                                        {value.error && <span style={{ color: 'red', marginLeft: '0.5rem' }}>- {value.error}</span>}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Action items */}
                        {results.health_records_table?.status?.includes('❌') && (
                            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107' }}>
                                <h4 style={{ color: '#856404', marginBottom: '0.5rem' }}>⚠️ Action Required:</h4>
                                <p style={{ color: '#856404', marginBottom: '0.5rem' }}>
                                    The <code>health_records</code> table appears to have issues.
                                </p>
                                <ol style={{ marginLeft: '1.5rem', color: '#856404', lineHeight: '1.8' }}>
                                    <li>Open your Supabase dashboard</li>
                                    <li>Go to <strong>SQL Editor</strong></li>
                                    <li>Run the SQL from <code>COMPLETE_DATABASE_SCHEMA.sql</code></li>
                                    <li>Refresh this page and run diagnostics again</li>
                                </ol>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
