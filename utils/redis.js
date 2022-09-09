import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.client.on('error', (error) => {
      console.log(`Redis client not connected to the server: ${error.message}`);
    });
  }

  isAlive() { return this.client.connected; }

  async get(key) {
    const getKey = promisify(this.client.get).bind(this.client);
    const keyValue = await getKey(key).catch(console.error);
    return keyValue;
  }

  async set(key, value, duration) {
    const redisValue = promisify(this.client.set).bind(this.client);
    await redisValue(key, value, 'EX', duration).catch(console.error);
  }

  async del(key) {
    const removeValue = promisify(this.client.del).bind(this.client);
    await removeValue(key).catch(console.error);
  }
}

const redisClient = new RedisClient();
export default redisClient;
