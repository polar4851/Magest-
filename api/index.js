import { kv } from '@vercel/kv';

export default async function handler(request, response) {
    try {
        if (request.method === 'GET') {
            const tasks = await kv.get('magesta-tasks');
            return response.status(200).json(tasks || []);
        }

        if (request.method === 'POST') {
            const newTasks = request.body;
            if (!newTasks) {
                return response.status(400).json({ error: 'Nenhuma tarefa enviada para salvar.' });
            }
            await kv.set('magesta-tasks', newTasks);
            return response.status(200).json({ message: 'Tarefas salvas com sucesso.' });
        }

        return response.status(405).json({ message: 'Método não permitido.' });

    } catch (error) {
        console.error('Erro na API:', error);
        return response.status(500).json({ error: 'Falha interna do servidor.' });
    }
}