import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static getStatus(request, response) {
    const res = { redis: redisClient.isAlive(), db: dbClient.isAlive() };
    return response.status(200).send(res);
  }

  static async getStats(request, response) {
    const res = { users: await dbClient.nbUsers(), files: await dbClient.nbFiles() };
    return response.status(200).send(res);
  }
}

export default AppController;
