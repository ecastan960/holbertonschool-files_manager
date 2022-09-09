import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AuthController {
  static async getConnect(request, response) {
    let authHeader = request.headers.authorization;
    authHeader = authHeader.slice(6);
    const credential = Buffer.from(authHeader, 'base64').toString();
    if (!credential.includes(':')) return null;
    const [email, password] = credential.toString('utf8').split(':');
    const hashedPassword = crypto.createHash('SHA1').update(password).digest('hex');
    if (!email) return response.status(401).json({ error: 'Unauthorized' });
    const user = await dbClient.users.find({ email, password: hashedPassword }).toArray();
    if (!user) return response.status(401).json({ error: 'Unauthorized' });
    const token = uuidv4();
    const key = `auth_${token}`;
    await redisClient.set(key, user._id.toString(), 60 * 60 * 24);
    return response.json({ token });
  }

  static async getDisconnect(request, response) {
    const token = request.headers['x-token'];
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    if (!userId) return response.status(401).json({ error: 'Unauthorized' });
    await redisClient.del(userId);
    return response.status(204).end();
  }
}

export default AuthController;
