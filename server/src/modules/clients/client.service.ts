import { prisma } from '../../config/database';
import { NotFoundError } from '../../utils/errors';

export class ClientService {
  async getAll() {
    const clients = await prisma.client.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, email: true, company: true },
    });
    return { clients };
  }

  async getById(id: string) {
    const client = await prisma.client.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, company: true },
    });
    if (!client) throw new NotFoundError('Client not found');
    return client;
  }

  async create(data: { name: string; email: string; company?: string }) {
    const client = await prisma.client.create({
      data,
      select: { id: true, name: true, email: true, company: true },
    });
    return client;
  }

  async update(id: string, data: { name?: string; email?: string; company?: string }) {
    await this.getById(id);
    const client = await prisma.client.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, company: true },
    });
    return client;
  }

  async delete(id: string) {
    await this.getById(id);
    await prisma.client.delete({ where: { id } });
  }
}

export const clientService = new ClientService();