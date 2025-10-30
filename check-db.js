import { db } from './src/lib/db';

async function checkLeads() {
  try {
    const leads = await db.leadUserData.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('📊 Leads encontrados no banco:');
    console.log('Total:', leads.length);
    
    leads.forEach((lead, index) => {
      console.log(`\n${index + 1}. ${lead.email}`);
      console.log(`   Nome: ${lead.fullName || lead.firstName + ' ' + lead.lastName}`);
      console.log(`   Telefone: ${lead.phone}`);
      console.log(`   Cidade: ${lead.city}, ${lead.state}`);
      console.log(`   Criado: ${lead.createdAt}`);
    });
    
    // Buscar pelo email de teste
    const testLead = await db.leadUserData.findUnique({
      where: { email: 'test10150@validacao.com' }
    });
    
    if (testLead) {
      console.log('\n✅ Lead de teste encontrado!');
      console.log(testLead);
    } else {
      console.log('\n❌ Lead de teste NÃO encontrado');
      console.log('Precisamos criar dados de teste primeiro');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await db.$disconnect();
  }
}

checkLeads();