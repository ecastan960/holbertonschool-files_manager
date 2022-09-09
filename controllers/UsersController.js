import crypto from 'crypto';
import Queue from 'bull';
import dbClient from '../utils/db';

class UsersController {
  static async postNew(request, response) {
    const user = new Queue('userQueue');
    const { email, password } = request.body;
    if (!email) return response.status(400).json({ error: 'Missing email' });
    if (!password) return response.status(400).json({ error: 'Missing password' });

    const checkEmail = await dbClient.users.find({ email }).toArray();
    if (checkEmail.length > 0) return response.status(400).json({ error: 'Already exist' });

    const hashedPassword = crypto.createHash('SHA1').update(password).digest('hex');
    const res = await dbClient.users.insertOne({ email, password: hashedPassword });
    const createdUser = { id: res.ops[0]._id, email: res.ops[0].email };
    await user.add({ userId: createdUser.id });
    return response.status(201).json(createdUser);
  }
}

export default UsersController;
