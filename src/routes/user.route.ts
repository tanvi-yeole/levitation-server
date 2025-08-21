import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/users.controller';

const router = Router();

// http://localhost:8000/api/users/register
router.post('/register', registerUser);

// http://localhost:8000/api/users/login
router.post('/login', loginUser);

export default router;
