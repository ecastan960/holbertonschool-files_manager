import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AuthController {
  static async getConnect(request, response) {
    let credential = request.header('Authorization');
    if (!credential) {
      response.status(400).json({ error: 'Unauthorized' });
      return {};
    }
    credential = credential.slice(6);
    const string = Buffer.from(credential, 'base64');
    const [email, password] = string.toString('utf8').split(':');
    const user = await dbClient.findUser({ email });

    if (!user) {
      response.status(401).json({ error: 'Unauthorized' });
      return {};
    }
    if (sha1(password) !== user.password) {
      response.status(403).json({ error: 'Invalid credentials' });
      return {};
    }
    const token = uuidv4();
    const key = `auth_${token}`;
    await redisClient.set(key, user._id.toString(), 86400);
    return response.status(200).json({ token });
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
