import ChatInterface from '@/components/ChatInterface';
import LeadsList from '@/components/LeadsList';
import { getDatabase } from '@/lib/mongodb';
import { Lead } from '@/lib/types';


export default async function Home() {
  const db = await getDatabase()
  const leads: Lead[] = await db.collection<Lead>('leads').find().sort({ timestamp: -1 }).toArray();
  console.log(leads)
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 w-4xl " >
      <h1 className='py-5 px-10 text-cyan-300mber-300 text-3xl' >ლიდები</h1>
      <LeadsList leads={leads} />
    
      <ChatInterface />
    </main>
  );
}