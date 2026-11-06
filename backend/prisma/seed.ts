import process from 'node:process';
import { PrismaClient, TipoUsuario } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { env } from '../src/config/env.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed do banco de dados a partir do .env...');

  const adminData = {
    nome: env.ADMIN_SEED_NOME,
    telefone: env.ADMIN_SEED_TELEFONE,
    senhaPura: env.ADMIN_SEED_SENHA,
    tipoUsuario: 'admin' as TipoUsuario,
    isAdmin: true,
    isAtivo: true,
  };

  const senhaHash = await bcrypt.hash(adminData.senhaPura, 12);

  const admin = await prisma.user.upsert({
    where: { telefone: adminData.telefone },
    update: {
      nome: adminData.nome,
      senhaHash,
      tipoUsuario: adminData.tipoUsuario,
      isAdmin: adminData.isAdmin,
      isAtivo: adminData.isAtivo,
      deletedAt: null,
    },
    create: {
      nome: adminData.nome,
      telefone: adminData.telefone,
      senhaHash,
      tipoUsuario: adminData.tipoUsuario,
      isAdmin: adminData.isAdmin,
      isAtivo: adminData.isAtivo,
    },
    omit: {
      senhaHash: true,
    },
  });

  console.log('✅ Usuário principal criado/atualizado com sucesso:');
  console.table({
    ID: admin.id,
    Nome: admin.nome,
    Telefone: admin.telefone,
    'Tipo Usuário': admin.tipoUsuario,
    'É Admin?': admin.isAdmin,
    Ativo: admin.isAtivo,
  });
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
