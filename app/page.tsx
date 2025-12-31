import ChatInterface from '@/components/ChatInterface';
import LeadsBoard from '@/components/LeadsBoard';
import { serializeLead } from '@/lib/helpers/leadhelpers';
import { LeadModel } from '@/lib/models';
import { getDatabase } from '@/lib/mongodb';
import { ILead } from '@/lib/types';


export default async function Home() {

  const leadsFromDb = await LeadModel.findAll();

  const leads = leadsFromDb.map((item)=>   serializeLead(item));
  console.log(leads)
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100  " >
      <h1 className='py-5 px-10 text-cyan-300mber-300 text-3xl' >ლიდები</h1>
      <LeadsBoard leads={leads} />
    
      <ChatInterface />
    </main>
  );
}