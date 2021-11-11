import { cleanEnv, port, str } from 'envalid';

const validateEnv = () => {
  cleanEnv(process.env, {
    NODE_ENV: str(),
    PORT: port(),
    AWS_ACCESS_KEY_ID: str(),
    AWS_SECRET_ACCESS_KEY: str(),
    AWS_SESSION_TOKEN: str(),
    AWS_AMI_URL: str(),
    DB_HOST: str(),
    DB_DATABASE: str(),
    DB_PORT: str()
  });
};

export default validateEnv;
