import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local for local testing
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase Env Variables.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log("Starting FilaFácil DB Seed...");

    // 1. Manage Queues
    const queueNames = ['Clínico Geral', 'Pediatria', 'Exames'];

    // First, check existing
    const { data: existingQueues } = await supabase.from('queues').select('*');

    if (!existingQueues || existingQueues.length === 0) {
        console.log("No queues found, creating default ones...");
        await supabase.from('queues').insert(queueNames.map(name => ({ name })));
    }

    const { data: qData } = await supabase.from('queues').select('*');
    if (!qData) {
        console.error("Failed to retrieve queues.");
        process.exit(1);
    }

    const getQueueId = (name: string) => qData.find(q => q.name === name)?.id;

    // 2. Insert Sample Tickets
    const msInMin = 60000;
    const now = new Date();

    const tickets = [
        { queue_id: getQueueId('Clínico Geral'), ticket_number: 'CG-001', status: 'waiting', created_at: new Date(now.getTime() - 15 * msInMin).toISOString() },
        { queue_id: getQueueId('Clínico Geral'), ticket_number: 'CG-002', status: 'waiting', created_at: new Date(now.getTime() - 10 * msInMin).toISOString() },
        { queue_id: getQueueId('Pediatria'), ticket_number: 'PD-001', status: 'waiting', created_at: new Date(now.getTime() - 5 * msInMin).toISOString() },
        { queue_id: getQueueId('Exames'), ticket_number: 'EX-001', status: 'called', created_at: new Date(now.getTime() - 25 * msInMin).toISOString(), called_at: new Date(now.getTime() - 2 * msInMin).toISOString() },
        { queue_id: getQueueId('Clínico Geral'), ticket_number: 'CG-000', status: 'finished', created_at: new Date(now.getTime() - 60 * msInMin).toISOString(), called_at: new Date(now.getTime() - 45 * msInMin).toISOString() },
        { queue_id: getQueueId('Pediatria'), ticket_number: 'PD-000', status: 'finished', created_at: new Date(now.getTime() - 40 * msInMin).toISOString(), called_at: new Date(now.getTime() - 30 * msInMin).toISOString() },
    ];

    console.log("Inserting tickets...");
    for (const t of tickets) {
        if (!t.queue_id) continue;
        const { error: tErr } = await supabase.from('tickets').insert(t);
        if (tErr) {
            console.log(`Skipped ${t.ticket_number} (exists or error: ${tErr.message})`);
        } else {
            console.log(`Inserted: ${t.ticket_number}`);
        }
    }

    console.log("Seeding complete!");
}

seed().catch(err => {
    console.error("Seed error:", err);
    process.exit(1);
});
