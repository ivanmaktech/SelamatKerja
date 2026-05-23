import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`SelamatKerja backend listening at http://localhost:${port}`);
    });
}

export default app;
// Trigger restart

// Trigger restart 2

// Restart nodemon
