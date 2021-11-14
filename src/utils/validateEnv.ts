import { cleanEnv, port, str } from 'envalid';

const validateEnv = () => {
  cleanEnv(process.env, {
    NODE_ENV: str(),
    PORT: port(),
    AWS_ACCESS_KEY_ID: str(),
    AWS_SECRET_ACCESS_KEY: str(),
    AWS_AMI_ID: str(),
    AWS_REGION: str(),
    AWS_SUBNET_ID: str(),
    DB_HOST: str(),
    DB_DATABASE: str(),
    DB_PORT: str(),
    AWS_SECURITY_GROUP_ID: str(),
  });
};

export default validateEnv;
